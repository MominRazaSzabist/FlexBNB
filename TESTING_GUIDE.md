# Testing Guide - Reservation System & 403 Error Fix

## ✅ Pre-Testing Checklist

### 1. **Backend Server Status**
```bash
# Check if backend is running on port 8000
# You should see Python processes running
```

### 2. **Frontend Server Status**
```bash
# Check if Next.js is running on port 3000
# You should see Node processes running
```

### 3. **Environment Variables**
Verify these are set correctly:
- `NEXT_PUBLIC_API_HOST=http://localhost:8000` (in `.env.local`)
- `CLERK_ISSUER=https://noted-ghoul-41.clerk.accounts.dev` (in backend settings)

---

## 🧪 Step-by-Step Testing

### Step 1: Restart Backend Server

**If backend is not running or needs restart:**

```bash
# Navigate to backend directory
cd backend/flexbnb_backend

# Activate virtual environment (if using one)
# On Windows:
.\env\Scripts\Activate.ps1
# On Mac/Linux:
# source env/bin/activate

# Start Django server
python manage.py runserver
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**✅ Success Indicator:** Server starts without errors on port 8000

---

### Step 2: Restart Frontend Server (if needed)

**If frontend is not running:**

```bash
# Navigate to project root
cd "d:\client Dev\flexbnb-master"

# Start Next.js dev server
pnpm dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

**✅ Success Indicator:** Frontend accessible at http://localhost:3000

---

### Step 3: Sign In to the App

1. **Open Browser:**
   - Navigate to `http://localhost:3000`
   - Open Developer Tools (F12)

2. **Sign In:**
   - Click "Sign In" button
   - Use your Clerk credentials
   - Complete authentication

3. **Verify Authentication:**
   - Check browser console for any errors
   - Verify you see your user profile/name
   - Check Network tab - should see successful auth requests

**✅ Success Indicator:** You are signed in and can see your profile

---

### Step 4: Navigate to Property Detail Page

1. **Browse Properties:**
   - Go to home page
   - Click on any property card
   - OR navigate directly to: `http://localhost:3000/Properties/{property-id}`

2. **Verify Page Loads:**
   - Property images should display
   - Property details visible
   - Reservation sidebar visible on right

**✅ Success Indicator:** Property detail page loads completely

---

### Step 5: Select Dates and Click Reserve

1. **Select Dates:**
   - Click on "CHECK-IN" field
   - Select a check-in date from calendar
   - Click on "CHECKOUT" field
   - Select a check-out date (must be after check-in)
   - Verify price is calculated

2. **Verify Reserve Button:**
   - Button should be **enabled** (not grayed out)
   - Total price should be displayed
   - Button should show "Reserve" text

3. **Click Reserve:**
   - Click the "Reserve" button
   - Payment modal should open

**✅ Success Indicator:** Payment modal opens without errors

---

### Step 6: Complete Payment Flow

1. **Payment Modal:**
   - Enter card details (or use test data)
   - Fill in billing information
   - Click "Continue" through steps
   - Review payment details

2. **Confirmation:**
   - Click "Pay" or "Confirm"
   - Confirmation modal should appear
   - Review reservation details

3. **Final Confirm:**
   - Click "Confirm" button
   - **Watch for loading state** - button should show "Processing..."

**✅ Success Indicator:** Payment flow completes without errors

---

### Step 7: Verify Reservation Creation

**Expected Behavior:**

1. **Success Message:**
   - ✅ Toast notification: "Your booking for [Property] is confirmed!"
   - ✅ Alert dialog with reservation ID
   - ✅ Form resets (dates cleared)

2. **Check Browser Console:**
   - Should see: "Creating reservation with payload: {...}"
   - Should see: "API Response status: 201" (not 403!)
   - Should see: "Reservation created: {...}"

3. **Check Backend Terminal:**
   - Should see successful request log
   - No authentication errors
   - Reservation created in database

4. **Check Host Dashboard:**
   - Navigate to `/Host/Dashboard`
   - Should see new reservation in "Pending Requests"
   - Statistics should update

**✅ Success Indicator:** Reservation created successfully, no 403 error!

---

## 🔍 Debugging 403 Errors

### If You Still Get 403 Error:

#### 1. **Check Browser Console**

Look for these logs:
```
Creating reservation with payload: {...}
Token present: true
Token length: [number]
API Host: http://localhost:8000
API URL: http://localhost:8000/api/booking/reservations/create/
API Response status: 403
```

