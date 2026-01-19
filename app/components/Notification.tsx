import toast from 'react-hot-toast';

export function showBookingConfirmation(propertyTitle: string, reservationId?: string) {
  const message = reservationId 
    ? `Your booking for ${propertyTitle} is confirmed! Reservation ID: ${reservationId}`
    : `Your booking for ${propertyTitle} is confirmed!`;
  
  toast.success(message, {
    duration: 5000,
    position: 'top-center',
    style: {
      background: '#10b981',
      color: '#fff',
      fontSize: '16px',
      padding: '16px',
    },
  });
} 