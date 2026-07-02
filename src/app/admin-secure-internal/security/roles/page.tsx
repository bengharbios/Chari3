import React from 'react';
import RolesManagement from '@/components/admin/security/RolesManagement';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Roles & Permissions | ChariDay Admin',
  description: 'Manage dynamic roles and permissions across the platform.',
};

export default async function RolesPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ar';
  
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <RolesManagement locale={locale} />
    </div>
  );
}
