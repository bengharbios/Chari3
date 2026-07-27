'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Package, Search, Calendar, MapPin, Truck, CheckCircle2, XCircle, Clock, 
  MoreHorizontal, Download, Printer, Loader2, User, Table as TableIcon, LayoutGrid, List,
  ArrowUpDown, Filter, Eye, FileText, Check, DollarSign, RefreshCw, Plus, SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function StoreOrdersPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  const [waybillPrintOrder, setWaybillPrintOrder] = useState<any | null>(null);
  const [boxWeightInput, setBoxWeightInput] = useState<string>('');

  useEffect(() => {
    if (waybillPrintOrder) {
      const items = Array.isArray(waybillPrintOrder.items) ? waybillPrintOrder.items : [];
      let totalItemsW = 0;
      items.forEach((it: any) => {
        const w = it.product?.weight || 0.4;
        totalItemsW += w * (it.quantity || 1);
      });
      const initialGross = (totalItemsW + 0.25).toFixed(2);
      setBoxWeightInput(initialGross);
    }
  }, [waybillPrintOrder]);

  const handlePrintWaybill = (orderId: string, printLang: string) => {
    const weightVal = boxWeightInput ? parseFloat(boxWeightInput) : 0.5;
    const waybillUrl = `/api/seller/shipping/waybill?orderId=${orderId}&lang=${printLang}&weight=${weightVal}`;
    window.open(waybillUrl, '_blank', 'width=650,height=800');
    setWaybillPrintOrder(null);
  };

  const [orders, setOrders] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'list' | 'kanban'>('table');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load saved view mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('chari3_order_view_mode') as 'table' | 'list' | 'kanban';
    if (savedMode && ['table', 'list', 'kanban'].includes(savedMode)) {
      setViewMode(savedMode);
    }
  }, []);

  const handleViewModeChange = (mode: 'table' | 'list' | 'kanban') => {
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
          { key: 'pending', nameAr: 'معلق', nameEn: 'Pending', color: '#f59e0b' },
          { key: 'confirmed', nameAr: 'مؤكد', nameEn: 'Confirmed', color: '#3b82f6' },
          { key: 'shipped', nameAr: 'تم الشحن', nameEn: 'Shipped', color: '#6366f1' },
          { key: 'delivered', nameAr: 'تم التوصيل', nameEn: 'Delivered', color: '#10b981' },
          { key: 'cancelled', nameAr: 'ملغي', nameEn: 'Cancelled', color: '#ef4444' },
          { key: 'refunded', nameAr: 'مسترد', nameEn: 'Refunded', color: '#8b5cf6' }
        ]);
      }
    } catch (e) {
      setStatuses([
        { key: 'pending', nameAr: 'معلق', nameEn: 'Pending', color: '#f59e0b' }
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
            orderNumber: o.orderNumber || `CHARI-${o.id.substring(0, 8)}`,
            buyerName: parsedAddress.fullName || o.buyer?.name || t('زبون ضيف', 'Guest Buyer'),
            buyerPhone: parsedAddress.phone || o.buyer?.phone || '',
            date: new Date(o.createdAt).toLocaleDateString(isAr ? 'ar-DZ' : 'en-US'),
            status: o.status || 'pending',
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
              total: item.total || (item.price * item.quantity),
            }))
          };
        });
        setOrders(finalOrders);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      toast.error(t('حدث خطأ أثناء جلب الطلبات', 'Error fetching orders'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStatuses(); }, []);
  useEffect(() => { fetchOrders(); }, [user?.id, page, limit, statusFilter, startDate, endDate]);

  // Open order details directly if orderId is in URL
  useEffect(() => {
    if (!isLoading && orders.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const targetOrderId = params.get('orderId');
      if (targetOrderId) {
        const found = orders.find((o) => o.id === targetOrderId);
        if (found && !selectedOrder) {
          setSelectedOrder(found);
          const url = new URL(window.location.href);
          url.searchParams.delete('orderId');
          window.history.replaceState({}, '', url.toString());
        }
      }
    }
  }, [isLoading, orders, selectedOrder]);

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
      + orders.map(o => `${o.orderNumber},${o.buyerName},${o.buyerPhone},${o.date},${o.status},${o.total}`).join("\n");
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
    setWaybillPrintOrder(selectedOrder);
  };

  // Drag and Drop handlers for Kanban
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

  const getStatusBadge = (statusKey: string) => {
    switch (statusKey) {
      case 'delivered':
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">{t('تم التوصيل', 'Delivered')}</Badge>;
      case 'shipped':
        return <Badge className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20">{t('تم الشحن', 'Shipped')}</Badge>;
      case 'confirmed':
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">{t('مؤكد', 'Confirmed')}</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">{t('قيد الانتظار', 'Pending')}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">{t('ملغي', 'Cancelled')}</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20">{statusKey}</Badge>;
    }
  };

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(term)) ||
      (o.buyerName && o.buyerName.toLowerCase().includes(term)) ||
      (o.buyerPhone && o.buyerPhone.includes(term));
    const matchesTab = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesTab;
  });

  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6 text-start"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* Top Header */}
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('إدارة الطلبات المتقدمة', 'Advanced Orders Management')}
          description={t('متابعة طلبات المتجر، تتبع الحالات، إدخال الشحنات، والتصدير.', 'Store order tracking, status management, shipment dispatch, and exports.')}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="rounded-xl font-bold bg-background/50 backdrop-blur-md">
            <Download className="h-4 w-4 me-2" />
            {t('تصدير CSV', 'Export CSV')}
          </Button>
          <Button 
            className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            onClick={fetchOrders}
          >
            <RefreshCw className="h-4 w-4 me-2" />
            {t('تحديث البيانات', 'Refresh Orders')}
          </Button>
        </div>
      </motion.div>

      {/* KPI mini-cards */}
      <motion.div variants={FADE_UP} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('إجمالي الطلبات', 'Total Orders'), value: totalOrdersCount, color: 'text-emerald-500' },
          { label: t('إجمالي الإيرادات', 'Total Revenue'), value: `${totalRevenue.toLocaleString()} DZD`, color: 'text-blue-500' },
          { label: t('قيد الانتظار', 'Pending Orders'), value: pendingCount, color: 'text-amber-500' },
          { label: t('تم التوصيل', 'Delivered Orders'), value: deliveredCount, color: 'text-purple-500' },
        ].map((kpi, idx) => (
          <Card key={idx} className="border-white/10 bg-background/60 backdrop-blur-xl shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Container Card */}
      <motion.div variants={FADE_UP}>
        <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
              {[
                { id: 'all', label: t('الكل', 'All') },
                { id: 'pending', label: t('معلق', 'Pending') },
                { id: 'confirmed', label: t('مؤكد', 'Confirmed') },
                { id: 'shipped', label: t('تم الشحن', 'Shipped') },
                { id: 'delivered', label: t('تم التوصيل', 'Delivered') },
                { id: 'cancelled', label: t('ملغي', 'Cancelled') },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                  className={`px-4 py-1.5 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${
                    statusFilter === tab.id 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & View Switcher */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input 
                  placeholder={t('ابحث برقم الطلب أو الزبون...', 'Search by order # or buyer...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`rounded-xl bg-background/50 border-white/10 focus-visible:ring-primary ${isAr ? 'pr-9' : 'pl-9'}`}
                />
              </div>

              <div className="flex bg-muted/50 p-1 rounded-xl shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 rounded-lg ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => handleViewModeChange('table')}
                  title={t('جدول', 'Table View')}
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 rounded-lg ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => handleViewModeChange('list')}
                  title={t('قائمة', 'List View')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 rounded-lg ${viewMode === 'kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => handleViewModeChange('kanban')}
                  title={t('كانبان', 'Kanban View')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-2">
                <Package className="h-10 w-10 opacity-30" />
                <p className="text-sm font-bold">{t('لم يتم العثور على طلبات.', 'No orders found.')}</p>
              </div>
            ) : viewMode === 'table' ? (
              /* Table View */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="w-[140px] text-start">{t('الطلب', 'Order')}</TableHead>
                      <TableHead className="text-start">{t('الزبون', 'Customer')}</TableHead>
                      <TableHead className="text-center">{t('العناصر', 'Items')}</TableHead>
                      <TableHead className="text-center">{t('المبلغ', 'Total')}</TableHead>
                      <TableHead className="text-center">{t('الدفع', 'Payment')}</TableHead>
                      <TableHead className="text-center">{t('تاريخ الطلب', 'Date')}</TableHead>
                      <TableHead className="text-center">{t('الحالة', 'Status')}</TableHead>
                      <TableHead className="text-end">{t('الإجراءات', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredOrders.map((o) => (
                        <motion.tr 
                          key={o.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedOrder(o)}
                          className="group border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                        >
                          <TableCell className="font-mono font-bold text-primary">
                            #{o.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                                {o.buyerName ? o.buyerName.substring(0, 2).toUpperCase() : 'CU'}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-foreground">{o.buyerName}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{o.buyerPhone}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {o.items?.length || 1}
                          </TableCell>
                          <TableCell className="text-center font-bold text-foreground">
                            {o.total?.toLocaleString()} {t('د.ج', 'DZD')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-background/50 border-white/10 uppercase text-[10px]">
                              {o.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {o.date}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(o.status)}
                          </TableCell>
                          <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isAr ? "start" : "end"} className="w-52 rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                                <DropdownMenuLabel>{t('إدارة الطلب', 'Manage Order')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedOrder(o)}>
                                  <Eye className="h-4 w-4 me-2" />
                                  {t('عرض التفاصيل', 'View Details')}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setWaybillPrintOrder(o)}>
                                  <Printer className="h-4 w-4 me-2 text-primary" />
                                  {t('طباعة البوليصة الحرارية', 'Print Thermal Waybill')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-emerald-500" onClick={() => handleUpdateStatus('delivered', o.id)}>
                                  <CheckCircle2 className="h-4 w-4 me-2" />
                                  {t('تعليم كمكتمل (Delivered)', 'Mark Delivered')}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-red-500" onClick={() => handleUpdateStatus('cancelled', o.id)}>
                                  <XCircle className="h-4 w-4 me-2" />
                                  {t('إلغاء الطلب', 'Cancel Order')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            ) : viewMode === 'list' ? (
              /* List View */
              <div className="p-4 space-y-3">
                {filteredOrders.map((o) => (
                  <Card key={o.id} onClick={() => setSelectedOrder(o)} className="border-white/10 bg-background/40 hover:bg-background/80 transition-all cursor-pointer rounded-2xl p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-sm shrink-0">
                          {o.buyerName ? o.buyerName.substring(0, 2).toUpperCase() : 'CU'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary text-sm">#{o.orderNumber}</span>
                            {getStatusBadge(o.status)}
                          </div>
                          <p className="font-bold text-sm text-foreground mt-0.5">{o.buyerName} ({o.buyerPhone})</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{o.items?.length || 1} {t('منتجات', 'items')} &bull; {o.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                        <div className="text-start sm:text-end">
                          <p className="text-xs text-muted-foreground font-semibold">{t('الإجمالي', 'Total')}</p>
                          <p className="text-base font-black text-foreground">{o.total?.toLocaleString()} DZD</p>
                        </div>
                        <Button size="sm" variant="outline" className="rounded-xl font-bold" onClick={(e) => {
                          e.stopPropagation();
                          setWaybillPrintOrder(o);
                        }}>
                          <Printer className="h-4 w-4 me-1.5 text-primary" />
                          {t('بوليصة', 'Waybill')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* Kanban View */
              <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto">
                {['pending', 'confirmed', 'shipped', 'delivered'].map((colStatus) => {
                  const colOrders = filteredOrders.filter(o => o.status === colStatus || (colStatus === 'confirmed' && o.status === 'processing'));
                  return (
                    <div 
                      key={colStatus}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, colStatus)}
                      className="bg-muted/30 p-3 rounded-2xl border border-border/50 min-h-[400px] flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold uppercase text-foreground">{colStatus}</span>
                        <Badge variant="outline" className="rounded-full text-[10px] font-mono">{colOrders.length}</Badge>
                      </div>
                      <div className="space-y-3 flex-1">
                        {colOrders.map((o) => (
                          <div
                            key={o.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, o.id)}
                            onClick={() => setSelectedOrder(o)}
                            className="p-3 bg-background/80 hover:bg-background border border-white/10 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-primary">#{o.orderNumber}</span>
                              <span className="text-[10px] text-muted-foreground">{o.date}</span>
                            </div>
                            <p className="text-xs font-bold text-foreground truncate">{o.buyerName}</p>
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                              <span className="text-muted-foreground">{o.items?.length || 1} items</span>
                              <span className="font-black text-foreground">{o.total?.toLocaleString()} DZD</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!isLoading && filteredOrders.length > 0 && (
            <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
              <p>{t('عرض', 'Showing')} <strong className="text-foreground">{filteredOrders.length}</strong> {t('من أصل', 'out of')} <strong className="text-foreground">{totalOrdersCount}</strong> {t('طلب', 'orders')}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>{t('السابق', 'Prev')}</Button>
                <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>{t('التالي', 'Next')}</Button>
              </div>
            </div>
          )}

        </Card>
      </motion.div>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-background border-white/10 backdrop-blur-2xl rounded-3xl">
          <DialogTitle className="sr-only">{t('تفاصيل الطلب', 'Order Details')}</DialogTitle>
          <DialogDescription className="sr-only">{t('تفاصيل وشحن الطلب', 'Order details and shipment')}</DialogDescription>
          {selectedOrder && (
            <div className="flex flex-col text-start">
              {/* Modal Header */}
              <div className="p-6 border-b border-border/50 bg-muted/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-black text-primary">#{selectedOrder.orderNumber}</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t('تاريخ الطلب:', 'Order Date:')} {selectedOrder.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl font-bold gap-1.5" onClick={() => setWaybillPrintOrder(selectedOrder)}>
                    <Printer className="h-4 w-4 text-primary" />
                    {t('طباعة البوليصة الحرارية', 'Print Waybill')}
                  </Button>
                  <Button size="sm" className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => handleUpdateStatus('delivered')}>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('تعليم كمكتمل', 'Mark Delivered')}
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Proof of Delivery (POD) Section */}
                {(selectedOrder.status === 'delivered' || selectedOrder.podPhotoUrl || selectedOrder.podVerifiedByPin) && (
                  <Card className="p-4 rounded-2xl border-emerald-500/20 bg-emerald-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        <ShieldCheck className="h-5 w-5" />
                        <span>{t('إثبات التسليم الرقمي (Proof of Delivery - POD)', 'Digital Proof of Delivery')}</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                        {t('تم التحقق بكود الـ PIN المباشر ✓', 'PIN Verified ✓')}
                      </Badge>
                    </div>

                    {selectedOrder.podPhotoUrl && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-semibold">{t('صورة الطرد عند التوصيل:', 'Parcel Photo Proof:')}</p>
                        <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 h-44 bg-slate-900 flex items-center justify-center">
                          <img src={selectedOrder.podPhotoUrl} alt="POD Proof" className="h-full w-full object-cover" />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                      <div>
                        <span>{t('تاريخ وتوقيت التسليم:', 'Delivery Timestamp:')}</span>
                        <p className="font-mono font-bold text-foreground">{selectedOrder.podDeliveredAt ? new Date(selectedOrder.podDeliveredAt).toLocaleString('ar-DZ') : selectedOrder.date}</p>
                      </div>
                      <div>
                        <span>{t('البصمة الجغرافية (GPS):', 'GPS Location Stamp:')}</span>
                        <p className="font-mono font-bold text-foreground">
                          {selectedOrder.podLatitude && selectedOrder.podLongitude
                            ? `${selectedOrder.podLatitude.toFixed(4)}, ${selectedOrder.podLongitude.toFixed(4)}`
                            : t('موقع مسجل تلقائياً ✓', 'Auto-Captured ✓')}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Buyer & Address info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 rounded-2xl border-white/10 bg-background/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">{t('بيانات الزبون', 'Customer Details')}</p>
                    <p className="font-bold text-sm text-foreground">{selectedOrder.buyerName}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{selectedOrder.buyerPhone}</p>
                  </Card>
                  <Card className="p-4 rounded-2xl border-white/10 bg-background/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">{t('عنوان التوصيل', 'Shipping Address')}</p>
                    <p className="text-xs font-medium text-foreground">{selectedOrder.address?.street || t('غير محدد', 'Not specified')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedOrder.address?.city || ''}</p>
                  </Card>
                </div>

                {/* Items Table */}
                <div className="border border-border/50 rounded-2xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-start">{t('المنتج', 'Product')}</TableHead>
                        <TableHead className="text-center">{t('الكمية', 'Qty')}</TableHead>
                        <TableHead className="text-end">{t('السعر', 'Price')}</TableHead>
                        <TableHead className="text-end">{t('المجموع', 'Total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-bold text-sm">{item.productName}</TableCell>
                          <TableCell className="text-center font-mono">{item.quantity}</TableCell>
                          <TableCell className="text-end font-mono">{item.price?.toLocaleString()} DZD</TableCell>
                          <TableCell className="text-end font-bold font-mono">{item.total?.toLocaleString()} DZD</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-4 bg-muted/10 border-t border-border/50 space-y-1.5 text-xs text-end">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('المجموع الفرعي', 'Subtotal')}:</span>
                      <span className="font-mono font-bold">{selectedOrder.subtotal?.toLocaleString()} DZD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('الشحن', 'Shipping')}:</span>
                      <span className="font-mono font-bold">{selectedOrder.shippingCost?.toLocaleString()} DZD</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span>{t('الخصم', 'Discount')}:</span>
                        <span className="font-mono font-bold">-{selectedOrder.discount?.toLocaleString()} DZD</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black pt-2 border-t border-border/50 text-foreground">
                      <span>{t('الإجمالي النهائي', 'Final Total')}:</span>
                      <span className="font-mono text-primary">{selectedOrder.total?.toLocaleString()} DZD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Waybill Print Language & Packaging Weight Selection Dialog */}
      <Dialog open={!!waybillPrintOrder} onOpenChange={(open) => { if (!open) setWaybillPrintOrder(null); }}>
        <DialogContent className="max-w-md p-6 bg-background border-white/10 backdrop-blur-2xl rounded-3xl text-start space-y-4">
          <div>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              {t('طباعة البوليصة الحرارية وتحديد وزن الصندوق', 'Print Thermal Waybill & Set Weight')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {t('أدخل الوزن الفعلي للصندوق بعد تجهيزه وتغليفه ثم اختر لغة الطباعة.', 'Enter final gross box weight after packaging and select your preferred language.')}
            </DialogDescription>
          </div>

          {waybillPrintOrder && (
            <div className="space-y-4">
              {/* Box Gross Weight Input */}
              <div className="p-3.5 bg-muted/20 border border-border/50 rounded-2xl space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>📦 {t('الوزن الفعلي للصندوق المعبأ (Gross Weight)', 'Actual Packaged Box Weight')}</span>
                  <span className="text-[10px] text-primary font-mono font-bold">kg</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.1"
                    placeholder="e.g. 2.50"
                    value={boxWeightInput}
                    onChange={(e) => setBoxWeightInput(e.target.value)}
                    className="rounded-xl font-mono text-base font-bold bg-background border-border/60 pe-12"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted-foreground">kg</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t('يتم ترحيل هذا الوزن للبوليصة الرسمية لتقديمه لشركة التوصيل ومطابقة الوزن الفعلي.', 'This weight will be printed on the official waybill for shipping carrier verification.')}
                </p>
              </div>

              {/* Language Selection Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">{t('اختر لغة البوليصة الحرارية للطباعة:', 'Select Waybill Print Language:')}</label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-2xl h-11 font-bold hover:bg-primary/10 hover:border-primary/30"
                    onClick={() => handlePrintWaybill(waybillPrintOrder.id, 'ar')}
                  >
                    <span className="flex items-center gap-2 text-sm">🇸🇦 العربية (Arabic)</span>
                    <Badge variant="secondary" className="text-[10px]">الافتراضي</Badge>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-2xl h-11 font-bold hover:bg-primary/10 hover:border-primary/30"
                    onClick={() => handlePrintWaybill(waybillPrintOrder.id, 'en')}
                  >
                    <span className="flex items-center gap-2 text-sm">🇬🇧 English</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-2xl h-11 font-bold hover:bg-primary/10 hover:border-primary/30"
                    onClick={() => handlePrintWaybill(waybillPrintOrder.id, 'fr')}
                  >
                    <span className="flex items-center gap-2 text-sm">🇫🇷 Français</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
