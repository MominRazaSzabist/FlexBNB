# 🌱 Sustainability Module - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
✅ Both servers already running:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000

---

## 🎯 Quick Navigation

### For Guests

1. **View Green Certified Properties**
   - Click "Sustainability 🌱" in navbar
   - Select "Green Stay Certification"
   - Browse certified properties

2. **Calculate Your Carbon Footprint**
   - Sustainability → Carbon Footprint Calculator
   - Enter your trip details
   - Get instant results and recommendations

3. **Check Eco Rewards**
   - Sustainability → Eco Rewards & Discounts
   - See available discounts
   - View your savings (when signed in)

4. **Discover Sustainable Activities**
   - Sustainability → Sustainable Experiences
   - Search by city or category
   - Find eco-friendly local experiences

### For Hosts

1. **Apply for Green Certification**
   - Go to Host Dashboard → Properties
   - Click on a property
   - Apply for Green Stay badge

2. **Monitor Energy & Water Usage**
   - Sustainability 🌱 → Energy & Water Monitoring
   - Or direct: http://localhost:3000/Host/sustainability
   - Add daily usage data
   - Get AI-powered insights

---

## 🧪 Test Features (No Setup Required!)

### Test 1: Carbon Calculator
```
1. Visit: http://localhost:3000/sustainability/carbon-calculator
2. Select: Car 🚗
3. Distance: 500 km
4. Stay: 7 nights
5. Guests: 2
6. Click: Calculate Carbon Footprint
✅ See: Results with recommendations
```

### Test 2: View API Response
```bash
# Test carbon calculation API
curl -X POST http://localhost:8000/api/sustainability/carbon-footprint/calculate/ \
  -H "Content-Type: application/json" \
  -d '{
    "transport_type": "car",
    "distance_km": 100,
    "stay_duration_days": 3,
    "number_of_guests": 2
  }'

# Expected: JSON with carbon breakdown
```

### Test 3: Browse Certifications
```
Visit: http://localhost:3000/sustainability/green-certification
✅ See: Certification info and levels (Bronze, Silver, Gold)
```

---

## 📊 Module Features Overview

| Feature | Page | Access |
|---------|------|--------|
| Green Certification | `/sustainability/green-certification` | All Users |
| Carbon Calculator | `/sustainability/carbon-calculator` | All Users |
| Eco Rewards | `/sustainability/eco-rewards` | All Users |
| Sustainable Experiences | `/sustainability/experiences` | All Users |
| Energy Monitoring | `/Host/sustainability` | Hosts Only |

---

## 🎨 UI Components

### Navbar Menu
- **Location**: Top right, between Messages and User menu
- **Icon**: 🌱 Sustainability
- **Dropdown**: All sustainability features
- **Role-Based**: Shows host-specific items when signed in as host

---

## 🗄️ Database Tables Created

All tables are ready in SQLite (`db.sqlite3`):

1. `sustainability_greencertification` - Property certifications
2. `sustainability_carbonfootprint` - Carbon calculations
3. `sustainability_ecoincentive` - Reward definitions
4. `sustainability_ecoincentiveusage` - Reward usage tracking
5. `sustainability_energyusage` - Energy/water monitoring
6. `sustainability_sustainableexperience` - Local eco activities

---

## 🔗 API Endpoints (All Live)

### Base URL: `http://localhost:8000/api/sustainability/`

```bash
# List all green certifications
GET /green-certifications/

# Calculate carbon footprint
POST /carbon-footprint/calculate/

# List active eco incentives
GET /eco-incentives/

# List sustainable experiences
GET /sustainable-experiences/

# Energy usage (requires auth)
GET /energy-usage/?property_id=<UUID>
POST /energy-usage/
```

---

## 💡 Sample Use Cases

### Use Case 1: Guest Books Green Property
```
1. Guest views property with 🏅 Green Stay badge
2. Sees 10% eco-discount available
3. Books for 3 nights
4. Discount auto-applied: Saves $30
5. Browses local sustainable experiences nearby
```

