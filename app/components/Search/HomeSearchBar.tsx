'use client';

import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { useRouter } from "next/navigation";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface HomeSearchBarProps {
  onSearch?: (params: {
    location: string;
    checkIn: Date | null;
    checkOut: Date | null;
    guests: number;
    category?: string;
  }) => void;
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({ onSearch }) => {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });
  const [guests, setGuests] = useState<number>(1);
  const [category, setCategory] = useState<string>("");

  const handleSearch = () => {
    const searchParams = {
      location,
      checkIn: dateRange.startDate.getTime() !== dateRange.endDate.getTime() ? dateRange.startDate : null,
      checkOut: dateRange.startDate.getTime() !== dateRange.endDate.getTime() ? dateRange.endDate : null,
      guests,
      category: category || undefined,
    };

    // If onSearch callback is provided, use it (for home page integration)
    if (onSearch) {
      onSearch(searchParams);
      return;
    }

    // Otherwise, navigate to search page with query params
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (searchParams.checkIn) params.set('check_in', searchParams.checkIn.toISOString().split('T')[0]);
    if (searchParams.checkOut) params.set('check_out', searchParams.checkOut.toISOString().split('T')[0]);
    if (guests > 1) params.set('guests', String(guests));
    if (category) params.set('category', category);

    router.push(`/Search?${params.toString()}`);
  };

  const handleGuestChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setGuests(prev => Math.min(prev + 1, 20));
    } else {
      setGuests(prev => Math.max(prev - 1, 1));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const checkInText = dateRange.startDate.getTime() !== dateRange.endDate.getTime()
    ? formatDate(dateRange.startDate)
    : "Add Dates";
  
  const checkOutText = dateRange.startDate.getTime() !== dateRange.endDate.getTime()
    ? formatDate(dateRange.endDate)
    : "Add Dates";

  const categoryOptions = [
    { value: "", label: "All Properties" },
    { value: "Hotel", label: "Hotel" },
    { value: "Beachfront", label: "Beachfront" },
    { value: "Amazing views", label: "Amazing views" },
    { value: "Artic", label: "Artic" },
    { value: "Camping", label: "Camping" },
    { value: "Castle", label: "Castle" },
    { value: "Domes", label: "Domes" },
    { value: "Farms", label: "Farms" },
    { value: "Mansion", label: "Mansion" },
    { value: "Rooms", label: "Rooms" },
    { value: "Top City", label: "Top City" },
    { value: "Top Of The World", label: "Top Of The World" },
    { value: "Trending", label: "Trending" },
  ];

  const handleCategoryClick = (catValue: string) => {
    setCategory(catValue === category ? "" : catValue);
    const searchParams = {
      location,
      checkIn: dateRange.startDate.getTime() !== dateRange.endDate.getTime() ? dateRange.startDate : null,
      checkOut: dateRange.startDate.getTime() !== dateRange.endDate.getTime() ? dateRange.endDate : null,
      guests,
      category: catValue === category ? undefined : catValue,
    };
    if (onSearch) {
      onSearch(searchParams);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Main Horizontal Search Bar */}
      <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
        {/* Location Search */}
        <div className="flex-1 px-6 py-4 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="text-xs font-semibold text-gray-500 mb-1">where?</div>
          <input
            type="text"
            className="w-full text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
            placeholder="Search Destinations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onClick={() => {
              setShowDatePicker(false);
              setShowGuestPicker(false);
              setShowCategoryPicker(false);
            }}
          />
        </div>

        {/* Check In */}
        <div className="relative flex-1 px-6 py-4 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowGuestPicker(false);
              setShowCategoryPicker(false);
            }}
          >
            <div className="text-xs font-semibold text-gray-500 mb-1">Check In</div>
            <div className="text-sm font-medium text-gray-900">{checkInText}</div>
          </div>
          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-2xl shadow-2xl z-50">
              <DateRange
                ranges={[dateRange]}
                onChange={(ranges: any) => {
                  setDateRange(ranges.selection);
                }}
                minDate={new Date()}
                moveRangeOnFirstSelection={false}
              />
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Check Out */}
        <div className="flex-1 px-6 py-4 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowGuestPicker(false);
              setShowCategoryPicker(false);
            }}
          >
            <div className="text-xs font-semibold text-gray-500 mb-1">Check Out</div>
            <div className="text-sm font-medium text-gray-900">{checkOutText}</div>
          </div>
        </div>

        {/* Guests */}
        <div className="relative flex-1 px-6 py-4 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div
            onClick={() => {
              setShowGuestPicker(!showGuestPicker);
              setShowDatePicker(false);
              setShowCategoryPicker(false);
            }}
          >
            <div className="text-xs font-semibold text-gray-500 mb-1">Who</div>
            <div className="text-sm font-medium text-gray-900">
              {guests} {guests === 1 ? 'Guest' : 'Guests'}
            </div>
          </div>
          {showGuestPicker && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-2xl shadow-2xl p-6 min-w-[280px] z-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-gray-900">Adults</div>
                  <div className="text-sm text-gray-500">Ages 13+</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleGuestChange('decrement')}
                    disabled={guests <= 1}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg font-semibold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-lg">{guests}</span>
                  <button
                    onClick={() => handleGuestChange('increment')}
                    disabled={guests >= 20}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowGuestPicker(false)}
                className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors flex items-center justify-center"
          aria-label="Search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Category/Property Type Filter Row */}
      <div className="mt-6 flex items-center gap-4 overflow-x-auto pb-2">
        <div className="flex items-center gap-4">
          {categoryOptions.slice(1).map((option) => (
            <button
              key={option.value}
              onClick={() => handleCategoryClick(option.value)}
              className={`flex flex-col items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                category === option.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">
                {option.value === "Beachfront" && "🏖️"}
                {option.value === "Amazing views" && "🌄"}
                {option.value === "Artic" && "❄️"}
                {option.value === "Camping" && "⛺"}
                {option.value === "Castle" && "🏰"}
                {option.value === "Domes" && "⛺"}
                {option.value === "Farms" && "🚜"}
                {option.value === "Mansion" && "🏛️"}
                {option.value === "Rooms" && "🛏️"}
                {option.value === "Top City" && "🏙️"}
                {option.value === "Top Of The World" && "🌍"}
                {option.value === "Trending" && "🔥"}
              </span>
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => router.push('/Search')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap ml-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>
    </div>
  );
};

export default HomeSearchBar;

