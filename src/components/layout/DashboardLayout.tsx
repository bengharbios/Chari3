'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import Sidebar from './Sidebar';
import GentelellaSidebar from './gentelella/GentelellaSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSidebarOpen } = useAppStore();
  const { user, isBuyerMode } = useAuthStore();
  const [template, setTemplate] = useState('default');

  useEffect(() => {
    // Only sellers can have the Gentelella template, or maybe all dashboards if admin sets it.
    // Let's apply it generally based on the public setting if not a buyer
    if (user && user.role !== 'admin' && !isBuyerMode) {
      fetch('/api/settings/public')
        .then(res => res.json())
        .then(pub => {
          if (pub.success && pub.settings?.seller_dashboard_template) {
            setTemplate(pub.settings.seller_dashboard_template);
          }
        })
        .catch(() => {});
    }
  }, [user, isBuyerMode]);

  if (!user) return null;

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col">
      <div className="flex flex-1">
        {template === 'gentelella' ? <GentelellaSidebar /> : <Sidebar />}
        <main
          className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ms-0' : 'lg:ms-0'}`}
          style={{
            backgroundColor: template === 'gentelella' ? '#F7F7F7' : undefined
          }}
        >
          <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1750px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
