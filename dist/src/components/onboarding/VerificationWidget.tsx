'use client';

import React, { useMemo } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, X, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store';
import { useOnboardingStore, getVerificationItemsForRole } from '@/lib/store/onboarding';
import type { VerificationStatus } from '@/lib/store/onboarding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import QuickActionButton, { type QuickActionVariant } from '@/components/shared/QuickActionButton';

// ============================================
// STATUS CONFIG
// ============================================

const statusConfig: Record<
  VerificationStatus,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    labelAr: string;
    labelEn: string;
  }
> = {
  verified: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/20',
    labelAr: 'موثق',
    labelEn: 'Verified',
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    labelAr: 'قيد المراجعة',
    labelEn: 'Pending Review',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/20',
    labelAr: 'مرفوض',
    labelEn: 'Rejected',
  },
  required: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    labelAr: 'مطلوب',
    labelEn: 'Required',
  },
};

// ============================================
// STICKY STATUS BANNER
// ============================================

function StickyStatusBanner() {
  const { locale, setCurrentPage } = useAppStore();
  const { accountStatus, isBannerDismissed, dismissBanner, rejectionReason, isDraftSaved, clearDraftFlag } = useOnboardingStore();
  const isAr = locale === 'ar';

  // Banner shows for: incomplete (with draft), pending, rejected
  if (isBannerDismissed) return null;
  if (!accountStatus || accountStatus === 'active' || accountStatus === 'suspended') return null;
  // Don't show incomplete banner if no draft saved (wizard will show instead)
  if (accountStatus === 'incomplete' && !isDraftSaved) return null;

  // Config per status
  const bannerConfig: Record<string, {
    icon: React.ElementType;
    bg: string;
    border: string;
    text: string;
    subtext: string;
    iconColor: string;
    pulse: boolean;
    actionLabelAr: string;
    actionLabelEn: string;
    actionVariant: QuickActionVariant;
  }> = {
    incomplete: {
      icon: AlertTriangle,
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800/30',
      text: isAr ? 'لديك مسودة توثيق غير مكتملة' : 'You have an incomplete verification draft',
      subtext: isAr ? 'اكمل عملية التوثيق لتفعيل حسابك والبدء في البيع' : 'Complete verification to activate your account and start selling',
      iconColor: 'text-orange-600',
      pulse: false,
      actionLabelAr: 'استكمال التوثيق',
      actionLabelEn: 'Complete Verification',
      actionVariant: 'warning',
    },
    pending: {
      icon: Clock,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800/30',
      text: isAr ? 'جاري مراجعة بيانات حسابك...' : 'Your account is under review...',
      subtext: isAr ? 'سيتم التفعيل خلال 2-24 ساعة عمل' : 'Activation within 2-24 hours',
      iconColor: 'text-yellow-600',
      pulse: true,
      actionLabelAr: 'حالة التوثيق',
      actionLabelEn: 'Verification Status',
      actionVariant: 'subtle',
    },
    rejected: {
      icon: XCircle,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800/30',
      text: isAr
        ? `تم رفض طلب التوثيق${rejectionReason ? `: ${rejectionReason}` : ''}`
        : `Verification rejected${rejectionReason ? `: ${rejectionReason}` : ''}`,
      subtext: isAr ? 'يرجى مراجعة حالة التوثيق وإعادة التقديم' : 'Please check verification status and resubmit',
      iconColor: 'text-red-600',
      pulse: false,
      actionLabelAr: 'إعادة التقديم',
      actionLabelEn: 'Resubmit',
      actionVariant: 'danger',
    },
  };

  const config = bannerConfig[accountStatus];
  if (!config) return null;

  const Icon = config.icon;

  const handleAction = () => {
    if (accountStatus === 'incomplete') {
      // Reopen the wizard by clearing draft flag
      clearDraftFlag();
    } else {
      // Navigate to verification status page
      setCurrentPage('verification');
    }
  };

  return (
    <div className={cn('sticky top-0 z-30 border-b', config.bg, config.border)}>
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Icon className={cn('size-5 shrink-0', config.iconColor, config.pulse && 'animate-pulse')} />
          <div className="min-w-0 flex-1">
            <p className={cn(
              'text-sm font-medium',
              config.iconColor.replace('600', '800'),
              'dark:' + config.iconColor.replace('600', '200')
            )}>
              {config.text}
            </p>
            <p className={cn(
              'text-xs mt-0.5 line-clamp-1',
              config.iconColor.replace('600', '700'),
              'dark:' + config.iconColor.replace('600', '400')
            )}>
              {config.subtext}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* QUICK ACTION — Unified */}
          <QuickActionButton
            labelAr={config.actionLabelAr}
            labelEn={config.actionLabelEn}
            variant={config.actionVariant}
            onClick={handleAction}
          />

          <button
            onClick={dismissBanner}
            className={cn('p-1 rounded-full hover:opacity-80 transition-colors', config.iconColor)}
            aria-label={isAr ? 'إغلاق' : 'Dismiss'}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VERIFICATION ITEM ROW
// ============================================

interface VerificationItemRowProps {
  itemId: string;
  label: string;
  status: VerificationStatus;
  rejectionReason?: string;
  isAr: boolean;
  onComplete?: () => void;
}

function VerificationItemRow({
  label,
  status,
  rejectionReason,
  isAr,
  onComplete,
}: VerificationItemRowProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`p-1.5 rounded-full ${config.bg}`}>
        <Icon className={`size-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <Badge
            variant="secondary"
            className={`text-xs ${config.color} ${config.bg} border-0`}
          >
            {isAr ? config.labelAr : config.labelEn}
          </Badge>
        </div>
        {status === 'rejected' && rejectionReason && (
          <p className="text-xs text-red-500 mt-1">{rejectionReason}</p>
        )}
      </div>
      {status === 'required' && (
        <QuickActionButton
          labelAr="أكمل الآن"
          labelEn="Complete Now"
          variant="primary"
          onClick={onComplete}
          className="h-7"
        />
      )}
    </div>
  );
}

// ============================================
// REJECTED BANNER
// ============================================

interface RejectedBannerProps {
  rejectionReason: string | null;
  isAr: boolean;
  onRetry: () => void;
}

function RejectedBanner({ rejectionReason, isAr, onRetry }: RejectedBannerProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  if (!rejectionReason) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/30 p-4">
      <div className="flex items-start gap-3">
        <XCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
        <div className="flex-1 text-start">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {isAr ? 'تم رفض طلب التفعيل' : 'Activation Request Rejected'}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {rejectionReason}
          </p>
          {showDetails && (
            <div className="mt-3 text-xs text-red-500 bg-red-100 dark:bg-red-900/30 rounded p-2">
              {isAr
                ? 'يرجى مراجعة الأقسام المرفوضة أدناه وتصحيحها قبل إعادة التقديم.'
                : 'Please review the rejected sections below and correct them before resubmitting.'}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-red-200 text-red-600 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails
                ? isAr
                  ? 'إخفاء التفاصيل'
                  : 'Hide Details'
                : isAr
                  ? 'عرض التفاصيل'
                  : 'View Details'}
            </Button>
            {/* Retry — Unified Quick Action */}
            <QuickActionButton
              labelAr="إعادة المحاولة"
              labelEn="Retry"
              variant="danger"
              onClick={onRetry}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PENDING DASHBOARD NOTICE
// ============================================

interface PendingNoticeProps {
  isAr: boolean;
}

function PendingNotice({ isAr }: PendingNoticeProps) {
  const { accountStatus } = useOnboardingStore();

  if (accountStatus !== 'pending') return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
      <Lock className="size-3" />
      <span>
        {isAr
          ? '🔒 هذه الميزة متاحة بعد تفعيل الحساب'
          : '🔒 Available after account activation'}
      </span>
    </div>
  );
}

// ============================================
// VERIFICATION WIDGET (Main Card)
// ============================================

export default function VerificationWidget() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const {
    accountStatus,
    verificationItems,
    rejectionReason,
    rejectedItems,
    updateVerificationItem,
    setAccountStatus,
  } = useOnboardingStore();
  const isAr = locale === 'ar';

  // Compute verification items if none exist yet (initial mock state)
  const items = useMemo(() => {
    if (verificationItems.length > 0) return verificationItems;
    if (!user) return [];
    return getVerificationItemsForRole(user.role);
  }, [verificationItems, user]);

  // Calculate progress percentage
  const progress = useMemo(() => {
    if (items.length === 0) return 0;
    const verified = items.filter((i) => i.status === 'verified').length;
    return Math.round((verified / items.length) * 100);
  }, [items]);

  // Handle retry: reopen onboarding for rejected items
  const handleRetry = () => {
    rejectedItems.forEach((id) => {
      updateVerificationItem(id, 'required');
    });
    setAccountStatus('pending');
  };

  // Handle "Complete Now" for required items
  const handleCompleteItem = (itemId: string) => {
    // Simulate completing an item (in real app, would navigate to onboarding wizard step)
    updateVerificationItem(itemId, 'verified');
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Sticky Status Banner */}
      <StickyStatusBanner />

      {/* Rejected State Banner */}
      <RejectedBanner
        rejectionReason={rejectionReason}
        isAr={isAr}
        onRetry={handleRetry}
      />

      {/* Verification Status Card */}
      {(accountStatus === 'pending' || accountStatus === 'under_review' || accountStatus === 'rejected') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isAr ? '📊 حالة التوثيق' : '📊 Verification Status'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr ? 'التقدم الكلي' : 'Overall Progress'}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Separator />

            {/* Verification Items List */}
            <div className="divide-y divide-border">
              {items.map((item) => (
                <VerificationItemRow
                  key={item.id}
                  itemId={item.id}
                  label={isAr ? item.labelAr : item.labelEn}
                  status={item.status}
                  rejectionReason={item.rejectionReason}
                  isAr={isAr}
                  onComplete={() => handleCompleteItem(item.id)}
                />
              ))}
            </div>

            {/* Status Summary */}
            <div className="flex flex-wrap gap-2 pt-2">
              {items.filter((i) => i.status === 'verified').length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0">
                  ✓ {items.filter((i) => i.status === 'verified').length} {isAr ? 'موثق' : 'Verified'}
                </Badge>
              )}
              {items.filter((i) => i.status === 'pending').length > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-0">
                  ⏳ {items.filter((i) => i.status === 'pending').length} {isAr ? 'قيد المراجعة' : 'Pending'}
                </Badge>
              )}
              {items.filter((i) => i.status === 'rejected').length > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0">
                  ✗ {items.filter((i) => i.status === 'rejected').length} {isAr ? 'مرفوض' : 'Rejected'}
                </Badge>
              )}
              {items.filter((i) => i.status === 'required').length > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-0">
                  ⚠ {items.filter((i) => i.status === 'required').length} {isAr ? 'مطلوب' : 'Required'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export PendingNotice for external use */}
    </div>
  );
}

// Re-export StickyStatusBanner for use in page.tsx
export { StickyStatusBanner };

// Re-export PendingNotice as named export for use in dashboards
export { PendingNotice };
