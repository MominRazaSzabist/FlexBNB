'use client';

import { useState } from "react";
import Categories from "./components/Categories";
import PropertyList from "./components/Properties/PropertyList";
import HomeSearchBar from "./components/Search/HomeSearchBar";
import SearchBar from "./components/Search/SearchBar";
import FilterPanel, { FilterState } from "./components/Search/FilterPanel";
import ResultsGrid from "./components/Search/ResultsGrid";
import MapSearch from "./components/Search/MapSearch";
import Recommendations from "./components/Search/Recommendations";
import RecentlyViewed from "./components/Search/RecentlyViewed";
import SavedListings from "./components/Search/SavedListings";
import MapProviderToggle from "./components/Search/MapProviderToggle";

export default function Home() {
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
  } | undefined>();
  const [sort, setSort] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [mapProvider, setMapProvider] = useState<'google' | 'openstreetmap'>(
    (process.env.NEXT_PUBLIC_MAP_PROVIDER as 'google' | 'openstreetmap') || 'google'
  );

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
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
    setIsSearchActive(false);
  };

  const handleMapBoundsChange = (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => {
    setMapBounds(bounds);
  };

  const handleHomeSearch = (params: {
    location: string;
    checkIn: Date | null;
    checkOut: Date | null;
    guests: number;
    category?: string;
  }) => {
    setQuery(params.location);
    setCheckIn(params.checkIn);
    setCheckOut(params.checkOut);
    setGuests(params.guests);
    if (params.category) {
      setCategory(params.category);
    }
    setIsSearchActive(true);
    // Scroll to results
    setTimeout(() => {
      const resultsSection = document.getElementById('search-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

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

  // Auto-activate search if any filters are set
  if (hasActiveFilters && !isSearchActive) {
    setIsSearchActive(true);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section with Search Bar */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 pt-32 pb-16 px-4">
        <div className="max-w-[1550px] mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Find your perfect stay
            </h1>
            <p className="text-xl text-gray-300">
              Discover unique places to stay and experiences around the world
            </p>
          </div>
          
          {/* Prominent Search Bar */}
          <HomeSearchBar onSearch={handleHomeSearch} />
        </div>
      </div>

      {/* Personalization Section - Only show when search is not active */}
      {!isSearchActive && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <Recommendations />
            <RecentlyViewed />
            <SavedListings />
          </div>
        </div>
      )}

      {/* Categories - Always visible */}
      <div className="max-w-[1550px] mx-auto px-4 pt-8">
        <Categories/>
      </div>

      {/* Search Results Section */}
      {isSearchActive ? (
        <div id="search-results" className="bg-white">
          {/* Search Controls Bar */}
          <div className="border-b border-gray-200 shadow-sm sticky top-0 z-30 bg-white">
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

            {/* Controls */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
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

                <div className="flex items-center gap-3">
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

          {/* Main Search Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
        </div>
      ) : (
        /* Default Property Listings - When no search is active */
        <div className="max-w-[1550px] mx-auto px-4 pt-6 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <PropertyList/>
          </div>
        </div>
      )}
    </main>
  );
}
