import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property
from useraccount.models import User

print("="*60)
print("PROPERTY DATABASE CHECK")
print("="*60)

# Get all properties
props = Property.objects.all()
print(f"\nTotal Properties: {props.count()}")

# Get all users
users = User.objects.all()
print(f"Total Users: {users.count()}")

print("\n" + "-"*60)
print("PROPERTIES BY HOST:")
print("-"*60)
for prop in props:
    host_email = prop.Host.email if prop.Host else "None"
    host_id = str(prop.Host.id) if prop.Host else "None"
    print(f"  {prop.title}")
    print(f"    - Host: {host_email} (ID: {host_id})")
    print(f"    - Category: {prop.category}")
    print(f"    - Price: ${prop.price_per_night}/night")
    print()

print("-"*60)
print("USERS IN DATABASE:")
print("-"*60)
for user in users:
    prop_count = Property.objects.filter(Host=user).count()
    print(f"  {user.email} (ID: {user.id})")
    print(f"    - Properties: {prop_count}")
    print()

print("="*60)

