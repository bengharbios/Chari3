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

  const storeCurrency = dashboardData?.currency || 'DZD';
  const formatStoreCurrency = (amount: number) => {
    const formattedAmount = amount.toLocaleString(locale === 'ar' ? 'ar-DZ' : 'en-US');
    if (locale === 'ar') {
      return storeCurrency === 'DZD' ? `${formattedAmount} د.ج` : `${formattedAmount} ${storeCurrency}`;
    }
    return `${storeCurrency} ${formattedAmount}`;
  };

  // Chart Data Preparation
  const chartData = [
    { name: getMonthLabel(0, locale), [t(locale, 'المبيعات', 'Sales')]: 320, [t(locale, 'الزوار', 'Visitors')]: 1500 },
    { name: getMonthLabel(1, locale), [t(locale, 'المبيعات', 'Sales')]: 480, [t(locale, 'الزوار', 'Visitors')]: 2100 },
    { name: getMonthLabel(2, locale), [t(locale, 'المبيعات', 'Sales')]: 640, [t(locale, 'الزوار', 'Visitors')]: 3400 },
    { name: getMonthLabel(3, locale), [t(locale, 'المبيعات', 'Sales')]: 410, [t(locale, 'الزوار', 'Visitors')]: 1800 },
    { name: getMonthLabel(4, locale), [t(locale, 'المبيعات', 'Sales')]: 520, [t(locale, 'الزوار', 'Visitors')]: 2900 },
    { name: getMonthLabel(5, locale), [t(locale, 'المبيعات', 'Sales')]: 890, [t(locale, 'الزوار', 'Visitors')]: 4200 },
  ];

  const donutData = [
    { name: t(locale, 'إلكترونيات', 'Electronics'), sales: 450 },
    { name: t(locale, 'أزياء', 'Fashion'), sales: 300 },
    { name: t(locale, 'منزل', 'Home'), sales: 250 },
    { name: t(locale, 'أخرى', 'Other'), sales: 100 },
  ];

  return (
    <motion.div 
      className="space-y-6 text-start"
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

      {/* KPI Stats Cards - Tremor */}
      <motion.div variants={FADE_IN_VARIANTS}>
        <TremorGrid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
          <TremorCard decoration="top" decorationColor="emerald" className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg">
            <Text>{t(locale, 'الإيرادات', 'Revenue')}</Text>
            <Flex className="mt-2 gap-2" justifyContent="start" alignItems="baseline">
              <Metric className="font-black text-foreground">{formatStoreCurrency(kpis.monthRevenue ?? 0)}</Metric>
              <BadgeDelta deltaType="moderateIncrease">+12%</BadgeDelta>
            </Flex>
          </TremorCard>
          
          <TremorCard decoration="top" decorationColor="blue" className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg">
            <Text>{t(locale, 'المبيعات', 'Sales')}</Text>
            <Flex className="mt-2 gap-2" justifyContent="start" alignItems="baseline">
              <Metric className="font-black text-foreground">{formatNumber(kpis.totalSales ?? 0)}</Metric>
              <BadgeDelta deltaType="moderateIncrease">+8%</BadgeDelta>
            </Flex>
          </TremorCard>

          <TremorCard decoration="top" decorationColor="purple" className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg">
            <Text>{t(locale, 'المنتجات', 'Products')}</Text>
            <Flex className="mt-2 gap-2" justifyContent="start" alignItems="baseline">
              <Metric className="font-black text-foreground">{products.length}</Metric>
              <BadgeDelta deltaType="unchanged">0%</BadgeDelta>
            </Flex>
          </TremorCard>

          <TremorCard decoration="top" decorationColor="orange" className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-lg">
            <Text>{t(locale, 'الزوار', 'Visitors')}</Text>
            <Flex className="mt-2 gap-2" justifyContent="start" alignItems="baseline">
              <Metric className="font-black text-foreground">12,450</Metric>
              <BadgeDelta deltaType="increase">+24%</BadgeDelta>
            </Flex>
          </TremorCard>
        </TremorGrid>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div variants={FADE_IN_VARIANTS} className="xl:col-span-2">
          <TremorCard className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-xl h-full flex flex-col">
            <Title className="text-foreground">{t(locale, 'تحليل الأداء (أرباح وزيارات)', 'Performance Analysis (Revenue & Traffic)')}</Title>
            <div dir="ltr" className="flex-1 mt-4">
              <AreaChart
                className="h-72 mt-4"
                data={chartData}
                index="name"
                categories={[t(locale, 'المبيعات', 'Sales'), t(locale, 'الزوار', 'Visitors')]}
                colors={["blue", "cyan"]}
                valueFormatter={(number: number) => formatNumber(number)}
                showAnimation={true}
              />
            </div>
          </TremorCard>
        </motion.div>

        {/* Donut Chart / Category Breakdown */}
        <motion.div variants={FADE_IN_VARIANTS} className="xl:col-span-1">
          <TremorCard className="ring-0 border-border bg-background/60 backdrop-blur-xl shadow-xl h-full flex flex-col">
            <Title className="text-foreground">{t(locale, 'المبيعات حسب الفئة', 'Sales by Category')}</Title>
            <div dir="ltr" className="flex-1 mt-6 flex flex-col justify-center">
              <DonutChart
                className="h-48"
                data={donutData}
                category="sales"
                index="name"
                valueFormatter={(number: number) => formatNumber(number)}
                colors={["blue", "cyan", "indigo", "violet"]}
                showAnimation={true}
              />
            </div>
          </TremorCard>
        </motion.div>

        {/* Recent Orders List Mini */}
        <motion.div variants={FADE_IN_VARIANTS} className="xl:col-span-3">
          <Card className="border-border bg-background/60 backdrop-blur-xl shadow-xl rounded-2xl h-full flex flex-col">
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
                        <p className="font-bold text-sm text-primary">{formatStoreCurrency(item.total)}</p>
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
