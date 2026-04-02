'use client';

import { useAppStore } from '@/lib/store';
import {
  MOCK_ANALYTICS,
  MOCK_USERS,
  MOCK_STORES,
  MOCK_SELLERS,
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
} from 'lucide-react';
import type { Locale, UserRole } from '@/types';

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
    seller: { ar: 'بائع', en: 'Seller' },
    logistics: { ar: 'مندوب توصيل', en: 'Courier' },
    buyer: { ar: 'مشتري', en: 'Buyer' },
  };
  return locale === 'ar' ? labels[role].ar : labels[role].en;
};

const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    store_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    seller: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    logistics: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    buyer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return colors[role];
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
  } = MOCK_ANALYTICS;

  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.revenue));
  const totalStatusOrders = ordersByStatus.reduce((sum, s) => sum + s.count, 0);

  const activeCouriers = MOCK_USERS.filter((u) => u.role === 'logistics' && u.isActive).length;

  return (
    <div dir={dir} className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t(locale, 'لوحة تحكم المدير', 'Admin Dashboard')}
        description={t(locale, 'نظرة شاملة على أداء المنصة', 'Platform-wide overview & analytics')}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t(locale, 'تقرير مفصل', 'Full Report')}
            </Button>
            <Button size="sm" className="gap-2">
              <Activity className="h-4 w-4" />
              {t(locale, 'تصدير', 'Export')}
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
                {t(locale, 'الإيرادات الشهرية', 'Monthly Revenue')}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {t(locale, 'آخر 12 شهر', 'Last 12 months')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 sm:gap-2 h-48">
              {revenueByMonth.map((item, index) => {
                const height = (item.revenue / maxRevenue) * 100;
                const isHighest = item.revenue === maxRevenue;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    {/* Tooltip value */}
                    <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center hidden sm:block">
                      {formatNumber(item.revenue)}
                    </span>
                    {/* Bar */}
                    <div className="w-full relative group">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 cursor-pointer ${
                          isHighest
                            ? 'bg-brand'
                            : 'bg-brand/60 hover:bg-brand/80'
                        }`}
                        style={{ height: `${height * 1.5}px` }}
                      />
                      {/* Hover tooltip for mobile */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none sm:hidden">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                    {/* Month label */}
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {locale === 'ar'
                        ? item.month
                        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
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
            {ordersByStatus.map((item) => {
              const percentage = Math.round((item.count / totalStatusOrders) * 100);
              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
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
                <span>{t(locale, 'إجمالي الطلبات', 'Total Orders')}</span>
                <span>{totalStatusOrders.toLocaleString()}</span>
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
          <TabsTrigger value="orders" className="gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" />
            {t(locale, 'الطلبات الأخيرة', 'Recent Orders')}
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5">
            <Star className="h-3.5 w-3.5" />
            {t(locale, 'المنتجات الأكثر مبيعاً', 'Top Products')}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {t(locale, 'إدارة المستخدمين', 'User Management')}
          </TabsTrigger>
        </TabsList>

        {/* ---- RECENT ORDERS TAB ---- */}
        <TabsContent value="orders">
          <Card className="card-surface">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {t(locale, 'أحدث الطلبات', 'Latest Orders')}
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-brand">
                  {t(locale, 'عرض الكل', 'View All')}
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start ps-2">
                        {t(locale, 'رقم الطلب', 'Order #')}
                      </TableHead>
                      <TableHead className="text-start">
                        {t(locale, 'المشتري', 'Buyer')}
                      </TableHead>
                      <TableHead className="text-start">
                        {t(locale, 'الحالة', 'Status')}
                      </TableHead>
                      <TableHead className="text-start">
                        {t(locale, 'المبلغ', 'Total')}
                      </TableHead>
                      <TableHead className="text-start pe-2">
                        {t(locale, 'التاريخ', 'Date')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="ps-2 font-medium text-brand">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-[10px] bg-surface">
                                {locale === 'ar'
                                  ? order.buyer.name.charAt(0)
                                  : order.buyer.nameEn?.charAt(0) || order.buyer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {locale === 'ar' ? order.buyer.name : (order.buyer.nameEn || order.buyer.name)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={getOrderStatusText(order.status)}
                            colorClass={getOrderStatusColor(order.status)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell className="pe-2 text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString(
                            locale === 'ar' ? 'ar-SA' : 'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- TOP PRODUCTS TAB ---- */}
        <TabsContent value="products">
          <Card className="card-surface">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {t(locale, 'المنتجات الأكثر مبيعاً', 'Top Selling Products')}
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-brand">
                  {t(locale, 'عرض الكل', 'View All')}
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px]">
                <div className="space-y-3">
                  {topProducts.map((item, index) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-xl border bg-surface/50 hover:bg-surface transition-colors"
                    >
                      {/* Rank */}
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

                      {/* Product Image */}
                      <div className="h-12 w-12 rounded-lg bg-surface overflow-hidden shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={locale === 'ar' ? item.product.name : (item.product.nameEn || item.product.name)}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {locale === 'ar' ? item.product.name : (item.product.nameEn || item.product.name)}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {item.soldCount.toLocaleString()} {t(locale, 'مباع', 'sold')}
                          </span>
                          <span className="text-xs flex items-center gap-0.5 text-yellow-500">
                            <Star className="h-3 w-3 fill-yellow-500" />
                            {item.product.rating}
                          </span>
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="text-end shrink-0">
                        <p className="text-sm font-semibold text-brand">
                          {formatCurrency(item.revenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.product.price)} / {t(locale, 'قطعة', 'unit')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- USER MANAGEMENT TAB ---- */}
        <TabsContent value="users">
          <Card className="card-surface">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {t(locale, 'إدارة المستخدمين', 'User Management')}
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-brand">
                  {t(locale, 'عرض الكل', 'View All')}
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_USERS.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-xl border bg-surface/50 hover:bg-surface transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-medium bg-surface">
                        {locale === 'ar'
                          ? user.name.charAt(0)
                          : (user.nameEn?.charAt(0) || user.name.charAt(0))}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">
                          {locale === 'ar' ? user.name : (user.nameEn || user.name)}
                        </p>
                        {user.isVerified && (
                          <Award className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge
                        status={getRoleLabel(locale, user.role)}
                        colorClass={getRoleColor(user.role)}
                      />
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                          user.isActive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        {user.isActive
                          ? t(locale, 'نشط', 'Active')
                          : t(locale, 'غير نشط', 'Inactive')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================ */}
      {/* PLATFORM STATS                              */}
      {/* ============================================ */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          {t(locale, 'إحصائيات المنصة', 'Platform Statistics')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stores Count */}
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{MOCK_STORES.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(locale, 'المتاجر النشطة', 'Active Stores')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t(locale, 'إجمالي المبيعات', 'Total Sales')}</span>
                  <span className="font-medium text-foreground">
                    {MOCK_STORES.reduce((sum, s) => sum + s.totalSales, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sellers Count */}
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <UserCog className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{MOCK_SELLERS.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(locale, 'البائعين', 'Sellers')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t(locale, 'بانتظار الترقية', 'Upgrade Requests')}</span>
                  <span className="font-medium text-foreground">
                    {MOCK_SELLERS.filter((s) => s.wantsUpgrade).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Couriers */}
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCouriers}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(locale, 'المندوبين النشطين', 'Active Couriers')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t(locale, 'إجمالي المندوبين', 'Total Couriers')}</span>
                  <span className="font-medium text-foreground">
                    {MOCK_USERS.filter((u) => u.role === 'logistics').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Rating */}
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                  <Star className="h-5 w-5 fill-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(MOCK_STORES.reduce((sum, s) => sum + s.rating, 0) / MOCK_STORES.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(locale, 'متوسط تقييم المتاجر', 'Avg Store Rating')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t(locale, 'إجمالي المنتجات', 'Total Products')}</span>
                  <span className="font-medium text-foreground">
                    {MOCK_STORES.reduce((sum, s) => sum + (s.productCount || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============================================ */}
      {/* QUICK ACTIONS & LIVE FEED                   */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <Card className="card-surface">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-brand" />
              {t(locale, 'إجراءات سريعة', 'Quick Actions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 text-start hover:bg-brand/5 hover:border-brand/30"
              >
                <Package className="h-5 w-5 text-brand ms-auto" />
                <div>
                  <p className="text-sm font-medium">{t(locale, 'إدارة المنتجات', 'Manage Products')}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t(locale, 'إضافة وتعديل المنتجات', 'Add & edit products')}
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 text-start hover:bg-blue-500/5 hover:border-blue-500/30"
              >
                <ShoppingCart className="h-5 w-5 text-blue-500 ms-auto" />
                <div>
                  <p className="text-sm font-medium">{t(locale, 'إدارة الطلبات', 'Manage Orders')}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t(locale, 'متابعة وتحديث الطلبات', 'Track & update orders')}
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 text-start hover:bg-purple-500/5 hover:border-purple-500/30"
              >
                <Users className="h-5 w-5 text-purple-500 ms-auto" />
                <div>
                  <p className="text-sm font-medium">{t(locale, 'إدارة المستخدمين', 'Manage Users')}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t(locale, 'مراجعة وتفعيل الحسابات', 'Review & activate accounts')}
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 text-start hover:bg-green-500/5 hover:border-green-500/30"
              >
                <Store className="h-5 w-5 text-green-500 ms-auto" />
                <div>
                  <p className="text-sm font-medium">{t(locale, 'إدارة المتاجر', 'Manage Stores')}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t(locale, 'مراجعة واعتماد المتاجر', 'Review & approve stores')}
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-surface">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              {t(locale, 'النشاط الأخير', 'Recent Activity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-4">
                {/* Activity Item 1 */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {t(locale, 'طلب جديد', 'New order')}{' '}
                      <span className="font-medium text-brand">NOON-2024-010</span>{' '}
                      {t(locale, 'من', 'from')} {locale === 'ar' ? 'عمر المشتري' : 'Omar Buyer'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(locale, 'منذ 5 دقائق', '5 minutes ago')}
                    </p>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Truck className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {t(locale, 'تم شحن الطلب', 'Order shipped')}{' '}
                      <span className="font-medium text-brand">NOON-2024-002</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(locale, 'منذ 30 دقيقة', '30 minutes ago')}
                    </p>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <UserCog className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {t(locale, 'طلب ترقية جديد من', 'Upgrade request from')}{' '}
                      <span className="font-medium">{locale === 'ar' ? 'سارة التاجرة' : 'Sara Seller'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(locale, 'منذ ساعة', '1 hour ago')}
                    </p>
                  </div>
                </div>

                {/* Activity Item 4 */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Store className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {t(locale, 'تم إضافة متجر جديد', 'New store registered')}:{' '}
                      <span className="font-medium">{locale === 'ar' ? 'المنزل الذكي' : 'Smart Home'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(locale, 'منذ 3 ساعات', '3 hours ago')}
                    </p>
                  </div>
                </div>

                {/* Activity Item 5 */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {t(locale, 'تم تسليم الطلب', 'Order delivered')}{' '}
                      <span className="font-medium text-brand">NOON-2024-001</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(locale, 'أمس في 10:30 ص', 'Yesterday at 10:30 AM')}
                    </p>
                  </div>
                </div>

                {/* Activity Item 6 */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {t(locale, 'تم تعطيل حساب', 'Account deactivated')}:{' '}
                      <span className="font-medium">{locale === 'ar' ? 'ليلى المشترية' : 'Layla Buyer'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(locale, 'أمس في 3:15 م', 'Yesterday at 3:15 PM')}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
