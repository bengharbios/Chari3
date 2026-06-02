'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useCartStore, useAuthStore } from '@/lib/store';
import {
  formatCurrency,
  getOrderStatusColor,
  getOrderStatusText,
  MOCK_PRODUCTS,
  MOCK_WALLET,
  MOCK_ADDRESSES
} from '@/lib/mock-data';
import { StatsCard, PageHeader } from '@/components/shared/StatsCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  Heart,
  Wallet,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  ShoppingBag,
  Truck,
  Gift,
  Plus,
  Trash2,
  Edit,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import type { Order, OrderStatus, Locale } from '@/types';

// ============================================
// TRANSLATION HELPER
// ============================================
const t = (locale: Locale, ar: string, en: string) => (locale === 'ar' ? ar : en);

// ============================================
// ORDER TRACKING STEPS
// ============================================
const ORDER_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const;

const getStepIndex = (status: OrderStatus): number => {
  const map: Partial<Record<OrderStatus, number>> = {
    pending: 0,
    confirmed: 1,
    processing: 1,
    shipped: 2,
    delivered: 3,
  };
  return map[status] ?? 0;
};

const stepLabelsAr = ['تم الطلب', 'تم التأكيد', 'تم الشحن', 'تم التسليم'];
const stepLabelsEn = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered'];
const stepIcons = [Package, Clock, Truck, Gift];

