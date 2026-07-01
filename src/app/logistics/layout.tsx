import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AppShell from '@/components/layout/AppShell';

export default function RoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AppShell>
  );
}
