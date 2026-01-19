from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from useraccount.models import User
from property.models import Property
import uuid


class GreenCertification(models.Model):
    """
    Green Stay Certification for eco-friendly properties
    Hosts apply and get verified for sustainable practices
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    LEVEL_CHOICES = [
        ('bronze', 'Bronze - Basic Sustainability'),
        ('silver', 'Silver - Advanced Sustainability'),
        ('gold', 'Gold - Exceptional Sustainability'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_obj = models.OneToOneField(Property, on_delete=models.CASCADE, related_name='green_certification')
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='green_certifications')
    
    # Certification details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, null=True, blank=True)
    
    # Sustainability practices (checked by host during application)
    energy_saving = models.BooleanField(default=False, help_text="LED lights, solar panels, energy-efficient appliances")
    water_conservation = models.BooleanField(default=False, help_text="Low-flow fixtures, rainwater harvesting")
    recycling_program = models.BooleanField(default=False, help_text="Recycling bins, composting")
    reduced_plastic = models.BooleanField(default=False, help_text="No single-use plastics")
    renewable_energy = models.BooleanField(default=False, help_text="Solar, wind, or other renewable sources")
    organic_amenities = models.BooleanField(default=False, help_text="Organic toiletries, eco-friendly cleaning")
    local_sourcing = models.BooleanField(default=False, help_text="Local food, products from local businesses")
    green_transportation = models.BooleanField(default=False, help_text="Bike rentals, EV charging stations")
    
    # Additional information
    description = models.TextField(blank=True, help_text="Describe your sustainability practices")
    documentation = models.JSONField(default=dict, blank=True, help_text="Links to certificates, photos, etc.")
    
    # Dates
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Certificate valid until")
    
    # Review notes
    reviewer_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-applied_at']
        
    def __str__(self):
        return f"{self.property_obj.title} - {self.status} ({self.level or 'N/A'})"
    
    @property
    def sustainability_score(self):
        """Calculate sustainability score based on practices (0-100)"""
        practices = [
            self.energy_saving,
            self.water_conservation,
            self.recycling_program,
            self.reduced_plastic,
            self.renewable_energy,
            self.organic_amenities,
            self.local_sourcing,
            self.green_transportation,
        ]
        return (sum(practices) / len(practices)) * 100


class CarbonFootprint(models.Model):
    """
    Track carbon footprint calculations for guest trips
    """
    TRANSPORT_CHOICES = [
        ('walk', 'Walking'),
        ('bike', 'Bicycle'),
        ('bus', 'Bus'),
        ('train', 'Train'),
        ('car', 'Car'),
        ('electric_car', 'Electric Car'),
        ('flight_domestic', 'Domestic Flight'),
        ('flight_international', 'International Flight'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carbon_calculations', null=True, blank=True)
    property_obj = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='carbon_calculations')
    
    # Trip details
    transport_type = models.CharField(max_length=30, choices=TRANSPORT_CHOICES)
    distance_km = models.FloatField(validators=[MinValueValidator(0)])
    stay_duration_days = models.IntegerField(validators=[MinValueValidator(1)])
    number_of_guests = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    
    # Carbon calculation (kg CO2)
    transport_carbon = models.FloatField(default=0, help_text="CO2 from transport in kg")
    accommodation_carbon = models.FloatField(default=0, help_text="CO2 from accommodation in kg")
    total_carbon = models.FloatField(default=0, help_text="Total CO2 in kg")
    
    # Offset options
    offset_purchased = models.BooleanField(default=False)
    offset_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Carbon Calc - {self.user.email if self.user else 'Anonymous'} - {self.total_carbon}kg CO2"
    
    def calculate_carbon(self):
        """
        Calculate carbon footprint based on transport and accommodation
        CO2 emission factors (kg CO2 per km per person):
        - Walking/Bike: 0
        - Bus: 0.089
        - Train: 0.041
        - Car: 0.171
        - Electric Car: 0.053
        - Domestic Flight: 0.255
        - International Flight: 0.195
        
        Accommodation: ~20kg CO2 per night per guest (average)
        Green certified properties: -30% reduction
        """
        # Transport CO2 factors
        transport_factors = {
            'walk': 0,
            'bike': 0,
            'bus': 0.089,
            'train': 0.041,
            'car': 0.171,
            'electric_car': 0.053,
            'flight_domestic': 0.255,
            'flight_international': 0.195,
        }
        
        # Calculate transport carbon
        factor = transport_factors.get(self.transport_type, 0.171)
        self.transport_carbon = self.distance_km * factor * self.number_of_guests
        
        # Calculate accommodation carbon (20kg CO2 per night per guest)
        base_accommodation = 20 * self.stay_duration_days * self.number_of_guests
        
        # Apply green certification discount if property is certified
        if self.property_obj and hasattr(self.property_obj, 'green_certification'):
            cert = self.property_obj.green_certification
            if cert.status == 'approved':
                base_accommodation *= 0.7  # 30% reduction for green properties
        
        self.accommodation_carbon = base_accommodation
        self.total_carbon = self.transport_carbon + self.accommodation_carbon
        
        return self.total_carbon


class EcoIncentive(models.Model):
    """
    Eco-friendly incentives and rewards for guests
    """
    TYPE_CHOICES = [
        ('discount', 'Discount'),
        ('credit', 'Credit'),
        ('reward_points', 'Reward Points'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Discount/reward value
    value = models.DecimalField(max_digits=10, decimal_places=2, help_text="Discount amount or credit value")
    percentage = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="Discount percentage")
    
    # Eligibility criteria
    requires_green_property = models.BooleanField(default=True)
    min_stay_nights = models.IntegerField(default=1)
    max_uses_per_user = models.IntegerField(default=1)
    
    # Validity
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.type}"


class EcoIncentiveUsage(models.Model):
    """
    Track eco-incentive usage by users
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='eco_incentive_usage')
    incentive = models.ForeignKey(EcoIncentive, on_delete=models.CASCADE, related_name='usage_records')
    property_obj = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True)
    
    used_at = models.DateTimeField(auto_now_add=True)
    amount_saved = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        ordering = ['-used_at']
    
    def __str__(self):
        return f"{self.user.email} used {self.incentive.name}"


