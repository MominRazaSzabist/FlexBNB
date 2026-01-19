'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import DashboardLayout from '../../components/Host/DashboardLayout';
import SearchBar from '../../components/Search/SearchBar';
import FilterPanel, { FilterState } from '../../components/Search/FilterPanel';
import ResultsGrid from '../../components/Search/ResultsGrid';
import PropertyListItem from '../../components/Properties/PropertyListItem';
import { useRouter } from 'next/navigation';

const HostPropertiesPage = () => {
  const { getToken, isSignedIn, userId } = useAuth();
  const router = useRouter();
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
  const [sort, setSort] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isSignedIn) {
      console.log('[HOST PROPERTIES] User not signed in, redirecting...');
      router.push('/');
      return;
    } else {
      console.log('[HOST PROPERTIES] User is signed in');
    }
  }, [isSignedIn, router]);

  // Listen for property added event to refresh
  useEffect(() => {
    const handlePropertyAdded = () => {
      console.log('[HOST PROPERTIES] Property added event received, refreshing...');
      // Trigger a refresh by updating a dependency
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('propertyAdded', handlePropertyAdded);
    return () => {
      window.removeEventListener('propertyAdded', handlePropertyAdded);
    };
  }, []);

  useEffect(() => {
    const fetchHostProperties = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) {
          console.error('[HOST PROPERTIES] No token available');
          return;
        }

        const params = new URLSearchParams();
        if (query) params.set("location", query);
        if (minPrice) params.set("min_price", String(minPrice));
        if (maxPrice) params.set("max_price", String(maxPrice));
        if (category) params.set("category", category);
        if (filters.minRating) params.set("min_rating", String(filters.minRating));
        if (filters.minReviews) params.set("min_reviews", String(filters.minReviews));
        if (filters.amenities && filters.amenities.length > 0) {
          filters.amenities.forEach(amenity => {
            params.append("amenities", amenity);
          });
        }
        params.set("sort", sort);
        params.set("page", "1");
        params.set("page_size", "50");

        const url = `${process.env.NEXT_PUBLIC_API_HOST}/api/properties/host/search/?${params.toString()}`;
        console.log('[HOST PROPERTIES] Fetching properties from:', url);
        console.log('[HOST PROPERTIES] Query params:', params.toString());

        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('[HOST PROPERTIES] Response status:', res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('[HOST PROPERTIES] Error response:', errorText);
          throw new Error(`Failed to fetch properties: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('[HOST PROPERTIES] Response data:', {
          results_count: data.results?.length || 0,
          total: data.total || 0,
          page: data.page || 1,
          total_pages: data.total_pages || 0,
          full_response: data,
        });
        console.log('[HOST PROPERTIES] Current user ID:', userId);

        if (data.results && Array.isArray(data.results)) {
          console.log('[HOST PROPERTIES] Properties received:', data.results.length);
          setProperties(data.results);
          setTotal(data.total || data.results.length);
          setError(null); // Clear any previous errors
        } else {
          console.warn('[HOST PROPERTIES] Unexpected response format:', data);
          setProperties([]);
          setTotal(0);
          setError('Unexpected response format from server');
        }
      } catch (error: any) {
        console.error('[HOST PROPERTIES] Error fetching host properties:', error);
        setProperties([]);
        setTotal(0);
        setError(error.message || 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      console.log('[HOST PROPERTIES] Fetching properties for signed-in user');
      fetchHostProperties();
    } else {
      console.log('[HOST PROPERTIES] User not signed in, skipping fetch');
      setLoading(false);
      setError(null);
    }
  }, [query, minPrice, maxPrice, category, filters, sort, isSignedIn, getToken, refreshTrigger]);

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
  };

  const combinedFilters = {
    minPrice,
    maxPrice,
    category,
    minRating: filters.minRating,
    minReviews: filters.minReviews,
    amenities: filters.amenities,
    mapBounds: undefined,
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <DashboardLayout title="My Properties" subtitle="Manage your listings">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{total}</span> properties found
            {process.env.NODE_ENV === 'development' && (
              <span className="ml-4 text-xs text-gray-400">
                (User ID: {userId?.substring(0, 8)}...)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="newest">🆕 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="price_asc">💰 Price: Low to High</option>
              <option value="price_desc">💎 Price: High to Low</option>
              <option value="rating_desc">⭐ Highest Rated</option>
              <option value="title_asc">🔤 Title: A-Z</option>
            </select>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
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

        {/* Main Content */}
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

          {/* Properties Grid */}
          <div className={showFilters ? "lg:col-span-9" : "lg:col-span-12"}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-4">
                  {query || minPrice || maxPrice || category || (filters.amenities && filters.amenities.length > 0)
                    ? "Try adjusting your search criteria or clear filters to see all properties"
                    : total === 0
                    ? "Get started by adding your first property"
                    : "No properties match your current filters"}
                </p>
                {total === 0 && !query && !minPrice && !maxPrice && !category && (!filters.amenities || filters.amenities.length === 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Properties are assigned to the user who created them. 
                      If you don't see any properties, you may need to:
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                      <li>Log in as the user who owns the properties</li>
                      <li>Or add a new property using "Flexbnb Your Home"</li>
                    </ul>
                    {process.env.NODE_ENV === 'development' && userId && (
                      <p className="text-xs text-blue-600 mt-2">
                        Current User ID: {userId.substring(0, 8)}...
                      </p>
                    )}
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  {(query || minPrice || maxPrice || category || (filters.amenities && filters.amenities.length > 0)) && (
                    <button
                      onClick={handleClearFilters}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // Try to open the modal if available, otherwise navigate
                      const event = new CustomEvent('openAddPropertyModal');
                      window.dispatchEvent(event);
                      setTimeout(() => {
                        router.push('/');
                      }, 100);
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Add Property
                  </button>
                </div>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-4'
              }>
                {properties.map((property) => (
                  <PropertyListItem key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HostPropertiesPage;

