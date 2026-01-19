import uuid

from django.conf import settings
from django.db import models

from useraccount.models import User

class Property(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    price_per_night = models.IntegerField()
    price_per_hour = models.IntegerField(null=True, blank=True)
    is_hourly_booking = models.BooleanField(default=False)
    available_hours_start = models.TimeField(null=True, blank=True)
    available_hours_end = models.TimeField(null=True, blank=True)
    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    guests = models.IntegerField()
    country = models.CharField(max_length=255)
    country_code = models.CharField(max_length=10)
    category = models.CharField(max_length=255)
    image = models.ImageField(upload_to='uploads/properties')
    Host = models.ForeignKey(User, related_name='properties', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Map coordinates for interactive map search
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Amenities
    wifi = models.BooleanField(default=False)
    parking = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    breakfast = models.BooleanField(default=False)
    kitchen = models.BooleanField(default=False)
    pool = models.BooleanField(default=False)
    hot_tub = models.BooleanField(default=False)
    gym = models.BooleanField(default=False)
    pet_friendly = models.BooleanField(default=False)
    
    def image_url(self):
        if self.image:
            try:
                return f'{settings.WEBSITE_URL}{self.image.url}'
            except:
                pass
        # Fallback to placeholder if no image
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
    
    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='uploads/properties')

    def image_url(self):
        if self.image:
            try:
                return f'{settings.WEBSITE_URL}{self.image.url}'
            except:
                pass
        # Fallback to placeholder if no image
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'


class SavedListing(models.Model):
    """User's saved/wishlist properties"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_listings")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "property")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} saved {self.property.title}"


class RecentlyViewed(models.Model):
    """Track user's recently viewed properties"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recently_viewed")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="view_events")
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "property")
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.user.email} viewed {self.property.title}"


class Review(models.Model):
    """Property reviews and ratings"""
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "property")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.rating} stars for {self.property.title}"


