from django.forms import ModelForm

from .models import Property


class PropertyForm(ModelForm):
    class Meta:
        model = Property
        fields = (
            'title',
            'description',
            'price_per_night',
            'price_per_hour',
            'is_hourly_booking',
            'available_hours_start',
            'available_hours_end',
            'bedrooms',
            'bathrooms',
            'guests',
            'country',
            'country_code',
            'category',
            'image',
            'latitude',
            'longitude',
            'wifi',
            'parking',
            'air_conditioning',
            'breakfast',
            'kitchen',
            'pool',
            'hot_tub',
            'gym',
            'pet_friendly',
        )