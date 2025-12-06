from django.urls import path

from .views import (
    CreateReportView,
    CreateReviewView,
    EmergencyContactDetailView,
    EmergencyContactListCreateView,
    MyReportsView,
    RequestVerificationView,
    UserReviewsForUserView,
    UserReviewsReceivedView,
    VerificationsView,
    VerifyCodeView,
)

app_name = 'safety'

urlpatterns = [
    # Reviews
    path('reviews/', UserReviewsReceivedView.as_view(), name='my_reviews'),
    path('reviews/user/<int:user_id>/', UserReviewsForUserView.as_view(), name='user_reviews'),
    path('reviews/create/', CreateReviewView.as_view(), name='create_review'),
    
    # Reports
    path('reports/', MyReportsView.as_view(), name='my_reports'),
    path('reports/create/', CreateReportView.as_view(), name='create_report'),
    
    # Verifications
    path('verifications/', VerificationsView.as_view(), name='verifications'),
    path('verifications/request/', RequestVerificationView.as_view(), name='request_verification'),
    path('verifications/<int:verification_id>/verify/', VerifyCodeView.as_view(), name='verify_code'),
    
    # Emergency contacts
    path('emergency-contacts/', EmergencyContactListCreateView.as_view(), name='emergency_contacts'),
    path('emergency-contacts/<int:id>/', EmergencyContactDetailView.as_view(), name='emergency_contact_detail'),
]
