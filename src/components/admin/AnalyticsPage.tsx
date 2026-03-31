'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package,
  Star, Clock, ArrowUpRight, ArrowDownRight,
  BarChart3,
} from 'lucide-react';

function t(locale: Locale, ar: string, en: string) { return locale === 'ar' ? ar : en; }
function formatDZD(amount: number) { return new Intl.NumberFormat('ar-DZ').format(amount) + ' د.ج'; }

const MONTHLY_REVENUE = [
  { month: (l: Locale) => l === 'ar' ? 'جانفي' : 'Jan', revenue: 420000 },
  { month: (l: Locale) => l === 'ar' ? 'فيفري' : 'Feb', revenue: 580000 },
  { month: (l: Locale) => l === 'ar' ? 'مارس' : 'Mar', revenue: 720000 },
  { month: (l: Locale) => l === 'ar' ? 'أفريل' : 'Apr', revenue: 650000 },
  { month: (l: Locale) => l === 'ar' ? 'ماي' : 'May', revenue: 890000 },
  { month: (l: Locale) => l === 'ar' ? 'جوان' : 'Jun', revenue: 1100000 },
  { month: (l: Locale) => l === 'ar' ? 'جويلية' : 'Jul', revenue: 950000 },
];

const ORDER_STATUS = [
  { labelAr: 'تم التوصيل', labelEn: 'Delivered', count: 342, color: '#22C55E', pct: 62 },
  { labelAr: 'قيد التجهيز', labelEn: 'Processing', count: 98, color: '#3B82F6', pct: 18 },
  { labelAr: 'قيد الانتظار', labelEn: 'Pending', count: 65, color: '#F59E0B', pct: 12 },
  { labelAr: 'ملغي', labelEn: 'Cancelled', count: 28, color: '#EF4444', pct: 5 },
  { labelAr: 'مرتجع', labelEn: 'Returned', count: 17, color: '#F97316', pct: 3 },
];

const TOP_PRODUCTS = [
  { name: 'كريم أرغان عضوي', revenue: 900000, sold: 500, trend: 'up' },
  { name: 'سماعة بلوتوث', revenue: 525000, sold: 150, trend: 'up' },
  { name: 'قميص قطني', revenue: 420000, sold: 150, trend: 'down' },
  { name: 'شاشة 55 بوصة', revenue: 380000, sold: 4, trend: 'up' },
  { name: 'لابتوب HP', revenue: 350000, sold: 3, trend: 'up' },
];

const TOP_STORES = [
  { name: 'متجر التقنية', orders: 156, revenue: 2500000, rating: 4.7 },
  { name: 'مكتبة المعرفة', orders: 89, revenue: 1800000, rating: 4.6 },
  { name: 'بوتيك الأناقة', orders: 78, revenue: 1200000, rating: 4.3 },
  { name: 'متجر الطبيعة', orders: 65, revenue: 900000, rating: 4.9 },
  { name: 'متجر الرياضة', orders: 42, revenue: 680000, rating: 4.1 },
];

const RECENT_ACTIVITY = [
  { actionAr: 'طلب جديد #CD-2025-022', actionEn: 'New order #CD-2025-022', time: (l: Locale) => l === 'ar' ? 'منذ 5 دقائق' : '5 min ago', icon: ShoppingBag, color: 'text-blue-500' },
  { actionAr: 'متجر جديد "عالمتنقل"', actionEn: 'New store "DZ Express"', time: (l: Locale) => l === 'ar' ? 'منذ 15 دقيقة' : '15 min ago', icon: 'Store' as typeof ShoppingBag, color: 'text-green-500' },
  { actionAr: 'تقييم 5 نجوم من سارة بلقاسم', actionEn: '5-star review from Sara', time: (l: Locale) => l === 'ar' ? 'منذ 30 دقيقة' : '30 min ago', icon: Star, color: 'text-amber-500' },
  { actionAr: 'إرجاع طلب #CD-2025-018', actionEn: 'Return request #CD-2025-018', time: (l: Locale) => l === 'ar' ? 'منذ ساعة' : '1 hour ago', icon: Package, color: 'text-orange-500' },
  { actionAr: 'مستخدم جديد مسجل: يوسف', actionEn: 'New user: Youcef', time: (l: Locale) => l === 'ar' ? 'منذ ساعتين' : '2 hours ago', icon: Users, color: 'text-purple-500' },
];

type DateRange = '7d' | '30d' | '90d' | 'year';

