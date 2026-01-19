# Map Provider Setup Guide

## Overview
The Flexbnb application now supports two map providers:
- **Google Maps** (default)
- **OpenStreetMap** (using Leaflet)

Users can switch between providers using the toggle button in the map interface.

## Configuration

### Environment Variables

Add to your `.env.local` file:

```env
# Map Provider Selection
# Options: 'google' or 'openstreetmap'
NEXT_PUBLIC_MAP_PROVIDER=google

# Google Maps API Key (required for Google Maps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# OpenStreetMap API Key (optional, for future tile service use)
NEXT_PUBLIC_OSM_API_KEY=EbltzbGWskMdajoyTe2t
```

### Default Behavior
- If `NEXT_PUBLIC_MAP_PROVIDER` is not set, Google Maps will be used by default
- Users can always switch providers using the toggle button in the UI

## Features

Both map providers support:
- ✅ Property markers with custom icons
- ✅ Property popups with images and details
- ✅ Map bounds filtering
- ✅ Property selection synchronization
- ✅ Interactive zoom and pan
- ✅ Responsive design

## OpenStreetMap Details

OpenStreetMap uses:
- **Library**: Leaflet (react-leaflet)
- **Tile Provider**: OpenStreetMap tiles (free, no API key required)
- **Custom Markers**: Red circles for properties, blue for selected

## Google Maps Details

Google Maps uses:
- **Library**: @react-google-maps/api
- **API Key**: Required (set in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
- **Custom Markers**: Red dots for properties, blue for selected

## Usage

### In Components

```tsx
import MapSearch from '@/app/components/Search/MapSearch';

<MapSearch
  filters={filters}
  onBoundsChange={handleBoundsChange}
  mapProvider="openstreetmap" // or "google"
  onPropertyClick={handlePropertyClick}
  selectedPropertyId={selectedId}
/>
```

### Toggle Button

The `MapProviderToggle` component is automatically included in the Search page and Home page. It appears in the top-right corner of the map.

## Switching Providers

1. **Via UI**: Click the toggle button (🗺️ Google / 🌍 OSM) in the map
2. **Via Environment**: Set `NEXT_PUBLIC_MAP_PROVIDER` in `.env.local`
3. **Via Code**: Pass `mapProvider` prop to `MapSearch` component

## Notes

- OpenStreetMap doesn't require an API key for basic usage
- The provided API key (`EbltzbGWskMdajoyTe2t`) can be used for premium tile services if needed
- Both providers maintain the same functionality and user experience
- Map state (zoom, center, bounds) is preserved when switching providers

