'use client';

import { useState, useEffect, useRef } from 'react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: string) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Popular locations for suggestions
  const popularLocations = [
    'New York, USA',
    'Los Angeles, USA',
    'London, UK',
    'Paris, France',
    'Tokyo, Japan',
    'Sydney, Australia',
    'Dubai, UAE',
    'Barcelona, Spain',
    'Rome, Italy',
    'Amsterdam, Netherlands',
    'Bali, Indonesia',
    'Miami, USA',
    'San Francisco, USA',
    'Berlin, Germany',
    'Bangkok, Thailand',
  ];

  useEffect(() => {
    if (value.length > 0) {
      const filtered = popularLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions(popularLocations.slice(0, 5));
      setShowSuggestions(true);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: string) => {
    onSelect(location);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((location, index) => (
            <button
              key={location}
              type="button"
              onClick={() => handleSelect(location)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-gray-50' : ''
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="font-medium">{location}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;

