'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShieldAlert } from 'lucide-react';
import CriticalActionReview from '@/components/admin/CriticalActionReview';

function t(locale: string, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

export default function AdminPendingActionsPage() {
  const { locale } = useAppStore();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t(locale, 'الإجراءات الحرجة المعلقة', 'Pending Critical Actions')}</h1>
          <p className="text-sm text-muted-foreground">{t(locale, 'مراجعة والموافقة على العمليات الحساسة التي تتطلب رقابة ثنائية', 'Review and approve sensitive operations requiring a two-person rule')}</p>
        </div>
      </div>

      <CriticalActionReview />
    </div>
  );
}
