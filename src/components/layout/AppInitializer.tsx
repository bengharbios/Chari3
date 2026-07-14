'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useOnboardingStore, restoreDraftFields, calcResumeStep } from '@/lib/store/onboarding';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { toast } from 'sonner';

const ITEM_LABELS: Record<string, { ar: string; en: string }> = {
  commercial_register: { ar: 'السجل التجاري', en: 'Commercial Register' },
  bank_account: { ar: 'الحساب المالي والبنكي', en: 'Bank Account' },
  manager_id: { ar: 'هوية المدير / الممثل القانوني', en: 'Manager ID' },
  national_id: { ar: 'إثبات الهوية الشخصية', en: 'National ID' },
  freelance_document: { ar: 'وثيقة النشاط / العمل الحر', en: 'Freelance Document' },
  liveness: { ar: 'التحقق الحي', en: 'Liveness Check' },
  commercial_license: { ar: 'الرخصة التجارية', en: 'Commercial License' },
  import_license: { ar: 'رخصة الاستيراد', en: 'Import License' },
  transport_license: { ar: 'رخصة النقل', en: 'Transport License' },
  insurance: { ar: 'شهادة التأمين', en: 'Insurance Certificate' },
  fleet_info: { ar: 'معلومات الأسطول', en: 'Fleet Information' },
};

