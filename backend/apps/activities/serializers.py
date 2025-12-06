from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Activity, ActivityCategory, ActivityComment, ActivityParticipant

User = get_user_model()


class ActivityCategorySerializer(serializers.ModelSerializer):
    """Serializer for ActivityCategory model"""
    
    class Meta:
        model = ActivityCategory
        fields = ['id', 'name', 'icon', 'color', 'description']


class ActivityParticipantSerializer(serializers.ModelSerializer):
    """Serializer for activity participants"""
    user_display_name = serializers.CharField(source='user.display_name', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)
    user_trust_score = serializers.DecimalField(
        source='user.trust_score', max_digits=3, decimal_places=2, read_only=True
    )
    
    class Meta:
        model = ActivityParticipant
        fields = [
            'id', 'user', 'user_display_name', 'user_avatar', 'user_trust_score',
            'status', 'joined_at', 'checked_in_at'
        ]
        read_only_fields = ['id', 'user', 'joined_at']


class ActivityCommentSerializer(serializers.ModelSerializer):
    """Serializer for activity comments"""
    user_display_name = serializers.CharField(source='user.display_name', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityComment
        fields = [
            'id', 'user', 'user_display_name', 'user_avatar',
            'content', 'parent', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return ActivityCommentSerializer(obj.replies.all(), many=True).data
        return []


class ActivityListSerializer(serializers.ModelSerializer):
    """Serializer for activity list view - minimal info"""
    category = ActivityCategorySerializer(read_only=True)
    creator_display_name = serializers.CharField(source='creator.display_name', read_only=True)
    creator_avatar = serializers.ImageField(source='creator.avatar', read_only=True)
    spots_left = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'title', 'category', 'latitude', 'longitude', 'location_name',
            'start_time', 'end_time', 'max_participants', 'current_participants_count',
            'spots_left', 'visibility', 'status', 'cover_image',
            'creator', 'creator_display_name', 'creator_avatar', 'created_at'
        ]


class ActivityDetailSerializer(serializers.ModelSerializer):
    """Detailed activity serializer with all info"""
    category = ActivityCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ActivityCategory.objects.all(),
        source='category',
        write_only=True,
        required=False
    )
    creator_display_name = serializers.CharField(source='creator.display_name', read_only=True)
    creator_avatar = serializers.ImageField(source='creator.avatar', read_only=True)
    creator_trust_score = serializers.DecimalField(
        source='creator.trust_score', max_digits=3, decimal_places=2, read_only=True
    )
    participants = ActivityParticipantSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    spots_left = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    user_participation = serializers.SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = [
            'id', 'title', 'description', 'category', 'category_id',
            'latitude', 'longitude', 'location_name', 'address',
            'start_time', 'end_time', 'max_participants', 'current_participants_count',
            'spots_left', 'is_full', 'visibility', 'status',
            'min_age', 'min_trust_score', 'requirements', 'cover_image',
            'creator', 'creator_display_name', 'creator_avatar', 'creator_trust_score',
            'participants', 'comments', 'user_participation',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'creator', 'current_participants_count', 'created_at', 'updated_at'
        ]
    
    def get_comments(self, obj):
        # Only get top-level comments (no parent)
        comments = obj.comments.filter(parent__isnull=True)[:20]
        return ActivityCommentSerializer(comments, many=True).data
    
    def get_user_participation(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            participation = obj.participants.filter(user=request.user).first()
            if participation:
                return ActivityParticipantSerializer(participation).data
        return None


class ActivityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating activities"""
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ActivityCategory.objects.all(),
        source='category',
        required=False
    )
    
    class Meta:
        model = Activity
        fields = [
            'title', 'description', 'category_id',
            'latitude', 'longitude', 'location_name', 'address',
            'start_time', 'end_time', 'max_participants',
            'visibility', 'min_age', 'min_trust_score', 'requirements',
            'cover_image'
        ]
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class NearbyActivitySerializer(serializers.Serializer):
    """Serializer for nearby activity results"""
    activity = ActivityListSerializer()
    distance_km = serializers.FloatField()
