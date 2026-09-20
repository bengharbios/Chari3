'use client';

import React, { Suspense } from 'react';
import StoresPage from '@/components/admin/StoresPage';
import { Loader2 } from 'lucide-react';

export default function AdminStoresPage() {
  return (
    <Suspense fallback={
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm text-muted-foreground font-bold">جاري تحميل بيانات المتاجر...</p>
      </div>
    }>
      <StoresPage />
    </Suspense>
  );
}
