'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const Searchfilters = () => {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });
  const [guests, setGuests] = useState<number>(1);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (dateRange.startDate.getTime() !== dateRange.endDate.getTime()) {
      params.set('check_in', dateRange.startDate.toISOString().split('T')[0]);
      params.set('check_out', dateRange.endDate.toISOString().split('T')[0]);
    }
    if (guests > 1) params.set('guests', String(guests));
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

  return (
    <div className="h-[64px] flex flex-row items-center justify-between border border-white rounded-full bg-white/10 backdrop-blur-sm">
      <div className="hidden lg:flex flex-row items-center justify-between flex-1">
        {/* Location */}
        <div className="cursor-pointer h-[64px] px-8 flex justify-center flex-col rounded-full hover:bg-white/20 transition-colors group flex-1">
          <p className="text-xs font-semibold text-white">where?</p>
          <input
            type="text"
            className="text-sm text-white placeholder-white/70 bg-transparent border-none outline-none w-full"
            placeholder="Search Destinations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onClick={() => {
              setShowDatePicker(false);
              setShowGuestPicker(false);
            }}
          />
        </div>

        {/* Check In */}
        <div className="relative cursor-pointer h-[64px] px-8 flex justify-center flex-col rounded-full hover:bg-white/20 transition-colors group flex-1">
          <div
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowGuestPicker(false);
            }}
          >
            <p className="text-xs font-semibold text-white">Check In</p>
            <p className="text-sm text-white">{checkInText}</p>
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
        <div className="cursor-pointer h-[64px] px-8 flex justify-center flex-col rounded-full hover:bg-white/20 transition-colors group flex-1">
          <div
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowGuestPicker(false);
            }}
          >
            <p className="text-xs font-semibold text-white">Check Out</p>
            <p className="text-sm text-white">{checkOutText}</p>
          </div>
        </div>

        {/* Guests */}
        <div className="relative cursor-pointer h-[64px] px-8 flex justify-center flex-col rounded-full hover:bg-white/20 transition-colors group flex-1">
          <div
            onClick={() => {
              setShowGuestPicker(!showGuestPicker);
              setShowDatePicker(false);
            }}
          >
            <p className="text-xs font-semibold text-white">Who</p>
            <p className="text-sm text-white">{guests} {guests === 1 ? 'Guest' : 'Guests'}</p>
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
      </div>
      
      {/* Search Button */}
      <div className="p-2">
        <button
          onClick={handleSearch}
          className="cursor-pointer p-2 lg:p-4 bg-red-500 hover:bg-red-600 transition rounded-full text-white"
          aria-label="Search"
        >
          <svg viewBox="0 0 32 32" style={{display:"block",fill:"none",height:"16px",width:"16px",stroke:"currentColor",strokeWidth:4,overflow:"visible"}} aria-hidden="true" role="presentation" focusable="false">
            <path fill="none" d="M13 24a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm8-3 9 9"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
export default Searchfilters;
