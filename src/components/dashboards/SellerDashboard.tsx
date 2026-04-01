'use client';

import { useAppStore } from '@/lib/store';
import {
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_SELLERS,
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
import {
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  Headphones,
  Rocket,
  Crown,
  Store,
  Users,
  TrendingUp,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { Locale } from '@/types';

// ============================================
// HELPERS
// ============================================

const t = (locale: Locale, ar: string, en: string) =>
  locale === 'ar' ? ar : en;

const productColors = [
  'bg-[#1B1464]',
  'bg-[#FEEE00]',
  'bg-[#F68B1E]',
  'bg-[#22C55E]',
  'bg-[#3B82F6]',
  'bg-[#8B5CF6]',
];

const monthlySales = [
  { month: 'يناير', monthEn: 'Jan', sales: 12 },
  { month: 'فبراير', monthEn: 'Feb', sales: 19 },
  { month: 'مارس', monthEn: 'Mar', sales: 25 },
  { month: 'أبريل', monthEn: 'Apr', sales: 18 },
  { month: 'مايو', monthEn: 'May', sales: 31 },
  { month: 'يونيو', monthEn: 'Jun', sales: 28 },
];

const sellerProfile = MOCK_SELLERS[0];
const maxSales = Math.max(...monthlySales.map((m) => m.sales));

// ============================================
// MAIN COMPONENT
// ============================================

export default function SellerDashboard() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const products = MOCK_PRODUCTS.slice(0, 6);
  const recentOrders = MOCK_ORDERS.slice(0, 6);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <PageHeader
        title={t(locale, 'لوحة تحكم البائع', 'Seller Dashboard')}
        description={t(
          locale,
          `مرحباً ${sellerProfile.storeName} — ملخص نشاطك التجاري`,
          `Welcome ${sellerProfile.storeNameEn} — Your business activity overview`
        )}
        actions={
          <Button className="gradient-brand">
            <Plus className="h-4 w-4" />
            {t(locale, 'إضافة منتج', 'Add Product')}
          </Button>
        }
      />

      {/* ============================================ */}
      {/* SELLER STATS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t(locale, 'إجمالي المنتجات', 'Total Products')}
          value={sellerProfile.productCount ?? 45}
          icon={<Package className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          change={8.2}
        />
        <StatsCard
          title={t(locale, 'إجمالي المبيعات', 'Total Sales')}
          value={sellerProfile.totalSales}
          icon={<ShoppingCart className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
          change={12.5}
        />
        <StatsCard
          title={t(locale, 'الإيرادات', 'Revenue')}
          value={formatCurrency(15670)}
          icon={<DollarSign className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          change={15.3}
        />
        <StatsCard
          title={t(locale, 'التقييم', 'Rating')}
          value={
            <span className="flex items-center gap-1.5">
              {sellerProfile.rating}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-base font-normal text-muted-foreground">/5</span>
            </span>
          }
          icon={<Star className="h-5 w-5 text-yellow-600" />}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          subtitle={t(locale, 'من 89 تقييم', 'from 89 reviews')}
        />
      </div>

      {/* ============================================ */}
      {/* SALES CHART + RECENT ORDERS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Sales Chart */}
        <Card className="card-surface lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {t(locale, 'المبيعات الشهرية', 'Monthly Sales')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {monthlySales.map((item, idx) => {
                const height = (item.sales / maxSales) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <span className="text-xs font-semibold text-muted-foreground">
                      {item.sales}
                    </span>
                    <div className="w-full relative rounded-t-md overflow-hidden" style={{ height: `${height}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1B1464] to-[#F68B1E] opacity-90 rounded-t-md" />
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-t-md" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {isRTL ? item.month : item.monthEn}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              <span>
                {t(locale, 'نمو بنسبة 15% مقارنة بالشهر السابق', '15% growth compared to last month')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="card-surface lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {t(locale, 'الطلبات الأخيرة', 'Recent Orders')}
            </CardTitle>
            <Button variant="ghost" size="sm">
              {t(locale, 'عرض الكل', 'View All')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t(locale, 'رقم الطلب', 'Order #')}
                    </TableHead>
                    <TableHead>
                      {t(locale, 'المنتج', 'Product')}
                    </TableHead>
                    <TableHead>
                      {t(locale, 'المبلغ', 'Total')}
                    </TableHead>
                    <TableHead>
                      {t(locale, 'الحالة', 'Status')}
                    </TableHead>
                    <TableHead>
                      {t(locale, 'التاريخ', 'Date')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <span className="truncate max-w-[140px] block text-sm">
                          {isRTL
                            ? order.items[0]?.productName
                            : order.items[0]?.productName}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.total)}
                      </TableCell>
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
                          isRTL ? 'ar-SA' : 'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* MY PRODUCTS */}
      {/* ============================================ */}
      <Card className="card-surface">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {t(locale, 'منتجاتي', 'My Products')}
          </CardTitle>
          <Button variant="ghost" size="sm">
            {t(locale, 'عرض الكل', 'View All')}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, idx) => {
              const stockPercent = Math.min(
                (product.stock / (product.lowStock * 10)) * 100,
                100
              );
              const isLowStock = product.stock <= product.lowStock;
              const statusMap: Record<string, string> = {
                active: t(locale, 'نشط', 'Active'),
                draft: t(locale, 'مسودة', 'Draft'),
                archived: t(locale, 'مؤرشف', 'Archived'),
              };
              const statusColorMap: Record<string, string> = {
                active:
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                draft:
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                archived:
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
              };

              return (
                <div
                  key={product.id}
                  className="rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md"
                >
                  {/* Product Image Placeholder */}
                  <div
                    className={`h-36 ${productColors[idx % productColors.length]} flex items-center justify-center`}
                  >
                    <Package className="h-10 w-10 text-white/60" />
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {isRTL ? product.name : (product.nameEn || product.name)}
                        </h3>
                        <p className="text-base font-bold mt-0.5">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={statusColorMap[product.status]}
                      >
                        {statusMap[product.status]}
                      </Badge>
                    </div>

                    {/* Stock */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {t(locale, 'المخزون', 'Stock')}: {product.stock}
                        </span>
                        {isLowStock && (
                          <span className="text-red-500 font-medium">
                            {t(locale, 'مخزون منخفض!', 'Low stock!')}
                          </span>
                        )}
                      </div>
                      <Progress value={stockPercent} className="h-1.5" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pencil className="h-3.5 w-3.5" />
                        {t(locale, 'تعديل', 'Edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* UPGRADE TO STORE CTA */}
      {/* ============================================ */}
      {sellerProfile.wantsUpgrade ? (
        /* Already requested upgrade */
        <Card className="card-surface">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {t(locale, 'طلب الترقية قيد المراجعة', 'Upgrade Request Under Review')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    locale,
                    'تم تقديم طلب ترقية حسابك إلى متجر في ' +
                      (sellerProfile.upgradeRequestedAt
                        ? new Date(sellerProfile.upgradeRequestedAt).toLocaleDateString(
                            isRTL ? 'ar-SA' : 'en-US',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )
                        : '') +
                      '. سيتم إشعارك بالنتيجة قريباً.',
                    'Your store upgrade request was submitted on ' +
                      (sellerProfile.upgradeRequestedAt
                        ? new Date(sellerProfile.upgradeRequestedAt).toLocaleDateString(
                            isRTL ? 'ar-SA' : 'en-US',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )
                        : '') +
                      '. You will be notified of the result soon.'
                  )}
                </p>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                >
                  <Clock className="h-3 w-3 ms-1" />
                  {t(locale, 'قيد المراجعة', 'Under Review')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Upgrade CTA with animated border */
        <Card className="animated-border overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FEEE00]/10 via-transparent to-[#F68B1E]/10 pointer-events-none" />
          <CardContent className="p-6 md:p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FEEE00] to-[#F68B1E] flex items-center justify-center shadow-lg">
                    <Crown className="h-6 w-6 text-[#1B1464]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {t(locale, 'ارتقِ بحسابك إلى متجر!', 'Upgrade to a Store!')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        locale,
                        'انضم للتجار المميزين واستمتع بمزايا حصرية',
                        'Join premium sellers and enjoy exclusive benefits'
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: <Store className="h-4 w-4" />,
                      ar: 'صفحة علامتك التجارية الخاصة',
                      en: 'Your own brand page',
                    },
                    {
                      icon: <Users className="h-4 w-4" />,
                      ar: 'إدارة فريق العمل',
                      en: 'Staff management',
                    },
                    {
                      icon: <BarChart3 className="h-4 w-4" />,
                      ar: 'تحليلات متقدمة وتقارير مفصلة',
                      en: 'Advanced analytics & detailed reports',
                    },
                    {
                      icon: <TrendingUp className="h-4 w-4" />,
                      ar: 'ظهور أعلى في نتائج البحث',
                      en: 'Higher visibility in search results',
                    },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-7 w-7 rounded-lg bg-[#FEEE00]/20 flex items-center justify-center text-[#F68B1E] shrink-0">
                        {benefit.icon}
                      </div>
                      <span className="text-muted-foreground">
                        {isRTL ? benefit.ar : benefit.en}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-3">
                <Button size="lg" className="gradient-brand text-base px-8 py-6 shadow-lg">
                  <Rocket className="h-5 w-5" />
                  {t(locale, 'ارتقِ الآن', 'Upgrade Now')}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {t(locale, 'مجاني لفترة محدودة', 'Free for a limited time')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================ */}
      {/* QUICK ACTIONS */}
      {/* ============================================ */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-base">
            {t(locale, 'إجراءات سريعة', 'Quick Actions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 px-4 justify-start gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-start">
                <p className="font-semibold text-sm">
                  {t(locale, 'إضافة منتج جديد', 'Add New Product')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'أضف منتجات للبيع', 'List products for sale')}
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-4 justify-start gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-start">
                <p className="font-semibold text-sm">
                  {t(locale, 'تقرير المبيعات', 'Sales Report')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'عرض تحليلات المبيعات', 'View sales analytics')}
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-4 justify-start gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <Headphones className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-start">
                <p className="font-semibold text-sm">
                  {t(locale, 'تواصل مع الدعم', 'Contact Support')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'احصل على مساعدة فورية', 'Get instant help')}
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
