'use client';

import { useState, useEffect } from 'react';

interface MapProviderToggleProps {
  currentProvider: 'google' | 'openstreetmap';
  onProviderChange: (provider: 'google' | 'openstreetmap') => void;
}

const MapProviderToggle: React.FC<MapProviderToggleProps> = ({
  currentProvider,
  onProviderChange,
}) => {
  return (
    <div className="absolute top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex gap-1">
      <button
        onClick={() => onProviderChange('google')}
        className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
          currentProvider === 'google'
            ? 'bg-red-500 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Google Maps"
      >
        🗺️ Google
      </button>
      <button
        onClick={() => onProviderChange('openstreetmap')}
        className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
          currentProvider === 'openstreetmap'
            ? 'bg-red-500 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="OpenStreetMap"
      >
        🌍 OSM
      </button>
    </div>
  );
};

export default MapProviderToggle;

