from django.contrib import admin
from .models import Conversation, Message, QuickReplyTemplate, Notification, AutomatedReminder


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'property', 'guest', 'host', 'created_at', 'updated_at']
    list_filter = ['created_at', 'is_archived_by_guest', 'is_archived_by_host']
    search_fields = ['property__title', 'guest__email', 'host__email']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'receiver', 'is_read', 'is_quick_reply', 'created_at']
    list_filter = ['is_read', 'is_quick_reply', 'created_at']
    search_fields = ['sender__email', 'receiver__email', 'message']
    readonly_fields = ['id', 'created_at', 'read_at']


@admin.register(QuickReplyTemplate)
class QuickReplyTemplateAdmin(admin.ModelAdmin):
    list_display = ['title', 'host', 'category', 'usage_count', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['title', 'message', 'host__email']
    readonly_fields = ['id', 'usage_count', 'created_at', 'updated_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'delivery_method', 'created_at']
    search_fields = ['user__email', 'title', 'message']
    readonly_fields = ['id', 'created_at', 'read_at', 'email_sent_at', 'sms_sent_at', 'push_sent_at']


@admin.register(AutomatedReminder)
class AutomatedReminderAdmin(admin.ModelAdmin):
    list_display = ['id', 'reservation', 'reminder_type', 'scheduled_for', 'is_sent', 'sent_at']
    list_filter = ['reminder_type', 'is_sent', 'scheduled_for']
    search_fields = ['reservation__id']
    readonly_fields = ['id', 'created_at', 'sent_at']

