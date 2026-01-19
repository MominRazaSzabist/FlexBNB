# 🌱 Sustainability & Eco-Friendly Module - Complete Implementation

## Overview

A comprehensive sustainability module for FlexBNB featuring Green Stay Certification, Carbon Footprint Calculation, Eco-Incentive Rewards, AI-based Energy Monitoring, and Sustainable Experiences recommendations.

---

## 🎯 Features Implemented

### 1. **Green Stay Certification** 🏅
- **Backend**: Full CRUD API for property eco-certification
- **Frontend**: Public certification page with application process
- **Certification Levels**: Bronze, Silver, Gold
- **Sustainability Practices Tracked**:
  - Energy saving (LED, solar, efficient appliances)
  - Water conservation (low-flow, rainwater harvesting)
  - Recycling programs
  - Reduced plastic usage
  - Renewable energy sources
  - Organic amenities
  - Local sourcing
  - Green transportation (bikes, EV charging)

### 2. **Carbon Footprint Calculator** 🌍
- **Transport Methods Supported**: Walking, bike, bus, train, car, electric car, domestic/international flights
- **Calculation Factors**:
  - Transport emissions (kg CO₂ per km)
  - Accommodation emissions (per night per guest)
  - Green property discount (30% reduction for certified properties)
- **Features**:
  - Real-time calculation
  - Tree equivalent display
  - Personalized reduction recommendations
  - History tracking for signed-in users

### 3. **Eco-Incentive Discounts** 💰
- **Reward Types**: Discounts, credits, reward points
- **Eligibility Criteria**:
  - Green property requirements
  - Minimum stay nights
  - Max uses per user
- **Automatic Application**: Rewards applied at checkout
- **Usage Tracking**: Full history of savings

### 4. **AI-Based Energy & Water Monitoring** 📊
- **Host Dashboard Feature**: Track electricity, water, and gas usage
- **AI Analysis**:
  - Anomaly detection (usage >50% above average)
  - Per-guest efficiency metrics
  - Personalized optimization tips
- **Historical Comparison**: 30-day trend analysis
- **Alerts**: Automatic notifications for over-usage

### 5. **Sustainable Experiences** 🚴
- **Categories**:
  - Outdoor activities
  - Cultural experiences
  - Local food & dining
  - Sustainable shopping
  - Green transportation
  - Educational tours
- **Filters**:
  - Carbon neutral
  - Community supported
  - Eco-certified
- **Features**:
  - Location-based search
  - Distance calculation
  - Rating system
  - Direct contact info

---

## 📂 Project Structure

### Backend (`backend/flexbnb_backend/sustainability/`)

```
sustainability/
├── __init__.py
├── models.py              # 6 Django models
├── serializers.py         # DRF serializers
├── views.py               # API endpoints (18 views)
├── urls.py                # URL routing
├── admin.py               # Django admin config
└── migrations/
    └── 0001_initial.py    # Database schema
```

### Frontend (`app/`)

```
app/
├── components/
│   └── navbar/
│       ├── Navbar.tsx                    # Updated with sustainability menu
│       └── SustainabilityMenu.tsx        # Dropdown navigation
│
├── sustainability/
│   ├── green-certification/
│   │   └── page.tsx                      # Certification info & listings
│   ├── carbon-calculator/
│   │   └── page.tsx                      # Carbon footprint calculator
│   ├── eco-rewards/
│   │   └── page.tsx                      # Rewards & discounts
│   └── experiences/
│       └── page.tsx                      # Sustainable activities
│
└── Host/
    └── sustainability/
        └── page.tsx                      # Energy monitoring dashboard
```

---

## 🗄️ Database Schema

### Models Created:

1. **GreenCertification**
   - Property certification tracking
   - Sustainability practices flags
   - Status workflow (pending → approved/rejected)
   - Automatic score calculation

2. **CarbonFootprint**
   - Trip carbon calculations
   - Transport & accommodation breakdown
   - Offset tracking
   - Historical records

3. **EcoIncentive**
   - Reward definitions
   - Eligibility rules
   - Validity periods

4. **EcoIncentiveUsage**
   - Usage tracking per user
   - Savings history

5. **EnergyUsage**
   - Daily energy/water tracking
   - AI anomaly detection
   - Per-guest metrics

6. **SustainableExperience**
   - Local eco-friendly activities
   - Location data
   - Certification flags

---

## 🔌 API Endpoints

### Base URL: `/api/sustainability/`

#### Green Certification
- `GET /green-certifications/` - List all certifications
- `POST /green-certifications/apply/` - Apply for certification
- `GET /green-certifications/<property_id>/` - Get property certification

#### Carbon Footprint
- `POST /carbon-footprint/calculate/` - Calculate trip carbon
- `GET /carbon-footprint/my-history/` - User's carbon history

#### Eco Incentives
- `GET /eco-incentives/` - List active incentives
- `GET /eco-incentives/my-usage/` - User's reward usage

