# Message Send Error Troubleshooting Guide

## 🐛 Error: "Failed to send message"

This error occurs when trying to send a message from the property page using the "Message Host" button.

---

## 🔍 Step 1: Check Browser Console

Open browser DevTools (F12) and look for these logs:

### Log 1: Request Details
```
[MESSAGING] Sending message: {
  property_id: "abc-123",
  message_length: 50,
  api_host: "http://localhost:8000",
  token_present: true
}
```

**Check:**
- ✅ `api_host` should be `http://localhost:8000`
- ✅ `token_present` should be `true`
- ✅ `property_id` should be a valid UUID

### Log 2: Response Status
```
[MESSAGING] Response status: 500
```

**This tells you what went wrong:**
- `404` = Backend endpoint not found
- `401` = Authentication failed
- `403` = Permission denied
- `500` = Server error
- No status = Network error (backend not running)

### Log 3: Error Details
```
[MESSAGING] Failed to send message: {
  status: 500,
  statusText: "Internal Server Error",
  error: { error: "Property has no host assigned" },
  errorText: "...",
  url: "http://localhost:8000/api/messaging/conversations/create/"
}
```

**Check:**
- `error` object for specific error message
- `url` to verify correct endpoint

---

## 🔧 Step 2: Diagnose Based on Status Code

### Status 404 - Not Found
**Cause:** Backend endpoint doesn't exist

**Fix:**
1. Check backend URLs:
```bash
cd backend/flexbnb_backend
grep -r "conversations/create" messaging/urls.py
```

2. Verify messaging app is installed:
```python
# backend/flexbnb_backend/flexbnb_backend/settings.py
INSTALLED_APPS = [
    # ...
    'messaging',  # ← Should be here
]
```

3. Check URL pattern:
```python
# backend/flexbnb_backend/messaging/urls.py
urlpatterns = [
    path('conversations/create/', views.create_conversation, name='create_conversation'),
]
```

### Status 401 - Unauthorized
**Cause:** User not authenticated or token invalid

**Fix:**
1. Sign out and sign in again
2. Check Clerk authentication is working
3. Verify token in browser console:
```javascript
// In browser console
console.log('Token present:', !!await window.Clerk?.session?.getToken())
```

### Status 403 - Forbidden
**Cause:** User trying to message themselves OR property has no host

**Common Scenarios:**
1. **Guest is also the property host** (due to auto-assignment)
   - Backend should handle this automatically
   - Check backend logs for "WARNING: Guest is the same as property host"

2. **Property has no host assigned**
   - Check property in database:
   ```bash
   cd backend/flexbnb_backend
   python manage.py shell
   ```
   ```python
   from property.models import Property
   prop = Property.objects.get(id='YOUR_PROPERTY_ID')
   print(f"Host: {prop.Host}")  # Should not be None
   ```

**Fix:**
- Assign a host to the property
- Or use a different property that has a host

### Status 500 - Server Error
**Cause:** Backend code error or database issue

**Fix:**
1. Check backend terminal for error traceback
2. Look for Python errors like:
   - `AttributeError`
   - `IntegrityError`
   - `DoesNotExist`

3. Common issues:
   - Database migration not applied
   - Missing required fields
   - Foreign key constraint violation

### No Status - Network Error
**Cause:** Backend not running or unreachable

**Fix:**
1. Start backend:
```bash
cd backend/flexbnb_backend
python manage.py runserver
```

2. Verify backend is accessible:
```bash
curl http://localhost:8000/api/properties/
```

3. Check firewall/antivirus isn't blocking port 8000

---

## 🔧 Step 3: Check Backend Logs

When you try to send a message, backend should log:

```
[MESSAGING] ========== CREATE CONVERSATION ==========
[MESSAGING] Guest (sender): guest@example.com (ID: abc-123)
[MESSAGING] Property ID: def-456
[MESSAGING] Message length: 50
[MESSAGING] Property found: My Property (ID: def-456)
[MESSAGING] Property Host field: host@example.com
[MESSAGING] Host identified: host@example.com (ID: ghi-789)
[MESSAGING] ✅ Message created successfully!
```

**If you see errors:**
- `Property not found` → Invalid property ID
- `Property has no Host assigned` → Property.Host is None
- `Guest is the same as property host` → Auto-assignment issue
- Python traceback → Code error

---

## 🔧 Step 4: Verify Setup

### Backend Checklist
- [ ] Backend server running on port 8000
- [ ] `messaging` app in `INSTALLED_APPS`
- [ ] Migrations applied: `python manage.py migrate messaging`
- [ ] URL patterns configured correctly
- [ ] Properties have hosts assigned

### Frontend Checklist
- [ ] `.env.local` exists in project root
- [ ] `.env.local` has `NEXT_PUBLIC_API_HOST=http://localhost:8000`
- [ ] Frontend server restarted after creating `.env.local`
- [ ] User is signed in
- [ ] Browser console shows no CORS errors

---

## 🧪 Step 5: Test with cURL

Test the endpoint directly:

```bash
# Get a valid property ID
curl http://localhost:8000/api/properties/ | jq '.[0].id'

# Get your auth token (from browser DevTools → Application → Cookies)
# Look for __session cookie value

# Test message sending
curl -X POST http://localhost:8000/api/messaging/conversations/create/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": "YOUR_PROPERTY_ID",
    "message": "Test message"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "conversation": {
    "id": "...",
    "property": {...},
    "guest": {...},
    "host": {...}
  },
  "message": "Conversation created and message sent successfully"
}
```

---

## 🔍 Step 6: Common Fixes

### Fix 1: Create .env.local
```bash
# In project root
echo "NEXT_PUBLIC_API_HOST=http://localhost:8000" > .env.local
```

Then restart frontend:
```bash
# Stop frontend (Ctrl+C)
npm run dev
```

### Fix 2: Apply Migrations
```bash
cd backend/flexbnb_backend
python manage.py makemigrations
python manage.py migrate
```

### Fix 3: Assign Host to Property
```bash
cd backend/flexbnb_backend
python manage.py shell
```

```python
from property.models import Property
from useraccount.models import User

# Get a host user
host = User.objects.first()

# Assign to all properties without host
properties = Property.objects.filter(Host__isnull=True)
for prop in properties:
    prop.Host = host
    prop.save()
    print(f"Assigned {host.email} to {prop.title}")
```

### Fix 4: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

---

## 📊 Debugging Workflow

```
1. Try to send message
   ↓
2. Check browser console
   ↓
3. Note the status code
   ↓
4. Check backend terminal
   ↓
5. Follow fix for that status code
   ↓
6. Test again
```

---

## 🆘 Still Not Working?

If you've tried everything above and it still doesn't work:

1. **Share these details:**
   - Browser console logs (all 3 logs)
   - Backend terminal output
   - Status code from error
   - Property ID you're trying to message about

2. **Check these files:**
   - `backend/flexbnb_backend/messaging/urls.py`
   - `backend/flexbnb_backend/messaging/views.py`
   - `backend/flexbnb_backend/flexbnb_backend/settings.py`

3. **Try a fresh start:**
   ```bash
   # Backend
   cd backend/flexbnb_backend
   python manage.py migrate
   python manage.py runserver
   
   # Frontend (new terminal)
   cd ../../
   npm run dev
   ```

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Browser console shows: `[MESSAGING] Conversation created/message sent`
- ✅ Toast notification: "Message sent successfully!"
- ✅ Redirected to `/Messages` page
- ✅ Conversation appears in messages list
- ✅ Backend logs show: `✅ Message created successfully!`

---

**Need more help? Share the browser console logs and backend terminal output!**

