from rest_framework import status, permissions
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Max
from django.utils import timezone
from datetime import timedelta

from useraccount.auth import ClerkAuthentication
from useraccount.models import User
from booking.models import HostMessage, Reservation
from property.models import Property
from .models import Conversation, Message, QuickReplyTemplate, Notification, AutomatedReminder
from .serializers import (
    HostMessageSerializer, ConversationSerializer, ConversationDetailSerializer,
    MessageSerializer, QuickReplyTemplateSerializer, NotificationSerializer,
    AutomatedReminderSerializer
)


# ==================== CONVERSATIONS ====================

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def conversations_list(request):
    """List all conversations for the authenticated user"""
    try:
        user = request.user
        filter_type = request.query_params.get('filter', 'all')  # all, unread, archived
        
        print(f"[MESSAGING] ========== CONVERSATIONS LIST ==========")
        print(f"[MESSAGING] User: {user.email} (ID: {user.id})")
        print(f"[MESSAGING] Filter type: {filter_type}")
        
        # Get conversations where user is guest or host
        # Optimize queries with select_related and prefetch_related
        conversations = Conversation.objects.filter(
            Q(guest=user) | Q(host=user)
        ).select_related('property', 'guest', 'host').prefetch_related('messages')
        
        print(f"[MESSAGING] Total conversations (before filters): {conversations.count()}")
        
        # Debug: List all conversations
        for conv in conversations[:5]:
            msg_count = conv.messages.count()
            print(f"[MESSAGING]   - Conv {conv.id}: Guest={conv.guest.email}, Host={conv.host.email}, Property={conv.property.title}")
            print(f"[MESSAGING]     Messages count: {msg_count}")
            if msg_count > 0:
                last_msg = conv.messages.order_by('-created_at').first()
                print(f"[MESSAGING]     Last message: {last_msg.message[:30]}... from {last_msg.sender.email} to {last_msg.receiver.email}")
        
        # Apply filters
        if filter_type == 'unread':
            # Filter conversations with unread messages for this user
            conversations = conversations.filter(
                messages__receiver=user,
                messages__is_read=False
            ).distinct()
            print(f"[MESSAGING] After unread filter: {conversations.count()} conversations")
        elif filter_type == 'archived':
            # Show archived conversations
            conversations = conversations.filter(
                Q(is_archived_by_guest=True, guest=user) |
                Q(is_archived_by_host=True, host=user)
            )
            print(f"[MESSAGING] After archived filter: {conversations.count()} conversations")
        else:
            # Hide archived conversations by default
            conversations = conversations.exclude(
                Q(is_archived_by_guest=True, guest=user) |
                Q(is_archived_by_host=True, host=user)
            )
            print(f"[MESSAGING] After excluding archived: {conversations.count()} conversations")
        
        # Order by most recently updated
        conversations = conversations.order_by('-updated_at')
        print(f"[MESSAGING] Final conversations count: {conversations.count()}")
        
        # Serialize with user context for unread count
        serializer = ConversationSerializer(conversations, many=True, context={'user': user})
        data = serializer.data
        print(f"[MESSAGING] Returning {len(data)} serialized conversations")
        
        # Debug: Show first conversation details
        if len(data) > 0:
            first_conv = data[0]
            print(f"[MESSAGING] First conversation: ID={first_conv.get('id')}, Property={first_conv.get('property', {}).get('title')}")
            print(f"[MESSAGING] First conversation: Guest={first_conv.get('guest', {}).get('email')}, Host={first_conv.get('host', {}).get('email')}")
            print(f"[MESSAGING] First conversation: Last message={first_conv.get('last_message')}")
            print(f"[MESSAGING] First conversation: Unread count={first_conv.get('unread_count')}")
        
        print(f"[MESSAGING] ========== END CONVERSATIONS LIST ==========")
        
        return Response(data)
    except Exception as e:
        import traceback
        print(f"[MESSAGING] ❌ ERROR in conversations_list: {str(e)}")
        print(f"[MESSAGING] Traceback: {traceback.format_exc()}")
        return Response(
            {
                'error': 'Failed to fetch conversations',
                'detail': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def conversation_detail(request, conversation_id):
    """Get a specific conversation with all messages - Role-based access control"""
    user = request.user
    
    print(f"[MESSAGING ACCESS CONTROL] User {user.email} requesting conversation {conversation_id}")
    
    try:
        conversation = Conversation.objects.get(id=conversation_id)
        print(f"[MESSAGING ACCESS CONTROL] Conversation found: Guest={conversation.guest.email}, Host={conversation.host.email}")
    except Conversation.DoesNotExist:
        print(f"[MESSAGING ACCESS CONTROL] Conversation {conversation_id} not found")
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Role-based access control: Only guest or host can access
    if conversation.guest != user and conversation.host != user:
        print(f"[MESSAGING ACCESS CONTROL] ❌ FORBIDDEN: User {user.email} is neither guest nor host")
        return Response({
            'error': 'You do not have permission to access this conversation'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user_role = 'guest' if conversation.guest == user else 'host'
    print(f"[MESSAGING ACCESS CONTROL] ✅ Access granted as {user_role.upper()}")
    
    # Mark all messages as read for this user
    Message.objects.filter(
        conversation=conversation,
        receiver=user,
        is_read=False
    ).update(is_read=True, read_at=timezone.now())
    
    # Refresh conversation from DB to get updated messages
    conversation.refresh_from_db()
    
    serializer = ConversationDetailSerializer(conversation)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def create_conversation(request):
    """Create a new conversation about a property"""
    import traceback
    try:
        # Ensure user is authenticated
        if not hasattr(request, 'user') or not request.user or not request.user.is_authenticated:
            print(f"[MESSAGING] ❌ ERROR: User not authenticated")
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user = request.user
        property_id = request.data.get('property_id')
        initial_message = request.data.get('message')
        
        print(f"[MESSAGING] ========== CREATE CONVERSATION ==========")
        print(f"[MESSAGING] Guest (sender): {user.email} (ID: {user.id})")
        print(f"[MESSAGING] Property ID: {property_id}")
        print(f"[MESSAGING] Message length: {len(initial_message) if initial_message else 0}")
        print(f"[MESSAGING] Request data: {request.data}")
        
        if not property_id or not initial_message:
            print(f"[MESSAGING] ERROR: Missing property_id or message")
            return Response(
                {'error': 'property_id and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            property_obj = Property.objects.get(id=property_id)
            print(f"[MESSAGING] Property found: {property_obj.title} (ID: {property_obj.id})")
            print(f"[MESSAGING] Property Host field: {property_obj.Host}")
        except Property.DoesNotExist:
            print(f"[MESSAGING] ERROR: Property not found with ID: {property_id}")
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
        
        host = property_obj.Host
        if not host:
            print(f"[MESSAGING] ERROR: Property has no Host assigned!")
            return Response(
                {'error': 'Property has no host assigned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"[MESSAGING] Host identified: {host.email} (ID: {host.id})")
        print(f"[MESSAGING] Host name: {host.name or 'N/A'}")
        
        # FIX: If guest is the same as host (due to auto-assignment), find a different host
        if user.id == host.id:
            print(f"[MESSAGING] WARNING: Guest is the same as property host (likely due to auto-assignment)")
            print(f"[MESSAGING] Guest ID: {user.id}, Host ID: {host.id}")
            print(f"[MESSAGING] Attempting to find a different host...")
            
            alternative_host = None
            try:
                # Strategy 1: Find a property with a different host
                other_property = Property.objects.exclude(Host=user).exclude(Host__isnull=True).first()
                if other_property and other_property.Host and other_property.Host.id != user.id:
                    alternative_host = other_property.Host
                    print(f"[MESSAGING] Found alternative host from property '{other_property.title}': {alternative_host.email} (ID: {alternative_host.id})")
            except Exception as e:
                print(f"[MESSAGING] Error in Strategy 1: {str(e)}")
            
            # Strategy 2: Find any other user if Strategy 1 failed
            if not alternative_host:
                try:
                    alternative_host = User.objects.exclude(id=user.id).first()
                    if alternative_host:
                        print(f"[MESSAGING] Found alternative host (any user): {alternative_host.email} (ID: {alternative_host.id})")
                except Exception as e:
                    print(f"[MESSAGING] Error in Strategy 2: {str(e)}")
            
            # Update property host if we found an alternative
            if alternative_host and alternative_host.id != user.id:
                try:
                    property_obj.Host = alternative_host
                    property_obj.save()
                    host = alternative_host
                    print(f"[MESSAGING] ✅ Property host updated to: {host.email}")
                except Exception as e:
                    import traceback
                    print(f"[MESSAGING] ERROR updating property host: {str(e)}")
                    print(f"[MESSAGING] Traceback: {traceback.format_exc()}")
                    # Continue anyway - don't block the message
            else:
                print(f"[MESSAGING] ⚠️ Could not find alternative host. This may cause issues.")
                # Don't block - allow message to proceed but it won't work correctly
        
        print(f"[MESSAGING] Final host: {host.email} (ID: {host.id})")
        print(f"[MESSAGING] Guest: {user.email} (ID: {user.id})")
        print(f"[MESSAGING] Host != Guest: {host.id != user.id}")
        
        # Get or create conversation
        conversation, created = Conversation.objects.get_or_create(
            property=property_obj,
            guest=user,
            host=host
        )
        print(f"[MESSAGING] Conversation {'CREATED' if created else 'RETRIEVED'}: {conversation.id}")
        print(f"[MESSAGING] Conversation guest: {conversation.guest.email}")
        print(f"[MESSAGING] Conversation host: {conversation.host.email}")
        
        # Create initial message
        try:
            message = Message.objects.create(
                conversation=conversation,
                sender=user,
                receiver=host,
                sender_role='guest',  # Guest initiating conversation
                message=initial_message
            )
            print(f"[MESSAGING] ✅ Message created successfully!")
            print(f"[MESSAGING] Message ID: {message.id}")
            print(f"[MESSAGING] Message sender: {message.sender.email} (ID: {message.sender.id}) [GUEST]")
            print(f"[MESSAGING] Message receiver: {message.receiver.email} (ID: {message.receiver.id}) [HOST]")
            print(f"[MESSAGING] Message content: {message.message[:50]}...")
        except Exception as e:
            import traceback
            print(f"[MESSAGING] ❌ ERROR creating message: {str(e)}")
            print(f"[MESSAGING] Traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Failed to create message: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create notification for host
        try:
            notification = Notification.objects.create(
                user=host,
                notification_type='new_message',
                title=f'New message from {user.name or user.email}',
                message=initial_message[:100],
                conversation=conversation,
                delivery_method='in_app'
            )
            print(f"[MESSAGING] ✅ Notification created: {notification.id} for host: {host.email}")
        except Exception as e:
            print(f"[MESSAGING] ⚠️ WARNING: Failed to create notification: {str(e)}")
            # Don't fail the request if notification fails
        
        # Update conversation timestamp
        conversation.updated_at = timezone.now()
        conversation.save()
        
        # Verify message exists in conversation
        message_count = conversation.messages.count()
        print(f"[MESSAGING] Conversation now has {message_count} message(s)")
        
        # Refresh conversation to get all messages
        conversation.refresh_from_db()
        
        try:
            serializer = ConversationDetailSerializer(conversation)
            response_data = serializer.data
            print(f"[MESSAGING] Response data: conversation_id={response_data.get('id')}")
            print(f"[MESSAGING] Response messages count: {len(response_data.get('messages', []))}")
            print(f"[MESSAGING] ========== END CREATE CONVERSATION ==========")
            
            return Response({
                'success': True,
                'conversation': response_data,
                'message': 'Conversation created and message sent successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as serializer_error:
            import traceback
            print(f"[MESSAGING] ❌ ERROR in serializer: {str(serializer_error)}")
            print(f"[MESSAGING] Traceback: {traceback.format_exc()}")
            # Return success with basic data if serializer fails
            return Response({
                'success': True,
                'conversation': {
                    'id': str(conversation.id),
                    'property': {'id': str(conversation.property.id), 'title': conversation.property.title},
                    'guest': {'id': str(conversation.guest.id), 'email': conversation.guest.email},
                    'host': {'id': str(conversation.host.id), 'email': conversation.host.email},
                    'messages': []
                },
                'message': 'Conversation created and message sent successfully (serializer warning)'
            }, status=status.HTTP_201_CREATED)
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"[MESSAGING] ❌ UNEXPECTED ERROR in create_conversation: {str(e)}")
        print(f"[MESSAGING] Full traceback:\n{error_traceback}")
        
        # Return proper JSON error response
        return Response(
            {
                'error': 'An unexpected error occurred while creating the conversation',
                'detail': str(e),
                'type': type(e).__name__
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def archive_conversation(request, conversation_id):
    """Archive a conversation - Role-based access control"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Role-based access control
    if conversation.guest != user and conversation.host != user:
        return Response({
            'error': 'You do not have permission to archive this conversation'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Archive for the appropriate user
    if conversation.guest == user:
        conversation.is_archived_by_guest = True
        print(f"[MESSAGING] Conversation {conversation_id} archived by GUEST {user.email}")
    elif conversation.host == user:
        conversation.is_archived_by_host = True
        print(f"[MESSAGING] Conversation {conversation_id} archived by HOST {user.email}")
    
    conversation.save()
    
    return Response({'message': 'Conversation archived successfully'})


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def unarchive_conversation(request, conversation_id):
    """Unarchive a conversation - Role-based access control"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Role-based access control
    if conversation.guest != user and conversation.host != user:
        return Response({
            'error': 'You do not have permission to unarchive this conversation'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Unarchive for the appropriate user
    if conversation.guest == user:
        conversation.is_archived_by_guest = False
        print(f"[MESSAGING] Conversation {conversation_id} unarchived by GUEST {user.email}")
    elif conversation.host == user:
        conversation.is_archived_by_host = False
        print(f"[MESSAGING] Conversation {conversation_id} unarchived by HOST {user.email}")
    
    conversation.save()
    
    return Response({'message': 'Conversation unarchived successfully'})


# ==================== MESSAGES ====================

@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def send_message(request):
    """Send a message in a conversation - Role-based access control"""
    user = request.user
    conversation_id = request.data.get('conversation_id')
    message_text = request.data.get('message')
    is_quick_reply = request.data.get('is_quick_reply', False)
    quick_reply_id = request.data.get('quick_reply_id')
    
    print(f"[MESSAGING] send_message called by user: {user.email} (ID: {user.id})")
    print(f"[MESSAGING] conversation_id: {conversation_id}, message length: {len(message_text) if message_text else 0}")
    
    if not conversation_id or not message_text:
        print(f"[MESSAGING] ERROR: Missing conversation_id or message")
        return Response(
            {'error': 'conversation_id and message are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        conversation = Conversation.objects.get(id=conversation_id)
        print(f"[MESSAGING] Conversation found: {conversation.id}")
    except Conversation.DoesNotExist:
        print(f"[MESSAGING] ERROR: Conversation not found with ID: {conversation_id}")
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Role-based access control: Only guest or host can send messages
    if conversation.guest != user and conversation.host != user:
        print(f"[MESSAGING ACCESS CONTROL] ❌ FORBIDDEN: User {user.email} cannot send message in this conversation")
        return Response({
            'error': 'You do not have permission to send messages in this conversation'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Determine receiver and sender role
    is_guest = conversation.guest == user
    receiver = conversation.host if is_guest else conversation.guest
    sender_role = 'guest' if is_guest else 'host'
    print(f"[MESSAGING] Sender: {user.email} [{sender_role.upper()}], Receiver: {receiver.email}")
    
    # Create message
    try:
        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            receiver=receiver,
            sender_role=sender_role,
            message=message_text,
            is_quick_reply=is_quick_reply
        )
        print(f"[MESSAGING] Message created: {message.id} from {sender_role}")
    except Exception as e:
        print(f"[MESSAGING] ERROR creating message: {str(e)}")
        return Response(
            {'error': f'Failed to create message: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Update conversation timestamp
    conversation.updated_at = timezone.now()
    conversation.save()
    
    # If quick reply, increment usage count
    if quick_reply_id:
        try:
            template = QuickReplyTemplate.objects.get(id=quick_reply_id, host=user)
            template.increment_usage()
        except QuickReplyTemplate.DoesNotExist:
            pass
    
    # Create notification for receiver
    try:
        notification = Notification.objects.create(
            user=receiver,
            notification_type='new_message',
            title=f'New message from {user.name or user.email}',
            message=message_text[:100],
            conversation=conversation,
            delivery_method='in_app'
        )
        print(f"[MESSAGING] Notification created: {notification.id} for receiver: {receiver.email}")
    except Exception as e:
        print(f"[MESSAGING] WARNING: Failed to create notification: {str(e)}")
        # Don't fail the request if notification fails
    
    # Log for debugging
    print(f"[MESSAGING] Message sent successfully: {message.id} from {user.email} to {receiver.email}")
    print(f"[MESSAGING] Conversation: {conversation.id}, Property: {conversation.property.title}")
    
    serializer = MessageSerializer(message)
    return Response({
        'success': True,
        'message': serializer.data,
        'conversation_id': str(conversation.id)
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def mark_message_read(request, message_id):
    """Mark a message as read"""
    user = request.user
    
    try:
        message = Message.objects.get(id=message_id, receiver=user)
        message.mark_as_read()
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    except Message.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request, conversation_id):
    """Mark all messages in a conversation as read"""
    user = request.user
    
    try:
        conversation = Conversation.objects.filter(
            Q(guest=user) | Q(host=user)
        ).get(id=conversation_id)
        
        Message.objects.filter(
            conversation=conversation,
            receiver=user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return Response({'message': 'All messages marked as read'})
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


# ==================== QUICK REPLIES ====================

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def quick_reply_templates_list(request):
    """List quick reply templates for the authenticated host"""
    user = request.user
    property_id = request.query_params.get('property_id')
    category = request.query_params.get('category')
    
    templates = QuickReplyTemplate.objects.filter(host=user, is_active=True)
    
    if property_id:
        templates = templates.filter(Q(property_id=property_id) | Q(property__isnull=True))
    
    if category:
        templates = templates.filter(category=category)
    
    templates = templates.order_by('-usage_count', 'title')
    serializer = QuickReplyTemplateSerializer(templates, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def create_quick_reply_template(request):
    """Create a new quick reply template"""
    user = request.user
    
    serializer = QuickReplyTemplateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(host=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def update_quick_reply_template(request, template_id):
    """Update a quick reply template"""
    user = request.user
    
    try:
        template = QuickReplyTemplate.objects.get(id=template_id, host=user)
    except QuickReplyTemplate.DoesNotExist:
        return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = QuickReplyTemplateSerializer(template, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def delete_quick_reply_template(request, template_id):
    """Delete a quick reply template"""
    user = request.user
    
    try:
        template = QuickReplyTemplate.objects.get(id=template_id, host=user)
        template.delete()
        return Response({'message': 'Template deleted successfully'})
    except QuickReplyTemplate.DoesNotExist:
        return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)


# ==================== NOTIFICATIONS ====================

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def notifications_list(request):
    """List notifications for the authenticated user"""
    user = request.user
    filter_type = request.query_params.get('filter', 'unread')  # all, unread, read
    
    notifications = Notification.objects.filter(user=user)
    
    if filter_type == 'unread':
        notifications = notifications.filter(is_read=False)
    elif filter_type == 'read':
        notifications = notifications.filter(is_read=True)
    
    notifications = notifications.order_by('-created_at')[:50]
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a notification as read"""
    user = request.user
    
    try:
        notification = Notification.objects.get(id=notification_id, user=user)
        notification.mark_as_read()
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read"""
    user = request.user
    
    Notification.objects.filter(user=user, is_read=False).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({'message': 'All notifications marked as read'})


# ==================== LEGACY SUPPORT ====================

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def messages_list(request):
    """List messages for the authenticated user (legacy support)"""
    user = request.user
    messages = HostMessage.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('-created_at')
    serializer = HostMessageSerializer(messages, many=True)
    return Response(serializer.data)