'use client';

import { useState } from "react";
import SearchBar from "@/app/components/Search/SearchBar";
import FilterPanel, { FilterState } from "@/app/components/Search/FilterPanel";
import ResultsGrid from "@/app/components/Search/ResultsGrid";
import MapSearch from "@/app/components/Search/MapSearch";
import Recommendations from "@/app/components/Search/Recommendations";
import RecentlyViewed from "@/app/components/Search/RecentlyViewed";
import SavedListings from "@/app/components/Search/SavedListings";
import QuickFilters from "@/app/components/Search/QuickFilters";
import MapProviderToggle from "@/app/components/Search/MapProviderToggle";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [filters, setFilters] = useState<FilterState>({
    amenities: [],
    minRating: undefined,
    minReviews: undefined,
    priceRange: undefined,
  });
  const [mapBounds, setMapBounds] = useState<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | undefined>(undefined); // Start with undefined to show all properties
  const [sort, setSort] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [mapProvider, setMapProvider] = useState<'google' | 'openstreetmap'>(
    (process.env.NEXT_PUBLIC_MAP_PROVIDER as 'google' | 'openstreetmap') || 'google'
  );

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Update price range from filter panel
    if (newFilters.priceRange) {
      setMinPrice(newFilters.priceRange[0]);
      setMaxPrice(newFilters.priceRange[1]);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      amenities: [],
      minRating: undefined,
      minReviews: undefined,
      priceRange: undefined,
    });
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCategory(undefined);
    setQuery("");
    setCheckIn(null);
    setCheckOut(null);
  };

  const handleMapBoundsChange = (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => {
    setMapBounds(bounds);
  };

  // Combine all filter states for ResultsGrid
  const combinedFilters = {
    minPrice,
    maxPrice,
    category,
    minRating: filters.minRating,
    minReviews: filters.minReviews,
    amenities: filters.amenities,
    mapBounds,
  };

  const hasActiveFilters = query || minPrice || maxPrice || category || 
    filters.minRating || filters.minReviews || filters.amenities.length > 0 || 
    checkIn || checkOut;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Personalization Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <Recommendations />
          <RecentlyViewed />
          <SavedListings />
        </div>
      </div>

      {/* Search Bar - Sticky */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar
            onSearchChange={setQuery}
            onDatesChange={(checkIn, checkOut) => {
              setCheckIn(checkIn);
              setCheckOut(checkOut);
            }}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            onCategoryChange={setCategory}
            onGuestsChange={setGuests}
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <QuickFilters
            onFilterChange={(filter) => {
              if (filter.type === 'category') {
                setCategory(filter.value);
              } else if (filter.type === 'price') {
                setMinPrice(filter.value.min);
                setMaxPrice(filter.value.max);
                setFilters(prev => ({
                  ...prev,
                  priceRange: filter.value.min && filter.value.max 
                    ? [filter.value.min, filter.value.max] 
                    : undefined
                }));
              }
            }}
            activeFilters={{
              category,
              minPrice,
              maxPrice,
              amenities: filters.amenities,
            }}
          />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left: Clear filters */}
            <div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  ✕ Clear all filters
                </button>
              )}
            </div>

            {/* Right: Sort & View Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent font-medium"
              >
                <option value="newest">🆕 Newest First</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
                <option value="rating_desc">⭐ Highest Rated</option>
                <option value="popular">🔥 Most Popular</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid view"
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  ☰
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                🔍 {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        <div className="grid gap-6 lg:grid-cols-12">
          {/* Filter Panel */}
          {showFilters && (
            <div className="lg:col-span-3">
              <FilterPanel
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}

          {/* Results Grid */}
          <div className={showFilters ? "lg:col-span-5" : "lg:col-span-8"}>
            <ResultsGrid
              query={query}
              filters={combinedFilters}
              checkIn={checkIn}
              checkOut={checkOut}
              sort={sort}
              viewMode={viewMode}
              onPropertyHover={setHoveredPropertyId}
              onPropertyClick={setSelectedPropertyId}
              selectedPropertyId={selectedPropertyId}
            />
          </div>

          {/* Map */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 h-[calc(100vh-8rem)] rounded-xl overflow-hidden shadow-lg relative">
              <MapProviderToggle
                currentProvider={mapProvider}
                onProviderChange={setMapProvider}
              />
              <MapSearch
                filters={{
                  query,
                  minPrice,
                  maxPrice,
                  category,
                  amenities: filters.amenities,
                }}
                onBoundsChange={handleMapBoundsChange}
                mapProvider={mapProvider}
                onPropertyClick={setSelectedPropertyId}
                selectedPropertyId={selectedPropertyId}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SearchPage;
