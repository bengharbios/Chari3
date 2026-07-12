'use client';

import React, { useEffect, useState } from 'react';
import OnboardingWizard from '@/components/seller/onboarding/OnboardingWizard';
import { useAuthStore, useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SellerOnboardingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { locale } = useAppStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || !user) {
        router.push('/?login=true');
        return;
      }
      // Guard: Redirect to verification status page if account is pending or active
      if (user.accountStatus === 'pending' || user.accountStatus === 'active') {
        router.push('/seller/verification');
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.accountStatus === 'pending' || user.accountStatus === 'active') return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-foreground py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <a href="/seller/verification" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <svg className="w-4 h-4 mr-1 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {locale === 'ar' ? 'الرجوع لصفحة حالة التوثيق' : 'Back to verification status'}
        </a>
      </div>
      <OnboardingWizard />
    </div>
  );
}
