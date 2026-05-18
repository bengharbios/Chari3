'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminRootPage() {
  const { isAdminAuthenticated, logout, adminUser } = useAdminAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      // Redirect to login page relative to the current path
      const currentPath = window.location.pathname;
      window.location.href = `${currentPath}/login`;
    }
  }, [isMounted, isAdminAuthenticated]);

  if (!isMounted || !isAdminAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-brand" />
          <p className="text-slate-500 dark:text-slate-400">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    // Force reload to clean up states and trigger redirect
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-navy text-white h-16 flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-brand text-navy p-1.5 rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">لوحة تحكم النظام (المسار السري)</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-slate-300">مرحباً، </span>
            <span className="font-medium text-brand">{adminUser?.name || 'المدير'}</span>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm" 
            className="gap-2 bg-red-600 hover:bg-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>خروج آمن</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-slate-50 dark:bg-slate-900 overflow-auto">
        <div className="max-w-[1400px] mx-auto">
          <AdminDashboard />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        بوابة الإدارة الآمنة — ChariDay Enterprise Architecture
      </footer>
    </div>
  );
}
