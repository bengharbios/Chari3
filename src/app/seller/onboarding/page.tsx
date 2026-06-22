'use client';

import React, { useEffect } from 'react';
import OnboardingWizard from '@/components/seller/onboarding/OnboardingWizard';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function SellerOnboardingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/?login=true');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <a href="/?page=verification" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4 mr-1 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          الرجوع لصفحة حالة التوثيق
        </a>
      </div>
      <OnboardingWizard />
    </div>
  );
}
