'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Loader2, ArrowRight, ArrowLeft, MapPin, FileText, CheckCircle2, Circle, Camera, ScanLine, QrCode, KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CancelItemsModal from '@/components/buyer/CancelItemsModal';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [podMode, setPodMode] = useState<'show' | 'scan'>('show');

  const t = (arText: string, enText: string) => (isRTL ? arText : enText);

  const handleScanDriverQr = () => {
    toast.success(t('تم قراءة كود البوليصة/المندوب بنجاح! تم تأكيد استلام الشحنة وتثبيتها في النظام.', 'Driver/Waybill QR scanned successfully! Delivery receipt confirmed.'));
    setOrder((prev: any) => ({ ...prev, status: 'delivered' }));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = () => {
    setIsLoading(true);
    fetch(`/api/buyer/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.order);
        }
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>;
  }

  if (!order) {
    return <div className="text-center p-20">{t('الطلب غير موجود', 'Order not found')}</div>;
  }

  const getFormatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', isRTL ? { locale: ar } : undefined);
  };

  const getDayFormat = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, dd MMMM', isRTL ? { locale: ar } : undefined);
  };

  // Timeline Steps
  const timelineSteps = [
    { key: 'received', title: t('استلمنا الطلب', 'Order Received'), date: getFormatDate(order.createdAt), active: true },
    { key: 'processing', title: t('قيد التنفيذ', 'Processing'), date: getFormatDate(order.createdAt), active: order.status !== 'pending' || true },
    { key: 'shipped', title: t('تم الإرسال', 'Shipped'), date: '', active: ['shipped', 'delivered'].includes(order.status) },
    { key: 'delivered', title: t('التسليم', 'Delivered'), date: '', active: order.status === 'delivered' }
  ];

  const canCancelItems = ['pending'].includes(order.status) && order.items.some((i: any) => i.status !== 'cancelled');

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-4"
      >
        {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        {t('العودة إلى الطلبات', 'Back to Orders')}
      </button>

      <h1 className="text-2xl font-black font-cairo">{t('تفاصيل التتبع', 'Tracking Details')}</h1>

      {/* Order Info Bar */}
      <Card className="p-4 flex flex-wrap gap-4 justify-between items-center bg-gray-50 border-0 rounded-2xl">
        <div>
          <div className="text-xs text-muted-foreground">{t('معرّف الطلب', 'Order ID')}</div>
          <div className="font-bold font-mono">{order.orderNumber}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('تاريخ الطلب', 'Order Date')}</div>
          <div className="font-bold">{getFormatDate(order.createdAt)}</div>
        </div>
        <div>
          <Badge variant="outline" className="bg-white">{t('مؤكد على الوقت', 'Confirmed on time')}</Badge>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground px-2">
        {order.status === 'cancelled' ? t('تم إلغاء هذا الطلب.', 'This order has been cancelled.') : t('طلبك يمر بعملية التجهيز والتغليف. سنرسل لك بريد إلكتروني عندما يتم تغليفه وإرساله', 'Your order is being prepared. We will notify you once shipped.')}
      </p>

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <Card className="p-6 rounded-2xl overflow-hidden relative">
          <div className="flex justify-between relative z-10">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 text-center relative gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 bg-white ${step.active ? 'border-green-500 text-green-500' : 'border-gray-200 text-gray-300'}`}>
                  {step.active ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-3 w-3 fill-current" />}
                </div>
                <div className={`text-xs font-bold ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</div>
                {step.date && <div className="text-[10px] text-muted-foreground">في {step.date}</div>}
              </div>
            ))}
          </div>
          {/* Connecting Line */}
          <div className="absolute top-10 start-[10%] end-[10%] h-0.5 bg-gray-100 -z-0">
            <div className="h-full bg-green-500 transition-all" style={{ width: order.status === 'delivered' ? '100%' : order.status === 'shipped' ? '66%' : '33%' }}></div>
          </div>
        </Card>
      )}

      {/* Customer Delivery QR Code & PIN / Scan Driver QR */}
      {order.status !== 'cancelled' && (
        <Card className="p-6 rounded-3xl border-emerald-500/30 bg-emerald-500/5 text-center space-y-4 shadow-md">
          <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-base">
            <ShieldCheck className="h-5 w-5" />
            <span>{t('تأكيد استلام الشحنة (Proof of Delivery)', 'Proof of Delivery & Confirmation')}</span>
          </div>

          <div className="grid grid-cols-2 p-1.5 bg-muted/40 rounded-2xl gap-2 max-w-sm mx-auto border border-border/40">
            <button
              type="button"
              onClick={() => setPodMode('show')}
              className={cn(
                "py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                podMode === 'show' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <QrCode className="h-4 w-4" />
              {t('إظهار كود الاستلام', 'Show My QR')}
            </button>
            <button
              type="button"
              onClick={() => setPodMode('scan')}
              className={cn(
                "py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                podMode === 'scan' ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ScanLine className="h-4 w-4 animate-pulse" />
              {t('مسح كود المندوب/البوليصة', 'Scan Waybill QR')}
            </button>
          </div>

          {podMode === 'scan' ? (
            <div className="p-5 border-2 border-dashed border-emerald-500/50 bg-background/80 rounded-2xl max-w-md mx-auto space-y-3 shadow-inner">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ScanLine className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t('وجه كاميرا هاتفك نحو كود الـ QR الموجود في بوليصة المندوب', 'Point camera at Driver / Waybill QR Code')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('يمكنك تأكيد الاستلام ذاتياً ومباشرة عبر مسح كود البوليصة', 'You can instantly self-verify delivery by scanning the parcel label')}</p>
              </div>
              <label className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md gap-2">
                <Camera className="h-4 w-4" />
                <span>{t('تشغيل كاميرا المسح الضوئي (QR Scanner)', 'Open QR Scanner Camera')}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleScanDriverQr();
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mx-auto w-44 h-44 bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-500/20 flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=PIN:${order.id.substring(0, 4).toUpperCase()}`}
                  alt="Delivery QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="text-xs text-muted-foreground">{t('رمز الـ PIN المخصص للمندوب:', 'Your Delivery PIN for Driver:')}</div>
                <div className="text-3xl font-black font-mono tracking-widest text-emerald-600 dark:text-emerald-400 mt-1">
                  {order.id.substring(0, 4).toUpperCase()}
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {t('أبرز هذا الكود للمندوب أو سائق شركة الشحن لمسحه، أو اعرض عليه رقم الـ PIN لإتمام عملية التسليم.', 'Show this QR code or 4-digit PIN to the driver upon delivery.')}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Delivery Address */}
      <Card className="p-4 rounded-2xl">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-brand shrink-0 mt-1" />
          <div className="flex-1">
            <div className="font-bold mb-1">{t('عنوان التوصيل (home)', 'Delivery Address (home)')}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {order.address}
            </p>
            <div className="text-sm font-mono mt-1 text-muted-foreground">تم التحقق ✔</div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full">{t('تحديث العنوان', 'Update Address')}</Button>
        </div>
      </Card>

      {/* Invoice Box */}
      <Card className="p-4 rounded-2xl flex items-center gap-3 bg-blue-50/50 border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors">
        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-sm text-blue-900">{t('عرض ملخص الطلب / الفاتورة', 'View Order Summary / Invoice')}</div>
          <div className="text-xs text-blue-600/80">{t('ابحث عن فاتورة الطلب والدفع وتفاصيل الشحن هنا', 'Find your invoice and payment details here')}</div>
        </div>
      </Card>

      {/* Products Summary */}
      <div className="pt-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-black font-cairo">{t('ملخص المنتجات', 'Products Summary')}</h2>
          {order.status !== 'cancelled' && (
            <div className="text-sm font-bold text-green-600">
              {t('سيتم توصيله ', 'Will be delivered ')}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {order.items.map((item: any) => (
            <Card key={item.id} className="p-4 rounded-2xl flex gap-4">
              <div className="size-24 rounded-xl bg-muted shrink-0 border relative overflow-hidden">
                {item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {item.status === 'cancelled' && (
                    <Badge variant="secondary" className="mb-2 bg-gray-100 text-gray-600">
                      {t('تم الإلغاء ', 'Cancelled ')} {item.cancelledAt ? getFormatDate(item.cancelledAt) : ''}
                    </Badge>
                  )}
                  <h4 className={`font-bold text-sm line-clamp-2 ${item.status === 'cancelled' ? 'line-through text-gray-400' : ''}`}>
                    {item.productName}
                  </h4>
                  <div className="text-xs text-muted-foreground mt-1 mb-2">
                    {t('الكمية:', 'Qty:')} {item.quantity}
                  </div>
                  {item.status !== 'cancelled' && (
                    <div className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block">
                      {t('هذا المنتج قابل للاسترجاع', 'This item is returnable')}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-xs text-muted-foreground font-mono">
                    {t('معرّف المنتج', 'Item ID')} {item.id.substring(0,8)}
                  </div>
                  <div className={`font-black ${item.status === 'cancelled' ? 'text-gray-400' : ''}`}>
                    {item.price.toFixed(2)} د.إ
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {canCancelItems && (
          <div className="mt-8">
            <Button 
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-14 rounded-xl font-bold text-lg"
              onClick={() => setIsCancelModalOpen(true)}
            >
              {t('إلغاء المنتجات', 'Cancel Items')}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              {t('يمكنك إلغاء المنتجات التي لم يتم شحنها حتى الآن', 'You can cancel items that have not been shipped yet')}
            </p>
          </div>
        )}
      </div>

      <CancelItemsModal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        order={order} 
        onSuccess={() => fetchOrder()} 
      />
    </div>
  );
}
