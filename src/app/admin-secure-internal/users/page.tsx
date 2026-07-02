'use client';

import React, { Suspense } from 'react';
import UserManagementPage from '@/components/admin/UserManagementPage';
import { Loader2 } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm text-muted-foreground font-bold">جاري تحميل بيانات المستخدمين...</p>
      </div>
    }>
      <UserManagementPage />
    </Suspense>
  );
}
