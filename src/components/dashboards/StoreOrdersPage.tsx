'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Package, Search, Filter, Calendar, MapPin, Truck, CheckCircle2, XCircle, Clock, 
  ChevronRight, ChevronLeft, MoreVertical, FileText, Download, Printer, Loader2, DollarSign, User
} from 'lucide-react';
import { toast } from 'sonner';

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function StoreOrdersPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch orders from seller dashboard endpoint (which retrieves recent orders)
  const fetchOrders = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/dashboard?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      if (data.success && data.recentOrders) {
        // Consolidated orderItems into parent orders
        const ordersMap = new Map();
        data.recentOrders.forEach((item: any) => {
          const o = item.order;
          if (!o) return;
          
          if (!ordersMap.has(o.id)) {
            let parsedAddress = { fullName: '', phone: '', street: '', city: '' };
            try {
              if (o.address) {
                parsedAddress = typeof o.address === 'string' ? JSON.parse(o.address) : o.address;
              }
            } catch {
              // Fallback if raw text
              parsedAddress = { fullName: o.buyer?.name || '', phone: o.buyer?.phone || '', street: o.address, city: '' };
            }

            ordersMap.set(o.id, {
              id: o.id,
              orderNumber: o.orderNumber || 'N/A',
              buyerName: parsedAddress.fullName || o.buyer?.name || t('زبون ضيف', 'Guest Buyer'),
              buyerPhone: parsedAddress.phone || o.buyer?.phone || '',
              buyerEmail: o.buyer?.email || '',
              date: new Date(o.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US'),
              rawDate: o.createdAt,
              status: o.status,
              paymentMethod: o.paymentMethod || 'cod',
              paymentStatus: o.paymentStatus || 'pending',
              address: parsedAddress,
              shippingCost: o.shippingCost || 0,
              subtotal: o.subtotal || 0,
              discount: o.discount || 0,
              couponId: o.couponId || null,
              total: o.total,
              items: [],
            });
          }
          const orderObj = ordersMap.get(o.id);
          orderObj.items.push({
            id: item.id,
            productName: item.product?.name || item.productName || t('منتج غير معرف', 'Unknown Product'),
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          });
        });

        // Fix: recalculate subtotal & discount for orders with missing data
        const finalOrders = Array.from(ordersMap.values()).map((order: any) => {
          // Compute real subtotal from items if missing
          const itemsTotal = order.items.reduce((sum: number, i: any) => sum + (i.total || i.price * i.quantity), 0);
          const realSubtotal = order.subtotal > 0 ? order.subtotal : itemsTotal;

          // If discount not stored but can be derived: subtotal + shipping - total
          let realDiscount = order.discount || 0;
          if (realDiscount === 0 && realSubtotal > 0) {
            const derived = realSubtotal + (order.shippingCost || 0) - (order.total || 0);
            if (derived > 0) realDiscount = derived;
          }

          return { ...order, subtotal: realSubtotal, discount: realDiscount };
        });

        setOrders(finalOrders);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ أثناء جلب الطلبات', 'Error fetching orders'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedOrder.id, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      const updatedOrder = { ...selectedOrder, status };
      setSelectedOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      toast.success(t('تم تحديث حالة الطلب بنجاح', 'Order status updated successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('حدث خطأ أثناء تحديث الحالة', 'Error updating status'));
    }
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.warning(t('لا توجد طلبات لتصديرها!', 'No orders available to export!'));
      return;
    }

    const headers = [
      t('رقم الطلب', 'Order ID'),
      t('العميل', 'Customer'),
      t('التاريخ', 'Date'),
      t('الحالة', 'Status'),
      t('المجموع الفرعي', 'Subtotal'),
      t('الشحن', 'Shipping'),
      t('الإجمالي', 'Total'),
      t('طريقة الدفع', 'Payment Method'),
      t('العنوان', 'Address'),
      t('الهاتف', 'Phone')
    ];

    const rows = orders.map(o => [
      `"${o.orderNumber}"`,
      `"${o.buyerName}"`,
      `"${o.date}"`,
      `"${o.status}"`,
      o.subtotal,
      o.shippingCost,
      o.total,
      `"${o.paymentMethod}"`,
      `"${o.address.street || ''}, ${o.address.city || ''}"`,
      `"${o.buyerPhone}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ChariDay_Orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('📊 تم تصدير ملف المبيعات بنجاح!', '📊 Orders spreadsheet exported successfully!'));
  };

  // Print Invoice Function
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
                ${selectedOrder.buyerPhone}<br />
                ${selectedOrder.address.street || ''}, ${selectedOrder.address.city || ''}
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
            ${(() => {
              // Smart subtotal: use stored value or calculate from items
              const itemsTotal = selectedOrder.items.reduce((sum: number, i: any) => sum + (i.total || i.price * i.quantity), 0);
              const printSubtotal = (selectedOrder.subtotal > 0 ? selectedOrder.subtotal : itemsTotal);
              const printDiscount = selectedOrder.discount > 0 ? selectedOrder.discount : 
                (printSubtotal + (selectedOrder.shippingCost || 0) - selectedOrder.total > 0 ? 
                  printSubtotal + (selectedOrder.shippingCost || 0) - selectedOrder.total : 0);
              
              return `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; text-align: start;">${isArOrder ? 'المجموع الفرعي:' : 'Subtotal:'}</td>
                <td style="padding: 8px 0; text-align: end;">${printSubtotal.toLocaleString()} DZD</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; text-align: start;">${isArOrder ? 'تكلفة الشحن:' : 'Shipping:'}</td>
                <td style="padding: 8px 0; text-align: end;">${(selectedOrder.shippingCost || 0).toLocaleString()} DZD</td>
              </tr>
              ${printDiscount > 0 ? `
              <tr style="border-bottom: 1px solid #e2e8f0; color: #ef4444;">
                <td style="padding: 8px 0; text-align: start;">${isArOrder ? 'الخصم:' : 'Discount:'}</td>
                <td style="padding: 8px 0; text-align: end;">-${printDiscount.toLocaleString()} DZD</td>
              </tr>` : ''}
              `;
            })()}
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

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'pending': return { label: t('معلق', 'Pending'), color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock };
      case 'confirmed': return { label: t('قيد التجهيز', 'Processing'), color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Package };
      case 'shipped': return { label: t('تم الشحن', 'Shipped'), color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: Truck };
      case 'delivered': return { label: t('تم التوصيل', 'Delivered'), color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 };
      case 'cancelled': return { label: t('ملغي', 'Cancelled'), color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle };
      default: return { label: status, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: Package };
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.buyerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6 text-start"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('إدارة الطلبات المتطورة', 'Advanced Order Management')}
          description={t('تتبع المبيعات الحية، طباعة الفواتير، تصدير سجلات CSV، وتتبع الشحنات.', 'Track live sales, print invoices, export CSV spreadsheets, and manage deliveries.')}
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-background/50 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/10 shrink-0">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm rounded-lg' : 'rounded-lg'}
            >
              {t('قائمة', 'List')}
            </Button>
            <Button 
              variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' ? 'bg-primary text-primary-foreground shadow-sm rounded-lg' : 'rounded-lg'}
            >
              {t('Kanban', 'Board')}
            </Button>
          </div>
          <Button 
            onClick={handleExportCSV}
            className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full sm:w-auto"
          >
            <Download className="h-4 w-4 me-2" />
            {t('تصدير CSV', 'Export CSV')}
          </Button>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={FADE_UP} className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          <Input 
            placeholder={t('ابحث برقم الطلب أو اسم العميل...', 'Search by order ID or customer...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`rounded-xl bg-muted/30 border-transparent focus-visible:ring-primary ${isAr ? 'pr-9' : 'pl-9'}`}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                statusFilter === filter 
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                  : 'bg-background/40 text-muted-foreground border-white/10 hover:text-foreground'
              }`}
            >
              {filter === 'all' ? t('الكل', 'All') : getStatusConfig(filter).label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* View Switcher Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="h-[300px] w-full flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">{t('جاري جلب سجل الطلبات والمبيعات...', 'Syncing orders with database...')}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl h-[250px] flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-bold text-foreground">{t('لا توجد طلبات مطابقة للبحث', 'No orders found')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('يرجى محاولة تغيير كلمة البحث أو المرشحات المطبقة.', 'Try checking spelling or changing active status filter.')}</p>
            </div>
          </Card>
        ) : viewMode === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredOrders.map((order, idx) => {
              const st = getStatusConfig(order.status);
              return (
                <Card 
                  key={idx} 
                  onClick={() => setSelectedOrder(order)}
                  className="border-white/10 bg-background/60 backdrop-blur-xl shadow-lg rounded-3xl overflow-hidden hover:border-primary/40 transition-all group cursor-pointer hover:shadow-primary/5"
                >
                  <CardContent className="p-0 text-start">
                    <div className="p-5 flex justify-between items-start border-b border-border/40">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-black text-base truncate max-w-[150px]">{order.buyerName}</h3>
                          <Badge variant="outline" className={`border ${st.color} bg-transparent text-[10px]`}>
                            {st.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">#{order.orderNumber}</p>
                      </div>
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${st.color} bg-opacity-20`}>
                        <st.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="p-5 bg-muted/10 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('المجموع', 'Total')}</p>
                        <p className="font-black text-sm text-primary">{order.total.toLocaleString()} DZD</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('التاريخ', 'Date')}</p>
                        <p className="font-bold text-xs text-foreground">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('المنتجات', 'Items')}</p>
                        <p className="font-bold text-xs text-foreground">{order.items.reduce((s: number, i: any) => s + i.quantity, 0)} {t('قطع', 'items')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('المدينة والولاية', 'City / Province')}</p>
                        <div className="flex items-center gap-1 font-bold text-xs text-foreground truncate">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{order.address.city || order.address.street}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar"
          >
            {/* Kanban Columns */}
            {['pending', 'confirmed', 'shipped', 'delivered'].map(statusKey => {
              const columnOrders = filteredOrders.filter(o => o.status === statusKey);
              const st = getStatusConfig(statusKey);
              return (
                <div key={statusKey} className="min-w-[300px] w-[300px] flex-shrink-0 flex flex-col gap-4">
                  <div className={`flex items-center justify-between p-3 rounded-2xl border ${st.color} bg-background/80 backdrop-blur-md`}>
                    <div className="flex items-center gap-2 font-black text-xs">
                      <st.icon className="h-4 w-4" />
                      {st.label}
                    </div>
                    <Badge className="bg-background text-foreground shadow-sm text-xs">{columnOrders.length}</Badge>
                  </div>
                  
                  <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1 hide-scrollbar">
                    {columnOrders.map((order, idx) => (
                      <Card 
                        key={idx} 
                        onClick={() => setSelectedOrder(order)}
                        className="border-white/10 bg-background/60 backdrop-blur-xl shadow-md rounded-2xl cursor-pointer hover:border-primary/50 transition-all"
                      >
                        <CardContent className="p-4 text-start">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-sm truncate max-w-[180px]">{order.buyerName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">#{order.orderNumber}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -me-2 -mt-2">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                            <span className="font-black text-primary">{order.total.toLocaleString()} DZD</span>
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Package className="h-3.5 w-3.5" /> {order.items.reduce((s: number, i: any) => s + i.quantity, 0)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Detail & PDF Invoice Dialog Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="border-white/10 bg-background/95 backdrop-blur-xl rounded-3xl max-w-xl max-h-[90vh] overflow-y-auto text-start">
          {selectedOrder && (
            <>
              <DialogHeader className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <DialogTitle className="text-lg font-black">{t('تفاصيل طلب مبيعات', 'Sales Order Details')}</DialogTitle>
                  </div>
                  <Badge variant="outline" className={`border ${getStatusConfig(selectedOrder.status).color}`}>
                    {getStatusConfig(selectedOrder.status).label}
                  </Badge>
                </div>
                <DialogDescription className="font-mono text-xs mt-1">
                  {t('رقم الطلب المرجعي:', 'Reference ID:')} #{selectedOrder.orderNumber}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Customer Details */}
                <div className="p-4 bg-muted/30 border border-white/5 rounded-2xl space-y-2">
                  <h4 className="font-black text-xs text-muted-foreground uppercase flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" />
                    {t('بيانات المشتري والتسليم', 'Buyer & Delivery Info')}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <p className="text-muted-foreground">{t('الاسم الكامل', 'Customer')}</p>
                      <p className="font-bold mt-0.5">{selectedOrder.buyerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('رقم الهاتف', 'Phone')}</p>
                      <p className="font-bold mt-0.5 text-start font-mono" dir="ltr">{selectedOrder.buyerPhone}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-xs">
                    <p className="text-muted-foreground">{t('عنوان الشحن المباشر', 'Delivery Address')}</p>
                    <p className="font-semibold mt-0.5 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{selectedOrder.address.street}, {selectedOrder.address.city}</span>
                    </p>
                  </div>
                </div>

                {/* Items Ordered */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs text-muted-foreground uppercase tracking-wider">{t('العناصر المطلوبة', 'Items List')} ({selectedOrder.items.length})</h4>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-background/50 rounded-xl border border-white/5 text-xs">
                        <div>
                          <p className="font-bold">{item.productName}</p>
                          <p className="text-muted-foreground mt-0.5">{item.price.toLocaleString()} DZD x {item.quantity}</p>
                        </div>
                        <span className="font-black text-primary">{item.total.toLocaleString()} DZD</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Totals */}
                <div className="p-4 bg-muted/20 border border-white/5 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('المجموع الفرعي', 'Subtotal')}</span>
                    <span className="font-bold">{selectedOrder.subtotal.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('تكلفة الشحن والتوصيل', 'Shipping')}</span>
                    <span className="font-bold">{selectedOrder.shippingCost.toLocaleString()} DZD</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-red-500 font-semibold">
                      <span>{t('الخصم', 'Discount')}</span>
                      <span>-{selectedOrder.discount.toLocaleString()} DZD</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm border-t border-white/5 pt-2">
                    <span className="text-foreground">{t('المجموع الإجمالي', 'Grand Total')}</span>
                    <span className="text-primary">{selectedOrder.total.toLocaleString()} DZD</span>
                  </div>
                </div>

                {/* Print and Actions */}
                <div className="flex gap-3 pt-2">
                  <select 
                    className="flex-1 bg-background border border-white/10 text-foreground rounded-xl px-3 h-11 focus:ring-primary focus:border-primary text-sm font-bold appearance-none cursor-pointer"
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                  >
                    <option value="pending">{t('معلق', 'Pending')}</option>
                    <option value="confirmed">{t('قيد التجهيز', 'Processing')}</option>
                    <option value="shipped">{t('تم الشحن', 'Shipped')}</option>
                    <option value="delivered">{t('تم التوصيل', 'Delivered')}</option>
                    <option value="cancelled">{t('ملغي', 'Cancelled')}</option>
                  </select>
                  <Button
                    onClick={handlePrintInvoice}
                    className="flex-1 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-foreground border border-white/10 h-11"
                  >
                    <Printer className="h-4 w-4 me-2 text-primary" />
                    {t('طباعة الفاتورة', 'Print Invoice')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