class EnergyUsage(models.Model):
    """
    Track energy usage for host properties (for AI monitoring)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_obj = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='energy_usage')
    
    # Energy data
    date = models.DateField()
    electricity_kwh = models.FloatField(validators=[MinValueValidator(0)], help_text="Electricity usage in kWh")
    water_liters = models.FloatField(validators=[MinValueValidator(0)], help_text="Water usage in liters")
    gas_kwh = models.FloatField(default=0, validators=[MinValueValidator(0)], help_text="Gas usage in kWh")
    
    # Context data
    occupancy_rate = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="Percentage of property occupied")
    number_of_guests = models.IntegerField(default=0)
    outdoor_temperature = models.FloatField(null=True, blank=True, help_text="Average outdoor temp in Celsius")
    
    # AI analysis
    is_anomaly = models.BooleanField(default=False, help_text="Flagged by AI as unusual usage")
    ai_recommendation = models.TextField(blank=True, help_text="AI-generated suggestions")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['property_obj', 'date']
    
    def __str__(self):
        return f"{self.property_obj.title} - {self.date}"
    
    @property
    def usage_per_guest(self):
        """Calculate usage per guest for comparison"""
        if self.number_of_guests > 0:
            return {
                'electricity': self.electricity_kwh / self.number_of_guests,
                'water': self.water_liters / self.number_of_guests,
            }
        return {'electricity': 0, 'water': 0}


class SustainableExperience(models.Model):
    """
    Local eco-friendly activities and experiences
    """
    CATEGORY_CHOICES = [
        ('outdoor', 'Outdoor Activities'),
        ('cultural', 'Cultural Experiences'),
        ('food', 'Local Food & Dining'),
        ('shopping', 'Sustainable Shopping'),
        ('transport', 'Green Transportation'),
        ('education', 'Educational Tours'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Location
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Sustainability features
    carbon_neutral = models.BooleanField(default=False)
    community_supported = models.BooleanField(default=False)
    eco_certified = models.BooleanField(default=False)
    
    # Contact & booking
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    
    # Rating
    rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.IntegerField(default=0)
    
    # Media
    image_url = models.URLField(blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-rating', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.city}"

