from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from apps.users.serializers import UserPublicSerializer

from .models import Connection, Message

User = get_user_model()


class ConnectionSerializer(serializers.ModelSerializer):
    """Serializer for connections/friendships"""
    from_user_detail = UserPublicSerializer(source='from_user', read_only=True)
    to_user_detail = UserPublicSerializer(source='to_user', read_only=True)
    
    class Meta:
        model = Connection
        fields = [
            'id', 'from_user', 'to_user', 'from_user_detail', 'to_user_detail',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'from_user', 'status', 'created_at', 'updated_at']


class ConnectionRequestSerializer(serializers.Serializer):
    """Serializer for sending connection requests"""
    to_user_id = serializers.IntegerField()
    
    def validate_to_user_id(self, value):
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
        return value
    
    def validate(self, data):
        request = self.context.get('request')
        if request and data['to_user_id'] == request.user.id:
            raise serializers.ValidationError("Cannot send friend request to yourself")
        return data


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    sender_display_name = serializers.CharField(source='sender.display_name', read_only=True)
    sender_avatar = serializers.ImageField(source='sender.avatar', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_display_name', 'sender_avatar',
            'recipient', 'content', 'related_activity',
            'is_read', 'read_at', 'sent_at'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'read_at', 'sent_at']


class SendMessageSerializer(serializers.ModelSerializer):
    """Serializer for sending messages"""
    
    class Meta:
        model = Message
        fields = ['recipient', 'content', 'related_activity']
    
    def validate_recipient(self, value):
        request = self.context.get('request')
        if request and value.id == request.user.id:
            raise serializers.ValidationError("Cannot send message to yourself")
        
        # Check if blocked
        if Connection.is_blocked(request.user, value):
            raise serializers.ValidationError("Cannot send message to this user")
        
        return value
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class ConversationSerializer(serializers.Serializer):
    """Serializer for conversation list"""
    partner = UserPublicSerializer()
    last_message = MessageSerializer()
    unread_count = serializers.IntegerField()


class MarkMessagesReadSerializer(serializers.Serializer):
    """Serializer for marking messages as read"""
    message_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    
    def update_read_status(self, user, partner_id=None):
        """Mark messages as read"""
        queryset = Message.objects.filter(recipient=user, is_read=False)
        
        if partner_id:
            queryset = queryset.filter(sender_id=partner_id)
        
        message_ids = self.validated_data.get('message_ids')
        if message_ids:
            queryset = queryset.filter(id__in=message_ids)
        
        queryset.update(is_read=True, read_at=timezone.now())
