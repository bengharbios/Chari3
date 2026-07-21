'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Truck, Key, Printer, Search, RefreshCw, Loader2, CheckCircle2, ShieldCheck, FileText, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function SellerShippingPage() {
  const { user } = useAuthStore();
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [manifests, setManifests] = useState<any[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('yalidine');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiTokenInput, setApiTokenInput] = useState<string>('');
  const [isSavingKeys, setIsSavingKeys] = useState(false);

  const fetchData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [intRes, manRes] = await Promise.all([
        fetch(`/api/seller/shipping/integrations?sellerId=${user.id}`),
        fetch(`/api/seller/shipping/manifests?sellerId=${user.id}`),
      ]);

      const intData = await intRes.json();
      const manData = await manRes.json();

      if (intData.success) setIntegrations(intData.integrations || []);
      if (manData.success) setManifests(manData.manifests || []);
    } catch (e) {
      console.error(e);
      toast.error(isAr ? 'فشل تحميل بيانات الشحن' : 'Failed to load shipping data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleSaveCarrierKeys = async () => {
    if (!user?.id || !apiKeyInput.trim()) {
      toast.error(isAr ? 'يرجى كتابة مفتاح API Key الخاص بشركة الشحن' : 'Please enter carrier API Key');
      return;
    }
    setIsSavingKeys(true);
    try {
      const res = await fetch('/api/seller/shipping/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user.id,
          carrierKey: selectedCarrier,
          carrierName: selectedCarrier.toUpperCase(),
          keys: { apiKey: apiKeyInput, apiToken: apiTokenInput },
          isActive: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isAr ? 'تم حفظ وتشفير مفاتيح شركة الشحن بنجاح 🔒' : 'Carrier keys encrypted and saved successfully 🔒');
        setApiKeyInput('');
        setApiTokenInput('');
        fetchData();
      } else {
        toast.error(data.error || 'فشل الحفظ');
      }
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSavingKeys(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-foreground">
            <Truck className="h-7 w-7 text-primary" />
            {isAr ? 'مركز الشحن واللوجستيات وطباعة البوالص' : 'Shipping & Logistics Hub'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr 
              ? 'ربط شركات التوصيل بمفاتيحك الخاصة، طباعة البوالص الحرارية (10x15cm)، والتتبع اللحظي للطرود.'
              : 'Connect custom carrier API keys, print thermal waybill labels (10x15cm), and track packages live.'}
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          {isAr ? 'تحديث البيانات' : 'Refresh Data'}
        </Button>
      </div>

      {/* Grid: Carrier Setup & Thermal Labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Carrier API Key Entry */}
        <Card className="border-border bg-card shadow-lg rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {isAr ? 'ربط مفاتيح شركة الشحن الخاصة بك' : 'Connect Direct Carrier API Keys'}
            </CardTitle>
            <CardDescription>
              {isAr 
                ? 'أدخل مفاتيح حسابك الخاص المبرم مع شركة الشحن لتصدر البوالص باسمك مباشرة.'
                : 'Enter your direct contract carrier credentials for automated label generation.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">{isAr ? 'اختر شركة الشحن' : 'Select Carrier'}</Label>
              <select
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="yalidine">Yalidine Delivery (ياليدين)</option>
                <option value="zr_express">ZR Express (زد آر إكسبريس)</option>
                <option value="maystro">Maystro Delivery (مايسترو)</option>
                <option value="ecotrack">EcoTrack (إيكوتراك)</option>
                <option value="chariday_express">ChariDay Express (الأسطول الخاص)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{isAr ? 'مفتاح API Key' : 'API Key'}</Label>
              <Input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="e.g. yal_api_key_xxxxxxxx"
                className="bg-background rounded-xl h-10 text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{isAr ? 'رمز API Token (اختياري)' : 'API Token (Optional)'}</Label>
              <Input
                type="password"
                value={apiTokenInput}
                onChange={(e) => setApiTokenInput(e.target.value)}
                placeholder="e.g. yal_token_xxxxxxxx"
                className="bg-background rounded-xl h-10 text-xs font-mono"
              />
            </div>

            <Button
              onClick={handleSaveCarrierKeys}
              disabled={isSavingKeys}
              className="w-full rounded-xl text-xs font-bold gap-2"
            >
              {isSavingKeys ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {isAr ? 'حفظ وتشفير المفاتيح 🔒' : 'Save & Encrypt Keys 🔒'}
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Bulk Thermal Label Printing Info */}
        <Card className="border-border bg-card shadow-lg rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              {isAr ? 'طباعة البوالص الحرارية (Thermal Labels)' : 'Thermal Shipping Label Printing'}
            </CardTitle>
            <CardDescription>
              {isAr 
                ? 'توليد البوالص بمقاس (10x15cm) المزودة برمز الباركود ومبلغ التحصيل COD.'
                : 'Generate standardized 10x15cm thermal labels with QR barcode & COD amount.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/40 border border-border rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-bold text-xs">{isAr ? 'طابعات الحرارة المعتمدة:' : 'Compatible Printers:'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Zebra, Xprinter, Honeywell, Dymo (10x15cm Thermal Label Paper)
              </p>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-bold text-xs">{isAr ? 'التحديث الآلي للحالة:' : 'Automated Status Sync:'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isAr 
                  ? 'بمجرد طباعة البوليصة وتسليمها للناقل، يتحدث التتبع آلياً وتُحرر الأموال في محفظتك.'
                  : 'Automated status sync releases escrow funds once delivery is verified.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Manifests & Tracking Table */}
      <Card className="border-border bg-card shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {isAr ? 'جدول الطرود المشحونة والتتبع اللحظي' : 'Live Shipment Manifests & Tracking'}
          </CardTitle>
          <CardDescription>
            {isAr 
              ? 'سجل شحناتك الحية ومتابعة حالة التوصيل مع البوالص الجاهزة للطباعة.'
              : 'Real-time list of your active manifests, tracking numbers, and thermal slips.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {manifests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              {isAr ? 'لا توجد شحنات مسجلة بعد. قم بشحن أحدث طلباتك لبدء التتبع!' : 'No manifests generated yet. Ship your orders to start tracking!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="p-3">{isAr ? 'رقم التتبع' : 'Tracking No.'}</th>
                    <th className="p-3">{isAr ? 'شركة الشحن' : 'Carrier'}</th>
                    <th className="p-3">{isAr ? 'نوع التوصيل' : 'Delivery'}</th>
                    <th className="p-3">{isAr ? 'مبلغ التحصيل' : 'COD Amount'}</th>
                    <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="p-3 text-end">{isAr ? 'البوليصة' : 'Waybill'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {manifests.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-all">
                      <td className="p-3 font-mono font-bold text-primary">{m.trackingNumber}</td>
                      <td className="p-3 font-bold">{m.carrierName}</td>
                      <td className="p-3">{m.deliveryType === 'home' ? (isAr ? 'للمنزل 🏠' : 'Home') : (isAr ? 'للمكتب 🏢' : 'StopDesk')}</td>
                      <td className="p-3 font-bold">{m.expectedAmount} DZD</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {m.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-end">
                        {m.waybillUrl && (
                          <Button 
                            onClick={() => window.open(m.waybillUrl, '_blank')} 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs gap-1 font-bold text-primary"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            {isAr ? 'طباعة' : 'Print'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
