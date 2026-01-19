'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface SustainableExperience {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  country: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  carbon_neutral: boolean;
  community_supported: boolean;
  eco_certified: boolean;
  website: string;
  phone: string;
  email: string;
  rating: number;
  review_count: number;
  image_url: string;
  distance_from_property?: number;
}

/**
 * Sustainable Experiences Page
 * Discover local eco-friendly activities and community-supported businesses
 */
export default function SustainableExperiencesPage() {
  const [experiences, setExperiences] = useState<SustainableExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    carbon_neutral: false,
    eco_certified: false,
  });

  const categories = [
    { value: 'all', label: 'All Experiences', icon: '🌍' },
    { value: 'outdoor', label: 'Outdoor Activities', icon: '⛰️' },
    { value: 'cultural', label: 'Cultural Experiences', icon: '🎭' },
    { value: 'food', label: 'Local Food & Dining', icon: '🍽️' },
    { value: 'shopping', label: 'Sustainable Shopping', icon: '🛍️' },
    { value: 'transport', label: 'Green Transportation', icon: '🚴' },
    { value: 'education', label: 'Educational Tours', icon: '📚' },
  ];

  useEffect(() => {
    fetchExperiences();
  }, [selectedCategory, filters]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const params = new URLSearchParams();
      
      if (searchCity) params.append('city', searchCity);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (filters.carbon_neutral) params.append('carbon_neutral', 'true');
      if (filters.eco_certified) params.append('eco_certified', 'true');

      const response = await fetch(
        `${apiHost}/api/sustainability/sustainable-experiences/?${params.toString()}`,
        {
          headers: { 'Accept': 'application/json' },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      }
    } catch (error) {
      console.error('[EXPERIENCES] Error fetching:', error);
      toast.error('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExperiences();
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.icon || '🌱';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-teal-100 rounded-full mb-4">
            <span className="text-5xl">🚴</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sustainable Experiences
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover local eco-friendly activities, community-supported businesses, and sustainable experiences
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search by city..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                    selectedCategory === cat.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-teal-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.carbon_neutral}
                  onChange={(e) => setFilters({ ...filters, carbon_neutral: e.target.checked })}
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-gray-700">🌍 Carbon Neutral</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.eco_certified}
                  onChange={(e) => setFilters({ ...filters, eco_certified: e.target.checked })}
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-gray-700">✅ Eco-Certified</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading experiences...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Experiences Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search in a different city
            </p>
            <button
              onClick={() => {
                setSearchCity('');
                setSelectedCategory('all');
                setFilters({ carbon_neutral: false, eco_certified: false });
              }}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-gray-600">
                Found <span className="font-bold text-teal-600">{experiences.length}</span> sustainable experiences
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden"
                >
                  {/* Image */}
                  {exp.image_url ? (
                    <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 relative">
                      <img
                        src={exp.image_url}
                        alt={exp.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                      <span className="text-6xl">{getCategoryIcon(exp.category)}</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                        {getCategoryIcon(exp.category)} {exp.category.charAt(0).toUpperCase() + exp.category.slice(1)}
                      </span>
                      {exp.rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-900">{exp.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({exp.review_count})</span>
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{exp.name}</h3>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-3">
                      <span className="mr-2">📍</span>
                      <span className="text-sm">{exp.city}, {exp.country}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{exp.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {exp.carbon_neutral && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          🌍 Carbon Neutral
                        </span>
                      )}
                      {exp.community_supported && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          🤝 Community
                        </span>
                      )}
                      {exp.eco_certified && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                          ✅ Certified
                        </span>
                      )}
                    </div>

                    {/* Distance */}
                    {exp.distance_from_property && (
                      <div className="text-xs text-gray-500 mb-4">
                        📏 {exp.distance_from_property} km away
                      </div>
                    )}

                    {/* Contact Links */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      {exp.website && (
                        <a
                          href={exp.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
                        >
                          Visit Website
                        </a>
                      )}
                      {exp.phone && (
                        <a
                          href={`tel:${exp.phone}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        >
                          📞
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Sustainable Experiences?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="font-bold text-gray-900 mb-2">Environmental Impact</h3>
              <p className="text-gray-600 text-sm">
                Support businesses committed to reducing their carbon footprint and protecting the environment
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-bold text-gray-900 mb-2">Community Support</h3>
              <p className="text-gray-600 text-sm">
                Contribute to local economies and help preserve traditional practices and cultures
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-bold text-gray-900 mb-2">Authentic Experiences</h3>
              <p className="text-gray-600 text-sm">
                Discover unique, meaningful activities that create lasting memories and positive impact
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

