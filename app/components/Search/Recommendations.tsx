'use client';

import { useEffect, useState } from 'react';
import PropertyListItem from '../Properties/PropertyListItem';
import { useAuth } from '@clerk/nextjs';

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isSignedIn) {
        // If not signed in, show popular listings instead
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_HOST}/api/properties/search/?sort=rating_desc&page_size=10`,
            { credentials: 'include' }
          );
          const data = await res.json();
          setRecommendations(data.results || []);
        } catch (error) {
          console.error('Error fetching popular properties:', error);
        }
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/api/properties/recommendations/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          }
        );
        const data = await res.json();
        setRecommendations(data.results || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isSignedIn, getToken]);

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">Recommendations for you</h2>
        <div className="text-gray-500">Loading recommendations...</div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">
        {isSignedIn ? 'Recommendations for you' : 'Popular listings'}
      </h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
          {recommendations.map((property) => (
            <div key={property.id} className="flex-shrink-0 w-80">
              <PropertyListItem property={property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Recommendations;

