from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import PersonalityTrait, User, UserPersonalityTrait, UserPreferences


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    list_display = ['email', 'username', 'display_name', 'trust_score', 'is_verified', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'is_verified', 'date_joined']
    search_fields = ['email', 'username', 'display_name', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'display_name', 'bio', 'avatar', 'date_of_birth', 'phone_number')}),
        ('Trust & Safety', {'fields': ('trust_score', 'total_reviews', 'is_verified', 'is_email_verified', 'is_phone_verified')}),
        ('Location', {'fields': ('share_location', 'location_visibility')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )


@admin.register(PersonalityTrait)
class PersonalityTraitAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color']
    search_fields = ['name']


@admin.register(UserPersonalityTrait)
class UserPersonalityTraitAdmin(admin.ModelAdmin):
    list_display = ['user', 'personality_trait', 'prominence_score']
    list_filter = ['personality_trait']
    search_fields = ['user__email', 'personality_trait__name']
    raw_id_fields = ['user', 'personality_trait']


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'discovery_radius_km', 'min_trust_score']
    search_fields = ['user__email']
    raw_id_fields = ['user']
