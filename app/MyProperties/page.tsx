'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import SearchBar from '../components/Search/SearchBar';
import FilterPanel, { FilterState } from '../components/Search/FilterPanel';
import PropertyListItem from '../components/Properties/PropertyListItem';

const MyPropertiesPage = () => {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
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
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchMyProperties = async () => {
      if (!isSignedIn) return;
      
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) return;

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

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/api/properties/host/search/?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!res.ok) throw new Error('Failed to fetch properties');
        const data = await res.json();
        setProperties(data.results || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, [query, minPrice, maxPrice, category, filters, sort, isSignedIn, getToken]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (newFilters.priceRange) {
      setMinPrice(newFilters.priceRange[0]);
      setMaxPrice(newFilters.priceRange[1]);
    }
  };

  return (
    <main className="max-w-[1550px] mx-auto px-4 pt-6 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Properties</h1>
        <p className="text-gray-600">Manage and search your property listings</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <SearchBar
          onSearchChange={setQuery}
          onDatesChange={() => {}}
          onPriceChange={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
          }}
          onCategoryChange={setCategory}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{total}</span> properties found
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
          >
            <option value="newest">🆕 Newest First</option>
            <option value="oldest">📅 Oldest First</option>
            <option value="price_asc">💰 Price: Low to High</option>
            <option value="price_desc">💎 Price: High to Low</option>
            <option value="rating_desc">⭐ Highest Rated</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            🔍 {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-12">
        {showFilters && (
          <div className="lg:col-span-3">
            <FilterPanel
              onFiltersChange={handleFiltersChange}
              onClearFilters={() => {
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
              }}
            />
          </div>
        )}

        <div className={showFilters ? "lg:col-span-9" : "lg:col-span-12"}>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
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
    </main>
  );
};

export default MyPropertiesPage;
