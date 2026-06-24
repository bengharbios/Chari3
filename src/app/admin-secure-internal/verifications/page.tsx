'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShieldCheck } from 'lucide-react';
import AdminReviewQueue from '@/components/onboarding/AdminReviewQueue';

function t(locale: string, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

export default function AdminVerificationsPage() {
  const { locale } = useAppStore();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t(locale, 'توثيق المتاجر (KYC/KYB)', 'Store Verifications (KYC/KYB)')}</h1>
          <p className="text-sm text-muted-foreground">{t(locale, 'إدارة طلبات توثيق المتاجر والشركاء والمستقلين المكتملة للتفعيل', 'Manage completed store, partner, and freelancer verification requests for activation')}</p>
        </div>
      </div>

      <AdminReviewQueue />
    </div>
  );
}