export default function AnalyticsPage() {
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const maxRevenue = useMemo(() => Math.max(...MONTHLY_REVENUE.map(m => m.revenue)), []);

  const metrics = [
    { label: t(locale, 'إجمالي الإيرادات', 'Total Revenue'), value: '6,340,000 د.ج', change: '+12.5%', trend: 'up', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', icon: DollarSign },
    { label: t(locale, 'إجمالي الطلبات', 'Total Orders'), value: '550', change: '+8.3%', trend: 'up', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20', icon: ShoppingBag },
    { label: t(locale, 'متوسط قيمة الطلب', 'Avg Order'), value: '11,527 د.ج', change: '+3.1%', trend: 'up', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20', icon: BarChart3 },
    { label: t(locale, 'المستخدمين النشطين', 'Active Users'), value: '1,247', change: '+15.2%', trend: 'up', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20', icon: Users },
  ];

  const rangeBtns: { key: DateRange; lAr: string; lEn: string }[] = [
    { key: '7d', lAr: '7 أيام', lEn: '7 Days' },
    { key: '30d', lAr: '30 يوم', lEn: '30 Days' },
    { key: '90d', lAr: '90 يوم', lEn: '90 Days' },
    { key: 'year', lAr: 'هذا العام', lEn: 'This Year' },
  ];

  const pieGradient = ORDER_STATUS.reduce<{ gradient: string; accumulated: number }>(
    (acc, s) => ({
      gradient: acc.gradient
        ? `${acc.gradient}, ${s.color} ${acc.accumulated}% ${acc.accumulated + s.pct}%`
        : `${s.color} ${acc.accumulated}% ${acc.accumulated + s.pct}%`,
      accumulated: acc.accumulated + s.pct,
    }),
    { gradient: '', accumulated: 0 }
  ).gradient;

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{t(locale, 'لوحة الإحصائيات', 'Analytics Dashboard')}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{t(locale, 'نظرة شاملة على أداء المنصة', 'Platform performance overview')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {rangeBtns.map(r => (
            <Button key={r.key} variant={dateRange === r.key ? 'default' : 'outline'} size="sm" className={cn(dateRange === r.key && 'gradient-navy text-white')} onClick={() => setDateRange(r.key)}>
              {locale === 'ar' ? r.lAr : r.lEn}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', m.bg)}>
                  <Icon className={cn('h-5 w-5', m.color)} />
                </div>
                <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full', m.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                  {m.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {m.change}
                </div>
              </div>
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{m.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-4">{t(locale, 'الإيرادات الشهرية', 'Monthly Revenue')}</h3>
          <div className="flex items-end gap-2 h-48">
            {MONTHLY_REVENUE.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md gradient-navy transition-all hover:opacity-80" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: 4 }} />
                <span className="text-[9px] text-[var(--muted-foreground)] mt-1 whitespace-nowrap">{m.month(locale)}</span>
                <span className="text-[9px] text-[var(--muted-foreground)] font-mono">{(m.revenue / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Orders by Status - Pie Chart */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-4">{t(locale, 'الطلبات حسب الحالة', 'Orders by Status')}</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full shrink-0 relative" style={{ background: `conic-gradient(${pieGradient})` }}>
              <div className="absolute inset-3 rounded-full bg-[var(--card)] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-bold">550</p>
                  <p className="text-[9px] text-[var(--muted-foreground)]">{t(locale, 'طلب', 'orders')}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {ORDER_STATUS.map(s => (
                <div key={s.labelAr} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span>{locale === 'ar' ? s.labelAr : s.labelEn}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <span className="font-medium">{s.count}</span>
                    <span className="text-xs">({s.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-4">{t(locale, 'أفضل المنتجات', 'Top Products')}</h3>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-sm font-mono text-[var(--muted-foreground)] w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{p.sold} {t(locale, 'مبيع', 'sold')}</p>
                </div>
                <span className="text-sm font-semibold">{formatDZD(p.revenue)}</span>
                <div className={cn('h-5 w-5', p.trend === 'up' ? 'text-green-500' : 'text-red-500')}>
                  {p.trend === 'up' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Stores */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-4">{t(locale, 'أفضل المتاجر', 'Top Stores')}</h3>
          <div className="space-y-3">
            {TOP_STORES.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-sm font-mono text-[var(--muted-foreground)] w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{s.orders} {t(locale, 'طلب', 'orders')}</p>
                </div>
                <span className="text-sm font-semibold">{formatDZD(s.revenue)}</span>
                <div className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-400 fill-amber-400" /><span className="text-xs">{s.rating}</span></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-5">
        <h3 className="font-semibold text-sm mb-4">{t(locale, 'النشاط الأخير', 'Recent Activity')}</h3>
        <div className="space-y-3">
          {RECENT_ACTIVITY.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', a.color === 'text-green-500' ? 'bg-green-100 dark:bg-green-900/20' : a.color === 'text-blue-500' ? 'bg-blue-100 dark:bg-blue-900/20' : a.color === 'text-amber-500' ? 'bg-amber-100 dark:bg-amber-900/20' : a.color === 'text-orange-500' ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-purple-100 dark:bg-purple-900/20')}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{locale === 'ar' ? a.actionAr : a.actionEn}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{a.time(locale)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
