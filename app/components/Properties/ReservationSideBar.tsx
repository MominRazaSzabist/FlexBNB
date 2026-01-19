'use client';

import { useState, useCallback } from 'react';
import { Range, RangeKeyDict } from 'react-date-range';
import Calendar from '../Calendar/Calendar';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import PaymentModal from '../PaymentModal';
import { showBookingConfirmation } from '../Notification';
import { useUser, useAuth } from '@clerk/nextjs';
import ConfirmationModal from '../ConfirmationModal';


export type Property = {
  id: string;
  price_per_night: number;
  price_per_hour?: number;
  available_hours_start?: string;
  available_hours_end?: string;
  is_hourly_booking: boolean;
  title: string;
}

type ReservationSideBarProps = {
  property: Property;
};

const ReservationSideBar = ({ property }: ReservationSideBarProps) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id;
  
  console.log('Clerk user:', user);
  console.log('Clerk userId:', userId);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<Range[]>([{
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }]);

  const [useHourlyBooking, setUseHourlyBooking] = useState(false);
  const [selectedTime, setSelectedTime] = useState<{
    startTime: string;
    endTime: string;
  }>({
    startTime: property.available_hours_start || '00:00',
    endTime: property.available_hours_end || '23:59'
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingCard, setPendingCard] = useState('');
  const [pendingExpiry, setPendingExpiry] = useState('');
  const [isReserving, setIsReserving] = useState(false);

  // Calculate number of nights for nightly booking
  const getNumberOfNights = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    if (!start || !end) return 0;
    // Ensure at least 1 night even if same day
    const nights = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(nights, 1);
  };

  const calculateTotalPrice = () => {
    if (!dateRange[0].startDate || !dateRange[0].endDate) return 0;
    
    if (property.is_hourly_booking && useHourlyBooking) {
      const startDateTime = new Date(dateRange[0].startDate);
      const endDateTime = new Date(dateRange[0].endDate);
      
      const [startHours, startMinutes] = selectedTime.startTime.split(':').map(Number);
      const [endHours, endMinutes] = selectedTime.endTime.split(':').map(Number);
      
      startDateTime.setHours(startHours, startMinutes);
      endDateTime.setHours(endHours, endMinutes);
      
      const hours = differenceInHours(endDateTime, startDateTime);
      const minutes = differenceInMinutes(endDateTime, startDateTime) % 60;
      const hourlyPrice = property.price_per_hour || 0;
      const totalHours = hours + (minutes / 60);
      
      return Math.round(hourlyPrice * totalHours);
    } else {
      return property.price_per_night * getNumberOfNights();
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    setSelectedTime(prev => ({
      ...prev,
      [type === 'start' ? 'startTime' : 'endTime']: value
    }));
  };

  const handleReservation = () => {
    if (!userId) {
      alert('Please log in to make a reservation.');
      return;
    }

    // Validate dates are selected
    if (!dateRange[0].startDate || !dateRange[0].endDate) {
      alert('Please select check-in and check-out dates.');
      return;
    }
    
    // Validate dates for hourly booking
    if (property.is_hourly_booking && useHourlyBooking) {
      if (selectedTime.startTime >= selectedTime.endTime) {
        alert('End time must be after start time.');
        return;
      }
    }
    
    // Validate dates for nightly booking
    if (!useHourlyBooking && dateRange[0].startDate && dateRange[0].endDate) {
      const startDate = new Date(dateRange[0].startDate);
      const endDate = new Date(dateRange[0].endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      if (endDate < startDate) {
        alert('Check-out date must be on or after check-in date.');
        return;
      }
    }

    // Validate total price
    const calculatedPrice = calculateTotalPrice();
    if (calculatedPrice <= 0) {
      alert('Please select valid dates to calculate the total price.');
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handleRequestConfirm = (card: string, expiry: string) => {
    setPendingCard(card);
    setPendingExpiry(expiry);
    setIsPaymentModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmReservation = async () => {
    setIsConfirmModalOpen(false);
    setIsReserving(true);
    
    try {
      const token = await getToken();
      if (!token) {
        alert('Authentication required. Please sign in.');
        return;
      }

      // Validate dates before sending
      if (!dateRange[0].startDate || !dateRange[0].endDate) {
        alert('Please select check-in and check-out dates.');
        return;
      }

      const startDateStr = format(dateRange[0].startDate, 'yyyy-MM-dd');
      const endDateStr = format(dateRange[0].endDate, 'yyyy-MM-dd');

      // Ensure end date is at least same as start date (backend will handle minimum 1 night)
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      if (endDate < startDate) {
        alert('Check-out date must be on or after check-in date.');
        return;
      }

      const payload = {
        propertyId: property.id,
        startDate: startDateStr,
        endDate: endDateStr,
        guestsCount: 1,
        useHourlyBooking: property.is_hourly_booking && useHourlyBooking,
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
      };

      console.log('Creating reservation with payload:', payload);
      console.log('Token present:', !!token);
      console.log('Token length:', token?.length);
      console.log('API Host:', process.env.NEXT_PUBLIC_API_HOST);
  
      // Create reservation via API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_HOST}/api/booking/reservations/create/`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

      let errorData;
      try {
        const text = await response.text();
        console.log('API Response text:', text);
        errorData = text ? JSON.parse(text) : { error: 'Empty response' };
      } catch (e) {
        console.error('Failed to parse response:', e);
        errorData = { error: 'Invalid response from server', detail: String(e) };
      }

      if (!response.ok) {
        console.error('API Error:', errorData);
        console.error('Response status:', response.status);
        
        // Handle specific error codes
        if (response.status === 403) {
          throw new Error('Access forbidden. Please ensure you are signed in and have permission to make reservations.');
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        } else if (response.status === 400) {
          throw new Error(errorData.error || errorData.message || 'Invalid request. Please check your dates and try again.');
        } else {
          throw new Error(errorData.error || errorData.message || errorData.detail || `Server error: ${response.status}`);
        }
      }

      const reservationData = errorData; // Response is already parsed
      console.log('Reservation created:', reservationData);
      
      // Show success notification
      showBookingConfirmation(property.title);
      
      // Dispatch custom event to refresh reservations in host dashboard
      window.dispatchEvent(new CustomEvent('reservationCreated', { 
        detail: { 
          reservationId: reservationData.id,
          propertyId: property.id,
          guestId: userId
        } 
      }));
      
      // Reset form after successful booking
      setDateRange([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
      }]);
      setSelectedTime({
        startTime: property.available_hours_start || '00:00',
        endTime: property.available_hours_end || '23:59'
      });
      
      // Show success alert with reservation ID
      alert(`✅ Reservation confirmed!\n\nReservation ID: ${reservationData.id}\nProperty: ${property.title}\nCheck-in: ${startDateStr}\nCheck-out: ${endDateStr}\n\nYou can view your reservation in "My Reservations".`);
      
    } catch (error: any) {
      console.error('Failed to create reservation:', error);
      const errorMessage = error.message || 'Failed to create reservation. Please try again.';
      alert(`❌ Error: ${errorMessage}\n\nPlease check:\n- You are signed in\n- Dates are valid\n- Property is available\n- Network connection is working`);
    } finally {
      setIsReserving(false);
    }
  };

  const totalPrice = calculateTotalPrice();
  const numberOfNights = getNumberOfNights();

  return (
    <aside className="w-full max-w-sm mx-auto lg:max-w-none py-6 px-4 lg:px-6 rounded-xl border border-gray-300 shadow-xl bg-white">
      <h2 className="mb-5 text-xl lg:text-2xl font-semibold px-2">
        ${property.price_per_night} per night
        {property.is_hourly_booking && (
          <span className="block lg:inline lg:ml-2 text-base lg:text-lg font-normal text-gray-700">
            or ${property.price_per_hour} per hour
          </span>
        )}
      </h2>
      
      {property.is_hourly_booking && (
        <div className="flex items-center mb-4 mx-2">
          <input
            type="checkbox"
            id="hourlyBookingToggle"
            checked={useHourlyBooking}
            onChange={e => setUseHourlyBooking(e.target.checked)}
            className="w-4 h-4 mr-2"
          />
          <label htmlFor="hourlyBookingToggle" className="text-sm font-medium cursor-pointer">
            Book by the hour
          </label>
        </div>
      )}
      
      <div className="mb-6 mx-2">
        {/* Check-in/Check-out Box triggers calendar modal */}
        <div
          className="grid grid-cols-2 border border-gray-400 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setIsCalendarOpen(true)}
        >
          <div className="p-2 border-r border-gray-400">
            <label className="block font-semibold text-xs mb-1">CHECK-IN</label>
            <div className="text-sm">
              {dateRange[0].startDate ? format(dateRange[0].startDate, 'MM/dd/yyyy') : 'Select date'}
            </div>
          </div>
          <div className="p-2">
            <label className="block font-semibold text-xs mb-1">CHECKOUT</label>
            <div className="text-sm">
              {dateRange[0].endDate ? format(dateRange[0].endDate, 'MM/dd/yyyy') : 'Select date'}
            </div>
          </div>
        </div>
        
        {/* Calendar Modal */}
        {isCalendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/70">
            <div className="relative w-full md:w-[500px] h-auto bg-white rounded-xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Select dates</h3>
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition"
                >
                  ✕
                </button>
              </div>
              <Calendar
                value={dateRange}
                onChange={(range: RangeKeyDict) => {
                  setDateRange([range.selection]);
                  if (
                    range.selection.startDate &&
                    range.selection.endDate &&
                    range.selection.startDate.getTime() !== range.selection.endDate.getTime()
                  ) {
                    setIsCalendarOpen(false);
                  }
                }}
              />
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="w-full mt-4 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        {/* Show time pickers only if hourly booking is selected */}
        {property.is_hourly_booking && useHourlyBooking && (
          <div className="flex space-x-4 mt-4">
            <div className="flex flex-col flex-1">
              <label className="block font-semibold text-xs mb-1">Start Time</label>
              <input
                type="time"
                value={selectedTime.startTime}
                onChange={(e) => handleTimeChange('start', e.target.value)}
                min={property.available_hours_start}
                max={property.available_hours_end}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="block font-semibold text-xs mb-1">End Time</label>
              <input
                type="time"
                value={selectedTime.endTime}
                onChange={(e) => handleTimeChange('end', e.target.value)}
                min={property.available_hours_start}
                max={property.available_hours_end}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        )}
        
        {/* Show number of nights and per-night breakdown if not using hourly booking */}
        {(!useHourlyBooking || !property.is_hourly_booking) && numberOfNights > 0 && (
          <div className="mt-4 text-sm text-gray-700">
            <div className="flex justify-between mb-1">
              <span>${property.price_per_night} × {numberOfNights} nights</span>
              <span>${property.price_per_night * numberOfNights}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-[1px] rounded-xl space-y-4 mx-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Total</p>
            <p className="text-sm text-gray-500">
              {property.is_hourly_booking && useHourlyBooking ? 'Hourly rate' : 'Nightly rate'}
            </p>
          </div>
          <div className="text-lg font-semibold">
            ${totalPrice}
          </div>
        </div>
        <button
          onClick={handleReservation}
          className="w-full py-4 bg-red-500 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={totalPrice === 0 || !dateRange[0].startDate || !dateRange[0].endDate || isReserving}
          title={isReserving ? 'Processing reservation...' : totalPrice === 0 ? 'Please select dates to calculate price' : !dateRange[0].startDate || !dateRange[0].endDate ? 'Please select check-in and check-out dates' : 'Click to reserve'}
        >
          {isReserving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            'Reserve'
          )}
        </button>
      </div>
      
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalPrice}
        onRequestConfirm={handleRequestConfirm}
      />
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmReservation}
        card={pendingCard}
        expiry={pendingExpiry}
        property={{
          title: property.title,
          startDate: dateRange[0].startDate ? format(dateRange[0].startDate, 'MM/dd/yyyy') : '',
          endDate: dateRange[0].endDate ? format(dateRange[0].endDate, 'MM/dd/yyyy') : '',
          totalPrice: totalPrice,
        }}
      />
    </aside>
  );
};

export default ReservationSideBar;