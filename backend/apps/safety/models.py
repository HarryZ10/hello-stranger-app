from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class UserReview(models.Model):
    """Reviews and ratings between users"""
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given'
    )
    reviewed_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_received'
    )
    
    # Optional activity context
    activity = models.ForeignKey(
        'activities.Activity',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_reviews'
    )
    
    # Ratings (1-5 scale)
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    safety_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    friendliness_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    reliability_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    
    comment = models.TextField(max_length=1000, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_reviews'
        unique_together = ['reviewer', 'reviewed_user', 'activity']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Review by {self.reviewer} for {self.reviewed_user}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update the reviewed user's trust score
        self.reviewed_user.update_trust_score()


class Report(models.Model):
    """Reports for safety violations"""
    
    class ReasonChoices(models.TextChoices):
        HARASSMENT = 'harassment', 'Harassment'
        INAPPROPRIATE = 'inappropriate', 'Inappropriate Behavior'
        SPAM = 'spam', 'Spam'
        FAKE = 'fake', 'Fake Profile'
        SAFETY = 'safety', 'Safety Concern'
        SCAM = 'scam', 'Scam/Fraud'
        OTHER = 'other', 'Other'
    
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        REVIEWING = 'reviewing', 'Under Review'
        RESOLVED = 'resolved', 'Resolved'
        DISMISSED = 'dismissed', 'Dismissed'
    
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_submitted'
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_against'
    )
    
    # Optional related activity
    reported_activity = models.ForeignKey(
        'activities.Activity',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports'
    )
    
    reason = models.CharField(
        max_length=20,
        choices=ReasonChoices.choices
    )
    description = models.TextField()
    
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING
    )
    
    # Admin response
    admin_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_reports'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report by {self.reporter} against {self.reported_user}"


class Verification(models.Model):
    """User verification records"""
    
    class TypeChoices(models.TextChoices):
        EMAIL = 'email', 'Email Verification'
        PHONE = 'phone', 'Phone Verification'
        ID = 'id', 'ID Verification'
        PHOTO = 'photo', 'Photo Verification'
    
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'
        EXPIRED = 'expired', 'Expired'
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='verifications'
    )
    
    verification_type = models.CharField(
        max_length=20,
        choices=TypeChoices.choices
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING
    )
    
    # Verification data (e.g., code for email/phone)
    verification_code = models.CharField(max_length=20, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'verifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.verification_type} verification for {self.user}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update user verification status
        if self.status == self.StatusChoices.VERIFIED:
            if self.verification_type == self.TypeChoices.EMAIL:
                self.user.is_email_verified = True
            elif self.verification_type == self.TypeChoices.PHONE:
                self.user.is_phone_verified = True
            
            # Set overall verified if email and phone are verified
            if self.user.is_email_verified and self.user.is_phone_verified:
                self.user.is_verified = True
            
            self.user.save()


class EmergencyContact(models.Model):
    """Emergency contacts for safety features"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='emergency_contacts'
    )
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    relationship = models.CharField(max_length=50, blank=True)
    
    # Auto-notification settings
    notify_on_checkin = models.BooleanField(default=False)
    notify_on_activity_join = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'emergency_contacts'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.user})"
