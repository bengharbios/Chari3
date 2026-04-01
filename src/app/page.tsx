'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useOnboardingStore, restoreDraftFields, calcResumeStep } from '@/lib/store/onboarding';
import AppShell from '@/components/layout/AppShell';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoginPage from '@/components/auth/LoginPage';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import VerificationStatusPage from '@/components/onboarding/VerificationStatusPage';
import { StickyStatusBanner } from '@/components/onboarding/VerificationWidget';
import AdminReviewQueue from '@/components/onboarding/AdminReviewQueue';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import UserManagementPage from '@/components/admin/UserManagementPage';
import RolesManagementPage from '@/components/admin/RolesManagementPage';
import StoreDashboard from '@/components/dashboards/StoreDashboard';
import SellerDashboard from '@/components/dashboards/SellerDashboard';
import LogisticsDashboard from '@/components/dashboards/LogisticsDashboard';
import BuyerDashboard from '@/components/dashboards/BuyerDashboard';
import { toast } from 'sonner';
import type { PageType, UserRole } from '@/types';

const DASHBOARD_MAP: Record<string, React.ComponentType> = {
  admin: AdminDashboard,
  'admin-users': UserManagementPage,
  'admin-roles': RolesManagementPage,
  'store-settings': StoreDashboard,
  'store-products': StoreDashboard,
  'store-orders': StoreDashboard,
  'store-staff': StoreDashboard,
  'store-analytics': StoreDashboard,
  store: StoreDashboard,
  'seller-products': SellerDashboard,
  'seller-orders': SellerDashboard,
  'seller-upgrade': SellerDashboard,
  seller: SellerDashboard,
  supplier: SellerDashboard,
  'supplier-products': SellerDashboard,
  'supplier-orders': SellerDashboard,
  'supplier-inventory': SellerDashboard,
  'logistics-active': LogisticsDashboard,
  'logistics-deliveries': LogisticsDashboard,
  'logistics-history': LogisticsDashboard,
  'logistics-earnings': LogisticsDashboard,
  logistics: LogisticsDashboard,
  'buyer-orders': BuyerDashboard,
  'buyer-wishlist': BuyerDashboard,
  'buyer-addresses': BuyerDashboard,
  'buyer-wallet': BuyerDashboard,
  'buyer-reviews': BuyerDashboard,
  buyer: BuyerDashboard,
  verification: VerificationStatusPage,
};

const ROLE_TO_PAGE: Record<UserRole, PageType> = {
  admin: 'admin',
  store_manager: 'store',
  seller: 'seller',
  supplier: 'supplier',
  logistics: 'logistics',
  buyer: 'buyer',
};

// Pages that should NOT be auto-redirected to role dashboard
const ALLOWED_EXTRA_PAGES: PageType[] = [
  'verification',
  'admin-users', 'admin-roles', 'admin-orders', 'admin-products', 'admin-stores',
  'admin-sellers', 'admin-shipping', 'admin-analytics', 'admin-settings',
];

