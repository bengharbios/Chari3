'use client';

import { useAppStore } from '@/lib/store';
import {
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_ANALYTICS,
  formatCurrency,
  formatNumber,
  getOrderStatusColor,
  getOrderStatusText,
} from '@/lib/mock-data';
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
} from 'lucide-react';
import type { Locale } from '@/types';

// ============================================
// HELPERS
// ============================================

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

function getStockColor(stock: number, lowStock: number) {
  const ratio = lowStock > 0 ? stock / lowStock : stock > 0 ? 1 : 0;
  if (ratio > 2) return 'bg-green-500';
  if (ratio >= 1) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getStockBarColor(stock: number, lowStock: number): string {
  const ratio = lowStock > 0 ? stock / lowStock : stock > 0 ? 1 : 0;
  if (ratio > 2) return '[&>div]:bg-green-500';
  if (ratio >= 1) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-red-500';
}

function getStockPercent(stock: number, lowStock: number): number {
  if (lowStock <= 0) return stock > 0 ? 100 : 0;
  return Math.min(100, (stock / (lowStock * 5)) * 100);
}

function getMonthLabel(index: number, locale: Locale) {
  return locale === 'ar' ? MONTHS_AR[index] : MONTHS_EN[index];
}

// ============================================
// STAFF MOCK DATA
// ============================================

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

// ============================================
// COMPONENT
// ============================================

export default function StoreDashboard() {
  const { locale } = useAppStore();

  const maxRevenue = Math.max(...MOCK_ANALYTICS.revenueByMonth.map((m) => m.revenue));

  const recentOrders = MOCK_ORDERS.slice(0, 5);
  const inventoryProducts = MOCK_PRODUCTS.slice(0, 6);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <PageHeader
        title={t(locale, 'لوحة تحكم المتجر', 'Store Dashboard')}
        description={t(locale, 'مرحباً بك في لوحة تحكم متجرك', 'Welcome to your store dashboard')}
      />

      {/* ============================================ */}
      {/* Store Overview Stats                         */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t(locale, 'إجمالي المبيعات', 'Total Sales')}
          value={formatNumber(4567)}
          change={12.5}
          icon={<ShoppingCart className="h-5 w-5 text-white" />}
          iconBg="bg-blue-500"
          subtitle={t(locale, 'منذ الشهر الماضي', 'vs last month')}
        />
        <StatsCard
          title={t(locale, 'الإيرادات', 'Revenue')}
          value={formatCurrency(125430)}
          change={8.3}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          iconBg="bg-green-500"
          subtitle={t(locale, 'ريال سعودي', 'SAR')}
        />
        <StatsCard
          title={t(locale, 'المنتجات', 'Products')}
          value={156}
          change={-2.1}
          icon={<Package className="h-5 w-5 text-white" />}
          iconBg="bg-purple-500"
          subtitle={t(locale, 'منتج نشط', 'active products')}
        />
        <StatsCard
          title={t(locale, 'أعضاء الفريق', 'Staff Members')}
          value={5}
          change={15.0}
          icon={<Users className="h-5 w-5 text-white" />}
          iconBg="bg-orange-500"
          subtitle={t(locale, 'متصل الآن', 'online now')}
        />
      </div>

      {/* ============================================ */}
      {/* Store Performance - CSS Bar Chart            */}
      {/* ============================================ */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t(locale, 'أداء المتجر', 'Store Performance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 sm:gap-2 h-48">
            {MOCK_ANALYTICS.revenueByMonth.map((item, idx) => {
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center flex-1 h-full justify-end"
                >
                  <div
                    className="w-full max-w-[40px] rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer group relative min-h-[4px]"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 start-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-10 border">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                    {getMonthLabel(idx, locale)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span>
              {t(locale, 'نمو بنسبة', 'Growth of')}{' '}
              <strong className="text-green-600 dark:text-green-400">
                +{MOCK_ANALYTICS.revenueChange}%
              </strong>{' '}
              {t(locale, 'مقارنة بالعام السابق', 'compared to last year')}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ============================================ */}
        {/* Inventory Overview                           */}
        {/* ============================================ */}
        <Card className="card-surface lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t(locale, 'نظرة عامة على المخزون', 'Inventory Overview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t(locale, 'المنتج', 'Product')}</TableHead>
                    <TableHead>{t(locale, 'السعر', 'Price')}</TableHead>
                    <TableHead>{t(locale, 'المخزون', 'Stock')}</TableHead>
                    <TableHead>{t(locale, 'الحالة', 'Status')}</TableHead>
                    <TableHead>{t(locale, 'المباع', 'Sold')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryProducts.map((product) => {
                    const stockPercent = getStockPercent(product.stock, product.lowStock);
                    const stockBarColor = getStockBarColor(product.stock, product.lowStock);
                    const stockDotColor = getStockColor(product.stock, product.lowStock);
                    const displayName = locale === 'en' && product.nameEn ? product.nameEn : product.name;

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium max-w-[150px] truncate">
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
                                : product.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }
                          >
                            {product.status === 'active'
                              ? t(locale, 'نشط', 'Active')
                              : product.status === 'draft'
                                ? t(locale, 'مسودة', 'Draft')
                                : t(locale, 'مؤرشف', 'Archived')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatNumber(product.soldCount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* Staff Management                             */}
        {/* ============================================ */}
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t(locale, 'إدارة الفريق', 'Team Management')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px]">
              <div className="space-y-3">
                {STORE_STAFF.map((member) => {
                  const displayName = locale === 'en' ? member.nameEn : member.name;
                  const roleLabel =
                    member.role === 'admin'
                      ? t(locale, 'مدير', 'Admin')
                      : member.role === 'editor'
                        ? t(locale, 'محرر', 'Editor')
                        : t(locale, 'مشاهد', 'Viewer');

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-background ${
                            member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{member.joinDate}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-2 py-0 ${getRoleBadgeClass(member.role)}`}
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

      {/* ============================================ */}
      {/* Recent Orders Table                          */}
      {/* ============================================ */}
      <Card className="card-surface">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {t(locale, 'الطلبات الأخيرة', 'Recent Orders')}
          </CardTitle>
          <Button variant="ghost" size="sm">
            {t(locale, 'عرض الكل', 'View All')}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(locale, 'رقم الطلب', 'Order #')}</TableHead>
                  <TableHead>{t(locale, 'المشتري', 'Buyer')}</TableHead>
                  <TableHead>{t(locale, 'المنتجات', 'Items')}</TableHead>
                  <TableHead>{t(locale, 'المجموع', 'Total')}</TableHead>
                  <TableHead>{t(locale, 'الحالة', 'Status')}</TableHead>
                  <TableHead>{t(locale, 'التاريخ', 'Date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => {
                  const buyerName =
                    locale === 'en' && order.buyer.nameEn
                      ? order.buyer.nameEn
                      : order.buyer.name;

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="font-medium">{buyerName}</TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getOrderStatusColor(order.status)}
                        >
                          {getOrderStatusText(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString(
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

      {/* ============================================ */}
      {/* Store Settings CTA                           */}
      {/* ============================================ */}
      <Card className="card-surface bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {t(locale, 'إعدادات المتجر', 'Store Settings')}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t(
                  locale,
                  'قم بتكوين إعدادات متجرك، بما في ذلك الشحن والضريبة والسياسات',
                  'Configure your store settings including shipping, tax, and policies'
                )}
              </p>
            </div>
          </div>
          <Button className="shrink-0">
            <Settings className="h-4 w-4" />
            {t(locale, 'تكوين الإعدادات', 'Configure Settings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
