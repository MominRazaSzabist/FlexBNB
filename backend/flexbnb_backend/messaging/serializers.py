from rest_framework import serializers
from booking.models import HostMessage
from booking.serializers import UserBasicSerializer, PropertyBasicSerializer, ReservationSerializer
from .models import Conversation, Message, QuickReplyTemplate, Notification, AutomatedReminder


class HostMessageSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)
    receiver = UserBasicSerializer(read_only=True)
    reservation_property = serializers.SerializerMethodField()

    class Meta:
        model = HostMessage
        fields = [
            'id', 'reservation', 'sender', 'receiver', 'message',
            'is_read', 'created_at', 'reservation_property'
        ]

    def get_reservation_property(self, obj):
        return obj.reservation.property.title if obj.reservation else None


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)
    receiver = UserBasicSerializer(read_only=True)
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'receiver', 'sender_role', 'message',
            'is_read', 'read_at', 'is_quick_reply', 'created_at',
            'sender_name', 'receiver_name'
        ]
        read_only_fields = ['id', 'sender', 'sender_role', 'created_at', 'read_at']
    
    def get_sender_name(self, obj):
        return obj.sender.name or obj.sender.email
    
    def get_receiver_name(self, obj):
        return obj.receiver.name or obj.receiver.email


class ConversationSerializer(serializers.ModelSerializer):
    property = PropertyBasicSerializer(read_only=True)
    guest = UserBasicSerializer(read_only=True)
    host = UserBasicSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'property', 'guest', 'host', 'reservation',
            'is_archived_by_guest', 'is_archived_by_host',
            'created_at', 'updated_at', 'last_message', 'unread_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        # Get the latest message (most recent)
        try:
            last_msg = obj.messages.order_by('-created_at').first()
            if last_msg:
                return {
                    'message': last_msg.message,
                    'sender': last_msg.sender.name or last_msg.sender.email,
                    'sender_role': last_msg.sender_role,
                    'created_at': last_msg.created_at.isoformat() if last_msg.created_at else None,
                    'is_read': last_msg.is_read
                }
        except Exception as e:
            print(f"[SERIALIZER] Error getting last message: {str(e)}")
        return None
    
    def get_unread_count(self, obj):
        user = self.context.get('user')
        if user:
            try:
                return obj.messages.filter(receiver=user, is_read=False).count()
            except Exception as e:
                print(f"[SERIALIZER] Error getting unread count: {str(e)}")
                return 0
        return 0


class ConversationDetailSerializer(serializers.ModelSerializer):
    property = PropertyBasicSerializer(read_only=True)
    guest = UserBasicSerializer(read_only=True)
    host = UserBasicSerializer(read_only=True)
    messages = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'property', 'guest', 'host', 'reservation',
            'is_archived_by_guest', 'is_archived_by_host',
            'created_at', 'updated_at', 'messages'
        ]
    
    def get_messages(self, obj):
        # Get messages ordered by created_at (oldest first)
        try:
            messages = obj.messages.all().order_by('created_at').select_related('sender', 'receiver')
            return MessageSerializer(messages, many=True).data
        except Exception as e:
            print(f"[SERIALIZER] Error getting messages: {str(e)}")
            import traceback
            print(f"[SERIALIZER] Traceback: {traceback.format_exc()}")
            return []


class QuickReplyTemplateSerializer(serializers.ModelSerializer):
    host = UserBasicSerializer(read_only=True)
    property_title = serializers.SerializerMethodField()
    
    class Meta:
        model = QuickReplyTemplate
        fields = [
            'id', 'host', 'property', 'property_title', 'title', 'message',
            'category', 'usage_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'host', 'usage_count', 'created_at', 'updated_at']
    
    def get_property_title(self, obj):
        return obj.property.title if obj.property else 'All Properties'


class NotificationSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    conversation_id = serializers.UUIDField(source='conversation.id', read_only=True)
    reservation_id = serializers.UUIDField(source='reservation.id', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'title', 'message',
            'conversation_id', 'reservation_id', 'delivery_method',
            'is_read', 'read_at', 'email_sent', 'email_sent_at',
            'sms_sent', 'sms_sent_at', 'push_sent', 'push_sent_at',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'read_at']


class AutomatedReminderSerializer(serializers.ModelSerializer):
    reservation = ReservationSerializer(read_only=True)
    notification = NotificationSerializer(read_only=True)
    
    class Meta:
        model = AutomatedReminder
        fields = [
            'id', 'reservation', 'reminder_type', 'scheduled_for',
            'sent_at', 'is_sent', 'notification', 'created_at'
        ]
        read_only_fields = ['id', 'sent_at', 'is_sent', 'notification', 'created_at']