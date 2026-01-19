'use client';

import { useState } from 'react';

interface FilterPanelProps {
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export interface FilterState {
  amenities: string[];
  minRating: number | undefined;
  minReviews: number | undefined;
  priceRange: [number, number] | undefined;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange, onClearFilters }) => {
  const [amenities, setAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [minReviews, setMinReviews] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  const amenityOptions = [
    { value: 'wifi', label: 'WiFi', icon: '📶' },
    { value: 'parking', label: 'Parking', icon: '🅿️' },
    { value: 'ac', label: 'Air Conditioning', icon: '❄️' },
    { value: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { value: 'kitchen', label: 'Kitchen', icon: '🍴' },
    { value: 'pool', label: 'Pool', icon: '🏊' },
    { value: 'hot_tub', label: 'Hot Tub', icon: '🛁' },
    { value: 'gym', label: 'Gym', icon: '💪' },
    { value: 'pet_friendly', label: 'Pet Friendly', icon: '🐕' },
  ];

  const handleAmenityToggle = (value: string) => {
    const newAmenities = amenities.includes(value)
      ? amenities.filter(a => a !== value)
      : [...amenities, value];
    setAmenities(newAmenities);
    updateFilters({ amenities: newAmenities, minRating, minReviews, priceRange: [minPrice, maxPrice] });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = minRating === rating ? undefined : rating;
    setMinRating(newRating);
    updateFilters({ amenities, minRating: newRating, minReviews, priceRange: [minPrice, maxPrice] });
  };

  const handleReviewsChange = (reviews: number | undefined) => {
    setMinReviews(reviews);
    updateFilters({ amenities, minRating, minReviews: reviews, priceRange: [minPrice, maxPrice] });
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
    updateFilters({ amenities, minRating, minReviews, priceRange: [type === 'min' ? value : minPrice, type === 'max' ? value : maxPrice] });
  };

  const updateFilters = (newFilters: FilterState) => {
    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    setAmenities([]);
    setMinRating(undefined);
    setMinReviews(undefined);
    setMinPrice(0);
    setMaxPrice(1000);
    onClearFilters();
  };

  const hasActiveFilters = amenities.length > 0 || minRating !== undefined || minReviews !== undefined || minPrice > 0 || maxPrice < 1000;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200 pb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Price Range (per night)
        </label>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => handlePriceChange('min', parseInt(e.target.value) || 0)}
            />
          </div>
          <span className="text-gray-400">—</span>
          <div className="flex-1">
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => handlePriceChange('max', parseInt(e.target.value) || 1000)}
            />
          </div>
        </div>
        <div className="text-center text-sm text-gray-600 font-medium">
          ${minPrice} - ${maxPrice}
        </div>
      </div>

      {/* Amenities */}
      <div className="border-b border-gray-200 pb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Amenities
        </label>
        <div className="grid grid-cols-2 gap-2">
          {amenityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAmenityToggle(option.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                amenities.includes(option.value)
                  ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <span className="text-base">{option.icon}</span>
              <span className="text-xs font-medium truncate">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="border-b border-gray-200 pb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Minimum Rating
        </label>
        <div className="flex gap-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`flex-1 px-2 py-2 rounded-lg border text-sm font-medium transition-all ${
                minRating === rating
                  ? 'bg-yellow-50 border-yellow-500 text-yellow-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {rating}+ ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Review Count Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Minimum Reviews
        </label>
        <select
          value={minReviews || ''}
          onChange={(e) => handleReviewsChange(e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
        >
          <option value="">Any number</option>
          <option value="3">3+ reviews</option>
          <option value="5">5+ reviews</option>
          <option value="10">10+ reviews</option>
          <option value="20">20+ reviews</option>
          <option value="50">50+ reviews</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;