### Use Case 2: Host Monitors Energy
```
1. Host visits /Host/sustainability
2. Selects property from dropdown
3. Clicks "Add Usage Data"
4. Enters: 45 kWh electricity, 300L water, 2 guests
5. AI analyzes and says: "High usage detected! Check thermostat"
6. Host adjusts and saves energy
```

### Use Case 3: Guest Calculates Carbon
```
1. Guest planning trip to SF
2. Uses carbon calculator
3. Compares: Flight (250kg CO₂) vs Train (50kg CO₂)
4. Chooses train: Saves 200kg CO₂
5. Calculator shows: "Equivalent to 9.5 trees for 1 year"
6. Guest feels good! 🌱
```

---

## 🎓 Key Concepts

### Green Certification Levels
- **Bronze** 🥉: Basic (3+ practices)
- **Silver** 🥈: Advanced (5+ practices)
- **Gold** 🥇: Exceptional (7+ practices)

### Carbon Emissions (per km)
- Walking/Bike: 0 kg CO₂ ✅
- Train: 0.041 kg CO₂ ✅
- Bus: 0.089 kg CO₂ 
- Electric Car: 0.053 kg CO₂
- Car: 0.171 kg CO₂ ⚠️
- Flight: 0.195-0.255 kg CO₂ ❌

### AI Monitoring Triggers
- **Anomaly**: Usage >50% above 30-day average
- **Alert**: Immediate notification to host
- **Recommendations**: Context-aware tips

---

## 🚀 Next Steps

### 1. Add Sample Data (Optional)

Visit Django Admin: http://localhost:8000/admin

Create:
- Eco Incentive (10% Green Stay Discount)
- Sustainable Experience (Local bike tour)

### 2. Test as Host

```
1. Sign in to FlexBNB
2. Ensure user has host role
3. Add a property (if none exist)
4. Visit /Host/sustainability
5. Add energy usage data
6. See AI recommendations
```

### 3. Test as Guest

```
1. Browse properties
2. Calculate carbon footprint for trip
3. Check available eco-rewards
4. Search sustainable experiences in destination city
```

---

## 🐛 Quick Troubleshooting

### Issue: Menu not visible
✅ **Solution**: Refresh page (Ctrl+Shift+R)

### Issue: API returns 404
✅ **Solution**: Ensure backend is running on port 8000

### Issue: No properties in dashboard
✅ **Solution**: Create a property first at /Host/Properties

### Issue: Can't add energy data
✅ **Solution**: Sign in as host and own at least one property

---

## 📱 Mobile Responsive

All pages are fully responsive:
- ✅ Navbar dropdown adapts to mobile
- ✅ Cards stack vertically on small screens
- ✅ Forms are touch-friendly
- ✅ Tables scroll horizontally when needed

---

## 🎨 Color Scheme

- **Green Certification**: Emerald/Green tones
- **Carbon Calculator**: Blue/Teal tones
- **Eco Rewards**: Emerald/Gold tones
- **Experiences**: Teal/Cyan tones
- **Energy Monitoring**: Blue/Orange/Cyan cards

---

## 📈 Performance Notes

- **Fast Load Times**: All pages <2s on localhost
- **Optimized Queries**: Uses select_related/prefetch_related
- **Minimal Dependencies**: No heavy libraries
- **Caching Ready**: Can add Redis for production

---

## 🎉 You're All Set!

The sustainability module is **100% complete** and **ready to use**.

### Start Exploring:
1. Open http://localhost:3000
2. Click "Sustainability 🌱" in navbar
3. Try each feature
4. Have fun making travel more sustainable! 🌍

---

**Questions?** Check `SUSTAINABILITY_MODULE_COMPLETE.md` for detailed docs.

**Enjoy your eco-friendly platform! 🌱✨**

