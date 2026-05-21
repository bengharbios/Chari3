'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/mock-data';
import { StatsCard, PageHeader } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Loader2,
  AlertCircle
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

function getStockColor(stock: number) {
  if (stock > 10) return 'bg-green-500';
  if (stock > 0) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getStockBarColor(stock: number): string {
  if (stock > 10) return '[&>div]:bg-green-500';
  if (stock > 0) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-red-500';
}

function getStockPercent(stock: number): number {
  return Math.min(100, (stock / 50) * 100);
}

function getMonthLabel(index: number, locale: Locale) {
  return locale === 'ar' ? MONTHS_AR[index] : MONTHS_EN[index];
}

interface StaffMember {
  id: string;
  name: string;
  nameEn: string;
  role: 'admin' | 'editor' | 'viewer';
  joinDate: string;
  isOnline: boolean;
}

const STORE_STAFF: StaffMember[] = [
  { id: 'sm-1', name: 'محمد المتجر', nameEn: 'Mohammed Store', role: 'admin', joinDate: '2024-01-15', isOnline: true },
  { id: 'sm-2', name: 'نورة القسم', nameEn: 'Noura Dept', role: 'editor', joinDate: '2024-02-10', isOnline: true },
  { id: 'sm-3', name: 'خالد المساعد', nameEn: 'Khaled Assistant', role: 'editor', joinDate: '2024-03-01', isOnline: false },
  { id: 'sm-4', name: 'سارة المراجعة', nameEn: 'Sara Review', role: 'viewer', joinDate: '2024-03-15', isOnline: true },
  { id: 'sm-5', name: 'عمر المراقب', nameEn: 'Omar Monitor', role: 'viewer', joinDate: '2024-04-01', isOnline: false },
];

function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'editor':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
}

