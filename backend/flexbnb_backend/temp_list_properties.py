import os
import django

os.environ['DJANGO_SETTINGS_MODULE'] = 'flexbnb_backend.settings'
django.setup()

from property.models import Property

print("Number of properties:", Property.objects.count())

properties = Property.objects.all()
for p in properties:
    print(f"ID: {p.id}, Title: {p.title}")