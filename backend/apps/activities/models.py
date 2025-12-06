from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class ActivityCategory(models.Model):
    """Categories for activities like Sports, Food, Entertainment, etc."""
    name = models.CharField(max_length=50, unique=True)
    icon = models.CharField(max_length=50, help_text="Icon name/emoji for the category")
    color = models.CharField(max_length=7, default="#6366f1", help_text="Hex color code")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'activity_categories'
        verbose_name = 'Activity Category'
        verbose_name_plural = 'Activity Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Activity(models.Model):
    """Main activity model for user-created events/activities"""
    
    class VisibilityChoices(models.TextChoices):
        PUBLIC = 'public', 'Public'
        PRIVATE = 'private', 'Private'
        FRIENDS = 'friends', 'Friends Only'
        INVITE = 'invite', 'Invite Only'
    
    class StatusChoices(models.TextChoices):
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        FULL = 'full', 'Full'
    
    # Basic info
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_activities'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        ActivityCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activities'
    )
    
    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_name = models.CharField(max_length=255, blank=True, help_text="Human-readable location name")
    address = models.CharField(max_length=500, blank=True)
    
    # Timing
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Capacity
    max_participants = models.PositiveIntegerField(default=10)
    current_participants_count = models.PositiveIntegerField(default=0)
    
    # Settings
    visibility = models.CharField(
        max_length=20,
        choices=VisibilityChoices.choices,
        default=VisibilityChoices.PUBLIC
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE
    )
    
    # Requirements
    min_age = models.PositiveIntegerField(null=True, blank=True)
    min_trust_score = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    requirements = models.TextField(blank=True, help_text="Additional requirements or notes")
    
    # Media
    cover_image = models.ImageField(upload_to='activities/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'activities'
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['start_time']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.creator}"
    
    @property
    def is_full(self):
        return self.current_participants_count >= self.max_participants
    
    @property
    def spots_left(self):
        return max(0, self.max_participants - self.current_participants_count)
    
    @property
    def is_active(self):
        return self.status == self.StatusChoices.ACTIVE and self.start_time > timezone.now()
    
    def update_participant_count(self):
        """Update the current participant count"""
        count = self.participants.filter(
            status__in=[ActivityParticipant.StatusChoices.ACCEPTED, ActivityParticipant.StatusChoices.CHECKED_IN]
        ).count()
        self.current_participants_count = count
        if count >= self.max_participants:
            self.status = self.StatusChoices.FULL
        elif self.status == self.StatusChoices.FULL:
            self.status = self.StatusChoices.ACTIVE
        self.save(update_fields=['current_participants_count', 'status'])


class ActivityParticipant(models.Model):
    """Through table for activity participants"""
    
    class StatusChoices(models.TextChoices):
        INVITED = 'invited', 'Invited'
        REQUESTED = 'requested', 'Requested to Join'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'
        CHECKED_IN = 'checked_in', 'Checked In'
        LEFT = 'left', 'Left'
    
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activity_participations'
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.REQUESTED
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_activity_invites'
    )
    
    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_out_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'activity_participants'
        unique_together = ['activity', 'user']
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.user} in {self.activity}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.activity.update_participant_count()
    
    def delete(self, *args, **kwargs):
        activity = self.activity
        super().delete(*args, **kwargs)
        activity.update_participant_count()


class ActivityComment(models.Model):
    """Comments on activities"""
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activity_comments'
    )
    content = models.TextField(max_length=1000)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'activity_comments'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user} on {self.activity}"
