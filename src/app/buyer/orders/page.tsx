'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Search, Loader2, Package, ChevronLeft, ChevronRight, XCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isToday } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function BuyerOrdersPage() {
  const router = useRouter();
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('3months');

  const t = (arText: string, enText: string) => (isRTL ? arText : enText);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/buyer/orders?filter=${filter}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
        setIsLoading(false);
      });
  }, [filter]);

  const getOrderStatusText = (status: string) => {
    switch(status) {
      case 'pending': return { text: t('قيد المعالجة', 'Processing'), color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'shipped': return { text: t('تم الإرسال', 'Shipped'), color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'delivered': return { text: t('تم التسليم', 'Delivered'), color: 'text-green-600', bg: 'bg-green-50' };
      case 'cancelled': return { text: t('مكتمل', 'Completed'), color: 'text-gray-600', bg: 'bg-gray-100' };
      default: return { text: t('قيد المعالجة', 'Processing'), color: 'text-blue-600', bg: 'bg-blue-50' };
    }
  };

  const getFormatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isToday(d)) {
      return t('اليوم, ', 'Today, ') + format(d, 'hh:mm a');
    }
    return format(d, 'dd MMMM yyyy', isRTL ? { locale: ar } : undefined);
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.items.some((i: any) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black font-cairo">{t('الطلبات', 'Orders')}</h1>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('البحث عن المنتجات أو رقم الطلب', 'Search products or order ID')}
            className="ps-10 h-12 rounded-xl bg-white"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-white">
            <SelectValue placeholder={t('تصفية', 'Filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">{t('آخر ٣ أشهر', 'Last 3 months')}</SelectItem>
            <SelectItem value="6months">{t('آخر ٦ أشهر', 'Last 6 months')}</SelectItem>
            <SelectItem value="all">{t('جميع الطلبات', 'All Orders')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed">
          <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg font-bold">{t('لا توجد طلبات', 'No orders found')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusInfo = getOrderStatusText(order.status);
            
            return (
              <Card 
                key={order.id} 
                className="overflow-hidden hover:border-brand/40 transition-colors cursor-pointer rounded-2xl shadow-sm"
                onClick={() => router.push(`/buyer/orders/${order.id}`)}
              >
                <div className={`p-4 border-b flex justify-between items-center ${statusInfo.bg}`}>
                  <div>
                    <div className={`font-black text-lg ${statusInfo.color}`}>{statusInfo.text}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      ({order.items.length} {t('منتجات', 'items')})
                    </div>
                  </div>
                  <div className="text-end">
                    {order.status === 'pending' || order.status === 'shipped' ? (
                      <div className="font-bold text-sm text-foreground">
                        {t('التسليم المتوقع:', 'Expected Delivery:')} <br/>
                        <span className="text-brand">{t('خلال 2-5 أيام', 'In 2-5 days')}</span>
                      </div>
                    ) : order.status === 'cancelled' ? (
                      <div className="font-bold text-sm text-gray-500">
                        {t('الطلب مُلغى', 'Order Cancelled')}
                      </div>
                    ) : (
                      <div className="font-bold text-sm text-green-600">
                        {t('تم التوصيل', 'Delivered')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-start pb-4 border-b last:border-0 last:pb-0">
                      <div className="size-20 rounded-xl bg-muted shrink-0 border relative overflow-hidden">
                        {item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}
                        {item.status === 'cancelled' && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        {item.status === 'cancelled' ? (
                          <Badge variant="secondary" className="mb-1 text-[10px] bg-gray-100 text-gray-600 border-gray-200">
                            {t('تم الإلغاء ', 'Cancelled ')} {item.cancelledAt ? getFormatDate(item.cancelledAt) : ''}
                          </Badge>
                        ) : order.status === 'pending' ? (
                          <Badge variant="outline" className="mb-1 text-[10px] text-blue-600 border-blue-200 bg-blue-50">
                            {t('مؤكد على الوقت', 'Confirmed on time')}
                          </Badge>
                        ) : null}
                        
                        <h4 className={`font-bold text-sm line-clamp-2 leading-tight ${item.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-foreground'}`}>
                          {item.productName}
                        </h4>
                        <div className={`font-black text-sm mt-2 ${item.status === 'cancelled' ? 'text-gray-400' : 'text-brand'}`}>
                          {item.price.toFixed(2)} د.إ
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {t('معرّف الطلب ', 'Order ID ')}{order.orderNumber}
                        </div>
                      </div>
                      <div className="hidden sm:flex text-muted-foreground items-center justify-center h-20">
                        {isRTL ? <ChevronLeft className="h-5 w-5 opacity-30" /> : <ChevronRight className="h-5 w-5 opacity-30" />}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