// ============================================
// MAIN COMPONENT
// ============================================
export default function BuyerDashboard() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const isRTL = locale === 'ar';

  // Star rating state per order
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({});
  const [submittedRatings, setSubmittedRatings] = useState<Set<string>>(new Set());

  // Live orders from DB
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Real stats from DB
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, walletBalance: 0, wishlistCount: 0, walletCurrency: 'DZD' });

  const formatBuyerCurrency = (amount: number, forceCurrency?: string) => {
    const currency = forceCurrency || stats.walletCurrency || 'DZD';
    const formattedAmount = amount.toLocaleString(locale === 'ar' ? 'ar-DZ' : 'en-US');
    if (locale === 'ar') {
      return currency === 'DZD' ? `${formattedAmount} د.ج` : `${formattedAmount} ${currency}`;
    }
    return `${currency} ${formattedAmount}`;
  };

  useEffect(() => {
    if (!user?.id) { setIsLoadingOrders(false); return; }
    setIsLoadingOrders(true);

    // Fetch orders and stats in parallel
    Promise.all([
      fetch(`/api/orders?buyerId=${user.id}&limit=20`).then(r => r.json()),
      fetch(`/api/buyer/stats?buyerId=${user.id}`).then(r => r.json()),
    ]).then(([ordersData, statsData]) => {
      if (ordersData.orders) setLiveOrders(ordersData.orders as Order[]);
      if (statsData.success && statsData.stats) setStats(statsData.stats);
    }).catch(() => {})
      .finally(() => setIsLoadingOrders(false));
  }, [user?.id]);

  // Submit review to API
  const handleSubmitRating = async (order: Order, star: number) => {
    if (!user?.id) return;
    const productId = order.items?.[0]?.productId;
    if (!productId) return;
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId,
          orderId: order.id,
          rating: star,
          comment: '',
        }),
      });
      setSubmittedRatings(prev => new Set([...prev, order.id]));
      setRatings(prev => ({ ...prev, [order.id]: star }));
    } catch { /* silent */ }
  };


  // Derived from live orders
  const activeOrders = liveOrders.filter((o) =>
    ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
  );
  const firstShippedOrder = liveOrders.find((o) => o.status === 'shipped');
  const deliveredOrders = liveOrders.filter((o) => o.status === 'delivered');

  // Wishlist products (still from mock until wishlist API is built)
  const wishlistProducts = MOCK_PRODUCTS.slice(0, 4);

  const userName = locale === 'ar' ? user?.name : user?.nameEn || user?.name;
  const userInitial = userName?.charAt(0) ?? 'B';


  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title={t(locale, 'لوحة تحكم المشتري', 'Buyer Dashboard')}
        description={t(locale, 'إدارة طلباتك، المفضلة، والمحفظة', 'Manage your orders, wishlist, and wallet')}
      />

      {/* ============================================ */}
      {/* WELCOME CARD                                 */}
      {/* ============================================ */}
      <Card className="card-surface overflow-hidden">
        <CardContent className="p-0">
          <div className="gradient-brand p-6 md:p-8 text-white relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold">
                  {t(locale, `مرحباً، ${userName ?? 'مشتري'} 👋`, `Welcome back, ${userName ?? 'Buyer'} 👋`)}
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  {t(locale, 'استمتعي بتجربة تسوق مميزة مع أفضل العروض', 'Enjoy a premium shopping experience with the best deals')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 gap-1">
                  <Gift className="h-3.5 w-3.5" />
                  {t(locale, '1,250 نقطة ولاء', '1,250 Loyalty Points')}
                </Badge>
                <Button
                  variant="secondary"
                  className="bg-white text-[#1B1464] hover:bg-white/90 gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t(locale, 'تسوقي الآن', 'Continue Shopping')}
                  <ChevronRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* QUICK STATS (Real Data)                      */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t(locale, 'إجمالي الطلبات', 'Total Orders')}
          value={isLoadingOrders ? '...' : stats.totalOrders}
          icon={<Package className="h-5 w-5" />}
          iconBg="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatsCard
          title={t(locale, 'إجمالي الإنفاق', 'Total Spent')}
          value={isLoadingOrders ? '...' : formatBuyerCurrency(stats.totalSpent)}
          icon={<ShoppingBag className="h-5 w-5" />}
          iconBg="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
        <StatsCard
          title={t(locale, 'رصيد المحفظة', 'Wallet Balance')}
          value={isLoadingOrders ? '...' : formatBuyerCurrency(stats.walletBalance)}
          icon={<Wallet className="h-5 w-5" />}
          iconBg="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatsCard
          title={t(locale, 'المفضلة', 'Wishlist')}
          value={isLoadingOrders ? '...' : stats.wishlistCount}
          icon={<Star className="h-5 w-5" />}
          iconBg="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      {/* ============================================ */}
      {/* MAIN TABS SECTION                            */}
      {/* ============================================ */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="orders" className="gap-1.5">
            <Package className="h-4 w-4" />
            {t(locale, 'الطلبات', 'Orders')}
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="gap-1.5">
            <Heart className="h-4 w-4" />
            {t(locale, 'المفضلة', 'Wishlist')}
          </TabsTrigger>
          <TabsTrigger value="wallet" className="gap-1.5">
            <Wallet className="h-4 w-4" />
            {t(locale, 'المحفظة', 'Wallet')}
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-1.5">
            <MapPin className="h-4 w-4" />
            {t(locale, 'العناوين', 'Addresses')}
          </TabsTrigger>
        </TabsList>

        {/* ======================================== */}
        {/* TAB: RECENT ORDERS                       */}
        {/* ======================================== */}
        <TabsContent value="orders" className="space-y-6">
          {/* Order Tracking Progress for shipped order */}
          {firstShippedOrder && (
            <OrderTrackingSection order={firstShippedOrder} locale={locale} />
          )}

          {/* Recent Orders List */}
          <Card className="card-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t(locale, 'الطلبات الأخيرة', 'Recent Orders')}
                {!isLoadingOrders && (
                  <Badge variant="secondary" className="ms-auto text-xs">
                    {liveOrders.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingOrders ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : liveOrders.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="text-sm font-semibold text-foreground">
                    {t(locale, 'لا توجد طلبات بعد', 'No orders yet')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(locale, 'عند إتمام أول طلب، ستظهر هنا تفاصيله لمتابعة حالته', 'When you place your first order, it will appear here for tracking')}
                  </p>
                </div>
              ) : (
                liveOrders.slice(0, 8).map((order) => (
                  <OrderCard key={order.id} order={order as any} locale={locale} />
                ))
              )}
            </CardContent>
          </Card>

          {/* My Reviews Section */}
          {deliveredOrders.length > 0 && (
            <Card className="card-surface">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  {t(locale, 'قيّم مشترياتك', 'Rate Your Purchases')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveredOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {order.items.map((i) => `${i.productName} ×${i.quantity}`).join('، ')}
                      </p>
                    </div>
                    {submittedRatings.has(order.id) ? (
                      <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                        ✅ {t(locale, 'شكراً على تقييمك!', 'Thanks for your review!')}
                      </span>
                    ) : (
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const currentRating = hoverRatings[order.id] || ratings[order.id] || 0;
                        return (
                          <button
                            key={star}
                            type="button"
                            className="transition-transform hover:scale-125 focus:outline-none"
                            onMouseEnter={() =>
                              setHoverRatings((prev) => ({ ...prev, [order.id]: star }))
                            }
                            onMouseLeave={() =>
                              setHoverRatings((prev) => ({ ...prev, [order.id]: 0 }))
                            }
                            onClick={() => handleSubmitRating(order as any, star)}
                          >
                            <Star
                              className={cn(
                                'h-5 w-5 transition-colors',
                                star <= currentRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/40'
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ======================================== */}
        {/* TAB: WISHLIST                            */}
        {/* ======================================== */}
        <TabsContent value="wishlist" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlistProducts.map((product) => (
              <Card key={product.id} className="card-surface overflow-hidden">
                <CardContent className="p-0">
                  {/* Product Image Placeholder */}
                  <div className="relative aspect-square bg-muted/50 flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                    {product.comparePrice && (
                      <Badge className="absolute top-3 start-3 bg-red-500 text-white">
                        -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm truncate">
                        {locale === 'ar' ? product.name : (product.nameEn ?? product.name)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-bold text-primary">
                          {formatBuyerCurrency(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatBuyerCurrency(product.comparePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => addItem(product)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {t(locale, 'أضف للسلة', 'Add to Cart')}
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ======================================== */}
        {/* TAB: WALLET                              */}
        {/* ======================================== */}
        <TabsContent value="wallet" className="space-y-6">
          {/* Balance Card */}
          <Card className="card-surface overflow-hidden">
            <CardContent className="p-0">
              <div className="gradient-brand p-6 text-white">
                <p className="text-sm text-white/80">{t(locale, 'رصيدك الحالي', 'Your Current Balance')}</p>
                <p className="text-3xl md:text-4xl font-bold mt-2">
                  {formatBuyerCurrency(stats.walletBalance)}
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm text-white/80">
                  <div>
                    {t(locale, 'مُضاف', 'Earned')}: {formatBuyerCurrency(MOCK_WALLET.totalEarned)}
                  </div>
                  <Separator orientation="vertical" className="h-4 bg-white/30" />
                  <div>
                    {t(locale, 'مُصروف', 'Spent')}: {formatBuyerCurrency(stats.totalSpent)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="card-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                {t(locale, 'المعاملات الأخيرة', 'Recent Transactions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t(locale, 'النوع', 'Type')}</TableHead>
                      <TableHead>{t(locale, 'الوصف', 'Description')}</TableHead>
                      <TableHead>{t(locale, 'المبلغ', 'Amount')}</TableHead>
                      <TableHead>{t(locale, 'التاريخ', 'Date')}</TableHead>
                      <TableHead>{t(locale, 'الرصيد بعد', 'Balance After')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_WALLET.transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <TransactionTypeBadge type={tx.type} locale={locale} />
                        </TableCell>
                        <TableCell className="text-sm">{tx.description}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'text-sm font-semibold',
                              tx.type === 'credit' && 'text-green-600 dark:text-green-400',
                              tx.type === 'debit' && 'text-red-600 dark:text-red-400',
                              tx.type === 'refund' && 'text-blue-600 dark:text-blue-400',
                              tx.type === 'withdrawal' && 'text-orange-600 dark:text-orange-400'
                            )}
                          >
                            {tx.type === 'credit' || tx.type === 'refund' ? '+' : '-'}
                            {formatBuyerCurrency(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {formatBuyerCurrency(tx.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================== */}
        {/* TAB: SAVED ADDRESSES                     */}
        {/* ======================================== */}
        <TabsContent value="addresses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_ADDRESSES.map((addr) => (
              <Card key={addr.id} className="card-surface">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Badge variant="secondary" className="font-medium">
                        {addr.label}
                      </Badge>
                      {addr.isDefault && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {t(locale, 'الافتراضي', 'Default')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium">{addr.fullName}</p>
                    <p className="text-muted-foreground direction-ltr">{addr.phone}</p>
                    <p className="text-muted-foreground leading-relaxed">
                      {addr.street}، {addr.city}
                      {addr.state && `، ${addr.state}`}
                      {addr.zipCode && ` - ${addr.zipCode}`}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" variant="outline" className="gap-1.5 flex-1">
                      <Edit className="h-3.5 w-3.5" />
                      {t(locale, 'تعديل', 'Edit')}
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive gap-1.5 flex-1">
                      <Trash2 className="h-3.5 w-3.5" />
                      {t(locale, 'حذف', 'Delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// ORDER TRACKING SECTION
// ============================================
function OrderTrackingSection({ order, locale }: { order: Order; locale: Locale }) {
  const currentStep = getStepIndex(order.status);
  const progressValue = ((currentStep + 1) / ORDER_STEPS.length) * 100;

  return (
    <Card className="card-surface border-primary/20">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">
              {t(locale, 'تتبع الطلب', 'Order Tracking')}
            </h3>
          </div>
          <Badge className={getOrderStatusColor(order.status)}>
            {locale === 'ar' ? getOrderStatusText(order.status) : order.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        <Progress value={progressValue} className="h-2" />

        {/* Steps */}
        <div className="relative flex items-start justify-between">
          {/* Connector line */}
          <div className="absolute top-4 start-4 end-4 h-0.5 bg-muted hidden sm:block" />

          {ORDER_STEPS.map((step, index) => {
            const StepIcon = stepIcons[index];
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const label = locale === 'ar' ? stepLabelsAr[index] : stepLabelsEn[index];

            return (
              <div
                key={step}
                className="relative flex flex-col items-center gap-1.5 z-10 flex-1"
              >
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'bg-primary border-primary text-primary-foreground ring-4 ring-primary/20',
                    !isCompleted && !isCurrent && 'bg-background border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  <StepIcon className="h-3.5 w-3.5" />
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium text-center leading-tight',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-foreground',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// ORDER CARD
// ============================================
function OrderCard({ order, locale }: { order: Order; locale: Locale }) {
  const isActive = ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status);
  const statusText = locale === 'ar' ? getOrderStatusText(order.status) : order.status;

  const formatOrderCurrency = (amount: number, currencyCode?: string) => {
    const currency = currencyCode || 'DZD';
    const formattedAmount = amount.toLocaleString(locale === 'ar' ? 'ar-DZ' : 'en-US');
    if (locale === 'ar') {
      return currency === 'DZD' ? `${formattedAmount} د.ج` : `${formattedAmount} ${currency}`;
    }
    return `${currency} ${formattedAmount}`;
  };

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-colors',
        isActive
          ? 'border-primary/20 bg-primary/[0.02]'
          : 'border-border bg-card'
      )}
    >
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:ms-auto">
          <Badge className={cn('text-xs', getOrderStatusColor(order.status))}>
            {statusText}
          </Badge>
          <span className="text-sm font-bold">
            {formatOrderCurrency(order.total, order.currency)}
          </span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="flex flex-wrap gap-2 mb-3">
        {order.items.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2.5 py-1"
          >
            {item.productName} ×{item.quantity}
          </span>
        ))}
      </div>

      {/* Progress for active orders */}
      {isActive && (
        <div className="mb-3">
          <Progress
            value={((getStepIndex(order.status) + 1) / ORDER_STEPS.length) * 100}
            className="h-1.5"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
          <Truck className="h-3.5 w-3.5" />
          {t(locale, 'تتبع الطلب', 'Track Order')}
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-8">
          {t(locale, 'التفاصيل', 'View Details')}
          <ChevronRight className={cn('h-3.5 w-3.5', locale === 'ar' && 'rotate-180')} />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// TRANSACTION TYPE BADGE
// ============================================
function TransactionTypeBadge({ type, locale }: { type: string; locale: Locale }) {
  const config: Record<string, { labelAr: string; labelEn: string; color: string; icon: React.ReactNode }> = {
    credit: {
      labelAr: 'إضافة',
      labelEn: 'Credit',
      color: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      icon: <ArrowDownLeft className="h-3.5 w-3.5" />,
    },
    debit: {
      labelAr: 'خصم',
      labelEn: 'Debit',
      color: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      icon: <ArrowUpRight className="h-3.5 w-3.5" />,
    },
    refund: {
      labelAr: 'استرداد',
      labelEn: 'Refund',
      color: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      icon: <RotateCcw className="h-3.5 w-3.5" />,
    },
    withdrawal: {
      labelAr: 'سحب',
      labelEn: 'Withdrawal',
      color: 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
      icon: <ArrowUpRight className="h-3.5 w-3.5" />,
    },
  };

  const cfg = config[type] ?? config.debit;

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1', cfg.color)}>
      {cfg.icon}
      {locale === 'ar' ? cfg.labelAr : cfg.labelEn}
    </span>
  );
}
