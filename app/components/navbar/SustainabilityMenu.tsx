'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';

/**
 * Sustainability Dropdown Menu Component
 * Provides access to all eco-friendly features and tools
 */
const SustainabilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  // Determine if user is a host (you can adjust this logic based on your user metadata)
  const isHost = user?.publicMetadata?.role === 'host' || user?.publicMetadata?.isHost === true;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-full text-white hover:bg-gray-800 transition duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">🌱</span>
        <span className="font-medium">Sustainability</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl py-3 z-50 border border-gray-100">
          {/* Menu Header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Eco-Friendly Features</h3>
            <p className="text-xs text-gray-500 mt-1">Make sustainable travel choices</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Green Stay Certification */}
            <Link
              href="/sustainability/green-certification"
              onClick={() => setIsOpen(false)}
              className="flex items-start px-4 py-3 hover:bg-green-50 transition duration-150"
            >
              <span className="text-2xl mr-3">🏅</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Green Stay Certification</div>
                <div className="text-xs text-gray-500 mt-1">
                  Learn about eco-friendly certified properties
                </div>
              </div>
            </Link>

            {/* Carbon Footprint Calculator */}
            <Link
              href="/sustainability/carbon-calculator"
              onClick={() => setIsOpen(false)}
              className="flex items-start px-4 py-3 hover:bg-green-50 transition duration-150"
            >
              <span className="text-2xl mr-3">🌍</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Carbon Footprint Calculator</div>
                <div className="text-xs text-gray-500 mt-1">
                  Calculate your trip's environmental impact
                </div>
              </div>
            </Link>

            {/* Eco Rewards & Discounts */}
            <Link
              href="/sustainability/eco-rewards"
              onClick={() => setIsOpen(false)}
              className="flex items-start px-4 py-3 hover:bg-green-50 transition duration-150"
            >
              <span className="text-2xl mr-3">💰</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Eco Rewards & Discounts</div>
                <div className="text-xs text-gray-500 mt-1">
                  Save money by choosing sustainable stays
                </div>
              </div>
            </Link>

            {/* Energy & Water Monitoring (Hosts Only) */}
            {isSignedIn && isHost && (
              <>
                <div className="border-t border-gray-100 my-2"></div>
                <div className="px-4 py-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Host Tools</p>
                </div>
                <Link
                  href="/Host/sustainability"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start px-4 py-3 hover:bg-green-50 transition duration-150"
                >
                  <span className="text-2xl mr-3">📊</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Energy & Water Monitoring</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Track and optimize resource usage
                    </div>
                  </div>
                </Link>
              </>
            )}

            {/* Sustainable Experiences */}
            <div className="border-t border-gray-100 my-2"></div>
            <Link
              href="/sustainability/experiences"
              onClick={() => setIsOpen(false)}
              className="flex items-start px-4 py-3 hover:bg-green-50 transition duration-150"
            >
              <span className="text-2xl mr-3">🚴</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Sustainable Experiences</div>
                <div className="text-xs text-gray-500 mt-1">
                  Discover local eco-friendly activities
                </div>
              </div>
            </Link>
          </div>

          {/* Footer Call-to-Action */}
          <div className="px-4 py-3 bg-green-50 border-t border-gray-100 mt-2">
            <p className="text-xs text-green-800 font-medium">
              🌱 Together, we can make travel more sustainable
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityMenu;