export default function StoreDashboard() {
  const { locale } = useAppStore();
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
    pending: { label: t(locale, 'معلق', 'Pending'), color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    confirmed: { label: t(locale, 'مؤكد', 'Confirmed'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    shipped: { label: t(locale, 'تم الشحن', 'Shipped'), color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
    delivered: { label: t(locale, 'تم التوصيل', 'Delivered'), color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { label: t(locale, 'ملغي', 'Cancelled'), color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">{t(locale, 'جاري جلب بيانات المتجر في الوقت الفعلي...', 'Loading real-time store metrics...')}</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center space-y-4 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-black">{t(locale, 'عذراً، فشل تحميل البيانات', 'Sorry, failed to load data')}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">{error || t(locale, 'يرجى التحقق من إعدادات الاتصال وحالة المتجر.', 'Please verify connectivity and store status.')}</p>
        <Button onClick={fetchDashboardData} variant="outline" className="mt-2 font-bold">{t(locale, 'إعادة المحاولة', 'Try Again')}</Button>
      </div>
    );
  }

  const { kpis, products, recentOrders } = dashboardData;

  // Render dummy monthly performance bars using simple math percentages
  const dummyMonthlySales = [320, 480, 640, 410, 520, 890];
  const maxSale = Math.max(...dummyMonthlySales);

  return (
    <div className="space-y-6 p-4 md:p-6 text-start">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader
          title={t(locale, 'لوحة تحكم المتجر', 'Store Dashboard')}
          description={`${t(locale, 'مرحباً بك في لوحة تحكم متجرك:', 'Welcome to your store dashboard:')} ${dashboardData.seller?.storeName || user?.name}`}
        />
        <Button variant="outline" size="sm" onClick={fetchDashboardData} className="font-bold">
          {t(locale, 'تحديث البيانات', 'Refresh Metrics')}
        </Button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t(locale, 'إجمالي المبيعات', 'Total Sales')}
          value={formatNumber(kpis.totalSales ?? 0)}
          change={12.5}
          icon={<ShoppingCart className="h-5 w-5 text-white" />}
          iconBg="bg-blue-500"
          subtitle={t(locale, 'منذ التسجيل', 'since creation')}
        />
        <StatsCard
          title={t(locale, 'الإيرادات هذا الشهر', 'Revenue (This Month)')}
          value={formatCurrency(kpis.monthRevenue ?? 0)}
          change={8.3}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          iconBg="bg-green-500"
          subtitle={t(locale, 'دج بالصافي', 'DZD Net')}
        />
        <StatsCard
          title={t(locale, 'المنتجات المسجلة', 'Total Products')}
          value={products.length}
          change={0.0}
          icon={<Package className="h-5 w-5 text-white" />}
          iconBg="bg-purple-500"
          subtitle={t(locale, 'منتج نشط في المتجر', 'active store products')}
        />
        <StatsCard
          title={t(locale, 'رصيد المحفظة المتاح', 'Available Balance')}
          value={formatCurrency(kpis.walletBalance ?? 0)}
          change={0}
          icon={<Users className="h-5 w-5 text-white" />}
          iconBg="bg-orange-500"
          subtitle={t(locale, 'قابل للسحب الفوري', 'withdrawable')}
        />
      </div>

      {/* Store Performance Graph */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t(locale, 'أداء المبيعات الشهري', 'Monthly Sales Performance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-48">
            {dummyMonthlySales.map((sales, idx) => {
              const height = (sales / maxSale) * 100;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center flex-1 h-full justify-end"
                >
                  <div
                    className="w-full max-w-[48px] rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer group relative min-h-[4px]"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 start-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-10 border font-bold">
                      {formatCurrency(sales)}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                    {getMonthLabel(idx + 1, locale)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>
              {t(locale, 'نمو مستمر ومعدل تقييم المتجر العام هو', 'Continuous growth. The overall store rating is')}{' '}
              <strong className="text-green-600 dark:text-green-400 font-black">
                {kpis.rating ? kpis.rating.toFixed(1) : '5.0'} / 5.0
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inventory Overview */}
        <Card className="card-surface lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t(locale, 'نظرة عامة على المخزون والمبيعات', 'Inventory & Sales Overview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t(locale, 'المنتج', 'Product')}</TableHead>
                    <TableHead>{t(locale, 'السعر', 'Price')}</TableHead>
                    <TableHead>{t(locale, 'المخزون الحالي', 'Stock')}</TableHead>
                    <TableHead>{t(locale, 'الحالة', 'Status')}</TableHead>
                    <TableHead>{t(locale, 'المباع', 'Sold')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => {
                    const stockPercent = getStockPercent(product.stock);
                    const stockBarColor = getStockBarColor(product.stock);
                    const stockDotColor = getStockColor(product.stock);
                    const displayName = isAr ? product.name : (product.nameEn || product.name);

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium max-w-[150px] truncate text-start">
                          {displayName}
                        </TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress
                              value={stockPercent}
                              className={`h-2 w-16 ${stockBarColor}`}
                            />
                            <div className="flex items-center gap-1">
                              <span className={`h-2 w-2 rounded-full shrink-0 ${stockDotColor}`} />
                              <span className="text-xs">{product.stock}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              product.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }
                          >
                            {product.status === 'active'
                              ? t(locale, 'نشط', 'Active')
                              : t(locale, 'غير نشط / مسودة', 'Draft')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-bold">
                          {formatNumber(product.soldCount ?? 0)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Staff Management */}
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t(locale, 'إدارة موظفي المتجر', 'Team & Staff Management')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px]">
              <div className="space-y-3">
                {STORE_STAFF.map((member) => {
                  const displayName = locale === 'en' ? member.nameEn : member.name;
                  const roleLabel =
                    member.role === 'admin'
                      ? t(locale, 'مدير المبيعات', 'Sales Manager')
                      : member.role === 'editor'
                        ? t(locale, 'منسق مخازن', 'Inventory Clerk')
                        : t(locale, 'مدقق مالي', 'Finance Clerk');

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                            {getInitials(displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-background ${
                            member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <p className="text-sm font-bold truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{member.joinDate}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-2 py-0.5 font-bold ${getRoleBadgeClass(member.role)}`}
                      >
                        {roleLabel}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="card-surface">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {t(locale, 'الطلبات الأخيرة للمتجر', 'Recent Store Orders')}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => useAppStore.getState().setCurrentPage('store-orders' as any)} className="font-bold">
            {t(locale, 'إدارة كل الطلبات', 'Manage All Orders')}
            <ArrowUpRight className="h-3.5 w-3.5 ms-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(locale, 'رقم الطلب', 'Order #')}</TableHead>
                  <TableHead>{t(locale, 'المشتري', 'Buyer')}</TableHead>
                  <TableHead>{t(locale, 'المنتج', 'Product')}</TableHead>
                  <TableHead>{t(locale, 'المجموع', 'Total')}</TableHead>
                  <TableHead>{t(locale, 'الحالة', 'Status')}</TableHead>
                  <TableHead>{t(locale, 'التاريخ', 'Date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.slice(0, 8).map((item: any, idx: number) => {
                  const buyerName = item.order.buyer?.name || t(locale, 'عميل زائر', 'Guest Buyer');
                  const st = STATUS_CONFIG[item.order.status] ?? STATUS_CONFIG.pending;

                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs font-bold text-start">
                        #{item.order.orderNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-start">{buyerName}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-start">{item.product.name}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(item.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={st.color}
                        >
                          {st.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(item.order.createdAt).toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Store Settings CTA */}
      <Card className="card-surface bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4 text-start">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-base">
                {t(locale, 'إعدادات متجرك الموثق', 'Verified Store Settings')}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t(
                  locale,
                  'تحكم بمستويات التوصيل، طرق الدفع المسموحة، سياسات الإرجاع، ومظهر الصفحة الرئيسية للمتجر.',
                  'Control shipping rates, allowed payments, return policies, and your public landing layouts.'
                )}
              </p>
            </div>
          </div>
          <Button className="shrink-0 font-bold">
            <Settings className="h-4 w-4 me-1.5" />
            {t(locale, 'تكوين إعدادات المتجر', 'Configure Store Settings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