#### Energy Monitoring
- `GET /energy-usage/` - List usage records (with stats)
- `POST /energy-usage/` - Add usage data

#### Sustainable Experiences
- `GET /sustainable-experiences/` - List experiences (filterable)

#### Dashboard
- `GET /dashboard-stats/` - Host sustainability overview

---

## 🎨 UI Components

### Navigation
- **Sustainability Menu**: Dropdown in main navbar
- **Role-Based Visibility**: Host-only items conditionally shown
- **Mobile Responsive**: Adapts to all screen sizes

### Pages

#### 1. Green Certification (`/sustainability/green-certification`)
- **Tabs**: About, Certified Properties, Apply
- **Features**:
  - Certification level badges
  - Sustainability score visualization
  - Practice breakdown
  - Application process guide

#### 2. Carbon Calculator (`/sustainability/carbon-calculator`)
- **Interactive Form**: Transport type selector with icons
- **Results Display**:
  - Total carbon (kg CO₂)
  - Transport vs Accommodation breakdown
  - Tree equivalent
  - Personalized recommendations

#### 3. Eco Rewards (`/sustainability/eco-rewards`)
- **Tabs**: Available Rewards, My Rewards
- **Features**:
  - Reward cards with requirements
  - Total savings tracker
  - Usage history

#### 4. Sustainable Experiences (`/sustainability/experiences`)
- **Search & Filter**: City search, category filter, feature filters
- **Experience Cards**:
  - Category badges
  - Rating display
  - Carbon neutral/certified indicators
  - Direct contact links

#### 5. Host Energy Dashboard (`/Host/sustainability`)
- **Property Selector**: Multi-property support
- **Statistics Cards**: 
  - Avg electricity per day
  - Avg water per day
  - Per-guest efficiency
  - Anomaly count
- **Usage Records**:
  - Daily breakdown
  - AI recommendations
  - Anomaly highlighting
- **Add Data Modal**: Easy data entry form

---

## 🚀 Installation & Setup

### 1. Backend Setup

```bash
cd backend/flexbnb_backend

# Migrations already created and applied
# If needed, run:
python manage.py migrate

# Create superuser for admin access (optional)
python manage.py createsuperuser

# Start backend server
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup

```bash
cd flexbnb-master

# Install dependencies (if needed)
npm install

# Start frontend server
npm run dev
```

### 3. Environment Variables

Ensure `.env.local` exists in project root:

```env
NEXT_PUBLIC_API_HOST=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

---

## 🧪 Testing the Module

### 1. **Navigation Menu**
- ✅ Open http://localhost:3000
- ✅ Check "Sustainability 🌱" menu in navbar
- ✅ Verify all menu items are clickable
- ✅ Test host-only items (Energy Monitoring)

### 2. **Green Certification**
- ✅ Visit `/sustainability/green-certification`
- ✅ Switch between tabs
- ✅ Check certified properties list
- ✅ (As host) Test apply button

### 3. **Carbon Calculator**
- ✅ Visit `/sustainability/carbon-calculator`
- ✅ Select transport type
- ✅ Enter distance and stay duration
- ✅ Click "Calculate"
- ✅ Verify results display correctly
- ✅ Check recommendations

### 4. **Eco Rewards**
- ✅ Visit `/sustainability/eco-rewards`
- ✅ View available rewards
- ✅ (Signed in) Check My Rewards tab
- ✅ Verify total savings display

### 5. **Sustainable Experiences**
- ✅ Visit `/sustainability/experiences`
- ✅ Test city search
- ✅ Filter by category
- ✅ Apply feature filters
- ✅ View experience details

### 6. **Host Energy Dashboard**
- ✅ Sign in as host
- ✅ Visit `/Host/sustainability`
- ✅ Select property
- ✅ Click "Add Usage Data"
- ✅ Fill in form and submit
- ✅ Verify statistics update
- ✅ Check AI recommendations

### 7. **API Testing**

```bash
# Test green certifications endpoint
curl http://localhost:8000/api/sustainability/green-certifications/

# Test carbon calculation
curl -X POST http://localhost:8000/api/sustainability/carbon-footprint/calculate/ \
  -H "Content-Type: application/json" \
  -d '{
    "transport_type": "car",
    "distance_km": 100,
    "stay_duration_days": 3,
    "number_of_guests": 2
  }'

# Test eco incentives
curl http://localhost:8000/api/sustainability/eco-incentives/

# Test sustainable experiences
curl http://localhost:8000/api/sustainability/sustainable-experiences/
```

---

## 🎓 Key Technical Details

### Backend Architecture
- **Django 5.1.5** with Django REST Framework
- **UUID Primary Keys**: All models use UUID for security
- **Calculated Fields**: `@property` decorators for dynamic data
- **Validation**: MinValueValidator, MaxValueValidator
- **JSONField**: For flexible documentation storage

