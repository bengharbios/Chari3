'use client';

import { type ReactNode } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSidebarOpen } = useAppStore();
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="flex flex-1">
      <Sidebar />
      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ms-0' : 'lg:ms-0'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
