import React from 'react';
import AdminLayoutWrapper from './_components/AdminLayoutWrapper';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getSession(await headers());
  } catch (e) {}

  return (
    <AdminLayoutWrapper initialSession={session}>
      {children}
    </AdminLayoutWrapper>
  );
}
