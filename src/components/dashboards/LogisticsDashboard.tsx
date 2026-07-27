'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore, useAuthStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Truck, Navigation, MapPin, Phone, CheckCircle,
  Clock, Package, Wallet, RefreshCw, Loader2,
  Printer, ShieldCheck, KeyRound, Camera, Upload
} from 'lucide-react';
import { toast } from 'sonner';

// Dynamically import Leaflet Map to avoid SSR issues
const LiveTrackingMap = dynamic(() => import('@/components/maps/LiveTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] w-full bg-slate-900 flex items-center justify-center text-white text-xs gap-2 rounded-3xl">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      <span>جاري تحميل خريطة الـ GPS التفاعلية...</span>
    </div>
  )
});

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function LogisticsDashboard() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Selected shipment for persistent sidebar card view
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);

  // Separate modal state for Delivery PIN entry (preventing closing of sidebar card)
  const [pinModalShipment, setPinModalShipment] = useState<any | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'picked_up' | 'in_transit' | 'delivered'>('all');

  const fetchLogisticsData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/logistics/dashboard?userId=${user?.id || ''}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (json.data.shipments?.length > 0 && !selectedShipment) {
          setSelectedShipment(json.data.shipments[0]);
        }
      }
    } catch (err) {
      toast.error(t('خطأ في تحميل بيانات اللوجستيات', 'Failed to load logistics data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, [user?.id]);

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shipmentId, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(t('تم تحديث حالة الشحنة بنجاح', 'Shipment status updated successfully'));
      fetchLogisticsData();
    } catch {
      toast.error(t('فشل تحديث حالة الشحنة', 'Failed to update shipment status'));
    }
  };

  const handleVerifyDeliveryPin = async () => {
    if (!pinModalShipment) return;
    if (!pinInput || pinInput.length < 4) {
      toast.error(t('يرجى إدخال رمز التوصيل PIN المكون من 4 أرقام', 'Please enter 4-digit Delivery PIN'));
      return;
    }
    setIsSubmittingPin(true);
    try {
      const res = await fetch('/api/logistics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pinModalShipment.orderId || pinModalShipment.id,
          pin: pinInput,
          photoUrl: podPhoto,
          lat: podGps?.lat,
          lng: podGps?.lng,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(t('تم تأكيد رمز الـ PIN وإثبات التسليم بالصورة والموقع بنجاح!', 'PIN & Proof of Delivery verified! Wallet credited.'));
        setPinModalShipment(null);
        setPinInput('');
        setPodPhoto(null);
        fetchLogisticsData();
      } else {
        toast.error(resData.error || t('رمز الـ PIN غير صحيح، حاول مجدداً', 'Invalid Delivery PIN, try again'));
      }
    } catch {
      toast.error(t('خطأ في الاتصال بالخادم', 'Connection error'));
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{t('تم التسليم', 'Delivered')}</Badge>;
      case 'in_transit':
      case 'shipped':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{t('في الطريق', 'In Transit')}</Badge>;
      case 'picked_up':
      case 'confirmed':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{t('تم الاستلام', 'Picked Up')}</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20">{status}</Badge>;
    }
  };

  const driver = data?.driver || {
    name: user?.name || 'حمزة بن زاهي',
    phone: user?.phone || '0550000002',
    isVerified: user?.isVerified || false,
    rating: 4.9,
    todayDeliveriesCount: 12,
    totalDeliveriesCount: 345,
    activeCount: 4,
    earnings: 28500,
    currency: 'DZD',
  };

  const shipments = data?.shipments || [];
  const filteredShipments = shipments.filter((s: any) => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  });

  return (
    <motion.div 
      className="space-y-6 text-start"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* Top Header Controls */}
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">{t('لوحة تحكم عمليات الشحن والتوصيل', 'Logistics & Driver Dashboard')}</h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">
              <ShieldCheck className="h-3.5 w-3.5 me-1" />
              {driver.isVerified ? t('حساب موثق (KYC)', 'Verified Driver') : t('قيد التوثيق', 'Pending KYC')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('مرحباً بك،', 'Welcome back,')} <strong className="text-foreground">{driver.name}</strong> &bull; {t('إدارة الشحنات والتتبع اللحظي ومستحقات الـ COD', 'Manage shipments, live GPS, & COD wallet')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background/60 backdrop-blur-xl border border-white/10 p-2 rounded-xl">
            <span className={`text-xs font-bold ${isOnline ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              {t(isOnline ? 'جاهز لاستقبال الشحنات' : 'غير متصل', isOnline ? 'Online & Ready' : 'Offline')}
            </span>
            <Switch checked={isOnline} onCheckedChange={setIsOnline} />
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogisticsData} className="rounded-xl font-bold bg-background/50 backdrop-blur-md">
            <RefreshCw className="h-4 w-4 me-1.5" />
            {t('تحديث', 'Refresh')}
          </Button>
        </div>
      </motion.div>

      {/* KPI Stats Cards */}
      <motion.div variants={FADE_UP} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('الشحنات النشطة المكلفة بها', 'Active Shipments'), value: driver.activeCount, color: 'text-amber-500', icon: Navigation },
          { label: t('توصيلات اليوم', 'Today Deliveries'), value: driver.todayDeliveriesCount, color: 'text-emerald-500', icon: CheckCircle },
          { label: t('إجمالي التوصيلات', 'Total Deliveries'), value: driver.totalDeliveriesCount, color: 'text-blue-500', icon: Package },
          { label: t('رصيد المحفظة والأرباح', 'Wallet Balance'), value: `${driver.earnings.toLocaleString()} DZD`, color: 'text-purple-500', icon: Wallet },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="border-white/10 bg-background/60 backdrop-blur-xl shadow-sm rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                  <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Real Interactive Leaflet Map & Selected Shipment Card */}
      <motion.div variants={FADE_UP} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real Leaflet Map */}
        <Card className="lg:col-span-2 border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <CardTitle className="text-sm font-bold">{t('خريطة التتبع اللحظي التفاعلية (Live GPS Tracking)', 'Interactive Live GPS Tracking Map')}</CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              OpenStreetMap Active
            </Badge>
          </CardHeader>

          <CardContent className="p-2">
            <LiveTrackingMap 
              shipments={shipments} 
              onSelectShipment={(s) => setSelectedShipment(s)} 
            />
          </CardContent>
        </Card>

        {/* Selected Shipment Details Card (Persisted regardless of PIN Modal state) */}
        <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-bold text-sm">{t('الشحنة المحددة حالياً', 'Selected Shipment')}</h3>
              {selectedShipment && getStatusBadge(selectedShipment.status)}
            </div>

            {selectedShipment ? (
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('رقم الشحنة:', 'Tracking #:')}</span>
                  <span className="font-mono font-bold text-primary">{selectedShipment.trackingNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('المستلم:', 'Recipient:')}</span>
                  <span className="font-bold text-foreground">{selectedShipment.recipientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('العنوان:', 'Address:')}</span>
                  <span className="font-medium text-end max-w-[170px] truncate">{selectedShipment.address}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-2">
                  <span className="text-muted-foreground">{t('المبلغ عند التسليم (COD):', 'COD Amount:')}</span>
                  <span className="font-black text-emerald-500 text-sm">{selectedShipment.codAmount?.toLocaleString()} DZD</span>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-xl text-xs font-bold"
                    onClick={() => window.open(`tel:${selectedShipment.recipientPhone}`, '_self')}
                  >
                    <Phone className="h-3.5 w-3.5 me-1 text-emerald-500" />
                    {t('اتصل بالزبون', 'Call Buyer')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-xl text-xs font-bold"
                    onClick={() => {
                      const waybillUrl = `/api/seller/shipping/waybill?orderId=${selectedShipment.orderId}&lang=${locale}`;
                      window.open(waybillUrl, '_blank', 'width=650,height=800');
                    }}
                  >
                    <Printer className="h-3.5 w-3.5 me-1 text-primary" />
                    {t('البوليصة', 'Waybill')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Truck className="h-10 w-10 mx-auto opacity-30" />
                <p className="text-xs font-bold">{t('انقر على أي شحنة من الخريطة أو الجدول لمعاينتها', 'Click any shipment on map or table')}</p>
              </div>
            )}
          </div>

          {selectedShipment && (
            <Button 
              size="sm" 
              className="w-full mt-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={() => setPinModalShipment(selectedShipment)}
            >
              <KeyRound className="h-4 w-4" />
              {t('تأكيد التسليم بالـ Delivery PIN', 'Enter Delivery PIN')}
            </Button>
          )}
        </Card>
      </motion.div>

      {/* Main Active Shipments Table */}
      <motion.div variants={FADE_UP}>
        <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
              {[
                { id: 'all', label: t('جميع الشحنات', 'All Shipments') },
                { id: 'picked_up', label: t('تم الاستلام', 'Picked Up') },
                { id: 'in_transit', label: t('في الطريق', 'In Transit') },
                { id: 'delivered', label: t('تم التسليم', 'Delivered') },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              {t('عرض', 'Showing')} <strong className="text-foreground">{filteredShipments.length}</strong> {t('شحنة مكلف بها', 'assigned shipments')}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50">
                  <TableHead className="w-[150px]">{t('رقم الشحنة', 'Tracking #')}</TableHead>
                  <TableHead className="min-w-[200px]">{t('المستلم والعنوان', 'Recipient & Address')}</TableHead>
                  <TableHead className="text-center w-[120px]">{t('الولاية', 'Wilaya')}</TableHead>
                  <TableHead className="text-center w-[130px]">{t('المبلغ (COD)', 'COD Total')}</TableHead>
                  <TableHead className="text-center w-[120px]">{t('عمولة التوصيل', 'Fee')}</TableHead>
                  <TableHead className="text-center w-[120px]">{t('الحالة', 'Status')}</TableHead>
                  <TableHead className="text-end min-w-[160px]">{t('الإجراءات السريعة', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      {t('لا توجد شحنات في هذه الحالة.', 'No shipments found.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShipments.map((s: any) => (
                    <TableRow 
                      key={s.id}
                      onClick={() => setSelectedShipment(s)}
                      className="group border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <TableCell className="font-mono font-bold text-primary">
                        {s.trackingNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm text-foreground">{s.recipientName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[220px]">{s.address}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        <Badge variant="outline" className="bg-background/50 border-white/10">
                          {s.city}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-emerald-500 font-mono">
                        {s.codAmount?.toLocaleString()} DZD
                      </TableCell>
                      <TableCell className="text-center font-bold font-mono">
                        +{s.shippingFee?.toLocaleString()} DZD
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(s.status)}
                      </TableCell>
                      <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 rounded-lg text-xs font-bold"
                            onClick={() => window.open(`tel:${s.recipientPhone}`, '_self')}
                          >
                            <Phone className="h-3.5 w-3.5 me-1 text-emerald-500" />
                            {t('اتصل', 'Call')}
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                              setSelectedShipment(s);
                              setPinModalShipment(s);
                            }}
                          >
                            <KeyRound className="h-3.5 w-3.5 me-1" />
                            {t('PIN', 'PIN')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>

      {/* Delivery PIN Modal (Independent from selectedShipment sidebar view) */}
      <Dialog open={!!pinModalShipment} onOpenChange={(open) => { if (!open) setPinModalShipment(null); }}>
        <DialogContent className="max-w-md p-6 bg-background border-white/10 backdrop-blur-2xl rounded-3xl text-start">
          <DialogTitle className="text-lg font-black">{t('تأكيد التسليم بواسطة رمز الـ PIN', 'Confirm Delivery via PIN')}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {t('اطلب رمز التأكيد المكون من 4 أرقام من الزبون بعد تسليمه الطرد وتحصيل المبلغ.', 'Enter the 4-digit confirmation PIN provided by the customer.')}
          </DialogDescription>

          {pinModalShipment && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-1 text-xs">
                <p className="text-muted-foreground">{t('رقم الشحنة:', 'Tracking #:')} <strong className="font-mono text-primary">{pinModalShipment.trackingNumber}</strong></p>
                <p className="text-muted-foreground">{t('المستلم:', 'Recipient:')} <strong className="text-foreground">{pinModalShipment.recipientName}</strong> ({pinModalShipment.recipientPhone})</p>
                <p className="text-muted-foreground">{t('المبلغ المطلوب تحصيله:', 'COD Amount:')} <strong className="text-emerald-500 font-bold">{pinModalShipment.codAmount?.toLocaleString()} DZD</strong></p>
              </div>

              {/* GPS Stamp Status */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                  <MapPin className="h-4 w-4" />
                  {t('البصمة الجغرافية (GPS):', 'GPS Stamp:')}
                </span>
                {isCapturingGps ? (
                  <span className="text-muted-foreground animate-pulse">{t('جاري التحديد...', 'Detecting...')}</span>
                ) : podGps ? (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px]">
                    {t('محدد تلقائياً ✓', 'Auto-Captured ✓')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/10 text-[10px]">
                    {t('الوضع التلقائي المستقل', 'Fallback Mode')}
                  </Badge>
                )}
              </div>

              {/* POD Photo Upload */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5 flex items-center justify-between">
                  <span>{t('📸 صورة إثبات التسليم (Photo POD)', '📸 Parcel Photo Proof')}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">{t('موصى به لرفع الأمان', 'Recommended')}</span>
                </label>

                {podPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 h-28 bg-slate-900 flex items-center justify-center group">
                    <img src={podPhoto} alt="POD Proof" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setPodPhoto(null)}>
                        {t('حذف الصورة', 'Remove Photo')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border hover:border-emerald-500/50 rounded-2xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all text-xs text-muted-foreground">
                    <Camera className="h-6 w-6 mb-1 text-emerald-500" />
                    <span>{t('التقط صورة بالطرد أو انقر للرفع', 'Take photo or upload proof')}</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">{t('رمز التأكيد (Delivery PIN)', 'Delivery PIN Code')}</label>
                <Input 
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 4291"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="rounded-xl text-center font-mono text-xl font-bold tracking-widest bg-background/50 border-white/10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setPinModalShipment(null)}>
                  {t('إلغاء', 'Cancel')}
                </Button>
                <Button 
                  disabled={isSubmittingPin}
                  onClick={handleVerifyDeliveryPin}
                  className="flex-1 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmittingPin ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : <CheckCircle className="h-4 w-4 me-1" />}
                  {t('تأكيد وتسليم', 'Verify & Complete')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
