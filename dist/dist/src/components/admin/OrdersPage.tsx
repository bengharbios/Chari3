'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Search, Filter, Eye, Package, Truck, CheckCircle2, XCircle,
  Clock, CreditCard, ChevronDown, ArrowUpDown, RefreshCw,
  ShoppingBag, DollarSign, AlertTriangle, Ban, RotateCcw,
  Loader2, MoreHorizontal, ArrowLeft, ArrowRight, FileText,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';

// ============================================
// MOCK DATA
// ============================================

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod: string;
  address: string;
  createdAt: string;
  storeName?: string;
}

const MOCK_ORDERS: Order[] = [
  { id: '1', orderNumber: 'CD-20250101-001', customerName: 'أمين بن عبدالله', customerPhone: '+213551234567', items: [{ id: 'i1', productName: 'هاتف سامسونج A54', quantity: 1, price: 85000, total: 85000 }], subtotal: 85000, shipping: 500, total: 85500, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'ccp', address: 'الجزائر العاصمة، حيدرة', createdAt: '2025-01-15T10:30:00Z', storeName: 'متجر التقنية' },
  { id: '2', orderNumber: 'CD-20250116-002', customerName: 'سارة بلقاسم', customerPhone: '+213552345678', items: [{ id: 'i2', productName: 'حقيبة يد نسائية', quantity: 2, price: 3500, total: 7000 }, { id: 'i3', productName: 'حذاء رياضي', quantity: 1, price: 6000, total: 6000 }], subtotal: 13000, shipping: 300, total: 13300, status: 'shipped', paymentStatus: 'paid', paymentMethod: 'baridimob', address: 'وهران، سيدا', createdAt: '2025-01-16T14:20:00Z', storeName: 'بوتيك الأناقة' },
  { id: '3', orderNumber: 'CD-20250117-003', customerName: 'يوسف حمادي', customerPhone: '+213553456789', items: [{ id: 'i4', productName: 'لابتوب HP 250', quantity: 1, price: 120000, total: 120000 }], subtotal: 120000, shipping: 800, total: 120800, status: 'processing', paymentStatus: 'paid', paymentMethod: 'ccp', address: 'قسنطينة، عين النساى', createdAt: '2025-01-17T09:15:00Z', storeName: 'متجر التقنية' },
  { id: '4', orderNumber: 'CD-20250118-004', customerName: 'نادية مرابط', customerPhone: '+213554567890', items: [{ id: 'i5', productName: 'طقم أواني مطبخ', quantity: 1, price: 15000, total: 15000 }], subtotal: 15000, shipping: 400, total: 15400, status: 'pending', paymentStatus: 'pending', paymentMethod: 'cod', address: 'عنابة، عنابة', createdAt: '2025-01-18T16:45:00Z', storeName: 'متجر المنزل' },
  { id: '5', orderNumber: 'CD-20250119-005', customerName: 'كريم بوزيد', customerPhone: '+213555678901', items: [{ id: 'i6', productName: 'سماعة بلوتوث', quantity: 3, price: 2500, total: 7500 }], subtotal: 7500, shipping: 0, total: 7500, status: 'cancelled', paymentStatus: 'refunded', paymentMethod: 'baridimob', address: 'باتنة، بريكة', createdAt: '2025-01-19T11:00:00Z', storeName: 'متجر التقنية' },
  { id: '6', orderNumber: 'CD-20250120-006', customerName: 'فاطمة زروال', customerPhone: '+213556789012', items: [{ id: 'i7', productName: 'كريم مرطب طبيعي', quantity: 2, price: 1800, total: 3600 }, { id: 'i8', productName: 'صابون أرغان', quantity: 3, price: 1200, total: 3600 }], subtotal: 7200, shipping: 200, total: 7400, status: 'returned', paymentStatus: 'refunded', paymentMethod: 'ccp', address: 'تلمسان، تلمسان', createdAt: '2025-01-20T08:30:00Z', storeName: 'متجر الطبيعة' },
  { id: '7', orderNumber: 'CD-20250121-007', customerName: 'محمد العربي', customerPhone: '+213557890123', items: [{ id: 'i9', productName: 'دراجة هوائية جبلية', quantity: 1, price: 45000, total: 45000 }], subtotal: 45000, shipping: 1500, total: 46500, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'ccp', address: 'البليدة، البليدة', createdAt: '2025-01-21T13:10:00Z', storeName: 'متجر الرياضة' },
  { id: '8', orderNumber: 'CD-20250122-008', customerName: 'حنان بن ناصر', customerPhone: '+213558901234', items: [{ id: 'i10', productName: 'شاشة تلفزيون 55 بوصة', quantity: 1, price: 95000, total: 95000 }], subtotal: 95000, shipping: 2000, total: 97000, status: 'processing', paymentStatus: 'paid', paymentMethod: 'ccp', address: 'المسيلة، المسيلة', createdAt: '2025-01-22T15:00:00Z', storeName: 'متجر التقنية' },
];

