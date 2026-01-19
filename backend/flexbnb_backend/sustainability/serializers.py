from rest_framework import serializers
from .models import (
    GreenCertification,
    CarbonFootprint,
    EcoIncentive,
    EcoIncentiveUsage,
    EnergyUsage,
    SustainableExperience
)
from property.models import Property


class GreenCertificationSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property_obj.title', read_only=True)
    host_name = serializers.CharField(source='host.name', read_only=True)
    sustainability_score = serializers.ReadOnlyField()
    property = serializers.UUIDField(source='property_obj.id', read_only=True)
    
    class Meta:
        model = GreenCertification
        fields = [
            'id', 'property', 'property_title', 'host', 'host_name',
            'status', 'level', 'sustainability_score',
            'energy_saving', 'water_conservation', 'recycling_program',
            'reduced_plastic', 'renewable_energy', 'organic_amenities',
            'local_sourcing', 'green_transportation',
            'description', 'documentation',
            'applied_at', 'reviewed_at', 'approved_at', 'expires_at',
            'reviewer_notes'
        ]
        read_only_fields = ['id', 'applied_at', 'reviewed_at', 'approved_at']


class GreenCertificationCreateSerializer(serializers.ModelSerializer):
    property = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = GreenCertification
        fields = [
            'property',
            'energy_saving', 'water_conservation', 'recycling_program',
            'reduced_plastic', 'renewable_energy', 'organic_amenities',
            'local_sourcing', 'green_transportation',
            'description', 'documentation'
        ]
    
    def create(self, validated_data):
        property_id = validated_data.pop('property')
        from property.models import Property
        property_obj = Property.objects.get(id=property_id)
        return GreenCertification.objects.create(property_obj=property_obj, **validated_data)


class CarbonFootprintSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property_obj.title', read_only=True)
    is_green_property = serializers.SerializerMethodField()
    property = serializers.UUIDField(source='property_obj.id', read_only=True, allow_null=True)
    
    class Meta:
        model = CarbonFootprint
        fields = [
            'id', 'user', 'property', 'property_title',
            'transport_type', 'distance_km', 'stay_duration_days', 'number_of_guests',
            'transport_carbon', 'accommodation_carbon', 'total_carbon',
            'offset_purchased', 'offset_amount',
            'is_green_property', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'transport_carbon', 'accommodation_carbon', 'total_carbon', 'created_at']
    
    def get_is_green_property(self, obj):
        if obj.property_obj and hasattr(obj.property_obj, 'green_certification'):
            return obj.property_obj.green_certification.status == 'approved'
        return False


class CarbonFootprintCalculateSerializer(serializers.Serializer):
    """Serializer for calculating carbon footprint without saving"""
    property_id = serializers.UUIDField(required=False, allow_null=True)
    transport_type = serializers.ChoiceField(choices=CarbonFootprint.TRANSPORT_CHOICES)
    distance_km = serializers.FloatField(min_value=0)
    stay_duration_days = serializers.IntegerField(min_value=1)
    number_of_guests = serializers.IntegerField(min_value=1, default=1)


class EcoIncentiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcoIncentive
        fields = [
            'id', 'name', 'description', 'type', 'value', 'percentage',
            'requires_green_property', 'min_stay_nights', 'max_uses_per_user',
            'is_active', 'valid_from', 'valid_until',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EcoIncentiveUsageSerializer(serializers.ModelSerializer):
    incentive_name = serializers.CharField(source='incentive.name', read_only=True)
    property_title = serializers.CharField(source='property_obj.title', read_only=True)
    property = serializers.UUIDField(source='property_obj.id', read_only=True, allow_null=True)
    
    class Meta:
        model = EcoIncentiveUsage
        fields = [
            'id', 'user', 'incentive', 'incentive_name',
            'property', 'property_title', 'amount_saved', 'used_at'
        ]
        read_only_fields = ['id', 'used_at']


class EnergyUsageSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property_obj.title', read_only=True)
    usage_per_guest = serializers.ReadOnlyField()
    property = serializers.UUIDField(source='property_obj.id', read_only=True)
    
    class Meta:
        model = EnergyUsage
        fields = [
            'id', 'property', 'property_title', 'date',
            'electricity_kwh', 'water_liters', 'gas_kwh',
            'occupancy_rate', 'number_of_guests', 'outdoor_temperature',
            'usage_per_guest', 'is_anomaly', 'ai_recommendation',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'is_anomaly', 'ai_recommendation']


class EnergyUsageStatsSerializer(serializers.Serializer):
    """Aggregated energy usage statistics"""
    period = serializers.CharField()
    total_electricity = serializers.FloatField()
    total_water = serializers.FloatField()
    avg_electricity_per_guest = serializers.FloatField()
    avg_water_per_guest = serializers.FloatField()
    anomaly_count = serializers.IntegerField()
    trend = serializers.CharField()


class SustainableExperienceSerializer(serializers.ModelSerializer):
    distance_from_property = serializers.FloatField(read_only=True, required=False)
    
    class Meta:
        model = SustainableExperience
        fields = [
            'id', 'name', 'description', 'category',
            'city', 'country', 'address', 'latitude', 'longitude',
            'carbon_neutral', 'community_supported', 'eco_certified',
            'website', 'phone', 'email',
            'rating', 'review_count', 'image_url',
            'is_active', 'distance_from_property',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

