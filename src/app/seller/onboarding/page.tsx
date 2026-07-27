'use client';

import React, { useEffect, useState } from 'react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useAuthStore, useAppStore } from '@/lib/store';
import { useOnboardingStore } from '@/lib/store/onboarding';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SellerOnboardingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { locale } = useAppStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [checkingLiveStatus, setCheckingLiveStatus] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      router.push('/?login=true');
      return;
    }

    // Bypass check if state is already pending or active to prevent layout lag
    const cachedStatus = useOnboardingStore.getState().accountStatus;
    if (cachedStatus === 'pending' || cachedStatus === 'active') {
      router.push('/seller/verification');
      return;
    }

    const verifyLiveStatus = async () => {
      try {
        const res = await fetch(`/api/onboarding/status?userId=${user.id}&t=${Date.now()}`, {
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success) {
          if (data.accountStatus === 'pending' || data.accountStatus === 'active') {
            useOnboardingStore.getState().setAccountStatus(data.accountStatus);
            router.push('/seller/verification');
            return;
          }
        }
      } catch (err) {
        console.error('Failed to verify onboarding live status:', err);
      } finally {
        setCheckingLiveStatus(false);
      }
    };

    verifyLiveStatus();
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || !user) return null;

  if (checkingLiveStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-955 text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-semibold">
            {locale === 'ar' ? 'جاري التحقق من حالة حسابك...' : 'Verifying your account status...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-955 text-foreground py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
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
