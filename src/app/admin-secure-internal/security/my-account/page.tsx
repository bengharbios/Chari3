'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShieldCheck } from 'lucide-react';
import AdminMyAccountSecurity from '@/components/admin/AdminMyAccountSecurity';

function t(locale: string, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

export default function AdminMyAccountSecurityPage() {
  const { locale } = useAppStore();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t(locale, 'أمان حسابي (إداري)', 'My Account Security (Admin)')}</h1>
          <p className="text-sm text-muted-foreground">{t(locale, 'إدارة كلمة المرور، البريد الإلكتروني، ورموز الاسترداد الطارئة لحسابك الإداري', 'Manage password, email, and emergency recovery codes for your admin account')}</p>
        </div>
      </div>

      <AdminMyAccountSecurity />
    </div>
  );
}
