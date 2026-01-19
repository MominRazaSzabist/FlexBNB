import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property, PropertyImage
from django.core.exceptions import ObjectDoesNotExist
import requests
from django.core.files.base import ContentFile

try:
    # Get the property
    property = Property.objects.get(id='b78e58e6-2eef-4c82-9d49-44bdad69ee4f')
    
    # Find and delete the incorrect image
    try:
        incorrect_image = PropertyImage.objects.get(property=property, image__contains='aliImgFinal.jpeg')
        incorrect_image.delete()
        print("Incorrect image deleted successfully.")
    except ObjectDoesNotExist:
        print("Incorrect image not found.")
    
    # Add the new image by downloading from URL
    new_image_url = 'https://cdn.pixabay.com/photo/2016/10/18/09/02/hotel-1749602_1280.jpg'
    response = requests.get(new_image_url)
    if response.status_code == 200:
        new_image = PropertyImage(property=property)
        new_image.image.save('luxury_hotel.jpg', ContentFile(response.content), save=True)
        print("New image added successfully.")
    else:
        print(f"Failed to download new image: {response.status_code}")
    
except ObjectDoesNotExist:
    print("Property not found.")
except Exception as e:
    print(f"An error occurred: {str(e)}")