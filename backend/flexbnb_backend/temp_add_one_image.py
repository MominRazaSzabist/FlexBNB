import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property, PropertyImage
from django.core.exceptions import ObjectDoesNotExist
import requests
from django.core.files.base import ContentFile

# Additional image URL for Beach Hotel (replaced with a valid Pexels URL)
additional_url = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800'

# Property ID for Beach Hotel
beach_hotel_id = '1018f365-6380-47ed-ab23-756d204c56f6'

try:
    property = Property.objects.get(id=beach_hotel_id)
    response = requests.get(additional_url)
    if response.status_code == 200:
        new_image = PropertyImage(property=property)
        filename = additional_url.split('/')[-1].split('?')[0]  # Extract filename
        new_image.image.save(filename, ContentFile(response.content), save=True)
        print(f"Added image {filename} to property {property.title}")
    else:
        print(f"Failed to download {additional_url}: {response.status_code}")
except ObjectDoesNotExist:
    print(f"Property {beach_hotel_id} not found.")
except Exception as e:
    print(f"An error occurred: {str(e)}")