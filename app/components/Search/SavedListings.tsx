'use client';

import { useEffect, useState } from 'react';
import PropertyListItem from '../Properties/PropertyListItem';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

const SavedListings: React.FC = () => {
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { getToken, isSignedIn } = useAuth();

  const fetchSaved = async () => {
    if (!isSignedIn) return;

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/properties/saved/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );
      
      if (!res.ok) {
        throw new Error('Failed to fetch saved listings');
      }
      
      const data = await res.json();
      setSavedProperties(data.results || []);
    } catch (error) {
      console.error('Error fetching saved listings:', error);
      setSavedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [isSignedIn, getToken]);

  // Listen for property saved events to refresh the list
  useEffect(() => {
    const handlePropertySaved = () => {
      // Small delay to ensure backend has processed the change
      setTimeout(() => {
        fetchSaved();
      }, 500);
    };

    window.addEventListener('propertySaved', handlePropertySaved);
    return () => {
      window.removeEventListener('propertySaved', handlePropertySaved);
    };
  }, [isSignedIn, getToken]);

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-4">Saved listings</h2>
        <div className="text-gray-500">Loading...</div>
      </section>
    );
  }

  if (savedProperties.length === 0) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-4">Saved listings</h2>
        <p className="text-gray-500">You haven't saved any properties yet.</p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Saved listings</h2>
        <Link
          href="/MyReservations"
          className="text-red-500 hover:text-red-600 text-sm font-medium"
        >
          View all →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {savedProperties.map((property) => (
          <PropertyListItem key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
};

export default SavedListings;

