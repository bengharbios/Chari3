'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowDownRight, TrendingUp, CreditCard, RefreshCw } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function DriverEarningsPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [walletBalance, setWalletBalance] = useState(28500);

  return (
    <DashboardLayout>
      <div className="space-y-6 text-start">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">{t('محفظة السائق وأرباح التوصيل', 'Driver Wallet & Earnings')}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t('متابعة رصيد العمولات المحصلة، السحوبات المالية لـ CCP/BaridiMob، والسداد', 'Track COD commission balance, CCP/BaridiMob payouts & withdrawals')}
            </p>
          </div>

          <Button className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => toast.success(t('تم تقديم طلب سحب الأرباح إلى BaridiMob/CCP بنجاح', 'Payout request submitted to BaridiMob/CCP'))}>
            <ArrowDownRight className="h-4 w-4" />
            {t('طلب سحب الأرباح (BaridiMob / CCP)', 'Request Payout (BaridiMob/CCP)')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl p-5">
            <p className="text-xs font-medium text-muted-foreground">{t('الرصيد المتاح للسحب', 'Available Wallet Balance')}</p>
            <p className="text-3xl font-black text-emerald-500 mt-2 font-mono">{walletBalance.toLocaleString()} DZD</p>
            <p className="text-[11px] text-muted-foreground mt-2">{t('متاح للسحب الفوري عبر بريدي موب', 'Available for instant BaridiMob withdrawal')}</p>
          </Card>

          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl p-5">
            <p className="text-xs font-medium text-muted-foreground">{t('إجمالي عوائد الشهر الحالي', 'Monthly Total Earnings')}</p>
            <p className="text-3xl font-black text-blue-500 mt-2 font-mono">148,200 DZD</p>
            <p className="text-[11px] text-muted-foreground mt-2">{t('يشمل 345 عملية توصيل ناجحة', 'From 345 successful deliveries')}</p>
          </Card>

          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl p-5">
            <p className="text-xs font-medium text-muted-foreground">{t('عمولة التوصيل لكل طلب', 'Average Commission Per Delivery')}</p>
            <p className="text-3xl font-black text-purple-500 mt-2 font-mono">430 DZD</p>
            <p className="text-[11px] text-muted-foreground mt-2">{t('عمولة ثابتة + مكافأة قطع المسافات', 'Fixed fee + mileage bonus')}</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
