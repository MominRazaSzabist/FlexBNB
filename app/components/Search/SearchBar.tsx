'use client';

import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import LocationAutocomplete from "./LocationAutocomplete";

interface SearchBarProps {
  onSearchChange: (value: string) => void;
  onDatesChange: (checkIn: Date | null, checkOut: Date | null) => void;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
  onCategoryChange: (category: string | undefined) => void;
  onGuestsChange?: (guests: number) => void;
}

function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearchChange, 
  onDatesChange,
  onPriceChange,
  onCategoryChange,
  onGuestsChange
}) => {
  const [value, setValue] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);

  useEffect(() => {
    const debounced = debounce(onSearchChange, 400);
    debounced(value);
  }, [value, onSearchChange]);

  useEffect(() => {
    const checkIn = dateRange.startDate;
    const checkOut = dateRange.endDate;
    if (checkIn && checkOut && checkIn.getTime() !== checkOut.getTime()) {
      onDatesChange(checkIn, checkOut);
    } else {
      onDatesChange(null, null);
    }
  }, [dateRange, onDatesChange]);

  useEffect(() => {
    const min = minPrice ? parseInt(minPrice, 10) : undefined;
    const max = maxPrice ? parseInt(maxPrice, 10) : undefined;
    onPriceChange(min, max);
  }, [minPrice, maxPrice, onPriceChange]);

  useEffect(() => {
    onCategoryChange(category || undefined);
  }, [category, onCategoryChange]);

  useEffect(() => {
    if (onGuestsChange) {
      onGuestsChange(guests);
    }
  }, [guests, onGuestsChange]);

  const handleGuestChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setGuests(prev => Math.min(prev + 1, 20));
    } else {
      setGuests(prev => Math.max(prev - 1, 1));
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            🔍
          </span>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Search by location or property name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setValue('');
              }
            }}
          />
          <LocationAutocomplete
            value={value}
            onChange={setValue}
            onSelect={(location) => {
              setValue(location);
              onSearchChange(location);
            }}
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {/* Date Picker */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowGuestPicker(false);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>📅</span>
            <span className="font-medium">
              {dateRange.startDate && dateRange.endDate && 
               dateRange.startDate.getTime() !== dateRange.endDate.getTime()
                ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                : "Select dates"}
            </span>
          </button>
          {showDatePicker && (
            <div className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl">
              <DateRange
                ranges={[dateRange]}
                onChange={(ranges: any) => {
                  setDateRange(ranges.selection);
                }}
                minDate={new Date()}
              />
              <div className="p-3 border-t bg-gray-50">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Apply Dates
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Guest Picker */}
        <div className="relative">
          <button
            onClick={() => {
              setShowGuestPicker(!showGuestPicker);
              setShowDatePicker(false);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>👥</span>
            <span className="font-medium">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
          </button>
          {showGuestPicker && (
            <div className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-[200px]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">Guests</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleGuestChange('decrement')}
                    disabled={guests <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{guests}</span>
                  <button
                    onClick={() => handleGuestChange('increment')}
                    disabled={guests >= 20}
                    className="w-8 h-8 rounded-full border border-gray-300 hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowGuestPicker(false)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg">
          <span className="text-gray-600">💰 Price:</span>
          <input
            type="number"
            className="w-20 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            className="w-20 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Property Type */}
        <div className="flex items-center gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors font-medium"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">🏠 All Properties</option>
            <option value="Hotel">🏨 Hotel</option>
            <option value="Beachfront">🏖️ Beachfront</option>
            <option value="Amazing views">🌄 Amazing views</option>
            <option value="Artic">❄️ Artic</option>
            <option value="Camping">⛺ Camping</option>
            <option value="Castle">🏰 Castle</option>
            <option value="Domes">⛺ Domes</option>
            <option value="Farms">🚜 Farms</option>
            <option value="Mansion">🏛️ Mansion</option>
            <option value="Rooms">🛏️ Rooms</option>
            <option value="Top City">🏙️ Top City</option>
            <option value="Top Of The World">🌍 Top Of The World</option>
            <option value="Trending">🔥 Trending</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
