'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { formatNumber } from '@/lib/mock-data';
import { PageHeader } from '@/components/shared/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Tracker,
  Color
} from '@tremor/react';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  ArrowUpRight,
  TrendingUp,
  Loader2,
  AlertCircle,
  Activity
} from 'lucide-react';
import type { Locale } from '@/types';

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getMonthLabel(index: number, locale: Locale) {
  return locale === 'ar' ? MONTHS_AR[index] : MONTHS_EN[index];
}

const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function StoreDashboard() {
  const { locale, setCurrentPage, activeStoreId, setActiveStoreId } = useAppStore();
  const { user } = useAuthStore();
  const isAr = locale === 'ar';

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ userId: user.id });
      if (activeStoreId) params.set('storeId', activeStoreId);
      const res = await fetch(`/api/seller/dashboard?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load dashboard statistics.');
      const d = await res.json();
      if (d.success) {
        setDashboardData(d);
      } else {
        throw new Error(d.error || 'Failed to parse dashboard data.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id, activeStoreId]);

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: t(locale, 'معلق', 'Pending'), color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    confirmed: { label: t(locale, 'مؤكد', 'Confirmed'), color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    shipped: { label: t(locale, 'تم الشحن', 'Shipped'), color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    delivered: { label: t(locale, 'تم التوصيل', 'Delivered'), color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    cancelled: { label: t(locale, 'ملغي', 'Cancelled'), color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-start w-full animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3 px-1">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-8 w-44 bg-muted rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        </div>

        {/* 6 KPI Cards Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded p-4 h-[110px] flex gap-4 relative overflow-hidden">
              <div className="h-10 w-10 bg-muted rounded shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-3 w-28 bg-muted rounded" />
                <div className="h-6 w-20 bg-muted rounded" />
                <div className="h-3 w-36 bg-muted rounded" />
              </div>
              <div className="absolute bottom-3 end-4 flex items-end gap-[2px] h-6 opacity-30">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="w-[3px] bg-muted rounded-t-sm" style={{ height: `${(j % 3 + 1) * 30}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Grid Skeletons */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-card border border-border rounded p-5 h-[340px] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-6 w-48 bg-muted rounded" />
            </div>
            <div className="flex-1 flex items-end gap-3 pt-6 pb-2">
              {Array.from({ length: 12 }).map((_, j) => (
                <div key={j} className="flex-1 bg-muted rounded-t-sm" style={{ height: `${(Math.sin(j) + 1.5) * 30}%` }} />
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded p-5 h-[340px] flex flex-col justify-between">
            <div className="pb-3 border-b border-border/50">
              <div className="h-4 w-36 bg-muted rounded" />
            </div>
            <div className="flex-1 flex items-center justify-center py-6">
              <div className="h-32 w-32 rounded-full border-8 border-muted shrink-0" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center space-y-4 p-6">
        <AlertCircle className="h-16 w-16 text-destructive animate-bounce" />
        <h3 className="text-xl font-black">{t(locale, 'عذراً، فشل تحميل البيانات', 'Sorry, failed to load data')}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={fetchDashboardData} variant="outline" className="mt-4 font-bold rounded-xl">
          {t(locale, 'إعادة المحاولة', 'Try Again')}
        </Button>
      </div>
    );
  }

  const { kpis = {}, products = [], recentOrders = [] } = dashboardData || {};

  const storeCurrency = dashboardData?.currency || 'DZD';
  const formatStoreCurrency = (amount: number) => {
    const safeAmount = amount ?? 0;
    const formattedAmount = safeAmount.toLocaleString(locale === 'ar' ? 'ar-DZ' : 'en-US');
    if (locale === 'ar') {
      return storeCurrency === 'DZD' ? `${formattedAmount} د.ج` : `${formattedAmount} ${storeCurrency}`;
    }
    return `${storeCurrency} ${formattedAmount}`;
  };

  // Chart Data Preparation
  const chartData = (dashboardData?.chartData || []).map((item: any) => ({
    name: getMonthLabel(item.monthOffset, locale),
    [t(locale, 'المبيعات', 'Sales')]: item.sales,
    // [t(locale, 'الزوار', 'Visitors')]: item.visitors || 0, // Delayed to Phase 4
  }));

  const donutData = (dashboardData?.donutData || []).map((item: any) => ({
    name: isAr ? item.nameAr : item.nameEn,
    sales: item.sales
  }));

  return (
    <motion.div 
      className="space-y-4 text-start w-full"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={FADE_IN_VARIANTS} className="flex items-center justify-between flex-wrap gap-4 mb-3 px-1">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              {t(locale, 'نظرة عامة', 'OVERVIEW')}
            </p>
            <h1 className="text-[26px] leading-tight font-bold text-[var(--gentelella-heading)]">{t(locale, 'لوحة التحكم', 'Dashboard')}</h1>
          </div>
          
          {/* Store / Branch Switcher */}
          {dashboardData?.stores && dashboardData.stores.length > 1 && (
            <div className="flex items-center gap-2 border-s border-border ps-3 mb-1">
              <Select
                value={activeStoreId || (dashboardData.stores[0]?.id)}
                onValueChange={(val) => setActiveStoreId(val)}
              >
                <SelectTrigger className="w-48 h-8 rounded border-border bg-card text-xs font-bold px-3 py-1 shadow-sm">
                  <SelectValue placeholder={t(locale, 'اختر الفرع/المتجر', 'Select Branch/Store')} />
                </SelectTrigger>
                <SelectContent>
                  {dashboardData.stores.map((s: any) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-bold">
                      {isAr ? s.name : (s.nameEn || s.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="font-bold rounded border-border text-xs h-8">
             + {t(locale, 'عرض جديد', 'New view')}
           </Button>
           <Button variant="default" size="sm" onClick={fetchDashboardData} className="font-bold rounded bg-[#1ABB9C] hover:bg-[#159a80] text-white text-xs h-8">
             + {t(locale, 'إنشاء تقرير', 'Create report')}
           </Button>
        </div>
      </motion.div>

      {/* KPI Stats Cards */}
      <motion.div variants={FADE_IN_VARIANTS}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-5">
          {/* TOTAL USERS */}
          <div className="card-surface bg-card text-card-foreground border border-border rounded shadow-sm relative overflow-hidden flex flex-col h-[110px]">
            <div className="p-4 flex-1 flex">
              <div className="flex gap-4 w-full">
                <div className="h-10 w-10 mt-1 rounded flex items-center justify-center shrink-0 bg-emerald-500/10">
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{t(locale, 'إجمالي العملاء', 'TOTAL CUSTOMERS')}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[22px] font-bold truncate text-[var(--gentelella-heading)]">{kpis?.totalCustomers ?? 0}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">{t(locale, 'عملاء فريدين', 'unique customers')}</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 end-4 flex items-end gap-[2px] h-6 opacity-40" dir="ltr">
              {[4, 7, 3, 8, 5, 9, 6].map((h, i) => (
                <div key={i} className="w-[3px] bg-emerald-500 rounded-t-sm" style={{ height: `${h * 10}%` }} />
              ))}
            </div>
          </div>

          {/* AVG SESSION */}
          <div className="card-surface bg-card text-card-foreground border border-border rounded shadow-sm relative overflow-hidden flex flex-col h-[110px]">
            <div className="p-4 flex-1 flex">
              <div className="flex gap-4 w-full">
                <div className="h-10 w-10 mt-1 rounded flex items-center justify-center shrink-0 bg-blue-500/10">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{t(locale, 'متوسط قيمة الطلب', 'AVG ORDER VALUE')}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[22px] font-bold truncate text-[var(--gentelella-heading)]">{formatStoreCurrency(kpis?.averageOrderValue ?? 0)}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">{t(locale, 'من الطلبات المكتملة', 'from completed orders')}</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 end-4 flex items-end gap-[2px] h-6 opacity-40" dir="ltr">
              {[6, 8, 5, 9, 7, 4, 8].map((h, i) => (
                <div key={i} className="w-[3px] bg-blue-500 rounded-t-sm" style={{ height: `${h * 10}%` }} />
              ))}
            </div>
          </div>

          {/* ORDERS */}
          <div className="card-surface bg-card text-card-foreground border border-border rounded shadow-sm relative overflow-hidden flex flex-col h-[110px]">
            <div className="p-4 flex-1 flex">
              <div className="flex gap-4 w-full">
                <div className="h-10 w-10 mt-1 rounded flex items-center justify-center shrink-0 bg-orange-500/10">
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{t(locale, 'الطلبات الشهرية', 'MONTHLY ORDERS')}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[22px] font-bold truncate text-[var(--gentelella-heading)]">{kpis?.monthOrderCount ?? 0}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">{kpis?.completedMonthOrders ?? 0} {t(locale, 'مكتملة', 'completed')}</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 end-4 flex items-end gap-[2px] h-6 opacity-40" dir="ltr">
              {[8, 6, 9, 5, 4, 7, 5].map((h, i) => (
                <div key={i} className="w-[3px] bg-orange-500 rounded-t-sm" style={{ height: `${h * 10}%` }} />
              ))}
            </div>
          </div>

          {/* REVENUE */}
          <div className="card-surface bg-card text-card-foreground border border-border rounded shadow-sm relative overflow-hidden flex flex-col h-[110px]">
            <div className="p-4 flex-1 flex">
              <div className="flex gap-4 w-full">
                <div className="h-10 w-10 mt-1 rounded flex items-center justify-center shrink-0 bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{t(locale, 'الإيرادات الشهرية', 'MONTHLY REVENUE')}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[22px] font-bold truncate text-[var(--gentelella-heading)]">{formatStoreCurrency(kpis?.monthRevenue ?? 0)}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">{t(locale, 'من الطلبات المكتملة', 'From completed orders')}</p>
                </div>
              </div>
            </div>
            <div className="w-full px-4 pb-4">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-[#1ABB9C] rounded-full" style={{ width: (kpis?.monthRevenue ?? 0) > 0 ? '100%' : '0%' }} />
              </div>
            </div>
          </div>

          {/* CONVERSIONS */}
          <div className="card-surface bg-card text-card-foreground border border-border rounded shadow-sm relative overflow-hidden flex flex-col h-[110px]">
            <div className="p-4 flex-1 flex">
              <div className="flex gap-4 w-full">
                <div className="h-10 w-10 mt-1 rounded flex items-center justify-center shrink-0 bg-red-500/10">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{t(locale, 'نسبة الإكمال', 'COMPLETION RATE')}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[22px] font-bold truncate text-[var(--gentelella-heading)]">{(kpis?.completionRate ?? 0).toFixed(1)}%</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">{t(locale, 'طلبات مكتملة / إجمالي', 'completed / total')}</p>
                </div>
              </div>
            </div>
            <div className="w-full px-4 pb-4">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-red-500 rounded-full" style={{ width: `${kpis?.completionRate ?? 0}%` }} />
              </div>
            </div>
          </div>

          {/* PAGE VIEWS */}
          <div className="card-surface bg-card text-card-foreground border border-border rounded shadow-sm relative overflow-hidden flex flex-col h-[110px]">
            <div className="p-4 flex-1 flex">
              <div className="flex gap-4 w-full">
                <div className="h-10 w-10 mt-1 rounded flex items-center justify-center shrink-0 bg-purple-500/10">
                  <Activity className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{t(locale, 'إجمالي الأرباح', 'TOTAL EARNINGS')}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[22px] font-bold truncate text-[var(--gentelella-heading)]">{formatStoreCurrency(kpis?.totalEarnings ?? 0)}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">{t(locale, 'طوال الوقت', 'all time')}</p>
                </div>
              </div>
            </div>
            <div className="w-full px-4 pb-4">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-purple-500 rounded-full" style={{ width: (kpis?.totalEarnings ?? 0) > 0 ? '100%' : '0%' }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main Chart */}
        <motion.div variants={FADE_IN_VARIANTS} className="xl:col-span-2">
          <Card className="rounded-md shadow-sm border-border h-full flex flex-col card-surface">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 px-5 pt-5">
              <CardTitle className="text-[15px] font-bold text-[var(--gentelella-heading)]">
                {t(locale, 'نشاط الشبكة', 'Network Activities')}
              </CardTitle>
              <div className="flex items-center text-[11px] font-bold border border-border rounded divide-x divide-border">
                 <button className="px-3 py-1 hover:bg-muted transition-colors">7 days</button>
                 <button className="px-3 py-1 bg-muted">30 days</button>
                 <button className="px-3 py-1 hover:bg-muted transition-colors">90 days</button>
              </div>
            </CardHeader>
            <CardContent className="pt-5 px-5">
               <div className="flex items-baseline gap-2 mb-1">
                 <h2 className="text-[28px] font-bold">6,782</h2>
                 <span className="text-emerald-500 text-sm font-bold flex items-center"><ArrowUpRight className="h-3 w-3" /> 7%</span>
               </div>
               <p className="text-[12px] text-muted-foreground mb-6">{t(locale, 'إجمالي الجلسات هذا الأسبوع', 'Total sessions this week')}</p>
               <div dir="ltr">
                  <AreaChart
                    className="h-72"
                    data={chartData}
                    index="name"
                    categories={[t(locale, 'المبيعات', 'Sales')]}
                    colors={["emerald"]}
                    valueFormatter={(number: number) => formatNumber(number)}
                    showAnimation={true}
                    curveType="monotone"
                    showGridLines={true}
                  />
               </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={FADE_IN_VARIANTS} className="xl:col-span-1">
          <Card className="rounded-md shadow-sm border-border h-full flex flex-col card-surface">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 px-5 pt-5">
              <CardTitle className="text-[15px] font-bold text-[var(--gentelella-heading)]">
                {t(locale, 'النشاط الأخير', 'Recent Activity')}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <span className="sr-only">More</span>
                ...
              </Button>
            </CardHeader>
            <CardContent className="pt-5 px-5 flex-1">
               <div className="space-y-6 relative before:absolute before:inset-0 before:ms-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {recentOrders.length > 0 ? recentOrders.slice(0, 6).map((item: any, idx: number) => {
                    if (!item || !item.order) return null;
                    const isCompleted = item.order.status === 'completed' || item.order.status === 'delivered';
                    const color = isCompleted ? 'bg-emerald-500' : 'bg-blue-600';
                    const initial = item.order.buyer?.name ? item.order.buyer.name.substring(0, 2).toUpperCase() : 'O';
                    const title = `${t(locale, 'طلب جديد', 'New order')} #${item.order.orderNumber} ${t(locale, 'بقيمة', 'for')} ${formatStoreCurrency(Number(item.total || 0))}`;
                    const time = new Date(item.order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', { day: 'numeric', month: 'short' });
                    
                    return (
                      <div key={idx} className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`h-8 w-8 rounded-full ${color} text-white flex items-center justify-center text-[10px] font-bold shrink-0 ring-4 ring-card z-10`}>
                            {initial}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium leading-tight">{title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="relative flex flex-col items-center justify-center py-6 z-10 bg-card rounded-md border border-dashed border-border text-center">
                      <Activity className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-[12px] text-muted-foreground">{t(locale, 'لا توجد نشاطات حالياً', 'No recent activity yet')}</p>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders List Mini */}
        <motion.div variants={FADE_IN_VARIANTS} className="xl:col-span-2">
          <Card className="rounded-md shadow-sm border-border h-full flex flex-col card-surface">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 px-5 pt-5">
              <div>
                <CardTitle className="text-[15px] font-bold text-[var(--gentelella-heading)]">
                  {t(locale, 'أحدث الطلبات', 'Recent Orders')}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-1">Latest 5 transactions</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage('store-orders' as any)} className="text-xs h-7 px-3 rounded">
                View All →
              </Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-start">
                   <thead className="text-[11px] text-muted-foreground uppercase bg-muted/30 border-b border-border">
                     <tr>
                       <th className="px-5 py-3 font-semibold text-start">Order</th>
                       <th className="px-5 py-3 font-semibold text-start">Customer</th>
                       <th className="px-5 py-3 font-semibold text-start">Product</th>
                       <th className="px-5 py-3 font-semibold text-start">Amount</th>
                       <th className="px-5 py-3 font-semibold text-start">Status</th>
                       <th className="px-5 py-3 font-semibold text-start">Date</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     {recentOrders && recentOrders.length > 0 ? (recentOrders || []).slice(0, 5).map((item: any, idx: number) => {
                        if (!item || !item.order) return null;
                        const st = STATUS_CONFIG[item.order.status] ?? STATUS_CONFIG.pending;
                        return (
                          <tr key={idx} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3 font-mono text-xs">#{item.order.orderNumber || ''}</td>
                            <td className="px-5 py-3 font-medium text-[13px]">{item.order.buyer?.name || item.order.user?.name || 'Guest'}</td>
                            <td className="px-5 py-3 text-[13px] max-w-[150px] truncate">{item.product?.name || item.productName || ''}</td>
                            <td className="px-5 py-3 font-bold text-[13px]">{formatStoreCurrency(item.total)}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.color}`}>
                                {st.label}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-[11px] text-muted-foreground">
                              {item.order.createdAt ? new Date(item.order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') : ''}
                            </td>
                          </tr>
                        );
                     }) : (
                       <tr>
                         <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-[13px]">
                           {t(locale, 'لا توجد طلبات حديثة', 'No recent orders')}
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Summary */}
        <motion.div variants={FADE_IN_VARIANTS} className="xl:col-span-1">
          <Card className="rounded-md shadow-sm border-border h-full flex flex-col card-surface">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 px-5 pt-5">
              <CardTitle className="text-[15px] font-bold text-[var(--gentelella-heading)]">
                {t(locale, 'المنتجات', 'Products')}
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">{products.length} {t(locale, 'عنصر', 'Items')}</span>
            </CardHeader>
            <CardContent className="pt-6 px-5 flex flex-col items-center justify-center">
               <div className="h-32 w-32 rounded-full border-8 border-emerald-500/20 flex flex-col items-center justify-center shrink-0 mb-6">
                 <span className="text-3xl font-bold text-emerald-500">{products.length}</span>
                 <span className="text-[10px] text-muted-foreground uppercase">{t(locale, 'نشط', 'ACTIVE')}</span>
               </div>
               
               <div className="space-y-4 w-full">
                 <div className="flex items-center justify-between text-[13px] w-full px-4 py-2 bg-muted/30 rounded border border-border">
                   <div className="flex items-center gap-2">
                     <span className="h-2 w-2 rounded-full bg-emerald-500" />
                     <span>{t(locale, 'منتجات معروضة', 'Published Products')}</span>
                   </div>
                   <span className="font-bold">{products.filter((p:any) => p.status === 'active').length || products.length}</span>
                 </div>
                 <div className="flex items-center justify-between text-[13px] w-full px-4 py-2 bg-muted/30 rounded border border-border">
                   <div className="flex items-center gap-2">
                     <span className="h-2 w-2 rounded-full bg-red-500" />
                     <span>{t(locale, 'نفدت الكمية', 'Out of Stock')}</span>
                   </div>
                   <span className="font-bold">{products.filter((p:any) => p.stock === 0).length || 0}</span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
