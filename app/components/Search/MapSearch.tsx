'use client';

import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import OpenStreetMap to avoid SSR issues
const OpenStreetMap = dynamic(() => import('./OpenStreetMap'), { ssr: false });

interface Property {
  id: string;
  title: string;
  price_per_night: number;
  image_url: string;
  latitude?: number | string;
  longitude?: number | string;
  avg_rating?: number;
}

interface MapSearchProps {
  properties?: Property[];
  filters?: {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    amenities?: string[];
  };
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
  mapProvider?: 'google' | 'openstreetmap';
  onPropertyClick?: (propertyId: string) => void;
  selectedPropertyId?: string | null;
}

const MapSearch: React.FC<MapSearchProps> = ({ 
  properties: propsProperties, 
  filters, 
  onBoundsChange,
  mapProvider = (process.env.NEXT_PUBLIC_MAP_PROVIDER as 'google' | 'openstreetmap') || 'google',
  onPropertyClick,
  selectedPropertyId,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [fetchedProperties, setFetchedProperties] = useState<Property[]>([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    id: 'google-map-script',
  });

  // Fetch properties if filters provided but no properties prop
  useEffect(() => {
    if (propsProperties) {
      setFetchedProperties(propsProperties);
      return;
    }

    if (!filters) return;

    const fetchProperties = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.query) params.set("location", filters.query);
        if (filters.minPrice) params.set("min_price", String(filters.minPrice));
        if (filters.maxPrice) params.set("max_price", String(filters.maxPrice));
        if (filters.category) params.set("category", filters.category);
        if (filters.amenities) {
          filters.amenities.forEach(a => params.append("amenities", a));
        }
        params.set("page_size", "50"); // Get more for map

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/api/properties/search/?${params.toString()}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setFetchedProperties(data.results || []);
      } catch (error) {
        console.error("Error fetching properties for map:", error);
      }
    };

    fetchProperties();
  }, [propsProperties, filters]);

  const properties = propsProperties || fetchedProperties;

  // Calculate center from properties or use default
  const center = useMemo(() => {
    const validProperties = properties.filter(p => p.latitude && p.longitude);
    if (validProperties.length === 0) {
      return { lat: 51.505, lng: -0.09 }; // Default center (London)
    }
    
    const avgLat = validProperties.reduce((sum, p) => sum + parseFloat(String(p.latitude || 0)), 0) / validProperties.length;
    const avgLng = validProperties.reduce((sum, p) => sum + parseFloat(String(p.longitude || 0)), 0) / validProperties.length;
    
    return { lat: avgLat, lng: avgLng };
  }, [properties]);

  // Handle map bounds change with debouncing
  const handleBoundsChanged = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (onBoundsChange && window.google?.maps) {
          // We'll use a ref or callback to get map instance
          // For now, we'll trigger bounds change from map events
        }
      }, 500);
    };
  }, [onBoundsChange]);

  // Filter properties with valid coordinates
  const propertiesWithCoords = properties.filter(
    p => p.latitude && p.longitude && 
    !isNaN(parseFloat(String(p.latitude))) && 
    !isNaN(parseFloat(String(p.longitude)))
  );

  // Use OpenStreetMap if provider is set to 'openstreetmap'
  if (mapProvider === 'openstreetmap') {
    return (
      <OpenStreetMap
        properties={properties}
        center={center}
        zoom={propertiesWithCoords.length > 0 ? 10 : 13}
        onBoundsChange={onBoundsChange}
        onPropertyClick={onPropertyClick}
        selectedPropertyId={selectedPropertyId}
      />
    );
  }

  // Google Maps fallback
  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <GoogleMap
        zoom={propertiesWithCoords.length > 0 ? 10 : 13}
        center={center}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={(map) => {
          // Set up bounds change listener
          // Only update bounds on user interaction, not on initial load
          if (map && onBoundsChange) {
            let isInitialLoad = true;
            const updateBounds = () => {
              // Skip initial bounds update to prevent filtering out all properties
              if (isInitialLoad) {
                isInitialLoad = false;
                return;
              }
              
              const bounds = map.getBounds();
              if (bounds) {
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                onBoundsChange({
                  minLat: sw.lat(),
                  maxLat: ne.lat(),
                  minLng: sw.lng(),
                  maxLng: ne.lng(),
                });
              }
            };
            
            // Debounce bounds updates
            let timeoutId: NodeJS.Timeout;
            const debouncedUpdate = () => {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(updateBounds, 500);
            };
            
            // Only listen to user interactions, not initial load
            map.addListener('dragend', debouncedUpdate);
            map.addListener('zoom_changed', debouncedUpdate);
            // Don't listen to bounds_changed on initial load
            setTimeout(() => {
              map.addListener('bounds_changed', debouncedUpdate);
            }, 2000);
          }
        }}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {propertiesWithCoords.map((property) => {
          const lat = parseFloat(String(property.latitude));
          const lng = parseFloat(String(property.longitude));
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={property.id}
              position={{ lat, lng }}
              onClick={() => {
                setSelectedProperty(property);
                onPropertyClick?.(property.id);
              }}
              icon={{
                url: selectedPropertyId === property.id
                  ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32),
              }}
            />
          );
        })}

        {selectedProperty && selectedProperty.latitude && selectedProperty.longitude && (
          <InfoWindow
            position={{
              lat: parseFloat(String(selectedProperty.latitude)),
              lng: parseFloat(String(selectedProperty.longitude)),
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="w-64 p-2">
              <Link href={`/Properties/${selectedProperty.id}`}>
                <div className="cursor-pointer">
                  {selectedProperty.image_url && (
                    <div className="relative w-full h-32 mb-2 rounded overflow-hidden">
                      <Image
                        src={selectedProperty.image_url}
                        alt={selectedProperty.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h4 className="font-semibold text-sm mb-1">{selectedProperty.title}</h4>
                  <p className="text-xs text-gray-600 mb-1">
                    ${selectedProperty.price_per_night} per night
                  </p>
                  {selectedProperty.avg_rating && (
                    <p className="text-xs text-yellow-500">
                      ⭐ {selectedProperty.avg_rating}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapSearch;

