from django.contrib import admin

from .models import Activity, ActivityCategory, ActivityComment, ActivityParticipant


@admin.register(ActivityCategory)
class ActivityCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'category', 'start_time', 'status', 'visibility', 'current_participants_count']
    list_filter = ['status', 'visibility', 'category', 'start_time']
    search_fields = ['title', 'description', 'creator__email']
    date_hierarchy = 'start_time'
    raw_id_fields = ['creator']


@admin.register(ActivityParticipant)
class ActivityParticipantAdmin(admin.ModelAdmin):
    list_display = ['activity', 'user', 'status', 'joined_at', 'checked_in_at']
    list_filter = ['status']
    search_fields = ['activity__title', 'user__email']
    raw_id_fields = ['activity', 'user']


@admin.register(ActivityComment)
class ActivityCommentAdmin(admin.ModelAdmin):
    list_display = ['activity', 'user', 'created_at']
    search_fields = ['content', 'user__email', 'activity__title']
    raw_id_fields = ['activity', 'user', 'parent']
