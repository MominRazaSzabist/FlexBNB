'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface SearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  minRating?: number;
  minReviews?: number;
  amenities?: string[];
  checkIn?: Date | null;
  checkOut?: Date | null;
  guests?: number;
  mapBounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

interface UsePropertySearchOptions {
  hostOnly?: boolean; // If true, only fetch host's own properties
  pageSize?: number;
  autoFetch?: boolean; // Auto-fetch on mount and filter changes
}

export const usePropertySearch = (options: UsePropertySearchOptions = {}) => {
  const { hostOnly = false, pageSize = 12, autoFetch = true } = options;
  const { getToken, isSignedIn } = useAuth();
  
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sort, setSort] = useState<string>('newest');
  const [page, setPage] = useState(1);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.query) params.set("location", filters.query);
      if (filters.minPrice) params.set("min_price", String(filters.minPrice));
      if (filters.maxPrice) params.set("max_price", String(filters.maxPrice));
      if (filters.category) params.set("category", filters.category);
      if (filters.minRating) params.set("min_rating", String(filters.minRating));
      if (filters.minReviews) params.set("min_reviews", String(filters.minReviews));
      if (filters.amenities && filters.amenities.length > 0) {
        filters.amenities.forEach(amenity => {
          params.append("amenities", amenity);
        });
      }
      if (filters.checkIn) {
        params.set("check_in", filters.checkIn.toISOString().split('T')[0]);
      }
      if (filters.checkOut) {
        params.set("check_out", filters.checkOut.toISOString().split('T')[0]);
      }
      if (filters.guests) params.set("guests", String(filters.guests));
      if (filters.mapBounds) {
        params.set("min_lat", String(filters.mapBounds.minLat));
        params.set("max_lat", String(filters.mapBounds.maxLat));
        params.set("min_lng", String(filters.mapBounds.minLng));
        params.set("max_lng", String(filters.mapBounds.maxLng));
      }
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("page_size", String(pageSize));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth token if hostOnly or if user is signed in
      if (hostOnly || isSignedIn) {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const endpoint = hostOnly
        ? '/api/properties/host/search/'
        : '/api/properties/search/';

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}${endpoint}?${params.toString()}`,
        {
          headers,
          credentials: 'include',
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setProperties(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sort, page, pageSize, hostOnly, isSignedIn, getToken]);

  useEffect(() => {
    if (autoFetch) {
      fetchProperties();
    }
  }, [autoFetch, fetchProperties]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page on filter change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSort('newest');
    setPage(1);
  }, []);

  return {
    properties,
    loading,
    error,
    total,
    totalPages,
    page,
    setPage,
    filters,
    updateFilters,
    resetFilters,
    sort,
    setSort,
    fetchProperties,
    refetch: fetchProperties,
  };
};

