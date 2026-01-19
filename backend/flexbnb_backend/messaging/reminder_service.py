"""
Automated Reminder Service for Check-in, Check-out, and Payment Reminders
"""
from django.utils import timezone
from datetime import timedelta
from .models import AutomatedReminder
from .notification_service import NotificationService
from booking.models import Reservation
import logging

logger = logging.getLogger(__name__)


class ReminderService:
    """Service for creating and sending automated reminders"""
    
    @classmethod
    def create_reminders_for_reservation(cls, reservation):
        """Create all automated reminders for a reservation"""
        reminders_created = []
        
        # Check-in reminders
        check_in_24h = cls.create_check_in_reminder(reservation, hours_before=24)
        if check_in_24h:
            reminders_created.append(check_in_24h)
        
        check_in_2h = cls.create_check_in_reminder(reservation, hours_before=2)
        if check_in_2h:
            reminders_created.append(check_in_2h)
        
        # Check-out reminders
        check_out_24h = cls.create_check_out_reminder(reservation, hours_before=24)
        if check_out_24h:
            reminders_created.append(check_out_24h)
        
        check_out_2h = cls.create_check_out_reminder(reservation, hours_before=2)
        if check_out_2h:
            reminders_created.append(check_out_2h)
        
        # Payment reminders
        payment_3d = cls.create_payment_reminder(reservation, days_before=3)
        if payment_3d:
            reminders_created.append(payment_3d)
        
        payment_1d = cls.create_payment_reminder(reservation, days_before=1)
        if payment_1d:
            reminders_created.append(payment_1d)
        
        logger.info(f"Created {len(reminders_created)} reminders for reservation {reservation.id}")
        return reminders_created
    
    @classmethod
    def create_check_in_reminder(cls, reservation, hours_before=24):
        """Create check-in reminder"""
        try:
            # Calculate scheduled time
            check_in_datetime = timezone.make_aware(
                timezone.datetime.combine(reservation.check_in_date, reservation.check_in_time or timezone.datetime.min.time())
            )
            scheduled_for = check_in_datetime - timedelta(hours=hours_before)
            
            # Don't create if scheduled time is in the past
            if scheduled_for < timezone.now():
                return None
            
            reminder_type = 'check_in_24h' if hours_before == 24 else 'check_in_2h'
            
            reminder = AutomatedReminder.objects.create(
                reservation=reservation,
                reminder_type=reminder_type,
                scheduled_for=scheduled_for
            )
            
            logger.info(f"Created check-in reminder ({hours_before}h) for reservation {reservation.id}")
            return reminder
        except Exception as e:
            logger.error(f"Failed to create check-in reminder: {str(e)}")
            return None
    
    @classmethod
    def create_check_out_reminder(cls, reservation, hours_before=24):
        """Create check-out reminder"""
        try:
            # Calculate scheduled time
            check_out_datetime = timezone.make_aware(
                timezone.datetime.combine(reservation.check_out_date, reservation.check_out_time or timezone.datetime.min.time())
            )
            scheduled_for = check_out_datetime - timedelta(hours=hours_before)
            
            # Don't create if scheduled time is in the past
            if scheduled_for < timezone.now():
                return None
            
            reminder_type = 'check_out_24h' if hours_before == 24 else 'check_out_2h'
            
            reminder = AutomatedReminder.objects.create(
                reservation=reservation,
                reminder_type=reminder_type,
                scheduled_for=scheduled_for
            )
            
            logger.info(f"Created check-out reminder ({hours_before}h) for reservation {reservation.id}")
            return reminder
        except Exception as e:
            logger.error(f"Failed to create check-out reminder: {str(e)}")
            return None
    
    @classmethod
    def create_payment_reminder(cls, reservation, days_before=3):
        """Create payment due reminder"""
        try:
            # Calculate scheduled time (assuming payment due is check-in date)
            payment_due_date = timezone.make_aware(
                timezone.datetime.combine(reservation.check_in_date, timezone.datetime.min.time())
            )
            scheduled_for = payment_due_date - timedelta(days=days_before)
            
            # Don't create if scheduled time is in the past
            if scheduled_for < timezone.now():
                return None
            
            reminder_type = 'payment_due_3d' if days_before == 3 else 'payment_due_1d'
            
            reminder = AutomatedReminder.objects.create(
                reservation=reservation,
                reminder_type=reminder_type,
                scheduled_for=scheduled_for
            )
            
            logger.info(f"Created payment reminder ({days_before}d) for reservation {reservation.id}")
            return reminder
        except Exception as e:
            logger.error(f"Failed to create payment reminder: {str(e)}")
            return None
    
    @classmethod
    def process_due_reminders(cls):
        """Process all reminders that are due to be sent"""
        now = timezone.now()
        
        # Get all unsent reminders that are due
        due_reminders = AutomatedReminder.objects.filter(
            is_sent=False,
            scheduled_for__lte=now
        ).select_related('reservation', 'reservation__guest', 'reservation__property')
        
        sent_count = 0
        for reminder in due_reminders:
            if cls.send_reminder(reminder):
                sent_count += 1
        
        logger.info(f"Processed {sent_count} reminders")
        return sent_count
    
    @classmethod
    def send_reminder(cls, reminder):
        """Send a specific reminder"""
        try:
            reservation = reminder.reservation
            
            # Determine notification based on reminder type
            if reminder.reminder_type == 'check_in_24h':
                notification = NotificationService.send_check_in_reminder(reservation, hours_before=24)
            elif reminder.reminder_type == 'check_in_2h':
                notification = NotificationService.send_check_in_reminder(reservation, hours_before=2)
            elif reminder.reminder_type == 'check_out_24h':
                notification = NotificationService.send_check_out_reminder(reservation, hours_before=24)
            elif reminder.reminder_type == 'check_out_2h':
                notification = NotificationService.send_check_out_reminder(reservation, hours_before=2)
            elif reminder.reminder_type == 'payment_due_3d':
                notification = NotificationService.send_payment_due_reminder(reservation, days_before=3)
            elif reminder.reminder_type == 'payment_due_1d':
                notification = NotificationService.send_payment_due_reminder(reservation, days_before=1)
            else:
                logger.warning(f"Unknown reminder type: {reminder.reminder_type}")
                return False
            
            # Mark reminder as sent
            reminder.is_sent = True
            reminder.sent_at = timezone.now()
            reminder.notification = notification
            reminder.save()
            
            logger.info(f"Sent reminder {reminder.id} for reservation {reservation.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send reminder {reminder.id}: {str(e)}")
            return False
    
    @classmethod
    def cancel_reminders_for_reservation(cls, reservation):
        """Cancel all unsent reminders for a reservation"""
        AutomatedReminder.objects.filter(
            reservation=reservation,
            is_sent=False
        ).delete()
        
        logger.info(f"Cancelled reminders for reservation {reservation.id}")

