from django.urls import path

from .views import (
    AcceptConnectionView,
    BlockUserView,
    ConnectionListView,
    ConversationDetailView,
    ConversationsListView,
    DeclineConnectionView,
    FriendsListView,
    MarkMessagesReadView,
    PendingConnectionsView,
    RemoveConnectionView,
    SendConnectionRequestView,
    SendMessageView,
)

app_name = 'social'

urlpatterns = [
    # Connections
    path('connections/', ConnectionListView.as_view(), name='connection_list'),
    path('connections/friends/', FriendsListView.as_view(), name='friends_list'),
    path('connections/pending/', PendingConnectionsView.as_view(), name='pending_connections'),
    path('connections/request/', SendConnectionRequestView.as_view(), name='send_connection_request'),
    path('connections/<int:connection_id>/accept/', AcceptConnectionView.as_view(), name='accept_connection'),
    path('connections/<int:connection_id>/decline/', DeclineConnectionView.as_view(), name='decline_connection'),
    path('connections/<int:connection_id>/', RemoveConnectionView.as_view(), name='remove_connection'),
    path('block/<int:user_id>/', BlockUserView.as_view(), name='block_user'),
    
    # Messages
    path('messages/', ConversationsListView.as_view(), name='conversations_list'),
    path('messages/send/', SendMessageView.as_view(), name='send_message'),
    path('messages/<int:user_id>/', ConversationDetailView.as_view(), name='conversation_detail'),
    path('messages/<int:user_id>/read/', MarkMessagesReadView.as_view(), name='mark_messages_read'),
]
