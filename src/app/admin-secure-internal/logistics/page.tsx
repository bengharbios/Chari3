'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Truck, ShieldCheck, DollarSign, Layers, CheckCircle2, AlertTriangle, Key, Lock, Loader2, Save, Info, Sliders, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function AdminLogisticsHubPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMode, setActiveMode] = useState<string>('hybrid');
  const [holdBufferHours, setHoldBufferHours] = useState<number>(24);
  const [platformCarriers, setPlatformCarriers] = useState<any[]>([]);

  // Selected carrier for entering platform keys
  const [selectedCarrier, setSelectedCarrier] = useState<string>('yalidine');
  const [carrierApiKey, setCarrierApiKey] = useState<string>('');
  const [carrierApiToken, setCarrierApiToken] = useState<string>('');
  const [isSavingCarrierKey, setIsSavingCarrierKey] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/shipping/settings');
      const data = await res.json();
      if (data.success) {
        if (data.modeSettings) {
          setActiveMode(data.modeSettings.activeMode || 'hybrid');
          setHoldBufferHours(data.modeSettings.holdBufferHours || 24);
        }
        if (Array.isArray(data.platformCarriers)) {
          setPlatformCarriers(data.platformCarriers);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(isAr ? 'فشل تحميل إعدادات الشحن' : 'Failed to load shipping settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveMode = async (mode: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/shipping/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeMode: mode, holdBufferHours }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveMode(mode);
        toast.success(isAr ? `تم تفعيل ${getModeTitle(mode)} بنجاح!` : `Activated ${getModeTitle(mode)} successfully!`);
      } else {
        toast.error(data.error || 'فشل التحديث');
      }
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء التحديث');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePlatformCarrierKeys = async () => {
    if (!carrierApiKey.trim()) {
      toast.error(isAr ? 'يرجى كتابة مفتاح API Key الموحد للمنصة' : 'Please enter platform carrier API key');
      return;
    }
    setIsSavingCarrierKey(true);
    try {
      const res = await fetch('/api/admin/shipping/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrierKey: selectedCarrier,
          carrierName: selectedCarrier.toUpperCase(),
          keys: { apiKey: carrierApiKey, apiToken: carrierApiToken },
          isActive: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isAr ? 'تم تشفير وحفظ مفاتيح المنصة العالمية بنجاح 🔒' : 'Platform global carrier credentials encrypted and saved 🔒');
        setCarrierApiKey('');
        setCarrierApiToken('');
        fetchSettings();
      } else {
        toast.error(data.error || 'فشل حفظ المفاتيح');
      }
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء التحديث');
    } finally {
      setIsSavingCarrierKey(false);
    }
  };

  const getModeTitle = (mode: string) => {
    switch (mode) {
      case 'hybrid':
        return isAr ? 'النموذج المزدوج المرن (Hybrid Mode)' : 'Hybrid Flex Mode';
      case 'direct_keys_only':
        return isAr ? 'إلزام المفاتيح المباشرة فقط (Direct Keys Only)' : 'Direct Keys Only';
      case 'platform_account_only':
        return isAr ? 'إلزام حساب المنصة الموحد (Platform Account Only)' : 'Platform Account Only';
      case 'private_fleet_only':
        return isAr ? 'شركة المنصة الخاصة (ChariDay Express)' : 'ChariDay Express Fleet';
      default:
        return mode;
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-start">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-foreground">
            <Truck className="h-7 w-7 text-primary" />
            {isAr ? 'مركز اللوجستيات ومحرك الشحن الموحد' : 'Logistics Hub & Unified Carrier Engine'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr 
              ? 'التحكم الفوري في النماذج التشغيلية الأربعة، مفاتيح الربط العالمية، مهلة الأمان، ومطابقة تسويات التحصيل (COD).'
              : 'Real-time control over governance modes, global carrier API keys, escrow holding hours, and COD reconciliation.'}
          </p>
        </div>
        <Button onClick={fetchSettings} variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 font-bold">
          <RefreshCw className="h-3.5 w-3.5" />
          {isAr ? 'تحديث الإعدادات' : 'Refresh Settings'}
        </Button>
      </div>

      {/* Active Governance Mode Impact Summary Box */}
      <Card className="border-primary/40 bg-primary/5 shadow-md rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary/10 border-b border-primary/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-black text-foreground">
                {isAr ? 'النموذج النشط حالياً في جميع المتاجر:' : 'Currently Active Platform Mode:'}{' '}
                <span className="text-primary underline">{getModeTitle(activeMode)}</span>
              </CardTitle>
            </div>
            <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1">
              {isAr ? 'مفعل ومباشر' : 'Live & Enforced'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground">{isAr ? 'كيف تؤثر هذه الوضعية على التجار فوراً عند دخولهم صفحة الشحن؟' : 'What happens for merchants in this mode?'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-background border border-border rounded-2xl space-y-1">
              <span className="font-bold flex items-center gap-1 text-foreground">
                <span>🔑</span> {isAr ? 'المفاتيح المباشرة للتاجر:' : 'Direct Merchant Keys:'}
              </span>
              <Badge variant={activeMode === 'hybrid' || activeMode === 'direct_keys_only' ? 'default' : 'secondary'} className="text-[10px]">
                {activeMode === 'hybrid' || activeMode === 'direct_keys_only' ? (isAr ? 'مسموح ومفعل 🟢' : 'Allowed 🟢') : (isAr ? 'معطل 🔴' : 'Disabled 🔴')}
              </Badge>
            </div>

            <div className="p-3 bg-background border border-border rounded-2xl space-y-1">
              <span className="font-bold flex items-center gap-1 text-foreground">
                <span>🏛️</span> {isAr ? 'حساب المنصة الموحد:' : 'Platform Shared Account:'}
              </span>
              <Badge variant={activeMode === 'hybrid' || activeMode === 'platform_account_only' ? 'default' : 'secondary'} className="text-[10px]">
                {activeMode === 'hybrid' || activeMode === 'platform_account_only' ? (isAr ? 'مسموح ومفعل 🟢' : 'Allowed 🟢') : (isAr ? 'معطل 🔴' : 'Disabled 🔴')}
              </Badge>
            </div>

            <div className="p-3 bg-background border border-border rounded-2xl space-y-1">
              <span className="font-bold flex items-center gap-1 text-foreground">
                <span>⚡</span> {isAr ? 'أسطول ChariDay Express:' : 'Private Fleet:'}
              </span>
              <Badge variant={activeMode === 'hybrid' || activeMode === 'private_fleet_only' ? 'default' : 'secondary'} className="text-[10px]">
                {activeMode === 'hybrid' || activeMode === 'private_fleet_only' ? (isAr ? 'مسموح ومفعل 🟢' : 'Allowed 🟢') : (isAr ? 'معطل 🔴' : 'Disabled 🔴')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 Operational Modes Selector Cards */}
      <Card className="border-border bg-card shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            {isAr ? 'تغيير نموذج السيطرة المالية والتشغيلية (Operational Modes)' : 'Select Operational & Governance Mode'}
          </CardTitle>
          <CardDescription>
            {isAr 
              ? 'انقر على أي نموذج أدناه للتفعيل الفوري عبر السيرفر وفي جميع لوحات التحكم المتاجر.'
              : 'Click any governance model below to enforce it immediately across all merchant stores.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Hybrid Mode */}
            <div 
              onClick={() => handleSaveMode('hybrid')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                activeMode === 'hybrid' 
                  ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20' 
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm flex items-center gap-2">
                  <span>🔀</span> {isAr ? '1. النموذج المزدوج المرن (Hybrid Mode)' : '1. Hybrid Flex Mode'}
                </span>
                {activeMode === 'hybrid' && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAr 
                  ? 'حرية تامة للتاجر: يمكن للتاجر الشحن بعقده الخاص ومفتاحه المباشر، أو الشحن عبر حساب المنصة الموحد وتسوية مبالغه في محفظته.'
                  : 'Full flexibility: Merchant can use direct contract keys or platform shared carrier account.'}
              </p>
            </div>

            {/* Mode 2: Direct Keys Only */}
            <div 
              onClick={() => handleSaveMode('direct_keys_only')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                activeMode === 'direct_keys_only' 
                  ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20' 
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm flex items-center gap-2">
                  <span>🔑</span> {isAr ? '2. إلزام المفاتيح المباشرة فقط (Direct Keys Only)' : '2. Direct Keys Only'}
                </span>
                {activeMode === 'direct_keys_only' && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAr 
                  ? 'إلغاء المخاطر المالية على المنصة: يُجبر كل تاجر على إدخال مفتاحه الخاص المباشر مع شركات الشحن، ولا تتحمل المنصة ديون الشحن.'
                  : 'Zero platform debt risk: Every merchant must provide their own direct carrier credentials.'}
              </p>
            </div>

            {/* Mode 3: Platform Account Only */}
            <div 
              onClick={() => handleSaveMode('platform_account_only')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                activeMode === 'platform_account_only' 
                  ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20' 
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm flex items-center gap-2">
                  <span>🏛️</span> {isAr ? '3. إلزام حساب المنصة الموحد (Platform Account Only)' : '3. Platform Account Only'}
                </span>
                {activeMode === 'platform_account_only' && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAr 
                  ? 'سيطرة مالية مطلقة للمنصة: جميع الطرود تصدر عبر حساب المنصة الموحد، والمبالغ تدخل حساب المنصة أولاً ثم تحرر لمناطق محفظة التاجر.'
                  : 'Full payout control: All parcels routed via shared platform account with automated wallet release.'}
              </p>
            </div>

            {/* Mode 4: Private Fleet Only */}
            <div 
              onClick={() => handleSaveMode('private_fleet_only')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                activeMode === 'private_fleet_only' 
                  ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20' 
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm flex items-center gap-2">
                  <span>⚡</span> {isAr ? '4. شركة المنصة الخاصة (ChariDay Express Only)' : '4. Private Fleet Only'}
                </span>
                {activeMode === 'private_fleet_only' && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAr 
                  ? 'الاعتماد الحصري على شبكة أسطول التوصيل المباشرة التابعة لـ ChariDay Express دون استخدام أي شركة توصيل خارجية.'
                  : 'Exclusive usage of ChariDay Express internal delivery network without external carriers.'}
              </p>
            </div>
          </div>

          {/* Buffer Hours Setting */}
          <div className="pt-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {isAr ? 'فترة أمان التحرير المالي (Escrow Buffer Hours)' : 'Escrow Holding Period (Hours)'}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isAr 
                  ? 'المهلة الزمنية الساعاتية بعد إشعار الناقل بتسليم الطلب قبل إيداع الأرباح نهائياً في محفظة التاجر.'
                  : 'Delay period in hours after carrier confirms delivery before releasing COD payouts to merchant wallet.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={holdBufferHours}
                onChange={(e) => setHoldBufferHours(parseInt(e.target.value) || 24)}
                className="w-24 text-center font-bold h-9 text-xs"
              />
              <span className="text-xs text-muted-foreground font-bold">{isAr ? 'ساعة' : 'hours'}</span>
              <Button onClick={() => handleSaveMode(activeMode)} size="sm" className="h-9 text-xs font-bold gap-1 rounded-xl">
                <Save className="h-3.5 w-3.5" />
                {isAr ? 'حفظ المهلة' : 'Save Buffer'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Carriers Credentials Entry Form */}
      <Card className="border-border bg-card shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {isAr ? 'إدخال مفاتيح المنصة العالمية (Platform Shared Carrier Accounts)' : 'Platform Shared Carrier Credentials'}
          </CardTitle>
          <CardDescription>
            {isAr 
              ? 'أدخل مفاتيح API الخاصة بالمنصة لتسهيل الشحن الآلي لجميع التجار عبر حساب المنصة الموحد.'
              : 'Enter shared platform carrier credentials used when merchants ship via platform shared accounts.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label className="text-xs">{isAr ? 'مفتاح API Key للمنصة' : 'Platform API Key'}</Label>
              <Input
                type="password"
                value={carrierApiKey}
                onChange={(e) => setCarrierApiKey(e.target.value)}
                placeholder="e.g. platform_global_api_key_xxx"
                className="bg-background rounded-xl h-10 text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{isAr ? 'رمز API Token للمنصة (اختياري)' : 'Platform API Token'}</Label>
              <Input
                type="password"
                value={carrierApiToken}
                onChange={(e) => setCarrierApiToken(e.target.value)}
                placeholder="e.g. platform_global_token_xxx"
                className="bg-background rounded-xl h-10 text-xs font-mono"
              />
            </div>
          </div>

          <Button
            onClick={handleSavePlatformCarrierKeys}
            disabled={isSavingCarrierKey}
            className="rounded-xl text-xs font-bold gap-2 px-6"
          >
            {isSavingCarrierKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {isAr ? 'حفظ وتشفير مفتاح المنصة 🔒' : 'Save & Encrypt Platform Key 🔒'}
          </Button>

          {/* List of Platform Carrier Connections */}
          <div className="pt-4 border-t border-border space-y-3">
            <h4 className="text-xs font-bold text-foreground">{isAr ? 'حالة الربط المباشر لشركات الشحن بالمنصة:' : 'Platform Carrier Connection Status:'}</h4>
            {[
              { key: 'yalidine', name: 'Yalidine Delivery (ياليدين)' },
              { key: 'zr_express', name: 'ZR Express (زد آر إكسبريس)' },
              { key: 'maystro', name: 'Maystro Delivery (مايسترو)' },
              { key: 'ecotrack', name: 'EcoTrack (إيكوتراك)' },
              { key: 'chariday_express', name: 'ChariDay Express (الأسطول الخاص)' },
            ].map((c) => {
              const existing = platformCarriers.find(item => item.carrierKey === c.key);
              return (
                <div key={c.key} className="flex items-center justify-between p-3.5 bg-muted/30 border border-border rounded-2xl">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-foreground">{c.name}</h4>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {existing?.hasKeys ? (isAr ? 'مفاتيح مشفرة ومفعلة 🔒' : 'Keys Encrypted & Active 🔒') : (isAr ? 'غير مربوط بعد ❌' : 'Not Connected ❌')}
                    </span>
                  </div>
                  <Badge variant={existing?.hasKeys ? 'default' : 'secondary'} className="text-xs font-bold">
                    {existing?.hasKeys ? (isAr ? 'نشط ومفعل' : 'Active') : (isAr ? 'جاهز للربط' : 'Ready')}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
