"""
Script to check which user has properties and help assign them
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property
from useraccount.models import User

print("="*60)
print("CURRENT USER PROPERTIES CHECK")
print("="*60)

# Get all users
users = User.objects.all()
print(f"\nTotal Users: {users.count()}")

print("\n" + "-"*60)
print("USERS AND THEIR PROPERTIES:")
print("-"*60)
for user in users:
    prop_count = Property.objects.filter(Host=user).count()
    props = Property.objects.filter(Host=user)[:3]
    print(f"\n{user.email} (ID: {user.id})")
    print(f"  Properties: {prop_count}")
    if props:
        print("  Sample properties:")
        for prop in props:
            print(f"    - {prop.title}")

print("\n" + "="*60)
print("RECOMMENDATION:")
print("="*60)
print("To see properties in Host Dashboard:")
print("1. Log in as the user who owns the properties")
print("2. OR run: python assign_properties_to_current_user.py")
print("   (This will assign all properties to the first user)")
print("="*60)

