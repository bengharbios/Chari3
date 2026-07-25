'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Printer, Download, RefreshCw, CheckCircle, Package } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ManifestsPage() {
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [manifests, setManifests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchManifests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/logistics/dashboard');
      const json = await res.json();
      if (json.success && json.data.shipments) {
        setManifests(json.data.shipments);
      }
    } catch {
      toast.error(t('خطأ في تحميل المنافيست', 'Failed to load manifests'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManifests();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 text-start">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">{t('منافيست الشحن والبوالص الحرارية', 'Shipment Manifests & Thermal Waybills')}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t('طباعة بوالص الشحن الحرارية وتصدير المنافيست اليومي لجميع الشحنات المسلمة', 'Print thermal waybills & export daily shipment manifests')}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchManifests} className="rounded-xl font-bold">
              <RefreshCw className="h-4 w-4 me-1.5" />
              {t('تحديث', 'Refresh')}
            </Button>
            <Button size="sm" className="rounded-xl font-bold bg-primary text-primary-foreground gap-1.5" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {t('طباعة الكل', 'Print All Manifests')}
            </Button>
          </div>
        </div>

        <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {t('قائمة شحنات المنافيست المجهزة', 'Prepared Shipment Manifests')}
            </CardTitle>
            <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20">
              {manifests.length} {t('شحنة', 'Items')}
            </Badge>
          </CardHeader>

          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/50">
                <TableHead>{t('رقم الشحنة', 'Tracking #')}</TableHead>
                <TableHead>{t('الزبون والعنوان', 'Recipient & Address')}</TableHead>
                <TableHead className="text-center">{t('الولاية', 'Wilaya')}</TableHead>
                <TableHead className="text-center">{t('مبلغ COD', 'COD Total')}</TableHead>
                <TableHead className="text-end">{t('البوليصة الحرارية', 'Waybill Action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifests.map((m: any) => (
                <TableRow key={m.id} className="border-border/50">
                  <TableCell className="font-mono font-bold text-primary">{m.trackingNumber}</TableCell>
                  <TableCell>
                    <p className="font-bold text-sm">{m.recipientName}</p>
                    <p className="text-xs text-muted-foreground">{m.address}</p>
                  </TableCell>
                  <TableCell className="text-center font-bold">{m.city}</TableCell>
                  <TableCell className="text-center font-bold text-emerald-500 font-mono">{m.codAmount?.toLocaleString()} DZD</TableCell>
                  <TableCell className="text-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl text-xs font-bold gap-1.5"
                      onClick={() => {
                        const waybillUrl = `/api/seller/shipping/waybill?orderId=${m.orderId}&lang=${locale}`;
                        window.open(waybillUrl, '_blank', 'width=650,height=800');
                      }}
                    >
                      <Printer className="h-3.5 w-3.5 text-primary" />
                      {t('طباعة A6', 'Print A6 Waybill')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
