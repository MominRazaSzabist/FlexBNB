"use client";
import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs";
import { 
  CalendarIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/Host/DashboardLayout';
import DataTable from '../../components/Host/DataTable';
import StatsCard from '../../components/Host/StatsCard';
import toast from 'react-hot-toast';

interface Reservation {
  id: string;
  property: {
    id: string;
    title: string;
    image_url: string;
  };
  guest: {
    id: string;
    email: string;
    name: string;
  };
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_price: number | string;
  status: string;
  special_requests: string;
  created_at: string;
}

const ReservationsPage = () => {
  const { getToken, isSignedIn } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchReservations = async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const url = statusFilter 
        ? `${process.env.NEXT_PUBLIC_API_HOST}/api/booking/reservations/?status=${statusFilter}`
        : `${process.env.NEXT_PUBLIC_API_HOST}/api/booking/reservations/`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('[RESERVATIONS] API Response Status:', response.status);
      console.log('[RESERVATIONS] API URL:', url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[RESERVATIONS] API Error:', errorText);
        throw new Error(`Failed to fetch reservations: ${response.status}`);
      }

      const data = await response.json();
      console.log('[RESERVATIONS] API Response Data:', data);
      console.log('[RESERVATIONS] Data Type:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('[RESERVATIONS] Data Length:', Array.isArray(data) ? data.length : 'N/A');
      
      // Handle both array and object with results property
      const reservationsData = Array.isArray(data) 
        ? data 
        : (data.results || data.data || []);
      
      console.log('[RESERVATIONS] Processed Reservations:', reservationsData.length);
      
      // Normalize data - ensure total_price is a number (DecimalField from backend comes as string)
      const normalizedReservations = reservationsData.map((res: any) => ({
        ...res,
        total_price: typeof res.total_price === 'string' 
          ? parseFloat(res.total_price) 
          : (typeof res.total_price === 'number' ? res.total_price : 0),
        guests_count: typeof res.guests_count === 'string' 
          ? parseInt(res.guests_count, 10) 
          : (typeof res.guests_count === 'number' ? res.guests_count : 0),
      }));
      
      console.log('[RESERVATIONS] Normalized Reservations:', normalizedReservations);
      setReservations(normalizedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for new reservation events
  useEffect(() => {
    const handleNewReservation = () => {
      fetchReservations();
      toast.success('New reservation received!');
    };

    window.addEventListener('reservationCreated', handleNewReservation);

    return () => {
      window.removeEventListener('reservationCreated', handleNewReservation);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (reservationId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/booking/reservations/${reservationId}/status/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: 'approved' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve reservation');
      }

      toast.success('Reservation approved successfully!');
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error('Error approving reservation:', error);
      toast.error('Failed to approve reservation');
    }
  };

  const handleDecline = async (reservationId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/booking/reservations/${reservationId}/status/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: 'declined' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to decline reservation');
      }

      toast.success('Reservation declined');
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error('Error declining reservation:', error);
      toast.error('Failed to decline reservation');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || badges.cancelled;
  };

  const columns = [
    {
      key: 'property.title',
      label: 'Property',
      sortable: true,
      render: (value: string, row: Reservation) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">ID: {row.property.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'guest.name',
      label: 'Guest',
      sortable: true,
      render: (value: string, row: Reservation) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.guest.email}</div>
        </div>
      )
    },
    {
      key: 'check_in_date',
      label: 'Check-in',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'check_out_date',
      label: 'Check-out',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'guests_count',
      label: 'Guests',
      sortable: true
    },
    {
      key: 'total_price',
      label: 'Amount',
      sortable: true,
      render: (value: any) => {
        // Handle different value types
        if (value === null || value === undefined) {
          return '$0.00';
        }
        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(numValue)) {
          return '$0.00';
        }
        return `$${numValue.toFixed(2)}`;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Reservation) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="p-1 text-green-600 hover:text-green-800"
                title="Approve"
              >
                <CheckCircleIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDecline(row.id)}
                className="p-1 text-red-600 hover:text-red-800"
                title="Decline"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </>
          )}
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            View Details
          </button>
        </div>
      )
    }
  ];

  const filteredReservations = statusFilter 
    ? reservations.filter(res => res.status === statusFilter)
    : reservations;

  // Calculate stats
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    completed: reservations.filter(r => r.status === 'completed').length
  };

  if (loading) {
    return (
      <DashboardLayout title="Reservations" subtitle="Manage your bookings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <SignedIn>
        <DashboardLayout title="Reservations" subtitle="Manage your bookings">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total Reservations"
                value={stats.total}
                icon={<CalendarIcon className="h-6 w-6 text-blue-600" />}
              />
              <StatsCard
                title="Pending Requests"
                value={stats.pending}
                icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
              />
              <StatsCard
                title="Approved"
                value={stats.approved}
                icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
              />
              <StatsCard
                title="Completed"
                value={stats.completed}
                icon={<UserIcon className="h-6 w-6 text-purple-600" />}
              />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setStatusFilter('')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    statusFilter === '' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Reservations
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    statusFilter === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    statusFilter === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    statusFilter === 'completed' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Reservations Table */}
            <DataTable
              title="Reservations"
              subtitle={`${filteredReservations.length} reservations found`}
              columns={columns}
              data={filteredReservations}
              pageSize={10}
              emptyMessage="No reservations found"
            />
          </div>
        </DashboardLayout>
      </SignedIn>
      
      <SignedOut>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="mb-4 text-lg">You must be signed in to view Reservations.</p>
          <SignInButton />
        </div>
      </SignedOut>
    </>
  );
};

export default ReservationsPage; 