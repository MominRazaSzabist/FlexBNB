'use client';

import { useState } from 'react';

interface QuickFiltersProps {
  onFilterChange: (filter: { type: string; value: any }) => void;
  activeFilters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
  };
}

const QuickFilters: React.FC<QuickFiltersProps> = ({ onFilterChange, activeFilters }) => {
  const quickFilters = [
    { label: '🏖️ Beachfront', category: 'Beachfront' },
    { label: '🏨 Hotels', category: 'Hotel' },
    { label: '🏛️ Mansions', category: 'Mansion' },
    { label: '⛺ Camping', category: 'Camping' },
    { label: '🌄 Amazing Views', category: 'Amazing views' },
    { label: '🏙️ City', category: 'Top City' },
  ];

  const priceRanges = [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200+', min: 200, max: 10000 },
  ];

  return (
    <div className="space-y-4">
      {/* Category Quick Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Property Type</h3>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.category}
              onClick={() => {
                if (activeFilters.category === filter.category) {
                  onFilterChange({ type: 'category', value: undefined });
                } else {
                  onFilterChange({ type: 'category', value: filter.category });
                }
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilters.category === filter.category
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Quick Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Range</h3>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range) => (
            <button
              key={`${range.min}-${range.max}`}
              onClick={() => {
                if (
                  activeFilters.minPrice === range.min &&
                  activeFilters.maxPrice === range.max
                ) {
                  onFilterChange({ type: 'price', value: { min: undefined, max: undefined } });
                } else {
                  onFilterChange({ type: 'price', value: { min: range.min, max: range.max } });
                }
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;

