'use client';
import React from 'react';

import { useState, useEffect } from 'react';
import {
  TrendingUp, Package, Star, ShieldCheck, ArrowLeft, ArrowRight,
  Wallet, AlertTriangle, ChevronUp, BarChart3, Clock, CheckCircle,
  XCircle, Eye, Plus, Edit, Trash2, Trophy, Target, Zap, Wrench, Loader2, Upload, X, Layers,
  LayoutGrid, List, ClipboardCheck, Truck, CheckSquare, Check,
  ShieldAlert, Ban, Lock, Info, Activity
} from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useOnboardingStore } from '@/lib/store/onboarding';
import { useAppStore as appStore } from '@/lib/store';
import { toast } from 'sonner';
import SellerChatTab from '@/components/seller/chat/SellerChatTab';
import {
  Card as TremorCard,
  Metric,
  Text,
  AreaChart,
  DonutChart,
  Title,
  Flex,
  BadgeDelta,
  Grid as TremorGrid,
  ProgressBar
} from '@tremor/react';

const DZD = (n: number) => `${Number(n || 0).toLocaleString('ar-DZ')} د.ج`;

const LEVEL_INFO: Record<number, { name: string; badge: string; color: string }> = {
  1: { name: 'صاعد', badge: '🌱', color: 'from-gray-500 to-gray-600' },
  2: { name: 'نشط', badge: '⭐', color: 'from-blue-500 to-blue-600' },
  3: { name: 'محترف', badge: '🌟', color: 'from-teal-500 to-teal-600' },
  4: { name: 'متميز', badge: '💫', color: 'from-purple-500 to-purple-600' },
  5: { name: 'خبير', badge: '🔥', color: 'from-orange-500 to-orange-600' },
  6: { name: 'نجم', badge: '💎', color: 'from-cyan-500 to-cyan-600' },
  7: { name: 'ستار', badge: '👑', color: 'from-yellow-500 to-amber-600' },
  8: { name: 'ليجند', badge: '🏆', color: 'from-rose-500 to-red-600' },
  9: { name: 'إمبراطور', badge: '🦅', color: 'from-indigo-500 to-violet-600' },
  10: { name: 'أسطورة', badge: '🌠', color: 'from-amber-400 to-yellow-500' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'جديد', color: 'bg-blue-100 text-blue-700', icon: Clock },
  processing: { label: 'قيد التجهيز', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  shipped:    { label: 'تم الشحن', color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
  delivered:  { label: 'مكتمل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled:  { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: XCircle },
};

interface DashboardData {
  seller: {
    storeName?: string;
    rating: number;
    level: number;
    completionRate: number;
    responseRate: number;
    totalSales: number;
    totalEarnings: number;
    package?: { name: string; commissionRate: number; maxProducts: number };
  };
  kpis: {
    monthRevenue: number;
    monthCommission: number;
    monthNetEarnings: number;
    monthOrderCount: number;
    totalSales: number;
    totalEarnings: number;
    rating: number;
    level: number;
    completionRate: number;
    responseRate: number;
    walletBalance: number;
    walletCurrency?: string;
  };
  currency?: string;
  storeStatus?: {
    isActive: boolean;
    isSuspended: boolean;
    suspensionReason: string | null;
    subscriptionStatus: string | null;
    subscriptionEndDate: string | null;
    trialEndsAt: string | null;
    cancelReason: string | null;
    overrideNote: string | null;
  };
  products: { id: string; name: string; price: number; comparePrice?: number; stock: number; status: string; soldCount: number; rating: number; images?: any; category?: any }[];
  recentOrders: { order: { orderNumber: string; status: string; total: number; createdAt: string }; product: { name: string; price: number }; quantity: number; total: number }[];
  reviews: { id: string; rating: number; comment?: string; sellerReply?: string; createdAt: string }[];
  challenges: { id: string; title: string; description?: string; type: string; targetValue: number; rewardValue: string; endsAt: string }[];
  sellerLevel?: { level: number; nameAr: string; maxProducts: number; commissionDiscount: number };
  nextLevel?: { level: number; nameAr: string; minCustomers: number; minRating: number; minCompletionRate: number };
  pendingWithdrawals: { id: string; amount: number; method: string; createdAt: string }[];
}

// ── Suspension Banner Component ─────────────────────────────────────────────────
function SuspensionBanner({ storeStatus, t, isAr }: {
  storeStatus: NonNullable<DashboardData['storeStatus']>;
  t: (ar: string, en: string) => string;
  isAr: boolean;
}) {
  const reasonConfig: Record<string, {
    icon: React.ElementType;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    gradient: string;
    iconColor: string;
    borderColor: string;
  }> = {
    EXPIRED: {
      icon: Clock,
      titleAr: '⏰ انتهى اشتراكك',
      titleEn: '⏰ Your Subscription Has Expired',
      descAr: 'انتهت صلاحية اشتراكك. متجرك غير مرئي للمشترين حالياً. يرجى تجديد اشتراكك لإعادة تفعيل متجرك.',
      descEn: 'Your subscription has expired. Your store is currently invisible to buyers. Please renew your subscription to reactivate your store.',
      gradient: 'from-amber-500/15 via-orange-500/10 to-amber-500/5',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-500/30',
    },
    SUSPENDED: {
      icon: Ban,
      titleAr: '🚫 تم تعليق متجرك',
      titleEn: '🚫 Your Store Has Been Suspended',
      descAr: 'تم تعليق متجرك من قبل إدارة المنصة. متجرك غير مرئي للمشترين ولا يمكنك إجراء أي تغييرات. تواصل مع الدعم لمعرفة السبب.',
      descEn: 'Your store has been suspended by platform administration. Your store is invisible to buyers and you cannot make any changes. Contact support for details.',
      gradient: 'from-red-500/15 via-rose-500/10 to-red-500/5',
      iconColor: 'text-red-500',
      borderColor: 'border-red-500/30',
    },
    CANCELLED: {
      icon: XCircle,
      titleAr: '❌ تم إلغاء اشتراكك',
      titleEn: '❌ Your Subscription Was Cancelled',
      descAr: 'تم إلغاء اشتراكك. متجرك غير مرئي للمشترين. يمكنك إعادة الاشتراك لتفعيل متجرك من جديد.',
      descEn: 'Your subscription has been cancelled. Your store is invisible to buyers. You can resubscribe to reactivate your store.',
      gradient: 'from-gray-500/15 via-slate-500/10 to-gray-500/5',
      iconColor: 'text-gray-500',
      borderColor: 'border-gray-500/30',
    },
    ADMIN_DISABLED: {
      icon: ShieldAlert,
      titleAr: '🛑 متجرك غير نشط',
      titleEn: '🛑 Your Store Is Inactive',
      descAr: 'تم إيقاف متجرك من قبل إدارة المنصة. لا يمكنك إجراء أي تغييرات حتى يتم إعادة تفعيله. تواصل مع الدعم للمساعدة.',
      descEn: 'Your store has been deactivated by platform administration. You cannot make any changes until it is reactivated. Contact support for assistance.',
      gradient: 'from-red-500/15 via-rose-500/10 to-red-500/5',
      iconColor: 'text-red-600',
      borderColor: 'border-red-500/30',
    },
  };

  const reason = storeStatus.suspensionReason || 'ADMIN_DISABLED';
  const config = reasonConfig[reason] || reasonConfig.ADMIN_DISABLED;
  const ReasonIcon = config.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 ${config.borderColor} bg-gradient-to-r ${config.gradient} p-0`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
      
      <div className="relative p-5 sm:p-6">
        {/* Top row: Icon + Title */}
        <div className="flex items-start gap-4">
          <div className={`shrink-0 p-3 rounded-2xl bg-background/80 backdrop-blur-sm border ${config.borderColor} shadow-sm`}>
            <ReasonIcon className={`size-7 sm:size-8 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-foreground leading-tight">
              {isAr ? config.titleAr : config.titleEn}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {isAr ? config.descAr : config.descEn}
            </p>

            {/* Admin note if available */}
            {storeStatus.overrideNote && (
              <div className="mt-3 p-3 rounded-xl bg-background/60 border border-border/50 text-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1">
                  <Info className="size-3.5" />
                  {t('ملاحظة الإدارة:', 'Admin Note:')}
                </div>
                <p className="text-foreground/80">{storeStatus.overrideNote}</p>
              </div>
            )}

            {/* Cancel reason if available */}
            {storeStatus.cancelReason && reason === 'CANCELLED' && (
              <div className="mt-3 p-3 rounded-xl bg-background/60 border border-border/50 text-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1">
                  <Info className="size-3.5" />
                  {t('سبب الإلغاء:', 'Cancellation Reason:')}
                </div>
                <p className="text-foreground/80">{storeStatus.cancelReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-5 ps-0 sm:ps-16">
          {(reason === 'EXPIRED' || reason === 'CANCELLED') && (
            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              onClick={() => {
                // Navigate to subscription/upgrade page
                useAppStore.getState().setCurrentPage('seller-upgrade' as any);
              }}
            >
              <Zap className="size-4" />
              {t('تجديد الاشتراك', 'Renew Subscription')}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => {
              // Open support / contact page
              window.open('mailto:support@chariday.com', '_blank');
            }}
          >
            <AlertTriangle className="size-4" />
            {t('تواصل مع الدعم', 'Contact Support')}
          </Button>
        </div>
      </div>

      {/* Persistent warning strip at bottom */}
      <div className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold ${config.iconColor} bg-background/40 border-t ${config.borderColor}`}>
        <Lock className="size-3.5" />
        {t(
          'لوحة التحكم في وضع القراءة فقط — لا يمكنك إضافة أو تعديل أو حذف أي شيء',
          'Dashboard is in read-only mode — you cannot add, edit, or delete anything'
        )}
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const { currentPage } = useAppStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [data, setData] = useState<DashboardData | null>(null);
  
  const walletCurrency = data?.kpis?.walletCurrency || 'DZD';
  const DZD = (n: number) => {
    const formattedAmount = Number(n || 0).toLocaleString(isAr ? 'ar-DZ' : 'en-US');
    if (isAr) {
      return walletCurrency === 'DZD' ? `${formattedAmount} د.ج` : `${formattedAmount} ${walletCurrency}`;
    }
    return `${walletCurrency} ${formattedAmount}`;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [verificationData, setVerificationData] = useState<any>(null);

  const refreshData = () => {
    if (!user?.id) return;
    setIsLoading(true);
    
    Promise.all([
      fetch(`/api/seller/dashboard?userId=${user.id}`).then(r => r.json()),
      fetch(`/api/seller/verification`).then(r => r.json())
    ])
      .then(([dashboardRes, verificationRes]) => {
        if (dashboardRes.success) setData(dashboardRes);
        if (verificationRes.success) setVerificationData(verificationRes.verification);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  // Store suspension check
  const isSuspended = data?.storeStatus?.isSuspended === true;

  // Show different sub-pages
  if (currentPage === 'seller-products' || currentPage === 'supplier-products' || currentPage === 'store-products') {
    // Block add/edit when suspended
    if (showAddForm && !isSuspended) {
      return (
        <ProductFormTab
          product={editingProduct}
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onSave={refreshData}
          storeId={user?.id || ''}
          sellerId={user?.id || ''}
          t={t}
          isAr={isAr}
        />
      );
    }
    return (
      <div className="space-y-4">
        {isSuspended && data?.storeStatus && (
          <SuspensionBanner storeStatus={data.storeStatus} t={t} isAr={isAr} />
        )}
        <SellerProductsTab
          data={data}
          isLoading={isLoading}
          t={t}
          isAr={isAr}
          onAddClick={() => {
            if (isSuspended) {
              toast.error(isAr ? 'لا يمكنك إضافة منتجات — متجرك غير نشط' : 'Cannot add products — your store is inactive');
              return;
            }
            setEditingProduct(null);
            setShowAddForm(true);
          }}
          onEditClick={(prod) => {
            if (isSuspended) {
              toast.error(isAr ? 'لا يمكنك تعديل المنتجات — متجرك غير نشط' : 'Cannot edit products — your store is inactive');
              return;
            }
            setEditingProduct(prod);
            setShowAddForm(true);
          }}
          onDeleteSuccess={refreshData}
        />
      </div>
    );
  }
  if (currentPage === 'seller-orders' || currentPage === 'supplier-orders' || currentPage === 'store-orders') return (
    <div className="space-y-4">
      {isSuspended && data?.storeStatus && (
        <SuspensionBanner storeStatus={data.storeStatus} t={t} isAr={isAr} />
      )}
      <SellerOrdersTab data={data} isLoading={isLoading} t={t} isAr={isAr} onRefresh={refreshData} />
    </div>
  );

  if (currentPage === 'seller-messages') return (
    <div className="space-y-4">
      {isSuspended && data?.storeStatus && (
        <SuspensionBanner storeStatus={data.storeStatus} t={t} isAr={isAr} />
      )}
      <SellerChatTab />
    </div>
  );

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted" />)}
    </div>
  );

  const kpis = data?.kpis;
  const lvl = kpis?.level ?? 1;
  const lvlInfo = LEVEL_INFO[lvl] ?? LEVEL_INFO[1];
  const nextLevel = data?.nextLevel;

  return (
    <div className="space-y-6 pb-12">
      {/* Suspension Banner - always at top, cannot be dismissed */}
      {isSuspended && data?.storeStatus && (
        <SuspensionBanner storeStatus={data.storeStatus} t={t} isAr={isAr} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">{t('لوحة تحكم التاجر', 'Seller Dashboard')}</h1>
          <p className="text-muted-foreground text-sm">{data?.seller?.storeName || user?.name}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${lvlInfo.color} text-white`}>
          <span className="text-xl">{lvlInfo.badge}</span>
          <div>
            <p className="text-xs opacity-80">{t('المستوى', 'Level')} {lvl}</p>
            <p className="text-sm font-bold">{lvlInfo.name}</p>
          </div>
        </div>
      </div>

      {/* Verification Banner */}
      {verificationData && verificationData.status !== 'APPROVED' && (
        <div className={`p-4 rounded-xl border flex items-start gap-4 ${
          verificationData.status === 'NOT_SUBMITTED' ? 'bg-blue-50 border-blue-200' :
          verificationData.status === 'PENDING_REVIEW' ? 'bg-yellow-50 border-yellow-200' :
          verificationData.status === 'REJECTED' ? 'bg-red-50 border-red-200' :
          'bg-orange-50 border-orange-200'
        }`}>
          <ShieldCheck className={`h-6 w-6 mt-0.5 ${
            verificationData.status === 'NOT_SUBMITTED' ? 'text-blue-600' :
            verificationData.status === 'PENDING_REVIEW' ? 'text-yellow-600' :
            verificationData.status === 'REJECTED' ? 'text-red-600' :
            'text-orange-600'
          }`} />
          <div className="flex-1">
            <h3 className="font-bold text-sm">
              {verificationData.status === 'NOT_SUBMITTED' ? t('أكمل توثيق متجرك', 'Complete your store verification') :
               verificationData.status === 'PENDING_REVIEW' ? t('وثائقك قيد المراجعة', 'Your documents are under review') :
               verificationData.status === 'REJECTED' ? t('تم رفض التوثيق', 'Verification Rejected') :
               t('مطلوب إعادة رفع بعض الوثائق', 'Requires resubmitting some documents')}
            </h3>
            <p className="text-xs mt-1 opacity-80">
              {verificationData.status === 'NOT_SUBMITTED' ? t('يرجى رفع الوثائق المطلوبة (الهوية، السجل التجاري) لتفعيل كافة المزايا.', 'Please upload the required documents (ID, Commercial Register) to unlock all features.') :
               verificationData.status === 'PENDING_REVIEW' ? t('سنقوم بمراجعة طلبك والرد في أقرب وقت.', 'We will review your application and respond shortly.') :
               t('يرجى مراجعة الأسباب المذكورة وإعادة تقديم الطلب.', 'Please review the reasons mentioned and resubmit.')}
            </p>
            {verificationData.status !== 'PENDING_REVIEW' && (
              <Button size="sm" className="mt-3" onClick={() => useAppStore.getState().setCurrentPage('verification' as any)}>
                {t('الذهاب لصفحة التوثيق', 'Go to Verification Page')}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards - Tremor */}
      <TremorGrid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <TremorCard decoration="top" decorationColor="emerald" className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg">
          <Text>{t('أرباح الشهر', 'Month Earnings')}</Text>
          <Flex className="mt-2 gap-2" justifyContent="start" alignItems="baseline">
            <Metric className="font-black text-foreground">{DZD(kpis?.monthNetEarnings ?? 0)}</Metric>
            <BadgeDelta deltaType="moderateIncrease">+5%</BadgeDelta>
          </Flex>
        </TremorCard>
        
        <TremorCard decoration="top" decorationColor="blue" className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg">
          <Text>{t('طلبات الشهر', 'Month Orders')}</Text>
          <Flex className="mt-2 gap-2" justifyContent="start" alignItems="baseline">
            <Metric className="font-black text-foreground">{kpis?.monthOrderCount ?? 0}</Metric>
            <BadgeDelta deltaType="increase">+12%</BadgeDelta>
          </Flex>
        </TremorCard>

        <TremorCard decoration="top" decorationColor="amber" className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg">
          <Text>{t('التقييم العام', 'Overall Rating')}</Text>
          <Flex className="mt-2 gap-2" justifyContent="start" alignItems="baseline">
            <Metric className="font-black text-foreground">{Number(kpis?.rating ?? 0).toFixed(1)} ⭐</Metric>
            <BadgeDelta deltaType="unchanged">0%</BadgeDelta>
          </Flex>
        </TremorCard>

        <TremorCard decoration="top" decorationColor="purple" className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg">
          <Text>{t('رصيد المحفظة', 'Wallet Balance')}</Text>
          <Flex className="mt-2 gap-2" justifyContent="start" alignItems="baseline">
            <Metric className="font-black text-foreground">{DZD(kpis?.walletBalance ?? 0)}</Metric>
            <BadgeDelta deltaType="moderateIncrease">+8%</BadgeDelta>
          </Flex>
        </TremorCard>
      </TremorGrid>

      {/* Level Progress */}
      {nextLevel && (
        <TremorCard className="border-primary/20 bg-primary/5 ring-0 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              <Title className="text-foreground">{t('تقدمك نحو المستوى', 'Progress to Level')} {nextLevel.level} — {nextLevel.nameAr}</Title>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30">{t('مستوى', 'Level')} {lvl} / 10</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: t('معدل الإكمال', 'Completion'), current: kpis?.completionRate ?? 0, target: nextLevel.minCompletionRate, unit: '%', color: 'emerald' },
              { label: t('التقييم', 'Rating'), current: kpis?.rating ?? 0, target: nextLevel.minRating, unit: '⭐', color: 'amber' },
              { label: t('العملاء', 'Customers'), current: data?.seller?.totalSales ?? 0, target: nextLevel.minCustomers, unit: '', color: 'blue' },
            ].map((m) => {
              const progress = Math.min(100, (m.current / (m.target || 1)) * 100);
              return (
                <div key={m.label}>
                  <Flex className="mb-2">
                    <Text>{m.label}</Text>
                    <Text className="font-bold">{Number(m.current).toFixed(m.unit === '%' ? 0 : 1)}{m.unit} / {m.target}{m.unit}</Text>
                  </Flex>
                  <ProgressBar value={progress} color={m.color as any} className="mt-2" />
                </div>
              );
            })}
          </div>
        </TremorCard>
      )}

      {/* Conversion Rate & Product Traffic Analytics */}
      {data?.products && data.products.length > 0 && (
        <TremorCard className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg mt-4">
          <div className="mb-4">
            <Title className="text-foreground flex items-center gap-2">
              <Activity className="size-5 text-blue-500" />
              {isAr ? 'معدل التحويل وزيارات المنتجات' : 'Conversion Rate & Product Traffic'}
            </Title>
            <Text>
              {isAr ? 'نسبة المشترين الفعليين مقارنة بعدد زوار منتجاتك.' : 'The percentage of actual buyers compared to product visitors.'}
            </Text>
          </div>
          {(() => {
            const totalViews = data.products.reduce((sum, p: any) => sum + (p.viewCount || 0), 0);
            const totalSold = data.products.reduce((sum, p: any) => sum + (p.soldCount || 0), 0);
            const conversionRate = totalViews > 0 ? (Number(totalSold) / Number(totalViews) * 100).toFixed(1) : '0';
            const progress = Math.min(100, (parseFloat(conversionRate) / 3.5) * 100);
            return (
              <div className="space-y-6">
                <TremorGrid numItems={1} numItemsSm={3} className="gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/10 p-4 rounded-xl border border-border text-center">
                    <Text>{isAr ? 'مشاهدات المنتجات' : 'Product Views'}</Text>
                    <Metric className="text-amber-500 mt-2">{totalViews.toLocaleString()}</Metric>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/10 p-4 rounded-xl border border-border text-center">
                    <Text>{isAr ? 'القطع المباعة' : 'Units Sold'}</Text>
                    <Metric className="text-green-500 mt-2">{totalSold.toLocaleString()}</Metric>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/10 p-4 rounded-xl border border-border text-center">
                    <Text>{isAr ? 'معدل التحويل' : 'Conversion'}</Text>
                    <Metric className="text-blue-500 mt-2">{conversionRate}%</Metric>
                  </div>
                </TremorGrid>
                <div>
                  <Flex className="mb-2">
                    <Text>{isAr ? 'معدل التحويل المستهدف: 3.5%' : 'Target Conversion: 3.5%'}</Text>
                    <Text className="font-bold">{conversionRate}% / 3.5%</Text>
                  </Flex>
                  <ProgressBar value={progress} color="blue" className="mt-2" />
                </div>
              </div>
            );
          })()}
        </TremorCard>
      )}

      {/* Commission info */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{t('الباقة الحالية', 'Current Package')}: <span className="text-primary">{data?.seller?.package?.name ?? t('مجاني', 'Free')}</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('نسبة العمولة', 'Commission rate')}: <strong>{data?.seller?.package?.commissionRate ?? 10}%</strong>
                {' · '}
                {t('حد المنتجات', 'Product limit')}: <strong>{data?.seller?.package?.maxProducts ?? 5}</strong>
                {' · '}
                {t('عمولة هذا الشهر', 'This month commission')}: <strong>{DZD(kpis?.monthCommission ?? 0)}</strong>
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0">{t('ترقية الباقة', 'Upgrade')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      {(data?.challenges?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Trophy className="size-5 text-amber-500" />{t('تحديات نشطة', 'Active Challenges')}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {data?.challenges?.map((c) => (
              <Card key={c.id} className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{c.title}</p>
                      {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                      <Badge className="mt-2 bg-amber-500/20 text-amber-700 border-0 text-xs">{t('المكافأة:', 'Reward:')} {c.rewardValue}</Badge>
                    </div>
                    <Zap className="size-5 text-amber-500 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance metrics */}
      <TremorCard className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg mt-4">
        <Title className="text-foreground">{t('📊 مؤشرات الأداء', '📊 Performance Metrics')}</Title>
        <div className="grid grid-cols-2 gap-6 mt-4">
          {[
            { label: t('معدل إكمال الطلبات', 'Completion Rate'), value: kpis?.completionRate ?? 100, suffix: '%', good: 90, color: 'emerald' },
            { label: t('معدل نجاح التواصل', 'Response Rate'), value: kpis?.responseRate ?? 100, suffix: '%', good: 80, color: 'emerald' },
          ].map((m) => (
            <div key={m.label}>
              <Flex className="mb-2">
                <Text>{m.label}</Text>
                <Text className={`font-bold ${m.value >= m.good ? 'text-green-600' : 'text-orange-500'}`}>
                  {Number(m.value).toFixed(0)}{m.suffix}
                </Text>
              </Flex>
              <ProgressBar value={m.value} color={m.value >= m.good ? m.color as any : 'orange'} className="mt-2" />
            </div>
          ))}
        </div>
      </TremorCard>

      {/* Recent orders */}
      {(data?.recentOrders?.length ?? 0) > 0 && (
        <TremorCard className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg mt-4">
          <Flex className="mb-4">
            <Title className="text-foreground">{t('آخر الطلبات', 'Recent Orders')}</Title>
            <Button size="sm" variant="ghost" onClick={() => appStore.getState().setCurrentPage('seller-orders' as any)}>
              {t('عرض الكل', 'View All')}
            </Button>
          </Flex>
          <div className="divide-y divide-border">
            {data?.recentOrders?.slice(0, 5).map((item, i) => {
              const st = STATUS_CONFIG[item.order.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = st.icon;
              return (
                <div key={i} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">#{item.order.orderNumber} · {item.quantity} × {DZD(item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${st.color}`}>
                      <StatusIcon className="size-3" />{st.label}
                    </span>
                      <span className="text-sm font-bold text-primary">{DZD(item.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
        </TremorCard>
      )}

      {/* Recent reviews */}
      {(data?.reviews?.length ?? 0) > 0 && (
        <TremorCard className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg mt-4">
          <Title className="text-foreground mb-4">{t('أحدث التقييمات', 'Latest Reviews')}</Title>
          <div className="space-y-3">
            {data?.reviews?.slice(0, 3).map((rev) => (
              <div key={rev.id} className="p-3 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={`size-3 ${s < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                {rev.comment && <p className="text-sm text-muted-foreground">{rev.comment}</p>}
                {rev.sellerReply && <p className="text-xs text-primary mt-1 ps-2 border-s-2 border-primary/30">{rev.sellerReply}</p>}
              </div>
            ))}
          </div>
        </TremorCard>
      )}
    </div>
  );
}

// ── Products sub-page ──────────────────────────────────────────────────────────
function SellerProductsTab({
  data,
  isLoading,
  t,
  isAr,
  onAddClick,
  onEditClick,
  onDeleteSuccess,
}: {
  data: DashboardData | null;
  isLoading: boolean;
  t: (a: string, e: string) => string;
  isAr: boolean;
  onAddClick: () => void;
  onEditClick: (prod: any) => void;
  onDeleteSuccess: () => void;
}) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const walletCurrency = data?.kpis?.walletCurrency || 'DZD';
  const fmtProd = (n: number) => {
    const formattedAmount = Number(n || 0).toLocaleString(isAr ? 'ar-DZ' : 'en-US');
    if (isAr) {
      return walletCurrency === 'DZD' ? `${formattedAmount} د.ج` : `${formattedAmount} ${walletCurrency}`;
    }
    return `${walletCurrency} ${formattedAmount}`;
  };
  const [previewProductId, setPreviewProductId] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const STATUS_COLOR: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    inactive: 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  };

  useEffect(() => {
    if (!previewProductId) {
      setPreviewProduct(null);
      return;
    }
    setIsPreviewLoading(true);
    fetch(`/api/products/${previewProductId}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.product) {
          setPreviewProduct(d.product);
        } else {
          toast.error(isAr ? 'فشل تحميل تفاصيل المنتج' : 'Failed to load product details');
          setPreviewProductId(null);
        }
      })
      .catch(() => {
        toast.error(isAr ? 'خطأ في الاتصال بالشبكة' : 'Network communication error');
        setPreviewProductId(null);
      })
      .finally(() => setIsPreviewLoading(false));
  }, [previewProductId, isAr]);

  const handleDelete = async (prodId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(isAr ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
        onDeleteSuccess();
      } else {
        toast.error(isAr ? 'فشل حذف المنتج' : 'Failed to delete product');
      }
    } catch {
      toast.error(isAr ? 'خطأ في الاتصال بالشبكة' : 'Network communication error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold">{t('إدارة المنتجات', 'Product Management')}</h1>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-muted border border-border p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={t('عرض كجدول', 'Table View')}
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={t('عرض كشبكة', 'Grid View')}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
          <Button className="gap-2" onClick={onAddClick}>
            <Plus className="size-4" />
            {t('إضافة منتج', 'Add Product')}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 px-3 sm:px-6">
          {isLoading ? (
            <div className="h-48 animate-pulse bg-muted rounded-xl" />
          ) : (data?.products ?? []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Package className="size-10 mx-auto mb-2 opacity-30" />
              <p>{t('لا توجد منتجات بعد', 'No products yet')}</p>
              <Button size="sm" className="mt-3" onClick={onAddClick}>
                <Plus className="size-4 me-1" />
                {t('أضف أول منتج', 'Add first product')}
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-bold">
                    <th className="py-3 px-4 text-start font-bold">{t('المنتج', 'Product')}</th>
                    <th className="py-3 px-4 text-start font-bold hidden md:table-cell">{t('الفئة', 'Category')}</th>
                    <th className="py-3 px-4 text-start font-bold">{t('السعر', 'Price')}</th>
                    <th className="py-3 px-4 text-start font-bold">{t('المخزون', 'Stock')}</th>
                    <th className="py-3 px-4 text-start font-bold hidden sm:table-cell">{t('المبيعات', 'Sales')}</th>
                    <th className="py-3 px-4 text-start font-bold hidden lg:table-cell">{t('الحالة', 'Status')}</th>
                    <th className="py-3 px-4 text-end font-bold">{t('إجراءات', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {(data?.products ?? []).map((p) => {
                    const productImg = parseImages(p.images)[0];
                    return (
                      <tr key={p.id} className="hover:bg-muted/10 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-11 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                              <img src={productImg} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-[240px]">
                                {p.name}
                              </p>
                              <span className="text-[10px] text-muted-foreground font-mono block mt-0.5 sm:hidden">
                                {isAr ? p.category?.name : (p.category?.nameEn || p.category?.name)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                          {isAr ? p.category?.name : (p.category?.nameEn || p.category?.name)}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-amber-600">
                          {fmtProd(p.price)}
                          {p.comparePrice && p.comparePrice > p.price && (
                            <span className="block text-[10px] line-through text-muted-foreground font-normal">
                              {fmtProd(p.comparePrice)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {p.stock > 0 ? (
                            <span className="text-foreground">{p.stock}</span>
                          ) : (
                            <span className="text-red-500 font-bold text-xs">{t('نفذ', 'Out')}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                          {p.soldCount || 0}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? STATUS_COLOR.draft}`}>
                            {p.status === 'active' ? t('نشط', 'Active') : p.status === 'draft' ? t('مسودة', 'Draft') : t('غير نشط', 'Inactive')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                              onClick={() => setPreviewProductId(p.id)}
                              title={t('تفاصيل ومعاينة', 'Preview Details')}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                              onClick={() => onEditClick(p)}
                              title={t('تعديل', 'Edit')}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/20"
                              onClick={() => handleDelete(p.id)}
                              title={t('حذف', 'Delete')}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(data?.products ?? []).map((p) => {
                const productImg = parseImages(p.images)[0];
                return (
                  <div key={p.id} className="group relative bg-card border border-border/80 hover:border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    {/* Status Badge & Image */}
                    <div className="relative aspect-square w-full bg-muted overflow-hidden">
                      <img src={productImg} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute top-2 start-2 flex flex-col gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${STATUS_COLOR[p.status] ?? STATUS_COLOR.draft}`}>
                          {p.status === 'active' ? t('نشط', 'Active') : p.status === 'draft' ? t('مسودة', 'Draft') : t('غير نشط', 'Inactive')}
                        </span>
                      </div>
                      {/* Quick action buttons overlay for Desktop/Hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          className="size-8 rounded-full bg-white hover:bg-white/90 text-slate-900 border-0"
                          onClick={() => setPreviewProductId(p.id)}
                          title={t('معاينة', 'Preview')}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="size-8 rounded-full bg-white hover:bg-white/90 text-slate-900 border-0"
                          onClick={() => onEditClick(p)}
                          title={t('تعديل', 'Edit')}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="size-8 rounded-full bg-red-600 hover:bg-red-700 text-white border-0"
                          onClick={() => handleDelete(p.id)}
                          title={t('حذف', 'Delete')}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Product Details */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground truncate font-semibold">
                          {isAr ? p.category?.name : (p.category?.nameEn || p.category?.name)}
                        </p>
                        <h4 className="text-sm font-bold text-foreground line-clamp-2 mt-0.5 leading-snug">
                          {p.name}
                        </h4>
                      </div>
                      <div>
                        <div className="flex items-baseline justify-between gap-1 flex-wrap">
                          <span className="text-sm font-black text-amber-600">
                            {fmtProd(p.price)}
                          </span>
                          {p.comparePrice && p.comparePrice > p.price && (
                            <span className="text-[10px] line-through text-muted-foreground">
                              {fmtProd(p.comparePrice)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 mt-2 pt-1.5">
                          <span>
                            {t('المخزون:', 'Stock:')} <strong className={p.stock > 0 ? 'text-foreground' : 'text-red-500'}>{p.stock}</strong>
                          </span>
                          <span>
                            {t('المبيعات:', 'Sales:')} <strong className="text-foreground">{p.soldCount || 0}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Quick actions for Touch/Mobile devices where hover doesn't exist */}
                    <div className="flex border-t border-border bg-muted/10 sm:hidden">
                      <button
                        onClick={() => setPreviewProductId(p.id)}
                        className="flex-1 py-2 text-center text-[10px] font-semibold text-muted-foreground hover:text-foreground border-e border-border/80 flex items-center justify-center gap-1"
                      >
                        <Eye className="size-3.5" />
                        {t('معاينة', 'Preview')}
                      </button>
                      <button
                        onClick={() => onEditClick(p)}
                        className="flex-1 py-2 text-center text-[10px] font-semibold text-muted-foreground hover:text-foreground border-e border-border/80 flex items-center justify-center gap-1"
                      >
                        <Edit className="size-3.5" />
                        {t('تعديل', 'Edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="flex-1 py-2 text-center text-[10px] font-semibold text-destructive hover:bg-red-50 dark:hover:bg-red-950/15 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="size-3.5" />
                        {t('حذف', 'Delete')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-[95%] max-h-[92vh] sm:w-full sm:max-w-4xl sm:max-h-[90vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-foreground">
                  {isAr ? 'معاينة تفاصيل المنتج' : 'Product Details Preview'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? 'عرض كامل المواصفات والمعلومات المدخلة للمنتج' : 'View full product specifications and details'}
                </p>
              </div>
              <button
                onClick={() => setPreviewProductId(null)}
                className="p-1.5 rounded-lg hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {isPreviewLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="size-8 text-amber-500 animate-spin" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {isAr ? 'جاري تحميل تفاصيل المنتج...' : 'Loading product details...'}
                  </p>
                </div>
              ) : previewProduct ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left side: Images (5 cols on md) */}
                  <div className="md:col-span-5 space-y-3">
                    <ProductPreviewImages images={previewProduct.images} isAr={isAr} />
                  </div>

                  {/* Right side: Specifications & details (7 cols on md) */}
                  <div className="md:col-span-7 space-y-6">
                    {/* Product Info Card */}
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[previewProduct.status] ?? STATUS_COLOR.draft}`}>
                          {previewProduct.status === 'active' ? t('نشط', 'Active') : previewProduct.status === 'draft' ? t('مسودة', 'Draft') : t('غير نشط', 'Inactive')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: <span className="font-mono text-[10px] sm:text-xs">{previewProduct.id}</span>
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-foreground mb-1 leading-snug">
                        {isAr ? previewProduct.name : (previewProduct.nameEn || previewProduct.name)}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t('الفئة:', 'Category:')} <span className="font-semibold text-foreground">{isAr ? previewProduct.category?.name : (previewProduct.category?.nameEn || previewProduct.category?.name)}</span>
                        {previewProduct.sku && ` · SKU: ${previewProduct.sku}`}
                      </p>
                    </div>

                    {/* Pricing & Stock Card */}
                    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/60">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('سعر البيع الحالي', 'Current Sale Price')}</p>
                        <p className="text-base sm:text-lg font-black text-amber-600">
                          {fmtProd(previewProduct.price)}
                        </p>
                        {previewProduct.comparePrice && previewProduct.comparePrice > previewProduct.price && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs line-through text-muted-foreground">
                              {fmtProd(previewProduct.comparePrice)}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                              {Math.round(((previewProduct.comparePrice - previewProduct.price) / previewProduct.comparePrice) * 100)}%-
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('حالة المخزون والمبيعات', 'Stock & Sales Status')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`size-2.5 rounded-full ${previewProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-xs sm:text-sm font-bold text-foreground">
                            {previewProduct.stock} {t('وحدات متوفرة', 'units available')}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {t('الكمية المباعة:', 'Sold count:')} <span className="font-semibold text-foreground">{previewProduct.soldCount || 0}</span>
                        </p>
                      </div>
                    </div>

                    {/* Description & Bullet Points */}
                    <div className="space-y-3">
                      <h5 className="text-xs sm:text-sm font-bold text-foreground border-s-4 border-amber-500 ps-2">
                        {t('وصف وتفاصيل العرض', 'Description & Key Highlights')}
                      </h5>
                      
                      {/* Bullet Points */}
                      <ProductBullets specs={previewProduct.specifications} shortDescription={previewProduct.shortDescription} isAr={isAr} />

                      {previewProduct.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line p-3 rounded-lg bg-muted/20 border border-border/40 max-h-40 overflow-y-auto">
                          {previewProduct.description}
                        </p>
                      )}
                    </div>

                    {/* Specifications table */}
                    <ProductSpecsTable specs={previewProduct.specifications} isAr={isAr} t={t} />

                    {/* Variants table */}
                    <ProductVariantsPreview variants={previewProduct.variants} isAr={isAr} t={t} />

                    {/* Product QA moderation */}
                    <ProductQAPreview productId={previewProduct.id} isAr={isAr} t={t} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  {isAr ? 'حدث خطأ أثناء تحميل تفاصيل المنتج.' : 'Error loading product details.'}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewProductId(null)}>
                {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
              </Button>
              {previewProduct && (
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5"
                  onClick={() => {
                    setPreviewProductId(null);
                    onEditClick(previewProduct);
                  }}
                >
                  <Edit className="size-4" />
                  {isAr ? 'تعديل هذا المنتج' : 'Edit Product'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Product Details Modal Helpers ───────────────────────────────────────────

function parseImages(imagesField: any): string[] {
  let initialImages: string[] = [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
  ];
  if (imagesField) {
    try {
      let parsed;
      if (typeof imagesField === 'string') {
        parsed = JSON.parse(imagesField);
      } else {
        parsed = imagesField;
      }
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return initialImages;
}

function ProductPreviewImages({ images, isAr }: { images: any; isAr: boolean }) {
  const parsed = parseImages(images);
  const [selected, setSelected] = useState(parsed[0] || '');

  return (
    <div className="space-y-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted border border-border">
        {selected ? (
          <img
            src={selected}
            alt="Product Preview"
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            {isAr ? 'لا توجد صورة' : 'No image'}
          </div>
        )}
      </div>
      {parsed.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {parsed.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(img)}
              className={`relative size-12 rounded-lg overflow-hidden border bg-muted flex-shrink-0 transition-all ${
                selected === img ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductBullets({ specs, shortDescription, isAr }: { specs: any; shortDescription: any; isAr: boolean }) {
  let bullets: string[] = [];
  
  if (specs) {
    try {
      const parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      if (parsedSpecs.bullets && Array.isArray(parsedSpecs.bullets)) {
        bullets = parsedSpecs.bullets.filter(Boolean);
      }
    } catch {}
  }
  
  if (bullets.length === 0 && shortDescription) {
    try {
      const parsedShort = typeof shortDescription === 'string' ? JSON.parse(shortDescription) : shortDescription;
      if (Array.isArray(parsedShort)) {
        bullets = parsedShort.filter(Boolean);
      } else if (typeof parsedShort === 'string') {
        bullets = [parsedShort];
      }
    } catch {
      if (typeof shortDescription === 'string') {
        bullets = [shortDescription];
      }
    }
  }

  if (bullets.length === 0) return null;

  return (
    <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-foreground/80 ps-2">
      {bullets.map((b, i) => (
        <li key={i} className="leading-relaxed">
          {b}
        </li>
      ))}
    </ul>
  );
}

function ProductSpecsTable({ specs, isAr, t }: { specs: any; isAr: boolean; t: (a: string, e: string) => string }) {
  let specData: any = {};
  if (specs) {
    try {
      specData = typeof specs === 'string' ? JSON.parse(specs) : specs;
    } catch {}
  }

  const items = [
    { label: t('الوزن', 'Weight'), value: specData.weight },
    { label: t('الأبعاد', 'Dimensions'), value: specData.dimensions },
    { label: t('المواد/الخامات', 'Material'), value: specData.material },
    { label: t('بلد المنشأ', 'Country of Origin'), value: specData.origin },
    { label: t('الضمان', 'Warranty'), value: specData.warranty },
  ].filter((i) => i.value);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h5 className="text-xs sm:text-sm font-bold text-foreground border-s-4 border-amber-500 ps-2">
        {t('المواصفات الفنية', 'Technical Specifications')}
      </h5>
      <div className="border border-border rounded-xl overflow-hidden text-xs bg-muted/10">
        <table className="w-full border-collapse">
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-border/80 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-2.5 font-bold text-muted-foreground w-1/3 bg-muted/40">{item.label}</td>
                <td className="p-2.5 text-foreground font-medium">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductVariantsPreview({ variants, isAr, t }: { variants: any; isAr: boolean; t: (a: string, e: string) => string }) {
  if (!variants || !Array.isArray(variants) || variants.length === 0) return null;

  return (
    <div className="space-y-2">
      <h5 className="text-xs sm:text-sm font-bold text-foreground border-s-4 border-amber-500 ps-2">
        {t('خيارات ومتغيرات المنتج', 'Product Variants & Options')}
      </h5>
      <div className="border border-border rounded-xl overflow-hidden text-xs bg-muted/10 overflow-x-auto">
        <table className="w-full border-collapse min-w-[400px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold text-[10px] sm:text-xs text-start">
              <th className="p-2 text-start">{t('الخيار', 'Option')}</th>
              <th className="p-2 text-start">{t('القيمة', 'Value')}</th>
              <th className="p-2 text-start">{t('السعر', 'Price')}</th>
              <th className="p-2 text-start">{t('المخزون', 'Stock')}</th>
              <th className="p-2 text-start">SKU</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v: any, idx: number) => (
              <tr key={idx} className="border-b border-border/80 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-2 font-bold text-foreground">{v.name}</td>
                <td className="p-2 text-foreground">{v.value}</td>
                <td className="p-2 text-amber-600 font-bold">
                  {v.price ? `${Number(v.price).toLocaleString('ar-DZ')} د.ج` : t('افتراضي', 'Default')}
                </td>
                <td className="p-2 font-semibold">
                  {v.stock > 0 ? (
                    <span className="text-green-600">{v.stock}</span>
                  ) : (
                    <span className="text-red-500">{t('نفذ', 'Out of stock')}</span>
                  )}
                </td>
                <td className="p-2 text-muted-foreground font-mono text-[10px] sm:text-xs">{v.sku || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Product QA moderation ──────────────────────────────────────────────────────
function ProductQAPreview({ productId, isAr, t }: { productId: string; isAr: boolean; t: any }) {
  const [qas, setQas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  const fetchQAs = () => {
    setIsLoading(true);
    fetch(`/api/products/qa?productId=${productId}&includePending=true`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.qas)) {
          setQas(data.qas);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchQAs();
  }, [productId]);

  const handleSaveAnswer = async (id: string, currentStatus: string) => {
    const text = replyText[id] || '';
    if (!text.trim() && currentStatus === 'pending') {
      toast.error(isAr ? 'يرجى كتابة إجابة أولاً' : 'Please write an answer first');
      return;
    }

    setIsSubmitting((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch('/api/products/qa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          answer: text,
          status: 'approved',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isAr ? 'تم حفظ الإجابة ونشر السؤال بنجاح' : 'Answer saved and question published successfully');
        fetchQAs();
      } else {
        toast.error(data.error || (isAr ? 'فشل الحفظ' : 'Failed to save'));
      }
    } catch {
      toast.error(isAr ? 'خطأ في الاتصال بالشبكة' : 'Network communication error');
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm(isAr ? 'هل تريد رفض وحذف هذا السؤال؟' : 'Do you want to reject and delete this question?')) return;
    try {
      const res = await fetch('/api/products/qa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: 'rejected',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isAr ? 'تم رفض السؤال بنجاح' : 'Question rejected successfully');
        fetchQAs();
      }
    } catch {
      toast.error(isAr ? 'خطأ في الاتصال بالشبكة' : 'Network communication error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="size-5 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <h5 className="text-xs sm:text-sm font-bold text-foreground border-s-4 border-amber-500 ps-2">
        💬 {isAr ? 'أسئلة وأجوبة العملاء' : 'Customer Questions & Answers'}
      </h5>

      {qas.length === 0 ? (
        <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-dashed border-border text-center">
          {isAr ? 'لا توجد أسئلة مطروحة على هذا المنتج حتى الآن.' : 'No customer questions asked on this product yet.'}
        </p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {qas.map((qa) => (
            <div key={qa.id} className="bg-muted/10 p-3 rounded-xl border border-border space-y-2 text-start">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    ❓ {qa.question}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(qa.createdAt).toLocaleDateString(isAr ? 'ar-DZ' : 'en-US')}
                  </p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                  qa.status === 'approved' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse'
                }`}>
                  {qa.status === 'approved' ? (isAr ? 'منشور' : 'Published') : (isAr ? 'معلّق' : 'Pending')}
                </span>
              </div>

              {qa.answer ? (
                <div className="bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 text-xs mt-1 text-start">
                  <span className="font-bold text-amber-600 block mb-0.5">💡 {isAr ? 'إجابتك:' : 'Your Answer:'}</span>
                  <p className="text-muted-foreground">{qa.answer}</p>
                </div>
              ) : null}

              {/* Action Form */}
              <div className="flex gap-2 items-end pt-1">
                <input
                  type="text"
                  placeholder={isAr ? 'اكتب إجابتك هنا...' : 'Write your reply...'}
                  value={replyText[qa.id] ?? qa.answer ?? ''}
                  onChange={(e) => setReplyText({ ...replyText, [qa.id]: e.target.value })}
                  className="flex-1 bg-background border border-border px-2.5 py-1.5 rounded-lg text-xs"
                />
                <Button
                  size="sm"
                  disabled={isSubmitting[qa.id]}
                  onClick={() => handleSaveAnswer(qa.id, qa.status)}
                  className="h-[31px] text-xs font-bold px-3 gap-1 shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  {isSubmitting[qa.id] ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                  {isAr ? 'حفظ ونشر' : 'Publish'}
                </Button>
                {qa.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReject(qa.id)}
                    className="h-[31px] text-xs font-bold text-destructive hover:bg-destructive/10 px-2 shrink-0 rounded-lg"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Orders sub-page ────────────────────────────────────────────────────────────
function SellerOrdersTab({ data, isLoading, t, isAr, onRefresh }: { data: DashboardData | null; isLoading: boolean; t: (a: string, e: string) => string; isAr: boolean; onRefresh: () => void }) {
  useEffect(() => {
    if (!isLoading && data?.recentOrders) {
      const params = new URLSearchParams(window.location.search);
      const targetOrderId = params.get('orderId');
      if (targetOrderId) {
        const el = document.getElementById(`order-card-${targetOrderId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'bg-primary/5');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'bg-primary/5');
            // Clean URL without reloading
            const url = new URL(window.location.href);
            url.searchParams.delete('orderId');
            window.history.replaceState({}, '', url.toString());
          }, 3000);
        }
      }
    }
  }, [isLoading, data]);

  const walletCurrency = data?.kpis?.walletCurrency || 'DZD';
  const fmtOrd = (n: number) => {
    const formattedAmount = Number(n || 0).toLocaleString(isAr ? 'ar-DZ' : 'en-US');
    if (isAr) {
      return walletCurrency === 'DZD' ? `${formattedAmount} د.ج` : `${formattedAmount} ${walletCurrency}`;
    }
    return `${walletCurrency} ${formattedAmount}`;
  };
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(t('تم تحديث حالة الطلب بنجاح', 'Order status updated successfully'));
      onRefresh();
    } catch {
      toast.error(t('فشل تحديث حالة الطلب', 'Failed to update order status'));
    } finally {
      setUpdatingId(null);
    }
  };

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: t('معلق', 'Pending'), color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Package },
    confirmed: { label: t('مؤكد', 'Confirmed'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: ClipboardCheck },
    shipped: { label: t('تم الشحن', 'Shipped'), color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Truck },
    delivered: { label: t('تم التوصيل', 'Delivered'), color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckSquare },
    cancelled: { label: t('ملغي', 'Cancelled'), color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: X },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">{t('إدارة الطلبات الواردة', 'Incoming Orders Management')}</h1>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          {t('تحديث', 'Refresh')}
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse bg-muted rounded-2xl" />
      ) : (
        <div className="space-y-4">
          {(data?.recentOrders ?? []).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Package className="size-12 mx-auto mb-3 opacity-25" />
                <p className="font-bold">{t('لا توجد طلبات واردة بعد', 'No incoming orders yet')}</p>
                <p className="text-xs max-w-xs mx-auto mt-1">{t('بمجرد قيام العملاء بشراء منتجاتك، ستظهر طلباتهم هنا بالتفصيل.', 'Once customers buy your products, their orders will appear here in detail.')}</p>
              </CardContent>
            </Card>
          ) : (
            (data?.recentOrders ?? []).map((item, i) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const order = item.order as any;
              const orderId = order.id;
              const status = order.status;
              const st = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
              const SIcon = st.icon;
              
              // Parse shipping address
              let addressDetails: any = {};
              try {
                addressDetails = typeof order.address === 'string' 
                  ? JSON.parse(order.address) 
                  : order.address || {};
              } catch {}

              const buyerName = order.buyer?.name || addressDetails.fullName || t('عميل زائر', 'Guest Customer');
              const buyerPhone = order.buyer?.phone || addressDetails.phone || t('غير متوفر', 'N/A');
              const fullAddress = `${addressDetails.street || ''}, ${addressDetails.city || ''}`;

              return (
                <Card key={i} id={`order-card-${orderId}`} className="overflow-hidden border border-primary/10 hover:border-primary/20 transition-all shadow-md">
                  <div className="p-4 bg-primary/5 border-b border-border flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <span className="text-xs text-muted-foreground font-bold">{t('رقم الطلب', 'Order No.')}</span>
                      <p className="text-sm font-mono font-bold text-foreground">#{order.orderNumber}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-DZ' : 'en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${st.color}`}>
                        <SIcon className="size-3" />
                        {st.label}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Item row */}
                    <div className="flex items-start gap-4 pb-4 border-b border-border/60">
                      <div className="size-16 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-2xl">📦</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-foreground truncate">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('الكمية: ', 'Qty: ')}<span className="font-bold text-foreground">{item.quantity}</span>
                          {' • '}{t('سعر الوحدة: ', 'Unit Price: ')}<span className="font-bold text-foreground">{fmtOrd(item.product.price)}</span>
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="text-xs text-muted-foreground block">{t('إجمالي العنصر', 'Item Total')}</span>
                        <span className="font-black text-base text-primary block mt-0.5">{fmtOrd(item.total)}</span>
                      </div>
                    </div>

                    {/* Customer info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-cairo">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">{t('بيانات المشتري', 'Customer Details')}</p>
                        <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs text-start">
                          <div>
                            <span className="text-muted-foreground">{t('الاسم: ', 'Name: ')}</span>
                            <span className="font-bold text-foreground">{buyerName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('الهاتف: ', 'Phone: ')}</span>
                            <a href={`tel:${buyerPhone}`} className="font-bold text-primary hover:underline">{buyerPhone}</a>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">{t('عنوان الشحن والدفع', 'Shipping & Payment')}</p>
                        <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs text-start">
                          <div>
                            <span className="text-muted-foreground">{t('العنوان: ', 'Address: ')}</span>
                            <span className="font-bold text-foreground">{fullAddress}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('طريقة الدفع: ', 'Payment: ')}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {order.paymentMethod === 'cod' ? t('الدفع عند الاستلام (COD)', 'Cash on Delivery') : order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons based on status */}
                    <div className="pt-2 flex items-center justify-end gap-2 flex-wrap border-t border-border/40">
                      {updatingId === orderId ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span>{t('جاري تحديث الحالة...', 'Updating status...')}</span>
                        </div>
                      ) : (
                        <>
                          {status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                                onClick={() => handleStatusChange(orderId, 'confirmed')}
                              >
                                {t('تأكيد الطلب', 'Confirm Order')}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="rounded-xl font-bold"
                                onClick={() => handleStatusChange(orderId, 'cancelled')}
                              >
                                {t('إلغاء الطلب', 'Cancel Order')}
                              </Button>
                            </>
                          )}
                          {status === 'confirmed' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                                onClick={() => handleStatusChange(orderId, 'shipped')}
                              >
                                {t('شحن الطلب', 'Ship Order')}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="rounded-xl font-bold"
                                onClick={() => handleStatusChange(orderId, 'cancelled')}
                              >
                                {t('إلغاء الطلب', 'Cancel Order')}
                              </Button>
                            </>
                          )}
                          {status === 'shipped' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                                onClick={() => handleStatusChange(orderId, 'delivered')}
                              >
                                {t('تأكيد التوصيل', 'Mark Delivered')}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="rounded-xl font-bold"
                                onClick={() => handleStatusChange(orderId, 'cancelled')}
                              >
                                {t('إلغاء الطلب', 'Cancel Order')}
                              </Button>
                            </>
                          )}
                          {status === 'delivered' && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg">
                              ✓ {t('تم اكتمال وتوصيل هذا الطلب بنجاح', 'This order has been completed successfully')}
                            </span>
                          )}
                          {status === 'cancelled' && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg">
                              ✗ {t('تم إلغاء هذا الطلب', 'This order has been cancelled')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Product Creator / Editor with Real-Time Preview ─────────────────────────────
export interface ProductFormProps {
  product: any;
  onClose: () => void;
  onSave: () => void;
  storeId: string;
  sellerId: string;
  t: (a: string, e: string) => string;
  isAr: boolean;
}

export function ProductFormTab({ product, onClose, onSave, storeId, sellerId, t, isAr }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<'core' | 'specs' | 'seo' | 'variants' | 'advanced'>('core');
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestNameAr, setSuggestNameAr] = useState('');
  const [suggestNameEn, setSuggestNameEn] = useState('');
  const [suggestDesc, setSuggestDesc] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Core Form States
  const [name, setName] = useState(product?.name || '');
  const [nameEn, setNameEn] = useState(product?.nameEn || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [comparePrice, setComparePrice] = useState(product?.comparePrice || 0);
  const [description, setDescription] = useState(product?.description || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [stock, setStock] = useState(product?.stock || 10);
  const [status, setStatus] = useState<'active' | 'draft' | 'inactive'>(product?.status || 'draft');
  const [brandId, setBrandId] = useState(product?.brandId || '');
  const [brands, setBrands] = useState<any[]>([]);
  const [enableBrandSystem, setEnableBrandSystem] = useState(true);

  // Specifications
  let initialSpecs: any = {};
  if (product?.specifications) {
    try {
      if (typeof product.specifications === 'string') {
        initialSpecs = JSON.parse(product.specifications);
      } else {
        initialSpecs = product.specifications;
      }
    } catch {}
  }

  // Bullet Points
  let initialBullets = ['', '', ''];
  if (initialSpecs.bullets && Array.isArray(initialSpecs.bullets)) {
    initialBullets = [...initialSpecs.bullets, '', '', ''].slice(0, 3);
  } else if (product?.shortDescription) {
    try {
      const parsed = JSON.parse(product.shortDescription);
      if (Array.isArray(parsed)) initialBullets = [...parsed, '', '', ''].slice(0, 3);
    } catch {}
  }
  const [bullet1, setBullet1] = useState(initialBullets[0]);
  const [bullet2, setBullet2] = useState(initialBullets[1]);
  const [bullet3, setBullet3] = useState(initialBullets[2]);

  const [weight, setWeight] = useState(initialSpecs.weight || '0.85 كجم');
  const [dimensions, setDimensions] = useState(initialSpecs.dimensions || '40 × 30 × 10 سم');
  const [material, setMaterial] = useState(initialSpecs.material || 'جلد طبيعي + بوليستر مبطن');
  const [origin, setOrigin] = useState(initialSpecs.origin || 'الجزائر');
  const [warranty, setWarranty] = useState(initialSpecs.warranty || 'ضمان 12 شهراً ضد عيوب الصناعة');

  // SEO & Variants
  const [metaTitle, setMetaTitle] = useState(initialSpecs.seoTitle || product?.seoTitle || '');
  const [metaDesc, setMetaDesc] = useState(initialSpecs.seoDescription || product?.seoDescription || '');
  const [slug, setSlug] = useState(product?.slug || '');

  const [color1, setColor1] = useState(initialSpecs.color1 || 'أسود فاخر');
  const [color2, setColor2] = useState(initialSpecs.color2 || 'بني كلاسيكي');
  const [sizes, setSizes] = useState(initialSpecs.sizes || '13.3 بوصة, 15.6 بوصة');

  // Images
  let initialImages: string[] = [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
  ];
  if (product?.images) {
    try {
      let parsed;
      if (typeof product.images === 'string') {
        parsed = JSON.parse(product.images);
      } else {
        parsed = product.images;
      }
      if (Array.isArray(parsed) && parsed.length > 0) initialImages = parsed;
    } catch {}
  }
  const [selectedImage, setSelectedImage] = useState(initialImages[0] || '');
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [volumeDiscounts, setVolumeDiscounts] = useState<any[]>([]);
  const [urgencySettings, setUrgencySettings] = useState<any>({
    showViews: true,
    minViews: 10,
    maxViews: 50,
    showSoldToday: true,
    minSold: 5,
    maxSold: 20
  });

  // Asynchronous full product fetch to load variants & actual specs when editing
  useEffect(() => {
    if (!product?.id) return;
    fetch(`/api/products/${product.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          const p = data.product;
          setName(p.name || '');
          setNameEn(p.nameEn || '');
          setCategoryId(p.categoryId || '');
          setPrice(p.price || 0);
          setComparePrice(p.comparePrice || 0);
          setDescription(p.description || '');
          setSku(p.sku || '');
          setStock(p.stock || 0);
          setStatus(p.status || 'draft');
          
          if (p.images) {
            try {
              const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
              if (Array.isArray(imgs) && imgs.length > 0) {
                setUploadedImages(imgs);
                setSelectedImage(imgs[0]);
              }
            } catch {}
          }
          if (p.specifications) {
            try {
              const specs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
              if (specs.bullets && Array.isArray(specs.bullets)) {
                setBullet1(specs.bullets[0] || '');
                setBullet2(specs.bullets[1] || '');
                setBullet3(specs.bullets[2] || '');
              }
              setWeight(specs.weight || '0.85 كجم');
              setDimensions(specs.dimensions || '40 × 30 × 10 سم');
              setMaterial(specs.material || 'جلد طبيعي + بوليستر مبطن');
              setOrigin(specs.origin || 'الجزائر');
              setWarranty(specs.warranty || 'ضمان 12 شهراً ضد عيوب الصناعة');
              setMetaTitle(specs.seoTitle || '');
              setMetaDesc(specs.seoDescription || '');
            } catch {}
          }
          
          if (p.variants && Array.isArray(p.variants)) {
            setVariants(p.variants.map((v: any) => ({
              id: v.id,
              name: v.name,
              value: v.value,
              sku: v.sku || '',
              price: v.price !== null && v.price !== undefined ? String(v.price) : '',
              comparePrice: v.comparePrice !== null && v.comparePrice !== undefined ? String(v.comparePrice) : '',
              stock: String(v.stock || '0'),
              image: v.image || '',
              swatchType: v.swatchType || '',
              swatchValue: v.swatchValue || '',
              isActive: v.isActive !== undefined ? v.isActive : true,
            })));
          }
          if (p.volumeDiscounts) {
            try {
              setVolumeDiscounts(typeof p.volumeDiscounts === 'string' ? JSON.parse(p.volumeDiscounts) : p.volumeDiscounts);
            } catch {}
          } else {
            setVolumeDiscounts([]);
          }
          if (p.urgencySettings) {
            try {
              setUrgencySettings(typeof p.urgencySettings === 'string' ? JSON.parse(p.urgencySettings) : p.urgencySettings);
            } catch {}
          } else {
            setUrgencySettings({
              showViews: true,
              minViews: 10,
              maxViews: 50,
              showSoldToday: true,
              minSold: 5,
              maxSold: 20
            });
          }
        }
      })
      .catch(() => {});
  }, [product?.id]);

  useEffect(() => {
    if (uploadedImages.length > 0 && (!selectedImage || !uploadedImages.includes(selectedImage))) {
      setSelectedImage(uploadedImages[0]);
    } else if (uploadedImages.length === 0) {
      setSelectedImage('');
    }
  }, [uploadedImages, selectedImage]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newImages = [...uploadedImages];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (data.success && data.url) {
          newImages.push(data.url);
        } else {
          toast.error(`${isAr ? 'فشل رفع الصورة:' : 'Failed to upload image:'} ${data.error || ''}`);
        }
      } catch (err) {
        toast.error(isAr ? 'خطأ أثناء رفع الصورة' : 'Error uploading image');
      }
    }
    setUploadedImages(newImages);
    setIsUploading(false);
  };

  // Fetch Categories, System Settings (Brand Enable) & Active Brands
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setCategories(d);
          if (!categoryId && d.length > 0) setCategoryId(d[0].id);
        }
      })
      .catch(() => {});

    // Check system settings for brand toggle
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          const isBrandEnabled = data.settings.enable_brand_system !== 'false'; // default true
          setEnableBrandSystem(isBrandEnabled);
        }
      })
      .catch(() => {});

    // Load active brands
    fetch('/api/brands')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.brands)) {
          setBrands(data.brands);
        }
      })
      .catch(() => {});
  }, []);

  const handleSuggestCategory = async () => {
    if (!suggestNameAr.trim()) {
      toast.error(isAr ? 'يرجى إدخال اسم التصنيف المقترح' : 'Please enter the suggested category name');
      return;
    }
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/categories/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr: suggestNameAr,
          nameEn: suggestNameEn,
          description: suggestDesc,
          type: 'product',
          userId: sellerId || storeId
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isAr ? 'تم إرسال اقتراحك للإدارة! سيتم مراجعته قريباً.' : 'Your suggestion was sent to Admin for review!');
        setShowSuggestModal(false);
        setSuggestNameAr('');
        setSuggestNameEn('');
        setSuggestDesc('');
      } else {
        toast.error(data.error || isAr ? 'فشل الإرسال' : 'Submission failed');
      }
    } catch {
      toast.error(isAr ? 'خطأ في الاتصال' : 'Connection error');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSave = async () => {
    if (!name) {
      toast.error(isAr ? 'الرجاء إدخال اسم المنتج' : 'Please enter product name');
      return;
    }
    if (!categoryId) {
      toast.error(isAr ? 'الرجاء اختيار الفئة' : 'Please select a category');
      return;
    }

    setIsSaving(true);
    const shortDescArray = [bullet1, bullet2, bullet3].filter(Boolean);
    const specData = {
      weight,
      dimensions,
      material,
      origin,
      warranty,
      color1,
      color2,
      sizes,
      bullets: shortDescArray,
      seoTitle: metaTitle,
      seoDescription: metaDesc
    };

    const payload = {
      name,
      nameEn: nameEn || name,
      description,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      sku,
      stock: Number(stock),
      status,
      categoryId,
      brandId: enableBrandSystem ? (brandId || null) : null,
      storeId,
      sellerId,
      images: uploadedImages,
      shortDescription: JSON.stringify(shortDescArray),
      specifications: specData,
      seoTitle: metaTitle,
      seoDescription: metaDesc,
      volumeDiscounts: JSON.stringify(volumeDiscounts),
      urgencySettings: JSON.stringify(urgencySettings),
      variants: variants.map(v => ({
        name: v.name,
        value: v.value,
        sku: v.sku || null,
        price: v.price ? Number(v.price) : null,
        comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
        stock: Number(v.stock || 0),
        image: v.image || null,
        swatchType: v.name === 'اللون' || v.name === 'Color' ? 'color' : null,
        swatchValue: v.name === 'اللون' || v.name === 'Color' ? v.value : null,
        isActive: true
      }))
    };

    try {
      const url = product?.id ? `/api/products/${product.id}` : '/api/products';
      const method = product?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(product?.id 
          ? (isAr ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully')
          : (isAr ? 'تم نشر المنتج بنجاح' : 'Product published successfully')
        );
        onSave();
        onClose();
      } else {
        toast.error(isAr ? 'فشل حفظ المنتج' : 'Failed to save product');
      }
    } catch {
      toast.error(isAr ? 'خطأ في الاتصال بالشبكة' : 'Network communication error');
    } finally {
      setIsSaving(false);
    }
  };

  const discount = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const currentCategoryName = categories.find(c => c.id === categoryId)?.name || (isAr ? 'ملحقات وأجهزة' : 'Accessories');

  return (
    <div className="space-y-6 pb-12 font-cairo">

      {/* Suggest Category Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base">{isAr ? 'اقتراح تصنيف جديد' : 'Suggest New Category'}</h3>
              <button onClick={() => setShowSuggestModal(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? 'سيتم إرسال اقتراحك إلى الإدارة للمراجعة والموافقة. بعد الموافقة يصبح التصنيف متاحاً لجميع التجار.'
                : 'Your suggestion will be reviewed by Admin. Once approved, it becomes available to all sellers.'}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold">{isAr ? 'اسم التصنيف بالعربية *' : 'Category Name in Arabic *'}</label>
                <input
                  type="text"
                  value={suggestNameAr}
                  onChange={(e) => setSuggestNameAr(e.target.value)}
                  placeholder={isAr ? 'مثال: الكترونيات المنزل' : 'Example: Home Electronics'}
                  className="w-full mt-1 bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold">{isAr ? 'الاسم بالإنجليزية (اختياري)' : 'English Name (Optional)'}</label>
                <input
                  type="text"
                  value={suggestNameEn}
                  onChange={(e) => setSuggestNameEn(e.target.value)}
                  placeholder="Home Electronics"
                  className="w-full mt-1 bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold">{isAr ? 'سبب الاقتراح (اختياري)' : 'Reason (Optional)'}</label>
                <textarea
                  value={suggestDesc}
                  onChange={(e) => setSuggestDesc(e.target.value)}
                  rows={2}
                  placeholder={isAr ? 'لماذا يحتاج المتجر لهذا التصنيف؟' : 'Why does the platform need this category?'}
                  className="w-full mt-1 bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSuggestModal(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1"
                onClick={handleSuggestCategory}
                disabled={isSuggesting}
              >
                {isSuggesting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {isAr ? 'إرسال الاقتراح' : 'Submit Suggestion'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-border">
        <div>
          <h1 className="text-xl font-black text-foreground">
            {product?.id ? (isAr ? 'تعديل المنتج' : 'Edit Product') : (isAr ? 'إضافة منتج جديد' : 'Add New Product')}
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            {isAr ? 'قم بإدخال تفاصيل المنتج بدقة لزيادة المبيعات وتسهيل التصفح' : 'Enter product details accurately to boost sales and ease browsing'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            {isAr ? 'حفظ ونشر المنتج' : 'Save & Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Form Editor (8 cols on lg) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 space-y-6 shadow-sm">
          {/* Sub Tab System */}
          <div className="flex gap-1.5 p-1 bg-muted rounded-xl border border-border">
            {[
              { id: 'core', label: isAr ? 'البيانات الأساسية' : 'Core Info' },
              { id: 'specs', label: isAr ? 'المواصفات والاستخدام' : 'Specifications' },
              { id: 'seo', label: isAr ? 'الثقة والـ SEO' : 'Trust & SEO' },
              { id: 'variants', label: isAr ? 'المتغيرات والترقيات' : 'Variants' },
              { id: 'advanced', label: isAr ? 'الميزات المتقدمة' : 'Global Features' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-1 text-center rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted-foreground/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: Core Info */}
          {activeTab === 'core' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'اسم المنتج' : 'Product Title'}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? "الماركة + اسم المنتج + الميزة الأساسية" : "Brand + Product Name + Main Feature"}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'الاسم بالإنجليزية (اختياري)' : 'Title in English (Optional)'}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Brand + Product Name + Main Feature"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'الفئة الرئيسية للمنتج' : 'Product Category'}</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{isAr ? c.name : (c.nameEn || c.name)}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowSuggestModal(true)}
                    className="text-[10px] text-amber-500 hover:text-amber-600 font-bold flex items-center gap-1 mt-1 hover:underline"
                  >
                    <Plus className="size-3" />
                    {isAr ? 'لا تجد تصنيفك؟ اقترح تصنيفاً جديداً' : "Can't find your category? Suggest one"}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'حالة المنتج' : 'Status'}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  >
                    <option value="active">{isAr ? 'نشط (معروض)' : 'Active (Public)'}</option>
                    <option value="draft">{isAr ? 'مسودة' : 'Draft'}</option>
                    <option value="inactive">{isAr ? 'غير نشط' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              {enableBrandSystem && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'العلامة التجارية / الماركة' : 'Brand / Trademark'}</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                  >
                    <option value="">{isAr ? 'بدون ماركة (Generic / ماركة عامة)' : 'Generic / No Brand'}</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{isAr ? b.name : (b.nameEn || b.name)}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {isAr ? 'اختر الماركة الرسمية للمنتج للتمييز كمنتج أصلي وزيادة الثقة.' : 'Select the official brand to identify as authentic and boost trust.'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'سعر البيع الحالي' : 'Current Price'}</label>
                  <input
                    type="number"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'سعر المقارنة المشطوب' : 'Compare Price'}</label>
                  <input
                    type="number"
                    value={comparePrice || ''}
                    onChange={(e) => setComparePrice(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">SKU / رمز التخزين</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. BAG-LTHR-001"
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'المخزون المتوفر' : 'Available Stock'}</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Multi-Image Uploader UI */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">
                  {isAr ? 'صور المنتج (يمكنك رفع عدة صور)' : 'Product Images (Upload Multiple)'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {uploadedImages.map((imgUrl, idx) => (
                    <div key={idx} className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${selectedImage === imgUrl ? 'border-amber-500' : 'border-border'} bg-muted`}>
                      <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = uploadedImages.filter((_, i) => i !== idx);
                          setUploadedImages(updated);
                          if (selectedImage === imgUrl) {
                            setSelectedImage(updated[0] || '');
                          }
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-1 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 text-center opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          type="button" 
                          onClick={() => setSelectedImage(imgUrl)}
                          className="text-[10px] text-white font-bold hover:underline"
                        >
                          {selectedImage === imgUrl ? (isAr ? 'الصورة الرئيسية' : 'Primary') : (isAr ? 'تعيين كرئيسية' : 'Set Primary')}
                        </button>
                      </div>
                      {selectedImage === imgUrl && (
                        <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-md shadow">
                          {isAr ? 'الرئيسية' : 'Primary'}
                        </span>
                      )}
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all text-muted-foreground hover:text-amber-500">
                    {isUploading ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      <>
                        <Upload className="size-6 mb-1" />
                        <span className="text-[10px] font-bold text-center px-2">{isAr ? 'رفع صور جديدة' : 'Upload Images'}</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      multiple 
                      accept="image/png, image/jpeg, image/jpg" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">{isAr ? 'نقاط الوصف الممتازة (Bullet Points)' : 'Bullet points (High converting)'}</label>
                <input
                  type="text"
                  value={bullet1}
                  onChange={(e) => setBullet1(e.target.value)}
                  placeholder="الميزة والمنفعة 1 (مثال: جلد طبيعي مضاد للماء)"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs"
                />
                <input
                  type="text"
                  value={bullet2}
                  onChange={(e) => setBullet2(e.target.value)}
                  placeholder="الميزة والمنفعة 2 (مثال: جيب مبطن ومقاوم للصدمات)"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs"
                />
                <input
                  type="text"
                  value={bullet3}
                  onChange={(e) => setBullet3(e.target.value)}
                  placeholder="الميزة والمنفعة 3 (مثال: شحن سريع لجميع الولايات)"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'الوصف التفصيلي للمنتج' : 'Product Detailed Description'}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="قصة المنتج، لمن يصلح، وطريقة عمله..."
                  rows={3}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: Specifications */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'الوزن الكلي' : 'Product Weight'}</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'أبعاد المنتج' : 'Dimensions'}</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'الخامات المستخدمة' : 'Materials'}</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'بلد المنشأ' : 'Country of Origin'}</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'الضمان المعتمد للمنتج' : 'Product Warranty'}</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: SEO & Trust */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">SEO Meta Title / عنوان جوجل</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="عنوان مغرٍ للنقر لا يتجاوز 60 حرفاً"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">SEO Meta Description / وصف جوجل</label>
                <textarea
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="وصف مختصر للمنتج مع دعوة واضحة للطلب (لا يتجاوز 155 حرفاً)"
                  rows={3}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Friendly URL Slug / رابط الصفحة</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. leather-laptop-bag-pro"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: Variants */}
          {activeTab === 'variants' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/35 p-3.5 rounded-xl border border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{isAr ? 'إدارة متغيرات المنتج' : 'Product Variants'}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{isAr ? 'أضف ألواناً، مقاسات أو خصائص أخرى بأسعار ومخزون مخصص' : 'Add custom colors, sizes or other options with individual prices & stock'}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs gap-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                    onClick={() => {
                      setVariants([...variants, {
                        name: isAr ? 'اللون' : 'Color',
                        value: '#FF0000',
                        sku: '',
                        price: '',
                        comparePrice: '',
                        stock: '10',
                        image: '',
                        isActive: true
                      }]);
                    }}
                  >
                    <Plus className="size-3.5" /> {isAr ? 'إضافة لون' : 'Add Color'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs gap-1"
                    onClick={() => {
                      setVariants([...variants, {
                        name: isAr ? 'المقاس' : 'Size',
                        value: 'XL',
                        sku: '',
                        price: '',
                        comparePrice: '',
                        stock: '10',
                        image: '',
                        isActive: true
                      }]);
                    }}
                  >
                    <Plus className="size-3.5" /> {isAr ? 'إضافة مقاس' : 'Add Size'}
                  </Button>
                </div>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <Layers className="size-8 mx-auto mb-2 opacity-35" />
                  <p className="text-xs">{isAr ? 'لا توجد متغيرات مضافة حالياً لهذا المنتج' : 'No variants added yet for this product'}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {variants.map((v, idx) => {
                    const isColor = v.name === 'اللون' || v.name === 'Color' || v.name === 'color';
                    return (
                      <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-xl border border-border space-y-3 relative">
                        {/* Header of variant */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">{isAr ? 'متغير' : 'Variant'} #{idx + 1}</span>
                            <select
                              value={v.name}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].name = e.target.value;
                                if (e.target.value === 'اللون' || e.target.value === 'Color') {
                                  updated[idx].value = '#ff0000';
                                } else {
                                  updated[idx].value = 'M';
                                }
                                setVariants(updated);
                              }}
                              className="bg-transparent border-0 text-xs font-bold text-foreground focus:ring-0 cursor-pointer p-0"
                            >
                              <option value={isAr ? 'اللون' : 'Color'}>{isAr ? 'اللون' : 'Color'}</option>
                              <option value={isAr ? 'المقاس' : 'Size'}>{isAr ? 'المقاس' : 'Size'}</option>
                              <option value={isAr ? 'خيار مخصص' : 'Custom Option'}>{isAr ? 'خيار مخصص' : 'Custom Option'}</option>
                            </select>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-6 text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => {
                              setVariants(variants.filter((_, i) => i !== idx));
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>

                        {/* Content Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {/* Swatch or Text Input */}
                          {isColor ? (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'اختر اللون' : 'Choose Color'}</label>
                              <div className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded-lg h-9">
                                <input 
                                  type="color" 
                                  value={v.value.startsWith('#') ? v.value : '#ff0000'}
                                  onChange={(e) => {
                                    const updated = [...variants];
                                    updated[idx].value = e.target.value;
                                    setVariants(updated);
                                  }}
                                  className="size-5 rounded border border-border cursor-pointer p-0 bg-transparent shrink-0"
                                />
                                <input 
                                  type="text" 
                                  value={v.value}
                                  onChange={(e) => {
                                    const updated = [...variants];
                                    updated[idx].value = e.target.value;
                                    setVariants(updated);
                                  }}
                                  placeholder={isAr ? 'رمز اللون أو اسمه' : 'Color hex or name'}
                                  className="bg-transparent border-0 text-xs text-foreground p-0 focus:ring-0 w-full min-w-0"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'القيمة (مثال: XL)' : 'Value (e.g., XL)'}</label>
                              <input 
                                type="text" 
                                value={v.value}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  updated[idx].value = e.target.value;
                                  setVariants(updated);
                                }}
                                className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                              />
                            </div>
                          )}

                          {/* Price */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'سعر مخصص' : 'Custom Price'}</label>
                            <input 
                              type="number" 
                              value={v.price}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].price = e.target.value;
                                setVariants(updated);
                              }}
                              placeholder={isAr ? 'سعر افتراضي للمنتج' : 'Product default'}
                              className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                            />
                          </div>

                          {/* Slashed Price */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'سعر مشطوب مخصص' : 'Compare Price'}</label>
                            <input 
                              type="number" 
                              value={v.comparePrice}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].comparePrice = e.target.value;
                                setVariants(updated);
                              }}
                              placeholder={isAr ? 'اختياري' : 'Optional'}
                              className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                            />
                          </div>

                          {/* Stock */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'المخزون المخصص' : 'Custom Stock'}</label>
                            <input 
                              type="number" 
                              value={v.stock}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].stock = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                            />
                          </div>

                          {/* SKU */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'رمز SKU مخصص' : 'Custom SKU'}</label>
                            <input 
                              type="text" 
                              value={v.sku}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].sku = e.target.value;
                                setVariants(updated);
                              }}
                              placeholder="e.g. BAG-RED-XL"
                              className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                            />
                          </div>

                          {/* Image picker from uploaded images */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'صورة المتغير' : 'Variant Image'}</label>
                            <select
                              value={v.image}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].image = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full bg-background border border-border text-foreground px-2 py-1.5 rounded-lg text-xs h-[31px]"
                            >
                              <option value="">{isAr ? 'الافتراضية للمنتج' : 'Default Product Image'}</option>
                              {uploadedImages.map((img, i) => (
                                <option key={i} value={img}>{isAr ? `الصورة #${i + 1}` : `Image #${i + 1}`}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: Advanced Features */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Section 1: Volume Discounts */}
              <div className="space-y-4 border-b border-border pb-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    📦 {isAr ? 'خصومات الكمية وشراء الجملة' : 'Volume Discounts & Bulk Pricing'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isAr ? 'شجع التجار والعملاء على شراء كميات أكبر بإعطائهم خصماً متدرجاً.' : 'Encourage larger purchases by offering tier-based discounts.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {volumeDiscounts.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/25 border-2 border-dashed border-border rounded-xl">
                      <p className="text-xs text-muted-foreground">{isAr ? 'لا توجد مستويات خصم مضافة حالياً' : 'No bulk discounts configured yet'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {volumeDiscounts.map((discount, index) => (
                        <div key={index} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/35 p-3 rounded-xl border border-border">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'الحد الأدنى للكمية (قطعة)' : 'Min Quantity (pcs)'}</label>
                            <input 
                              type="number"
                              min="2"
                              value={discount.minQty}
                              onChange={(e) => {
                                const updated = [...volumeDiscounts];
                                updated[index].minQty = parseInt(e.target.value) || 2;
                                setVolumeDiscounts(updated);
                              }}
                              className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'نسبة الخصم (%)' : 'Discount Percent (%)'}</label>
                            <input 
                              type="number"
                              min="1"
                              max="99"
                              value={discount.discountPercent}
                              onChange={(e) => {
                                const updated = [...volumeDiscounts];
                                updated[index].discountPercent = parseFloat(e.target.value) || 0;
                                setVolumeDiscounts(updated);
                              }}
                              className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-destructive hover:bg-destructive/10 rounded-full shrink-0 mt-4"
                            onClick={() => {
                              setVolumeDiscounts(volumeDiscounts.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-bold gap-1"
                    onClick={() => {
                      setVolumeDiscounts([...volumeDiscounts, { minQty: 2, discountPercent: 10 }]);
                    }}
                  >
                    <Plus className="size-3.5" /> {isAr ? 'إضافة مستوى خصم جديد' : 'Add New Discount Tier'}
                  </Button>
                </div>
              </div>

              {/* Section 2: Urgency Simulation */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    🔥 {isAr ? 'محفزات الاستعجال والإثبات الاجتماعي' : 'Urgency & Social Proof Settings'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isAr ? 'تحكم في تنبيهات الشراء الفوري والمشاهدين الحيين لزيادة حماس المشترين.' : 'Control live viewer alerts and purchasing counters to drive conversions.'}
                  </p>
                </div>

                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/35 p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showViews" className="text-xs font-bold">{isAr ? 'محاكاة عدد المشاهدين الحيين' : 'Simulate Live Viewers'}</Label>
                      <p className="text-[10px] text-muted-foreground">{isAr ? 'إظهار مؤشر متحرك للمشاهدين الحاليين لصفحة المنتج' : 'Show animated counter of current product viewers'}</p>
                    </div>
                    <input 
                      type="checkbox"
                      id="showViews"
                      checked={urgencySettings.showViews}
                      onChange={(e) => setUrgencySettings({ ...urgencySettings, showViews: e.target.checked })}
                      className="size-4 rounded border-border text-amber-500 focus:ring-amber-500 bg-background"
                    />
                  </div>

                  {urgencySettings.showViews && (
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/50">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'الحد الأدنى للمشاهدين' : 'Min Viewers'}</label>
                        <input 
                          type="number"
                          value={urgencySettings.minViews || 10}
                          onChange={(e) => setUrgencySettings({ ...urgencySettings, minViews: parseInt(e.target.value) || 5 })}
                          className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'الحد الأقصى للمشاهدين' : 'Max Viewers'}</label>
                        <input 
                          type="number"
                          value={urgencySettings.maxViews || 50}
                          onChange={(e) => setUrgencySettings({ ...urgencySettings, maxViews: parseInt(e.target.value) || 50 })}
                          className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="showSoldToday" className="text-xs font-bold">{isAr ? 'محاكاة عدد المبيعات اليومية' : 'Simulate Daily Sales'}</Label>
                      <p className="text-[10px] text-muted-foreground">{isAr ? 'إظهار شارة مميزة بعدد القطع المباعة اليوم' : 'Show highlight badge of units sold today'}</p>
                    </div>
                    <input 
                      type="checkbox"
                      id="showSoldToday"
                      checked={urgencySettings.showSoldToday}
                      onChange={(e) => setUrgencySettings({ ...urgencySettings, showSoldToday: e.target.checked })}
                      className="size-4 rounded border-border text-amber-500 focus:ring-amber-500 bg-background"
                    />
                  </div>

                  {urgencySettings.showSoldToday && (
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/50">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'الحد الأدنى للمبيعات اليومية' : 'Min Daily Sales'}</label>
                        <input 
                          type="number"
                          value={urgencySettings.minSold || 5}
                          onChange={(e) => setUrgencySettings({ ...urgencySettings, minSold: parseInt(e.target.value) || 2 })}
                          className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">{isAr ? 'الحد الأقصى للمبيعات اليومية' : 'Max Daily Sales'}</label>
                        <input 
                          type="number"
                          value={urgencySettings.maxSold || 20}
                          onChange={(e) => setUrgencySettings({ ...urgencySettings, maxSold: parseInt(e.target.value) || 20 })}
                          className="w-full bg-background border border-border text-foreground px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Real-Time Live Preview (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-4 bg-slate-900 border border-amber-500/20 rounded-2xl p-5 space-y-5 text-white shadow-xl relative overflow-hidden select-none">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Live Indicator */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full animate-pulse">
                🔴 {isAr ? 'معاينة حية للمتجر' : 'Live Preview'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{currentCategoryName}</span>
            </div>

            {/* Product Title and Price */}
            <div>
              <h2 className="text-base font-extrabold line-clamp-2 text-white">
                {name || (isAr ? 'حقيبة لابتوب جلدية كلاسيكية' : 'Classic Laptop Leather Bag')}
              </h2>
              <div className="flex items-center gap-2 mt-2 justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-amber-400">{(price || 8500).toLocaleString('ar-DZ')} د.ج</span>
                  {comparePrice && comparePrice > price && (
                    <span className="text-xs text-slate-400 line-through">{(comparePrice).toLocaleString('ar-DZ')} د.ج</span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    -{discount}% {isAr ? 'خصم' : 'OFF'}
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Gallery */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex items-center justify-center">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>

            {/* Bullets Preview */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-2">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">{isAr ? 'مميزات وفوائد المنتج:' : 'Key benefits:'}</p>
              <div className="space-y-1.5 text-xs text-slate-200">
                {bullet1 && <div className="flex items-start gap-1.5"><span className="text-amber-400">✓</span><span>{bullet1}</span></div>}
                {bullet2 && <div className="flex items-start gap-1.5"><span className="text-amber-400">✓</span><span>{bullet2}</span></div>}
                {bullet3 && <div className="flex items-start gap-1.5"><span className="text-amber-400">✓</span><span>{bullet3}</span></div>}
              </div>
            </div>

            {/* Tech Specs */}
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wide mb-2">{isAr ? 'المواصفات الفنية المعتمدة:' : 'Technical specs:'}</p>
              <table className="w-full text-[10px] text-slate-300 divide-y divide-white/5">
                <tbody>
                  <tr className="py-1 flex justify-between"><td className="font-bold text-slate-400">{isAr ? 'الوزن' : 'Weight'}</td><td>{weight}</td></tr>
                  <tr className="py-1 flex justify-between"><td className="font-bold text-slate-400">{isAr ? 'الأبعاد' : 'Dimensions'}</td><td>{dimensions}</td></tr>
                  <tr className="py-1 flex justify-between"><td className="font-bold text-slate-400">{isAr ? 'الخامة' : 'Material'}</td><td>{material}</td></tr>
                  <tr className="py-1 flex justify-between"><td className="font-bold text-slate-400">{isAr ? 'المنشأ' : 'Origin'}</td><td>{origin}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Colors Preview */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">{isAr ? 'خيارات المتغيرات:' : 'Variants available:'}</p>
              <div className="flex gap-1.5">
                <span className="text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/40 px-2.5 py-1 rounded-md font-bold">{color1}</span>
                <span className="text-[10px] bg-white/5 text-slate-300 border border-white/10 px-2.5 py-1 rounded-md font-medium">{color2}</span>
              </div>
            </div>

            {/* Trust Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-[9px] text-slate-300">
              <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex flex-col items-center gap-1">
                <span>🛡️</span>
                <span className="font-bold">{isAr ? 'ضمان حقيقي' : 'Warranty'}</span>
                <span className="text-[7px] text-slate-500 line-clamp-1">{warranty}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex flex-col items-center gap-1">
                <span>🚚</span>
                <span className="font-bold">{isAr ? 'شحن سريع' : 'Fast Shipping'}</span>
                <span className="text-[7px] text-slate-500">{isAr ? '58 ولاية' : '58 Wilayas'}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex flex-col items-center gap-1">
                <span>🔄</span>
                <span className="font-bold">{isAr ? 'إرجاع سهل' : 'Easy Returns'}</span>
                <span className="text-[7px] text-slate-500">{isAr ? '14 يوماً' : '14 Days'}</span>
              </div>
            </div>

            {/* Checkout button */}
            <button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-2.5 rounded-xl shadow-lg text-xs tracking-wide">
              {isAr ? 'شراء المنتج الآن (الدفع عند الاستلام)' : 'BUY NOW (Cash on Delivery)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
