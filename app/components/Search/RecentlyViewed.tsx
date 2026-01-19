'use client';

import { useEffect, useState } from 'react';
import PropertyListItem from '../Properties/PropertyListItem';
import { useAuth } from '@clerk/nextjs';

const RecentlyViewed: React.FC = () => {
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchRecent = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/api/properties/recently-viewed/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          }
        );
        const data = await res.json();
        setRecentProperties(data.results || []);
      } catch (error) {
        console.error('Error fetching recently viewed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [isSignedIn, getToken]);

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-4">Recently viewed</h2>
        <div className="text-gray-500">Loading...</div>
      </section>
    );
  }

  if (recentProperties.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Recently viewed</h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
          {recentProperties.slice(0, 10).map((property) => (
            <div key={property.id} className="flex-shrink-0 w-80">
              <PropertyListItem property={property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;

