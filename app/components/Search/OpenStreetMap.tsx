'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';
import Link from 'next/link';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Property {
  id: string;
  title: string;
  price_per_night: number;
  image_url: string;
  latitude?: number | string;
  longitude?: number | string;
  avg_rating?: number;
}

interface OpenStreetMapProps {
  properties: Property[];
  center: { lat: number; lng: number };
  zoom?: number;
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
  onPropertyClick?: (propertyId: string) => void;
  selectedPropertyId?: string | null;
}

// Component to handle map bounds changes
function MapBoundsHandler({ onBoundsChange }: { onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void }) {
  const map = useMap();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!onBoundsChange) return;

    // Skip initial bounds update
    const initialTimeout = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000);

    const updateBounds = () => {
      if (isInitialLoad) return;

      const bounds = map.getBounds();
      if (bounds) {
        onBoundsChange({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
        });
      }
    };

    // Debounce bounds updates
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBounds, 500);
    };

    map.on('moveend', debouncedUpdate);
    map.on('zoomend', debouncedUpdate);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(timeoutId);
      map.off('moveend', debouncedUpdate);
      map.off('zoomend', debouncedUpdate);
    };
  }, [map, onBoundsChange, isInitialLoad]);

  return null;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  properties,
  center,
  zoom = 13,
  onBoundsChange,
  onPropertyClick,
  selectedPropertyId,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Filter properties with valid coordinates
  const propertiesWithCoords = properties.filter(
    p => p.latitude && p.longitude &&
    !isNaN(parseFloat(String(p.latitude))) &&
    !isNaN(parseFloat(String(p.longitude)))
  );

  // Create custom red marker icon
  const redIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="12" fill="#EF4444" stroke="white" stroke-width="2"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const selectedIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="15" fill="#DC2626" stroke="white" stroke-width="3"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={propertiesWithCoords.length > 0 ? 10 : zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Bounds Handler */}
        {onBoundsChange && <MapBoundsHandler onBoundsChange={onBoundsChange} />}

        {/* Property Markers */}
        {propertiesWithCoords.map((property) => {
          const lat = parseFloat(String(property.latitude));
          const lng = parseFloat(String(property.longitude));

          if (isNaN(lat) || isNaN(lng)) return null;

          const isSelected = selectedPropertyId === property.id;
          const markerIcon = isSelected ? selectedIcon : redIcon;

          return (
            <Marker
              key={property.id}
              position={[lat, lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  setSelectedProperty(property);
                  onPropertyClick?.(property.id);
                },
              }}
            >
              <Popup>
                <div className="w-64 p-2">
                  <Link href={`/Properties/${property.id}`}>
                    <div className="cursor-pointer">
                      {property.image_url && (
                        <div className="relative w-full h-32 mb-2 rounded overflow-hidden">
                          <Image
                            src={property.image_url}
                            alt={property.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-sm mb-1">{property.title}</h4>
                      <p className="text-xs text-gray-600 mb-1">
                        ${property.price_per_night} per night
                      </p>
                      {property.avg_rating && (
                        <p className="text-xs text-yellow-500">
                          ⭐ {property.avg_rating}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default OpenStreetMap;

