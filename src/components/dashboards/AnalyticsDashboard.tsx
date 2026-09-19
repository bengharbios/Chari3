'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  DonutChart,
  BarChart,
  List,
  ListItem,
} from '@tremor/react';
import {
  TrendingUp,
  MapPin,
  Users,
  Box,
  Loader2,
  CalendarDays,
  Filter,
  Lock
} from 'lucide-react';
import type { Locale } from '@/types';
import Link from 'next/link';

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AnalyticsDashboard({ sellerPackage }: { sellerPackage?: any }) {
  const { locale, activeStoreId } = useAppStore();
  const { user } = useAuthStore();
  const isAr = locale === 'ar';
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('userId', user.id);
    if (activeStoreId) params.append('storeId', activeStoreId);
    params.append('range', dateRange);
    params.append('statusFilter', statusFilter);

    fetch(`/api/seller/analytics?${params.toString()}`, { credentials: 'include' })
      .then(r => {
        if (r.status === 403) {
          setIsForbidden(true);
        }
        return r.json();
      })
      .then(res => {
        if (res.success) {
          setData(res);
          setIsForbidden(false);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user?.id, activeStoreId, dateRange, statusFilter]);

  const formatStoreCurrency = (amount: number) => {
    const formattedAmount = (amount || 0).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'en-US');
    if (locale === 'ar') {
      return `${formattedAmount} د.ج`;
    }
    return `DZD ${formattedAmount}`;
  };

  if ((sellerPackage && !sellerPackage.hasAnalytics) || isForbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
        <div className="bg-primary/10 p-4 rounded-full mb-6">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-[var(--gentelella-heading)]">
          {t(locale, 'ميزة التحليلات المتقدمة مقفلة', 'Advanced Analytics Locked')}
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          {t(
            locale,
            'قم بترقية باقتك للوصول إلى تحليلات متقدمة، رؤى العملاء، وتقارير أداء المنتجات لزيادة مبيعاتك.',
            'Upgrade your package to access advanced analytics, customer insights, and product performance reports to boost your sales.'
          )}
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href={`/${locale}/seller/billing`}>
            {t(locale, 'ترقية الباقة الآن', 'Upgrade Package Now')}
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const topProducts = data?.topProducts || [];
  const customerInsights = data?.customerInsights || { new: 0, returning: 0 };
  const ordersByState = data?.ordersByState || [];

  const donutData = [
    {
      name: t(locale, 'عملاء جدد', 'New Customers'),
      value: customerInsights.new
    },
    {
      name: t(locale, 'عملاء متكررين', 'Returning Customers'),
      value: customerInsights.returning
    }
  ];

  return (
    <motion.div 
      className="space-y-6 text-start w-full pb-12"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* Filter Bar */}
      <motion.div variants={FADE_IN_VARIANTS} className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-md border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[15px] font-bold">{t(locale, 'فلاتر التحليلات', 'Analytics Filters')}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder={t(locale, 'حالة الطلب', 'Order Status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t(locale, 'جميع الطلبات', 'All Orders')}</SelectItem>
              <SelectItem value="completed">{t(locale, 'الطلبات المكتملة فقط', 'Completed Orders Only')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <CalendarDays className="h-3 w-3 mr-2" />
              <SelectValue placeholder={t(locale, 'نطاق التاريخ', 'Date Range')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t(locale, 'اليوم', 'Today')}</SelectItem>
              <SelectItem value="7days">{t(locale, 'آخر 7 أيام', 'Last 7 Days')}</SelectItem>
              <SelectItem value="30days">{t(locale, 'آخر 30 يوم', 'Last 30 Days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <motion.div variants={FADE_IN_VARIANTS} className="lg:col-span-2">
          <Card className="rounded-md shadow-sm border-border h-full flex flex-col card-surface">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 px-5 pt-5">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-[15px] font-bold text-[var(--gentelella-heading)]">
                  {t(locale, 'المنتجات الأفضل أداءً', 'Top Performing Products')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5 px-5 flex-1">
              {topProducts.length > 0 ? (
                <BarChart
                  className="mt-4 h-72"
                  data={topProducts.map((p: any) => ({
                    name: isAr ? p.name : p.nameEn,
                    [t(locale, 'الإيرادات', 'Revenue')]: p.revenue
                  }))}
                  index="name"
                  categories={[t(locale, 'الإيرادات', 'Revenue')]}
                  colors={["emerald"]}
                  valueFormatter={(number: number) => formatStoreCurrency(number)}
                  yAxisWidth={80}
                  showAnimation={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-72 text-center text-muted-foreground">
                  <Box className="h-8 w-8 opacity-20 mb-2" />
                  <p className="text-sm">{t(locale, 'لا توجد بيانات كافية لهذا النطاق الزمني', 'No data available for this date range')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Insights */}
        <motion.div variants={FADE_IN_VARIANTS} className="lg:col-span-1">
          <Card className="rounded-md shadow-sm border-border h-full flex flex-col card-surface">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 px-5 pt-5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-[15px] font-bold text-[var(--gentelella-heading)]">
                  {t(locale, 'تحليل العملاء', 'Customer Insights')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-8 px-5 flex flex-col items-center flex-1">
              {(customerInsights.new > 0 || customerInsights.returning > 0) ? (
                <>
                  <DonutChart
                    className="h-48 w-48 mb-8"
                    data={donutData}
                    category="value"
                    index="name"
                    colors={["blue", "violet"]}
                    showAnimation={true}
                    variant="pie"
                  />
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between w-full px-4 py-2 bg-muted/30 rounded border border-border">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-sm">{t(locale, 'عملاء جدد', 'New Customers')}</span>
                      </div>
                      <span className="font-bold">{customerInsights.new}</span>
                    </div>
                    <div className="flex items-center justify-between w-full px-4 py-2 bg-muted/30 rounded border border-border">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-violet-500" />
                        <span className="text-sm">{t(locale, 'عملاء متكررين', 'Returning Customers')}</span>
                      </div>
                      <span className="font-bold">{customerInsights.returning}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 w-full text-center text-muted-foreground">
                  <Users className="h-8 w-8 opacity-20 mb-2" />
                  <p className="text-sm">{t(locale, 'لا توجد بيانات عملاء', 'No customer data')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders By State */}
        <motion.div variants={FADE_IN_VARIANTS} className="lg:col-span-3">
          <Card className="rounded-md shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 px-5 pt-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-[15px] font-bold text-[var(--gentelella-heading)]">
                  {t(locale, 'الطلبات حسب الولاية', 'Orders By State')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5 px-5">
              {ordersByState.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ordersByState.map((state: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border-b border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs font-mono">{idx + 1}.</span>
                        <span className="font-medium text-sm">{state.state}</span>
                      </div>
                      <span className="px-2 py-1 bg-muted rounded text-xs font-bold">{state.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 opacity-20 mb-2" />
                  <p className="text-sm">{t(locale, 'لا توجد بيانات جغرافية', 'No geographic data')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
