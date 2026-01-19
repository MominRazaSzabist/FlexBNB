'use client';

import { useEffect, useState } from "react";
import PropertyListItem from "../Properties/PropertyListItem";

interface Filters {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  minRating?: number;
  minReviews?: number;
  amenities?: string[];
  mapBounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

interface ResultsGridProps {
  query: string;
  filters: Filters;
  checkIn?: Date | null;
  checkOut?: Date | null;
  sort?: string;
  viewMode?: 'grid' | 'list';
  onPropertyHover?: (propertyId: string | null) => void;
  onPropertyClick?: (propertyId: string) => void;
  selectedPropertyId?: string | null;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ 
  query, 
  filters, 
  checkIn, 
  checkOut, 
  sort = 'newest',
  viewMode = 'grid',
  onPropertyHover,
  onPropertyClick,
  selectedPropertyId
}) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query, JSON.stringify(filters), checkIn, checkOut, sort]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (query) params.set("location", query);
        if (filters.minPrice) params.set("min_price", String(filters.minPrice));
        if (filters.maxPrice) params.set("max_price", String(filters.maxPrice));
        if (filters.category) params.set("category", filters.category);
        if (filters.minRating) params.set("min_rating", String(filters.minRating));
        
        // Review count filter
        if (filters.minReviews) params.set("min_reviews", String(filters.minReviews));
        
        // Amenities (multi-select)
        if (filters.amenities && filters.amenities.length > 0) {
          filters.amenities.forEach(amenity => {
            params.append("amenities", amenity);
          });
        }
        
        // Date filters
        if (checkIn) {
          params.set("check_in", checkIn.toISOString().split('T')[0]);
        }
        if (checkOut) {
          params.set("check_out", checkOut.toISOString().split('T')[0]);
        }
        
        // Map bounds - Only apply if explicitly set (not on initial load)
        // This prevents filtering out properties without coordinates on page load
        if (filters.mapBounds && 
            filters.mapBounds.minLat && filters.mapBounds.maxLat && 
            filters.mapBounds.minLng && filters.mapBounds.maxLng) {
          params.set("min_lat", String(filters.mapBounds.minLat));
          params.set("max_lat", String(filters.mapBounds.maxLat));
          params.set("min_lng", String(filters.mapBounds.minLng));
          params.set("max_lng", String(filters.mapBounds.maxLng));
        }
        
        params.set("sort", sort);
        params.set("page", String(page));
        params.set("page_size", "12");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/api/properties/search/?${params.toString()}`,
          { credentials: "include", signal: controller.signal }
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Debug logging
        console.log('Search API Response:', {
          url: `${process.env.NEXT_PUBLIC_API_HOST}/api/properties/search/?${params.toString()}`,
          resultsCount: data.results?.length || 0,
          total: data.total || 0,
          filters: {
            query,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            category: filters.category,
            minRating: filters.minRating,
            amenities: filters.amenities,
            mapBounds: filters.mapBounds,
          }
        });
        
        setItems(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotal(data.total || 0);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching properties:", error);
          setError(error.message || 'Failed to load properties');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [query, JSON.stringify(filters), checkIn, checkOut, sort, page]);

  return (
    <div className="space-y-6">
      {/* Results Count */}
      {!loading && !error && (
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{total}</span> properties found
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-600 font-medium">Searching properties...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load properties</h3>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button
            onClick={() => setPage(page)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or filters to see more results
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && items.length > 0 && (
        <>
          <div className={
            viewMode === 'grid'
              ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }>
            {items.map((property) => (
              <div
                key={property.id}
                onMouseEnter={() => onPropertyHover?.(property.id)}
                onMouseLeave={() => onPropertyHover?.(null)}
                onClick={() => onPropertyClick?.(property.id)}
                className={`transition-all cursor-pointer ${
                  selectedPropertyId === property.id
                    ? 'ring-2 ring-red-500 ring-offset-2 shadow-lg'
                    : ''
                }`}
              >
                <PropertyListItem property={property} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsGrid;


