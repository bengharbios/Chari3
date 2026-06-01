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

  return (
    <div className="space-y-6 p-4 md:p-6 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader title={t('إدارة الطلبات المتطورة', 'Advanced Order Management')} description={t('تتبع المبيعات الحية، مع فلترة دقيقة وعرض مرن.', 'Track live sales, precise filtering, and flexible views.')} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 shadow-sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('تصدير', 'Export')}
          </Button>
          <div className="bg-background/50 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/10 shrink-0">
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-lg"><List className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="rounded-lg"><TableIcon className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} className="rounded-lg"><LayoutGrid className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-background/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg">
        <div className="flex flex-wrap gap-2 items-center w-full">
          <Input placeholder={t('ابحث...', 'Search...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchOrders()} className="w-full sm:w-48 rounded-xl" />
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-auto rounded-xl" />
          <span className="text-muted-foreground">-</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-auto rounded-xl" />
          <Button onClick={() => { setPage(1); fetchOrders(); }} size="sm" className="rounded-xl">{t('بحث', 'Search')}</Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-white/10 rounded-xl px-4 h-10 text-sm font-bold cursor-pointer outline-none focus:border-primary w-full sm:w-auto"
          >
            <option value="all">{t('جميع الحالات', 'All Statuses')}</option>
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>{isAr ? s.nameAr : (s.nameEn || s.nameAr)}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : orders.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-muted-foreground">{t('لا توجد طلبات مطابقة.', 'No orders found.')}</div>
      ) : (
        <>
          {viewMode === 'table' && (
            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-background/50 backdrop-blur-md">
              <table className="w-full text-sm text-start">
                <thead className="bg-muted/50 border-b border-white/10">
                  <tr>
                    <th className="p-4">{t('رقم الطلب', 'Order ID')}</th>
                    <th className="p-4">{t('العميل', 'Customer')}</th>
                    <th className="p-4">{t('التاريخ', 'Date')}</th>
                    <th className="p-4">{t('الحالة', 'Status')}</th>
                    <th className="p-4">{t('المجموع', 'Total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} onClick={() => setSelectedOrder(o)} className="border-b border-white/5 hover:bg-muted/30 cursor-pointer transition-colors">
                      <td className="p-4 font-mono">#{o.orderNumber}</td>
                      <td className="p-4 font-bold">{o.buyerName}</td>
                      <td className="p-4">{o.date}</td>
                      <td className="p-4">
                        <Badge style={{ backgroundColor: getStatusConfig(o.status).color, color: '#fff' }} className="border-0 shadow-sm">{getStatusConfig(o.status).label}</Badge>
                      </td>
                      <td className="p-4 font-black">{o.total.toLocaleString()} DZD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.map((order, idx) => (
                <Card key={idx} onClick={() => setSelectedOrder(order)} className="border-white/10 bg-background/60 shadow-lg rounded-3xl overflow-hidden hover:border-primary/40 transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-base">{order.buyerName}</h3>
                        <p className="text-xs text-muted-foreground font-mono">#{order.orderNumber}</p>
                      </div>
                      <Badge style={{ backgroundColor: getStatusConfig(order.status).color, color: '#fff' }}>{getStatusConfig(order.status).label}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">{t('المجموع:', 'Total:')}</span> <span className="font-bold">{order.total.toLocaleString()} DZD</span></div>
                      <div><span className="text-muted-foreground">{t('التاريخ:', 'Date:')}</span> <span className="font-bold">{order.date}</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'kanban' && (
            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
              {statuses.map(statusObj => {
                const columnOrders = orders.filter(o => o.status === statusObj.key);
                return (
                  <div 
                    key={statusObj.key} 
                    className="min-w-[300px] w-[300px] flex-shrink-0 flex flex-col gap-4 bg-muted/10 p-3 rounded-3xl border border-white/5"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, statusObj.key)}
                  >
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-background/80" style={{ borderTop: `4px solid ${statusObj.color}` }}>
                      <span className="font-black text-sm">{isAr ? statusObj.nameAr : (statusObj.nameEn || statusObj.nameAr)}</span>
                      <Badge>{columnOrders.length}</Badge>
                    </div>
                    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto hide-scrollbar">
                      {columnOrders.map(order => (
                        <Card 
                          key={order.id} 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, order.id)}
                          onClick={() => setSelectedOrder(order)} 
                          className="border-white/10 bg-background/90 shadow-md rounded-2xl cursor-grab active:cursor-grabbing hover:border-primary/50"
                        >
                          <CardContent className="p-4 text-start">
                            <p className="font-bold text-sm truncate">{order.buyerName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 mb-2">#{order.orderNumber}</p>
                            <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                              <span className="font-black text-primary">{order.total.toLocaleString()} DZD</span>
                              <span className="text-muted-foreground">{order.date}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between items-center bg-background/50 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('الحد:', 'Limit:')}</span>
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="bg-background border border-white/10 rounded-lg p-1 text-sm">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t('السابق', 'Prev')}</Button>
              <span className="flex items-center px-2 text-sm font-bold">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>{t('التالي', 'Next')}</Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="border-white/10 bg-background/95 backdrop-blur-xl rounded-3xl max-w-xl max-h-[90vh] overflow-y-auto text-start">
          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <DialogTitle className="text-lg font-black">{t('تفاصيل الطلب', 'Order Details')} #{selectedOrder.orderNumber}</DialogTitle>
                <Button variant="outline" size="sm" onClick={handlePrintInvoice} className="rounded-lg h-8 print:hidden">
                  <Printer className="h-4 w-4 mr-2" />
                  {t('طباعة', 'Print')}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><p className="text-muted-foreground">{t('العميل', 'Customer')}</p><p className="font-bold">{selectedOrder.buyerName}</p></div>
                <div><p className="text-muted-foreground">{t('الهاتف', 'Phone')}</p><p className="font-bold font-mono" dir="ltr">{selectedOrder.buyerPhone}</p></div>
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-xs text-muted-foreground uppercase">{t('المنتجات', 'Items')}</h4>
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-3 bg-muted/20 rounded-xl border border-white/5 text-xs">
                    <div><p className="font-bold">{item.productName}</p><p className="text-muted-foreground">{item.price.toLocaleString()} DZD x {item.quantity}</p></div>
                    <span className="font-black text-primary">{item.total.toLocaleString()} DZD</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-muted/20 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('المجموع الفرعي', 'Subtotal')}</span><span className="font-bold">{selectedOrder.subtotal.toLocaleString()} DZD</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('تكلفة الشحن', 'Shipping')}</span><span className="font-bold">{(selectedOrder.shippingCost || 0).toLocaleString()} DZD</span></div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-500"><span className="font-bold">{t('الخصم', 'Discount')}</span><span className="font-bold">-{selectedOrder.discount.toLocaleString()} DZD</span></div>
                )}
                <div className="border-t border-white/5 pt-2 flex justify-between font-black text-sm"><span className="text-foreground">{t('المجموع النهائي', 'Total')}</span><span className="text-primary">{selectedOrder.total.toLocaleString()} DZD</span></div>
              </div>
              <div className="flex gap-3">
                <select className="flex-1 bg-background border border-white/10 rounded-xl px-3 h-11 text-sm font-bold cursor-pointer" value={selectedOrder.status} onChange={(e) => handleUpdateStatus(e.target.value)}>
                  {statuses.map(s => <option key={s.key} value={s.key}>{isAr ? s.nameAr : (s.nameEn || s.nameAr)}</option>)}
                </select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
