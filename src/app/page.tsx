'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Wrench, Loader2 } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useOnboardingStore, restoreDraftFields, calcResumeStep } from '@/lib/store/onboarding';
import AppShell from '@/components/layout/AppShell';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthPage from '@/components/auth/AuthPage';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import VerificationStatusPage from '@/components/onboarding/VerificationStatusPage';
import { StickyStatusBanner } from '@/components/onboarding/VerificationWidget';
import AdminReviewQueue from '@/components/onboarding/AdminReviewQueue';
import StoreDashboard from '@/components/dashboards/StoreDashboard';
import StoreProductsPage from '@/components/dashboards/StoreProductsPage';
import StoreOrdersPage from '@/components/dashboards/StoreOrdersPage';
import StoreSettingsPage from '@/components/dashboards/StoreSettingsPage';
import StoreStaffPage from '@/components/dashboards/StoreStaffPage';
import StoreCouponsPage from '@/components/dashboards/StoreCouponsPage';
import SellerDashboard from '@/components/dashboards/SellerDashboard';
import LogisticsDashboard from '@/components/dashboards/LogisticsDashboard';
import BuyerDashboard from '@/components/dashboards/BuyerDashboard';
import HomepagePage from '@/components/storefront/HomepagePage';
import ProductDetailPage from '@/components/storefront/ProductDetailPage';
import SellerProfilePage from '@/components/storefront/SellerProfilePage';
import SearchPage from '@/components/storefront/SearchPage';
import BillingPage from '@/components/seller/BillingPage';
import WalletPage from '@/components/seller/WalletPage';
import DebtsPage from '@/components/seller/DebtsPage';
import { toast } from 'sonner';
import type { PageType, UserRole } from '@/types';

const DASHBOARD_MAP: Record<string, React.ComponentType> = {
  'store-billing': BillingPage,
  'store-billing-plans': BillingPage,
  'store-billing-addons': BillingPage,
  'store-billing-pay': BillingPage,
  'store-billing-history': BillingPage,
  'seller-wallet': WalletPage,
  'seller-debts': DebtsPage,
  'seller-billing': BillingPage,
  'seller-billing-plans': BillingPage,
  'seller-billing-addons': BillingPage,
  'seller-billing-pay': BillingPage,
  'seller-billing-history': BillingPage,
  'store-settings': StoreSettingsPage,
  'store-products': StoreProductsPage,
  'store-orders': StoreOrdersPage,
  'store-coupons': StoreCouponsPage,
  'store-staff': StoreStaffPage,
  'store-analytics': StoreDashboard,
  store: StoreDashboard,
  'seller-products': SellerDashboard,
  'seller-orders': SellerDashboard,
  'seller-upgrade': SellerDashboard,
  'seller-settings': StoreSettingsPage,
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
  home: HomepagePage,
  search: SearchPage,
  login: AuthPage,
};

const ROLE_TO_PAGE: Record<UserRole, PageType> = {
  admin: 'buyer',
  store_manager: 'store',
  seller: 'seller',
  supplier: 'supplier',
  logistics: 'logistics',
  buyer: 'buyer',
};

// Pages that should NOT be auto-redirected to role dashboard
const ALLOWED_EXTRA_PAGES: PageType[] = [
  'verification', 'search',
];

