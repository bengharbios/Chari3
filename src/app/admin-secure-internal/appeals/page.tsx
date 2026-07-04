'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShieldAlert } from 'lucide-react';
import AdminAppealsQueue from '@/components/admin/AdminAppealsQueue';

function t(locale: string, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

export default function AdminAppealsPage() {
  const { locale } = useAppStore();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t(locale, 'استئنافات التعليق', 'Suspension Appeals')}</h1>
          <p className="text-sm text-muted-foreground">{t(locale, 'مراجعة وإدارة طلبات رفع التعليق المقدمة من التجار', 'Review and manage suspension appeal requests from merchants')}</p>
        </div>
      </div>

      <AdminAppealsQueue />
    </div>
  );
}
