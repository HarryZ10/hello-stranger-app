from django.contrib import admin

from .models import UserLocation


@admin.register(UserLocation)
class UserLocationAdmin(admin.ModelAdmin):
    list_display = ['user', 'latitude', 'longitude', 'is_current', 'is_visible', 'timestamp']
    list_filter = ['is_current', 'is_visible']
    search_fields = ['user__email']
    raw_id_fields = ['user']
    date_hierarchy = 'timestamp'
