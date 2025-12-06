from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class PersonalityTrait(models.Model):
    """Personality traits like Friendly, Nerdy, Athletic, etc."""
    name = models.CharField(max_length=50, unique=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon name/emoji")
    color = models.CharField(max_length=7, default="#6366f1", help_text="Hex color code")
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'personality_traits'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Uses email as the primary identifier with social features.
    """
    email = models.EmailField(unique=True)
    
    # Profile fields
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    display_name = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    # Trust & Safety
    trust_score = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    
    # Personality traits (many-to-many)
    personality_traits = models.ManyToManyField(
        PersonalityTrait,
        through='UserPersonalityTrait',
        related_name='users',
        blank=True
    )
    
    # Location sharing preference
    share_location = models.BooleanField(default=True)
    location_visibility = models.CharField(
        max_length=20,
        choices=[
            ('exact', 'Exact Location'),
            ('approximate', 'Approximate (within 1km)'),
            ('hidden', 'Hidden'),
        ],
        default='approximate'
    )
    
    # Timestamps - use date_joined from AbstractUser instead of created_at
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.display_name or self.email
    
    def update_trust_score(self):
        """Recalculate trust score based on reviews"""
        from apps.safety.models import UserReview
        reviews = UserReview.objects.filter(reviewed_user=self)
        if reviews.exists():
            avg_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.trust_score = round(avg_rating, 2)
            self.total_reviews = reviews.count()
            self.save(update_fields=['trust_score', 'total_reviews'])


class UserPersonalityTrait(models.Model):
    """Through table for user personality traits with prominence score"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    personality_trait = models.ForeignKey(PersonalityTrait, on_delete=models.CASCADE)
    prominence_score = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="How prominent this trait is (1-5)"
    )
    
    class Meta:
        db_table = 'user_personality_traits'
        unique_together = ['user', 'personality_trait']
    
    def __str__(self):
        return f"{self.user.email} - {self.personality_trait.name}"


class UserPreferences(models.Model):
    """User preferences for activity discovery"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    
    # Discovery settings
    discovery_radius_km = models.PositiveIntegerField(default=10, help_text="Radius in km")
    age_range_min = models.PositiveIntegerField(default=18)
    age_range_max = models.PositiveIntegerField(default=99)
    min_trust_score = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    
    # Notification settings
    notify_nearby_activities = models.BooleanField(default=True)
    notify_activity_invites = models.BooleanField(default=True)
    notify_messages = models.BooleanField(default=True)
    notify_friend_activities = models.BooleanField(default=True)
    
    # Privacy
    show_online_status = models.BooleanField(default=True)
    allow_friend_requests = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_preferences'
        verbose_name = 'User Preferences'
        verbose_name_plural = 'User Preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.email}"
