import React from 'react';
import OnboardingWizard from '@/components/seller/onboarding/OnboardingWizard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SellerOnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/login?callbackUrl=/seller/onboarding');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <OnboardingWizard />
    </div>
  );
}