export default function AppInitializer() {
  const { user, isAuthenticated, isBuyerMode } = useAuthStore();
  const { locale } = useTranslation();
  const { accountStatus } = useOnboardingStore();
  
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastKnownStatus = useRef<string | null>(null);
  const draftRestoredRef = useRef(false);

  useEffect(() => {
    fetch("/api/homepage?t=" + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .catch(() => ({}))
      .then((homepageData) => {
        if (homepageData.success) {
          if (homepageData.allowGuestCheckout !== undefined) {
            useAppStore.getState().setAllowGuestCheckout(homepageData.allowGuestCheckout);
          }
          if (homepageData.isMaintenance !== undefined) {
            useAppStore.getState().setIsMaintenance(homepageData.isMaintenance);
          }
        }
      });
  }, [user, isBuyerMode]);

  const fetchAndSyncStatus = useCallback(async (showToastOnChange: boolean = false) => {
    if (!user || user.role === 'admin' || user.role === 'buyer') return;

    try {
      const res = await fetch("/api/onboarding/status?userId=" + user.id);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      const store = useOnboardingStore.getState();
      const dbStatus = data.accountStatus;
      const prevStatus = lastKnownStatus.current;

      if (data.items && data.items.length > 0) {
        store.setVerificationItems(
          data.items.map((item: any) => ({
            id: item.key,
            labelAr: item.labelAr,
            labelEn: item.labelEn,
            status: item.status as 'verified' | 'pending' | 'rejected' | 'required',
            rejectionReason: item.rejectionReason,
          }))
        );
      }

      if (data.adminNotes) {
        store.setRejectionReason(data.adminNotes);
      } else if (data.rejectionReasons && data.rejectionReasons.length > 0) {
        const labels = data.rejectionReasons.map((key: string) => {
          const label = ITEM_LABELS[key];
          return label ? (locale === 'ar' ? label.ar : label.en) : key;
        });
        const reasonText = locale === 'ar'
          ? "تم رفض المستندات التالية: " + labels.join('، ')
          : "The following documents were rejected: " + labels.join(', ');
        store.setRejectionReason(reasonText);
      }

      if (data.rejectionReasons && data.rejectionReasons.length > 0) {
        store.setRejectedItems(data.rejectionReasons);
      }

      const isUserEditing = store.accountStatus === 'incomplete' && dbStatus === 'rejected';
      if (dbStatus && dbStatus !== prevStatus && !isUserEditing) {
        store.setAccountStatus(dbStatus);

        if ((dbStatus === 'incomplete' || dbStatus === 'rejected') && prevStatus === 'pending') {
          store.setIsSubmitted(false);
          store.setIsCompleted(false);
          if (showToastOnChange) {
            toast.error(
              locale === 'ar'
                ? 'لم يتم استلام طلبك. يرجى المحاولة مجدداً.'
                : 'Your submission was not received. Please try again.'
            );
          }
        }

        if (showToastOnChange && dbStatus === 'active') {
          toast.success(
            locale === 'ar'
              ? 'تم تم تفعيل حسابك! جميع الميزات متاحة الآن'
              : '✅ Your account has been activated! All features are now available'
          );
        } else if (showToastOnChange && dbStatus === 'rejected') {
          const labels = (data.rejectionReasons || []).map((key: string) => {
            const label = ITEM_LABELS[key];
            return label ? (locale === 'ar' ? label.ar : label.en) : key;
          });
          const reason = labels.length ? labels.join(locale === 'ar' ? '، ' : ', ') : '';
          toast.error(
            locale === 'ar'
              ? "تم رفض طلب التوثيق" + (reason ? ": " + reason : '') + ". يرجى مراجعة حالة التوثيق لإعادة التقديم."
              : "Verification rejected" + (reason ? ": " + reason : '') + ". Please check verification status to resubmit."
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

  useEffect(() => {
    if (!isAuthenticated || !user || user.role === 'admin' || user.role === 'buyer') return;
    if (accountStatus !== 'incomplete') return;
    if (draftRestoredRef.current) return;

    draftRestoredRef.current = true;

    const restoreDraft = async () => {
      try {
        const res = await fetch("/api/seller/onboarding?userId=" + user.id);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.verificationData) return;

        const vData = data.verificationData as Record<string, unknown>;
        const role = user.role;

        const hasData = Object.values(vData).some(
          (v) => v !== null && v !== undefined && v !== '' && v !== '[]' && v !== 0
        );

        if (hasData) {
          restoreDraftFields(role, vData);
          const resumeStep = calcResumeStep(role, vData);
          useOnboardingStore.getState().setStep(resumeStep);

          const stepNames: Record<string, Record<number, { ar: string; en: string }>> = {
            store_manager: { 0: { ar: 'التوثيق القانوني', en: 'Legal Verification' }, 1: { ar: 'التوثيق المالي', en: 'Financial Verification' }, 2: { ar: 'توثيق الهوية', en: 'Identity Verification' } },
            seller: { 0: { ar: 'إثبات الأهلية', en: 'Eligibility Proof' }, 1: { ar: 'التحقق البيومتري', en: 'Biometric Verification' }, 2: { ar: 'التوثيق المالي', en: 'Financial Verification' } },
            supplier: { 0: { ar: 'التراخيص التجارية', en: 'Commercial Licenses' }, 1: { ar: 'التوثيق المالي', en: 'Financial Verification' } },
            logistics: { 0: { ar: 'التراخيص', en: 'Licenses' }, 1: { ar: 'معلومات الأسطول', en: 'Fleet Information' } },
          };
          const totalSteps = stepNames[role] ? Object.keys(stepNames[role]).length : resumeStep + 1;
          const stepInfo = stepNames[role]?.[resumeStep];
          const stepLabel = stepInfo ? (locale === 'ar' ? stepInfo.ar : stepInfo.en) : '';

          toast.info(locale === 'ar' ? 'تم استعادة مسودة التوثيق الخاصة بك' : 'Your verification draft has been restored', {
            description: locale === 'ar'
              ? "سيتم استكمال من الخطوة " + (resumeStep + 1) + "/" + totalSteps + ": " + stepLabel
              : "Resuming from step " + (resumeStep + 1) + "/" + totalSteps + ": " + stepLabel,
            duration: 5000,
          });
        }
      } catch {
      }
    };

    restoreDraft();
  }, [isAuthenticated, user, accountStatus, locale]);

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

  return null;
}
