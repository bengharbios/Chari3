'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import AdminSidebar from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Globe, LogOut, Menu } from 'lucide-react';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { adminLocale, setAdminLocale, logout, adminUser } = useAdminAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleLocale = () => {
    setAdminLocale(adminLocale === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900" />;
  }

  const isRTL = adminLocale === 'ar';

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
    >
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-navy text-white h-16 flex items-center justify-between px-6 shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button (Placeholder for now) */}
            <Button variant="ghost" size="icon" className="lg:hidden text-white">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-bold text-lg hidden md:block">
              {isRTL ? 'لوحة تحكم النظام' : 'System Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-white hover:bg-slate-700"
              onClick={toggleLocale}
            >
              <Globe className="h-4 w-4" />
              <span>{isRTL ? 'English' : 'عربي'}</span>
            </Button>

            <div className="text-sm hidden sm:block">
              <span className="text-slate-300">{isRTL ? 'مرحباً، ' : 'Welcome, '}</span>
              <span className="font-medium text-brand">{adminUser?.name || 'Admin'}</span>
            </div>
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-2 bg-red-600 hover:bg-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{isRTL ? 'خروج آمن' : 'Logout'}</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Children Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
