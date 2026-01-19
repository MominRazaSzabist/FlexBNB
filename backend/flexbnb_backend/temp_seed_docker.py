import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from useraccount.models import User
from property.models import Property, PropertyImage
from django.core.files.base import ContentFile
import requests

# Ensure a host user exists
host_email = 'host@example.com'
host_name = 'Sample Host'
try:
    host = User.objects.get(email=host_email)
    print('Existing host found.')
except User.DoesNotExist:
    host = User.objects.create_user(name=host_name, email=host_email, password='password123')
    print('Created sample host.')

# 10 hotel image URLs (Unsplash/Pexels with params to ease downloads)
image_pool = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/70441/pexels-photo-70441.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1582719508461-905c6733f2f0?auto=format&fit=crop&w=800',
    'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800',
]

properties_spec = [
    {
        'title': 'Sample Hotel',
        'description': 'A sample hotel description.',
        'price_per_night': 100,
        'bedrooms': 2,
        'bathrooms': 1,
        'guests': 4,
        'country': 'United States',
        'country_code': 'US',
        'category': 'Hotel',
        'images_count': 4,
    },
    {
        'title': 'Luxury Hotel',
        'description': 'A luxury hotel description.',
        'price_per_night': 200,
        'bedrooms': 3,
        'bathrooms': 2,
        'guests': 6,
        'country': 'United States',
        'country_code': 'US',
        'category': 'Hotel',
        'images_count': 3,
    },
    {
        'title': 'Beach Hotel',
        'description': 'A beach hotel by the sea.',
        'price_per_night': 150,
        'bedrooms': 2,
        'bathrooms': 1,
        'guests': 4,
        'country': 'United States',
        'country_code': 'US',
        'category': 'Hotel',
        'images_count': 3,
    },
]

idx = 0
for spec in properties_spec:
    prop, created = Property.objects.get_or_create(
        title=spec['title'],
        defaults={
            'description': spec['description'],
            'price_per_night': spec['price_per_night'],
            'bedrooms': spec['bedrooms'],
            'bathrooms': spec['bathrooms'],
            'guests': spec['guests'],
            'country': spec['country'],
            'country_code': spec['country_code'],
            'category': spec['category'],
            'Host': host,
        }
    )
    print(('Created property: ' if created else 'Existing property: ') + prop.title)

    # Assign or update cover image
    cover_url = image_pool[idx]
    try:
        r = requests.get(cover_url)
        if r.status_code == 200:
            filename = cover_url.split('/')[-1].split('?')[0]
            prop.image.save(filename, ContentFile(r.content), save=True)
            print(f'Updated cover image for {prop.title}: {filename}')
        else:
            print(f'Failed to download cover for {prop.title}: {r.status_code}')
    except Exception as e:
        print(f'Error downloading cover for {prop.title}: {e}')

    # Add additional gallery images
    pics_to_add = spec['images_count']
    for j in range(pics_to_add):
        url = image_pool[idx + j]
        try:
            resp = requests.get(url)
            if resp.status_code == 200:
                fname = url.split('/')[-1].split('?')[0]
                img = PropertyImage(property=prop)
                img.image.save(fname, ContentFile(resp.content), save=True)
                print(f'Added image {fname} to {prop.title}')
            else:
                print(f'Failed to download {url}: {resp.status_code}')
        except Exception as e:
            print(f'Error downloading {url}: {e}')
    idx += pics_to_add

print('Seeding complete.')