"""
Fix messaging migration conflict by manually creating tables
Run with: python fix_messaging_migrations.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from django.db import connection
from django.core.management import call_command

print("="*70)
print("FIXING MESSAGING MIGRATIONS")
print("="*70)

# Step 1: Check current state
print("\n[STEP 1] Checking current state...")
cursor = connection.cursor()

# Check if tables exist
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'messaging%'")
existing_tables = [row[0] for row in cursor.fetchall()]
print(f"Existing messaging tables: {len(existing_tables)}")
for table in existing_tables:
    print(f"  - {table}")

# Check migration history
cursor.execute("SELECT app, name FROM django_migrations WHERE app='messaging'")
migrations = cursor.fetchall()
print(f"\nMessaging migrations in history: {len(migrations)}")
for app, name in migrations:
    print(f"  - {name}")

# Step 2: Remove migration history for messaging
print("\n[STEP 2] Removing messaging migration history...")
try:
    cursor.execute("DELETE FROM django_migrations WHERE app='messaging'")
    connection.commit()
    print("  [OK] Removed messaging migration history")
except Exception as e:
    print(f"  [WARNING] Error removing history: {e}")

# Step 3: Drop ALL existing messaging tables (old and new)
print("\n[STEP 3] Dropping ALL existing messaging tables...")
# First, get all messaging tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'messaging%'")
all_messaging_tables = [row[0] for row in cursor.fetchall()]

tables_to_drop = [
    'messaging_automatedreminder',
    'messaging_notification',
    'messaging_quickreplytemplate',
    'messaging_message',
    'messaging_conversation',
    # Old table names that might exist
    'messaging_chatroom',
    'messaging_quickreply',
]

# Add any tables found in database
for table in all_messaging_tables:
    if table not in tables_to_drop:
        tables_to_drop.append(table)

for table in tables_to_drop:
    try:
        cursor.execute(f"DROP TABLE IF EXISTS {table}")
        print(f"  [OK] Dropped {table}")
    except Exception as e:
        print(f"  [WARNING] {table}: {e}")

connection.commit()

# Step 4: Create fresh migrations
print("\n[STEP 4] Creating fresh migrations...")
try:
    call_command('makemigrations', 'messaging', verbosity=1)
    print("  [OK] Migrations created")
except Exception as e:
    print(f"  [ERROR] Error creating migrations: {e}")
    print("  Try running manually: python manage.py makemigrations messaging")

# Step 5: Apply migrations
print("\n[STEP 5] Applying migrations...")
try:
    call_command('migrate', 'messaging', verbosity=1)
    print("  [OK] Migrations applied")
except Exception as e:
    print(f"  [ERROR] Error applying migrations: {e}")
    print("  Try running manually: python manage.py migrate messaging")

# Step 6: Verify tables exist
print("\n[STEP 6] Verifying tables...")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'messaging%'")
new_tables = [row[0] for row in cursor.fetchall()]
print(f"Messaging tables now: {len(new_tables)}")
for table in new_tables:
    print(f"  [OK] {table}")

if len(new_tables) == 5:
    print("\n" + "="*70)
    print("[SUCCESS] All messaging tables created!")
    print("="*70)
    print("\nNext steps:")
    print("1. Run: python fix_messaging_system.py")
    print("2. Restart backend server")
    print("3. Test messaging from guest to host")
else:
    print("\n" + "="*70)
    print("[WARNING] Not all tables created")
    print("="*70)
    print(f"Expected 5 tables, found {len(new_tables)}")
    print("You may need to run migrations manually:")
    print("  python manage.py makemigrations messaging")
    print("  python manage.py migrate messaging")

print("\n" + "="*70)

