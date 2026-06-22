'use client';
import React from 'react';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Wrench, Loader2 } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useOnboardingStore, restoreDraftFields, calcResumeStep } from '@/lib/store/onboarding';
import AppShell from '@/components/layout/AppShell';
import Header from '@/components/layout/Header';
      ) : (
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-muted-foreground">الصفحة غير موجودة</p>
          </div>
        </DashboardLayout>
      )}

      {isStorefrontPage && (
        <>
          <Footer />
          <BottomNav />
        </>
      )}
    </AppShell>
  );
}

export default function HomePage({ initialPage }: { initialPage?: PageType }) {
  return (
    <Suspense fallback={null}>
      <HomePageInner initialPage={initialPage} />
    </Suspense>
  );
}
