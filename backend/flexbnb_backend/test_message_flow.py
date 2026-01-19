"""Test the complete message flow from guest to host"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property
from useraccount.models import User
from messaging.models import Conversation, Message

print("="*70)
print("MESSAGE FLOW DIAGNOSTIC TEST")
print("="*70)

# Step 1: Check users
print("\n[STEP 1] Checking Users...")
users = User.objects.all()
print(f"Total users: {users.count()}")
if users.count() < 2:
    print("ERROR: Need at least 2 users (1 host, 1 guest)")
    exit(1)

for user in users:
    prop_count = Property.objects.filter(Host=user).count()
    print(f"  - {user.email} (ID: {str(user.id)[:8]}...): {prop_count} properties")

# Step 2: Check properties and hosts
print("\n[STEP 2] Checking Properties and Hosts...")
properties = Property.objects.all()
print(f"Total properties: {properties.count()}")

if properties.count() == 0:
    print("ERROR: No properties found!")
    exit(1)

# Group properties by host
host_properties = {}
for prop in properties:
    host_email = prop.Host.email if prop.Host else "None"
    if host_email not in host_properties:
        host_properties[host_email] = []
    host_properties[host_email].append(prop.title)

print("\nProperties by host:")
for host_email, prop_list in host_properties.items():
    print(f"  Host: {host_email} ({len(prop_list)} properties)")
    for prop_title in prop_list[:3]:
        print(f"    - {prop_title}")
    if len(prop_list) > 3:
        print(f"    ... and {len(prop_list) - 3} more")

# Step 3: Check conversations
print("\n[STEP 3] Checking Conversations...")
conversations = Conversation.objects.all()
print(f"Total conversations: {conversations.count()}")

if conversations.count() > 0:
    for conv in conversations[:5]:
        print(f"\n  Conversation {str(conv.id)[:8]}...")
        print(f"    Property: {conv.property.title}")
        print(f"    Guest: {conv.guest.email}")
        print(f"    Host: {conv.host.email}")
        print(f"    Messages: {conv.messages.count()}")
        
        # Check if guest == host (this is the problem!)
        if conv.guest.id == conv.host.id:
            print(f"    *** ERROR: Guest == Host! This conversation is invalid! ***")
        else:
            print(f"    OK: Guest != Host")
else:
    print("  No conversations yet (this is OK)")

# Step 4: Check messages
print("\n[STEP 4] Checking Messages...")
messages = Message.objects.all()
print(f"Total messages: {messages.count()}")

if messages.count() > 0:
    for msg in messages[:5]:
        print(f"\n  Message {str(msg.id)[:8]}...")
        print(f"    From: {msg.sender.email}")
        print(f"    To: {msg.receiver.email}")
        print(f"    Read: {msg.is_read}")
        print(f"    Content: {msg.message[:50]}...")

# Step 5: Identify the problem
print("\n" + "="*70)
print("DIAGNOSIS")
print("="*70)

# Check for guest == host issue
problem_found = False

# Check conversations
invalid_convs = [c for c in conversations if c.guest.id == c.host.id]
if invalid_convs:
    print(f"\n*** PROBLEM FOUND: {len(invalid_convs)} invalid conversations ***")
    print("   Guest and Host are the same user!")
    print("   This happens when properties are auto-assigned to guests.")
    problem_found = True

# Check if all properties have same host
if len(host_properties) == 1:
    host_email = list(host_properties.keys())[0]
    print(f"\n*** POTENTIAL ISSUE: All properties owned by one host ***")
    print(f"   Host: {host_email}")
    print("   If a guest tries to message, they might be the same as host.")
    problem_found = True

# Check if we have a clear host/guest separation
if users.count() >= 2:
    # Find a user with properties (host)
    host_user = None
    for user in users:
        if Property.objects.filter(Host=user).exists():
            host_user = user
            break
    
    if host_user:
        guest_users = [u for u in users if u.id != host_user.id]
        print(f"\nRecommended setup:")
        print(f"  Host: {host_user.email}")
        print(f"  Guests: {', '.join([u.email for u in guest_users[:3]])}")
        if len(guest_users) > 3:
            print(f"  ... and {len(guest_users) - 3} more guests")
    else:
        print(f"\n*** PROBLEM: No user has properties assigned! ***")
        problem_found = True

if not problem_found:
    print("\nSystem looks OK! The issue might be:")
    print("  1. Frontend not sending requests correctly")
    print("  2. Backend endpoint not being called")
    print("  3. Authentication issues")
    print("  4. CORS issues")

print("\n" + "="*70)
print("RECOMMENDATIONS")
print("="*70)

if invalid_convs:
    print("\n1. Fix invalid conversations:")
    print("   - Delete conversations where guest == host")
    print("   - Or reassign properties to correct hosts")

if len(host_properties) == 1:
    print("\n2. Ensure property host assignment:")
    print("   - Run: python fix_messaging_system.py")
    print("   - This will assign properties to a designated host")

print("\n3. Test the flow:")
print("   - Sign in as guest (NOT the property host)")
print("   - Click Message on a property")
print("   - Check backend logs for [MESSAGING] messages")
print("   - Sign in as host and check /Host/Messages")

print("\n" + "="*70)

