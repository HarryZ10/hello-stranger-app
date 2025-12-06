from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.serializers import UserPublicSerializer

from .models import Connection, Message
from .serializers import (
    ConnectionRequestSerializer,
    ConnectionSerializer,
    ConversationSerializer,
    MarkMessagesReadSerializer,
    MessageSerializer,
    SendMessageSerializer,
)

User = get_user_model()


class ConnectionListView(generics.ListAPIView):
    """List user's connections (friends)"""
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status', 'accepted')
        return Connection.objects.filter(
            Q(from_user=self.request.user) | Q(to_user=self.request.user),
            status=status_filter
        ).select_related('from_user', 'to_user')


class FriendsListView(APIView):
    """Get list of friends"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        friends = Connection.get_friends(request.user)
        serializer = UserPublicSerializer(friends, many=True)
        return Response(serializer.data)


class PendingConnectionsView(generics.ListAPIView):
    """List pending connection requests received"""
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Connection.objects.filter(
            to_user=self.request.user,
            status=Connection.StatusChoices.PENDING
        ).select_related('from_user')


class SendConnectionRequestView(APIView):
    """Send a connection request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ConnectionRequestSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        to_user_id = serializer.validated_data['to_user_id']
        to_user = User.objects.get(id=to_user_id)
        
        # Check for existing connection
        existing = Connection.objects.filter(
            Q(from_user=request.user, to_user=to_user) |
            Q(from_user=to_user, to_user=request.user)
        ).first()
        
        if existing:
            if existing.status == Connection.StatusChoices.BLOCKED:
                return Response(
                    {"error": "Cannot send request to this user"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if existing.status == Connection.StatusChoices.ACCEPTED:
                return Response(
                    {"error": "Already connected"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if existing.status == Connection.StatusChoices.PENDING:
                return Response(
                    {"error": "Request already pending"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        connection = Connection.objects.create(
            from_user=request.user,
            to_user=to_user,
            status=Connection.StatusChoices.PENDING
        )
        
        return Response(
            ConnectionSerializer(connection).data,
            status=status.HTTP_201_CREATED
        )


class AcceptConnectionView(APIView):
    """Accept a connection request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, connection_id):
        try:
            connection = Connection.objects.get(
                id=connection_id,
                to_user=request.user,
                status=Connection.StatusChoices.PENDING
            )
        except Connection.DoesNotExist:
            return Response(
                {"error": "Connection request not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        connection.status = Connection.StatusChoices.ACCEPTED
        connection.save()
        
        return Response(ConnectionSerializer(connection).data)


class DeclineConnectionView(APIView):
    """Decline a connection request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, connection_id):
        try:
            connection = Connection.objects.get(
                id=connection_id,
                to_user=request.user,
                status=Connection.StatusChoices.PENDING
            )
        except Connection.DoesNotExist:
            return Response(
                {"error": "Connection request not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        connection.status = Connection.StatusChoices.DECLINED
        connection.save()
        
        return Response({"message": "Request declined"})


class BlockUserView(APIView):
    """Block a user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            user_to_block = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if user_to_block == request.user:
            return Response(
                {"error": "Cannot block yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update or create connection as blocked
        connection, created = Connection.objects.update_or_create(
            from_user=request.user,
            to_user=user_to_block,
            defaults={'status': Connection.StatusChoices.BLOCKED}
        )
        
        return Response({"message": "User blocked"})


class RemoveConnectionView(APIView):
    """Remove a connection (unfriend)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, connection_id):
        try:
            connection = Connection.objects.get(
                Q(id=connection_id),
                Q(from_user=request.user) | Q(to_user=request.user)
            )
        except Connection.DoesNotExist:
            return Response(
                {"error": "Connection not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        connection.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Message Views
class ConversationsListView(APIView):
    """Get list of conversations"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        conversations = Message.get_conversations_for_user(request.user)
        
        results = []
        for conv in conversations:
            partner = User.objects.get(id=conv['partner_id'])
            results.append({
                'partner': UserPublicSerializer(partner).data,
                'last_message': MessageSerializer(conv['last_message']).data,
                'unread_count': conv['unread_count']
            })
        
        return Response(results)


class ConversationDetailView(generics.ListAPIView):
    """Get messages in a conversation"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        partner_id = self.kwargs.get('user_id')
        return Message.get_conversation(self.request.user, User.objects.get(id=partner_id))
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Mark messages as read
        partner_id = self.kwargs.get('user_id')
        Message.objects.filter(
            sender_id=partner_id,
            recipient=request.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return response


class SendMessageView(generics.CreateAPIView):
    """Send a message"""
    serializer_class = SendMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MarkMessagesReadView(APIView):
    """Mark messages as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id=None):
        serializer = MarkMessagesReadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update_read_status(request.user, user_id)
            return Response({"message": "Messages marked as read"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
