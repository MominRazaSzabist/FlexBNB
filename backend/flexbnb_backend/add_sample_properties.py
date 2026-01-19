"""
Script to add 15 sample properties to the database
Run with: python manage.py shell < add_sample_properties.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property
from useraccount.models import User
from django.core.files import File
from django.core.files.uploadedfile import SimpleUploadedFile
import random

# Get the first user or create one
try:
    host = User.objects.first()
    if not host:
        print("No users found. Please create a user first.")
        exit()
    print(f"Using host: {host.email} (ID: {host.id})")
except Exception as e:
    print(f"Error getting user: {e}")
    exit()

# Sample property data
sample_properties = [
    {
        'title': 'Luxury Beachfront Villa',
        'description': 'Stunning oceanfront property with private beach access, infinity pool, and panoramic views.',
        'price_per_night': 450,
        'bedrooms': 5,
        'bathrooms': 4,
        'guests': 10,
        'country': 'Maldives',
        'country_code': 'MV',
        'category': 'Beach',
        'wifi': True,
        'parking': True,
        'air_conditioning': True,
        'pool': True,
        'breakfast': True,
    },
    {
        'title': 'Modern Downtown Loft',
        'description': 'Stylish loft in the heart of the city with floor-to-ceiling windows and city views.',
        'price_per_night': 180,
        'bedrooms': 2,
        'bathrooms': 2,
        'guests': 4,
        'country': 'United States',
        'country_code': 'US',
        'category': 'Top City',
        'wifi': True,
        'parking': True,
        'air_conditioning': True,
        'gym': True,
    },
    {
        'title': 'Cozy Mountain Cabin',
        'description': 'Rustic cabin nestled in the mountains with fireplace, hot tub, and hiking trails nearby.',
        'price_per_night': 220,
        'bedrooms': 3,
        'bathrooms': 2,
        'guests': 6,
        'country': 'Switzerland',
        'country_code': 'CH',
        'category': 'Rooms',
        'wifi': True,
        'parking': True,
        'hot_tub': True,
        'kitchen': True,
    },
    {
        'title': 'Tropical Paradise Bungalow',
        'description': 'Private bungalow surrounded by lush gardens, steps from pristine beaches.',
        'price_per_night': 320,
        'bedrooms': 3,
        'bathrooms': 3,
        'guests': 6,
        'country': 'Thailand',
        'country_code': 'TH',
        'category': 'Beachfront',
        'wifi': True,
        'air_conditioning': True,
        'pool': True,
        'breakfast': True,
    },
    {
        'title': 'Historic City Apartment',
        'description': 'Charming apartment in historic district with original architecture and modern amenities.',
        'price_per_night': 150,
        'bedrooms': 2,
        'bathrooms': 1,
        'guests': 4,
        'country': 'Italy',
        'country_code': 'IT',
        'category': 'Mansion',
        'wifi': True,
        'air_conditioning': True,
        'kitchen': True,
    },
    {
        'title': 'Lakeside Retreat',
        'description': 'Peaceful lakefront property with dock, kayaks, and stunning sunset views.',
        'price_per_night': 280,
        'bedrooms': 4,
        'bathrooms': 3,
        'guests': 8,
        'country': 'Canada',
        'country_code': 'CA',
        'category': 'Amazing views',
        'wifi': True,
        'parking': True,
        'kitchen': True,
        'hot_tub': True,
    },
    {
        'title': 'Desert Oasis Villa',
        'description': 'Luxurious villa in the desert with pool, spa, and breathtaking landscape views.',
        'price_per_night': 380,
        'bedrooms': 4,
        'bathrooms': 4,
        'guests': 8,
        'country': 'United Arab Emirates',
        'country_code': 'AE',
        'category': 'Artics',
        'wifi': True,
        'parking': True,
        'air_conditioning': True,
        'pool': True,
        'gym': True,
    },
    {
        'title': 'Countryside Farmhouse',
        'description': 'Authentic farmhouse with organic garden, farm animals, and countryside tranquility.',
        'price_per_night': 190,
        'bedrooms': 4,
        'bathrooms': 2,
        'guests': 8,
        'country': 'France',
        'country_code': 'FR',
        'category': 'Farms',
        'wifi': True,
        'parking': True,
        'kitchen': True,
        'pet_friendly': True,
    },
    {
        'title': 'Penthouse Suite',
        'description': 'Luxurious penthouse with rooftop terrace, jacuzzi, and 360-degree city views.',
        'price_per_night': 550,
        'bedrooms': 3,
        'bathrooms': 3,
        'guests': 6,
        'country': 'Singapore',
        'country_code': 'SG',
        'category': 'Top City',
        'wifi': True,
        'parking': True,
        'air_conditioning': True,
        'gym': True,
        'pool': True,
    },
    {
        'title': 'Seaside Cottage',
        'description': 'Charming cottage right on the beach with ocean views from every room.',
        'price_per_night': 240,
        'bedrooms': 2,
        'bathrooms': 2,
        'guests': 4,
        'country': 'Australia',
        'country_code': 'AU',
        'category': 'Beachfront',
        'wifi': True,
        'parking': True,
        'kitchen': True,
    },
    {
        'title': 'Ski Chalet',
        'description': 'Luxury chalet ski-in/ski-out with fireplace, sauna, and mountain views.',
        'price_per_night': 420,
        'bedrooms': 5,
        'bathrooms': 4,
        'guests': 10,
        'country': 'Austria',
        'country_code': 'AT',
        'category': 'Rooms',
        'wifi': True,
        'parking': True,
        'hot_tub': True,
        'kitchen': True,
    },
    {
        'title': 'Urban Studio',
        'description': 'Modern studio apartment perfect for solo travelers or couples in city center.',
        'price_per_night': 95,
        'bedrooms': 1,
        'bathrooms': 1,
        'guests': 2,
        'country': 'Japan',
        'country_code': 'JP',
        'category': 'Top City',
        'wifi': True,
        'air_conditioning': True,
    },
    {
        'title': 'Vineyard Estate',
        'description': 'Beautiful estate in wine country with vineyard tours and wine tasting included.',
        'price_per_night': 350,
        'bedrooms': 4,
        'bathrooms': 3,
        'guests': 8,
        'country': 'Spain',
        'country_code': 'ES',
        'category': 'Farms',
        'wifi': True,
        'parking': True,
        'pool': True,
        'kitchen': True,
    },
    {
        'title': 'Tropical Treehouse',
        'description': 'Unique treehouse experience in the rainforest with wildlife viewing and nature trails.',
        'price_per_night': 210,
        'bedrooms': 2,
        'bathrooms': 1,
        'guests': 4,
        'country': 'Costa Rica',
        'country_code': 'CR',
        'category': 'Amazing views',
        'wifi': True,
        'kitchen': True,
        'pet_friendly': True,
    },
    {
        'title': 'Waterfront Mansion',
        'description': 'Grand mansion on the waterfront with private dock, pool, and entertainment areas.',
        'price_per_night': 680,
        'bedrooms': 6,
        'bathrooms': 5,
        'guests': 12,
        'country': 'United Kingdom',
        'country_code': 'GB',
        'category': 'Mansion',
        'wifi': True,
        'parking': True,
        'air_conditioning': True,
        'pool': True,
        'gym': True,
        'breakfast': True,
    },
]

print("\n" + "="*60)
print("ADDING 15 SAMPLE PROPERTIES")
print("="*60 + "\n")

created_count = 0
for i, prop_data in enumerate(sample_properties, 1):
    try:
        # Create property
        property = Property.objects.create(
            Host=host,
            **prop_data
        )
        created_count += 1
        print(f"[OK] {i}. Created: {property.title}")
        print(f"   - Category: {property.category}")
        print(f"   - Price: ${property.price_per_night}/night")
        print(f"   - Location: {property.country}")
        print(f"   - ID: {property.id}")
        print()
    except Exception as e:
        print(f"[ERROR] {i}. Failed to create {prop_data['title']}: {e}")
        print()

print("="*60)
print(f"SUMMARY: Created {created_count} out of {len(sample_properties)} properties")
print(f"Total properties in database: {Property.objects.count()}")
print(f"Properties for {host.email}: {Property.objects.filter(Host=host).count()}")
print("="*60)

