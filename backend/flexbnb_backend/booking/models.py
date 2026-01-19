import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from useraccount.models import User
from property.models import Property


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, related_name='reservations', on_delete=models.CASCADE)
    guest = models.ForeignKey(User, related_name='reservations', on_delete=models.CASCADE)
    host = models.ForeignKey(User, related_name='host_reservations', on_delete=models.CASCADE)
    
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    
    guests_count = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    host_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    special_requests = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Reservation {self.id} - {self.property.title}"
    
    class Meta:
        ordering = ['-created_at']


class HostEarnings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(User, related_name='earnings', on_delete=models.CASCADE)
    reservation = models.OneToOneField(Reservation, related_name='earnings_record', on_delete=models.CASCADE)
    
    gross_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2)
    net_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    
    payout_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ], default='pending')
    
    payout_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Earnings for {self.host.email} - {self.net_earnings}"
    
    class Meta:
        ordering = ['-created_at']


class HostMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation = models.ForeignKey(Reservation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Message from {self.sender.email} to {self.receiver.email}"
    
    class Meta:
        ordering = ['-created_at']


class PropertyAnalytics(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, related_name='analytics', on_delete=models.CASCADE)
    
    views_count = models.IntegerField(default=0)
    booking_requests = models.IntegerField(default=0)
    successful_bookings = models.IntegerField(default=0)
    
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.IntegerField(default=0)
    
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.property.title}"
    
    class Meta:
        ordering = ['-last_updated']


class PropertyReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, related_name='property_reviews', on_delete=models.CASCADE)
    reservation = models.OneToOneField(Reservation, related_name='review', on_delete=models.CASCADE)
    guest = models.ForeignKey(User, related_name='reviews_given', on_delete=models.CASCADE)
    
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    
    cleanliness_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    communication_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    location_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    value_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review for {self.property.title} - {self.rating} stars"
    
    class Meta:
        ordering = ['-created_at'] 


class Offer(models.Model):
    property = models.ForeignKey('property.Property', related_name='offers', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    valid_from = models.DateField()
    valid_to = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Invoice(models.Model):
    reservation = models.OneToOneField(Reservation, related_name='invoice', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice for reservation {self.reservation.id}"