export default function HomePage() {
  const { currentPage, setCurrentPage, locale } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  const {
    accountStatus, isCompleted, isSubmitted, isDraftSaved,
    setAccountStatus, setVerificationItems,
    setRejectionReason, setRejectedItems,
  } = useOnboardingStore();
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastKnownStatus = useRef<string | null>(null);
  const draftRestoredRef = useRef(false);

  const DashboardComponent = DASHBOARD_MAP[currentPage];

  // Navigate to correct dashboard on role change (but allow verification page)
  useEffect(() => {
    if (isAuthenticated && user) {
      if (ALLOWED_EXTRA_PAGES.includes(currentPage)) return;
      const targetPage = ROLE_TO_PAGE[user.role as UserRole];
      if (targetPage && currentPage !== targetPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [isAuthenticated, user?.role, currentPage, setCurrentPage]);

  // Fetch real verification status from the database and sync store
  const fetchAndSyncStatus = useCallback(async (showToastOnChange: boolean = false) => {
    if (!user || user.role === 'admin' || user.role === 'buyer') return;

    try {
      const res = await fetch(`/api/onboarding/status?userId=${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      const store = useOnboardingStore.getState();
      const dbStatus = data.accountStatus;
      const prevStatus = lastKnownStatus.current;

      // Sync verification items from DB
      if (data.items && data.items.length > 0) {
        store.setVerificationItems(
          data.items.map((item: { key: string; labelAr: string; labelEn: string; status: string; rejectionReason?: string }) => ({
            id: item.key,
            labelAr: item.labelAr,
            labelEn: item.labelEn,
            status: item.status as 'verified' | 'pending' | 'rejected' | 'required',
            rejectionReason: item.rejectionReason,
          }))
        );
      }

      // Sync rejection reason from adminNotes (actual human-readable message)
      if (data.adminNotes) {
        store.setRejectionReason(data.adminNotes);
      } else if (data.rejectionReasons && data.rejectionReasons.length > 0) {
        // Fallback: build reason from item keys if no admin notes
        const ITEM_LABELS: Record<string, { ar: string; en: string }> = {
          commercial_register: { ar: 'السجل التجاري', en: 'Commercial Register' },
          bank_account: { ar: 'الحساب البنكي', en: 'Bank Account' },
          manager_id: { ar: 'هوية المدير', en: 'Manager ID' },
          national_id: { ar: 'الهوية الوطنية', en: 'National ID' },
          freelance_document: { ar: 'وثيقة العمل الحر', en: 'Freelance Document' },
          liveness: { ar: 'التحقق الحي', en: 'Liveness Check' },
          commercial_license: { ar: 'رخصة تجارية', en: 'Commercial License' },
          import_license: { ar: 'رخصة الاستيراد', en: 'Import License' },
          transport_license: { ar: 'رخصة النقل', en: 'Transport License' },
          insurance: { ar: 'شهادة التأمين', en: 'Insurance Certificate' },
          fleet_info: { ar: 'معلومات الأسطول', en: 'Fleet Information' },
        };
        const labels = data.rejectionReasons.map((key: string) => {
          const label = ITEM_LABELS[key];
          return label ? (locale === 'ar' ? label.ar : label.en) : key;
        });
        const reasonText = locale === 'ar'
          ? `تم رفض المستندات التالية: ${labels.join('، ')}`
          : `The following documents were rejected: ${labels.join(', ')}`;
        store.setRejectionReason(reasonText);
      }

      // Set rejected items list from item keys
      if (data.rejectionReasons && data.rejectionReasons.length > 0) {
        store.setRejectedItems(data.rejectionReasons);
      }

      // Sync account status and show toast only on actual change from DB
      // IMPORTANT: Don't override 'incomplete' when DB says 'rejected' — the user
      // is intentionally editing after clicking "Complete Verification"
      const isUserEditing = store.accountStatus === 'incomplete' && dbStatus === 'rejected';
      if (dbStatus && dbStatus !== prevStatus && !isUserEditing) {
        store.setAccountStatus(dbStatus);

        // If local state thought we were submitted but DB says otherwise, fix the mismatch
        if ((dbStatus === 'incomplete' || dbStatus === 'rejected') && prevStatus === 'pending') {
          store.setIsSubmitted(false);
          store.setIsCompleted(false);
          if (showToastOnChange) {
            toast.error(
              locale === 'ar'
                ? 'لم يتم إرسال طلبك بنجاح. يرجى المحاولة مرة أخرى.'
                : 'Your submission was not received. Please try again.'
            );
          }
        }

        if (showToastOnChange && dbStatus === 'active') {
          toast.success(
            locale === 'ar'
              ? '🎉 تم تفعيل حسابك بنجاح! يمكنك الآن استخدام جميع الميزات'
              : '🎉 Your account has been activated! All features are now available'
          );
        } else if (showToastOnChange && dbStatus === 'rejected') {
          const reason = data.rejectionReasons?.length
            ? data.rejectionReasons.join(', ')
            : '';
          toast.error(
            locale === 'ar'
              ? `تم رفض طلب التوثيق${reason ? `: ${reason}` : ''}. يرجى مراجعة حالة التوثيق لإعادة التقديم.`
              : `Verification rejected${reason ? `: ${reason}` : ''}. Please check verification status to resubmit.`
          );
        }

        lastKnownStatus.current = dbStatus;
      }

      if (!prevStatus && dbStatus) {
        lastKnownStatus.current = dbStatus;
      }
    } catch {
      // Silently fail
    }
  }, [user, locale]);

  // Restore saved draft from DB when logging in with incomplete status
  useEffect(() => {
    if (!isAuthenticated || !user || user.role === 'admin' || user.role === 'buyer') return;
    if (accountStatus !== 'incomplete') return;
    if (draftRestoredRef.current) return;

    draftRestoredRef.current = true;

    const restoreDraft = async () => {
      try {
        const res = await fetch(`/api/onboarding?userId=${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.verificationData) return;

        const vData = data.verificationData as Record<string, unknown>;
        const role = user.role;

        // Check if there's any saved data
        const hasData = Object.values(vData).some(
          (v) => v !== null && v !== undefined && v !== '' && v !== '[]' && v !== 0
        );

        if (hasData) {
          // Restore fields into Zustand store
          restoreDraftFields(role, vData);

          // Calculate correct starting step
          const resumeStep = calcResumeStep(role, vData);
          useOnboardingStore.getState().setStep(resumeStep);

          // Build descriptive summary of what was restored
          const stepNames: Record<string, Record<number, { ar: string; en: string }>> = {
            store_manager: { 0: { ar: 'التوثيق القانوني', en: 'Legal Verification' }, 1: { ar: 'التوثيق المالي', en: 'Financial Verification' }, 2: { ar: 'توثيق الهوية', en: 'Identity Verification' } },
            seller: { 0: { ar: 'إثبات الأهلية', en: 'Eligibility Proof' }, 1: { ar: 'التوثيق البيومتري', en: 'Biometric Verification' }, 2: { ar: 'التوثيق المالي', en: 'Financial Verification' } },
            supplier: { 0: { ar: 'التراخيص التجارية', en: 'Commercial Licenses' }, 1: { ar: 'التوثيق المالي', en: 'Financial Verification' } },
            logistics: { 0: { ar: 'التراخيص', en: 'Licenses' }, 1: { ar: 'معلومات الأسطول', en: 'Fleet Information' } },
          };
          const totalSteps = stepNames[role] ? Object.keys(stepNames[role]).length : resumeStep + 1;
          const stepInfo = stepNames[role]?.[resumeStep];
          const stepLabel = stepInfo ? (locale === 'ar' ? stepInfo.ar : stepInfo.en) : '';

          const title = locale === 'ar'
            ? `تم استعادة مسودة التوثيق الخاصة بك`
            : `Your verification draft has been restored`;
          const description = locale === 'ar'
            ? `سيتم استكمال من الخطوة ${resumeStep + 1}/${totalSteps}: ${stepLabel}`
            : `Resuming from step ${resumeStep + 1}/${totalSteps}: ${stepLabel}`;

          toast.info(title, {
            description,
            duration: 5000,
          });
        }
      } catch {
        // Silently fail — wizard will start from step 0
      }
    };

    restoreDraft();
  }, [isAuthenticated, user, accountStatus, locale]);

  // Fetch status immediately on login + set up polling
  useEffect(() => {
    if (!isAuthenticated || !user || user.role === 'admin' || user.role === 'buyer') {
      lastKnownStatus.current = null;
      draftRestoredRef.current = false;
      return;
    }

    fetchAndSyncStatus(false);

    const interval = setInterval(() => {
      fetchAndSyncStatus(true);
    }, 15000);

    pollRef.current = interval;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, user?.id, fetchAndSyncStatus]);

  // Determine what to show
  const needsOnboarding = isAuthenticated && user && user.role !== 'buyer' && user.role !== 'admin' && !isCompleted && !isSubmitted && !isDraftSaved && accountStatus === 'incomplete';
  const needsAdminReview = isAuthenticated && user?.role === 'admin' && currentPage === 'admin';
  const needsBanner = isAuthenticated && user && user.role !== 'admin' && user.role !== 'buyer' && !needsOnboarding && (
    accountStatus === 'pending' || accountStatus === 'rejected' ||
    (accountStatus === 'incomplete' && isDraftSaved)
  );

  return (
    <AppShell>
      <Header />

      {!isAuthenticated ? (
        <main className="flex-1">
          <LoginPage />
        </main>
      ) : DashboardComponent ? (
        <DashboardLayout>
          {/* Sticky status banner at the top */}
          {needsBanner && <StickyStatusBanner />}

          {/* Onboarding Wizard Overlay (blocks dashboard until complete) */}
          {needsOnboarding && <OnboardingWizard />}

          {/* Admin Review Queue */}
          {needsAdminReview && <AdminReviewQueue />}

          {/* Main Dashboard Content */}
          <DashboardComponent />
        </DashboardLayout>
      ) : (
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-muted-foreground">الصفحة غير موجودة</p>
          </div>
        </DashboardLayout>
      )}

      <Footer />
    </AppShell>
  );
}
