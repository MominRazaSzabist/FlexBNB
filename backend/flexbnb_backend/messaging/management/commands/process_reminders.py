"""
Management command to process automated reminders
Run this with: python manage.py process_reminders
"""
from django.core.management.base import BaseCommand
from messaging.reminder_service import ReminderService


class Command(BaseCommand):
    help = 'Process automated reminders that are due to be sent'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Processing reminders...'))
        
        sent_count = ReminderService.process_due_reminders()
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully processed {sent_count} reminders')
        )

