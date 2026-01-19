'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface GreenCertification {
  id: string;
  property: string;
  property_title: string;
  status: string;
  level: string | null;
  sustainability_score: number;
  energy_saving: boolean;
  water_conservation: boolean;
  recycling_program: boolean;
  reduced_plastic: boolean;
  renewable_energy: boolean;
  organic_amenities: boolean;
  local_sourcing: boolean;
  green_transportation: boolean;
  description: string;
  applied_at: string;
  approved_at: string | null;
}

/**
 * Green Stay Certification Page
 * Displays information about eco-friendly certification and lists certified properties
 */
export default function GreenCertificationPage() {
  const { getToken, isSignedIn } = useAuth();
  const [certifications, setCertifications] = useState<GreenCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'certified' | 'apply'>('about');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const response = await fetch(
        `${apiHost}/api/sustainability/green-certifications/?status=approved`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCertifications(data);
      }
    } catch (error) {
      console.error('[GREEN CERT] Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <span className="text-5xl">🏅</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Green Stay Certification
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Recognizing properties committed to sustainable hospitality and environmental responsibility
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'about'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-green-50'
            }`}
          >
            About Certification
          </button>
          <button
            onClick={() => setActiveTab('certified')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'certified'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-green-50'
            }`}
          >
            Certified Properties ({certifications.length})
          </button>
          {isSignedIn && (
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'apply'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-green-50'
              }`}
            >
              Apply as Host
            </button>
          )}
        </div>

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What is Green Stay Certification?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Green Stay Certification is our commitment to recognizing hosts who prioritize
              sustainability and eco-friendly practices. Certified properties meet rigorous
              standards for environmental responsibility.
            </p>

            {/* Certification Levels */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Certification Levels</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border-2 border-amber-600 rounded-xl p-6 bg-gradient-to-br from-amber-50 to-white">
                  <div className="text-3xl mb-3">🥉</div>
                  <h4 className="text-xl font-bold text-amber-800 mb-2">Bronze</h4>
                  <p className="text-gray-600">Basic sustainability practices in place</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>✓ Energy efficiency measures</li>
                    <li>✓ Recycling program</li>
                    <li>✓ Water conservation</li>
                  </ul>
                </div>

                <div className="border-2 border-gray-400 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
                  <div className="text-3xl mb-3">🥈</div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Silver</h4>
                  <p className="text-gray-600">Advanced sustainable operations</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>✓ All Bronze requirements</li>
                    <li>✓ Renewable energy sources</li>
                    <li>✓ Organic amenities</li>
                    <li>✓ Local sourcing</li>
                  </ul>
                </div>

                <div className="border-2 border-yellow-500 rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-white">
                  <div className="text-3xl mb-3">🥇</div>
                  <h4 className="text-xl font-bold text-yellow-800 mb-2">Gold</h4>
                  <p className="text-gray-600">Exceptional environmental leadership</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>✓ All Silver requirements</li>
                    <li>✓ Carbon neutral operations</li>
                    <li>✓ Community engagement</li>
                    <li>✓ Green transportation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sustainability Practices */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Evaluated Practices</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: '💡', title: 'Energy Saving', desc: 'LED lights, solar panels, energy-efficient appliances' },
                  { icon: '💧', title: 'Water Conservation', desc: 'Low-flow fixtures, rainwater harvesting' },
                  { icon: '♻️', title: 'Recycling Program', desc: 'Comprehensive recycling and composting' },
                  { icon: '🚫', title: 'Reduced Plastic', desc: 'No single-use plastics, eco-friendly alternatives' },
                  { icon: '⚡', title: 'Renewable Energy', desc: 'Solar, wind, or other renewable sources' },
                  { icon: '🧴', title: 'Organic Amenities', desc: 'Eco-friendly toiletries and cleaning products' },
                  { icon: '🏪', title: 'Local Sourcing', desc: 'Supporting local businesses and products' },
                  { icon: '🚴', title: 'Green Transportation', desc: 'Bike rentals, EV charging stations' },
                ].map((practice, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-green-50">
                    <span className="text-2xl">{practice.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{practice.title}</h4>
                      <p className="text-sm text-gray-600">{practice.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-12 bg-green-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Benefits for Travelers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Reduce your carbon footprint by up to 30%</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Support environmentally responsible businesses</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Enjoy healthier, chemical-free amenities</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Access exclusive eco-rewards and discounts</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Certified Properties Tab */}
        {activeTab === 'certified' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Certified Green Stay Properties
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading certified properties...</p>
              </div>
            ) : certifications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No certified properties yet. Be the first!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certifications.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                    {/* Certification Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{cert.property_title}</h3>
                        <p className="text-sm text-gray-500">
                          Certified {new Date(cert.approved_at || cert.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cert.level === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                        cert.level === 'silver' ? 'bg-gray-100 text-gray-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {cert.level?.toUpperCase()}
                      </div>
                    </div>

                    {/* Sustainability Score */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Sustainability Score</span>
                        <span className="font-semibold text-green-600">{Math.round(cert.sustainability_score)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${cert.sustainability_score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Practices */}
                    <div className="flex flex-wrap gap-2">
                      {cert.energy_saving && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">💡 Energy</span>}
                      {cert.water_conservation && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">💧 Water</span>}
                      {cert.recycling_program && <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">♻️ Recycling</span>}
                      {cert.renewable_energy && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">⚡ Renewable</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Apply Tab */}
        {activeTab === 'apply' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Apply for Green Stay Certification
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Ready to showcase your property's commitment to sustainability?
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-green-900 mb-3">Application Process</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold text-green-600 mr-3">1.</span>
                  <span>Complete the application form with details about your sustainability practices</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-green-600 mr-3">2.</span>
                  <span>Submit supporting documentation (photos, certificates, bills)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-green-600 mr-3">3.</span>
                  <span>Our team reviews your application (typically 5-7 business days)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-green-600 mr-3">4.</span>
                  <span>Receive your Green Stay badge and display it on your listing</span>
                </li>
              </ol>
            </div>

            <div className="text-center">
              <Link
                href="/Host/Properties"
                className="inline-block px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Go to Host Dashboard to Apply
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                You must be a property host to apply for certification
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

