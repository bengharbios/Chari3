'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Package, Search, Filter, Calendar, MapPin, Truck, CheckCircle2, XCircle, Clock, ChevronRight, ChevronLeft, MoreVertical
} from 'lucide-react';

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const MOCK_ORDERS = [
  { id: 'ORD-5839', buyer: 'أحمد محمود', date: '2026-05-25', status: 'pending', total: 12500, items: 3, city: 'الرياض' },
  { id: 'ORD-5840', buyer: 'سارة خالد', date: '2026-05-25', status: 'confirmed', total: 4200, items: 1, city: 'جدة' },
  { id: 'ORD-5841', buyer: 'عمر عبداللّه', date: '2026-05-24', status: 'shipped', total: 8900, items: 2, city: 'الدمام' },
  { id: 'ORD-5842', buyer: 'نورة الدوسري', date: '2026-05-24', status: 'delivered', total: 15600, items: 5, city: 'الرياض' },
  { id: 'ORD-5843', buyer: 'فهد المطيري', date: '2026-05-23', status: 'cancelled', total: 3200, items: 1, city: 'مكة' },
  { id: 'ORD-5844', buyer: 'ياسر القحطاني', date: '2026-05-23', status: 'pending', total: 7800, items: 2, city: 'أبها' },
];

export default function StoreOrdersPage() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const filteredOrders = MOCK_ORDERS.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.buyer.includes(searchTerm)
  );

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
          description={t('تتبع الشحنات، تحديث حالات الطلب، وإدارة المرتجعات.', 'Track shipments, update order statuses, and manage returns.')}
        />
        <div className="flex items-center gap-2">
          <div className="bg-background/50 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/10">
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
              {t('لوحة Kanban', 'Board')}
            </Button>
          </div>
          <Button className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            {t('تصدير التقرير', 'Export Report')}
          </Button>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={FADE_UP} className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          <Input 
            placeholder={t('ابحث برقم الطلب أو اسم العميل...', 'Search by order ID or customer name...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`rounded-xl bg-muted/30 border-transparent focus-visible:ring-primary ${isAr ? 'pr-9' : 'pl-9'}`}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="rounded-xl bg-background/50 w-full md:w-auto">
            <Calendar className="h-4 w-4 me-2" />
            {t('هذا الأسبوع', 'This Week')}
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl shrink-0 bg-background/50">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* View Switcher Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredOrders.map((order, idx) => {
              const st = getStatusConfig(order.status);
              return (
                <Card key={idx} className="border-white/10 bg-background/60 backdrop-blur-xl shadow-lg rounded-3xl overflow-hidden hover:border-primary/30 transition-colors group cursor-pointer">
                  <CardContent className="p-0">
                    <div className="p-5 flex justify-between items-start border-b border-border/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-lg">{order.buyer}</h3>
                          <Badge variant="outline" className={`border ${st.color} bg-transparent`}>
                            {st.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{order.id}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <st.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="p-5 bg-muted/10 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('المجموع', 'Total')}</p>
                        <p className="font-bold text-primary">{order.total.toLocaleString()} {t('د.ج', 'DZD')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('التاريخ', 'Date')}</p>
                        <p className="font-semibold text-sm">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('المنتجات', 'Items')}</p>
                        <p className="font-semibold text-sm">{order.items} {t('عناصر', 'items')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('المدينة', 'City')}</p>
                        <div className="flex items-center gap-1 font-semibold text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {order.city}
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
                <div key={statusKey} className="min-w-[320px] w-[320px] flex-shrink-0 flex flex-col gap-4">
                  <div className={`flex items-center justify-between p-3 rounded-2xl border ${st.color} bg-background/80 backdrop-blur-md`}>
                    <div className="flex items-center gap-2 font-bold">
                      <st.icon className="h-4 w-4" />
                      {st.label}
                    </div>
                    <Badge className="bg-background text-foreground shadow-sm">{columnOrders.length}</Badge>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {columnOrders.map((order, idx) => (
                      <Card key={idx} className="border-white/10 bg-background/60 backdrop-blur-xl shadow-md rounded-2xl cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold">{order.buyer}</p>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">{order.id}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -me-2 -mt-2">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-primary">{order.total.toLocaleString()} {t('د.ج', 'DZD')}</span>
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Package className="h-3 w-3" /> {order.items}
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

    </motion.div>
  );
}
