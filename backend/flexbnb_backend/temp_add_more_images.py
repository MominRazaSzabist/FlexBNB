import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property, PropertyImage
from django.core.exceptions import ObjectDoesNotExist
import requests
from django.core.files.base import ContentFile

# List of 10 free stock hotel image URLs (from Unsplash and Pexels to avoid download issues)
image_urls = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/70441/pexels-photo-70441.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1582719508461-905c6733f2f0?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800'
]

# Property IDs
property_ids = [
    'b78e58e6-2eef-4c82-9d49-44bdad69ee4f',  # Sample Hotel - add 4 images
    '39d65c11-5607-451f-95db-ed507d96c172',  # Luxury Hotel - add 3 images
    '1018f365-6380-47ed-ab23-756d204c56f6'   # Beach Hotel - add 3 images
]

# Distribution: 4 to first, 3 to second, 3 to third
distributions = [4, 3, 3]

url_index = 0
for prop_index, prop_id in enumerate(property_ids):
    try:
        property = Property.objects.get(id=prop_id)
        num_to_add = distributions[prop_index]
        
        for _ in range(num_to_add):
            if url_index >= len(image_urls):
                break
            url = image_urls[url_index]
            response = requests.get(url)
            if response.status_code == 200:
                new_image = PropertyImage(property=property)
                filename = url.split('/')[-1].split('?')[0]  # Extract filename
                new_image.image.save(filename, ContentFile(response.content), save=True)
                print(f"Added image {filename} to property {property.title}")
            else:
                print(f"Failed to download {url}: {response.status_code}")
            url_index += 1
        
    except ObjectDoesNotExist:
        print(f"Property {prop_id} not found.")
    except Exception as e:
        print(f"An error occurred for {prop_id}: {str(e)}")