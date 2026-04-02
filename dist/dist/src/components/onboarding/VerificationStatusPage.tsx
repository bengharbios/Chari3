'use client';

import { useMemo } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Lock, FileText, Phone, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store';
import { useOnboardingStore, getVerificationItemsForRole, restoreDraftFields, calcResumeStep } from '@/lib/store/onboarding';
import type { VerificationStatus } from '@/lib/store/onboarding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

function t(locale: 'ar' | 'en', ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

const statusConfig: Record<
  VerificationStatus,
  { icon: React.ElementType; color: string; bg: string; labelAr: string; labelEn: string }
> = {
  verified: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', labelAr: 'موثق', labelEn: 'Verified' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20', labelAr: 'قيد المراجعة', labelEn: 'Pending Review' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', labelAr: 'مرفوض', labelEn: 'Rejected' },
  required: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20', labelAr: 'مطلوب', labelEn: 'Required' },
};

export default function VerificationStatusPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const { accountStatus, verificationItems, rejectionReason, rejectedItems, setAccountStatus } = useOnboardingStore();
  const isAr = locale === 'ar';

  // Build items: always start with phone + email, then role-specific items
  const items = useMemo(() => {
    const contactItems: {
      id: string;
      labelAr: string;
      labelEn: string;
      status: 'verified' | 'pending' | 'rejected' | 'required';
    }[] = [];

    // Phone (always verified since OTP was completed)
    if (user?.phone) {
      contactItems.push({
        id: 'phone',
        labelAr: `رقم الهاتف (${user.phone})`,
        labelEn: `Phone (${user.phone})`,
        status: 'verified',
      });
    }

    // Email
    if (user?.email) {
      contactItems.push({
        id: 'email',
        labelAr: user.email.includes('@charyday.local')
          ? `البريد الإلكتروني (لم يُدخل بعد)`
          : `البريد الإلكتروني (${user.email})`,
        labelEn: user.email.includes('@charyday.local')
          ? `Email (not provided yet)`
          : `Email (${user.email})`,
        status: user.email.includes('@charyday.local') ? 'required' : 'verified',
      });
    }

    // Role-specific verification items
    let roleItems: typeof contactItems = [];
    if (verificationItems.length > 0) {
      roleItems = verificationItems.map((item) => ({
        id: item.id,
        labelAr: item.labelAr,
        labelEn: item.labelEn,
        status: item.status,
        rejectionReason: item.rejectionReason,
      }));
    } else if (user) {
      roleItems = getVerificationItemsForRole(user.role).map((item) => ({
        id: item.id,
        labelAr: item.labelAr,
        labelEn: item.labelEn,
        status: item.status,
      }));
    }

    return [...contactItems, ...roleItems];
  }, [verificationItems, user]);

  const progress = useMemo(() => {
    if (items.length === 0) return 0;
    const verified = items.filter((i) => i.status === 'verified').length;
    return Math.round((verified / items.length) * 100);
  }, [items]);

  const requiredCount = items.filter((i) => i.status === 'required').length;
  const rejectedCount = items.filter((i) => i.status === 'rejected').length;

  if (!user) return null;

  // Status overview
  const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    incomplete: { bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-700 dark:text-orange-300', icon: FileText },
    pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', text: 'text-yellow-700 dark:text-yellow-300', icon: Clock },
    rejected: { bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-700 dark:text-red-300', icon: XCircle },
    active: { bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-700 dark:text-green-300', icon: CheckCircle },
  };

  const currentStatus = statusColors[accountStatus] || statusColors.incomplete;
  const StatusIcon = currentStatus.icon;

  const statusLabels: Record<string, { ar: string; en: string }> = {
    incomplete: { ar: 'لم يكتمل', en: 'Incomplete' },
    pending: { ar: 'قيد المراجعة', en: 'Under Review' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    active: { ar: 'مفعّل', en: 'Active' },
  };

  const statusDescriptions: Record<string, { ar: string; en: string }> = {
    incomplete: { ar: 'لم تقم بإرسال طلب التوثيق بعد. يرجى إكمال الخطوات المطلوبة.', en: "You haven't submitted your verification request yet. Please complete the required steps." },
    pending: { ar: 'طلبك قيد المراجعة من قبل فريق المنصة. سيتم إعلامك بالنتيجة.', en: 'Your request is under review by our team. You will be notified of the result.' },
    rejected: { ar: 'تم رفض طلبك. يرجى مراجعة الأسباب أدناه وإعادة التقديم.', en: 'Your request was rejected. Please review the reasons below and resubmit.' },
    active: { ar: 'تم تفعيل حسابك بنجاح! يمكنك الآن استخدام جميع ميزات المنصة.', en: 'Your account is activated! You now have full access to all platform features.' },
  };

  // Navigate to dashboard to open the onboarding wizard
  const handleGoComplete = async () => {
    // Reset draft + submission state so the wizard shows again
    const store = useOnboardingStore.getState();
    store.setAccountStatus('incomplete');
    store.clearDraftFlag();

    // Directly fetch verification data and restore fields (don't rely solely on the async effect in page.tsx)
    try {
      const res = await fetch(`/api/onboarding?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.verificationData) {
          const vData = data.verificationData as Record<string, unknown>;
          // Check if there's any saved data
          const hasData = Object.values(vData).some(
            (v) => v !== null && v !== undefined && v !== '' && v !== '[]' && v !== 0
          );
          if (hasData) {
            restoreDraftFields(user.role, vData);
            const resumeStep = calcResumeStep(user.role, vData);
            store.setStep(resumeStep);
          }
        }
      }
    } catch {
      // Silently fail — the async effect in page.tsx will retry
    }

    // Navigate to role dashboard
    const rolePage: Record<string, string> = {
      store_manager: 'store',
      seller: 'seller',
      supplier: 'supplier',
      logistics: 'logistics',
    };
    useAppStore.getState().setCurrentPage(
      (rolePage[user.role] || 'login') as 'store' | 'seller' | 'supplier' | 'logistics' | 'login'
    );
  };

  const handleRetry = () => {
    rejectedItems.forEach((id) => {
      const store = useOnboardingStore.getState();
      store.updateVerificationItem(id, 'required');
    });
    setAccountStatus('incomplete');
    handleGoComplete();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">
            {t(isAr, 'حالة التوثيق', 'Verification Status')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(isAr, 'متابعة حالة توثيق حسابك', 'Track your account verification status')}
          </p>
        </div>
      </div>

      {/* Overall Status Card */}
      <Card className={currentStatus.bg}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-xl ${currentStatus.bg} flex items-center justify-center shrink-0`}>
              <StatusIcon className={`h-6 w-6 ${currentStatus.text}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  {statusLabels[accountStatus]?.[isAr ? 'ar' : 'en'] || accountStatus}
                </h2>
                <Badge
                  variant="secondary"
                  className={`${currentStatus.bg} ${currentStatus.text} border-0`}
                >
                  {progress}%
                </Badge>
              </div>
              <p className="text-sm mt-1 opacity-80">
                {statusDescriptions[accountStatus]?.[isAr ? 'ar' : 'en'] || ''}
              </p>
              <Progress value={progress} className="h-2 mt-3 max-w-xs" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejected Banner with Retry */}
      {accountStatus === 'rejected' && rejectionReason && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                  {t(isAr, 'سبب الرفض', 'Rejection Reason')}
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{rejectionReason}</p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={handleRetry}
                >
                  {t(isAr, 'إعادة التقديم', 'Resubmit')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Notice */}
      {accountStatus === 'pending' && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
          <Clock className="h-5 w-5 text-yellow-600 animate-pulse shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {t(isAr, 'جاري مراجعة بيانات حسابك...', 'Your account is being reviewed...')}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
              {t(isAr, 'سيتم إعلامك بالنتيجة خلال 2-24 ساعة عمل', 'You will be notified within 2-24 business hours')}
            </p>
          </div>
        </div>
      )}

      {/* Verification Items */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t(isAr, '📋 تفاصيل التوثيق', '📋 Verification Details')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {items.map((item) => {
                const config = statusConfig[item.status];
                const Icon = config.icon;
                const isContact = item.id === 'phone' || item.id === 'email';
                const itemRejectionReason = 'rejectionReason' in item ? (item as { rejectionReason?: string }).rejectionReason : undefined;
                return (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${config.bg}`}>
                        <Icon className={`size-4 ${config.color}`} />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isContact && (
                          <span className="text-muted-foreground shrink-0">
                            {item.id === 'phone' ? <Phone className="size-3.5" /> : <Mail className="size-3.5" />}
                          </span>
                        )}
                        <span className="text-sm font-medium text-foreground truncate">
                          {isAr ? item.labelAr : item.labelEn}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs shrink-0 ${config.color} ${config.bg} border-0`}
                      >
                        {isAr ? config.labelAr : config.labelEn}
                      </Badge>
                    </div>
                    {item.status === 'rejected' && itemRejectionReason && (
                      <p className="text-xs text-red-500 mt-1 ps-10">{itemRejectionReason}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary Badges */}
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-2">
              {items.filter((i) => i.status === 'verified').length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0">
                  ✓ {items.filter((i) => i.status === 'verified').length} {t(isAr, 'موثق', 'Verified')}
                </Badge>
              )}
              {items.filter((i) => i.status === 'pending').length > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-0">
                  ⏳ {items.filter((i) => i.status === 'pending').length} {t(isAr, 'قيد المراجعة', 'Pending')}
                </Badge>
              )}
              {rejectedCount > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0">
                  ✗ {rejectedCount} {t(isAr, 'مرفوض', 'Rejected')}
                </Badge>
              )}
              {requiredCount > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-0">
                  ⚠ {requiredCount} {t(isAr, 'مطلوب', 'Required')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Account Notice */}
      {accountStatus === 'active' && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t(isAr, '🎉 حسابك مفعّل بالكامل', 'Your account is fully activated')}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              {t(isAr, 'يمكنك الآن استخدام جميع ميزات المنصة', 'You now have full access to all platform features')}
            </p>
          </div>
        </div>
      )}

      {/* CTA: Complete verification (incomplete or rejected) */}
      {(accountStatus === 'incomplete' || accountStatus === 'rejected') && (
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {accountStatus === 'rejected'
                      ? t(isAr, 'أكمل البيانات المطلوبة وأعد التقديم', 'Complete required info and resubmit')
                      : t(isAr, 'أكمل خطوات التوثيق لتفعيل حسابك', 'Complete verification to activate your account')
                    }
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accountStatus === 'rejected'
                      ? t(isAr, `${rejectedCount} عنصر مرفوض يحتاج لتصحيح`, `${rejectedCount} rejected items need correction`)
                      : t(isAr, `${requiredCount} عنصر مطلوب لإكمال التحقق`, `${requiredCount} items required to complete verification`)
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGoComplete}
                className="gradient-navy text-white shrink-0"
              >
                {isAr ? (
                  <>
                    استكمال التوثيق
                    <ArrowLeft className="h-4 w-4 ms-2" />
                  </>
                ) : (
                  <>
                    Complete Verification
                    <ArrowRight className="h-4 w-4 me-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
