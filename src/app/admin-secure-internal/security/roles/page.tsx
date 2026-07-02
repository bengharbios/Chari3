'use client';

import React, { Suspense } from 'react';
import RolesManagement from '@/components/admin/security/RolesManagement';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Loader2 } from 'lucide-react';

export default function RolesPage() {
  const { locale } = useTranslation();
  
  return (
    <Suspense fallback={
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm text-muted-foreground font-bold">جاري التحميل...</p>
      </div>
    }>
      <RolesManagement locale={locale} />
    </Suspense>
  );
}
