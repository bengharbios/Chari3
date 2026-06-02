'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { Loader2 } from 'lucide-react';

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
    <div className="max-w-[1400px] mx-auto">
      <Suspense fallback={
        <div className="h-[80vh] w-full flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <p className="text-sm font-bold text-muted-foreground">جاري تحميل لوحة التحكم...</p>
        </div>
      }>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
