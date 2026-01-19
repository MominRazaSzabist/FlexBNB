import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from useraccount.models import User
from property.models import Property
from booking.models import Reservation


class Conversation(models.Model):
    """Represents a conversation thread between a guest and host about a property"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, related_name='conversations', on_delete=models.CASCADE)
    guest = models.ForeignKey(User, related_name='guest_conversations', on_delete=models.CASCADE)
    host = models.ForeignKey(User, related_name='host_conversations', on_delete=models.CASCADE)
    reservation = models.ForeignKey(Reservation, related_name='conversation', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status tracking
    is_archived_by_guest = models.BooleanField(default=False)
    is_archived_by_host = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        unique_together = ['property', 'guest', 'host']
    
    def __str__(self):
        return f"Conversation: {self.guest.email} <-> {self.host.email} about {self.property.title}"


class Message(models.Model):
    """Individual message in a conversation"""
    ROLE_CHOICES = [
        ('guest', 'Guest'),
        ('host', 'Host'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_chat_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_chat_messages', on_delete=models.CASCADE)
    sender_role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='guest')
    
    message = models.TextField()
    
    # Message status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Quick reply flag
    is_quick_reply = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.email} ({self.sender_role}) at {self.created_at}"
    
    def mark_as_read(self):
        """Mark message as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class QuickReplyTemplate(models.Model):
    """Pre-set quick reply messages for hosts"""
    CATEGORY_CHOICES = [
        ('greeting', 'Greeting'),
        ('booking_confirmation', 'Booking Confirmation'),
        ('check_in', 'Check-in Instructions'),
        ('check_out', 'Check-out Instructions'),
        ('amenities', 'Amenities Info'),
        ('directions', 'Directions'),
        ('house_rules', 'House Rules'),
        ('emergency', 'Emergency'),
        ('thank_you', 'Thank You'),
        ('custom', 'Custom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(User, related_name='quick_reply_templates', on_delete=models.CASCADE)
    property = models.ForeignKey(Property, related_name='quick_replies', on_delete=models.CASCADE, null=True, blank=True)
    
    title = models.CharField(max_length=100)
    message = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='custom')
    
    # Usage tracking
    usage_count = models.IntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-usage_count', 'title']
    
    def __str__(self):
        return f"{self.title} - {self.host.email}"
    
    def increment_usage(self):
        """Increment usage count when template is used"""
        self.usage_count += 1
        self.save()


class Notification(models.Model):
    """Notifications for messages and updates"""
    NOTIFICATION_TYPE_CHOICES = [
        ('new_message', 'New Message'),
        ('booking_request', 'Booking Request'),
        ('booking_confirmed', 'Booking Confirmed'),
        ('check_in_reminder', 'Check-in Reminder'),
        ('check_out_reminder', 'Check-out Reminder'),
        ('payment_due', 'Payment Due'),
        ('payment_received', 'Payment Received'),
        ('review_request', 'Review Request'),
        ('system', 'System Notification'),
    ]
    
    DELIVERY_METHOD_CHOICES = [
        ('in_app', 'In-App'),
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Related objects
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, null=True, blank=True)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, null=True, blank=True)
    
    # Delivery tracking
    delivery_method = models.CharField(max_length=20, choices=DELIVERY_METHOD_CHOICES, default='in_app')
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Email/SMS tracking
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    sms_sent = models.BooleanField(default=False)
    sms_sent_at = models.DateTimeField(null=True, blank=True)
    push_sent = models.BooleanField(default=False)
    push_sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} for {self.user.email}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class AutomatedReminder(models.Model):
    """Automated reminders for check-in, payment, etc."""
    REMINDER_TYPE_CHOICES = [
        ('check_in_24h', 'Check-in 24 Hours'),
        ('check_in_2h', 'Check-in 2 Hours'),
        ('check_out_24h', 'Check-out 24 Hours'),
        ('check_out_2h', 'Check-out 2 Hours'),
        ('payment_due_3d', 'Payment Due 3 Days'),
        ('payment_due_1d', 'Payment Due 1 Day'),
        ('review_request', 'Review Request'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation = models.ForeignKey(Reservation, related_name='reminders', on_delete=models.CASCADE)
    reminder_type = models.CharField(max_length=30, choices=REMINDER_TYPE_CHOICES)
    
    scheduled_for = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True)
    is_sent = models.BooleanField(default=False)
    
    # Notification created
    notification = models.ForeignKey(Notification, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['scheduled_for']
    
    def __str__(self):
        return f"{self.reminder_type} for Reservation {self.reservation.id}"