function HomePageInner({ initialPage }: { initialPage?: PageType }) {
  const { currentPage, setCurrentPage, locale } = useAppStore();
  const { isAuthenticated, user, isBuyerMode } = useAuthStore();
  const { isAdminAuthenticated } = useAdminAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    accountStatus, isCompleted, isSubmitted, isDraftSaved,
    setAccountStatus, setVerificationItems,
    setRejectionReason, setRejectedItems,
  } = useOnboardingStore();
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastKnownStatus = useRef<string | null>(null);
  const draftRestoredRef = useRef(false);

  // Reconcile initialPage and searchParams to determine the correct page
  useEffect(() => {
    const view = searchParams?.get('view');
    const statePage = useAppStore.getState().currentPage;

    if (view && DASHBOARD_MAP[view]) {
       // Only accept the view if we are NOT given an initialPage, OR if the view matches the initialPage domain
       if (!initialPage || view === initialPage || view.startsWith(`${initialPage}-`)) {
          if (view !== statePage) {
            setCurrentPage(view as PageType);
          }
          return; // View handled, done.
       }
    }

    // If we get here, either there's no view, or the view is invalid/cross-domain.
    if (initialPage) {
      const isSameDomain = statePage === initialPage || statePage.startsWith(`${initialPage}-`);
      if (!isSameDomain) {
        setCurrentPage(initialPage);
      }
    }
  }, [initialPage, searchParams, setCurrentPage]);

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  useEffect(() => {
    fetch('/api/homepage')
      .then(r => r.json())
      .catch(() => ({}))
      .then((homepageData) => {
        if (homepageData.success) {
          if (homepageData.isMaintenance) setIsMaintenance(true);
          if (homepageData.allowGuestCheckout !== undefined) {
            useAppStore.getState().setAllowGuestCheckout(homepageData.allowGuestCheckout);
          }
        }
      })
      .finally(() => {
        setIsLoadingConfig(false);
      });
  }, []);

  // Synchronize browser URL bar with Zustand currentPage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (currentPage.startsWith('store')) targetPath = '/store';
      else if (currentPage.startsWith('seller')) targetPath = '/seller';
      else if (currentPage.startsWith('supplier')) targetPath = '/supplier';
      else if (currentPage.startsWith('logistics')) targetPath = '/logistics';
      else if (currentPage.startsWith('buyer')) targetPath = '/buyer';
      else if (currentPage === 'verification') targetPath = '/verification';

      const isBaseRoute = ['store', 'seller', 'supplier', 'logistics', 'buyer', 'verification', 'home', 'login'].includes(currentPage);
      if (!isBaseRoute && targetPath !== '/') {
        targetPath += `?view=${currentPage}`;
      }

      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== targetPath) {
        router.replace(targetPath, { scroll: false });
      }
    }
  }, [currentPage, router]);

  const DashboardComponent = DASHBOARD_MAP[currentPage];

  // Navigate to correct dashboard on role change (but allow verification page)
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user is in Buyer Mode, they can access any buyer-centric pages implicitly (home, search, checkout)
      if (isBuyerMode) {
        const isBuyerAllowed = ['home', 'search', 'product-detail', 'seller-profile', 'cart', 'buyer', 'buyer-orders', 'buyer-wishlist', 'buyer-addresses', 'buyer-wallet', 'buyer-reviews'].includes(currentPage);
        if (isBuyerAllowed) return;
      }

      const rolePrefix = user.role === 'store_manager' ? 'store' : user.role;
      const isRoleAllowed = currentPage === rolePrefix || currentPage.startsWith(`${rolePrefix}-`);
      const isGlobalAllowed = ['verification', 'home', 'search', 'product-detail', 'seller-profile', 'login'].includes(currentPage);
      const isAdminAllowed = ALLOWED_EXTRA_PAGES.includes(currentPage);

      if (isRoleAllowed || isGlobalAllowed || isAdminAllowed) return;
      const targetPage = ROLE_TO_PAGE[user.role as UserRole];
      if (targetPage && currentPage !== targetPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [isAuthenticated, user?.role, currentPage, setCurrentPage, isBuyerMode]);

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
  const isStorefrontPage = ['home', 'product-detail', 'seller-profile', 'login', 'verification'].includes(currentPage);

  if (isLoadingConfig) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
      </div>
    );
  }

  if (isMaintenance && !isAdminAuthenticated && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-white text-center font-cairo">
        {/* Glowing glassmorphic container */}
        <div className="max-w-2xl w-full p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
          {/* Subtle ambient light shapes */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Animated tool icon */}
          <div className="flex justify-center">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-400/20 to-indigo-500/20 border border-amber-400/30 shadow-inner animate-pulse">
              <Wrench className="h-12 w-12 text-amber-400 animate-bounce" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black leading-tight bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent">
              {locale === 'ar' ? 'أعمال صيانة مجدولة' : 'Scheduled Maintenance'}
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {locale === 'ar' 
                ? 'نعمل حالياً على ترقية خوادمنا وتطوير ميزات المنصة لنقدم لكم تجربة تسوق فائقة السرعة والأمان. سنعود للعمل قريباً جداً!'
                : 'We are currently upgrading our cloud infrastructure and core systems to deliver a premium, high-speed trading environment. We will be back online shortly!'}
            </p>
          </div>

          {/* Details / ETA */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400">
            {locale === 'ar' 
              ? 'يرجى مراجعة منصة الدعم الفني أو التواصل معنا لمزيد من التفاصيل.' 
              : 'Please contact support or consult your account manager if you require urgent assistance.'}
          </div>

          {/* Logo brand */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2">
            <span className="font-black text-lg text-amber-400">شاري داي</span>
            <span className="text-slate-500 font-light">|</span>
            <span className="font-extrabold text-sm tracking-wider">ChariDay</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {/* Dynamic Maintenance Warning Bar for Admins */}
      {isMaintenance && (isAdminAuthenticated || user?.role === 'admin') && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 py-2.5 px-4 text-center text-xs md:text-sm font-bold flex items-center justify-center gap-2 z-50 relative font-cairo shadow-md select-none">
          <Wrench className="h-4 w-4 animate-bounce text-slate-950" />
          <span>
            {locale === 'ar' 
              ? '⚠️ وضع الصيانة نشط حالياً — المنصة مغلقة أمام الزوار، وتظهر لك فقط بصفتك مسؤولاً للنظام.' 
              : '⚠️ Maintenance Mode Active — Storefront is offline for visitors, visible to you as administrator.'}
          </span>
        </div>
      )}
      <Header />

      {isStorefrontPage ? (
        <main className="flex-1">
          {currentPage === 'login' ? <AuthPage /> :
           currentPage === 'product-detail' ? <ProductDetailPage /> :
           currentPage === 'seller-profile' ? <SellerProfilePage /> :
           currentPage === 'verification' ? <VerificationStatusPage /> :
           <HomepagePage />}
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
      <BottomNav />
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
