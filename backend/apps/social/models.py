from django.conf import settings
from django.db import models


class Connection(models.Model):
    """Friend/connection system between users"""
    
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'
        BLOCKED = 'blocked', 'Blocked'
    
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='connections_sent'
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='connections_received'
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'connections'
        unique_together = ['from_user', 'to_user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.from_user} -> {self.to_user} ({self.status})"
    
    @classmethod
    def are_friends(cls, user1, user2):
        """Check if two users are friends"""
        return cls.objects.filter(
            models.Q(from_user=user1, to_user=user2, status=cls.StatusChoices.ACCEPTED) |
            models.Q(from_user=user2, to_user=user1, status=cls.StatusChoices.ACCEPTED)
        ).exists()
    
    @classmethod
    def get_friends(cls, user):
        """Get all friends of a user"""
        from apps.users.models import User
        
        friend_ids = set()
        
        # Friends where user sent the request
        sent = cls.objects.filter(
            from_user=user, 
            status=cls.StatusChoices.ACCEPTED
        ).values_list('to_user_id', flat=True)
        friend_ids.update(sent)
        
        # Friends where user received the request
        received = cls.objects.filter(
            to_user=user, 
            status=cls.StatusChoices.ACCEPTED
        ).values_list('from_user_id', flat=True)
        friend_ids.update(received)
        
        return User.objects.filter(id__in=friend_ids)
    
    @classmethod
    def is_blocked(cls, user1, user2):
        """Check if either user has blocked the other"""
        return cls.objects.filter(
            models.Q(from_user=user1, to_user=user2, status=cls.StatusChoices.BLOCKED) |
            models.Q(from_user=user2, to_user=user1, status=cls.StatusChoices.BLOCKED)
        ).exists()


class Message(models.Model):
    """Direct messages between users"""
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )
    content = models.TextField(max_length=5000)
    
    # Related activity (optional context)
    related_activity = models.ForeignKey(
        'activities.Activity',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='related_messages'
    )
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['sent_at']
        indexes = [
            models.Index(fields=['sender', 'recipient']),
            models.Index(fields=['-sent_at']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender} to {self.recipient}"
    
    @classmethod
    def get_conversation(cls, user1, user2):
        """Get all messages between two users"""
        return cls.objects.filter(
            models.Q(sender=user1, recipient=user2) |
            models.Q(sender=user2, recipient=user1)
        ).order_by('sent_at')
    
    @classmethod
    def get_conversations_for_user(cls, user):
        """Get list of unique conversations for a user"""
        from django.db.models import Max, Q

        # Get all users this user has messaged with
        sent_to = cls.objects.filter(sender=user).values_list('recipient', flat=True).distinct()
        received_from = cls.objects.filter(recipient=user).values_list('sender', flat=True).distinct()
        
        partner_ids = set(sent_to) | set(received_from)
        
        conversations = []
        for partner_id in partner_ids:
            last_message = cls.objects.filter(
                Q(sender=user, recipient_id=partner_id) |
                Q(sender_id=partner_id, recipient=user)
            ).order_by('-sent_at').first()
            
            unread_count = cls.objects.filter(
                sender_id=partner_id,
                recipient=user,
                is_read=False
            ).count()
            
            conversations.append({
                'partner_id': partner_id,
                'last_message': last_message,
                'unread_count': unread_count
            })
        
        # Sort by last message time
        conversations.sort(key=lambda x: x['last_message'].sent_at, reverse=True)
        return conversations
