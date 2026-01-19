"""
Script to assign all properties to the first available user or create a test user
Run with: python manage.py shell < assign_properties_to_current_user.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property
from useraccount.models import User

print("="*60)
print("ASSIGNING PROPERTIES TO USERS")
print("="*60)

# Get all users
users = User.objects.all()
print(f"\nTotal Users: {users.count()}")

if users.count() == 0:
    print("ERROR: No users found in database!")
    exit()

# Get all properties
properties = Property.objects.all()
print(f"Total Properties: {properties.count()}")

# Strategy: Assign properties to the first user with email
# This ensures properties are visible to at least one user
target_user = None
for user in users:
    if user.email and user.email != "":
        target_user = user
        break

if not target_user:
    target_user = users.first()

print(f"\nTarget User: {target_user.email} (ID: {target_user.id})")
print(f"Properties currently assigned to this user: {Property.objects.filter(Host=target_user).count()}")

# Assign all properties to target user
assigned_count = 0
for prop in properties:
    if prop.Host != target_user:
        prop.Host = target_user
        prop.save()
        assigned_count += 1
        print(f"  Assigned: {prop.title}")

print(f"\n{'='*60}")
print(f"SUMMARY:")
print(f"  - Assigned {assigned_count} properties to {target_user.email}")
print(f"  - Total properties for {target_user.email}: {Property.objects.filter(Host=target_user).count()}")
print(f"{'='*60}")

