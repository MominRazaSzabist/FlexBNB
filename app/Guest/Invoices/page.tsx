'use client';

import { useUser } from '@clerk/nextjs';

export default function InvoicesPage() {
  const { user } = useUser();

  if (!user) {
    return <div>Please sign in to view your invoices.</div>;
  }

  // TODO: Fetch and display invoices from backend

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Invoices</h1>
      <p className="text-gray-600">List of your booking invoices will appear here.</p>
      {/* Add invoice list component here */}
    </div>
  );
}