'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';

interface EcoIncentive {
  id: string;
  name: string;
  description: string;
  type: string;
  value: number;
  percentage: number | null;
  requires_green_property: boolean;
  min_stay_nights: number;
  max_uses_per_user: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
}

interface IncentiveUsage {
  id: string;
  incentive_name: string;
  property_title: string;
  amount_saved: number;
  used_at: string;
}

interface UsageSummary {
  usage_history: IncentiveUsage[];
  total_saved: number;
  total_uses: number;
}

/**
 * Eco Rewards & Discounts Page
 * Shows available eco-incentives and user's savings history
 */
export default function EcoRewardsPage() {
  const { getToken, isSignedIn } = useAuth();
  const [incentives, setIncentives] = useState<EcoIncentive[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'my-rewards'>('available');

  useEffect(() => {
    fetchIncentives();
    if (isSignedIn) {
      fetchMyUsage();
    }
  }, [isSignedIn]);

  const fetchIncentives = async () => {
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const response = await fetch(`${apiHost}/api/sustainability/eco-incentives/`, {
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setIncentives(data);
      }
    } catch (error) {
      console.error('[ECO REWARDS] Error fetching incentives:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyUsage = async () => {
    try {
      const token = await getToken();
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const response = await fetch(`${apiHost}/api/sustainability/eco-incentives/my-usage/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('[ECO REWARDS] Error fetching usage:', error);
    }
  };

  const getIncentiveIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return '💰';
      case 'credit':
        return '🎁';
      case 'reward_points':
        return '⭐';
      default:
        return '🌱';
    }
  };

  const getIncentiveValue = (incentive: EcoIncentive) => {
    if (incentive.percentage) {
      return `${incentive.percentage}% OFF`;
    }
    return `$${incentive.value}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
            <span className="text-5xl">💰</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Eco Rewards & Discounts
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Save money while traveling sustainably. Get exclusive rewards for choosing eco-friendly properties and practices.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'available'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Available Rewards ({incentives.length})
          </button>
          {isSignedIn && (
            <button
              onClick={() => setActiveTab('my-rewards')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'my-rewards'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-emerald-50'
              }`}
            >
              My Rewards
            </button>
          )}
        </div>

        {/* Available Rewards Tab */}
        {activeTab === 'available' && (
          <div>
            {/* Summary Stats */}
            {isSignedIn && usage && (
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-8 text-white mb-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">${usage.total_saved.toFixed(2)}</div>
                    <div className="text-emerald-100">Total Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{usage.total_uses}</div>
                    <div className="text-emerald-100">Rewards Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{incentives.length}</div>
                    <div className="text-emerald-100">Available Now</div>
                  </div>
                </div>
              </div>
            )}

            {/* Incentives Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading rewards...</p>
              </div>
            ) : incentives.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Rewards</h3>
                <p className="text-gray-600">Check back soon for new eco-friendly incentives!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incentives.map((incentive) => (
                  <div
                    key={incentive.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition border-2 border-emerald-100 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-4xl">{getIncentiveIcon(incentive.type)}</span>
                        <div className="bg-white text-emerald-600 px-3 py-1 rounded-full text-sm font-bold">
                          {getIncentiveValue(incentive)}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold">{incentive.name}</h3>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{incentive.description}</p>

                      {/* Requirements */}
                      <div className="space-y-2 mb-4">
                        {incentive.requires_green_property && (
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="mr-2">🏅</span>
                            <span>Green certified properties only</span>
                          </div>
                        )}
                        {incentive.min_stay_nights > 1 && (
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="mr-2">📅</span>
                            <span>Minimum {incentive.min_stay_nights} nights</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="mr-2">🔄</span>
                          <span>Use up to {incentive.max_uses_per_user} time{incentive.max_uses_per_user > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Validity */}
                      <div className="text-xs text-gray-500 border-t pt-3">
                        Valid until {new Date(incentive.valid_until).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-emerald-50 px-6 py-3 text-center">
                      <p className="text-sm font-medium text-emerald-700">
                        Applied automatically at checkout
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Rewards Tab */}
        {activeTab === 'my-rewards' && isSignedIn && usage && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Rewards History</h2>

            {usage.usage_history.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Rewards Used Yet</h3>
                <p className="text-gray-600 mb-6">
                  Book an eco-friendly property to start earning and using rewards!
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
                >
                  View Available Rewards
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {usage.usage_history.map((record) => (
                  <div
                    key={record.id}
                    className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{record.incentive_name}</h3>
                      <p className="text-sm text-gray-600">{record.property_title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(record.used_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        ${record.amount_saved.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">Saved</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Eco Rewards Work</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1. Browse</h3>
              <p className="text-sm text-gray-600">
                Look for properties with the Green Stay badge
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2. Book</h3>
              <p className="text-sm text-gray-600">
                Make a reservation at an eco-friendly property
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">3. Save</h3>
              <p className="text-sm text-gray-600">
                Discounts applied automatically at checkout
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">4. Impact</h3>
              <p className="text-sm text-gray-600">
                Reduce carbon footprint and support sustainability
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!isSignedIn && (
          <div className="mt-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start Earning Rewards Today</h2>
            <p className="text-xl mb-8 text-emerald-100">
              Sign in to track your eco-rewards and see how much you've saved
            </p>
            <a
              href="/sign-in"
              className="inline-block px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition"
            >
              Sign In to Get Started
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

