"""
Main API URL configuration
"""
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

from apps.users.views import (  # PersonalityTraitListView,  # Commented out - model doesn't exist; UserPersonalityTraitsView,  # Commented out - model doesn't exist; UserPreferencesView,  # Commented out - model doesn't exist
    NearbyUsersView,
    UserListView,
    UserProfileView,
    UserPublicProfileView,
    UserRegistrationView,
)

app_name = 'api'

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    
    # User endpoints
    path('users/me/', UserProfileView.as_view(), name='user_profile'),
    # path('users/me/preferences/', UserPreferencesView.as_view(), name='user_preferences'),  # Disabled
    # path('users/me/traits/', UserPersonalityTraitsView.as_view(), name='user_traits'),  # Disabled
    # path('users/me/traits/<int:trait_id>/', UserPersonalityTraitsView.as_view(), name='user_trait_delete'),  # Disabled
    path('users/nearby/', NearbyUsersView.as_view(), name='nearby_users'),
    path('users/<int:id>/', UserPublicProfileView.as_view(), name='user_public_profile'),
    path('users/', UserListView.as_view(), name='user_list'),
    
    # Personality traits
    # path('traits/', PersonalityTraitListView.as_view(), name='personality_traits'),  # Disabled
    
    # Activities
    path('activities/', include('apps.activities.urls', namespace='activities')),
    
    # Location
    path('location/', include('apps.locations.urls', namespace='locations')),
    
    # Social (connections & messages)
    path('social/', include('apps.social.urls', namespace='social')),
    
    # Safety (reviews, reports, verifications)
    path('safety/', include('apps.safety.urls', namespace='safety')),
]
