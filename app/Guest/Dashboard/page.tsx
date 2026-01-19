'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Minimal Card components inlined to avoid missing module
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-white shadow ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 border-b ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

// @/components/ui/button not available; inline a minimal Button component
const Button = ({
  children,
  className = '',
  asChild,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const Comp = asChild ? 'span' : 'button';
  return (
    <Comp
      className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
};

// lucide-react not installed; inline a simple spinner instead
const Loader2 = () => (
  <svg
    className="animate-spin h-8 w-8 text-current"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// axios is not installed; replace with native fetch wrapper
const apiService = {
  get: async (url: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${url}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  },
};

export default function GuestDashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    reservationsCount: 0,
    invoicesCount: 0,
    offersCount: 0,
    wishlistCount: 0,
  });

  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
      if (isSignedIn) {
        const fetchStats = async () => {
          try {
            const response = await apiService.get('/api/booking/guest/dashboard/stats/');
            setStats(response.data);
          } catch (error) {
            console.error('Failed to fetch guest stats:', error);
          }
        };
        fetchStats();
      }
    }
  }, [isLoaded, isSignedIn]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.firstName}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>My Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{stats.reservationsCount} upcoming reservations</p>
            <Button className="mt-2" asChild>
              <Link href="/MyReservations">Go to Reservations</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{stats.invoicesCount} invoices</p>
            <Button className="mt-2" asChild>
              <Link href="/Guest/Invoices">View Invoices</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{stats.offersCount} available offers</p>
            <Button className="mt-2" asChild>
              <Link href="/Guest/Offers">See Offers</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{stats.wishlistCount} saved properties</p>
            <Button className="mt-2" asChild>
              <Link href="/Guest/Wishlist">View Wishlist</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}