// ============================================
// HELPERS
// ============================================

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

function formatDZD(amount: number) {
  return new Intl.NumberFormat('ar-DZ', { style: 'decimal', minimumFractionDigits: 0 }).format(amount) + ' د.ج';
}

function formatDate(dateStr: string, locale: Locale) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_CONFIG: Record<string, { labelAr: string; labelEn: string; color: string; icon: React.ElementType }> = {
  pending: { labelAr: 'قيد الانتظار', labelEn: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  processing: { labelAr: 'قيد التجهيز', labelEn: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Package },
  shipped: { labelAr: 'تم الشحن', labelEn: 'Shipped', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck },
  delivered: { labelAr: 'تم التوصيل', labelEn: 'Delivered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  returned: { labelAr: 'مرتجع', labelEn: 'Returned', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: RotateCcw },
};

const PAYMENT_CONFIG: Record<string, { labelAr: string; labelEn: string; color: string }> = {
  pending: { labelAr: 'لم يدفع', labelEn: 'Unpaid', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  paid: { labelAr: 'مدفوع', labelEn: 'Paid', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  refunded: { labelAr: 'مسترد', labelEn: 'Refunded', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  failed: { labelAr: 'فاشل', labelEn: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function OrdersPage() {
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total: MOCK_ORDERS.length,
    pending: MOCK_ORDERS.filter(o => o.status === 'pending').length,
    processing: MOCK_ORDERS.filter(o => o.status === 'processing').length,
    delivered: MOCK_ORDERS.filter(o => o.status === 'delivered').length,
    returned: MOCK_ORDERS.filter(o => ['cancelled', 'returned'].includes(o.status)).length,
  }), []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter(o => {
      const matchSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.includes(search);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
      return matchSearch && matchStatus && matchPayment;
    });
  }, [search, statusFilter, paymentFilter]);

  // Stats cards
  const statsCards = [
    { label: t(locale, 'إجمالي الطلبات', 'Total Orders'), value: stats.total, color: 'text-[var(--navy)]', bgColor: 'bg-[var(--navy)]/10', icon: ShoppingBag },
    { label: t(locale, 'قيد الانتظار', 'Pending'), value: stats.pending, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/20', icon: Clock },
    { label: t(locale, 'قيد التجهيز', 'Processing'), value: stats.processing, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20', icon: Package },
    { label: t(locale, 'تم التوصيل', 'Delivered'), value: stats.delivered, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20', icon: CheckCircle2 },
    { label: t(locale, 'مرتجعات', 'Returns'), value: stats.returned, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/20', icon: RotateCcw },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4"><Skeleton className="h-16 w-full" /></Card>
          ))}
        </div>
        <Card className="p-4"><Skeleton className="h-96 w-full" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{t(locale, 'إدارة الطلبات', 'Orders Management')}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{t(locale, 'متابعة وإدارة جميع طلبات المنصة', 'Track and manage all platform orders')}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info(t(locale, 'تحديث البيانات', 'Refreshing data...'))}>
          <RefreshCw className="h-4 w-4" />
          {t(locale, 'تحديث', 'Refresh')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statsCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', s.bgColor)}>
                  <Icon className={cn('h-5 w-5', s.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder={t(locale, 'بحث برقم الطلب أو اسم العميل...', 'Search by order # or customer...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t(locale, 'الحالة', 'Status')} />
            </SelectTrigger>
            <SelectContent dir={dir}>
              <SelectItem value="all">{t(locale, 'جميع الحالات', 'All Statuses')}</SelectItem>
              <SelectItem value="pending">{t(locale, 'قيد الانتظار', 'Pending')}</SelectItem>
              <SelectItem value="processing">{t(locale, 'قيد التجهيز', 'Processing')}</SelectItem>
              <SelectItem value="shipped">{t(locale, 'تم الشحن', 'Shipped')}</SelectItem>
              <SelectItem value="delivered">{t(locale, 'تم التوصيل', 'Delivered')}</SelectItem>
              <SelectItem value="cancelled">{t(locale, 'ملغي', 'Cancelled')}</SelectItem>
              <SelectItem value="returned">{t(locale, 'مرتجع', 'Returned')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t(locale, 'الدفع', 'Payment')} />
            </SelectTrigger>
            <SelectContent dir={dir}>
              <SelectItem value="all">{t(locale, 'جميع', 'All')}</SelectItem>
              <SelectItem value="paid">{t(locale, 'مدفوع', 'Paid')}</SelectItem>
              <SelectItem value="pending">{t(locale, 'لم يدفع', 'Unpaid')}</SelectItem>
              <SelectItem value="refunded">{t(locale, 'مسترد', 'Refunded')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] border-b">
              <tr>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'رقم الطلب', 'Order #')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)] hidden md:table-cell">{t(locale, 'العميل', 'Customer')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)] hidden lg:table-cell">{t(locale, 'المنتجات', 'Items')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'المبلغ', 'Total')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'الحالة', 'Status')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)] hidden sm:table-cell">{t(locale, 'الدفع', 'Payment')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'الإجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => {
                const sc = STATUS_CONFIG[order.status];
                const pc = PAYMENT_CONFIG[order.paymentStatus];
                return (
                  <tr key={order.id} className="hover:bg-[var(--surface)]/50 transition-colors">
                    <td className="p-3">
                      <span className="font-mono text-xs font-medium">{order.orderNumber}</span>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{formatDate(order.createdAt, locale)}</p>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-[var(--muted-foreground)] font-mono" dir="ltr">{order.customerPhone}</p>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-[var(--muted-foreground)]">{order.items.length} {t(locale, 'منتج', 'items')}</span>
                      {order.storeName && <p className="text-xs text-[var(--muted-foreground)]">{order.storeName}</p>}
                    </td>
                    <td className="p-3 font-semibold">{formatDZD(order.total)}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className={cn('text-[10px] px-2 py-0.5', sc.color)}>
                        {locale === 'ar' ? sc.labelAr : sc.labelEn}
                      </Badge>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <Badge variant="secondary" className={cn('text-[10px] px-2 py-0.5', pc.color)}>
                        {locale === 'ar' ? pc.labelAr : pc.labelEn}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-3 text-[var(--muted-foreground)]/30" />
                    <p className="font-medium text-[var(--muted-foreground)]">{t(locale, 'لا توجد طلبات', 'No orders found')}</p>
                    <p className="text-sm text-[var(--muted-foreground)]/60">{t(locale, 'جرّب تغيير عوامل التصفية', 'Try adjusting your filters')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side={locale === 'ar' ? 'left' : 'right'} className="w-full sm:max-w-lg overflow-y-auto" dir={dir}>
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>{t(locale, 'تفاصيل الطلب', 'Order Details')}</SheetTitle>
              </SheetHeader>
              <div className="px-6 pb-6 space-y-6 mt-4">
                {/* Order Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold">{selectedOrder.orderNumber}</span>
                    <Badge className={STATUS_CONFIG[selectedOrder.status].color}>
                      {locale === 'ar' ? STATUS_CONFIG[selectedOrder.status].labelAr : STATUS_CONFIG[selectedOrder.status].labelEn}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">{formatDate(selectedOrder.createdAt, locale)}</p>
                </div>

                {/* Customer */}
                <Card className="p-4 bg-[var(--surface)]">
                  <h4 className="font-semibold text-sm mb-2">{t(locale, 'معلومات العميل', 'Customer Info')}</h4>
                  <p className="text-sm">{selectedOrder.customerName}</p>
                  <p className="text-sm font-mono text-[var(--muted-foreground)]" dir="ltr">{selectedOrder.customerPhone}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">{t(locale, 'العنوان:', 'Address:')} {selectedOrder.address}</p>
                  {selectedOrder.storeName && <p className="text-sm text-[var(--muted-foreground)]">{t(locale, 'المتجر:', 'Store:')} {selectedOrder.storeName}</p>}
                </Card>

                {/* Items */}
                <Card className="p-4 bg-[var(--surface)]">
                  <h4 className="font-semibold text-sm mb-3">{t(locale, 'المنتجات', 'Items')}</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{item.quantity}x {formatDZD(item.price)}</p>
                        </div>
                        <span className="font-semibold">{formatDZD(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Totals */}
                <div className="space-y-1 text-sm border-t pt-3">
                  <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{t(locale, 'المجموع الفرعي', 'Subtotal')}</span><span>{formatDZD(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{t(locale, 'الشحن', 'Shipping')}</span><span>{selectedOrder.shipping === 0 ? t(locale, 'مجاني', 'Free') : formatDZD(selectedOrder.shipping)}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-2"><span>{t(locale, 'المجموع الكلي', 'Total')}</span><span className="text-green-600">{formatDZD(selectedOrder.total)}</span></div>
                </div>

                {/* Payment */}
                <Card className="p-4 bg-[var(--surface)]">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <span>{t(locale, 'طريقة الدفع:', 'Payment:')}</span>
                    <span className="font-medium">{selectedOrder.paymentMethod.toUpperCase()}</span>
                  </div>
                  <Badge className={cn('mt-2 text-[10px]', PAYMENT_CONFIG[selectedOrder.paymentStatus].color)}>
                    {locale === 'ar' ? PAYMENT_CONFIG[selectedOrder.paymentStatus].labelAr : PAYMENT_CONFIG[selectedOrder.paymentStatus].labelEn}
                  </Badge>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 gradient-navy text-white gap-2" onClick={() => toast.success(t(locale, 'تم تحديث حالة الطلب', 'Order status updated'))}>
                    <RefreshCw className="h-4 w-4" />
                    {t(locale, 'تحديث الحالة', 'Update Status')}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => toast.info(t(locale, 'تم إرسال إشعار للعميل', 'Notification sent to customer'))}>
                    <FileText className="h-4 w-4" />
                    {t(locale, 'إشعار', 'Notify')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
