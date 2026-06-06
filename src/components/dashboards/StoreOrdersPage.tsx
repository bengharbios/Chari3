'use client';
import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Package, Search, Calendar, MapPin, Truck, CheckCircle2, XCircle, Clock, 
  MoreVertical, Download, Printer, Loader2, User, Table as TableIcon, LayoutGrid, List
} from 'lucide-react';
import { toast } from 'sonner';

export default function StoreOrdersPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  const [orders, setOrders] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'table'>('list');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load saved view mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('chari3_order_view_mode') as 'list' | 'kanban' | 'table';
    if (savedMode && ['list', 'kanban', 'table'].includes(savedMode)) {
      setViewMode(savedMode);
    }
  }, []);

  const handleViewModeChange = (mode: 'list' | 'kanban' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('chari3_order_view_mode', mode);
  };

  const fetchStatuses = async () => {
    try {
      const res = await fetch('/api/order-statuses');
      const data = await res.json();
      if (data.success && data.statuses.length > 0) {
        setStatuses(data.statuses);
      } else {
        setStatuses([
          { key: 'pending', nameAr: 'معلق', nameEn: 'Pending', color: '#6B7280' },
          { key: 'confirmed', nameAr: 'قيد التجهيز', nameEn: 'Processing', color: '#3B82F6' },
          { key: 'shipped', nameAr: 'تم الشحن', nameEn: 'Shipped', color: '#F59E0B' },
          { key: 'delivered', nameAr: 'تم التوصيل', nameEn: 'Delivered', color: '#10B981' },
          { key: 'cancelled', nameAr: 'ملغي', nameEn: 'Cancelled', color: '#EF4444' },
          { key: 'refunded', nameAr: 'مسترد', nameEn: 'Refunded', color: '#8B5CF6' }
        ]);
      }
    } catch (e) {
      setStatuses([
        { key: 'pending', nameAr: 'معلق', nameEn: 'Pending', color: '#6B7280' }
      ]);
    }
  };

  const fetchOrders = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user.id,
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
        search: searchTerm,
      });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/seller/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const finalOrders = data.orders.map((o: any) => {
          let parsedAddress = { fullName: '', phone: '', street: '', city: '' };
          try { if (o.address) parsedAddress = typeof o.address === 'string' ? JSON.parse(o.address) : o.address; } 
          catch { parsedAddress = { fullName: o.buyer?.name || '', phone: o.buyer?.phone || '', street: o.address, city: '' }; }

          const itemsTotal = o.items.reduce((sum: number, i: any) => sum + (i.total || i.price * i.quantity), 0);
          const realSubtotal = o.subtotal > 0 ? o.subtotal : itemsTotal;
          let realDiscount = o.discount || 0;
          if (realDiscount === 0 && realSubtotal > 0) {
            const derived = realSubtotal + (o.shippingCost || 0) - (o.total || 0);
            if (derived > 0) realDiscount = derived;
          }

          return {
            id: o.id,
            orderNumber: o.orderNumber || 'N/A',
            buyerName: parsedAddress.fullName || o.buyer?.name || t('زبون ضيف', 'Guest Buyer'),
            buyerPhone: parsedAddress.phone || o.buyer?.phone || '',
            date: new Date(o.createdAt).toLocaleDateString('en-GB'),
            status: o.status,
            paymentMethod: o.paymentMethod || 'cod',
            paymentStatus: o.paymentStatus || 'pending',
            address: parsedAddress,
            shippingCost: o.shippingCost || 0,
            subtotal: realSubtotal,
            discount: realDiscount,
            total: o.total,
            items: o.items.map((item: any) => ({
              id: item.id,
              productName: item.product?.name || item.productName || t('منتج غير معرف', 'Unknown Product'),
              price: item.price,
              quantity: item.quantity,
              total: item.total,
            }))
          };
        });
        setOrders(finalOrders);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      toast.error(t('حدث خطأ أثناء جلب الطلبات', 'Error fetching orders'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStatuses(); }, []);
  useEffect(() => { fetchOrders(); }, [user?.id, page, limit, statusFilter, startDate, endDate]);

  const handleUpdateStatus = async (status: string, orderId?: string) => {
    const targetId = orderId || selectedOrder?.id;
    if (!targetId) return;
    try {
      const res = await fetch(`/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setOrders(prev => prev.map(o => o.id === targetId ? { ...o, status } : o));
      if (selectedOrder?.id === targetId) setSelectedOrder({ ...selectedOrder, status });
      toast.success(t('تم تحديث حالة الطلب بنجاح', 'Order status updated successfully'));
    } catch (error) {
      toast.error(t('حدث خطأ أثناء تحديث الحالة', 'Error updating status'));
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "رقم الطلب,العميل,الهاتف,التاريخ,الحالة,المجموع\n"
      + orders.map(o => `${o.orderNumber},${o.buyerName},${o.buyerPhone},${o.date},${getStatusConfig(o.status).label},${o.total}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRows = selectedOrder.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; text-align: start;">${item.productName}</td>
        <td style="padding: 12px; text-align: center;">${item.price.toLocaleString()} DZD</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: end; font-weight: bold;">${item.total.toLocaleString()} DZD</td>
      </tr>
    `).join('');

    const isArOrder = locale === 'ar';

    printWindow.document.write(`
      <html dir="${isArOrder ? 'rtl' : 'ltr'}">
        <head>
          <title>Invoice #${selectedOrder.orderNumber}</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; margin: 40px; color: #1e293b; background-color: #fff; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .brand-name { font-size: 28px; font-weight: 900; color: #fbbf24; }
            .title { font-size: 20px; font-weight: bold; text-align: end; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .details-td { width: 50%; vertical-align: top; font-size: 14px; line-height: 1.6; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-th { background-color: #f8fafc; padding: 12px; font-weight: bold; border-bottom: 2px solid #e2e8f0; font-size: 14px; }
            .totals-table { width: 40%; margin-${isArOrder ? 'right' : 'left'}: auto; border-collapse: collapse; font-size: 14px; }
            .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #64748b; border-top: 1px dashed #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td class="brand-name">ChariDay</td>
              <td class="title">${isArOrder ? 'فاتورة مبيعات' : 'Sales Invoice'}</td>
            </tr>
          </table>

          <table class="details-table">
            <tr>
              <td class="details-td">
                <strong>${isArOrder ? 'تفاصيل العميل:' : 'Bill To:'}</strong><br />
                ${selectedOrder.buyerName}<br />
                <span dir="ltr">${selectedOrder.buyerPhone}</span><br />
                ${selectedOrder.address?.street || ''}, ${selectedOrder.address?.city || ''}
              </td>
              <td class="details-td" style="text-align: ${isArOrder ? 'left' : 'right'};">
                <strong>${isArOrder ? 'معلومات الفاتورة:' : 'Invoice Details:'}</strong><br />
                ${isArOrder ? 'رقم الطلب:' : 'Order ID:'} #${selectedOrder.orderNumber}<br />
                ${isArOrder ? 'تاريخ الفاتورة:' : 'Date:'} ${selectedOrder.date}<br />
                ${isArOrder ? 'طريقة الدفع:' : 'Payment:'} ${selectedOrder.paymentMethod.toUpperCase()} (${selectedOrder.paymentStatus.toUpperCase()})
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th class="items-th" style="text-align: start;">${isArOrder ? 'المنتج' : 'Product'}</th>
                <th class="items-th" style="text-align: center;">${isArOrder ? 'سعر الوحدة' : 'Price'}</th>
                <th class="items-th" style="text-align: center;">${isArOrder ? 'الكمية' : 'Quantity'}</th>
                <th class="items-th" style="text-align: end;">${isArOrder ? 'الإجمالي' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <table class="totals-table">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; text-align: start;">${isArOrder ? 'المجموع الفرعي:' : 'Subtotal:'}</td>
              <td style="padding: 8px 0; text-align: end;">${selectedOrder.subtotal.toLocaleString()} DZD</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; text-align: start;">${isArOrder ? 'تكلفة الشحن:' : 'Shipping:'}</td>
              <td style="padding: 8px 0; text-align: end;">${(selectedOrder.shippingCost || 0).toLocaleString()} DZD</td>
            </tr>
            ${selectedOrder.discount > 0 ? `
            <tr style="border-bottom: 1px solid #e2e8f0; color: #ef4444;">
              <td style="padding: 8px 0; text-align: start;">${isArOrder ? 'الخصم:' : 'Discount:'}</td>
              <td style="padding: 8px 0; text-align: end;">-${selectedOrder.discount.toLocaleString()} DZD</td>
            </tr>` : ''}
            <tr style="font-weight: bold; font-size: 16px;">
              <td style="padding: 8px 0; text-align: start; color: #fbbf24;">${isArOrder ? 'المجموع الإجمالي:' : 'Total:'}</td>
              <td style="padding: 8px 0; text-align: end; color: #fbbf24;">${selectedOrder.total.toLocaleString()} DZD</td>
            </tr>
          </table>

          <div class="footer">
            ${isArOrder ? 'نشكركم على تسوقكم من متجرنا عبر منصة ChariDay!' : 'Thank you for shopping with us via ChariDay platform!'}
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) {
      handleUpdateStatus(newStatus, orderId);
    }
  };

  const getStatusConfig = (statusKey: string) => {
    const found = statuses.find(s => s.key === statusKey);
    return found ? { label: isAr ? found.nameAr : (found.nameEn || found.nameAr), color: found.color } : { label: statusKey, color: '#6B7280' };
  };

  const getStatusColor = (statusKey: string) => {
    switch (statusKey) {
      case 'delivered': return 'bg-emerald-500';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-blue-400';
      case 'confirmed': return 'bg-indigo-500';
      case 'pending': return 'bg-amber-500';
      case 'cancelled': return 'bg-red-500';
      case 'refunded': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  const totalOrdersCount = orders.length; // Ideally from API
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-6 p-4 md:p-6 text-start">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-1">{t('المتجر', 'SHOP')} &bull; {t('الطلبات', 'ORDERS')}</p>
          <h1 className="text-2xl font-black">{t('الطلبات', 'Orders')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="font-bold">
            {t('تصدير CSV', 'Export CSV')}
          </Button>
          <Button size="sm" className="font-bold bg-[#1ABB9C] hover:bg-[#159a80] text-white">
            + {t('طلب يدوي', 'Manual order')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase">{t('إجمالي الطلبات', 'TOTAL ORDERS')}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-black">{totalOrdersCount}</h3>
                <span className="text-xs font-bold text-emerald-500" dir="ltr">+12%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{t('اليوم', 'today')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center shrink-0">
              <span className="text-emerald-500 font-black text-lg">$</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase">{t('الإيرادات', 'REVENUE')}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-black">{totalRevenue.toLocaleString()} <span className="text-sm">DZD</span></h3>
                <span className="text-xs font-bold text-emerald-500" dir="ltr">+18%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{t('اليوم', 'today')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase">{t('قيد الانتظار', 'PENDING')}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-black">{pendingCount}</h3>
                <span className="text-xs font-bold text-red-500" dir="ltr">3%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{t('في انتظار الدفع', 'awaiting payment')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div>
              <CardTitle className="text-lg">{t('جميع الطلبات', 'All orders')}</CardTitle>
              <CardDescription className="text-xs">{totalOrdersCount} {t('نتيجة', 'results')}</CardDescription>
            </div>
            <div className="flex items-center gap-2 sm:border-s sm:ps-4 sm:ms-2 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="text-xs text-muted-foreground shrink-0">{t('الحالة', 'Status')}</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border rounded px-2 h-8 text-xs font-bold outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="all">{t('جميع الحالات', 'All statuses')}</option>
                {statuses.map((s) => (
                  <option key={s.key} value={s.key}>{isAr ? s.nameAr : (s.nameEn || s.nameAr)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('ابحث...', 'Search...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchOrders()} className="ps-9 h-9 text-xs w-full" />
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="h-9 px-3 shrink-0">
              {t('تصدير', 'Export CSV')}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : orders.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground">{t('لا توجد طلبات مطابقة.', 'No orders found.')}</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="table w-full text-sm text-start mb-0">
                <thead className="bg-muted/30 border-b text-xs uppercase text-muted-foreground whitespace-nowrap">
                  <tr>
                    <th className="px-4 py-3 font-bold">{t('الطلب', 'ORDER')}</th>
                    <th className="px-4 py-3 font-bold">{t('العميل', 'CUSTOMER')}</th>
                    <th className="px-4 py-3 font-bold text-center">{t('العناصر', 'ITEMS')}</th>
                    <th className="px-4 py-3 font-bold">{t('المجموع', 'TOTAL')}</th>
                    <th className="px-4 py-3 font-bold">{t('الحالة', 'STATUS')}</th>
                    <th className="px-4 py-3 font-bold">{t('الدفع', 'PAYMENT')}</th>
                    <th className="px-4 py-3 font-bold">{t('التاريخ', 'DATE')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const initials = o.buyerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                    const statusConfig = getStatusConfig(o.status);
                    
                    return (
                      <tr key={o.id} className="border-b hover:bg-muted/10 transition-colors cursor-pointer whitespace-nowrap" onClick={() => setSelectedOrder(o)}>
                        <td className="px-4 py-3 align-middle font-mono text-emerald-500 font-bold" dir="ltr">#{o.orderNumber}</td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 ${getStatusColor(o.status)}`}>
                              {initials}
                            </div>
                            <span className="font-bold text-foreground">{o.buyerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle text-center text-muted-foreground">{o.items?.length || 1}</td>
                        <td className="px-4 py-3 align-middle font-bold">{o.total.toLocaleString()} <span className="text-[10px] text-muted-foreground">DZD</span></td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(o.status)} shrink-0`}></span>
                            <span className="text-xs font-bold text-muted-foreground">{statusConfig.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle text-xs text-muted-foreground">
                          {o.paymentMethod.toUpperCase()} {o.paymentStatus === 'paid' ? '•••• 4242' : ''}
                        </td>
                        <td className="px-4 py-3 align-middle text-xs text-muted-foreground">{o.date}</td>
                        <td className="px-4 py-3 align-middle text-end">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted shrink-0">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && orders.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t text-sm text-muted-foreground">
              <div className="text-center sm:text-start">
                {t('عرض', 'Showing')} {Math.max(1, (page - 1) * limit + 1)}-{Math.min(page * limit, totalOrdersCount)} {t('من', 'of')} {totalOrdersCount}
              </div>
              <div className="flex items-center gap-1 flex-wrap justify-center" dir="ltr">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPage(1)} disabled={page === 1}>&laquo;</Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>&lsaquo;</Button>
                <Button variant="default" size="sm" className="h-8 w-8 p-0 bg-[#1ABB9C] hover:bg-[#159a80]">{page}</Button>
                {page < totalPages && <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPage(page + 1)}>{page + 1}</Button>}
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>&rsaquo;</Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>&raquo;</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog - Redesigned to match image 2 */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden bg-background w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[95vh] sm:w-full flex flex-col rounded-xl">
          <DialogTitle className="sr-only">{t('تفاصيل الطلب', 'Order Details')} #{selectedOrder?.orderNumber}</DialogTitle>
          <DialogDescription className="sr-only">{t('عرض وتعديل تفاصيل الطلب الخاص بالعميل.', 'View and manage customer order details.')}</DialogDescription>
          {selectedOrder && (
            <div className="flex flex-col h-full overflow-hidden text-start">
              {/* Detail Header */}
              <div className="p-4 md:p-6 border-b flex justify-between items-start lg:items-center flex-col lg:flex-row gap-4 bg-muted/10 shrink-0">
                <div className="min-w-0 w-full lg:w-auto">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('المتجر', 'SHOP')} &bull; {t('الطلبات', 'ORDERS')}</p>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black truncate">{t('طلب', 'Order')} <span dir="ltr">#{selectedOrder.orderNumber}</span></h2>
                    <div className="flex items-center gap-2 bg-background border px-2 py-1 rounded-md shadow-sm shrink-0">
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(selectedOrder.status)}`}></span>
                      <span className="text-xs font-bold" style={{ color: getStatusConfig(selectedOrder.status).color }}>{getStatusConfig(selectedOrder.status).label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  <Button variant="outline" size="sm" className="font-bold flex-1 sm:flex-none" onClick={handlePrintInvoice}>{t('طباعة', 'Print')}</Button>
                  <Button variant="outline" size="sm" className="font-bold flex-1 sm:flex-none">{t('إرسال الفاتورة', 'Send invoice')}</Button>
                  <Button size="sm" className="font-bold bg-[#1ABB9C] hover:bg-[#159a80] text-white flex-1 sm:flex-none whitespace-nowrap">{t('تعليم كمكتمل', 'Mark fulfilled')}</Button>
                </div>
              </div>

              {/* Detail Content (Scrollable) */}
              <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-muted/5 min-h-0">
                
                {/* Progress Bar */}
                <Card className="mb-4 md:mb-6 shadow-sm border-0 bg-white dark:bg-card">
                  <CardContent className="p-4 md:p-6 overflow-x-auto hide-scrollbar w-full">
                    <div className="max-w-3xl mx-auto w-full">
                      <div className="flex justify-between items-center relative min-w-[500px]">
                        <div className="absolute top-4 start-8 end-8 h-[2px] bg-muted -z-0"></div>
                        
                        {/* Step 1 */}
                        <div className="flex flex-col items-center z-10 gap-2 w-24">
                          <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white dark:border-card"><CheckCircle2 className="h-4 w-4" /></div>
                          <div className="text-center">
                            <p className="text-xs font-bold">{t('تم الطلب', 'Placed')}</p>
                            <p className="text-[10px] text-muted-foreground" dir="ltr">{selectedOrder.date}</p>
                          </div>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex flex-col items-center z-10 gap-2 w-24">
                          <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white dark:border-card"><CheckCircle2 className="h-4 w-4" /></div>
                          <div className="text-center">
                            <p className="text-xs font-bold">{t('تم الدفع', 'Paid')}</p>
                            <p className="text-[10px] text-muted-foreground" dir="ltr">{selectedOrder.date}</p>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center z-10 gap-2 w-24">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border-4 border-white dark:border-card ${selectedOrder.status === 'confirmed' || selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-emerald-500 text-emerald-500'}`}>
                             {selectedOrder.status === 'confirmed' || selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-3 w-3 rounded-full bg-emerald-500"></div>}
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold">{t('قيد التجهيز', 'Preparing')}</p>
                            <p className="text-[10px] text-muted-foreground">{selectedOrder.status === 'confirmed' ? t('قيد العمل', 'In progress') : t('مكتمل', 'Done')}</p>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center z-10 gap-2 w-24">
                           <div className={`h-8 w-8 rounded-full flex items-center justify-center border-4 border-white dark:border-card ${selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? 'bg-emerald-500 text-white' : 'bg-muted border-muted-foreground text-transparent'}`}>
                            {selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? <CheckCircle2 className="h-4 w-4" /> : ''}
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold">{t('تم الشحن', 'Shipped')}</p>
                            <p className="text-[10px] text-muted-foreground">{selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? t('مكتمل', 'Done') : t('في الانتظار', 'Pending')}</p>
                          </div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex flex-col items-center z-10 gap-2 w-24">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border-4 border-white dark:border-card ${selectedOrder.status === 'delivered' ? 'bg-emerald-500 text-white' : 'bg-muted border-muted-foreground text-transparent'}`}>
                            {selectedOrder.status === 'delivered' ? <CheckCircle2 className="h-4 w-4" /> : ''}
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold">{t('تم التوصيل', 'Delivered')}</p>
                            <p className="text-[10px] text-muted-foreground">{selectedOrder.status === 'delivered' ? t('مكتمل', 'Done') : t('في الانتظار', 'Pending')}</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Left Column - Items & Notes */}
                  <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-1">
                    <Card className="shadow-sm overflow-hidden">
                      <CardHeader className="pb-2 border-b">
                        <CardTitle className="text-sm font-black">{t('المنتجات', 'Items')} &bull; {selectedOrder.items.length}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto w-full">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/10 text-[10px] text-muted-foreground uppercase">
                            <tr>
                              <th className="p-3 md:p-4 font-bold text-start w-1/2 min-w-[200px]">{t('المنتج', 'PRODUCT')}</th>
                              <th className="p-3 md:p-4 font-bold text-center w-16">{t('الكمية', 'QTY')}</th>
                              <th className="p-3 md:p-4 font-bold text-end w-24 whitespace-nowrap">{t('السعر', 'PRICE')}</th>
                              <th className="p-3 md:p-4 font-bold text-end w-28 whitespace-nowrap">{t('المجموع', 'TOTAL')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items.map((item: any, idx: number) => (
                              <tr key={idx} className="border-b">
                                <td className="p-3 md:p-4 flex gap-3 items-start md:items-center flex-col md:flex-row">
                                  <div className="h-8 w-8 md:h-10 md:w-10 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-100">
                                    {item.productName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-sm text-foreground truncate">{item.productName}</p>
                                    <p className="text-xs text-muted-foreground" dir="ltr">SKU - PRD-{item.id.substring(0,4)}</p>
                                  </div>
                                </td>
                                <td className="p-3 md:p-4 text-center font-bold align-middle">{item.quantity}</td>
                                <td className="p-3 md:p-4 text-end text-muted-foreground align-middle whitespace-nowrap" dir="ltr">{item.price.toLocaleString()} DZD</td>
                                <td className="p-3 md:p-4 text-end font-bold text-foreground align-middle whitespace-nowrap" dir="ltr">{item.total.toLocaleString()} DZD</td>
                              </tr>
                            ))}
                            {/* Totals rows inside table footer */}
                            <tr>
                              <td colSpan={2}></td>
                              <td className="p-2 md:p-3 text-end text-xs text-muted-foreground font-bold">{t('المجموع الفرعي', 'Subtotal')}</td>
                              <td className="p-2 md:p-3 text-end font-bold text-sm whitespace-nowrap" dir="ltr">{selectedOrder.subtotal.toLocaleString()} DZD</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td className="p-2 md:p-3 text-end text-xs text-muted-foreground font-bold">{t('تكلفة الشحن', 'Shipping')}</td>
                              <td className="p-2 md:p-3 text-end font-bold text-sm whitespace-nowrap" dir="ltr">{(selectedOrder.shippingCost || 0).toLocaleString()} DZD</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td className="p-2 md:p-3 text-end text-xs text-muted-foreground font-bold">{t('الضريبة', 'Tax')}</td>
                              <td className="p-2 md:p-3 text-end font-bold text-sm whitespace-nowrap" dir="ltr">{(selectedOrder.tax || 0).toLocaleString()} DZD</td>
                            </tr>
                            <tr className="border-t">
                              <td colSpan={2}></td>
                              <td className="p-3 md:p-4 text-end font-black text-base">{t('المجموع', 'Total')}</td>
                              <td className="p-3 md:p-4 text-end font-black text-base whitespace-nowrap" dir="ltr">{selectedOrder.total.toLocaleString()} DZD</td>
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-2 border-b">
                        <CardTitle className="text-sm font-black">{t('ملاحظات الطلب', 'Order notes')}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4 mb-4">
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">JD</div>
                            <div>
                              <p className="text-sm text-foreground">{t('طلب العميل شحن سريع إن أمكن.', 'Customer requested expedited shipping if available.')}</p>
                              <p className="text-xs text-muted-foreground" dir="ltr">{selectedOrder.date} - 10:15</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">AS</div>
                            <div>
                              <p className="text-sm text-foreground"><span className="font-bold">{t('المدير ص.', 'Admin S.')}</span> {t('أشار إلى أن العميل لديه أكثر من 5 طلبات.', 'noted the customer is a returning user with 5+ orders.')}</p>
                              <p className="text-xs text-muted-foreground" dir="ltr">{selectedOrder.date} - 10:32</p>
                            </div>
                          </div>
                        </div>
                        <textarea className="w-full border rounded-md p-3 text-sm min-h-[80px] outline-none focus:border-primary" placeholder={t('أضف ملاحظة لفريقك...', 'Add a note for your team...')}></textarea>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Customer Info */}
                  <div className="space-y-4 md:space-y-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2 border-b">
                        <CardTitle className="text-sm font-black">{t('العميل', 'Customer')}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-lg shrink-0">
                            {selectedOrder.buyerName.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-sm md:text-base truncate">{selectedOrder.buyerName}</p>
                            <p className="text-xs text-muted-foreground">{t('5 طلبات سابقة', '5 previous orders')}</p>
                          </div>
                        </div>
                        <div className="space-y-2 md:space-y-3 text-xs md:text-sm flex flex-col">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-muted-foreground shrink-0">{t('البريد', 'Email')}</span>
                            <span className="text-emerald-500 font-bold hover:underline cursor-pointer truncate" dir="ltr">customer@example.com</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-muted-foreground shrink-0">{t('الهاتف', 'Phone')}</span>
                            <span className="font-bold" dir="ltr">{selectedOrder.buyerPhone || '+213 555 010 202'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-2 border-b">
                        <CardTitle className="text-sm font-black">{t('عنوان الشحن', 'Shipping address')}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 text-xs md:text-sm text-foreground">
                        <p className="font-bold mb-1">{selectedOrder.buyerName}</p>
                        <p>{selectedOrder.address?.street || t('1234 شارع السوق، جناح 500', '1234 Market Street, Suite 500')}</p>
                        <p>{selectedOrder.address?.city || t('الجزائر العاصمة', 'Algiers, Algeria')}</p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-2 border-b">
                        <CardTitle className="text-sm font-black">{t('الدفع', 'Payment')}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2 md:space-y-3 text-xs md:text-sm">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-muted-foreground">{t('الطريقة', 'Method')}</span>
                          <span className="font-bold truncate" dir="ltr">{selectedOrder.paymentMethod.toUpperCase()} {selectedOrder.paymentStatus === 'paid' ? '•••• 4242' : ''}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-muted-foreground">{t('المعاملة', 'Transaction')}</span>
                          <span className="font-mono text-xs truncate" dir="ltr">ch_30qXyZ...</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-muted/50">
                          <span className="text-muted-foreground">{t('الحالة', 'Status')}</span>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            <span className="font-bold text-xs" style={{ color: selectedOrder.paymentStatus === 'paid' ? '#10B981' : '#F59E0B' }}>
                              {selectedOrder.paymentStatus === 'paid' ? t('تم السحب', 'Captured') : t('في الانتظار', 'Pending')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
