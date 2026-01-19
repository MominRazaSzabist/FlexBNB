import os
import django

os.environ['DJANGO_SETTINGS_MODULE'] = 'flexbnb_backend.settings'
django.setup()

from useraccount.models import User
from property.models import Property, PropertyImage

# Create or get sample host
try:
    host = User.objects.get(email='host@example.com')
    print("Existing host found.")
except User.DoesNotExist:
    host = User.objects.create_user(
        name='Sample Host',
        email='host@example.com',
        password='password123'
    )
    print("Created sample host.")

# Create sample properties with multiple images
properties_data = [
    {
        'title': 'Sample Hotel',
        'price_per_night': 100,
        'image_url': 'uploads/properties/aliImgFinal.jpeg',
        'images': ['uploads/properties/aliImgFinal.jpeg', 'uploads/properties/fypI2.jpeg']
    },
    {
        'title': 'Luxury Hotel',
        'price_per_night': 200,
        'image_url': 'uploads/properties/fypI2.jpeg',
        'images': ['uploads/properties/fypI2.jpeg', 'uploads/properties/fypI3.jpeg']
    },
    {
        'title': 'Beach Hotel',
        'price_per_night': 150,
        'image_url': 'uploads/properties/fypI3.jpeg',
        'images': ['uploads/properties/fypI3.jpeg', 'uploads/properties/aliImgFinal.jpeg']
    }
]

for data in properties_data:
    prop, created = Property.objects.get_or_create(
        title=data['title'],
        defaults={
            'host': host,
            'price_per_night': data['price_per_night'],
            'image_url': data['image_url']
        }
    )
    if created:
        print(f"Created property: {prop.title}")
    else:
        print(f"Property already exists: {prop.title}")

    # Clear existing images if any (optional, for resetting)
    # PropertyImage.objects.filter(property=prop).delete()

    # Add images if not already present
    for img_path in data['images']:
        PropertyImage.objects.get_or_create(property=prop, image=img_path)

print("Sample properties and images added successfully.")