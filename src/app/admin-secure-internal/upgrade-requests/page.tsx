import React from 'react';
import { AdminUpgradeQueue } from '@/components/admin/AdminUpgradeQueue';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Business Upgrade Requests - Admin',
};

export default async function AdminUpgradeRequestsPage() {
  const session = await getSession(await headers());
  
  if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'SUPER_ADMIN')) {
    redirect('/admin-secure-internal/login');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminUpgradeQueue />
    </div>
  );
}
