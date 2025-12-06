from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import PersonalityTrait, UserPersonalityTrait, UserPreferences

User = get_user_model()


class PersonalityTraitSerializer(serializers.ModelSerializer):
    """Serializer for PersonalityTrait model"""
    
    class Meta:
        model = PersonalityTrait
        fields = ['id', 'name', 'icon', 'color', 'description']


class UserPersonalityTraitSerializer(serializers.ModelSerializer):
    """Serializer for user's personality traits with prominence"""
    trait = PersonalityTraitSerializer(source='personality_trait', read_only=True)
    trait_id = serializers.PrimaryKeyRelatedField(
        queryset=PersonalityTrait.objects.all(),
        source='personality_trait',
        write_only=True
    )
    
    class Meta:
        model = UserPersonalityTrait
        fields = ['id', 'trait', 'trait_id', 'prominence_score']


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for user preferences"""
    
    class Meta:
        model = UserPreferences
        fields = [
            'discovery_radius_km', 'age_range_min', 'age_range_max',
            'min_trust_score', 'notify_nearby_activities', 'notify_activity_invites',
            'notify_messages', 'notify_friend_activities', 'show_online_status',
            'allow_friend_requests'
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - basic info"""
    personality_traits_list = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'display_name', 'bio', 'avatar', 'date_of_birth',
            'trust_score', 'total_reviews', 'is_verified',
            'personality_traits_list', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined', 'trust_score', 'total_reviews', 'is_verified']
    
    def get_personality_traits_list(self, obj):
        traits = UserPersonalityTrait.objects.filter(user=obj).select_related('personality_trait')
        return UserPersonalityTraitSerializer(traits, many=True).data


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer with all profile info"""
    personality_traits_list = serializers.SerializerMethodField()
    preferences = UserPreferencesSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'display_name', 'bio', 'avatar', 'date_of_birth', 'phone_number',
            'trust_score', 'total_reviews', 'is_verified', 'is_email_verified',
            'is_phone_verified', 'share_location', 'location_visibility',
            'personality_traits_list', 'preferences', 'date_joined'
        ]
        read_only_fields = [
            'id', 'date_joined', 'trust_score', 'total_reviews',
            'is_verified', 'is_email_verified', 'is_phone_verified'
        ]
    
    def get_personality_traits_list(self, obj):
        traits = UserPersonalityTrait.objects.filter(user=obj).select_related('personality_trait')
        return UserPersonalityTraitSerializer(traits, many=True).data


class UserPublicSerializer(serializers.ModelSerializer):
    """Public user serializer - limited info for other users to see"""
    personality_traits_list = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'display_name', 'bio', 'avatar',
            'trust_score', 'total_reviews', 'is_verified',
            'personality_traits_list'
        ]
    
    def get_personality_traits_list(self, obj):
        traits = UserPersonalityTrait.objects.filter(user=obj).select_related('personality_trait')[:5]
        return UserPersonalityTraitSerializer(traits, many=True).data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name', 'display_name']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Create default preferences
        UserPreferences.objects.create(user=user)
        return user


class NearbyUserSerializer(serializers.Serializer):
    """Serializer for nearby user results"""
    user = UserPublicSerializer()
    distance_km = serializers.FloatField()
    current_activity = serializers.CharField(allow_blank=True)
