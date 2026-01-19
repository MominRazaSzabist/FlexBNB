# Fix "Failed to fetch" Error

## 🐛 Problem

Getting "Failed to fetch" errors when trying to fetch conversations:
- `ConversationList.tsx:71` - Failed to fetch
- `app/Host/Messages/page.tsx:85` - Failed to fetch

## 🔍 Root Causes

1. **Backend server not running** - Most common cause
2. **Missing or incorrect API host** - `NEXT_PUBLIC_API_HOST` not set
3. **Network connectivity** - Backend unreachable
4. **CORS issues** - Less likely (already configured)

## ✅ Solutions

### Solution 1: Verify Backend is Running

```bash
# Check if backend is running
cd backend/flexbnb_backend
python manage.py runserver

# Should see:
# Starting development server at http://127.0.0.1:8000/
```

**Test in browser:**
```
http://localhost:8000/api/properties/
```

Should return JSON data (not an error).

### Solution 2: Check Environment Variable

**Create/Verify `.env.local` in project root:**

```bash
# .env.local
NEXT_PUBLIC_API_HOST=http://localhost:8000
```

**Important:** 
- Must be in project root (same level as `package.json`)
- Must restart frontend server after creating/modifying
- Variable name must start with `NEXT_PUBLIC_` to be accessible in browser

### Solution 3: Restart Frontend Server

After setting environment variable:

```bash
# Stop frontend (Ctrl+C)
# Then restart
npm run dev
# or
yarn dev
```

### Solution 4: Verify API Host in Code

The code now has fallback:
```typescript
const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
```

This ensures it defaults to `http://localhost:8000` if env var is missing.

### Solution 5: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to load conversations
4. Check the failed request:
   - **URL**: Should be `http://localhost:8000/api/messaging/conversations/`
   - **Status**: Will show error (red)
   - **Error message**: Will show the actual error

## 🧪 Quick Test

### Test 1: Backend Connection
```bash
# In terminal
curl http://localhost:8000/api/properties/
```

Should return JSON (not error).

### Test 2: Frontend Environment
```javascript
// In browser console (F12)
console.log('API Host:', process.env.NEXT_PUBLIC_API_HOST);
// Should show: http://localhost:8000
```

### Test 3: Direct API Call
```javascript
// In browser console
fetch('http://localhost:8000/api/messaging/conversations/', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

## 🔧 Enhanced Error Handling

The code now includes:
- ✅ Better error logging
- ✅ API host verification
- ✅ Network error detection
- ✅ Helpful error messages
- ✅ Fallback API host

## 📋 Checklist

- [ ] Backend server running on port 8000
- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_API_HOST=http://localhost:8000` in `.env.local`
- [ ] Frontend server restarted after setting env var
- [ ] No firewall blocking localhost:8000
- [ ] Browser console shows correct API host
- [ ] Network tab shows request to correct URL

## 🚨 Common Issues

### Issue: "Failed to fetch" persists
**Check:**
1. Backend terminal - is server actually running?
2. Browser console - what's the exact error?
3. Network tab - what URL is being called?
4. `.env.local` - does it exist and have correct value?

### Issue: "CORS error"
**Solution:**
- Already configured in `settings.py`
- Verify `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`
- Restart backend after CORS changes

### Issue: "404 Not Found"
**Solution:**
- Verify URL: `/api/messaging/conversations/`
- Check backend `urls.py` includes messaging URLs
- Verify messaging app is in `INSTALLED_APPS`

### Issue: "401 Unauthorized"
**Solution:**
- User must be signed in
- Token must be valid
- Check authentication in backend logs

## ✅ After Fix

You should see in browser console:
```
[MESSAGING] Fetching conversations from: http://localhost:8000/api/messaging/conversations/?filter=all
[MESSAGING] API Host: http://localhost:8000
[MESSAGING] Token present: true
[MESSAGING] Fetched conversations: { count: 0, data: [] }
```

---

**Priority**: HIGH
**Time to Fix**: 2-5 minutes
**Impact**: Fixes all messaging fetch errors

