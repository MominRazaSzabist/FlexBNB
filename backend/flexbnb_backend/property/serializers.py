from rest_framework import serializers

from .models import Property

from useraccount.serializers import UserDetailSerializer


class PropertiesListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = (
            'id',
            'title',
            'price_per_night',
            'price_per_hour',
            'is_hourly_booking',
            'image_url',
        )

class PropertiesDetailSerializer(serializers.ModelSerializer):
    host = UserDetailSerializer(read_only=True,many=False)
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
        )
