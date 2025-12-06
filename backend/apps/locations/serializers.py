from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import UserLocation

User = get_user_model()


class UserLocationSerializer(serializers.ModelSerializer):
    """Serializer for user location"""
    
    class Meta:
        model = UserLocation
        fields = [
            'id', 'latitude', 'longitude', 'accuracy', 'altitude',
            'is_current', 'is_visible', 'current_activity', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class UpdateLocationSerializer(serializers.ModelSerializer):
    """Serializer for updating user location"""
    
    class Meta:
        model = UserLocation
        fields = ['latitude', 'longitude', 'accuracy', 'altitude', 'current_activity', 'is_visible']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['is_current'] = True
        return super().create(validated_data)
