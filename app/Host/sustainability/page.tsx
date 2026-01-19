'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/components/Host/DashboardLayout';

interface EnergyUsage {
  id: string;
  property: string;
  property_title: string;
  date: string;
  electricity_kwh: number;
  water_liters: number;
  gas_kwh: number;
  occupancy_rate: number;
  number_of_guests: number;
  usage_per_guest: {
    electricity: number;
    water: number;
  };
  is_anomaly: boolean;
  ai_recommendation: string;
}

interface Statistics {
  total_electricity_kwh: number;
  total_water_liters: number;
  avg_electricity_per_day: number;
  avg_water_per_day: number;
  avg_electricity_per_guest: number;
  avg_water_per_guest: number;
  anomaly_count: number;
  records_count: number;
}

interface Property {
  id: string;
  title: string;
}

/**
 * Host Sustainability Dashboard
 * AI-powered energy and water usage monitoring with optimization recommendations
 */
export default function HostSustainabilityPage() {
  const { getToken } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [usageRecords, setUsageRecords] = useState<EnergyUsage[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding new usage
  const [newUsage, setNewUsage] = useState({
    date: new Date().toISOString().split('T')[0],
    electricity_kwh: '',
    water_liters: '',
    gas_kwh: '0',
    occupancy_rate: '',
    number_of_guests: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchEnergyUsage();
    }
  }, [selectedProperty]);

  const fetchProperties = async () => {
    try {
      const token = await getToken();
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const response = await fetch(`${apiHost}/api/properties/myproperties/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data);
        if (data.length > 0) {
          setSelectedProperty(data[0].id);
        }
      }
    } catch (error) {
      console.error('[SUSTAINABILITY] Error fetching properties:', error);
    }
  };

  const fetchEnergyUsage = async () => {
    if (!selectedProperty) return;

    setLoading(true);
    try {
      const token = await getToken();
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const response = await fetch(
        `${apiHost}/api/sustainability/energy-usage/?property_id=${selectedProperty}&days=30`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsageRecords(data.usage_records);
        setStatistics(data.statistics);
      } else {
        toast.error('Failed to fetch energy usage data');
      }
    } catch (error) {
      console.error('[SUSTAINABILITY] Error fetching usage:', error);
      toast.error('Failed to load energy usage data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUsage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = await getToken();
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const response = await fetch(`${apiHost}/api/sustainability/energy-usage/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property: selectedProperty,
          date: newUsage.date,
          electricity_kwh: parseFloat(newUsage.electricity_kwh),
          water_liters: parseFloat(newUsage.water_liters),
          gas_kwh: parseFloat(newUsage.gas_kwh),
          occupancy_rate: parseFloat(newUsage.occupancy_rate),
          number_of_guests: parseInt(newUsage.number_of_guests),
        }),
      });

      if (response.ok) {
        toast.success('Usage data added successfully');
        setShowAddModal(false);
        fetchEnergyUsage();
        setNewUsage({
          date: new Date().toISOString().split('T')[0],
          electricity_kwh: '',
          water_liters: '',
          gas_kwh: '0',
          occupancy_rate: '',
          number_of_guests: '',
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add usage data');
      }
    } catch (error) {
      console.error('[SUSTAINABILITY] Error adding usage:', error);
      toast.error('Failed to add usage data');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Energy & Water Monitoring
          </h1>
          <p className="text-gray-600">
            Track and optimize your property's resource usage with AI-powered insights
          </p>
        </div>

        {/* Property Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Property
              </label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="ml-4 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              + Add Usage Data
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold mb-1">
                {statistics.avg_electricity_per_day.toFixed(1)}
              </div>
              <div className="text-blue-100 text-sm">kWh/day</div>
              <div className="text-xs text-blue-200 mt-2">Avg Electricity</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-3xl mb-2">💧</div>
              <div className="text-2xl font-bold mb-1">
                {statistics.avg_water_per_day.toFixed(0)}
              </div>
              <div className="text-cyan-100 text-sm">Liters/day</div>
              <div className="text-xs text-cyan-200 mt-2">Avg Water</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold mb-1">
                {statistics.avg_electricity_per_guest.toFixed(1)}
              </div>
              <div className="text-green-100 text-sm">kWh/guest</div>
              <div className="text-xs text-green-200 mt-2">Per Guest Efficiency</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-2xl font-bold mb-1">{statistics.anomaly_count}</div>
              <div className="text-orange-100 text-sm">Anomalies</div>
              <div className="text-xs text-orange-200 mt-2">AI Detected</div>
            </div>
          </div>
        )}

        {/* Usage Records */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Usage History (Last 30 Days)</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading usage data...</p>
            </div>
          ) : usageRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Usage Data Yet</h3>
              <p className="text-gray-600 mb-6">
                Start tracking your property's energy and water usage to get AI-powered insights
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Add First Record
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {usageRecords.map((record) => (
                <div
                  key={record.id}
                  className={`p-6 rounded-lg border-2 ${
                    record.is_anomaly
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-gray-900 text-lg">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {record.number_of_guests} guests • {record.occupancy_rate}% occupancy
                      </div>
                    </div>
                    {record.is_anomaly && (
                      <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-semibold">
                        ⚠️ Anomaly Detected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-blue-600 font-semibold mb-1">⚡ Electricity</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {record.electricity_kwh} kWh
                      </div>
                      {record.usage_per_guest.electricity > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          {record.usage_per_guest.electricity.toFixed(1)} kWh/guest
                        </div>
                      )}
                    </div>

                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <div className="text-cyan-600 font-semibold mb-1">💧 Water</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {record.water_liters} L
                      </div>
                      {record.usage_per_guest.water > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          {record.usage_per_guest.water.toFixed(0)} L/guest
                        </div>
                      )}
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-purple-600 font-semibold mb-1">🔥 Gas</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {record.gas_kwh} kWh
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  {record.ai_recommendation && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                      <div className="font-semibold text-purple-900 mb-2 flex items-center">
                        <span className="mr-2">🤖</span>
                        AI Recommendations
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {record.ai_recommendation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Usage Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Add Usage Data</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddUsage} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newUsage.date}
                    onChange={(e) => setNewUsage({ ...newUsage, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Electricity (kWh) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={newUsage.electricity_kwh}
                      onChange={(e) => setNewUsage({ ...newUsage, electricity_kwh: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water (Liters) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={newUsage.water_liters}
                      onChange={(e) => setNewUsage({ ...newUsage, water_liters: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gas (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newUsage.gas_kwh}
                    onChange={(e) => setNewUsage({ ...newUsage, gas_kwh: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupancy Rate (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newUsage.occupancy_rate}
                      onChange={(e) => setNewUsage({ ...newUsage, occupancy_rate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newUsage.number_of_guests}
                      onChange={(e) => setNewUsage({ ...newUsage, number_of_guests: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Add Usage Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

