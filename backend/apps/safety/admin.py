from django.contrib import admin

from .models import EmergencyContact, Report, UserReview, Verification


@admin.register(UserReview)
class UserReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'reviewed_user', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['reviewer__email', 'reviewed_user__email', 'comment']
    raw_id_fields = ['reviewer', 'reviewed_user', 'activity']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['reporter', 'reported_user', 'reason', 'status', 'created_at']
    list_filter = ['status', 'reason']
    search_fields = ['reporter__email', 'reported_user__email', 'description']
    raw_id_fields = ['reporter', 'reported_user', 'reported_activity', 'resolved_by']


@admin.register(Verification)
class VerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'verification_type', 'status', 'created_at', 'verified_at']
    list_filter = ['verification_type', 'status']
    search_fields = ['user__email']
    raw_id_fields = ['user']


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'phone_number', 'relationship']
    search_fields = ['user__email', 'name', 'phone_number']
    raw_id_fields = ['user']
