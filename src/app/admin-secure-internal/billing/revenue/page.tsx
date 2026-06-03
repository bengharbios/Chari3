'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  Loader2, BarChart3, TrendingUp, DollarSign, CalendarDays,
  Clock, ShieldOff, Package, AlertTriangle, ArrowRight,
  TrendingDown, RefreshCw, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  TRIAL:           { ar: 'تجريبي',         en: 'Trial',           color: 'bg-blue-500/10 text-blue-600 border-blue-200'      },
  PENDING_PAYMENT: { ar: 'في انتظار الدفع', en: 'Pending Payment', color: 'bg-amber-500/10 text-amber-600 border-amber-200'    },
  ACTIVE:          { ar: 'نشط',            en: 'Active',          color: 'bg-green-500/10 text-green-600 border-green-200'    },
  EXPIRED:         { ar: 'منتهي',          en: 'Expired',         color: 'bg-gray-500/10 text-gray-500 border-gray-200'       },
  SUSPENDED:       { ar: 'موقوف',          en: 'Suspended',       color: 'bg-red-500/10 text-red-600 border-red-200'          },
  CANCELLED:       { ar: 'ملغى',           en: 'Cancelled',       color: 'bg-slate-500/10 text-slate-500 border-slate-200'    },
};

function StatusBadge({ status, locale }: { status: string; locale: string }) {
  const cfg = STATUS_LABELS[status] ?? { ar: status, en: status, color: 'bg-muted text-muted-foreground' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
      {t(locale, cfg.ar, cfg.en)}
    </span>
  );
}

