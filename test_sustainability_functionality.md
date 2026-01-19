# ✅ Sustainability Module - Functionality Verification

## 🧪 Manual Testing Guide

### 1. **Green Stay Certification** 🏅

**Test Steps:**
1. Open http://localhost:3000
2. Click "Sustainability 🌱" in navbar
3. Click "Green Stay Certification"
4. ✅ Should see: About Certification tab with levels (Bronze, Silver, Gold)
5. Click "Certified Properties" tab
6. ✅ Should see: List of certified properties (may be empty if none exist)
7. ✅ Should see: No errors in console

**API Test:**
```bash
curl http://localhost:8000/api/sustainability/green-certifications/
```
✅ Should return: `[]` (empty array) or list of certifications

---

### 2. **Carbon Footprint Calculator** 🌍

**Test Steps:**
1. Click "Sustainability 🌱" → "Carbon Footprint Calculator"
2. Select transport: **Car 🚗**
3. Enter distance: **100 km**
4. Enter stay duration: **3 nights**
5. Enter guests: **2**
6. Click "Calculate Carbon Footprint"
7. ✅ Should see: Results panel with:
   - Total carbon (kg CO₂)
   - Transport breakdown
   - Accommodation breakdown
   - Tree equivalent
   - Recommendations

**Expected Result:**
- Transport: ~34.2 kg CO₂ (100 km × 0.171 × 2 guests)
- Accommodation: ~120 kg CO₂ (3 nights × 20 kg × 2 guests)
- Total: ~154.2 kg CO₂
- Trees: ~7.3 trees

**API Test:**
```bash
curl -X POST http://localhost:8000/api/sustainability/carbon-footprint/calculate/ \
  -H "Content-Type: application/json" \
  -d '{"transport_type":"car","distance_km":100,"stay_duration_days":3,"number_of_guests":2}'
```

---

### 3. **Eco Rewards & Discounts** 💰

**Test Steps:**
1. Click "Sustainability 🌱" → "Eco Rewards & Discounts"
2. ✅ Should see: "Available Rewards" tab
3. ✅ Should see: List of active incentives (may be empty)
4. If signed in, click "My Rewards" tab
5. ✅ Should see: Usage history (may be empty)

**API Test:**
```bash
curl http://localhost:8000/api/sustainability/eco-incentives/
```
✅ Should return: `[]` (empty array) or list of incentives

---

### 4. **Sustainable Experiences** 🚴

**Test Steps:**
1. Click "Sustainability 🌱" → "Sustainable Experiences"
2. ✅ Should see: Search bar and category filters
3. Try searching by city (e.g., "San Francisco")
4. ✅ Should see: Filtered results or "No experiences found"
5. Try different categories
6. ✅ Should see: Results update

**API Test:**
```bash
curl http://localhost:8000/api/sustainability/sustainable-experiences/
```
✅ Should return: `[]` (empty array) or list of experiences

---

## 🔧 Quick Fixes if Issues Found

### Issue: Carbon Calculator returns 500 error

**Solution:**
1. Check backend terminal for error traceback
2. Verify Django server is running: `http://localhost:8000`
3. Check if migrations are applied: `python manage.py migrate`
4. Restart backend server

### Issue: Pages show "Failed to fetch"

**Solution:**
1. Verify `NEXT_PUBLIC_API_HOST` in `.env.local`
2. Restart frontend server
3. Check backend is running on port 8000
4. Check CORS settings in Django

### Issue: Empty lists everywhere

**Solution:**
This is **normal** - the database is empty. To add sample data:
1. Visit Django Admin: http://localhost:8000/admin
2. Sign in as superuser
3. Add sample data:
   - Eco Incentive
   - Sustainable Experience
   - Green Certification (requires a property first)

---

## ✅ Success Criteria

All features are working if:
- ✅ All 4 pages load without errors
- ✅ Carbon Calculator calculates and displays results
- ✅ API endpoints return 200 status codes
- ✅ No console errors in browser
- ✅ Navigation menu works correctly
- ✅ All links are clickable and navigate correctly

---

## 📊 Current Status

**Backend APIs:**
- ✅ Green Certifications: Working
- ✅ Eco Incentives: Working  
- ✅ Sustainable Experiences: Working
- ⚠️ Carbon Calculator: Needs verification (may need backend restart)

**Frontend Pages:**
- ✅ All pages created and accessible
- ✅ Navigation menu integrated
- ✅ API calls properly configured

---

## 🚀 Next Steps

1. **Restart Backend** (if needed):
   ```bash
   cd backend/flexbnb_backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Test Carbon Calculator**:
   - Try the calculation in browser
   - Check backend logs for errors
   - Verify response format

3. **Add Sample Data** (optional):
   - Create eco incentives via admin
   - Create sustainable experiences
   - Test with real data

---

**All core functionality is implemented and ready to test!** 🌱

