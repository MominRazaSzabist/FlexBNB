'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';

interface CalculationResult {
  transport_carbon: number;
  accommodation_carbon: number;
  total_carbon: number;
  equivalent_trees: number;
  recommendations: Recommendation[];
  is_saved: boolean;
}

interface Recommendation {
  category: string;
  message: string;
  impact: string;
}

/**
 * Carbon Footprint Calculator Page
 * Helps users calculate and understand their trip's environmental impact
 */
export default function CarbonCalculatorPage() {
  const { getToken, isSignedIn } = useAuth();
  
  // Form state
  const [transportType, setTransportType] = useState('car');
  const [distanceKm, setDistanceKm] = useState('');
  const [stayDuration, setStayDuration] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState('1');
  
  // Result state
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const transportOptions = [
    { value: 'walk', label: 'Walking', icon: '🚶', carbon: '0 kg CO₂/km' },
    { value: 'bike', label: 'Bicycle', icon: '🚴', carbon: '0 kg CO₂/km' },
    { value: 'bus', label: 'Bus', icon: '🚌', carbon: '0.089 kg CO₂/km' },
    { value: 'train', label: 'Train', icon: '🚂', carbon: '0.041 kg CO₂/km' },
    { value: 'car', label: 'Car', icon: '🚗', carbon: '0.171 kg CO₂/km' },
    { value: 'electric_car', label: 'Electric Car', icon: '🔌', carbon: '0.053 kg CO₂/km' },
    { value: 'flight_domestic', label: 'Domestic Flight', icon: '✈️', carbon: '0.255 kg CO₂/km' },
    { value: 'flight_international', label: 'International Flight', icon: '🛫', carbon: '0.195 kg CO₂/km' },
  ];

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!distanceKm || !stayDuration) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCalculating(true);
    
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const token = isSignedIn ? await getToken() : null;
      
      const response = await fetch(
        `${apiHost}/api/sustainability/carbon-footprint/calculate/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({
            transport_type: transportType,
            distance_km: parseFloat(distanceKm),
            stay_duration_days: parseInt(stayDuration),
            number_of_guests: parseInt(numberOfGuests),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast.success(data.is_saved ? 'Carbon footprint calculated and saved!' : 'Carbon footprint calculated!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to calculate carbon footprint');
      }
    } catch (error) {
      console.error('[CARBON CALC] Error:', error);
      toast.error('Failed to calculate carbon footprint');
    } finally {
      setCalculating(false);
    }
  };

  const resetForm = () => {
    setDistanceKm('');
    setStayDuration('');
    setNumberOfGuests('1');
    setTransportType('car');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <span className="text-5xl">🌍</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Carbon Footprint Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Understand the environmental impact of your trip and discover ways to travel more sustainably
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Calculate Your Impact</h2>
            
            <form onSubmit={handleCalculate} className="space-y-6">
              {/* Transport Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Transport Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {transportOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTransportType(option.value)}
                      className={`p-4 border-2 rounded-lg text-left transition ${
                        transportType === option.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl">{option.icon}</span>
                        <span className="font-semibold text-gray-900">{option.label}</span>
                      </div>
                      <div className="text-xs text-gray-500">{option.carbon}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (km) *
                </label>
                <input
                  id="distance"
                  type="number"
                  min="0"
                  step="0.1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="e.g., 500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Stay Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Stay Duration (nights) *
                </label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  value={stayDuration}
                  onChange={(e) => setStayDuration(e.target.value)}
                  placeholder="e.g., 3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Number of Guests */}
              <div>
                <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Travelers
                </label>
                <input
                  id="guests"
                  type="number"
                  min="1"
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(e.target.value)}
                  placeholder="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={calculating}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {calculating ? 'Calculating...' : 'Calculate Carbon Footprint'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div>
            {result ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Carbon Footprint</h2>
                  <button
                    onClick={resetForm}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Reset
                  </button>
                </div>

                {/* Total Carbon */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      {result.total_carbon.toFixed(1)}
                    </div>
                    <div className="text-xl opacity-90">kg CO₂</div>
                    <div className="text-sm opacity-75 mt-2">Total Carbon Emissions</div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🚗</span>
                      <span className="font-medium text-gray-900">Transportation</span>
                    </div>
                    <span className="font-bold text-gray-900">{result.transport_carbon.toFixed(1)} kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏠</span>
                      <span className="font-medium text-gray-900">Accommodation</span>
                    </div>
                    <span className="font-bold text-gray-900">{result.accommodation_carbon.toFixed(1)} kg</span>
                  </div>
                </div>

                {/* Tree Equivalent */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">🌳</span>
                    <div>
                      <div className="font-semibold text-green-900">
                        Equivalent to {result.equivalent_trees} trees
                      </div>
                      <div className="text-sm text-green-700">
                        needed for 1 year to offset this carbon
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">💡 Ways to Reduce Your Impact</h3>
                    <div className="space-y-3">
                      {result.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            rec.impact === 'high'
                              ? 'bg-red-50 border-red-500'
                              : rec.impact === 'medium'
                              ? 'bg-yellow-50 border-yellow-500'
                              : 'bg-blue-50 border-blue-500'
                          }`}
                        >
                          <div className="text-sm text-gray-800">{rec.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Your Trip Details</h3>
                <p className="text-gray-600">
                  Fill in the form to calculate your trip's carbon footprint and get personalized recommendations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Carbon Emissions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-bold text-gray-900 mb-2">Why It Matters</h3>
              <p className="text-sm text-gray-600">
                Travel contributes ~8% of global carbon emissions. Every trip we take has an environmental impact.
              </p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl mb-3">♻️</div>
              <h3 className="font-bold text-gray-900 mb-2">What You Can Do</h3>
              <p className="text-sm text-gray-600">
                Choose green transport, stay at eco-certified properties, and consider carbon offsets.
              </p>
            </div>
            
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <div className="text-3xl mb-3">🌱</div>
              <h3 className="font-bold text-gray-900 mb-2">Make a Difference</h3>
              <p className="text-sm text-gray-600">
                Small changes add up. Choosing trains over planes can reduce emissions by 80%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

