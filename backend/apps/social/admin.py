from django.contrib import admin

from .models import Connection, Message


@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ['from_user', 'to_user', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['from_user__email', 'to_user__email']
    raw_id_fields = ['from_user', 'to_user']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'recipient', 'is_read', 'sent_at']
    list_filter = ['is_read']
    search_fields = ['sender__email', 'recipient__email', 'content']
    raw_id_fields = ['sender', 'recipient', 'related_activity']
    date_hierarchy = 'sent_at'
