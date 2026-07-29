'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, Receipt, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';

export default function DeliveryHistoryPage() {
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/logistics/dashboard')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data.archivedToday) {
          setHistory(json.data.archivedToday);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 text-start">
      <div>
        <h1 className="text-2xl font-black">{t('سجل التوصيل والتحصيل المالي (COD History)', 'Delivery & COD Collection History')}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {t('أرشيف كامل لجميع التوصيلات السابقة والمبالغ المحصلة عند التسليم', 'Full log of completed deliveries and cash collected on delivery')}
        </p>
      </div>

      <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/50">
              <TableHead>{t('رقم الشحنة', 'Tracking #')}</TableHead>
              <TableHead>{t('المستلم والعنوان', 'Recipient & Address')}</TableHead>
              <TableHead className="text-center">{t('تاريخ التوصيل', 'Date')}</TableHead>
              <TableHead className="text-center">{t('المبلغ المحصل (COD)', 'COD Amount')}</TableHead>
              <TableHead className="text-center">{t('عمولة التوصيل', 'Earned Fee')}</TableHead>
              <TableHead className="text-end">{t('الحالة', 'Status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((h: any) => (
              <TableRow key={h.id} className="border-border/50">
                <TableCell className="font-mono font-bold text-primary">{h.trackingNumber}</TableCell>
                <TableCell>
                  <p className="font-bold text-sm">{h.recipientName}</p>
                  <p className="text-xs text-muted-foreground">{h.address}</p>
                </TableCell>
                <TableCell className="text-center font-mono text-xs">{h.date}</TableCell>
                <TableCell className="text-center font-bold text-emerald-500 font-mono">{h.codAmount?.toLocaleString()} DZD</TableCell>
                <TableCell className="text-center font-bold font-mono">+{h.shippingFee?.toLocaleString()} DZD</TableCell>
                <TableCell className="text-end">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <CheckCircle className="h-3 w-3 me-1" />
                    {t('مكتمل ومحصل', 'Completed')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
