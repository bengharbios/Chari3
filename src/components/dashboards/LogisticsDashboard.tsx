'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { MOCK_SHIPMENTS, formatCurrency, getShipmentStatusColor, getShipmentStatusText } from '@/lib/mock-data';
import { StatsCard, PageHeader } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Truck, Navigation, MapPin, Phone, CheckCircle,
  Clock, Package, Wallet, Star, ToggleLeft, TrendingUp,
} from 'lucide-react';
import type { ShipmentStatus } from '@/types';

// ============================================
// HELPERS
// ============================================

const t = (locale: 'ar' | 'en', ar: string, en: string) => locale === 'ar' ? ar : en;

const TIMELINE_STEPS: ShipmentStatus[] = [
  'pending',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
];

const TIMELINE_LABELS: Record<string, { ar: string; en: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending' },
  picked_up: { ar: 'تم الاستلام', en: 'Picked Up' },
  in_transit: { ar: 'في الطريق', en: 'In Transit' },
  out_for_delivery: { ar: 'خارج للتسليم', en: 'Out for Delivery' },
  delivered: { ar: 'تم التسليم', en: 'Delivered' },
};

const TIMELINE_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  picked_up: Package,
  in_transit: Truck,
  out_for_delivery: Navigation,
  delivered: CheckCircle,
};

const WEEKLY_EARNINGS = [
  { dayAr: 'السبت', dayEn: 'Sat', amount: 680 },
  { dayAr: 'الأحد', dayEn: 'Sun', amount: 520 },
  { dayAr: 'الاثنين', dayEn: 'Mon', amount: 890 },
  { dayAr: 'الثلاثاء', dayEn: 'Tue', amount: 740 },
  { dayAr: 'الأربعاء', dayEn: 'Wed', amount: 960 },
  { dayAr: 'الخميس', dayEn: 'Thu', amount: 430 },
  { dayAr: 'الجمعة', dayEn: 'Fri', amount: 340 },
];

const MOCK_DELIVERY_HISTORY = [
  { id: 'd-1', date: '2024-03-18', tracking: 'TN-100001', address: 'شارع العليا، حي الروضة، الرياض', time: '14:32', earnings: 45 },
  { id: 'd-2', date: '2024-03-17', tracking: 'TN-099998', address: 'طريق الملك فهد، حي النزهة، جدة', time: '11:15', earnings: 38 },
  { id: 'd-3', date: '2024-03-17', tracking: 'TN-099995', address: 'شارع الأمير سلطان، حي الملز، الرياض', time: '09:45', earnings: 52 },
  { id: 'd-4', date: '2024-03-16', tracking: 'TN-099990', address: 'حي الصفا، الدمام', time: '16:20', earnings: 41 },
  { id: 'd-5', date: '2024-03-16', tracking: 'TN-099985', address: 'شارع التحلية، حي الروضة، الخبر', time: '13:05', earnings: 35 },
];

// ============================================
// COMPONENT
// ============================================