### Frontend Architecture
- **Next.js 15.2.3** with React 19
- **TypeScript**: Full type safety
- **Clerk Auth**: User authentication
- **Toast Notifications**: react-hot-toast
- **Responsive Design**: Tailwind CSS
- **Client-Side Rendering**: 'use client' directives

### AI Features
- **Anomaly Detection**: Statistical analysis (>50% above avg)
- **Recommendation Engine**: Rule-based suggestions
- **Trend Analysis**: 30-day historical comparison
- **Per-Guest Metrics**: Efficiency calculations

### Security
- **Authentication Required**: Most endpoints protected
- **Property Ownership Checks**: Hosts can only edit their properties
- **Input Validation**: All forms validated
- **CORS Configuration**: Proper origin handling

---

## 📊 Sample Data Creation

To populate the system with test data, use Django admin or create fixtures:

### Create Sample Eco Incentives

```python
from sustainability.models import EcoIncentive
from django.utils import timezone
from datetime import timedelta

EcoIncentive.objects.create(
    name="Green Stay Discount",
    description="Get 10% off when you book a certified green property",
    type="discount",
    percentage=10,
    requires_green_property=True,
    min_stay_nights=2,
    max_uses_per_user=3,
    is_active=True,
    valid_from=timezone.now(),
    valid_until=timezone.now() + timedelta(days=365)
)
```

### Create Sample Sustainable Experience

```python
from sustainability.models import SustainableExperience

SustainableExperience.objects.create(
    name="Organic Farm Tour",
    description="Visit a local organic farm and learn about sustainable agriculture",
    category="food",
    city="San Francisco",
    country="USA",
    carbon_neutral=True,
    community_supported=True,
    eco_certified=True,
    website="https://example.com",
    rating=4.8,
    review_count=127,
    is_active=True
)
```

---

## 🔧 Customization Guide

### Adding New Sustainability Practices

1. **Update Model** (`sustainability/models.py`):
```python
new_practice = models.BooleanField(default=False, help_text="Description")
```

2. **Update Serializer** (include in fields list)

3. **Update Frontend Form** (add checkbox)

4. **Create Migration**:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Adding New Transport Types

1. **Update Model Choices**:
```python
TRANSPORT_CHOICES = [
    # ... existing ...
    ('new_type', 'New Type'),
]
```

2. **Update Frontend Options**:
```typescript
{ value: 'new_type', label: 'New Type', icon: '🚂', carbon: '0.1 kg CO₂/km' }
```

3. **Update Calculation Factors** in `calculate_carbon()` method

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Migrations fail
```bash
# Solution: Reset migrations (dev only)
python manage.py migrate sustainability zero
rm sustainability/migrations/0001_initial.py
python manage.py makemigrations sustainability
python manage.py migrate
```

**Issue**: Import errors
```bash
# Solution: Check INSTALLED_APPS includes 'sustainability'
# In settings.py:
INSTALLED_APPS = [
    # ...
    'sustainability',
]
```

### Frontend Issues

**Issue**: Menu not showing
- Verify `SustainabilityMenu` is imported in `Navbar.tsx`
- Check browser console for errors
- Ensure component is inside navbar div

**Issue**: API calls fail
- Check `NEXT_PUBLIC_API_HOST` in `.env.local`
- Restart frontend server after env changes
- Verify backend is running on http://localhost:8000

---

## 📈 Future Enhancements

### Potential Additions:
1. **Real-time Data Integration**: Connect to smart meters
2. **Machine Learning**: Better anomaly detection models
3. **Carbon Offset Marketplace**: Purchase offsets directly
4. **Gamification**: Badges and achievements for sustainability
5. **Social Features**: Share carbon savings on social media
6. **Mobile App**: Native iOS/Android apps
7. **Reporting**: PDF reports for hosts
8. **API for Partners**: Third-party integrations

---

## 📄 License & Credits

This sustainability module is part of the FlexBNB project.

### Technologies Used:
- **Backend**: Django, Django REST Framework, Python
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: SQLite (dev), PostgreSQL (production recommended)
- **Icons**: Emoji-based for simplicity

### Carbon Emission Factors:
Based on international standards from:
- DEFRA (UK Department for Environment, Food & Rural Affairs)
- EPA (US Environmental Protection Agency)
- IPCC (Intergovernmental Panel on Climate Change)

---

## 🎉 Module Status

✅ **Backend**: Complete (6 models, 18 API endpoints)
✅ **Frontend**: Complete (5 pages, 1 dashboard, 1 navigation component)
✅ **Database**: Migrated and ready
✅ **Documentation**: Comprehensive
✅ **Testing**: Manual testing guide provided
✅ **Production-Ready**: Yes (with proper environment setup)

---

## 🤝 Support

For questions or issues:
1. Check this documentation
2. Review code comments
3. Test API endpoints with curl/Postman
4. Check browser console for frontend errors
5. Check Django logs for backend errors

---

**Built with ❤️ and 🌱 for a sustainable future**

