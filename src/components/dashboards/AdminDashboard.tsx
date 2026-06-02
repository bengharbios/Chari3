'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  formatCurrency,
  formatNumber,
  getOrderStatusColor,
  getOrderStatusText,
} from '@/lib/mock-data';
import { StatsCard, StatusBadge, PageHeader } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Store,
  UserCog,
  Truck,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Star,
  Award,
  BarChart3,
  Clock,
  Activity,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  Settings,
  FolderTree,
  Wallet
} from 'lucide-react';
import type { Locale, UserRole } from '@/types';
import Link from 'next/link';
import AdminOrderStatuses from './AdminOrderStatuses';
import BillingManager from '@/components/admin/BillingManager';

// ============================================
// BILINGUAL HELPER
// ============================================

const t = (locale: Locale, ar: string, en: string) => (locale === 'ar' ? ar : en);

// ============================================
// ROLE LABELS
// ============================================

const getRoleLabel = (locale: Locale, role: UserRole): string => {
  const labels: Record<UserRole, { ar: string; en: string }> = {
    admin: { ar: 'مدير النظام', en: 'Admin' },
    store_manager: { ar: 'مدير المتجر', en: 'Store Manager' },
    seller: { ar: 'بائع مستقل', en: 'Seller' },
    supplier: { ar: 'مورد', en: 'Supplier' },
    logistics: { ar: 'مندوب توصيل', en: 'Courier' },
    buyer: { ar: 'مشتري', en: 'Buyer' },
  };
  return labels[role] ? (locale === 'ar' ? labels[role].ar : labels[role].en) : role;
};

const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    store_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    seller: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    supplier: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    logistics: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    buyer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

// ============================================
// STATUS BAR COLORS
// ============================================

const getStatusBarColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    processing: 'bg-purple-500',
    shipped: 'bg-cyan-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
    returned: 'bg-orange-500',
  };
  return map[status] || 'bg-gray-400';
};

