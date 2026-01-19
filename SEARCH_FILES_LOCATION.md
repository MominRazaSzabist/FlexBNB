# 📍 Search & Filter Module - File Locations & Upgrade Guide

## 🗂️ File Structure

### **Main Search Page**
```
app/Search/page.tsx
```
- **Purpose**: Main orchestrator component
- **Current State**: Manages all filter state locally
- **Upgrade Opportunities**:
  - Extract state to custom hooks
  - Add URL query parameter sync
  - Improve state management
  - Add loading/error states

---

### **Search Components** (`app/components/Search/`)

#### 1. **SearchBar.tsx**
- **Purpose**: Location, dates, price, category search inputs
- **Current Features**:
  - Text search with debouncing (400ms)
  - Date range picker
  - Price range inputs
  - Category dropdown
- **Upgrade Opportunities**:
  - Add guest count selector
  - Improve date picker UX
  - Add search suggestions/autocomplete
  - Better mobile responsiveness

#### 2. **FilterPanel.tsx**
- **Purpose**: Advanced filters sidebar
- **Current Features**:
  - Amenities checkboxes (WiFi, parking, AC, etc.)
  - Rating filter (1-5 stars)
  - Price range slider
- **Upgrade Opportunities**:
  - Add review count filter
  - Add instant booking filter
  - Add cancellation policy filter
  - Add property type filter
  - Better visual design

#### 3. **ResultsGrid.tsx**
- **Purpose**: Display search results with pagination
- **Current Features**:
  - Grid layout
  - Pagination (Prev/Next)
  - Loading state
  - AbortController for request cancellation
- **Upgrade Opportunities**:
  - Add infinite scroll option
  - Add list view toggle
  - Add result count display
  - Add sorting dropdown
  - Add "Save search" feature
  - Better empty state

#### 4. **MapSearch.tsx**
- **Purpose**: Interactive map with property markers
- **Current Features**:
  - Google Maps integration
  - Property markers
  - Info windows on click
  - Map bounds filtering
- **Upgrade Opportunities**:
  - Sync with list (click marker → scroll to item)
  - Hover effects
  - Cluster markers for many properties
  - Custom marker icons
  - Map/list view toggle

#### 5. **Recommendations.tsx**
- **Purpose**: Personalized property recommendations
- **Upgrade Opportunities**:
  - Improve recommendation algorithm
  - Add "Why recommended" explanations
  - Add refresh button
  - Better loading states

#### 6. **RecentlyViewed.tsx**
- **Purpose**: Show user's recently viewed properties
- **Upgrade Opportunities**:
  - Add clear history button
  - Add "Remove from history"
  - Better date formatting
  - Limit display count

#### 7. **SavedListings.tsx**
- **Purpose**: Display user's wishlist/favorites
- **Upgrade Opportunities**:
  - Add bulk actions
  - Add share wishlist
  - Better organization

---

### **Backend API**
```
backend/flexbnb_backend/property/api.py
```
- **Search Endpoint**: `/api/properties/search/`
- **Current Features**:
  - Location search
  - Price filtering
  - Category filtering
  - Amenities filtering
  - Rating filtering
  - Map bounds filtering
  - Sorting
  - Pagination
- **Upgrade Opportunities**:
  - Add review count filtering
  - Add popularity sorting
  - Add date availability checking
  - Add full-text search
  - Add search result caching
  - Add analytics tracking

---

## 🚀 Recommended Upgrade Priorities

### **High Priority** (Core Functionality)
1. ✅ **Review Count Filter** - Add to FilterPanel & backend
2. ✅ **Popularity Sorting** - Sort by review count + rating
3. ✅ **Map-List Sync** - Click marker scrolls to item
4. ✅ **Better State Management** - Extract to custom hooks
5. ✅ **Guest Count Selector** - Add to SearchBar

### **Medium Priority** (UX Improvements)
1. **Infinite Scroll** - Alternative to pagination
2. **List/Grid Toggle** - View mode switcher
3. **Search Suggestions** - Autocomplete for locations
4. **Better Loading States** - Skeleton loaders
5. **URL State Sync** - Shareable search URLs

### **Low Priority** (Nice to Have)
1. **Save Search** - Save filter combinations
2. **Search History** - Recent searches
3. **Advanced Filters** - Instant booking, cancellation policy
4. **Map Clustering** - Group nearby markers
5. **Analytics** - Track popular searches

---

## 📝 Quick Upgrade Checklist

- [ ] Add review count filter to FilterPanel
- [ ] Add review count filter to backend API
- [ ] Add popularity sort option
- [ ] Implement map-list synchronization
- [ ] Create custom hooks for state management
- [ ] Add guest count to SearchBar
- [ ] Improve loading/error states
- [ ] Add result count display
- [ ] Add list/grid view toggle
- [ ] Add URL query parameter sync
- [ ] Improve mobile responsiveness
- [ ] Add search suggestions/autocomplete

---

## 🔧 Implementation Tips

### **State Management**
Consider creating custom hooks:
- `useSearchFilters()` - Centralized filter state
- `usePropertySearch()` - API integration
- `useMapSync()` - Map-list synchronization

### **Performance**
- Use `AbortController` for request cancellation ✅ (already implemented)
- Debounce text inputs ✅ (already implemented)
- Throttle map updates
- Implement result caching

### **UX Enhancements**
- Add skeleton loaders
- Improve empty states
- Add smooth transitions
- Better error messages
- Loading indicators

---

## 📂 File Locations Summary

```
flexbnb-master/
├── app/
│   ├── Search/
│   │   └── page.tsx                    ← Main search page
│   └── components/
│       └── Search/
│           ├── SearchBar.tsx            ← Search inputs
│           ├── FilterPanel.tsx          ← Advanced filters
│           ├── ResultsGrid.tsx           ← Results display
│           ├── MapSearch.tsx             ← Interactive map
│           ├── Recommendations.tsx      ← AI recommendations
│           ├── RecentlyViewed.tsx       ← User history
│           └── SavedListings.tsx        ← Wishlist
└── backend/
    └── flexbnb_backend/
        └── property/
            └── api.py                   ← Search API endpoint
```

---

## 🎯 Next Steps

1. **Review current implementation** - Understand existing code
2. **Prioritize upgrades** - Choose what to improve first
3. **Implement incrementally** - One feature at a time
4. **Test thoroughly** - Ensure no regressions
5. **Document changes** - Update this guide

---

**Last Updated**: 2025-12-18
**Status**: All files located and documented ✅

