from django.contrib import admin
from .models import (
    GreenCertification,
    CarbonFootprint,
    EcoIncentive,
    EcoIncentiveUsage,
    EnergyUsage,
    SustainableExperience
)


@admin.register(GreenCertification)
class GreenCertificationAdmin(admin.ModelAdmin):
    list_display = ['property_obj', 'host', 'status', 'level', 'sustainability_score', 'applied_at']
    list_filter = ['status', 'level', 'energy_saving', 'water_conservation']
    search_fields = ['property_obj__title', 'host__email']
    readonly_fields = ['applied_at', 'sustainability_score']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('property_obj', 'host', 'status', 'level')
        }),
        ('Sustainability Practices', {
            'fields': (
                'energy_saving', 'water_conservation', 'recycling_program',
                'reduced_plastic', 'renewable_energy', 'organic_amenities',
                'local_sourcing', 'green_transportation'
            )
        }),
        ('Details', {
            'fields': ('description', 'documentation', 'reviewer_notes')
        }),
        ('Dates', {
            'fields': ('applied_at', 'reviewed_at', 'approved_at', 'expires_at')
        }),
    )


@admin.register(CarbonFootprint)
class CarbonFootprintAdmin(admin.ModelAdmin):
    list_display = ['user', 'property_obj', 'transport_type', 'distance_km', 'total_carbon', 'created_at']
    list_filter = ['transport_type', 'offset_purchased']
    search_fields = ['user__email', 'property_obj__title']
    readonly_fields = ['created_at', 'transport_carbon', 'accommodation_carbon', 'total_carbon']


@admin.register(EcoIncentive)
class EcoIncentiveAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'value', 'percentage', 'is_active', 'valid_from', 'valid_until']
    list_filter = ['type', 'is_active', 'requires_green_property']
    search_fields = ['name', 'description']


@admin.register(EcoIncentiveUsage)
class EcoIncentiveUsageAdmin(admin.ModelAdmin):
    list_display = ['user', 'incentive', 'property_obj', 'amount_saved', 'used_at']
    list_filter = ['used_at']
    search_fields = ['user__email', 'incentive__name']


@admin.register(EnergyUsage)
class EnergyUsageAdmin(admin.ModelAdmin):
    list_display = ['property_obj', 'date', 'electricity_kwh', 'water_liters', 'occupancy_rate', 'is_anomaly']
    list_filter = ['is_anomaly', 'date']
    search_fields = ['property_obj__title']
    readonly_fields = ['created_at']


@admin.register(SustainableExperience)
class SustainableExperienceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'city', 'rating', 'carbon_neutral', 'eco_certified', 'is_active']
    list_filter = ['category', 'carbon_neutral', 'community_supported', 'eco_certified', 'is_active']
    search_fields = ['name', 'city', 'country']

