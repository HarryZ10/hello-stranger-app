from math import atan2, cos, radians, sin, sqrt

from django.conf import settings
from django.db import models
from django.utils import timezone


class UserLocation(models.Model):
    """Stores user location data for nearby discovery"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='locations'
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    accuracy = models.FloatField(null=True, blank=True, help_text="Accuracy in meters")
    altitude = models.FloatField(null=True, blank=True)
    
    # Status flags
    is_current = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True)
    
    # Activity context
    current_activity = models.CharField(max_length=200, blank=True, help_text="What user is currently doing")
    
    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_locations'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['is_current', 'is_visible']),
            models.Index(fields=['-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user} at ({self.latitude}, {self.longitude})"
    
    def save(self, *args, **kwargs):
        if self.is_current:
            # Set all other locations for this user as not current
            UserLocation.objects.filter(user=self.user, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)
    
    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        """
        Calculate the great circle distance between two points 
        on the earth (specified in decimal degrees).
        Returns distance in kilometers.
        """
        R = 6371  # Radius of Earth in km
        
        lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    @classmethod
    def get_nearby_users(cls, latitude, longitude, radius_km=10, exclude_user=None):
        """
        Get users with current locations within a specified radius.
        Uses Haversine formula for accurate distance calculation.
        For MVP, this uses Python. For production, use PostGIS.
        """
        from apps.users.models import User

        # Get all current, visible locations
        locations = cls.objects.filter(
            is_current=True,
            is_visible=True
        ).select_related('user')
        
        if exclude_user:
            locations = locations.exclude(user=exclude_user)
        
        nearby = []
        for loc in locations:
            distance = cls.haversine_distance(latitude, longitude, loc.latitude, loc.longitude)
            if distance <= radius_km:
                nearby.append({
                    'user': loc.user,
                    'location': loc,
                    'distance_km': round(distance, 2)
                })
        
        # Sort by distance
        nearby.sort(key=lambda x: x['distance_km'])
        return nearby
    
    @classmethod
    def get_nearby_activities(cls, latitude, longitude, radius_km=10):
        """Get activities within a specified radius"""
        from apps.activities.models import Activity
        
        activities = Activity.objects.filter(
            status='active',
            start_time__gte=timezone.now()
        )
        
        nearby = []
        for activity in activities:
            distance = cls.haversine_distance(
                latitude, longitude, 
                activity.latitude, activity.longitude
            )
            if distance <= radius_km:
                nearby.append({
                    'activity': activity,
                    'distance_km': round(distance, 2)
                })
        
        nearby.sort(key=lambda x: x['distance_km'])
        return nearby
