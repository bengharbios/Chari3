'use client';

import { type ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import Sidebar from './Sidebar';
import GentelellaSidebar from './gentelella/GentelellaSidebar';
import GentelellaHeader from './gentelella/GentelellaHeader';
import { useGentelellaTheme } from './gentelella/theme';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSidebarOpen } = useAppStore();
  const { user, isBuyerMode } = useAuthStore();
  const [dashboardTemplate, setDashboardTemplate] = useState<string>('default');
  const { isDark } = useGentelellaTheme();

  useEffect(() => {
    const isDashboardRole = user?.role && !['admin', 'buyer'].includes(user.role) && !isBuyerMode;
    if (isDashboardRole) {
      fetch('/api/settings/public')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings?.seller_dashboard_template) {
            setDashboardTemplate(data.settings.seller_dashboard_template);
          } else {
            setDashboardTemplate('default');
          }
        })
        .catch(() => setDashboardTemplate('default'));
    } else {
      setDashboardTemplate('default');
    }
  }, [user, isBuyerMode]);

  if (!user) return null;

  const isGentelella = dashboardTemplate === 'gentelella';

  return (
    <div id={isGentelella ? 'gentelella-root' : undefined} className={`flex-1 flex flex-col overflow-hidden ${isGentelella ? 'min-h-screen max-h-screen' : 'min-h-[calc(100dvh-var(--header-height))] max-h-[calc(100dvh-var(--header-height))]'}`}>
      <div className="flex flex-1 overflow-hidden">
        {isGentelella ? <GentelellaSidebar /> : <Sidebar />}
        <main
          className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden transition-all duration-300 flex flex-col ${isSidebarOpen ? 'lg:ms-0' : 'lg:ms-0'} ${
            isGentelella
              ? isDark
                ? 'bg-[#0f172a] text-[#cbd5e1]'
                : 'bg-[#F7F7F7] text-[#73879C]'
              : ''
          }`}
        >
          {isGentelella && <GentelellaHeader />}
          <div className={`p-4 md:p-6 lg:p-8 pb-24 md:pb-8 w-full flex-1 ${isGentelella ? '' : 'max-w-[1750px] mx-auto'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
