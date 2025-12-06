from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.locations.models import UserLocation

from .models import PersonalityTrait, UserPersonalityTrait, UserPreferences
from .serializers import (
    NearbyUserSerializer,
    PersonalityTraitSerializer,
    UserDetailSerializer,
    UserPersonalityTraitSerializer,
    UserPreferencesSerializer,
    UserPublicSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """API endpoint for user registration"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    """API endpoint for viewing and updating user profile"""
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserPublicProfileView(generics.RetrieveAPIView):
    """API endpoint for viewing another user's public profile"""
    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class UserListView(generics.ListAPIView):
    """API endpoint for listing users (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    """API endpoint for user preferences"""
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        prefs, _ = UserPreferences.objects.get_or_create(user=self.request.user)
        return prefs


class PersonalityTraitListView(generics.ListAPIView):
    """API endpoint for listing all personality traits"""
    queryset = PersonalityTrait.objects.all()
    serializer_class = PersonalityTraitSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserPersonalityTraitsView(APIView):
    """API endpoint for managing user's personality traits"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        traits = UserPersonalityTrait.objects.filter(user=request.user).select_related('personality_trait')
        serializer = UserPersonalityTraitSerializer(traits, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Add a personality trait to user"""
        serializer = UserPersonalityTraitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, trait_id=None):
        """Remove a personality trait from user"""
        try:
            trait = UserPersonalityTrait.objects.get(user=request.user, personality_trait_id=trait_id)
            trait.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserPersonalityTrait.DoesNotExist:
            return Response({"error": "Trait not found"}, status=status.HTTP_404_NOT_FOUND)


class NearbyUsersView(APIView):
    """API endpoint for finding nearby users"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get user's current location
        user_location = UserLocation.objects.filter(
            user=request.user, 
            is_current=True
        ).first()
        
        if not user_location:
            return Response(
                {"error": "Please update your location first"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get radius from preferences or query param
        radius = request.query_params.get('radius')
        if radius:
            radius = float(radius)
        else:
            prefs = UserPreferences.objects.filter(user=request.user).first()
            radius = prefs.discovery_radius_km if prefs else 10
        
        # Get nearby users
        nearby = UserLocation.get_nearby_users(
            latitude=user_location.latitude,
            longitude=user_location.longitude,
            radius_km=radius,
            exclude_user=request.user
        )
        
        # Format response
        results = []
        for item in nearby:
            results.append({
                'user': UserPublicSerializer(item['user']).data,
                'distance_km': item['distance_km'],
                'current_activity': item['location'].current_activity
            })
        
        return Response(results)