export default function BillingRevenuePage() {
  const { isAdminAuthenticated } = useAdminAuthStore();
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const fmt = useCallback((n: number) => {
    const symbol = locale === 'ar' ? 'د.ج' : 'DZD';
    return `${n.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} ${symbol}`;
  }, [locale]);

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [pendingReceiptsCount, setPendingReceiptsCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      window.location.href = getAdminPath('login');
    }
  }, [isMounted, isAdminAuthenticated]);

  const fetchRevenueData = useCallback(async () => {
    if (!isAdminAuthenticated) return;
    setIsLoading(true);
    try {
      // Fetch all subscriptions (no pagination for analytics)
      const subsRes = await fetch('/api/admin/subscriptions?limit=1000');
      const subsData = await subsRes.json();
      
      const pkgsRes = await fetch('/api/admin/packages');
      const pkgsData = await pkgsRes.json();

      const receiptsRes = await fetch('/api/billing/receipts?status=pending');
      const receiptsData = await receiptsRes.json();

      if (subsData.success) setSubscriptions(subsData.subscriptions || []);
      if (pkgsData.success) setPackages(pkgsData.packages || []);
      if (receiptsData.success) setPendingReceiptsCount(receiptsData.receipts?.length || 0);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (isMounted) {
      fetchRevenueData();
    }
  }, [isMounted, fetchRevenueData]);

  if (!isMounted || !isAdminAuthenticated) return null;

  // calculations
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const suspendedSubs = subscriptions.filter(s => s.status === 'SUSPENDED');
  const trialSubs = subscriptions.filter(s => s.status === 'TRIAL');

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Expiring subscriptions
  const expiringThisMonth = subscriptions.filter(s => {
    const expiryDateStr = s.endDate || s.currentPeriodEnd || s.trialEndsAt;
    if (!expiryDateStr) return false;
    const d = new Date(expiryDateStr);
    return d >= now && d <= endOfMonth && ['ACTIVE', 'TRIAL'].includes(s.status);
  });

  // Calculate MRR (Monthly Recurring Revenue)
  // MRR is: Active subscriptions packages base price + active subscriptions addons totals
  const monthlyRevenue = activeSubs.reduce((sum, s) => {
    const basePrice = s.package?.price || 0;
    const addonsPrice = s.addonsTotal || 0;
    return sum + basePrice + addonsPrice;
  }, 0);

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={getAdminPath('')}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-indigo-500" />
              {t(locale, 'تقارير الإيرادات وتحليل الأرباح', 'Revenue Reports & Analytics')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t(locale, 'تحليل أرباح الاشتراكات والمبيعات الشهرية المتوقعة وتوزيع التجار حسب باقات الخدمة المختلفة', 'Analyze monthly subscription earnings, expected recurring revenue (MRR), and plans distribution')}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="h-9 rounded-xl gap-1.5 font-bold" onClick={fetchRevenueData}>
          <RefreshCw className="h-4 w-4" />
          {t(locale, 'تحديث البيانات', 'Refresh')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 min-h-[50vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground font-medium">
            {t(locale, 'جاري توليد التقرير المالي...', 'Generating financial reports...')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Glassmorphic Analytics Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                label: t(locale, 'اشتراكات نشطة', 'Active Subscriptions'),
                value: activeSubs.length.toString(),
                icon: <TrendingUp className="h-5 w-5 text-green-500" />,
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-500/10 border-green-200/50 dark:border-green-800/30',
              },
              {
                label: t(locale, 'الاشتراكات التجريبية', 'Trial Accounts'),
                value: trialSubs.length.toString(),
                icon: <Layers className="h-5 w-5 text-blue-500" />,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-500/10 border-blue-200/50 dark:border-blue-800/30',
              },
              {
                label: t(locale, 'الإيرادات الشهرية المتوقعة (MRR)', 'Monthly Recurring Rev (est.)'),
                value: fmt(monthlyRevenue),
                icon: <DollarSign className="h-5 w-5 text-brand" />,
                color: 'text-brand',
                bg: 'bg-brand/10 border-brand/20 dark:border-brand/5',
              },
              {
                label: t(locale, 'تنتهي هذا الشهر', 'Expiring This Month'),
                value: expiringThisMonth.length.toString(),
                icon: <CalendarDays className="h-5 w-5 text-amber-500" />,
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-500/10 border-amber-200/50 dark:border-amber-800/30',
              },
              {
                label: t(locale, 'متاجر معلّقة (مديونية)', 'Suspended Stores (Debt)'),
                value: suspendedSubs.length.toString(),
                icon: <ShieldOff className="h-5 w-5 text-red-500" />,
                color: 'text-red-600 dark:text-red-400',
                bg: 'bg-red-500/10 border-red-200/50 dark:border-red-800/30',
              },
            ].map(({ label, value, icon, color, bg }) => (
              <Card key={label} className={`border shadow-sm hover:scale-[1.01] transition-all duration-300 ${bg}`}>
                <CardContent className="pt-5 pb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {icon}
                    <p className="text-[11px] text-muted-foreground font-semibold leading-tight">{label}</p>
                  </div>
                  <p className={`text-2xl font-black font-mono leading-none ${color}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription Distribution by Status (Left 1 col) */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-brand" />
                    {t(locale, 'توزيع الاشتراكات حسب الحالة', 'Distribution by Lifecycle Status')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(STATUS_LABELS).map(([status, cfg]) => {
                    const count = subscriptions.filter(s => s.status === status).length;
                    const pct = subscriptions.length > 0 ? (count / subscriptions.length) * 100 : 0;
                    return (
                      <div key={status} className="p-3 border rounded-xl bg-muted/10 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <StatusBadge status={status} locale={locale} />
                          <span className="font-mono text-foreground font-black">{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-slate-400" 
                            style={{ 
                              width: `${pct}%`,
                              backgroundColor: status === 'ACTIVE' ? '#22C55E' : (status === 'SUSPENDED' ? '#EF4444' : (status === 'TRIAL' ? '#3B82F6' : '#6B7280')) 
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Plan Revenue breakdown (Right 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Package className="h-4 w-4 text-indigo-500" />
                    {t(locale, 'الإيرادات حسب باقات الاشتراكات (نشط)', 'Revenue Contribution by Package')}
                  </CardTitle>
                  <CardDescription>
                    {t(locale, 'قيمة العوائد الشهرية المتكررة لكل باقة بناءً على الاشتراكات النشطة حالياً', 'Monthly Recurring Revenue breakdown from currently active merchants in each tier')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {packages.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                      {t(locale, 'لا توجد بيانات للباقات حالياً', 'No packages data found')}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {packages.map(pkg => {
                        const pkgActiveSubs = activeSubs.filter(s => s.packageId === pkg.id || s.package?.id === pkg.id);
                        
                        // Add package price + active subscriptions addons totals for that package
                        const pkgRevenue = pkgActiveSubs.reduce((sum, s) => sum + (pkg.price || 0) + (s.addonsTotal || 0), 0);
                        const pct = monthlyRevenue > 0 ? (pkgRevenue / monthlyRevenue) * 100 : 0;
                        
                        return (
                          <div key={pkg.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 font-bold">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pkg.color || 'var(--brand)' }} />
                                <span style={{ color: pkg.color }}>
                                  {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                  {pkgActiveSubs.length} {t(locale, 'مشترك نشط', 'active subs')}
                                </span>
                                <span className="font-bold font-mono text-brand text-xs">
                                  {fmt(pkgRevenue)} ({pct.toFixed(0)}%)
                                </span>
                              </div>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: pkg.color || 'var(--brand)' }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      <div className="pt-4 border-t flex justify-between items-center text-sm font-black">
                        <span>{t(locale, 'إجمالي الإيرادات الشهرية المتوقعة (MRR)', 'Estimated Monthly MRR')}</span>
                        <span className="text-brand text-base font-mono">{fmt(monthlyRevenue)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expiring Subscriptions List */}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-amber-500" />
                    {t(locale, 'الاشتراكات التي تنتهي صلاحيتها هذا الشهر', 'Subscriptions Expiring This Month')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="text-xs text-start ps-4">{t(locale, 'التاجر', 'Merchant')}</TableHead>
                          <TableHead className="text-xs text-start">{t(locale, 'الباقة', 'Plan')}</TableHead>
                          <TableHead className="text-xs text-start">{t(locale, 'تاريخ الانتهاء', 'Expiry Date')}</TableHead>
                          <TableHead className="text-xs text-start">{t(locale, 'الحالة', 'Status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expiringThisMonth.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-xs font-semibold">
                              {t(locale, 'لا توجد اشتراكات تنتهي صلاحيتها هذا الشهر 🎉', 'No subscriptions expiring this month 🎉')}
                            </TableCell>
                          </TableRow>
                        ) : expiringThisMonth.map(sub => {
                          const expiryDateStr = sub.endDate || sub.currentPeriodEnd || sub.trialEndsAt;
                          const expDate = expiryDateStr ? new Date(expiryDateStr) : null;
                          const diffTime = expDate ? expDate.getTime() - now.getTime() : 0;
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          return (
                            <TableRow key={sub.id}>
                              <TableCell className="ps-4">
                                <div className="text-xs font-bold">{sub.user?.name}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{sub.user?.email}</div>
                              </TableCell>
                              <TableCell className="text-xs font-semibold">
                                {locale === 'ar' ? sub.package?.name : (sub.package?.nameEn || sub.package?.name)}
                              </TableCell>
                              <TableCell>
                                <div className="text-xs font-mono">
                                  {expDate ? expDate.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' }) : '—'}
                                </div>
                                <div className={`text-[10px] font-bold ${diffDays <= 3 ? 'text-red-500 animate-pulse' : 'text-amber-600'}`}>
                                  {diffDays <= 0 
                                    ? t(locale, 'تنتهي اليوم', 'Expires today') 
                                    : t(locale, `متبقي ${diffDays} يوم`, `${diffDays} days left`)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={sub.status} locale={locale} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
