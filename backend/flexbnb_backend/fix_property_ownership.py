"""
Script to assign all properties to the currently active user
This ensures properties show up in Host Dashboard
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property
from useraccount.models import User

print("="*60)
print("FIXING PROPERTY OWNERSHIP")
print("="*60)

# Get all users
users = User.objects.all()
print(f"\nTotal Users: {users.count()}")

# Get all properties
properties = Property.objects.all()
print(f"Total Properties: {properties.count()}")

# Strategy: Find the user with the most properties or first user with email
# This is likely the "main" user
target_user = None
max_properties = 0

for user in users:
    prop_count = Property.objects.filter(Host=user).count()
    print(f"  {user.email or '(no email)'}: {prop_count} properties")
    if prop_count > max_properties:
        max_properties = prop_count
        target_user = user

if not target_user:
    # Fallback: get first user with email
    for user in users:
        if user.email and user.email != "":
            target_user = user
            break

if not target_user:
    target_user = users.first()

if not target_user:
    print("ERROR: No users found in database!")
    exit()

print(f"\n{'='*60}")
print(f"TARGET USER: {target_user.email or '(no email)'} (ID: {target_user.id})")
print(f"Current properties: {Property.objects.filter(Host=target_user).count()}")
print(f"{'='*60}")

# Assign ALL properties to this user
assigned_count = 0
for prop in properties:
    if prop.Host != target_user:
        old_host = prop.Host.email if prop.Host else "None"
        prop.Host = target_user
        prop.save()
        assigned_count += 1
        print(f"  ✓ Assigned '{prop.title}' from {old_host} to {target_user.email}")

print(f"\n{'='*60}")
print(f"SUMMARY:")
print(f"  - Assigned {assigned_count} properties to {target_user.email}")
print(f"  - Total properties for {target_user.email}: {Property.objects.filter(Host=target_user).count()}")
print(f"{'='*60}")
print("\n[OK] All properties are now assigned to the target user!")
print("   Properties should now appear in Host Dashboard when logged in as this user.")
print("="*60)

