from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.locations.models import UserLocation

from .models import Activity, ActivityCategory, ActivityComment, ActivityParticipant
from .serializers import (
    ActivityCategorySerializer,
    ActivityCommentSerializer,
    ActivityCreateSerializer,
    ActivityDetailSerializer,
    ActivityListSerializer,
    ActivityParticipantSerializer,
    NearbyActivitySerializer,
)

# from apps.users.models import UserPreferences  # Commented out - model doesn't exist


User = get_user_model()


class ActivityCategoryListView(generics.ListAPIView):
    """List all activity categories"""
    queryset = ActivityCategory.objects.filter(is_active=True)
    serializer_class = ActivityCategorySerializer
    permission_classes = [permissions.AllowAny]


class ActivityListCreateView(generics.ListCreateAPIView):
    """List activities or create a new one"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ActivityCreateSerializer
        return ActivityListSerializer
    
    def get_queryset(self):
        queryset = Activity.objects.filter(
            status__in=['active', 'full'],
            start_time__gte=timezone.now()
        ).select_related('category', 'creator')
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filter by visibility
        visibility = self.request.query_params.get('visibility')
        if visibility:
            queryset = queryset.filter(visibility=visibility)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


class ActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete an activity"""
    queryset = Activity.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ActivityCreateSerializer
        return ActivityDetailSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        activity = self.get_object()
        if activity.creator != request.user:
            return Response(
                {"error": "Only the creator can edit this activity"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        activity = self.get_object()
        if activity.creator != request.user:
            return Response(
                {"error": "Only the creator can delete this activity"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class MyActivitiesView(generics.ListAPIView):
    """List activities created by the current user"""
    serializer_class = ActivityListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Activity.objects.filter(
            creator=self.request.user
        ).select_related('category')


class MyParticipationsView(generics.ListAPIView):
    """List activities the current user is participating in"""
    serializer_class = ActivityListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        participation_ids = ActivityParticipant.objects.filter(
            user=self.request.user,
            status__in=['accepted', 'checked_in']
        ).values_list('activity_id', flat=True)
        
        return Activity.objects.filter(
            id__in=participation_ids
        ).select_related('category', 'creator')


class NearbyActivitiesView(APIView):
    """Get activities near the user's current location"""
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
        
        # Get radius
        radius = request.query_params.get('radius')
        if radius:
            radius = float(radius)
        else:
            # prefs = UserPreferences.objects.filter(user=request.user).first()
            # radius = prefs.discovery_radius_km if prefs else 10
            radius = 10  # Default radius in km
        
        # Get nearby activities
        nearby = UserLocation.get_nearby_activities(
            latitude=user_location.latitude,
            longitude=user_location.longitude,
            radius_km=radius
        )
        
        # Format response
        results = []
        for item in nearby:
            results.append({
                'activity': ActivityListSerializer(item['activity']).data,
                'distance_km': item['distance_km']
            })
        
        return Response(results)


class JoinActivityView(APIView):
    """Join an activity"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, activity_id):
        try:
            activity = Activity.objects.get(id=activity_id)
        except Activity.DoesNotExist:
            return Response(
                {"error": "Activity not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already participating
        existing = ActivityParticipant.objects.filter(
            activity=activity,
            user=request.user
        ).first()
        
        if existing:
            if existing.status in ['accepted', 'checked_in']:
                return Response(
                    {"error": "You are already participating in this activity"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Reactivate previous participation
            existing.status = ActivityParticipant.StatusChoices.REQUESTED
            existing.save()
            return Response(ActivityParticipantSerializer(existing).data)
        
        # Check if activity is full
        if activity.is_full:
            return Response(
                {"error": "This activity is full"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check trust score requirement
        if request.user.trust_score < activity.min_trust_score:
            return Response(
                {"error": f"Minimum trust score of {activity.min_trust_score} required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create participation
        participation_status = ActivityParticipant.StatusChoices.ACCEPTED
        if activity.visibility == 'invite':
            participation_status = ActivityParticipant.StatusChoices.REQUESTED
        
        participant = ActivityParticipant.objects.create(
            activity=activity,
            user=request.user,
            status=participation_status
        )
        
        return Response(
            ActivityParticipantSerializer(participant).data,
            status=status.HTTP_201_CREATED
        )


class LeaveActivityView(APIView):
    """Leave an activity"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, activity_id):
        try:
            participant = ActivityParticipant.objects.get(
                activity_id=activity_id,
                user=request.user
            )
        except ActivityParticipant.DoesNotExist:
            return Response(
                {"error": "You are not participating in this activity"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        participant.status = ActivityParticipant.StatusChoices.LEFT
        participant.save()
        
        return Response({"message": "Successfully left the activity"})


class CheckInActivityView(APIView):
    """Check in to an activity"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, activity_id):
        try:
            participant = ActivityParticipant.objects.get(
                activity_id=activity_id,
                user=request.user,
                status=ActivityParticipant.StatusChoices.ACCEPTED
            )
        except ActivityParticipant.DoesNotExist:
            return Response(
                {"error": "You must be accepted to check in"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        participant.status = ActivityParticipant.StatusChoices.CHECKED_IN
        participant.checked_in_at = timezone.now()
        participant.save()
        
        return Response(ActivityParticipantSerializer(participant).data)


class ActivityCommentsView(generics.ListCreateAPIView):
    """List and create comments on an activity"""
    serializer_class = ActivityCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        activity_id = self.kwargs.get('activity_id')
        return ActivityComment.objects.filter(
            activity_id=activity_id,
            parent__isnull=True
        ).select_related('user')
    
    def perform_create(self, serializer):
        activity_id = self.kwargs.get('activity_id')
        serializer.save(
            user=self.request.user,
            activity_id=activity_id
        )
