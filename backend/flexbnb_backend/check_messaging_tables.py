"""Quick check for messaging tables"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flexbnb_backend.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'messaging%'")
tables = [row[0] for row in cursor.fetchall()]

print("="*60)
print("MESSAGING TABLES CHECK")
print("="*60)
print(f"\nTables found: {len(tables)}")
if tables:
    for table in tables:
        print(f"  ✅ {table}")
else:
    print("  ❌ NO MESSAGING TABLES FOUND!")
    print("\n⚠️  This is the root cause of the messaging issue!")
    print("   The messaging tables don't exist in the database.")
    print("   Follow QUICK_MESSAGING_FIX.md to fix this.")
print("="*60)