export default function LogisticsDashboard() {
  const { locale } = useAppStore();
  const [isOnline, setIsOnline] = useState(true);

  const isRTL = locale === 'ar';
  const activeShipments = MOCK_SHIPMENTS.filter((s) => s.status !== 'delivered');
  const timelineShipment = MOCK_SHIPMENTS.find((s) => s.status !== 'delivered') ?? MOCK_SHIPMENTS[0];
  const currentStepIndex = TIMELINE_STEPS.indexOf(timelineShipment.status);
  const maxWeeklyEarning = Math.max(...WEEKLY_EARNINGS.map((d) => d.amount));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t(locale, 'لوحة تحكم المندوب', 'Courier Dashboard')}
        description={t(locale, 'إدارة الشحنات والتوصيل', 'Manage shipments & deliveries')}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {t(locale, isOnline ? 'متصل' : 'غير متصل', isOnline ? 'Online' : 'Offline')}
              </span>
              <Switch checked={isOnline} onCheckedChange={setIsOnline} />
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-brand text-navy text-xs font-bold">
                  <Truck className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {t(locale, 'سعد المندوب', 'Saad Courier')}
              </span>
            </div>
          </div>
        }
      />

      {/* Online/Offline Status Banner */}
      <Card className={`card-surface border-2 ${isOnline ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ToggleLeft className={`h-6 w-6 ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            <div>
              <p className="text-sm font-semibold">
                {t(locale, isOnline ? 'الحالة: متصل جاهز لاستقبال الطلبات' : 'الحالة: غير متصل', isOnline ? 'Status: Online — Ready for deliveries' : 'Status: Offline')}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOnline
                  ? t(locale, 'أنت الآن متاح لاستقبال شحنات جديدة', 'You are now available for new shipments')
                  : t(locale, 'لن تتلقى شحنات جديدة وأنت غير متصل', 'You won\'t receive new shipments while offline')}
              </p>
            </div>
          </div>
          <Switch checked={isOnline} onCheckedChange={setIsOnline} />
        </CardContent>
      </Card>

      {/* Courier Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          title={t(locale, 'الشحنات النشطة', 'Active Shipments')}
          value={activeShipments.length}
          change={12}
          icon={<Truck className="h-5 w-5 text-brand" />}
          iconBg="bg-brand/10"
        />
        <StatsCard
          title={t(locale, 'توصيلات اليوم', "Today's Deliveries")}
          value={12}
          change={8}
          icon={<Package className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
        />
        <StatsCard
          title={t(locale, 'إجمالي التوصيلات', 'Total Deliveries')}
          value={345}
          change={15}
          icon={<CheckCircle className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatsCard
          title={t(locale, 'التقييم', 'Rating')}
          value="4.8/5"
          subtitle="⭐"
          icon={<Star className="h-5 w-5 text-yellow-500" />}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
        />
        <StatsCard
          title={t(locale, 'أرباح الشهر', 'Monthly Earnings')}
          value={formatCurrency(4560)}
          change={22}
          icon={<Wallet className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* Map Placeholder + Shipment Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Tracking Map Placeholder */}
        <Card className="card-surface lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-5 w-5 text-brand" />
              {t(locale, 'تتبع مباشر', 'Live Tracking')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-64 md:h-80 gradient-navy rounded-b-lg flex flex-col items-center justify-center gap-4 overflow-hidden">
              {/* Decorative grid lines */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>
              {/* Decorative dots simulating pins */}
              <div className="absolute top-[20%] start-[30%] h-3 w-3 rounded-full bg-brand animate-pulse" />
              <div className="absolute top-[40%] start-[60%] h-2 w-2 rounded-full bg-green-400 animate-pulse delay-500" />
              <div className="absolute top-[60%] start-[45%] h-2 w-2 rounded-full bg-yellow-400 animate-pulse delay-1000" />
              <div className="absolute top-[35%] start-[75%] h-3 w-3 rounded-full bg-brand animate-pulse delay-300" />
              <div className="absolute top-[70%] start-[25%] h-2 w-2 rounded-full bg-cyan-400 animate-pulse delay-700" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full gradient-brand flex items-center justify-center shadow-lg">
                  <Navigation className="h-8 w-8 text-navy" />
                </div>
                <p className="text-white font-semibold text-lg">
                  {t(locale, 'خريطة التتبع المباشر', 'Live Tracking Map')}
                </p>
                <p className="text-white/60 text-sm">
                  {t(locale, `${activeShipments.length} شحنات نشطة حالياً`, `${activeShipments.length} active shipments right now`)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipment Timeline */}
        <Card className="card-surface">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-brand" />
              {t(locale, 'مسار الشحنة', 'Shipment Timeline')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs">
                {timelineShipment.trackingNumber}
              </Badge>
              <Badge className={getShipmentStatusColor(timelineShipment.status)}>
                {getShipmentStatusText(timelineShipment.status)}
              </Badge>
            </div>
            <div className="relative ps-6">
              {/* Vertical line */}
              <div className="absolute start-[11px] top-2 bottom-2 w-0.5 bg-border" />

              {TIMELINE_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const IconComp = TIMELINE_ICONS[step] || Clock;
                const labels = TIMELINE_LABELS[step];

                return (
                  <div key={step} className="relative pb-6 last:pb-0">
                    {/* Dot / Circle */}
                    <div
                      className={`absolute -start-6 top-0.5 h-6 w-6 rounded-full flex items-center justify-center z-10 transition-colors ${
                        isCurrent
                          ? 'bg-brand text-navy ring-4 ring-brand/30'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <IconComp className="h-3 w-3" />
                    </div>
                    {/* Label */}
                    <div className="pt-px">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-brand' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {t(locale, labels.ar, labels.en)}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t(locale, 'الحالة الحالية', 'Current Status')}
                        </p>
                      )}
                      {isCompleted && !isCurrent && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                          {t(locale, 'مكتمل', 'Completed')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Shipments List */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-brand" />
            {t(locale, 'الشحنات النشطة', 'Active Shipments')}
            <Badge variant="secondary" className="ms-auto">{activeShipments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
              {activeShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  {/* Top row: tracking + status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-semibold">{shipment.trackingNumber}</span>
                    <Badge className={`text-xs ${getShipmentStatusColor(shipment.status)}`}>
                      {getShipmentStatusText(shipment.status)}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Delivery address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      {shipment.deliveryAddress}
                    </span>
                  </div>

                  {/* Order info */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t(locale, 'الطلب', 'Order')}: <span className="font-medium text-foreground">{shipment.order.orderNumber}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(locale, 'المشتري', 'Buyer')}: <span className="font-medium text-foreground">{shipment.order.buyer.name}</span>
                    </p>
                    {shipment.estimatedDelivery && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {t(locale, 'التسليم المتوقع', 'Est. delivery')}: {new Date(shipment.estimatedDelivery).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs">
                      <Navigation className="h-3.5 w-3.5" />
                      {t(locale, 'اتجاهات', 'Navigate')}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 text-xs">
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" className="flex-1 gap-1 text-xs gradient-brand text-navy hover:opacity-90">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {t(locale, 'تم التسليم', 'Delivered')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Summary */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="card-surface overflow-hidden">
            <CardContent className="p-0">
              <div className="gradient-brand p-6 text-navy text-center">
                <Wallet className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium opacity-80">{t(locale, 'إجمالي الأرباح', 'Total Earnings')}</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(4560)}</p>
                <p className="text-xs mt-1 opacity-70">{t(locale, 'هذا الشهر', 'This Month')}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            <Card className="card-surface">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t(locale, 'أرباح الأسبوع', 'This Week')}</p>
                  <p className="text-lg font-bold">{formatCurrency(1240)}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </CardContent>
            </Card>
            <Card className="card-surface">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t(locale, 'متوسط الأرباح لكل توصيلة', 'Avg. per Delivery')}</p>
                  <p className="text-lg font-bold">{formatCurrency(42)}</p>
                </div>
                <Star className="h-5 w-5 text-yellow-500" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Earnings Bar Chart */}
        <Card className="card-surface lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-brand" />
              {t(locale, 'أرباح الأسبوع', 'Weekly Earnings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 md:gap-4 h-48 md:h-56">
              {WEEKLY_EARNINGS.map((day) => {
                const heightPercent = maxWeeklyEarning > 0 ? (day.amount / maxWeeklyEarning) * 100 : 0;
                return (
                  <div key={day.dayEn} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-medium text-muted-foreground">{day.amount}</span>
                    <div className="w-full max-w-[40px] relative group">
                      <div
                        className="w-full rounded-t-md gradient-brand transition-all duration-500 ease-out"
                        style={{ height: `${heightPercent * 0.75}%`, minHeight: '8px' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t(locale, day.dayAr, day.dayEn)}
                    </span>
                  </div>
                );
              })}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t(locale, 'إجمالي الأسبوع', 'Weekly Total')}
              </span>
              <span className="font-bold">{formatCurrency(4560)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery History Table */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t(locale, 'سجل التوصيلات', 'Delivery History')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(locale, 'التاريخ', 'Date')}</TableHead>
                  <TableHead>{t(locale, 'رقم التتبع', 'Tracking #')}</TableHead>
                  <TableHead>{t(locale, 'العنوان', 'Address')}</TableHead>
                  <TableHead>{t(locale, 'وقت التسليم', 'Delivery Time')}</TableHead>
                  <TableHead className="text-end">{t(locale, 'الأرباح', 'Earnings')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_DELIVERY_HISTORY.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(delivery.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{delivery.tracking}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[280px]">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">{delivery.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {delivery.time}
                      </div>
                    </TableCell>
                    <TableCell className="text-end">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(delivery.earnings)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
