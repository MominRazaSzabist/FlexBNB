"""
Notification Service for Email, SMS, and Push Notifications
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Notification
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for sending notifications via multiple channels"""
    
    @staticmethod
    def send_email_notification(user, title, message, html_content=None):
        """Send email notification"""
        try:
            subject = title
            from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@flexbnb.com'
            recipient_list = [user.email]
            
            if html_content:
                text_content = strip_tags(html_content)
                send_mail(
                    subject,
                    text_content,
                    from_email,
                    recipient_list,
                    html_message=html_content,
                    fail_silently=False,
                )
            else:
                send_mail(
                    subject,
                    message,
                    from_email,
                    recipient_list,
                    fail_silently=False,
                )
            
            logger.info(f"Email sent to {user.email}: {title}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_sms_notification(user, message):
        """Send SMS notification (placeholder for Twilio/other SMS service)"""
        try:
            # TODO: Implement SMS sending with Twilio or other service
            # Example with Twilio:
            # from twilio.rest import Client
            # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            # message = client.messages.create(
            #     body=message,
            #     from_=settings.TWILIO_PHONE_NUMBER,
            #     to=user.phone_number
            # )
            
            logger.info(f"SMS would be sent to {user.email}: {message[:50]}")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_push_notification(user, title, message):
        """Send push notification (placeholder for Firebase/other push service)"""
        try:
            # TODO: Implement push notifications with Firebase Cloud Messaging
            # Example with Firebase:
            # from firebase_admin import messaging
            # message = messaging.Message(
            #     notification=messaging.Notification(
            #         title=title,
            #         body=message,
            #     ),
            #     token=user.fcm_token,
            # )
            # response = messaging.send(message)
            
            logger.info(f"Push notification would be sent to {user.email}: {title}")
            return True
        except Exception as e:
            logger.error(f"Failed to send push notification to {user.email}: {str(e)}")
            return False
    
    @classmethod
    def create_and_send_notification(cls, user, notification_type, title, message, 
                                     conversation=None, reservation=None, 
                                     send_email=False, send_sms=False, send_push=False):
        """Create notification and send via specified channels"""
        from django.utils import timezone
        
        # Create in-app notification
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            conversation=conversation,
            reservation=reservation,
            delivery_method='in_app'
        )
        
        # Send email if requested
        if send_email:
            html_content = cls._generate_email_html(notification_type, title, message, user)
            if cls.send_email_notification(user, title, message, html_content):
                notification.email_sent = True
                notification.email_sent_at = timezone.now()
        
        # Send SMS if requested
        if send_sms:
            if cls.send_sms_notification(user, message):
                notification.sms_sent = True
                notification.sms_sent_at = timezone.now()
        
        # Send push if requested
        if send_push:
            if cls.send_push_notification(user, title, message):
                notification.push_sent = True
                notification.push_sent_at = timezone.now()
        
        notification.save()
        return notification
    
    @staticmethod
    def _generate_email_html(notification_type, title, message, user):
        """Generate HTML content for email"""
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #3b82f6; color: white; padding: 20px; text-align: center; }}
                .content {{ background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>FlexBNB</h1>
                </div>
                <div class="content">
                    <h2>{title}</h2>
                    <p>{message}</p>
                    <a href="http://localhost:3000/messages" class="button">View Messages</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from FlexBNB. Please do not reply to this email.</p>
                    <p>&copy; 2024 FlexBNB. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html_template
    
    @classmethod
    def send_new_message_notification(cls, message_obj):
        """Send notification for new message"""
        receiver = message_obj.receiver
        sender = message_obj.sender
        
        title = f"New message from {sender.name or sender.email}"
        message_text = f"{sender.name or sender.email} sent you a message: {message_obj.message[:100]}"
        
        return cls.create_and_send_notification(
            user=receiver,
            notification_type='new_message',
            title=title,
            message=message_text,
            conversation=message_obj.conversation,
            send_email=True,  # Send email for new messages
            send_push=True    # Send push notification
        )
    
    @classmethod
    def send_booking_request_notification(cls, reservation):
        """Send notification for new booking request"""
        host = reservation.host
        guest = reservation.guest
        
        title = f"New booking request from {guest.name or guest.email}"
        message = f"{guest.name or guest.email} has requested to book {reservation.property.title} from {reservation.check_in_date} to {reservation.check_out_date}"
        
        return cls.create_and_send_notification(
            user=host,
            notification_type='booking_request',
            title=title,
            message=message,
            reservation=reservation,
            send_email=True,
            send_sms=True,
            send_push=True
        )
    
    @classmethod
    def send_booking_confirmed_notification(cls, reservation):
        """Send notification for confirmed booking"""
        guest = reservation.guest
        
        title = f"Booking confirmed for {reservation.property.title}"
        message = f"Your booking for {reservation.property.title} from {reservation.check_in_date} to {reservation.check_out_date} has been confirmed!"
        
        return cls.create_and_send_notification(
            user=guest,
            notification_type='booking_confirmed',
            title=title,
            message=message,
            reservation=reservation,
            send_email=True,
            send_sms=True,
            send_push=True
        )
    
    @classmethod
    def send_check_in_reminder(cls, reservation, hours_before):
        """Send check-in reminder"""
        guest = reservation.guest
        
        title = f"Check-in reminder for {reservation.property.title}"
        message = f"Your check-in is in {hours_before} hours at {reservation.property.title}. Check-in date: {reservation.check_in_date}"
        
        return cls.create_and_send_notification(
            user=guest,
            notification_type='check_in_reminder',
            title=title,
            message=message,
            reservation=reservation,
            send_email=True,
            send_sms=True,
            send_push=True
        )
    
    @classmethod
    def send_check_out_reminder(cls, reservation, hours_before):
        """Send check-out reminder"""
        guest = reservation.guest
        
        title = f"Check-out reminder for {reservation.property.title}"
        message = f"Your check-out is in {hours_before} hours at {reservation.property.title}. Check-out date: {reservation.check_out_date}"
        
        return cls.create_and_send_notification(
            user=guest,
            notification_type='check_out_reminder',
            title=title,
            message=message,
            reservation=reservation,
            send_email=True,
            send_sms=True,
            send_push=True
        )
    
    @classmethod
    def send_payment_due_reminder(cls, reservation, days_before):
        """Send payment due reminder"""
        guest = reservation.guest
        
        title = f"Payment due in {days_before} days"
        message = f"Your payment for {reservation.property.title} is due in {days_before} days. Amount: ${reservation.total_price}"
        
        return cls.create_and_send_notification(
            user=guest,
            notification_type='payment_due',
            title=title,
            message=message,
            reservation=reservation,
            send_email=True,
            send_sms=True,
            send_push=True
        )

