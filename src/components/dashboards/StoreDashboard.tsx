'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/mock-data';
import { PageHeader } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
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
  const { locale, setCurrentPage } = useAppStore();
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
      const res = await fetch(`/api/seller/dashboard?userId=${user.id}`);
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
  }, [user?.id]);

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: t(locale, 'معلق', 'Pending'), color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    confirmed: { label: t(locale, 'مؤكد', 'Confirmed'), color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    shipped: { label: t(locale, 'تم الشحن', 'Shipped'), color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    delivered: { label: t(locale, 'تم التوصيل', 'Delivered'), color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    cancelled: { label: t(locale, 'ملغي', 'Cancelled'), color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          {t(locale, 'جاري جلب بيانات المتجر المتطورة...', 'Loading advanced store metrics...')}
        </p>
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

  const { kpis, products, recentOrders } = dashboardData;

  // Chart Data Preparation
  const chartData = [
    { name: getMonthLabel(0, locale), sales: 320, visitors: 1500 },
    { name: getMonthLabel(1, locale), sales: 480, visitors: 2100 },
    { name: getMonthLabel(2, locale), sales: 640, visitors: 3400 },
    { name: getMonthLabel(3, locale), sales: 410, visitors: 1800 },
    { name: getMonthLabel(4, locale), sales: 520, visitors: 2900 },
    { name: getMonthLabel(5, locale), sales: 890, visitors: 4200 },
  ];

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6 text-start"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={FADE_IN_VARIANTS} className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader
          title={t(locale, 'لوحة تحكم المتجر', 'Store Dashboard')}
          description={`${t(locale, 'مرحباً بك في لوحة تحكم متجرك:', 'Welcome to your store dashboard:')} ${dashboardData.seller?.storeName || user?.name}`}
        />
        <Button variant="default" size="sm" onClick={fetchDashboardData} className="font-bold rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Activity className="h-4 w-4 me-2" />
          {t(locale, 'تحديث حي', 'Live Sync')}
        </Button>
      </motion.div>

      {/* KPI Stats Cards - Glassmorphism */}
      <motion.div variants={FADE_IN_VARIANTS} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: t(locale, 'الإيرادات', 'Revenue'), value: formatCurrency(kpis.monthRevenue ?? 0), icon: DollarSign, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
          { title: t(locale, 'المبيعات', 'Sales'), value: formatNumber(kpis.totalSales ?? 0), icon: ShoppingCart, color: 'from-blue-500 to-indigo-400', shadow: 'shadow-blue-500/20' },
          { title: t(locale, 'المنتجات', 'Products'), value: products.length, icon: Package, color: 'from-purple-500 to-pink-400', shadow: 'shadow-purple-500/20' },
          { title: t(locale, 'الزوار', 'Visitors'), value: '12,450', icon: Users, color: 'from-orange-500 to-amber-400', shadow: 'shadow-orange-500/20' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl border border-white/10 bg-background/60 backdrop-blur-xl shadow-xl ${stat.shadow} p-6 transition-all`}
          >
            <div className={`absolute -end-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-2xl`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
              </div>
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-emerald-500">
              <TrendingUp className="h-3 w-3 me-1" />
              <span>+12% {t(locale, 'عن الشهر الماضي', 'vs last month')}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div variants={FADE_IN_VARIANTS} className="xl:col-span-2">
          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {t(locale, 'تحليل الأداء (أرباح وزيارات)', 'Performance Analysis (Revenue & Traffic)')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--background))',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                      activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders List Mini */}
        <motion.div variants={FADE_IN_VARIANTS}>
          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">
                {t(locale, 'أحدث الطلبات', 'Recent Orders')}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentPage('store-orders' as any)}>
                <ArrowUpRight className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-4 mt-2">
                {recentOrders.slice(0, 5).map((item: any, idx: number) => {
                  const st = STATUS_CONFIG[item.order.status] ?? STATUS_CONFIG.pending;
                  return (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: isAr ? -5 : 5 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${st.color} bg-opacity-20`}>
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm max-w-[120px] truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">#{item.order.orderNumber}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="font-bold text-sm text-primary">{formatCurrency(item.total)}</p>
                        <Badge variant="outline" className={`text-[10px] mt-1 border ${st.color}`}>
                          {st.label}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
}
