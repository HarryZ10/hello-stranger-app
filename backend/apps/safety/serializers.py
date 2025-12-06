from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.users.serializers import UserPublicSerializer

from .models import EmergencyContact, Report, UserReview, Verification

User = get_user_model()


class UserReviewSerializer(serializers.ModelSerializer):
    """Serializer for user reviews"""
    reviewer_detail = UserPublicSerializer(source='reviewer', read_only=True)
    
    class Meta:
        model = UserReview
        fields = [
            'id', 'reviewer', 'reviewer_detail', 'reviewed_user', 'activity',
            'rating', 'safety_rating', 'friendliness_rating', 'reliability_rating',
            'comment', 'created_at'
        ]
        read_only_fields = ['id', 'reviewer', 'created_at']


class CreateReviewSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    
    class Meta:
        model = UserReview
        fields = [
            'reviewed_user', 'activity', 'rating',
            'safety_rating', 'friendliness_rating', 'reliability_rating',
            'comment'
        ]
    
    def validate_reviewed_user(self, value):
        request = self.context.get('request')
        if request and value.id == request.user.id:
            raise serializers.ValidationError("Cannot review yourself")
        return value
    
    def validate(self, data):
        request = self.context.get('request')
        # Check if review already exists for this user/activity combination
        existing = UserReview.objects.filter(
            reviewer=request.user,
            reviewed_user=data['reviewed_user'],
            activity=data.get('activity')
        ).exists()
        if existing:
            raise serializers.ValidationError("You have already reviewed this user for this activity")
        return data
    
    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for reports"""
    
    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reported_user', 'reported_activity',
            'reason', 'description', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'reporter', 'status', 'created_at']


class CreateReportSerializer(serializers.ModelSerializer):
    """Serializer for creating reports"""
    
    class Meta:
        model = Report
        fields = ['reported_user', 'reported_activity', 'reason', 'description']
    
    def validate_reported_user(self, value):
        request = self.context.get('request')
        if request and value.id == request.user.id:
            raise serializers.ValidationError("Cannot report yourself")
        return value
    
    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class VerificationSerializer(serializers.ModelSerializer):
    """Serializer for verification records"""
    
    class Meta:
        model = Verification
        fields = ['id', 'verification_type', 'status', 'created_at', 'verified_at']
        read_only_fields = ['id', 'status', 'created_at', 'verified_at']


class RequestVerificationSerializer(serializers.Serializer):
    """Serializer for requesting verification"""
    verification_type = serializers.ChoiceField(choices=Verification.TypeChoices.choices)


class EmergencyContactSerializer(serializers.ModelSerializer):
    """Serializer for emergency contacts"""
    
    class Meta:
        model = EmergencyContact
        fields = [
            'id', 'name', 'phone_number', 'relationship',
            'notify_on_checkin', 'notify_on_activity_join', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
