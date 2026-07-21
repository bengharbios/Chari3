'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Truck, ShieldCheck, DollarSign, Layers, CheckCircle2, AlertTriangle, Key, Lock, Loader2, Save } from 'lucide-react';
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
        toast.success(isAr ? 'تم تحديث نموذج تشغيل الشحن بنجاح!' : 'Shipping operational mode updated successfully!');
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
            {isAr ? 'مركز اللوجستيات ومحرك الشحن الموحد' : 'Logistics Hub & Unified Carrier Engine'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr 
              ? 'التحكم في النماذج التشغيلية الأربعة، مفاتيح الربط العالمية، مهلة الأمان، ومطابقة تسويات التحصيل (COD).'
              : 'Manage operational modes, carrier keys, escrow buffer hours, and COD reconciliation.'}
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-primary/30 text-primary font-bold px-3 py-1 text-xs">
          {isAr ? 'محرك سيادي 100%' : '100% Sovereign Engine'}
        </Badge>
      </div>

      {/* 4 Operational Modes Selector Card */}
      <Card className="border-border bg-card shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SlidersIcon className="h-5 w-5 text-primary" />
            {isAr ? 'نماذج التشغيل والسيطرة المالية (Operational Modes)' : 'Operational & Payout Governance Modes'}
          </CardTitle>
          <CardDescription>
            {isAr 
              ? 'اختر النموذج الذي يناسب استراتيجية المنصة والسيطرة المالية للتحصيل.'
              : 'Select the active shipping governance model for merchants and carriers.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Hybrid Mode */}
            <div 
              onClick={() => handleSaveMode('hybrid')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                activeMode === 'hybrid' 
                  ? 'bg-primary/10 border-primary shadow-md' 
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm flex items-center gap-2">
                  <span>🔀</span> {isAr ? '1. النموذج المزدوج المرن (Hybrid Mode)' : '1. Hybrid Mode'}
                </span>
                {activeMode === 'hybrid' && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr 
                  ? 'حرية تامة للتاجر: يمكنه إدخال مفتاحه الخاص للشحن المباشر، أو الشحن عبر حساب المنصة الموحد.'
                  : 'Full merchant flexibility: Use direct API key or platform shared carrier account.'}
              </p>
            </div>

            {/* Option 2: Direct Keys Only */}
            <div 
              onClick={() => handleSaveMode('direct_keys_only')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                activeMode === 'direct_keys_only' 
                  ? 'bg-primary/10 border-primary shadow-md' 
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm flex items-center gap-2">
                  <span>🔑</span> {isAr ? '2. إلزام المفاتيح المباشرة فقط (Direct Keys Only)' : '2. Direct Keys Only'}
                </span>
                {activeMode === 'direct_keys_only' && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr 
                  ? 'تخفيض المخاطر المالية: يُجبر كل تاجر على استخدام عقده ومفتاحه الخاص مع شركة الشحن.'
                  : 'Zero platform risk: Every merchant uses their own direct carrier account and contract.'}
              </p>
            </div>

            {/* Option 3: Platform Account Only */}
            <div 
              onClick={() => handleSaveMode('platform_account_only')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                activeMode === 'platform_account_only' 
                  ? 'bg-primary/10 border-primary shadow-md' 
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm flex items-center gap-2">
                  <span>🏛️</span> {isAr ? '3. إلزام حساب المنصة الموحد (Platform Account Only)' : '3. Platform Account Only'}
                </span>
                {activeMode === 'platform_account_only' && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr 
                  ? 'سيطرة مالية كاملة: جميع التجار يشحنون عبر حساب المنصة الموحد، والأموال تدخل حساب المنصة أولاً.'
                  : 'Full financial control: All parcels routed via platform account with automated escrow payout.'}
              </p>
            </div>

            {/* Option 4: Private Fleet Only */}
            <div 
              onClick={() => handleSaveMode('private_fleet_only')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                activeMode === 'private_fleet_only' 
                  ? 'bg-primary/10 border-primary shadow-md' 
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm flex items-center gap-2">
                  <span>⚡</span> {isAr ? '4. شركة المنصة الخاصة (ChariDay Express Only)' : '4. Private Fleet Only'}
                </span>
                {activeMode === 'private_fleet_only' && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr 
                  ? 'اعتماد حصري على أسطول التوصيل الخاص بالمنصة دون أي وسيط خارجي.'
                  : 'Exclusive usage of ChariDay Express internal delivery network.'}
              </p>
            </div>
          </div>

          {/* Buffer Hours Setting */}
          <div className="pt-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {isAr ? 'فترة أمان التحرير المالي (Escrow Buffer Hours)' : 'Escrow Buffer Period (Hours)'}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isAr 
                  ? 'المهلة الزمنية بعد تأكيد شركة الشحن للتسليم قبل إيداع الأرباح نهائياً في محفظة التاجر.'
                  : 'Security holding delay after carrier confirms delivery before releasing funds to wallet.'}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Carriers Integration List */}
      <Card className="border-border bg-card shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {isAr ? 'مفاتيح شركات الشحن العالمية (Platform Global Carriers)' : 'Platform Global Carriers Keys'}
          </CardTitle>
          <CardDescription>
            {isAr 
              ? 'مفاتيح API العالمية التي تُستخدم عند شحن التجار عبر حساب المنصة الموحد.'
              : 'Global API credentials used when merchants ship via platform shared accounts.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
                  {existing?.hasKeys ? (isAr ? 'نشط' : 'Active') : (isAr ? 'جاهز للربط' : 'Ready')}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function SlidersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" /><line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" /><line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}
