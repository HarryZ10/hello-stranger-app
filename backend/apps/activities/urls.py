from django.urls import path

from .views import (
    ActivityCategoryListView,
    ActivityCommentsView,
    ActivityDetailView,
    ActivityListCreateView,
    CheckInActivityView,
    JoinActivityView,
    LeaveActivityView,
    MyActivitiesView,
    MyParticipationsView,
    NearbyActivitiesView,
)

app_name = 'activities'

urlpatterns = [
    # Categories
    path('categories/', ActivityCategoryListView.as_view(), name='category_list'),
    
    # Activities CRUD
    path('', ActivityListCreateView.as_view(), name='activity_list_create'),
    path('<int:id>/', ActivityDetailView.as_view(), name='activity_detail'),
    
    # User's activities
    path('mine/', MyActivitiesView.as_view(), name='my_activities'),
    path('participating/', MyParticipationsView.as_view(), name='my_participations'),
    
    # Discovery
    path('nearby/', NearbyActivitiesView.as_view(), name='nearby_activities'),
    
    # Participation
    path('<int:activity_id>/join/', JoinActivityView.as_view(), name='join_activity'),
    path('<int:activity_id>/leave/', LeaveActivityView.as_view(), name='leave_activity'),
    path('<int:activity_id>/checkin/', CheckInActivityView.as_view(), name='checkin_activity'),
    
    # Comments
    path('<int:activity_id>/comments/', ActivityCommentsView.as_view(), name='activity_comments'),
]
