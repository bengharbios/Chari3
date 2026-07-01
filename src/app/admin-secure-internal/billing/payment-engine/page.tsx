'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  Loader2, Save, CreditCard, Settings, ShieldAlert, CheckCircle2, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function PaymentEnginePage() {
  const { isAdminAuthenticated, adminUser } = useAdminAuthStore();
  const { locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Platform Payment Model
  const [platformPaymentModel, setPlatformPaymentModel] = useState<'centralized' | 'decentralized' | 'mixed'>('mixed');

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const fetchSettings = async () => {
    if (!isAdminAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.platform_payment_model) {
          setPlatformPaymentModel(data.settings.platform_payment_model as 'centralized' | 'decentralized' | 'mixed');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(t(locale, 'فشل تحميل الإعدادات', 'Failed to load settings'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) fetchSettings();
  }, [isMounted]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser?.id,
          settings: {
            platform_payment_model: platformPaymentModel,
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حفظ إعدادات محرك الدفع بنجاح ✅', 'Payment engine settings saved ✅'));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل الحفظ', 'Failed to save'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted || !isAdminAuthenticated) return null;

  return (
    <div dir={dir} className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center gap-4 mb-6">
        <Link href={getAdminPath('')}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-brand" />
            {t(locale, 'محرك بوابات الدفع (Payment Engine)', 'Payment Engine Orchestrator')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(locale, 'تحكم في طريقة معالجة وتوجيه الأموال بين المنصة والتجار', 'Control how funds are processed and routed between platform and merchants')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 min-h-[50vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border-border bg-card shadow-sm hover:shadow transition-shadow border-blue-500/20">
            <CardHeader className="bg-blue-500/5 border-b border-blue-500/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                {t(locale, 'النموذج المالي العام للمنصة', 'Global Platform Payment Model')}
              </CardTitle>
              <CardDescription>
                {t(locale, 'تحديد كيفية عمل المنصة مالياً. هل تدفع الأموال للمنصة أم مباشرة للتاجر؟', 'Configure how money flows through the platform globally.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-3">
                <Label className="text-xs font-semibold block">{t(locale, 'اختر نموذج الدفع الافتراضي:', 'Select Default Payment Model:')}</Label>
                <Select value={platformPaymentModel} onValueChange={(val: any) => setPlatformPaymentModel(val)}>
                  <SelectTrigger className="w-full h-16 bg-background border-border rounded-xl shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centralized">
                      <div className="flex flex-col text-start py-1">
                        <span className="font-bold text-sm">الدفع للمنصة (Centralized / Platform Collect)</span>
                        <span className="text-[10px] text-muted-foreground">المنصة تستلم الأموال وتعطي التاجر رصيداً قابلاً للسحب.</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="decentralized">
                      <div className="flex flex-col text-start py-1">
                        <span className="font-bold text-sm">الدفع المباشر للتاجر (Decentralized / Split Payment)</span>
                        <span className="text-[10px] text-muted-foreground">التاجر يقبض أمواله كاش وتحتسب المنصة عمولتها كمديونية أو تُقتطع فورياً.</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mixed">
                      <div className="flex flex-col text-start py-1">
                        <span className="font-bold text-sm">النظام المدمج (Mixed Orchestration)</span>
                        <span className="text-[10px] text-muted-foreground">السماح للتجار باختيار بوابة الدفع الخاصة بهم إذا وفروا مفاتيح الـ API.</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 mt-4 bg-muted/30 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {t(locale, 'بوابات الدفع المدعومة (Plugins)', 'Supported Payment Gateways')}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {t(locale, 'النظام يتعرف تلقائياً على البوابات المدمجة عبر الـ Plugin Architecture.', 'The system automatically detects gateways integrated via Plugin Architecture.')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Chargily Pay
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Cash on Delivery (COD)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Bank Transfer
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving} className="gap-2 px-8 rounded-xl font-bold bg-brand text-brand-foreground hover:bg-brand/90">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t(locale, 'حفظ التغييرات', 'Save Changes')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
