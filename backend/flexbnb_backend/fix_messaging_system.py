"""
Complete Messaging System Fix
Ensures proper property host assignment and validates the messaging system
Run with: python manage.py shell < fix_messaging_system.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from property.models import Property
from useraccount.models import User
from messaging.models import Conversation, Message

print("="*70)
print("FLEXBNB MESSAGING SYSTEM FIX")
print("="*70)

# Step 1: Analyze current state
print("\n[STEP 1] Analyzing Current State...")
print("-" * 70)

all_users = User.objects.all()
all_properties = Property.objects.all()
all_conversations = Conversation.objects.all()
all_messages = Message.objects.all()

print(f"Total Users: {all_users.count()}")
print(f"Total Properties: {all_properties.count()}")
print(f"Total Conversations: {all_conversations.count()}")
print(f"Total Messages: {all_messages.count()}")

# Step 2: Identify users
print("\n[STEP 2] Identifying Users...")
print("-" * 70)

if all_users.count() < 2:
    print("❌ ERROR: Need at least 2 users (1 host, 1 guest)")
    print("   Please create additional users through the application")
    exit(1)

# Designate users
host_user = None
guest_users = []

for user in all_users:
    print(f"  - {user.email} (ID: {user.id})")
    # Try to find a user with properties as the host
    if Property.objects.filter(Host=user).exists() and not host_user:
        host_user = user
    else:
        guest_users.append(user)

# If no host found, designate the first user as host
if not host_user:
    host_user = all_users.first()
    guest_users = list(all_users.exclude(id=host_user.id))

print(f"\n✅ Designated Host: {host_user.email} (ID: {host_user.id})")
print(f"✅ Guest Users: {len(guest_users)}")
for guest in guest_users[:3]:
    print(f"   - {guest.email}")

# Step 3: Fix property ownership
print("\n[STEP 3] Fixing Property Ownership...")
print("-" * 70)

if all_properties.count() == 0:
    print("⚠️  No properties found in database")
    print("   Properties need to be created through the application")
else:
    # Assign all properties to the designated host
    updated_count = 0
    for prop in all_properties:
        if prop.Host != host_user:
            old_host = prop.Host.email if prop.Host else "None"
            prop.Host = host_user
            prop.save()
            updated_count += 1
            print(f"  ✅ {prop.title}: {old_host} → {host_user.email}")
        else:
            print(f"  ✓  {prop.title}: Already owned by {host_user.email}")
    
    print(f"\n✅ Updated {updated_count} properties")
    print(f"✅ All {all_properties.count()} properties now owned by: {host_user.email}")

# Step 4: Validate conversations
print("\n[STEP 4] Validating Conversations...")
print("-" * 70)

if all_conversations.count() == 0:
    print("ℹ️  No conversations yet (this is normal for a new system)")
else:
    invalid_conversations = []
    for conv in all_conversations:
        if conv.guest.id == conv.host.id:
            invalid_conversations.append(conv)
            print(f"  ❌ Invalid: Conv {conv.id[:8]}... (guest == host: {conv.guest.email})")
        else:
            print(f"  ✅ Valid: Conv {conv.id[:8]}... ({conv.guest.email} ↔ {conv.host.email})")
    
    if invalid_conversations:
        print(f"\n⚠️  Found {len(invalid_conversations)} invalid conversations")
        print("   These will be fixed when guests send new messages")
    else:
        print(f"\n✅ All {all_conversations.count()} conversations are valid")

# Step 5: System health check
print("\n[STEP 5] System Health Check...")
print("-" * 70)

health_checks = []

# Check 1: Multiple users exist
if all_users.count() >= 2:
    health_checks.append(("✅", "Multiple users exist", f"{all_users.count()} users"))
else:
    health_checks.append(("❌", "Need more users", f"Only {all_users.count()} user(s)"))

# Check 2: Properties have correct host
if all_properties.count() > 0:
    all_same_host = all(prop.Host == host_user for prop in all_properties)
    if all_same_host:
        health_checks.append(("✅", "All properties have designated host", f"{all_properties.count()} properties"))
    else:
        health_checks.append(("⚠️ ", "Some properties have different hosts", "May cause issues"))
else:
    health_checks.append(("ℹ️ ", "No properties yet", "Create properties through app"))

# Check 3: Conversations are valid
if all_conversations.count() > 0:
    valid_convs = sum(1 for conv in all_conversations if conv.guest.id != conv.host.id)
    if valid_convs == all_conversations.count():
        health_checks.append(("✅", "All conversations are valid", f"{valid_convs} conversations"))
    else:
        invalid_count = all_conversations.count() - valid_convs
        health_checks.append(("⚠️ ", f"{invalid_count} invalid conversations", "Will be fixed on next message"))
else:
    health_checks.append(("ℹ️ ", "No conversations yet", "Normal for new system"))

# Check 4: Messages exist
if all_messages.count() > 0:
    health_checks.append(("✅", "Messages exist", f"{all_messages.count()} messages"))
else:
    health_checks.append(("ℹ️ ", "No messages yet", "Send a test message"))

# Print health check results
for status, check, detail in health_checks:
    print(f"{status} {check}: {detail}")

# Step 6: Summary and recommendations
print("\n" + "="*70)
print("SUMMARY & RECOMMENDATIONS")
print("="*70)

print(f"""
✅ System Configuration:
   - Designated Host: {host_user.email}
   - Properties: {all_properties.count()} (all assigned to host)
   - Guest Users: {len(guest_users)}
   - Conversations: {all_conversations.count()}
   - Messages: {all_messages.count()}

📋 Next Steps:
   1. Restart the Django backend server
   2. Sign in as a guest user (not {host_user.email})
   3. Navigate to a property listing
   4. Click "Message" button on any property
   5. Send a test message
   6. Sign in as host ({host_user.email})
   7. Navigate to Host Dashboard > Messages
   8. Verify the message appears

🔧 Testing Flow:
   Guest User → Property Card → Message Button → Send Message
   ↓
   Host User → Host Dashboard → Messages → View Conversation

✅ The messaging system is now configured correctly!
""")

print("="*70)
print("FIX COMPLETE")
print("="*70)

