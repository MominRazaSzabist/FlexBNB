from rest_framework import serializers
from django.db.models import Avg

from .models import Property, Review

from useraccount.serializers import UserDetailSerializer


class PropertiesListSerializer(serializers.ModelSerializer):
    avg_rating = serializers.SerializerMethodField()
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    image_urls = serializers.SerializerMethodField()
    green_certification = serializers.SerializerMethodField()
    
    def get_avg_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else None
    
    def get_image_urls(self, obj):
        """Get all images for the property (main image + additional images)"""
        image_urls = []
        # Add main image if it exists
        if obj.image:
            image_urls.append(obj.image_url())
        # Add all additional images
        for image in obj.images.all():
            if image.image:
                image_urls.append(image.image_url())
        # If no images, use placeholder
        if not image_urls:
            image_urls = ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop']
        return image_urls
    
    def get_green_certification(self, obj):
        """Get green certification info if property is certified"""
        if hasattr(obj, 'green_certification'):
            cert = obj.green_certification
            if cert.status == 'approved':
                return {
                    'status': cert.status,
                    'level': cert.level,
                    'sustainability_score': cert.sustainability_score
                }
        return None
    
    class Meta:
        model = Property
        fields = (
            'id',
            'title',
            'price_per_night',
            'price_per_hour',
            'is_hourly_booking',
            'image_url',
            'image_urls',
            'latitude',
            'longitude',
            'avg_rating',
            'country',
            'category',
            'green_certification',
        )

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'user_email', 'rating', 'comment', 'created_at')


class PropertiesDetailSerializer(serializers.ModelSerializer):
    host = UserDetailSerializer(read_only=True,many=False)
    image_urls = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    green_certification = serializers.SerializerMethodField()

    def get_image_urls(self, obj):
        return [image.image_url() for image in obj.images.all()]
    
    def get_avg_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else None
    
    def get_green_certification(self, obj):
        """Get green certification info if property is certified"""
        if hasattr(obj, 'green_certification'):
            cert = obj.green_certification
            if cert.status == 'approved':
                return {
                    'status': cert.status,
                    'level': cert.level,
                    'sustainability_score': cert.sustainability_score,
                    'energy_saving': cert.energy_saving,
                    'water_conservation': cert.water_conservation,
                    'recycling_program': cert.recycling_program,
                    'reduced_plastic': cert.reduced_plastic,
                    'renewable_energy': cert.renewable_energy,
                    'organic_amenities': cert.organic_amenities,
                    'local_sourcing': cert.local_sourcing,
                    'green_transportation': cert.green_transportation,
                }
        return None

    class Meta:
        model = Property
        fields = (
            'id',
            'title',
            'description',
            'price_per_night',
            'price_per_hour',
            'is_hourly_booking',
            'available_hours_start',
            'available_hours_end',
            'image_url',
            'bedrooms',
            'bathrooms',
            'guests',
            'host',
            'image_urls',
            'latitude',
            'longitude',
            'avg_rating',
            'reviews',
            'wifi',
            'parking',
            'air_conditioning',
            'breakfast',
            'kitchen',
            'pool',
            'hot_tub',
            'gym',
            'pet_friendly',
            'country',
            'category',
            'green_certification',
        )
