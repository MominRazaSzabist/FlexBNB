from rest_framework import serializers
from .models import (
    Reservation, 
    HostEarnings, 
    HostMessage, 
    PropertyAnalytics, 
    PropertyReview
)
from property.models import Property
from useraccount.models import User
from .models import Offer, Invoice
from useraccount.models import Wishlist


class PropertyBasicSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = ['id', 'title', 'image_url', 'price_per_night', 'category']
    
    def get_image_url(self, obj):
        return obj.image_url()


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name']


class ReservationSerializer(serializers.ModelSerializer):
    property = PropertyBasicSerializer(read_only=True)
    guest = UserBasicSerializer(read_only=True)
    host = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'property', 'guest', 'host', 'check_in_date', 
            'check_out_date', 'check_in_time', 'check_out_time',
            'guests_count', 'total_price', 'booking_fee', 'host_earnings',
            'status', 'special_requests', 'created_at', 'updated_at'
        ]


class HostEarningsSerializer(serializers.ModelSerializer):
    reservation = ReservationSerializer(read_only=True)
    
    class Meta:
        model = HostEarnings
        fields = [
            'id', 'reservation', 'gross_earnings', 'platform_fee', 
            'net_earnings', 'payout_status', 'payout_date', 'created_at'
        ]


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


class PropertyAnalyticsSerializer(serializers.ModelSerializer):
    property = PropertyBasicSerializer(read_only=True)
    
    class Meta:
        model = PropertyAnalytics
        fields = [
            'id', 'property', 'views_count', 'booking_requests', 
            'successful_bookings', 'average_rating', 'total_reviews',
            'occupancy_rate', 'total_earnings', 'last_updated'
        ]


class PropertyReviewSerializer(serializers.ModelSerializer):
    guest = UserBasicSerializer(read_only=True)
    property = PropertyBasicSerializer(read_only=True)
    
    class Meta:
        model = PropertyReview
        fields = [
            'id', 'property', 'guest', 'rating', 'comment',
            'cleanliness_rating', 'communication_rating', 
            'location_rating', 'value_rating', 'created_at'
        ]


class HostDashboardStatsSerializer(serializers.Serializer):
    total_properties = serializers.IntegerField()
    total_reservations = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    total_earnings = serializers.DecimalField(max_digits=12, decimal_places=2)
    this_month_earnings = serializers.DecimalField(max_digits=12, decimal_places=2)
    occupancy_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    unread_messages = serializers.IntegerField() 


class OfferSerializer(serializers.ModelSerializer):
    property = PropertyBasicSerializer(read_only=True)

    class Meta:
        model = Offer
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    reservation = ReservationSerializer(read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'


class WishlistSerializer(serializers.ModelSerializer):
    property = PropertyBasicSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'property', 'added_at']


class GuestDashboardStatsSerializer(serializers.Serializer):
    total_reservations = serializers.IntegerField()
    upcoming_trips = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    wishlist_count = serializers.IntegerField()
    unread_messages = serializers.IntegerField()
    average_rating_given = serializers.DecimalField(max_digits=3, decimal_places=2)