**What to Check:**
- ✅ Is `Token present: true`?
- ✅ Is `Token length` > 100?
- ✅ Is `API Host` correct?

#### 2. **Check Backend Terminal**

Look for these messages:
```
No Authorization header or invalid format
Token is too short or empty
Token verification failed: ...
Authentication error: ...
```

**What to Check:**
- ✅ Is token being received?
- ✅ Is token valid?
- ✅ Any authentication errors?

#### 3. **Check Network Tab**

1. Open DevTools → Network tab
2. Filter by "reservations"
3. Click on the failed request
4. Check:
   - **Request Headers:** Should have `Authorization: Bearer [token]`
   - **Response Status:** Should be 201 (not 403)
   - **Response Body:** Should have reservation data (not error)

#### 4. **Verify Authentication**

**Test Token:**
```javascript
// In browser console:
const token = await window.Clerk?.session?.getToken();
console.log('Token:', token);
console.log('Token length:', token?.length);
```

**If token is null:**
- Sign out and sign in again
- Check Clerk configuration
- Verify Clerk keys are set

---

## 🐛 Common Issues & Solutions

### Issue 1: "Token has expired"
**Solution:**
- Sign out and sign in again
- Get a fresh token

### Issue 2: "No Authorization header"
**Solution:**
- Ensure you're signed in
- Check `getToken()` is working
- Verify Clerk is initialized

### Issue 3: "Invalid token"
**Solution:**
- Check Clerk issuer URL matches your instance
- Verify Clerk keys are correct
- Try signing out/in again

### Issue 4: "Network error"
**Solution:**
- Check backend is running
- Verify `NEXT_PUBLIC_API_HOST` is correct
- Check CORS settings

### Issue 5: "Property not found"
**Solution:**
- Verify property ID is correct
- Check property exists in database
- Ensure property is accessible

---

## ✅ Success Criteria

**Reservation is successful when:**

1. ✅ No 403 error appears
2. ✅ Success message shows with reservation ID
3. ✅ Reservation appears in host dashboard
4. ✅ Browser console shows status 201
5. ✅ Backend logs show successful creation
6. ✅ Form resets after success

---

## 📊 Expected Console Output

### Browser Console (Success):
```
Creating reservation with payload: {propertyId: "...", startDate: "...", ...}
Token present: true
Token length: 500+
API Host: http://localhost:8000
API URL: http://localhost:8000/api/booking/reservations/create/
API Response status: 201
Reservation created: {id: "...", status: "pending", ...}
```

### Backend Terminal (Success):
```
POST /api/booking/reservations/create/ HTTP/1.1" 201 [timestamp]
```

### Browser Console (Error - Should NOT happen):
```
API Response status: 403
API Error: {error: "Access forbidden..."}
```

---

## 🚀 Quick Test Script

**Run this in browser console after signing in:**

```javascript
// Test authentication
const testAuth = async () => {
  const { getToken } = await import('@clerk/nextjs');
  const token = await getToken();
  console.log('✅ Token:', token ? 'Present' : 'Missing');
  console.log('✅ Token length:', token?.length || 0);
  
  // Test API call
  try {
    const res = await fetch('http://localhost:8000/api/booking/reservations/create/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId: 'test-id',
        startDate: '2024-12-20',
        endDate: '2024-12-21',
        guestsCount: 1
      })
    });
    console.log('✅ API Status:', res.status);
    const data = await res.json();
    console.log('✅ API Response:', data);
  } catch (e) {
    console.error('❌ API Error:', e);
  }
};

testAuth();
```

---

## 📝 Testing Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] Signed in with valid Clerk session
- [ ] Property detail page loads
- [ ] Dates can be selected
- [ ] Price is calculated correctly
- [ ] Reserve button is enabled
- [ ] Payment modal opens
- [ ] Payment flow completes
- [ ] Confirmation modal appears
- [ ] Reservation is created (no 403 error)
- [ ] Success message appears
- [ ] Reservation appears in host dashboard
- [ ] Browser console shows status 201
- [ ] Backend logs show success

---

## 🎯 Expected Result

**✅ SUCCESS:** Reservation created without 403 error!

**All fixes have been applied. The system should now work correctly.**

If you encounter any issues, check the debugging section above and review the console/terminal logs for specific error messages.

