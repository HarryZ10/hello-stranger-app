import random
import string

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmergencyContact, Report, UserReview, Verification
from .serializers import (
    CreateReportSerializer,
    CreateReviewSerializer,
    EmergencyContactSerializer,
    ReportSerializer,
    RequestVerificationSerializer,
    UserReviewSerializer,
    VerificationSerializer,
)

User = get_user_model()


class UserReviewsReceivedView(generics.ListAPIView):
    """List reviews received by the current user"""
    serializer_class = UserReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserReview.objects.filter(
            reviewed_user=self.request.user
        ).select_related('reviewer', 'activity')


class UserReviewsForUserView(generics.ListAPIView):
    """List reviews for a specific user"""
    serializer_class = UserReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return UserReview.objects.filter(
            reviewed_user_id=user_id
        ).select_related('reviewer', 'activity')


class CreateReviewView(generics.CreateAPIView):
    """Create a review for a user"""
    serializer_class = CreateReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CreateReportView(generics.CreateAPIView):
    """Submit a report"""
    serializer_class = CreateReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MyReportsView(generics.ListAPIView):
    """List reports submitted by the current user"""
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Report.objects.filter(reporter=self.request.user)


class VerificationsView(generics.ListAPIView):
    """List user's verifications"""
    serializer_class = VerificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Verification.objects.filter(user=self.request.user)


class RequestVerificationView(APIView):
    """Request a new verification"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = RequestVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        verification_type = serializer.validated_data['verification_type']
        
        # Check if pending verification exists
        existing = Verification.objects.filter(
            user=request.user,
            verification_type=verification_type,
            status=Verification.StatusChoices.PENDING
        ).first()
        
        if existing:
            return Response(
                {"error": "Verification already pending"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate verification code
        code = ''.join(random.choices(string.digits, k=6))
        
        verification = Verification.objects.create(
            user=request.user,
            verification_type=verification_type,
            verification_code=code,
            expires_at=timezone.now() + timezone.timedelta(hours=24)
        )
        
        # In production, send email/SMS with the code
        # For MVP, return the code (remove in production!)
        return Response({
            "message": f"Verification code sent",
            "verification_id": verification.id,
            "code": code  # Remove in production
        }, status=status.HTTP_201_CREATED)


class VerifyCodeView(APIView):
    """Verify a verification code"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, verification_id):
        code = request.data.get('code')
        
        if not code:
            return Response(
                {"error": "Code required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            verification = Verification.objects.get(
                id=verification_id,
                user=request.user,
                status=Verification.StatusChoices.PENDING
            )
        except Verification.DoesNotExist:
            return Response(
                {"error": "Verification not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check expiry
        if verification.expires_at and verification.expires_at < timezone.now():
            verification.status = Verification.StatusChoices.EXPIRED
            verification.save()
            return Response(
                {"error": "Verification expired"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check code
        if verification.verification_code != code:
            return Response(
                {"error": "Invalid code"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        verification.status = Verification.StatusChoices.VERIFIED
        verification.verified_at = timezone.now()
        verification.save()
        
        return Response({
            "message": "Verification successful",
            "verification": VerificationSerializer(verification).data
        })


class EmergencyContactListCreateView(generics.ListCreateAPIView):
    """List and create emergency contacts"""
    serializer_class = EmergencyContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return EmergencyContact.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EmergencyContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete an emergency contact"""
    serializer_class = EmergencyContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        return EmergencyContact.objects.filter(user=self.request.user)