const getStatusBarTrack = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/20',
    confirmed: 'bg-blue-100 dark:bg-blue-900/20',
    processing: 'bg-purple-100 dark:bg-purple-900/20',
    shipped: 'bg-cyan-100 dark:bg-cyan-900/20',
    delivered: 'bg-green-100 dark:bg-green-900/20',
    cancelled: 'bg-red-100 dark:bg-red-900/20',
    returned: 'bg-orange-100 dark:bg-orange-900/20',
  };
  return map[status] || 'bg-gray-100 dark:bg-gray-900/20';
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminDashboard() {
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch admin metrics');
      const d = await res.json();
      if (d.success) {
        setDashboardData(d);
      } else {
        throw new Error(d.error || 'Failed to parse admin metrics');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading admin portal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(t(locale, 'تم تحديث حالة الطلب بنجاح', 'Order status updated successfully'));
      
      // Update local state instead of full page reloading for instant feedback
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        const updatedRecent = prev.analytics.recentOrders.map((o: any) => {
          if (o.id === orderId) {
            return { ...o, status };
          }
          return o;
        });

        // Recalculate orders status stats
        const updatedStatusMap = new Map();
        updatedRecent.forEach((o: any) => {
          updatedStatusMap.set(o.status, (updatedStatusMap.get(o.status) || 0) + 1);
        });

        const allStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        const updatedStatusList = allStatuses.map((st) => ({
          status: st,
          count: updatedStatusMap.get(st) || 0,
        }));

        return {
          ...prev,
          analytics: {
            ...prev.analytics,
            recentOrders: updatedRecent,
            ordersByStatus: updatedStatusList,
          }
        };
      });

      // Silently refresh in background
      const refreshRes = await fetch('/api/admin/dashboard');
      if (refreshRes.ok) {
        const d = await refreshRes.json();
        if (d.success) setDashboardData(d);
      }
    } catch {
      toast.error(t(locale, 'فشل تحديث حالة الطلب', 'Failed to update order status'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUserToggleActive = async (userId: string, currentActive: boolean) => {
    setTogglingUserId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, isActive: !currentActive }),
      });
      if (!res.ok) throw new Error();
      
      toast.success(
        currentActive
          ? t(locale, 'تم تعليق حساب المستخدم بنجاح', 'User account suspended successfully')
          : t(locale, 'تم تفعيل حساب المستخدم بنجاح', 'User account activated successfully')
      );

      // Fetch fresh data
      const refreshRes = await fetch('/api/admin/dashboard');
      if (refreshRes.ok) {
        const d = await refreshRes.json();
        if (d.success) setDashboardData(d);
      }
    } catch {
      toast.error(t(locale, 'فشل تعديل حالة حساب المستخدم', 'Failed to change user account status'));
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleUserToggleVerify = async (userId: string, currentVerified: boolean) => {
    setTogglingUserId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, isVerified: !currentVerified }),
      });
      if (!res.ok) throw new Error();

      toast.success(
        currentVerified
          ? t(locale, 'تم إزالة التوثيق من البائع بنجاح', 'Verification removed from merchant successfully')
          : t(locale, 'تم توثيق البائع بنجاح في المنصة', 'Merchant successfully verified on the platform')
      );

      // Fetch fresh data
      const refreshRes = await fetch('/api/admin/dashboard');
      if (refreshRes.ok) {
        const d = await refreshRes.json();
        if (d.success) setDashboardData(d);
      }
    } catch {
      toast.error(t(locale, 'فشل تعديل حالة توثيق البائع', 'Failed to edit merchant verification status'));
    } finally {
      setTogglingUserId(null);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">
          {t(locale, 'جاري جلب إحصائيات المنصة والعمليات في الوقت الفعلي...', 'Fetching platform aggregates and real-time operations...')}
        </p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center space-y-4 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-black">{t(locale, 'عذراً، فشل تحميل البيانات', 'Sorry, failed to load data')}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {error || t(locale, 'يرجى التحقق من إعدادات الاتصال وحالة خادم قاعدة البيانات.', 'Please check connection settings and database status.')}
        </p>
        <Button onClick={fetchAdminData} variant="outline" className="mt-2 font-bold">
          {t(locale, 'إعادة المحاولة', 'Try Again')}
        </Button>
      </div>
    );
  }

  const { analytics, stats, users, stores = [], sellers = [] } = dashboardData;
  const {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalUsers,
    revenueChange,
    ordersChange,
    productsChange,
    usersChange,
    revenueByMonth,
    ordersByStatus,
    topProducts,
    recentOrders,
  } = analytics;

  const maxRevenue = Math.max(...revenueByMonth.map((m: any) => m.revenue), 100);
  const totalStatusOrders = ordersByStatus.reduce((sum: number, s: any) => sum + s.count, 0);

  return (
    <div dir={dir} className="space-y-6 text-start">
      {/* Page Header */}
      <PageHeader
        title={t(locale, 'لوحة تحكم المدير العام', 'General Admin Dashboard')}
        description={t(locale, 'نظرة شاملة على أداء المنصة والتحكم في الطلبات والمستخدمين في الوقت الفعلي', 'Platform-wide live overview, user control & real-time transaction updates')}
        actions={
          <div className="flex items-center gap-2">
            <Link href={getAdminPath('categories')}>
              <Button variant="outline" size="sm" className="gap-2 font-bold hover:bg-brand/10 hover:text-brand border-brand/20">
                <FolderTree className="h-4 w-4" />
                {t(locale, 'إدارة التصنيفات', 'Manage Categories')}
              </Button>
            </Link>
            <Link href={getAdminPath('settings')}>
              <Button variant="outline" size="sm" className="gap-2 font-bold hover:bg-brand/10 hover:text-brand border-brand/20">
                <Settings className="h-4 w-4" />
                {t(locale, 'إعدادات النظام', 'System Settings')}
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={fetchAdminData} className="gap-2 font-bold">
              <Activity className="h-4 w-4" />
              {t(locale, 'تحديث البيانات', 'Refresh Portal')}
            </Button>
          </div>
        }
      />

      {/* ============================================ */}
      {/* OVERVIEW STATS                              */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t(locale, 'إجمالي الإيرادات', 'Total Revenue')}
          value={formatCurrency(totalRevenue)}
          change={revenueChange}
          icon={<DollarSign className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          subtitle={t(locale, 'مقارنة بالشهر السابق', 'vs last month')}
        />
        <StatsCard
          title={t(locale, 'إجمالي الطلبات', 'Total Orders')}
          value={formatNumber(totalOrders)}
          change={ordersChange}
          icon={<ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          subtitle={t(locale, 'مقارنة بالشهر السابق', 'vs last month')}
        />
        <StatsCard
          title={t(locale, 'إجمالي المنتجات', 'Total Products')}
          value={formatNumber(totalProducts)}
          change={productsChange}
          icon={<Package className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-brand/10 text-brand"
          subtitle={t(locale, 'مقارنة بالشهر السابق', 'vs last month')}
        />
        <StatsCard
          title={t(locale, 'إجمالي المستخدمين', 'Total Users')}
          value={formatNumber(totalUsers)}
          change={usersChange}
          icon={<Users className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          subtitle={t(locale, 'مقارنة بالشهر السابق', 'vs last month')}
        />
      </div>

      {/* ============================================ */}
      {/* CHARTS ROW                                  */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="card-surface lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                {t(locale, 'الإيرادات الشهرية الحقيقية', 'Dynamic Monthly Revenue')}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {t(locale, 'آخر 12 شهر', 'Last 12 months')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 sm:gap-2 h-48">
              {revenueByMonth.map((item: any, index: number) => {
                const height = (item.revenue / maxRevenue) * 100;
                const isHighest = item.revenue === maxRevenue && maxRevenue > 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center hidden sm:block">
                      {formatNumber(item.revenue)}
                    </span>
                    <div className="w-full relative group">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 cursor-pointer ${
                          isHighest
                            ? 'bg-brand'
                            : 'bg-brand/60 hover:bg-brand/80'
                        }`}
                        style={{ height: `${Math.max(4, height * 1.3)}px` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {locale === 'ar' ? item.month : item.monthEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card className="card-surface">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              {t(locale, 'الطلبات حسب الحالة', 'Orders by Status')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordersByStatus.map((item: any) => {
              const percentage = totalStatusOrders > 0 ? Math.round((item.count / totalStatusOrders) * 100) : 0;
              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-bold">
                      {locale === 'ar'
                        ? getOrderStatusText(item.status as any)
                        : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.count}</span>
                      <span className="text-xs text-muted-foreground">({percentage}%)</span>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full ${getStatusBarTrack(item.status)}`}>
                    <div
                      className={`h-full rounded-full ${getStatusBarColor(item.status)} transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t mt-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{t(locale, 'إجمالي الطلبات الفعلي', 'Real-Time Orders count')}</span>
                <span className="font-bold">{totalStatusOrders.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* TABS: ORDERS / PRODUCTS / USERS             */}
      {/* ============================================ */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="gap-1.5 font-bold">
            <ShoppingCart className="h-3.5 w-3.5" />
            {t(locale, 'الطلبات المعالجة والتحكم الفوري', 'Platform Orders & Control')}
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5 font-bold">
            <Star className="h-3.5 w-3.5" />
            {t(locale, 'المنتجات الأكثر مبيعاً في النظام', 'Platform Top Selling')}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 font-bold">
            <Users className="h-3.5 w-3.5" />
            {t(locale, 'إدارة حسابات المستخدمين', 'Interactive Users Directory')}
          </TabsTrigger>
          <TabsTrigger value="stores-sellers" className="gap-1.5 font-bold">
            <Store className="h-3.5 w-3.5" />
            {t(locale, 'المتاجر والتجار', 'Stores & Sellers')}
          </TabsTrigger>
          <TabsTrigger value="order-statuses" className="gap-1.5 font-bold">
            <Settings className="h-3.5 w-3.5" />
            {t(locale, 'إعدادات الحالات', 'Order Statuses')}
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 font-bold">
            <Wallet className="h-3.5 w-3.5" />
            {t(locale, 'الاشتراكات والمديونية', 'Billing & Subscriptions')}
          </TabsTrigger>
        </TabsList>

        {/* ---- LIVE RECENT ORDERS TAB ---- */}
        <TabsContent value="orders">
          <Card className="card-surface">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {t(locale, 'إدارة وتحديث الطلبات المنفذة', 'Manage & Dispatch Platform Orders')}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(locale, 'لوحة تحكم المدير تملك حق التجاوز المباشر (Override) لتحديث أي حالة دفع أو توصيل', 'Admin overrides orders and triggers immediate transaction updates globally')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start ps-2">{t(locale, 'رقم الطلب', 'Order #')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'المشتري والمعلومات', 'Buyer Details')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'الحالة الحالية', 'Current Status')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'المبلغ', 'Total')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'تحديث الحالة فورياً', 'Override Status')}</TableHead>
                      <TableHead className="text-start pe-2">{t(locale, 'التاريخ', 'Date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-bold">
                          {t(locale, 'لا توجد طلبات مسجلة في النظام بعد.', 'No orders registered in the system yet.')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.map((order: any) => {
                        let addressData: any = {};
                        try {
                          addressData = typeof order.address === 'string' ? JSON.parse(order.address) : order.address || {};
                        } catch (e) {}

                        const buyerName = order.buyer?.name || addressData.fullName || t(locale, 'عميل زائر', 'Guest Buyer');
                        const buyerPhone = order.buyer?.phone || addressData.phone || t(locale, 'غير متوفر', 'N/A');

                        return (
                          <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="ps-2 font-bold font-mono text-brand">
                              {order.orderNumber}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarFallback className="text-[10px] bg-brand/10 text-brand font-bold">
                                    {buyerName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-xs text-start">
                                  <p className="font-semibold text-foreground">{buyerName}</p>
                                  <p className="text-[10px] text-muted-foreground">{buyerPhone}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                status={getOrderStatusText(order.status)}
                                colorClass={getOrderStatusColor(order.status)}
                              />
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatCurrency(order.total)}
                            </TableCell>
                            <TableCell>
                              {updatingOrderId === order.id ? (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Loader2 className="h-3 w-3 animate-spin text-brand" />
                                  <span>{t(locale, 'تحديث...', 'Saving...')}</span>
                                </div>
                              ) : (
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className="bg-surface text-foreground text-xs font-bold border border-border/80 rounded-xl px-2 py-1 focus:ring-1 focus:ring-brand focus:outline-none cursor-pointer"
                                >
                                  <option value="pending">{t(locale, 'معلق', 'Pending')}</option>
                                  <option value="confirmed">{t(locale, 'مؤكد', 'Confirmed')}</option>
                                  <option value="shipped">{t(locale, 'تم الشحن', 'Shipped')}</option>
                                  <option value="delivered">{t(locale, 'تم التوصيل', 'Delivered')}</option>
                                  <option value="cancelled">{t(locale, 'ملغي', 'Cancelled')}</option>
                                </select>
                              )}
                            </TableCell>
                            <TableCell className="pe-2 text-muted-foreground text-xs font-mono">
                              {new Date(order.createdAt).toLocaleDateString(
                                locale === 'ar' ? 'ar-SA' : 'en-US',
                                { month: 'short', day: 'numeric', year: 'numeric' }
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- REAL TOP PRODUCTS TAB ---- */}
        <TabsContent value="products">
          <Card className="card-surface">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                {t(locale, 'المنتجات الأكثر طلباً ومبيعاً', 'Real Top Selling Products')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px]">
                <div className="space-y-3">
                  {topProducts.length === 0 ? (
                    <p className="text-center py-12 text-muted-foreground font-bold">
                      {t(locale, 'لا توجد مبيعات مسجلة في المنتجات بعد.', 'No sales statistics captured for products yet.')}
                    </p>
                  ) : (
                    topProducts.map((item: any, index: number) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3 p-3 rounded-xl border bg-surface/50 hover:bg-surface transition-colors hover:scale-[1.005]"
                      >
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : index === 1
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                : index === 2
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-surface text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="h-12 w-12 rounded-lg bg-surface overflow-hidden shrink-0 border">
                          <img
                            src={item.product.images[0] || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120'}
                            alt={locale === 'ar' ? item.product.name : (item.product.nameEn || item.product.name)}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 text-start">
                          <p className="text-sm font-bold truncate text-foreground">
                            {locale === 'ar' ? item.product.name : (item.product.nameEn || item.product.name)}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                              <Package className="h-3 w-3" />
                              {item.soldCount.toLocaleString()} {t(locale, 'مباع فعلياً', 'sold units')}
                            </span>
                            <span className="text-xs flex items-center gap-0.5 text-yellow-500 font-bold">
                              <Star className="h-3 w-3 fill-yellow-500" />
                              {item.product.rating}
                            </span>
                          </div>
                        </div>

                        <div className="text-end shrink-0">
                          <p className="text-sm font-black text-brand">
                            {formatCurrency(item.revenue)}
                          </p>
                          <p className="text-xs text-muted-foreground font-semibold">
                            {formatCurrency(item.product.price)} / {t(locale, 'قطعة', 'unit')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- REAL INTERACTIVE USER MANAGEMENT TAB ---- */}
        <TabsContent value="users">
          <Card className="card-surface">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                {t(locale, 'دليل حسابات المستخدمين النشطين والتوثيق', 'Live Directory of Users & Merchant Approvals')}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(locale, 'يمكنك مراجعة وتعديل مستويات توثيق البائعين والتحكم في قفل أو تفعيل الحسابات المنتهكة فورياً', 'Review, toggle verification levels, suspend or reactivate violator merchant profiles instantly')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {users.map((u: any) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-4 rounded-xl border bg-surface/50 hover:bg-surface transition-all duration-300 hover:scale-[1.01] hover:border-brand/30"
                  >
                    <Avatar className="h-10 w-10 shrink-0 border">
                      <AvatarFallback className="text-sm font-bold bg-surface text-brand">
                        {u.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 text-start space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black text-foreground truncate">
                          {locale === 'ar' ? u.name : (u.nameEn || u.name)}
                        </p>
                        {u.isVerified && (
                          <span title={t(locale, 'موثق', 'Verified')}>
                            <Award className="h-4 w-4 text-blue-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate font-mono">{u.email}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{u.phone || '-'}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusBadge
                        status={getRoleLabel(locale, u.role)}
                        colorClass={getRoleColor(u.role)}
                      />
                      
                      <div className="flex items-center gap-1">
                        {/* Suspension Toggle */}
                        {togglingUserId === u.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-brand" />
                        ) : (
                          <>
                            {(u.role === 'seller' || u.role === 'store_manager') && (
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 rounded-lg hover:bg-blue-500/10 border-blue-500/20"
                                onClick={() => handleUserToggleVerify(u.id, u.isVerified)}
                                title={u.isVerified ? t(locale, 'إلغاء التوثيق', 'Remove Verification') : t(locale, 'توثيق الحساب', 'Verify Account')}
                              >
                                {u.isVerified ? (
                                  <ShieldAlert className="h-3.5 w-3.5 text-orange-500" />
                                ) : (
                                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                )}
                              </Button>
                            )}

                            <Button
                              size="icon"
                              variant="outline"
                              className={`h-7 w-7 rounded-lg border-2 ${
                                u.isActive
                                  ? 'hover:bg-red-500/10 border-red-500/20'
                                  : 'hover:bg-green-500/10 border-green-500/20'
                              }`}
                              onClick={() => handleUserToggleActive(u.id, u.isActive)}
                              title={u.isActive ? t(locale, 'تعليق الحساب', 'Suspend Account') : t(locale, 'تفعيل الحساب', 'Activate Account')}
                            >
                              {u.isActive ? (
                                <UserX className="h-3.5 w-3.5 text-red-500" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5 text-green-500" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          u.isActive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        {u.isActive
                          ? t(locale, 'نشط', 'Active')
                          : t(locale, 'موقوف', 'Suspended')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- STORES & SELLERS DIRECTORY TAB ---- */}
        <TabsContent value="stores-sellers">
          <Card className="card-surface">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                {t(locale, 'دليل المتاجر والتجار المستقلين', 'Directory of Stores & Sellers')}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(locale, 'متابعة وإدارة صور، خصائص، ومبيعات المتاجر والتجار المستقلين', 'Monitor and manage images, features, and sales of stores and independent sellers')}
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="stores-sub" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="stores-sub" className="gap-1.5">
                    <Store className="h-3.5 w-3.5" />
                    {t(locale, 'المتاجر الرسمية', 'Official Stores')}
                    <Badge variant="secondary" className="ms-1.5 bg-brand/10 text-brand">
                      {stores.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="sellers-sub" className="gap-1.5">
                    <UserCog className="h-3.5 w-3.5" />
                    {t(locale, 'التجار المستقلين', 'Independent Sellers')}
                    <Badge variant="secondary" className="ms-1.5 bg-brand/10 text-brand">
                      {sellers.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stores-sub">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stores.map((store: any) => (
                      <div key={store.id} className="border rounded-xl overflow-hidden bg-surface/50 hover:bg-surface hover:shadow-sm transition-all">
                        <div className="h-24 w-full bg-muted relative">
                          {store.coverImage ? (
                            <img src={store.coverImage} alt="Cover" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-gradient-to-tr from-brand/5 to-brand/10">
                              <Store className="h-8 w-8 opacity-20" />
                            </div>
                          )}
                          <div className="absolute -bottom-6 right-4 rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto">
                            <Avatar className="h-12 w-12 border-2 border-background bg-background shadow-sm">
                              {store.logo ? (
                                <img src={store.logo} alt="Logo" className="object-cover" />
                              ) : (
                                <AvatarFallback className="text-lg font-bold text-brand bg-brand/10">
                                  {store.name.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </div>
                          <div className="absolute top-2 left-2 rtl:left-2 rtl:right-auto ltr:right-2 ltr:left-auto">
                            <Badge variant={store.isActive ? 'default' : 'destructive'} className="text-[10px] bg-background/80 backdrop-blur-sm shadow-sm text-foreground hover:bg-background/90 border-0">
                              <span className={`h-1.5 w-1.5 rounded-full ${store.isActive ? 'bg-green-500' : 'bg-red-500'} me-1.5`} />
                              {store.isActive ? t(locale, 'نشط', 'Active') : t(locale, 'موقوف', 'Suspended')}
                            </Badge>
                          </div>
                        </div>
                        <div className="pt-8 pb-4 px-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-base line-clamp-1">{locale === 'ar' ? store.name : (store.nameEn || store.name)}</h4>
                              <p className="text-xs text-muted-foreground font-mono truncate">{store.slug}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded text-xs font-bold">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {store.rating.toFixed(1)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-4 text-sm bg-background rounded-lg p-2 border">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted-foreground uppercase">{t(locale, 'المنتجات', 'Products')}</span>
                              <span className="font-bold flex items-center gap-1">
                                <Package className="h-3 w-3 text-brand" />
                                {store._count?.products || 0}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted-foreground uppercase">{t(locale, 'المبيعات', 'Sales')}</span>
                              <span className="font-bold flex items-center gap-1">
                                <ShoppingCart className="h-3 w-3 text-green-500" />
                                {store.totalSales || 0}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs flex items-center gap-2 text-muted-foreground">
                            <UserCog className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{store.manager?.name} ({store.manager?.email})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {stores.length === 0 && (
                      <div className="col-span-full py-12 text-center text-muted-foreground font-semibold">
                        {t(locale, 'لا توجد متاجر رسمية مسجلة.', 'No official stores registered.')}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="sellers-sub">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sellers.map((seller: any) => (
                      <div key={seller.id} className="border rounded-xl overflow-hidden bg-surface/50 hover:bg-surface hover:shadow-sm transition-all">
                        <div className="h-24 w-full bg-muted relative">
                          {seller.coverImage ? (
                            <img src={seller.coverImage} alt="Cover" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-gradient-to-tr from-amber-500/5 to-amber-500/10">
                              <UserCog className="h-8 w-8 opacity-20" />
                            </div>
                          )}
                          <div className="absolute -bottom-6 right-4 rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto">
                            <Avatar className="h-12 w-12 border-2 border-background bg-background shadow-sm">
                              {seller.logo ? (
                                <img src={seller.logo} alt="Logo" className="object-cover" />
                              ) : (
                                <AvatarFallback className="text-lg font-bold text-amber-500 bg-amber-500/10">
                                  {(seller.storeName || seller.user?.name || '?').charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </div>
                          <div className="absolute top-2 left-2 rtl:left-2 rtl:right-auto ltr:right-2 ltr:left-auto">
                            {seller.isVerified && (
                              <Badge variant="default" className="text-[10px] bg-blue-500/90 hover:bg-blue-500 text-white border-0 shadow-sm gap-1">
                                <Award className="h-3 w-3" />
                                {t(locale, 'موثق', 'Verified')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="pt-8 pb-4 px-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-base line-clamp-1">{locale === 'ar' ? (seller.storeName || seller.user?.name) : (seller.storeNameEn || seller.user?.nameEn || seller.user?.name)}</h4>
                              <p className="text-xs text-muted-foreground font-mono truncate">{seller.user?.email}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded text-xs font-bold">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {seller.rating.toFixed(1)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-4 text-sm bg-background rounded-lg p-2 border">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted-foreground uppercase">{t(locale, 'المنتجات', 'Products')}</span>
                              <span className="font-bold flex items-center gap-1">
                                <Package className="h-3 w-3 text-amber-500" />
                                {seller._count?.products || 0}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted-foreground uppercase">{t(locale, 'المبيعات', 'Sales')}</span>
                              <span className="font-bold flex items-center gap-1">
                                <ShoppingCart className="h-3 w-3 text-green-500" />
                                {seller.totalSales || 0}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs flex items-center gap-2 text-muted-foreground">
                            <Activity className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {t(locale, 'مستوى الإكمال:', 'Completion Rate:')} <strong className="text-foreground">{seller.completionRate}%</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {sellers.length === 0 && (
                      <div className="col-span-full py-12 text-center text-muted-foreground font-semibold">
                        {t(locale, 'لا يوجد تجار مستقلين مسجلين.', 'No independent sellers registered.')}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order-statuses">
          <AdminOrderStatuses />
        </TabsContent>
        <TabsContent value="billing">
          <BillingManager />
        </TabsContent>
      </Tabs>

      {/* ============================================ */}
      {/* PLATFORM STATS                              */}
      {/* ============================================ */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          {t(locale, 'إحصائيات المنصة الإجمالية الحقيقية', 'Dynamic Platform Aggregates')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stores Count */}
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-start">
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalStores}</p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {t(locale, 'المتاجر النشطة', 'Registered Stores')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                  <span>{t(locale, 'مبيعات المتاجر الفعلي', 'Live Sales Count')}</span>
                  <span className="font-bold text-foreground">
                    {stats.totalSalesSum.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sellers Count */}
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-start">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <UserCog className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSellers}</p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {t(locale, 'البائعين المستقلين', 'Independent Merchants')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                  <span>{t(locale, 'طلبات توثيق بانتظار المراجعة', 'Pending Verifications')}</span>
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.wantsUpgradeCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Couriers */}
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-start">
                <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeCouriers}</p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {t(locale, 'المندوبين النشطين', 'Active Couriers')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                  <span>{t(locale, 'إجمالي المندوبين بالمنصة', 'Total Registered Couriers')}</span>
                  <span className="font-bold text-foreground">
                    {stats.totalCouriers}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Rating */}
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-start">
                <div className="h-10 w-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                  <Star className="h-5 w-5 fill-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.avgStoreRating ? Number(stats.avgStoreRating).toFixed(1) : '5.0'}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {t(locale, 'متوسط تقييم المتاجر', 'Avg Store Rating')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                  <span>{t(locale, 'إجمالي المعروض بالمنصة', 'Total Platform Products')}</span>
                  <span className="font-bold text-foreground">
                    {totalProducts.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
