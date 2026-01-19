from django.urls import path
from . import views

urlpatterns = [
    # Conversations
    path('conversations/', views.conversations_list, name='conversations_list'),
    path('conversations/create/', views.create_conversation, name='create_conversation'),
    path('conversations/<uuid:conversation_id>/', views.conversation_detail, name='conversation_detail'),
    path('conversations/<uuid:conversation_id>/archive/', views.archive_conversation, name='archive_conversation'),
    path('conversations/<uuid:conversation_id>/unarchive/', views.unarchive_conversation, name='unarchive_conversation'),
    path('conversations/<uuid:conversation_id>/mark-all-read/', views.mark_all_read, name='mark_all_read'),
    
    # Messages
    path('messages/send/', views.send_message, name='send_message'),
    path('messages/<uuid:message_id>/read/', views.mark_message_read, name='mark_message_read'),
    
    # Quick Replies
    path('quick-replies/', views.quick_reply_templates_list, name='quick_reply_templates_list'),
    path('quick-replies/create/', views.create_quick_reply_template, name='create_quick_reply_template'),
    path('quick-replies/<uuid:template_id>/', views.update_quick_reply_template, name='update_quick_reply_template'),
    path('quick-replies/<uuid:template_id>/delete/', views.delete_quick_reply_template, name='delete_quick_reply_template'),
    
    # Notifications
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('notifications/<uuid:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    
    # Legacy support
    path('messages/', views.messages_list, name='messages_list'),
]