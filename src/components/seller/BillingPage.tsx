'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Wallet, ShieldAlert, CreditCard, Send, CheckCircle2, AlertCircle, FileText,
  Loader2, Sparkles, Clock, Check, X, Smartphone, MessageSquare, Users, Plus,
  Minus, RefreshCw, Package, Star, Zap, Crown, TrendingUp, CalendarDays,
  Receipt, ArrowRight, Info, Building2, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

// ─── Status Badge Helper ──────────────────────────────────────────────────────
function StatusBadge({ status, locale }: { status: string; locale: string }) {
  const map: Record<string, { label: string; labelEn: string; color: string }> = {
    TRIAL:           { label: 'تجريبي',          labelEn: 'Trial',         color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    PENDING_PAYMENT: { label: 'في انتظار الدفع', labelEn: 'Pending',       color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    ACTIVE:          { label: 'نشط',             labelEn: 'Active',        color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    EXPIRED:         { label: 'منتهي',           labelEn: 'Expired',       color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    SUSPENDED:       { label: 'معلق',            labelEn: 'Suspended',     color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    CANCELLED:       { label: 'ملغي',            labelEn: 'Cancelled',     color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  };
  const s = map[status] || { label: status, labelEn: status, color: 'bg-muted text-muted-foreground border-border' };
  return (
    <Badge className={`border text-xs font-bold px-2 py-0.5 rounded-full ${s.color}`}>
      {locale === 'ar' ? s.label : s.labelEn}
    </Badge>
  );
}

// ─── Addon Config ─────────────────────────────────────────────────────────────
const ADDON_LIST = [
  { key: 'mobileApp',   iconEl: <Smartphone className="h-4 w-4" />, labelAr: 'تطبيق الهاتف للتاجر',     labelEn: 'Merchant Mobile App',        settingKey: 'price_addon_mobile_app',   defaultPrice: 2000 },
  { key: 'whatsapp',    iconEl: <MessageSquare className="h-4 w-4" />, labelAr: 'دعم مخصص / واتساب',   labelEn: 'WhatsApp Dedicated Support', settingKey: 'price_addon_whatsapp',     defaultPrice: 2500 },
  { key: 'crm',         iconEl: <TrendingUp className="h-4 w-4" />, labelAr: 'نظام CRM متقدم',          labelEn: 'Advanced CRM System',        settingKey: 'price_addon_crm',          defaultPrice: 1500 },
  { key: 'pos',         iconEl: <Building2 className="h-4 w-4" />, labelAr: 'برنامج كاشير Chari POS',  labelEn: 'Chari POS Software',         settingKey: 'price_addon_pos',          defaultPrice: 1500 },
  { key: 'extraPos',    iconEl: <Plus className="h-4 w-4" />, labelAr: 'أجهزة POS إضافية',             labelEn: 'Extra POS Devices',          settingKey: 'price_addon_extra_pos',    defaultPrice: 500, isCounter: true },
];

const PLAN_ICONS: Record<string, React.ReactNode> = {
  0: <Package className="h-5 w-5" />,
  1: <Star className="h-5 w-5" />,
  2: <Zap className="h-5 w-5" />,
  3: <Crown className="h-5 w-5" />,
};

export default function BillingPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = locale === 'ar';

  // ─── State ────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading]         = useState(true);
  const [subscription, setSubscription]   = useState<any>(null);
  const [packages, setPackages]           = useState<any[]>([]);
  const [invoices, setInvoices]           = useState<any[]>([]);
  const [receipts, setReceipts]           = useState<any[]>([]);
  const [settings, setSettings]           = useState<Record<string, string>>({});
  const [wallet, setWallet]               = useState<any>(null);

  // Plan selector
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [billingCycle, setBillingCycle]           = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [addonState, setAddonState]               = useState<Record<string, boolean | number>>({
    mobileApp: false, whatsapp: false, crm: false, pos: false, extraPos: 0,
  });
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Payment form (CCP)
  const [payAmount, setPayAmount]       = useState('');
  const [payNote, setPayNote]           = useState('');
  const [payReceipt, setPayReceipt]     = useState('');
  const [isUploading, setIsUploading]   = useState(false);

  // Card mock
  const [cardNum, setCardNum]     = useState('');
  const [cardExp, setCardExp]     = useState('');
  const [cardCvv, setCardCvv]     = useState('');
  const [cardAmt, setCardAmt]     = useState('');
  const [isCardPay, setIsCardPay] = useState(false);

  // ─── Currency ─────────────────────────────────────────────────────────────
  const currencyCode = wallet?.currency || 'DZD';
  const fmt = (n: number) => {
    const sym: Record<string, string> = { DZD: isRTL ? 'د.ج' : 'DZD', SAR: isRTL ? 'ر.س' : 'SAR', USD: '$', EUR: '€' };
    return `${n.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} ${sym[currencyCode] || currencyCode}`;
  };

  // ─── Addon Prices from Settings ───────────────────────────────────────────
  const addonPrice = (key: string, def: number) => parseFloat(settings[key] || String(def));

  const computeAddonsTotal = (state: typeof addonState) => {
    let total = 0;
    if (state.mobileApp) total += addonPrice('price_addon_mobile_app', 2000);
    if (state.whatsapp)  total += addonPrice('price_addon_whatsapp', 2500);
    if (state.crm)       total += addonPrice('price_addon_crm', 1500);
    if (state.pos)       total += addonPrice('price_addon_pos', 1500);
    const extra = Number(state.extraPos || 0);
    if (extra > 0)       total += extra * addonPrice('price_addon_extra_pos', 500);
    return total;
  };

  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const addonsTotal     = computeAddonsTotal(addonState);
  const basePrice       = selectedPackage?.price ?? 0;
  const annualDiscount  = billingCycle === 'ANNUAL' ? 0.2 : 0;
  const totalMonthly    = (basePrice + addonsTotal) * (1 - annualDiscount);
  const totalBilled     = billingCycle === 'ANNUAL' ? totalMonthly * 12 : totalMonthly;

  // ─── Fetch Data ───────────────────────────────────────────────────────────
  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [subRes, pkgRes, invRes, recRes, setRes, walRes] = await Promise.all([
        fetch(`/api/billing/subscription?userId=${user.id}`),
        fetch('/api/admin/packages'),
        fetch(`/api/billing/invoices?userId=${user.id}`),
        fetch(`/api/billing/receipts?userId=${user.id}`),
        fetch('/api/admin/settings'),
        fetch(`/api/admin/users`),
      ]);

      const [subData, pkgData, invData, recData, setData, walData] = await Promise.all([
        subRes.json(), pkgRes.json(), invRes.json(), recRes.json(), setRes.json(), walRes.json(),
      ]);

      if (subData.subscription) {
        setSubscription(subData.subscription);
        // Pre-fill addon state from existing subscription
        const addons = subData.subscription.addons ? JSON.parse(subData.subscription.addons) : {};
        setAddonState({ mobileApp: addons.mobileApp || false, whatsapp: addons.whatsapp || false, crm: addons.crm || false, pos: addons.pos || false, extraPos: addons.extraPos || 0 });
        setSelectedPackageId(subData.subscription.packageId || '');
      }
      if (pkgData.success) setPackages(pkgData.packages || []);
      if (invData.success) setInvoices(invData.invoices || []);
      if (recData.success) setReceipts(recData.receipts || []);
      if (setData.success) setSettings(setData.settings || {});

      // Wallet
      const currentUser = walData.users?.find((u: any) => u.id === user.id);
      if (currentUser?.wallet) setWallet(currentUser.wallet);

    } catch (err) {
      console.error('BillingPage fetch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  // ─── Subscribe / Upgrade ──────────────────────────────────────────────────
  const handleSubscribe = async () => {
    if (!selectedPackageId) {
      toast.error(t(locale, 'يرجى اختيار باقة أولاً', 'Please select a package first'));
      return;
    }
    setIsSubscribing(true);
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, packageId: selectedPackageId, billingCycle, addons: addonState }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم إرسال طلب الاشتراك بنجاح! 🎉', 'Subscription request submitted! 🎉'));
        fetchData();
      } else throw new Error(data.error);
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل إرسال طلب الاشتراك', 'Failed to submit subscription'));
    } finally {
      setIsSubscribing(false);
    }
  };

  // ─── Pay via CCP Receipt ──────────────────────────────────────────────────
  const handleCCPPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || !payReceipt) {
      toast.error(t(locale, 'يرجى إدخال المبلغ وصورة الوصل', 'Please enter amount and receipt image'));
      return;
    }
    setIsUploading(true);
    try {
      const res = await fetch('/api/billing/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, amount: parseFloat(payAmount), receiptImage: payReceipt, merchantNote: payNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم إرسال الوصل بنجاح! سيراجعه الفريق قريباً.', 'Receipt submitted! Our team will review it shortly.'));
        setPayAmount(''); setPayNote(''); setPayReceipt('');
        fetchData();
      } else throw new Error(data.error);
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل إرسال الوصل', 'Failed to submit receipt'));
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Pay via Card (simulated) ─────────────────────────────────────────────
  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNum || !cardExp || !cardCvv || !cardAmt) {
      toast.error(t(locale, 'يرجى إكمال معلومات البطاقة', 'Please complete card information'));
      return;
    }
    setIsCardPay(true);
    try {
      const uploadRes = await fetch('/api/billing/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, amount: parseFloat(cardAmt), receiptImage: 'MOCK_CARD_GATEWAY_SUCCESS', merchantNote: `دفع فوري عبر البطاقة (****${cardNum.slice(-4)})` }),
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        const approveRes = await fetch('/api/billing/receipts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptId: uploadData.receipt.id, status: 'approved', adminNote: 'تأكيد تلقائي عبر بوابة الدفع' }),
        });
        const approveData = await approveRes.json();
        if (approveData.success) {
          toast.success(t(locale, 'تم الدفع وتفعيل حسابك فورياً! 🎉', 'Payment successful and account activated instantly! 🎉'));
          setCardNum(''); setCardExp(''); setCardCvv(''); setCardAmt('');
          fetchData();
        } else throw new Error(approveData.error);
      } else throw new Error(uploadData.error);
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل الدفع الإلكتروني', 'Card payment failed'));
    } finally {
      setIsCardPay(false);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground">{t(locale, 'جاري تحميل بيانات الاشتراك...', 'Loading subscription data...')}</p>
        </div>
      </div>
    );
  }

  // ─── Derived Values ───────────────────────────────────────────────────────
  const sub = subscription;
  const now = new Date();
  const endDate = sub?.endDate ? new Date(sub.endDate) : null;
  const trialEnd = sub?.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / 86400000)) : null;
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000)) : null;
  const isSuspended  = sub?.status === 'SUSPENDED';
  const isExpired    = sub?.status === 'EXPIRED';
  const isTrial      = sub?.status === 'TRIAL';
  const isActive     = sub?.status === 'ACTIVE';
  const isPending    = sub?.status === 'PENDING_PAYMENT';
  const hasNoSub     = !sub;

  const ccpName = settings.ccp_account_name || 'شاري داي';
  const ccpRip  = settings.ccp_account_rip  || '007999990023456789 45';

  // ─── Status Banner ────────────────────────────────────────────────────────
  const renderBanner = () => {
    if (hasNoSub) return (
      <div className="rounded-2xl border-2 border-dashed border-brand/30 bg-brand/5 p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 rounded-xl bg-brand/10"><Sparkles className="h-6 w-6 text-brand" /></div>
        <div className="flex-1 text-center sm:text-start">
          <h3 className="font-bold text-base">{t(locale, 'لا يوجد اشتراك نشط', 'No active subscription')}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t(locale, 'اختر الباقة المناسبة لبدء رحلتك مع شاري داي', 'Choose the right plan to start your ChariDay journey')}</p>
        </div>
        <Button size="sm" className="gap-2 rounded-xl bg-brand hover:bg-brand/90 text-navy font-bold shrink-0" onClick={() => document.getElementById('plans-tab')?.click()}>
          <Package className="h-4 w-4" />
          {t(locale, 'اختر باقة', 'Choose a Plan')}
        </Button>
      </div>
    );

    if (isSuspended) return (
      <div className="rounded-2xl border-2 border-red-500/40 bg-red-500/5 p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 rounded-xl bg-red-500/10"><ShieldAlert className="h-6 w-6 text-red-500" /></div>
        <div className="flex-1 text-center sm:text-start">
          <h3 className="font-bold text-base text-red-500">{t(locale, '⛔ متجرك معلق حالياً', '⛔ Your store is currently suspended')}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t(locale, 'يرجى تسديد الاشتراك المستحق لإعادة تفعيل متجرك فوراً', 'Please pay your outstanding subscription to reactivate your store')}</p>
        </div>
        <Button size="sm" className="gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shrink-0" onClick={() => document.getElementById('pay-tab')?.click()}>
          <CreditCard className="h-4 w-4" />
          {t(locale, 'ادفع الآن', 'Pay Now')}
        </Button>
      </div>
    );

    if (isExpired) return (
      <div className="rounded-2xl border-2 border-orange-500/40 bg-orange-500/5 p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 rounded-xl bg-orange-500/10"><AlertCircle className="h-6 w-6 text-orange-500" /></div>
        <div className="flex-1 text-center sm:text-start">
          <h3 className="font-bold text-base text-orange-500">{t(locale, '⚠️ انتهت صلاحية اشتراكك', '⚠️ Your subscription has expired')}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t(locale, 'قم بالتجديد الآن لتجنب تعليق متجرك', 'Renew now to avoid your store being suspended')}</p>
        </div>
        <Button size="sm" className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shrink-0" onClick={() => document.getElementById('pay-tab')?.click()}>
          <RefreshCw className="h-4 w-4" />
          {t(locale, 'جدد الاشتراك', 'Renew Now')}
        </Button>
      </div>
    );

    if (isPending) return (
      <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 rounded-xl bg-amber-500/10"><Clock className="h-6 w-6 text-amber-500" /></div>
        <div className="flex-1 text-center sm:text-start">
          <h3 className="font-bold text-base text-amber-600">{t(locale, '⏳ في انتظار تأكيد دفعتك', '⏳ Waiting for your payment confirmation')}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t(locale, 'أرسل وصل الدفع وسيقوم فريقنا بمراجعته وتفعيل حسابك خلال 24 ساعة', 'Submit your payment receipt and our team will review and activate within 24h')}</p>
        </div>
        <Button size="sm" className="gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shrink-0" onClick={() => document.getElementById('pay-tab')?.click()}>
          <Send className="h-4 w-4" />
          {t(locale, 'إرسال الوصل', 'Submit Receipt')}
        </Button>
      </div>
    );

    if (isTrial) return (
      <div className="rounded-2xl border-2 border-blue-500/40 bg-blue-500/5 p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 rounded-xl bg-blue-500/10"><Sparkles className="h-6 w-6 text-blue-500" /></div>
        <div className="flex-1 text-center sm:text-start">
          <h3 className="font-bold text-base text-blue-500">
            {t(locale, `🎉 أنت في الفترة التجريبية — ${trialDaysLeft} يوم متبقٍ`, `🎉 Trial period — ${trialDaysLeft} days remaining`)}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t(locale, 'استمتع بجميع ميزات الباقة مجاناً. يمكنك الدفع في أي وقت.', 'Enjoy all plan features for free. You can pay anytime before it ends.')}</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2 rounded-xl font-bold shrink-0 border-blue-500/40 text-blue-500" onClick={() => document.getElementById('pay-tab')?.click()}>
          <CreditCard className="h-4 w-4" />
          {t(locale, 'ادفع مسبقاً', 'Pay Early')}
        </Button>
      </div>
    );

    // ACTIVE
    return (
      <div className="rounded-2xl border-2 border-green-500/40 bg-green-500/5 p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 rounded-xl bg-green-500/10"><CheckCircle2 className="h-6 w-6 text-green-500" /></div>
        <div className="flex-1 text-center sm:text-start">
          <h3 className="font-bold text-base text-green-600">
            {t(locale, `✅ اشتراكك نشط — ${daysRemaining} يوم متبقٍ`, `✅ Active subscription — ${daysRemaining} days remaining`)}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t(locale, `ينتهي في ${endDate?.toLocaleDateString('ar-SA')}`, `Expires on ${endDate?.toLocaleDateString('en-US')}`)}
          </p>
        </div>
        {daysRemaining !== null && daysRemaining <= 10 && (
          <Button size="sm" className="gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shrink-0" onClick={() => document.getElementById('pay-tab')?.click()}>
            <RefreshCw className="h-4 w-4" />
            {t(locale, 'جدد مبكراً', 'Renew Early')}
          </Button>
        )}
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div dir={dir} className="space-y-6 text-start">

      {/* Status Banner */}
      {renderBanner()}

      {/* Overview Cards Row */}
      {sub && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t(locale, 'الباقة الحالية', 'Current Plan')}</p>
              <p className="font-black text-lg mt-1 text-foreground">
                {locale === 'ar' ? sub.package?.name : (sub.package?.nameEn || sub.package?.name || t(locale, 'غير محدد', 'Unassigned'))}
              </p>
              <StatusBadge status={sub.status} locale={locale} />
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t(locale, 'إجمالي الفاتورة الشهرية', 'Monthly Total')}</p>
              <p className="font-black text-lg mt-1 text-brand">{fmt(sub.totalMonthly || 0)}</p>
              <p className="text-[10px] text-muted-foreground">{t(locale, 'الباقة + الإضافات', 'Plan + Add-ons')}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t(locale, 'رصيد المحفظة', 'Wallet Balance')}</p>
              <p className={`font-black text-lg mt-1 ${(wallet?.balance ?? 0) < 0 ? 'text-red-500' : 'text-green-500'}`}>{fmt(wallet?.balance ?? 0)}</p>
              <p className="text-[10px] text-muted-foreground">{(wallet?.balance ?? 0) < 0 ? t(locale, 'مديونية مستحقة', 'Outstanding debt') : t(locale, 'رصيد متاح', 'Available credit')}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t(locale, 'دورة الفوترة', 'Billing Cycle')}</p>
              <p className="font-black text-lg mt-1 text-foreground">
                {sub.billingCycle === 'ANNUAL' ? t(locale, 'سنوي', 'Annual') : t(locale, 'شهري', 'Monthly')}
              </p>
              <p className="text-[10px] text-muted-foreground">{daysRemaining !== null ? t(locale, `${daysRemaining} يوم متبقٍ`, `${daysRemaining} days left`) : '—'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue={hasNoSub || isPending ? 'plans' : 'invoice'}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="gap-1 h-auto flex-wrap min-w-max" dir={dir}>
            <TabsTrigger id="invoice-tab" value="invoice" className="gap-1.5 text-xs font-bold rounded-xl" disabled={hasNoSub}>
              <Receipt className="h-4 w-4" />
              {t(locale, 'فاتورتي الحالية', 'Current Invoice')}
            </TabsTrigger>
            <TabsTrigger id="plans-tab" value="plans" className="gap-1.5 text-xs font-bold rounded-xl">
              <Package className="h-4 w-4" />
              {sub ? t(locale, 'تغيير الباقة', 'Change Plan') : t(locale, 'اختر باقة', 'Choose Plan')}
            </TabsTrigger>
            <TabsTrigger id="addons-tab" value="addons" className="gap-1.5 text-xs font-bold rounded-xl" disabled={hasNoSub}>
              <Sparkles className="h-4 w-4" />
              {t(locale, 'الميزات الإضافية', 'Add-ons')}
            </TabsTrigger>
            <TabsTrigger id="pay-tab" value="pay" className="gap-1.5 text-xs font-bold rounded-xl">
              <CreditCard className="h-4 w-4" />
              {t(locale, 'الدفع والتسديد', 'Payment')}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs font-bold rounded-xl">
              <FileText className="h-4 w-4" />
              {t(locale, 'سجل الفواتير', 'Invoice History')}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── TAB 1: Current Invoice ── */}
        <TabsContent value="invoice" className="mt-4">
          {invoices.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-16 text-center flex flex-col items-center gap-2 text-muted-foreground">
                <Receipt className="h-10 w-10 opacity-30" />
                <p className="font-bold text-sm">{t(locale, 'لا توجد فواتير حتى الآن', 'No invoices yet')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invoices.slice(0, 1).map((inv: any) => (
                <Card key={inv.id} className="border-border bg-card overflow-hidden">
                  <CardHeader className="pb-3 bg-muted/20 border-b border-border">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-brand" />
                        {t(locale, 'الفاتورة الحالية', 'Current Invoice')} #{inv.id.slice(-6).toUpperCase()}
                      </CardTitle>
                      <Badge className={`border text-xs font-bold px-2 ${inv.status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' : inv.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        {inv.status === 'PAID' ? t(locale, 'مدفوعة', 'Paid') : inv.status === 'OVERDUE' ? t(locale, 'متأخرة', 'Overdue') : t(locale, 'معلقة', 'Pending')}
                      </Badge>
                    </div>
                    {inv.periodStart && (
                      <p className="text-xs text-muted-foreground">
                        {t(locale, 'الفترة:', 'Period:')} {new Date(inv.periodStart).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')} — {inv.periodEnd ? new Date(inv.periodEnd).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : '—'}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {/* Line items */}
                    {JSON.parse(inv.items || '[]').map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-bold font-mono">{fmt(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-bold">{t(locale, 'الإجمالي المستحق', 'Total Due')}</span>
                      <span className="font-black text-xl text-brand font-mono">{fmt(inv.amount)}</span>
                    </div>
                    {inv.dueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {t(locale, 'تاريخ الاستحقاق:', 'Due date:')} {new Date(inv.dueDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </div>
                    )}
                    {inv.status !== 'PAID' && (
                      <Button className="w-full rounded-xl gap-2 bg-brand hover:bg-brand/90 text-navy font-bold" onClick={() => document.getElementById('pay-tab')?.click()}>
                        <CreditCard className="h-4 w-4" />
                        {t(locale, 'ادفع هذه الفاتورة', 'Pay This Invoice')}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── TAB 2: Choose / Change Plan ── */}
        <TabsContent value="plans" className="mt-4 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm font-bold text-muted-foreground">{t(locale, 'مدة الاشتراك:', 'Billing cycle:')}</p>
            <div className="flex gap-2">
              <Button size="sm" variant={billingCycle === 'MONTHLY' ? 'default' : 'outline'} className="rounded-xl text-xs font-bold" onClick={() => setBillingCycle('MONTHLY')}>
                {t(locale, 'شهري', 'Monthly')}
              </Button>
              <Button size="sm" variant={billingCycle === 'ANNUAL' ? 'default' : 'outline'} className="rounded-xl text-xs font-bold gap-1" onClick={() => setBillingCycle('ANNUAL')}>
                {t(locale, 'سنوي', 'Annual')}
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 border text-[10px]">-20%</Badge>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {packages.map((pkg: any, idx: number) => {
              const isSelected = selectedPackageId === pkg.id;
              const isCurrent  = sub?.packageId === pkg.id;
              const price = billingCycle === 'ANNUAL' ? pkg.price * 0.8 : pkg.price;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-brand shadow-lg shadow-brand/10 bg-brand/5' : 'border-border hover:border-brand/40 bg-card'}`}
                >
                  {isCurrent && (
                    <div className="absolute -top-2.5 start-3">
                      <Badge className="bg-green-500 text-white border-0 text-[10px] font-bold">{t(locale, 'باقتك الحالية', 'Current Plan')}</Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${pkg.color}20`, color: pkg.color }}>
                      {PLAN_ICONS[idx] || <Package className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-black text-sm" style={{ color: pkg.color }}>{locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}</h3>
                      <p className="text-[10px] text-muted-foreground">{t(locale, `عمولة ${pkg.commissionRate}%`, `${pkg.commissionRate}% commission`)}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="font-black text-2xl">{fmt(price)}</span>
                    <span className="text-xs text-muted-foreground">/{t(locale, 'شهر', 'mo')}</span>
                    {billingCycle === 'ANNUAL' && <p className="text-[10px] text-green-500 font-bold mt-0.5">{t(locale, `وفّر ${fmt(pkg.price * 12 * 0.2)} سنوياً`, `Save ${fmt(pkg.price * 12 * 0.2)}/year`)}</p>}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500 shrink-0" /><span>{pkg.maxProducts === -1 ? t(locale, 'منتجات غير محدودة', 'Unlimited products') : t(locale, `${pkg.maxProducts} منتج`, `${pkg.maxProducts} products`)}</span></div>
                    <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500 shrink-0" /><span>{pkg.maxMonthlyOrders === -1 ? t(locale, 'طلبات غير محدودة', 'Unlimited orders') : t(locale, `${pkg.maxMonthlyOrders} طلب/شهر`, `${pkg.maxMonthlyOrders} orders/mo`)}</span></div>
                    {pkg.hasAnalytics && <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500 shrink-0" /><span>{t(locale, 'تحليلات متقدمة', 'Advanced analytics')}</span></div>}
                    {pkg.hasCoupons && <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500 shrink-0" /><span>{t(locale, 'الكوبونات والخصومات', 'Coupons & discounts')}</span></div>}
                    {pkg.hasCustomDomain && <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500 shrink-0" /><span>{t(locale, 'نطاق مخصص', 'Custom domain')}</span></div>}
                    {!pkg.hasAnalytics && <div className="flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" /><span className="text-muted-foreground/50">{t(locale, 'تحليلات متقدمة', 'Advanced analytics')}</span></div>}
                  </div>
                  {isSelected && <div className="mt-3 flex items-center gap-1.5 text-brand text-xs font-bold"><CheckCircle2 className="h-4 w-4" />{t(locale, 'تم الاختيار', 'Selected')}</div>}
                </div>
              );
            })}
          </div>

          {selectedPackageId && (
            <Card className="border-brand/30 bg-brand/5">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-sm">{t(locale, 'ملخص الطلب', 'Order Summary')}</p>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{locale === 'ar' ? selectedPackage?.name : (selectedPackage?.nameEn || selectedPackage?.name)} — {billingCycle === 'ANNUAL' ? t(locale, 'سنوي', 'Annual') : t(locale, 'شهري', 'Monthly')}</p>
                      <p className="text-brand font-black text-lg">{fmt(billingCycle === 'ANNUAL' ? totalMonthly * 12 : totalMonthly)}</p>
                      {billingCycle === 'ANNUAL' && <p className="text-green-500">{t(locale, `يُدفع سنوياً (${fmt(totalMonthly)}/شهر)`, `Billed annually (${fmt(totalMonthly)}/mo)`)}</p>}
                    </div>
                  </div>
                  <Button
                    className="gap-2 rounded-xl bg-brand hover:bg-brand/90 text-navy font-bold w-full sm:w-auto shrink-0"
                    disabled={isSubscribing}
                    onClick={handleSubscribe}
                  >
                    {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {sub ? t(locale, 'تغيير الباقة', 'Change Plan') : t(locale, 'اشترك الآن', 'Subscribe Now')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── TAB 3: Add-ons ── */}
        <TabsContent value="addons" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {ADDON_LIST.map((addon) => {
                const price = addonPrice(addon.settingKey, addon.defaultPrice);
                const isOn = addon.isCounter ? Number(addonState[addon.key] || 0) > 0 : Boolean(addonState[addon.key]);
                const count = Number(addonState.extraPos || 0);
                return (
                  <Card key={addon.key} className={`border-2 transition-all ${isOn ? 'border-brand/40 bg-brand/5' : 'border-border bg-card'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isOn ? 'bg-brand/20 text-brand' : 'bg-muted text-muted-foreground'}`}>
                          {addon.iconEl}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{locale === 'ar' ? addon.labelAr : addon.labelEn}</p>
                          <p className="text-xs text-muted-foreground">{fmt(price)}/{t(locale, 'شهر', 'mo')}</p>
                        </div>
                        {addon.isCounter ? (
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg" onClick={() => setAddonState(s => ({ ...s, extraPos: Math.max(0, count - 1) }))} disabled={!addonState.pos}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-bold text-sm w-5 text-center">{count}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg" onClick={() => setAddonState(s => ({ ...s, extraPos: count + 1 }))} disabled={!addonState.pos}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Switch
                            checked={Boolean(addonState[addon.key])}
                            onCheckedChange={(v) => setAddonState(s => ({ ...s, [addon.key]: v, ...(addon.key === 'pos' && !v ? { extraPos: 0 } : {}) }))}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                className="w-full rounded-xl gap-2 bg-brand hover:bg-brand/90 text-navy font-bold"
                disabled={isSubscribing}
                onClick={async () => {
                  setIsSubscribing(true);
                  try {
                    const res = await fetch('/api/billing/addons', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user?.id, ...addonState }),
                    });
                    const data = await res.json();
                    if (data.success) { toast.success(t(locale, 'تم تحديث الإضافات بنجاح!', 'Add-ons updated!')); fetchData(); }
                    else throw new Error(data.error);
                  } catch (err: any) { toast.error(err.message); }
                  finally { setIsSubscribing(false); }
                }}
              >
                {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t(locale, 'حفظ الميزات الإضافية', 'Save Add-ons')}
              </Button>
            </div>

            {/* Add-ons live preview */}
            <Card className="border-border bg-card h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">{t(locale, 'ملخص الفاتورة الشهرية', 'Monthly Billing Summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{locale === 'ar' ? sub?.package?.name : (sub?.package?.nameEn || t(locale, 'الباقة', 'Plan'))}</span>
                  <span className="font-mono font-bold">{fmt(sub?.package?.price ?? 0)}</span>
                </div>
                {ADDON_LIST.map((addon) => {
                  const isOn = addon.isCounter ? Number(addonState[addon.key] || 0) > 0 : Boolean(addonState[addon.key]);
                  if (!isOn) return null;
                  const price = addon.isCounter
                    ? Number(addonState.extraPos) * addonPrice(addon.settingKey, addon.defaultPrice)
                    : addonPrice(addon.settingKey, addon.defaultPrice);
                  return (
                    <div key={addon.key} className="flex justify-between">
                      <span className="text-muted-foreground text-xs">{locale === 'ar' ? addon.labelAr : addon.labelEn}{addon.isCounter ? ` ×${addonState.extraPos}` : ''}</span>
                      <span className="font-mono font-bold text-xs">{fmt(price)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-bold">{t(locale, 'الإجمالي / شهر', 'Total / month')}</span>
                  <span className="font-black text-brand font-mono">{fmt((sub?.package?.price ?? 0) + addonsTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 4: Payment ── */}
        <TabsContent value="pay" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CCP Payment */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  🏦 {t(locale, 'الدفع عبر بريدي / CCP', 'Pay via CCP / BaridiMob')}
                </CardTitle>
                <CardDescription className="text-xs">{t(locale, 'قم بالتحويل على الحساب أدناه ثم أرفق صورة الوصل', 'Transfer to the account below then attach the receipt')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Account Info */}
                <div className="rounded-xl bg-muted/40 border border-border p-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">{t(locale, 'اسم الحساب:', 'Account Name:')}</span>
                    <span className="font-bold">{ccpName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">RIP:</span>
                    <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded-lg select-all break-all">{ccpRip}</span>
                  </div>
                </div>

                <form onSubmit={handleCCPPayment} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{t(locale, 'المبلغ المدفوع', 'Amount Paid')}</Label>
                    <Input
                      type="number"
                      placeholder={`e.g. 5000`}
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      className="rounded-xl h-9 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{t(locale, 'صورة الوصل (رابط أو base64)', 'Receipt Image (URL or base64)')}</Label>
                    <Input
                      placeholder={t(locale, 'الصق رابط صورة الوصل هنا...', 'Paste receipt image link here...')}
                      value={payReceipt}
                      onChange={e => setPayReceipt(e.target.value)}
                      className="rounded-xl h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{t(locale, 'ملاحظة (اختياري)', 'Note (optional)')}</Label>
                    <Textarea
                      placeholder={t(locale, 'مثال: تم الدفع عبر بريدي موب برقم عملية...', 'e.g. Paid via BaridiMob transaction #...')}
                      value={payNote}
                      onChange={e => setPayNote(e.target.value)}
                      className="rounded-xl text-xs h-16 resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl gap-2 font-bold" disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {t(locale, 'إرسال الوصل للمراجعة', 'Submit Receipt for Review')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Card Payment */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  💳 {t(locale, 'الدفع ببطاقة آلي (فوري)', 'Pay by Card (Instant)')}
                </CardTitle>
                <CardDescription className="text-xs">{t(locale, 'تسديد فوري وتفعيل حسابك مباشرة دون انتظار', 'Instant payment and immediate account activation')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCardPayment} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{t(locale, 'رقم البطاقة', 'Card Number')}</Label>
                    <Input placeholder="1234 5678 9012 3456" value={cardNum} onChange={e => setCardNum(e.target.value)} className="rounded-xl h-9 font-mono" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t(locale, 'تاريخ الانتهاء', 'Expiry')}</Label>
                      <Input placeholder="MM/YY" value={cardExp} onChange={e => setCardExp(e.target.value)} className="rounded-xl h-9 font-mono" maxLength={5} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">CVV</Label>
                      <Input placeholder="123" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="rounded-xl h-9 font-mono" maxLength={4} type="password" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{t(locale, 'المبلغ المراد دفعه', 'Amount to Pay')}</Label>
                    <Input type="number" placeholder="e.g. 1500" value={cardAmt} onChange={e => setCardAmt(e.target.value)} className="rounded-xl h-9 font-mono" />
                  </div>
                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground p-2 rounded-xl bg-muted/30">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {t(locale, 'هذه بيئة تجريبية. لا يتم تحصيل مبالغ حقيقية.', 'This is a test environment. No real charges are made.')}
                  </div>
                  <Button type="submit" className="w-full rounded-xl gap-2 bg-green-600 hover:bg-green-700 text-white font-bold" disabled={isCardPay}>
                    {isCardPay ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {t(locale, 'ادفع وفعّل فوراً', 'Pay & Activate Instantly')}
                  </Button>
                </form>

                {/* Receipts History mini-list */}
                {receipts.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs font-bold mb-2">{t(locale, 'آخر الإيصالات المرسلة', 'Recent Submitted Receipts')}</p>
                    <div className="space-y-2">
                      {receipts.slice(0, 3).map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${r.status === 'approved' ? 'bg-green-500' : r.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
                            <span className="font-mono">{fmt(r.amount)}</span>
                          </div>
                          <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 5: Invoice History ── */}
        <TabsContent value="history" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="ps-4 text-start">{t(locale, 'رقم الفاتورة', 'Invoice #')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'النوع', 'Type')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'المبلغ', 'Amount')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'الحالة', 'Status')}</TableHead>
                      <TableHead className="text-start pe-4">{t(locale, 'التاريخ', 'Date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          {t(locale, 'لا توجد فواتير بعد', 'No invoices yet')}
                        </TableCell>
                      </TableRow>
                    ) : invoices.map((inv: any) => (
                      <TableRow key={inv.id}>
                        <TableCell className="ps-4 font-mono text-xs">#{inv.id.slice(-6).toUpperCase()}</TableCell>
                        <TableCell className="text-xs">
                          {inv.type === 'SUBSCRIPTION' ? t(locale, '📦 اشتراك', '📦 Subscription') :
                           inv.type === 'COMMISSION_BATCH' ? t(locale, '💰 عمولات', '💰 Commissions') :
                           inv.type === 'ADDON' ? t(locale, '✨ إضافات', '✨ Add-ons') : inv.type}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-sm">{fmt(inv.amount)}</TableCell>
                        <TableCell>
                          <Badge className={`border text-[10px] font-bold ${inv.status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' : inv.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500 border-red-500/20' : inv.status === 'WAIVED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                            {inv.status === 'PAID' ? t(locale, 'مدفوعة', 'Paid') : inv.status === 'OVERDUE' ? t(locale, 'متأخرة', 'Overdue') : inv.status === 'WAIVED' ? t(locale, 'معفية', 'Waived') : t(locale, 'معلقة', 'Pending')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground pe-4">
                          {new Date(inv.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
