'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Truck, Key, Printer, Search, RefreshCw, Loader2, CheckCircle2, 
  ShieldCheck, FileText, Globe, AlertTriangle, Info, Package, Navigation, Wallet, Clock 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function SellerShippingPage() {
  const { user } = useAuthStore();
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [modeSettings, setModeSettings] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [manifests, setManifests] = useState<any[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('yalidine');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiTokenInput, setApiTokenInput] = useState<string>('');
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('shipments');

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

      if (intData.success) {
        setIntegrations(intData.integrations || []);
        if (intData.modeSettings) setModeSettings(intData.modeSettings);
      }
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

  const activeMode = modeSettings?.activeMode || 'hybrid';

  // Stats calculation
  const totalManifests = manifests.length;
  const inTransitCount = manifests.filter((m) => m.status === 'IN_TRANSIT' || m.status === 'PREPARATION').length;
  const deliveredCount = manifests.filter((m) => m.status === 'DELIVERED').length;
  const totalCodExpected = manifests.reduce((sum, m) => sum + (Number(m.expectedAmount) || 0), 0);

  // Filtered manifests
  const filteredManifests = manifests.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.trackingNumber && m.trackingNumber.toLowerCase().includes(term)) ||
      (m.orderId && m.orderId.toLowerCase().includes(term)) ||
      (m.carrierName && m.carrierName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-start">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-foreground">
            <Truck className="h-7 w-7 text-primary" />
            {isAr ? 'مركز الشحن واللوجستيات وطباعة البوالص' : 'Shipping & Logistics Hub'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr 
              ? 'متابعة الطرود المشحونة، التتبع اللحظي، طباعة البوالص الحرارية، وإدارة شركات التوصيل.'
              : 'Track live shipments, print thermal waybills, and manage logistics integrations.'}
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 font-bold">
          <RefreshCw className="h-3.5 w-3.5" />
          {isAr ? 'تحديث البيانات' : 'Refresh Data'}
        </Button>
      </div>

      {/* Dynamic Governance Banner from Super Admin */}
      {activeMode === 'direct_keys_only' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-amber-500">{isAr ? 'تنبيه تشغيلي من إدارة المنصة: وضع المفاتيح المباشرة فقط' : 'Platform Notice: Direct Keys Only Mode Enforced'}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isAr ? 'تفرض إدارة المنصة استخدام عقود ومفاتيح API المباشرة الخاصة بكل تاجر مع شركات الشحن لإصدار البوالص.' : 'Super Admin requires merchants to connect their own direct carrier API credentials to process shipping.'}
            </p>
          </div>
        </div>
      )}

      {/* 📊 High-Level Logistics Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">{isAr ? 'إجمالي الشحنات' : 'Total Shipments'}</p>
              <h3 className="text-xl font-black text-foreground mt-0.5">{totalManifests}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">{isAr ? 'قيد التوصيل' : 'In Transit'}</p>
              <h3 className="text-xl font-black text-blue-500 mt-0.5">{inTransitCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">{isAr ? 'تم التسليم' : 'Delivered'}</p>
              <h3 className="text-xl font-black text-green-500 mt-0.5">{deliveredCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">{isAr ? 'مبالغ COD المتوقعة' : 'Expected COD'}</p>
              <h3 className="text-lg font-black text-amber-500 mt-0.5">{totalCodExpected.toLocaleString()} <span className="text-xs">د.ج</span></h3>
            </div>
          </div>
        </Card>
      </div>

      {/* 🧭 Organised Navigation Tabs */}
      <Tabs defaultValue="shipments" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[600px] h-12 p-1 bg-muted rounded-2xl mb-6">
          <TabsTrigger value="shipments" className="rounded-xl text-xs font-bold gap-1.5">
            <Package className="h-4 w-4" />
            {isAr ? 'الطرود المشحونة والتتبع' : 'Live Shipments'}
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-xl text-xs font-bold gap-1.5">
            <Key className="h-4 w-4" />
            {isAr ? 'مفاتيح شركات الشحن' : 'Carrier API Keys'}
          </TabsTrigger>
          <TabsTrigger value="guide" className="rounded-xl text-xs font-bold gap-1.5">
            <Printer className="h-4 w-4" />
            {isAr ? 'البوالص والطابعات' : 'Thermal Waybills'}
          </TabsTrigger>
        </TabsList>

        {/* 📦 TAB 1: Live Shipments Table (Prominent Top Position) */}
        <TabsContent value="shipments" className="space-y-4">
          <Card className="rounded-3xl border border-border shadow-sm">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {isAr ? 'جدول الطرود المشحونة والتتبع اللحظي' : 'Live Shipment Manifests & Tracking'}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {isAr ? 'سجل شحناتك الحية ومتابعة حالة التوصيل مع البوالص الجاهزة للطباعة بنقرة واحدة.' : 'Track your live shipments and print standardized waybills.'}
                </CardDescription>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isAr ? 'بحث برقم التتبع أو الطلب...' : 'Search by tracking or order...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 rounded-xl text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {filteredManifests.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm font-bold">{isAr ? 'لا توجد شحنات مسجلة بعد' : 'No shipments recorded yet'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAr ? 'قم بشحن أحدث طلباتك من لوحة التاجر لبدء التتبع اللحظي وطباعة البوالص!' : 'Ship orders from your merchant dashboard to generate manifests.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-xs text-start">
                  <thead className="bg-muted/50 border-b border-border font-bold text-muted-foreground">
                    <tr>
                      <th className="p-3 text-start">{isAr ? 'رقم التتبع' : 'Tracking Code'}</th>
                      <th className="p-3 text-start">{isAr ? 'شركة الشحن' : 'Carrier'}</th>
                      <th className="p-3 text-start">{isAr ? 'نوع التوصيل' : 'Delivery'}</th>
                      <th className="p-3 text-start">{isAr ? 'المبلغ (COD)' : 'COD Amount'}</th>
                      <th className="p-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="p-3 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredManifests.map((man) => (
                      <tr key={man.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-foreground">
                          {man.trackingNumber}
                          <div className="text-[10px] text-muted-foreground font-normal">
                            #{man.orderId?.substring(0, 10)}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="rounded-lg text-[10px] font-bold">
                            {man.carrierName || man.carrierKey?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className="rounded-lg text-[10px]">
                            {man.deliveryType === 'home' ? (isAr ? 'توصيل للمنزل 🏠' : 'Home Delivery') : (isAr ? 'تسليم بالمكتب 🏢' : 'StopDesk')}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-foreground">
                          {Number(man.expectedAmount || 0).toLocaleString()} {isAr ? 'د.ج' : 'DZD'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              man.status === 'DELIVERED'
                                ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                                : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            }`}
                          >
                            {man.status === 'DELIVERED' ? (isAr ? 'تم التسليم ✅' : 'Delivered') : (isAr ? 'في الطريق 🚚' : 'In Transit')}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const waybillUrl = `/api/seller/shipping/waybill?orderId=${man.orderId}`;
                              window.open(waybillUrl, '_blank', 'width=650,height=800');
                            }}
                            className="rounded-xl text-[11px] h-8 gap-1.5 font-bold"
                          >
                            <Printer className="h-3.5 w-3.5 text-primary" />
                            {isAr ? 'طباعة البوليصة' : 'Print Waybill'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🔑 TAB 2: Carrier API Keys Integration */}
        <TabsContent value="integrations" className="space-y-4">
          <Card className="rounded-3xl border border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                {isAr ? 'ربط مفاتيح API الخاصة بشركات الشحن' : 'Carrier API Keys Vault'}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {isAr ? 'أدخل مفاتيحك الخاصة المشفرة بخوارزمية AES-256 للربط المباشر مع عقودك.' : 'Enter carrier API keys encrypted with AES-256 for direct contract dispatch.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">{isAr ? 'اختر شركة الشحن' : 'Select Carrier'}</Label>
                  <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
                  >
                    <option value="yalidine">Yalidine Express (ياليدين)</option>
                    <option value="zr_express">ZR Express (زد آر)</option>
                    <option value="maystro">Maystro Delivery (مايسترو)</option>
                    <option value="ecotrack">EcoTrack Delivery (إيكوتراك)</option>
                    <option value="chariday_express">ChariDay Express (الأسطول الموحد)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">{isAr ? 'مفتاح API Key' : 'API Key'}</Label>
                  <Input
                    type="password"
                    placeholder={isAr ? 'أدخل مفتاح API Key الخاص بك...' : 'Enter your API Key...'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveCarrierKeys}
                  disabled={isSavingKeys}
                  className="rounded-xl text-xs font-bold gap-2 px-6"
                >
                  {isSavingKeys ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {isAr ? 'تشفير وحفظ المفاتيح' : 'Encrypt & Save Keys'}
                </Button>
              </div>

              {/* Status of Active Carrier Keys */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold mb-3">{isAr ? 'شركات الشحن المفعلة في حسابك:' : 'Active Carrier Integrations:'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['yalidine', 'zr_express', 'maystro', 'ecotrack', 'chariday_express'].map((key) => {
                    const activeInt = integrations.find((i) => i.carrierKey === key && i.isActive);
                    return (
                      <div key={key} className="p-3 bg-muted/40 rounded-2xl border border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-bold uppercase">{key.replace('_', ' ')}</span>
                        </div>
                        {activeInt ? (
                          <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> {isAr ? 'مفعل ومُشفر' : 'Active'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px]">
                            {isAr ? 'غير مفعل' : 'Not Set'}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ℹ️ TAB 3: Thermal Waybills & Hardware Guide */}
        <TabsContent value="guide" className="space-y-4">
          <Card className="rounded-3xl border border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                {isAr ? 'طباعة البوالص الحرارية والمعايير الدولية' : 'Thermal Waybills & Hardware Specification'}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {isAr ? 'دليل طباعة الملصقات الحرارية والتوافق مع الطابعات ومحرك تسوية الـ COD.' : 'Printer compatibility guide and automated COD wallet settlement lifecycle.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  {isAr ? 'المقاس القياسي العالمي للبوالص (10x15cm / A6 Thermal Label)' : 'Standard A6 4x6" Waybill'}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {isAr
                    ? 'يصدر النظام البوالص الحرارية بمقاس A6 القياسي (100mm × 150mm) المحتوي على باركود Code128 وتفاصيل المرسل والمستلم وقيمة التحصيل COD والتفقيط المالي بالكلمات العربية.'
                    : 'Generates standard 100x150mm waybills containing Code128 barcodes, recipient details, and Arabic COD verbalization.'}
                </p>
              </div>

              <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Printer className="h-4 w-4 text-primary" />
                  {isAr ? 'الطابعات الحرارية المعتمدة (Hardware Compatibility)' : 'Supported Printers'}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Zebra, Xprinter, Honeywell, Dymo (10x15cm Thermal Label Paper) — {isAr ? 'طباعة مباشرة وفورية بدونحاجة لإعدادات إضافية.' : 'Plug & Play silent thermal label printing.'}
                </p>
              </div>

              <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-primary" />
                  {isAr ? 'التحديث الآلي للحالة والتحرير المالي (Automated Escrow Clearance)' : 'Escrow Wallet Clearance'}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {isAr
                    ? 'بمجرد تأكيد التسليم وإدخال كود الـ PIN المالي وتجاوز فترة أمان المعاملة، تُحول المبالغ آلياً وصافية لحساب محفظتك الرقمية (/seller/wallet).'
                    : 'Once delivery is verified via PIN, COD amounts are credited automatically to your seller wallet.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
