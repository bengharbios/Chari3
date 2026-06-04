'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings, Package, Users, FileText, BarChart3,
  Loader2, Save, Check, X, Eye, Search, Filter,
  TrendingUp, AlertCircle, Clock, ShieldOff, Wallet,
  ChevronDown, ChevronUp, RefreshCw, CalendarDays, DollarSign,
  Smartphone, MessageSquare, LayoutDashboard, Monitor, PlusSquare, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── helpers ─────────────────────────────────────────────────────────────────
const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

interface BillingManagerProps {
  currency?: string;
}

// ─── status helpers ───────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  TRIAL:           { ar: 'تجريبي',         en: 'Trial',           color: 'bg-blue-500/10 text-blue-600 border-blue-200'      },
  PENDING_PAYMENT: { ar: 'في انتظار الدفع', en: 'Pending Payment', color: 'bg-amber-500/10 text-amber-600 border-amber-200'    },
  ACTIVE:          { ar: 'نشط',            en: 'Active',          color: 'bg-green-500/10 text-green-600 border-green-200'    },
  EXPIRED:         { ar: 'منتهي',          en: 'Expired',         color: 'bg-gray-500/10 text-gray-500 border-gray-200'       },
  SUSPENDED:       { ar: 'موقوف',          en: 'Suspended',       color: 'bg-red-500/10 text-red-600 border-red-200'          },
  CANCELLED:       { ar: 'ملغى',           en: 'Cancelled',       color: 'bg-slate-500/10 text-slate-500 border-slate-200'    },
};

function StatusBadge({ status, locale }: { status: string; locale: string }) {
  const cfg = STATUS_LABELS[status] ?? { ar: status, en: status, color: 'bg-muted text-muted-foreground' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
      {t(locale, cfg.ar, cfg.en)}
    </span>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b mb-4">
      {icon}
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
    </div>
  );
}

// ─── Switch row ───────────────────────────────────────────────────────────────
function SwitchRow({
  id, checked, onCheckedChange, label,
}: {
  id: string; checked: boolean; onCheckedChange: (v: boolean) => void; label: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/20 border hover:bg-muted/30 transition-colors">
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BillingManager({ currency = 'DZD' }: BillingManagerProps) {
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const fmt = useCallback((n: number) => {
    const symbolMap: Record<string, string> = {
      DZD: locale === 'ar' ? 'د.ج' : 'DZD',
      SAR: locale === 'ar' ? 'ر.س' : 'SAR',
      USD: '$',
      EUR: '€',
    };
    const symbol = symbolMap[currency] || currency;
    return `${n.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} ${symbol}`;
  }, [locale, currency]);

  // ── loading / saving state ────────────────────────────────────────────────
  const [isLoading, setIsLoading]       = useState(true);
  const [isSaving, setIsSaving]         = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── tab 1: platform settings ──────────────────────────────────────────────
  // Section A: Subscription System
  const [billingEnableSubscriptions, setBillingEnableSubscriptions] = useState(true);
  const [billingEnableTrial, setBillingEnableTrial]                 = useState(true);
  const [billingTrialDays, setBillingTrialDays]                     = useState('14');
  const [billingAutoSuspend, setBillingAutoSuspend]                 = useState(true);
  const [billingSuspendGraceDays, setBillingSuspendGraceDays]       = useState('7');

  // Section B: Commission System
  const [billingEnableCommissions, setBillingEnableCommissions] = useState(true);
  const [billingEnableDebt, setBillingEnableDebt]               = useState(true);
  const [billingGlobalDebtLimit, setBillingGlobalDebtLimit]     = useState('-5000');

  // Section C: Payment & Account
  const [ccpAccountName, setCcpAccountName] = useState('شاري داي إكسبريس');
  const [ccpAccountRip, setCcpAccountRip]   = useState('007999990023456789 45');

  // Section D: Add-on Pricing
  const [priceAddonMobileApp,  setPriceAddonMobileApp]  = useState('2000');
  const [priceAddonWhatsapp,   setPriceAddonWhatsapp]   = useState('2500');
  const [priceAddonCrm,        setPriceAddonCrm]        = useState('1500');
  const [priceAddonPos,        setPriceAddonPos]        = useState('1500');
  const [priceAddonExtraPos,   setPriceAddonExtraPos]   = useState('500');

  // ── tab 2: packages ───────────────────────────────────────────────────────
  const [packages, setPackages]               = useState<any[]>([]);
  const [editingPackage, setEditingPackage]   = useState<any>(null);
  const [isSavingPackage, setIsSavingPackage] = useState(false);

  // ── tab 3: merchants ──────────────────────────────────────────────────────
  const [subscriptions, setSubscriptions]         = useState<any[]>([]);
  const [merchantSearch, setMerchantSearch]       = useState('');
  const [merchantStatusFilter, setMerchantStatusFilter] = useState('ALL');
  const [selectedMerchant, setSelectedMerchant]   = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    packageId: '',
    addDays: '',
    startDate: '',
    endDate: '',
    freeCommission: false,
    overrideNote: '',
  });
  const [isSavingMerchant, setIsSavingMerchant] = useState(false);

  // ── tab 4: pending slips ─────────────────────────────────────────────────
  const [pendingReceipts, setPendingReceipts]       = useState<any[]>([]);
  const [reviewReceipt, setReviewReceipt]           = useState<any>(null);
  const [adminNote, setAdminNote]                   = useState('');
  const [previewImageReceipt, setPreviewImageReceipt] = useState<any>(null);

  // ── tab 5: wallets & debts ───────────────────────────────────────────────
  const [adminUsers, setAdminUsers]                 = useState<any[]>([]);

  // ─── fetch all data in parallel ───────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsRes, packagesRes, subsRes, receiptsRes, usersRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/packages'),
        fetch('/api/admin/subscriptions'),
        fetch('/api/billing/receipts?status=pending'),
        fetch('/api/admin/users'),
      ]);

      // Settings
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings) {
        const s = settingsData.settings;
        if (s.billing_enable_subscriptions !== undefined) setBillingEnableSubscriptions(s.billing_enable_subscriptions === 'true' || s.billing_enable_subscriptions === true);
        if (s.billing_enable_trial !== undefined)         setBillingEnableTrial(s.billing_enable_trial === 'true' || s.billing_enable_trial === true);
        if (s.billing_trial_days)                         setBillingTrialDays(s.billing_trial_days);
        if (s.billing_auto_suspend !== undefined)         setBillingAutoSuspend(s.billing_auto_suspend === 'true' || s.billing_auto_suspend === true);
        if (s.billing_suspend_grace_days)                 setBillingSuspendGraceDays(s.billing_suspend_grace_days);
        if (s.billing_enable_commissions !== undefined)   setBillingEnableCommissions(s.billing_enable_commissions === 'true' || s.billing_enable_commissions === true);
        if (s.billing_enable_debt !== undefined)          setBillingEnableDebt(s.billing_enable_debt === 'true' || s.billing_enable_debt === true);
        if (s.billing_global_debt_limit)                  setBillingGlobalDebtLimit(s.billing_global_debt_limit);
        if (s.ccp_account_name)                           setCcpAccountName(s.ccp_account_name);
        if (s.ccp_account_rip)                            setCcpAccountRip(s.ccp_account_rip);
        if (s.price_addon_mobile_app)                     setPriceAddonMobileApp(s.price_addon_mobile_app);
        if (s.price_addon_whatsapp)                       setPriceAddonWhatsapp(s.price_addon_whatsapp);
        if (s.price_addon_crm)                            setPriceAddonCrm(s.price_addon_crm);
        if (s.price_addon_pos)                            setPriceAddonPos(s.price_addon_pos);
        if (s.price_addon_extra_pos)                      setPriceAddonExtraPos(s.price_addon_extra_pos);
      }

      // Packages
      const packagesData = await packagesRes.json();
      if (packagesData.success) setPackages(packagesData.packages || []);

      // Subscriptions
      const subsData = await subsRes.json();
      if (subsData.success) setSubscriptions(subsData.subscriptions || []);

      // Receipts
      const receiptsData = await receiptsRes.json();
      if (receiptsData.success) setPendingReceipts(receiptsData.receipts || []);

      // Users / Wallets
      const usersData = await usersRes.json();
      if (usersData.success) setAdminUsers(usersData.users || []);
    } catch (err) {
      console.error('BillingManager fetch error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── save platform settings ───────────────────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            billing_enable_subscriptions: billingEnableSubscriptions,
            billing_enable_trial:         billingEnableTrial,
            billing_trial_days:           billingTrialDays,
            billing_auto_suspend:         billingAutoSuspend,
            billing_suspend_grace_days:   billingSuspendGraceDays,
            billing_enable_commissions:   billingEnableCommissions,
            billing_enable_debt:          billingEnableDebt,
            billing_global_debt_limit:    billingGlobalDebtLimit,
            ccp_account_name:             ccpAccountName,
            ccp_account_rip:              ccpAccountRip,
            price_addon_mobile_app:       priceAddonMobileApp,
            price_addon_whatsapp:         priceAddonWhatsapp,
            price_addon_crm:              priceAddonCrm,
            price_addon_pos:              priceAddonPos,
            price_addon_extra_pos:        priceAddonExtraPos,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حفظ إعدادات المنصة بنجاح ✅', 'Platform settings saved successfully ✅'));
        fetchData();
      } else throw new Error(data.error);
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل حفظ الإعدادات', 'Failed to save settings'));
    } finally {
      setIsSaving(false);
    }
  };

  // ─── save package ─────────────────────────────────────────────────────────
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    setIsSavingPackage(true);
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPackage),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حفظ الباقة بنجاح 🎉', 'Package saved successfully 🎉'));
        setEditingPackage(null);
        fetchData();
      } else throw new Error(data.error);
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل حفظ الباقة', 'Failed to save package'));
    } finally {
      setIsSavingPackage(false);
    }
  };

  // ─── open merchant edit ───────────────────────────────────────────────────
  const openMerchantEdit = (sub: any) => {
    setSelectedMerchant(sub);
    setEditForm({
      status:          sub.status || '',
      packageId:       sub.packageId || sub.package?.id || '',
      addDays:         '',
      startDate:       sub.startDate ? new Date(sub.startDate).toISOString().slice(0, 10) : '',
      endDate:         sub.endDate ? new Date(sub.endDate).toISOString().slice(0, 10) : '',
      freeCommission:  sub.freeCommission ?? false,
      overrideNote:    sub.overrideNote || '',
    });
  };

  // ─── save merchant subscription ──────────────────────────────────────────
  const handleSaveMerchant = async () => {
    if (!selectedMerchant) return;
    setIsSavingMerchant(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${selectedMerchant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status:         editForm.status || undefined,
          packageId:      editForm.packageId || undefined,
          addDays:        editForm.addDays ? parseInt(editForm.addDays) : undefined,
          startDate:      editForm.startDate || undefined,
          endDate:        editForm.endDate || undefined,
          freeCommission: editForm.freeCommission,
          overrideNote:   editForm.overrideNote || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم تحديث بيانات التاجر بنجاح ✅', 'Merchant subscription updated ✅'));
        setSelectedMerchant(null);
        fetchData();
      } else throw new Error(data.error);
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل تحديث البيانات', 'Failed to update subscription'));
    } finally {
      setIsSavingMerchant(false);
    }
  };

  // ─── approve / reject receipt ─────────────────────────────────────────────
  const handleReviewReceipt = async (status: 'approved' | 'rejected') => {
    if (!reviewReceipt) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/billing/receipts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId: reviewReceipt.id, status, adminNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          status === 'approved'
            ? t(locale, 'تمت الموافقة وتحديث محفظة التاجر 🎉', 'Approved and wallet updated 🎉')
            : t(locale, 'تم رفض الإيصال وإشعار التاجر.', 'Slip rejected and merchant notified.')
        );
        setReviewReceipt(null);
        setAdminNote('');
        fetchData();
      } else throw new Error(data.error);
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشلت معالجة الطلب', 'Failed to process request'));
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── filtered subscriptions ───────────────────────────────────────────────
  const filteredSubs = subscriptions.filter((sub) => {
    const name  = (sub.user?.name || sub.user?.email || '').toLowerCase();
    const store = (sub.user?.store?.name || sub.user?.sellerProfile?.storeName || '').toLowerCase();
    const q     = merchantSearch.toLowerCase();
    const matchQ = !q || name.includes(q) || store.includes(q);
    const matchS = merchantStatusFilter === 'ALL' || sub.status === merchantStatusFilter;
    return matchQ && matchS;
  });

  // ─── revenue stats ────────────────────────────────────────────────────────
  const activeSubs       = subscriptions.filter(s => s.status === 'ACTIVE');
  const suspendedSubs    = subscriptions.filter(s => s.status === 'SUSPENDED');
  const now              = new Date();
  const endOfMonth       = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const expiringThisMonth = subscriptions.filter(s => {
    if (!s.endDate) return false;
    const d = new Date(s.endDate);
    return d >= now && d <= endOfMonth;
  });
  const monthlyRevenue = activeSubs.reduce((sum, s) => sum + (s.package?.price || s.totalMonthly || 0), 0);

  // ─── loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <p className="text-sm text-muted-foreground font-medium">
          {t(locale, 'جاري تحميل بيانات الفوترة...', 'Loading billing data...')}
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div dir={dir} className="space-y-4 text-start">
      <Tabs defaultValue="platform-settings" className="space-y-4">
        {/* ── Tab list ── */}
        <div className="overflow-x-auto pb-1 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-6">
          <TabsList className="bg-muted/30 p-1 flex-wrap h-auto inline-flex rounded-2xl border">
          <TabsTrigger value="settings" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <Settings className="h-3.5 w-3.5" />{t(locale, 'الإعدادات العامة', 'Settings')}
          </TabsTrigger>
          <TabsTrigger value="packages" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <Package className="h-3.5 w-3.5" />{t(locale, 'الباقات', 'Packages')}
          </TabsTrigger>
          <TabsTrigger value="merchants" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5" />{t(locale, 'التجار والاشتراكات', 'Merchants')}
          </TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <TrendingUp className="h-3.5 w-3.5" />{t(locale, 'تقارير الإيرادات', 'Revenue Reports')}
          </TabsTrigger>
          <TabsTrigger value="pending-slips" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            {t(locale, 'مراجعة الإيصالات', 'Pending Slips')}
            {pendingReceipts.length > 0 && (
              <Badge variant="destructive" className="ms-1 px-1.5 py-0 min-w-4 h-4 flex items-center justify-center text-[10px] rounded-full border-0">
                {pendingReceipts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

          <Link href="/admin-secure-internal/billing/wallets">
            <Button variant="outline" size="sm" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 bg-card hover:bg-brand/10 hover:text-brand transition-colors border-brand/20">
              <Wallet className="h-4 w-4" />
              {t(locale, 'المحافظ والمديونيات', 'Wallets & Debts')}
            </Button>
          </Link>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1 — Platform Settings
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="settings">
          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Section A */}
            <Card className="border-border bg-card">
              <CardContent className="pt-5 space-y-3">
                <SectionHeading
                  icon={<CalendarDays className="h-4 w-4 text-brand" />}
                  title={t(locale, 'أ. نظام الاشتراكات', 'A. Subscription System')}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SwitchRow
                    id="billing_enable_subscriptions"
                    checked={billingEnableSubscriptions}
                    onCheckedChange={setBillingEnableSubscriptions}
                    label={t(locale, 'تفعيل نظام الاشتراكات', 'Enable Subscriptions')}
                  />
                  <SwitchRow
                    id="billing_enable_trial"
                    checked={billingEnableTrial}
                    onCheckedChange={setBillingEnableTrial}
                    label={t(locale, 'تفعيل الفترة التجريبية', 'Enable Trial Period')}
                  />
                  <SwitchRow
                    id="billing_auto_suspend"
                    checked={billingAutoSuspend}
                    onCheckedChange={setBillingAutoSuspend}
                    label={t(locale, 'تعليق تلقائي عند انتهاء الاشتراك', 'Auto-suspend on Expiry')}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="billing_trial_days" className="text-xs font-semibold">
                      {t(locale, 'مدة التجربة (أيام)', 'Trial Duration (days)')}
                    </Label>
                    <Input
                      id="billing_trial_days"
                      type="number"
                      value={billingTrialDays}
                      onChange={e => setBillingTrialDays(e.target.value)}
                      className="h-9 rounded-xl font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="billing_suspend_grace_days" className="text-xs font-semibold">
                      {t(locale, 'مهلة قبل التعليق (أيام)', 'Grace Days Before Suspension')}
                    </Label>
                    <Input
                      id="billing_suspend_grace_days"
                      type="number"
                      value={billingSuspendGraceDays}
                      onChange={e => setBillingSuspendGraceDays(e.target.value)}
                      className="h-9 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section B */}
            <Card className="border-border bg-card">
              <CardContent className="pt-5 space-y-3">
                <SectionHeading
                  icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                  title={t(locale, 'ب. نظام العمولات', 'B. Commission System')}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SwitchRow
                    id="billing_enable_commissions"
                    checked={billingEnableCommissions}
                    onCheckedChange={setBillingEnableCommissions}
                    label={t(locale, 'تفعيل العمولات على المبيعات', 'Enable Sales Commissions')}
                  />
                  <SwitchRow
                    id="billing_enable_debt"
                    checked={billingEnableDebt}
                    onCheckedChange={setBillingEnableDebt}
                    label={t(locale, 'تراكم العمولة كمديونية', 'Accumulate as Debt')}
                  />
                </div>
                <div className="pt-2 max-w-sm">
                  <div className="space-y-1.5">
                    <Label htmlFor="billing_global_debt_limit" className="text-xs font-semibold">
                      {t(locale, 'سقف المديونية الأقصى (سالب)', 'Max Debt Limit (negative)')}
                    </Label>
                    <Input
                      id="billing_global_debt_limit"
                      type="number"
                      value={billingGlobalDebtLimit}
                      onChange={e => setBillingGlobalDebtLimit(e.target.value)}
                      className="h-9 rounded-xl font-mono font-bold text-red-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section C */}
            <Card className="border-border bg-card">
              <CardContent className="pt-5 space-y-3">
                <SectionHeading
                  icon={<Wallet className="h-4 w-4 text-indigo-500" />}
                  title={t(locale, 'ج. معلومات حساب الدفع (CCP)', 'C. Payment Account (CCP)')}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ccp_account_name" className="text-xs font-semibold">
                      {t(locale, 'اسم حساب CCP', 'CCP Account Name')}
                    </Label>
                    <Input
                      id="ccp_account_name"
                      value={ccpAccountName}
                      onChange={e => setCcpAccountName(e.target.value)}
                      className="h-9 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ccp_account_rip" className="text-xs font-semibold">
                      {t(locale, 'رقم RIP', 'RIP Number')}
                    </Label>
                    <Input
                      id="ccp_account_rip"
                      value={ccpAccountRip}
                      onChange={e => setCcpAccountRip(e.target.value)}
                      className="h-9 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section D */}
            <Card className="border-border bg-card">
              <CardContent className="pt-5 space-y-3">
                <SectionHeading
                  icon={<PlusSquare className="h-4 w-4 text-green-500" />}
                  title={t(locale, 'د. أسعار الإضافات (دج / شهرياً)', 'D. Add-on Pricing (DZD / month)')}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { id: 'price_addon_mobile_app',  val: priceAddonMobileApp,  set: setPriceAddonMobileApp,  icon: <Smartphone className="h-4 w-4 text-brand" />,           label: t(locale, 'تطبيق هاتف', 'Mobile App') },
                    { id: 'price_addon_whatsapp',    val: priceAddonWhatsapp,   set: setPriceAddonWhatsapp,   icon: <MessageSquare className="h-4 w-4 text-green-500" />,      label: t(locale, 'واتساب', 'WhatsApp') },
                    { id: 'price_addon_crm',         val: priceAddonCrm,        set: setPriceAddonCrm,        icon: <LayoutDashboard className="h-4 w-4 text-purple-500" />,   label: t(locale, 'نظام CRM', 'CRM') },
                    { id: 'price_addon_pos',         val: priceAddonPos,        set: setPriceAddonPos,        icon: <Monitor className="h-4 w-4 text-amber-500" />,            label: t(locale, 'برنامج POS', 'POS App') },
                    { id: 'price_addon_extra_pos',   val: priceAddonExtraPos,   set: setPriceAddonExtraPos,   icon: <Monitor className="h-4 w-4 text-orange-400" />,           label: t(locale, 'جهاز POS إضافي', 'Extra POS') },
                  ].map(({ id, val, set, icon, label }) => (
                    <div key={id} className="space-y-1.5">
                      <Label htmlFor={id} className="text-[10px] font-semibold flex items-center gap-1">
                        {icon}{label}
                      </Label>
                      <Input
                        id={id}
                        type="number"
                        value={val}
                        onChange={e => set(e.target.value)}
                        className="h-9 rounded-xl font-mono text-center font-bold"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving} className="gap-2 px-8 rounded-xl">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t(locale, 'حفظ إعدادات المنصة', 'Save Platform Settings')}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2 — Packages
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="packages">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left: packages list */}
            <Card className="md:col-span-1 border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-500" />
                  {t(locale, 'الباقات النشطة', 'Active Plans')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(locale, 'اختر باقة لتعديلها', 'Select a plan to edit')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {packages.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">
                    {t(locale, 'لا توجد باقات', 'No packages found')}
                  </div>
                ) : packages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => setEditingPackage({ ...pkg })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      editingPackage?.id === pkg.id
                        ? 'border-brand bg-brand/5 shadow-sm'
                        : 'border-border hover:border-brand/40 hover:bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm" style={{ color: pkg.color }}>
                        {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                      </h4>
                      <Badge className="text-[10px] font-bold shrink-0">{fmt(pkg.price)}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                      {pkg.description || t(locale, 'لا يوجد وصف', 'No description')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Right: package edit form */}
            <Card className="md:col-span-2 border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Settings className="h-4 w-4 text-indigo-500" />
                  {t(locale, 'تعديل الباقة', 'Edit Plan')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(locale, 'تعديل خصائص وحدود ومميزات الباقة المختارة', 'Edit quotas, pricing and features of the selected plan')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingPackage ? (
                  <form onSubmit={handleSavePackage} className="space-y-5">
                    {/* Names */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'اسم الباقة (عربي)', 'Name (AR)')}</Label>
                        <Input
                          value={editingPackage.name}
                          onChange={e => setEditingPackage({ ...editingPackage, name: e.target.value })}
                          className="h-9 rounded-xl font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'الاسم (إنجليزي)', 'Name (EN)')}</Label>
                        <Input
                          value={editingPackage.nameEn || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, nameEn: e.target.value })}
                          className="h-9 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Pricing & Commission */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'السعر الشهري (دج)', 'Monthly Price')}</Label>
                        <Input type="number" value={editingPackage.price}
                          onChange={e => setEditingPackage({ ...editingPackage, price: parseFloat(e.target.value) || 0 })}
                          className="h-9 rounded-xl font-bold font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'نسبة العمولة (%)', 'Commission (%)')}</Label>
                        <Input type="number" value={editingPackage.commissionRate}
                          onChange={e => setEditingPackage({ ...editingPackage, commissionRate: parseFloat(e.target.value) || 0 })}
                          className="h-9 rounded-xl font-bold font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'أعضاء الفريق', 'Team Members')}</Label>
                        <Input type="number" value={editingPackage.maxTeamMembers}
                          onChange={e => setEditingPackage({ ...editingPackage, maxTeamMembers: parseInt(e.target.value) || 1 })}
                          className="h-9 rounded-xl font-bold font-mono" />
                      </div>
                    </div>

                    {/* Quotas */}
                    <div className="grid grid-cols-3 gap-4 border-t pt-4">
                      {[
                        { key: 'maxProducts',      label: t(locale, 'الحد الأقصى للمنتجات', 'Max Products') },
                        { key: 'maxMonthlyOrders', label: t(locale, 'الطلبات الشهرية', 'Monthly Orders') },
                        { key: 'maxLandingPages',  label: t(locale, 'صفحات الهبوط', 'Landing Pages') },
                      ].map(({ key, label }) => (
                        <div key={key} className="space-y-1.5">
                          <Label className="text-xs font-semibold">{label}</Label>
                          <Input type="number" value={editingPackage[key]}
                            onChange={e => setEditingPackage({ ...editingPackage, [key]: parseInt(e.target.value) || 0 })}
                            className="h-9 rounded-xl font-bold font-mono" />
                          <p className="text-[9px] text-muted-foreground">{t(locale, '-1 للغير محدود', '-1 for unlimited')}</p>
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    <div className="border-t pt-4 space-y-3">
                      <Label className="text-xs font-bold text-indigo-600">
                        🛡️ {t(locale, 'الميزات المضمنة', 'Included Features')}
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {[
                          { key: 'hasCustomDomain',       label: t(locale, 'نطاق مخصص', 'Custom Domain') },
                          { key: 'hasPixels',             label: t(locale, 'بيكسلات (Meta/Google)', 'Pixels') },
                          { key: 'hasMultiCurrency',      label: t(locale, 'عملات متعددة', 'Multi Currency') },
                          { key: 'hasDataExport',         label: t(locale, 'تصدير البيانات', 'Data Export') },
                          { key: 'hasEmailSupport',       label: t(locale, 'دعم بريدي', 'Email Support') },
                          { key: 'hasBusinessIntelligence', label: t(locale, 'ذكاء الأعمال BI', 'Business Intelligence') },
                          { key: 'hasGA4',                label: 'Google Analytics (GA4)' },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2 p-2.5 border rounded-xl bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors text-xs font-medium">
                            <input
                              type="checkbox"
                              checked={!!editingPackage[key]}
                              onChange={e => setEditingPackage({ ...editingPackage, [key]: e.target.checked })}
                              className="rounded accent-brand"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditingPackage(null)}>
                        {t(locale, 'إلغاء', 'Cancel')}
                      </Button>
                      <Button type="submit" disabled={isSavingPackage} className="gap-2 rounded-xl">
                        {isSavingPackage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {t(locale, 'حفظ الباقة', 'Save Plan')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Package className="h-12 w-12 text-muted-foreground/25" />
                    <p className="text-sm font-bold text-center">
                      {t(locale, 'اختر باقة من القائمة لتعديلها', 'Select a plan on the left to start editing')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 3 — Merchants & Subscriptions
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="merchants">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand" />
                    {t(locale, 'التجار والاشتراكات', 'Merchants & Subscriptions')}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {subscriptions.length} {t(locale, 'اشتراك مسجل', 'subscriptions total')}
                  </CardDescription>
                </div>
                {/* Search + Filter */}
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute start-2.5 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder={t(locale, 'بحث عن تاجر...', 'Search merchant...')}
                      value={merchantSearch}
                      onChange={e => setMerchantSearch(e.target.value)}
                      className="ps-8 h-8 text-xs w-48 rounded-xl"
                    />
                  </div>
                  <Select value={merchantStatusFilter} onValueChange={setMerchantStatusFilter}>
                    <SelectTrigger className="h-8 text-xs rounded-xl w-40">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder={t(locale, 'الحالة', 'Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t(locale, 'الكل', 'All')}</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([val, cfg]) => (
                        <SelectItem key={val} value={val}>{t(locale, cfg.ar, cfg.en)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-xl" onClick={() => fetchData()}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start ps-4 text-xs">{t(locale, 'المتجر / التاجر', 'Merchant')}</TableHead>
                      <TableHead className="text-start text-xs">{t(locale, 'الباقة', 'Plan')}</TableHead>
                      <TableHead className="text-start text-xs">{t(locale, 'الحالة', 'Status')}</TableHead>
                      <TableHead className="text-start text-xs">{t(locale, 'تاريخ الانتهاء', 'Expiry')}</TableHead>
                      <TableHead className="text-start text-xs">{t(locale, 'الفاتورة الحالية', 'Current Bill')}</TableHead>
                      <TableHead className="text-start text-xs pe-4">{t(locale, 'إجراءات', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-14 text-muted-foreground text-sm font-bold">
                          {t(locale, 'لا توجد نتائج مطابقة', 'No matching subscriptions found')}
                        </TableCell>
                      </TableRow>
                    ) : filteredSubs.map(sub => (
                      <React.Fragment key={sub.id}>
                        <TableRow className={selectedMerchant?.id === sub.id ? 'bg-brand/5' : ''}>
                          <TableCell className="ps-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarFallback className="text-[10px] bg-brand/10 text-brand font-bold">
                                  {sub.user?.name?.charAt(0) || 'T'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-xs">
                                <p className="font-bold">{sub.user?.name || '—'}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{sub.user?.email || '—'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold">
                            {locale === 'ar'
                              ? (sub.package?.name || '—')
                              : (sub.package?.nameEn || sub.package?.name || '—')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={sub.status} locale={locale} />
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {sub.endDate
                              ? new Date(sub.endDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-brand font-mono">
                            {sub.totalMonthly != null ? fmt(sub.totalMonthly) : (sub.package?.price != null ? fmt(sub.package.price) : '—')}
                          </TableCell>
                          <TableCell className="pe-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {(() => {
                                const rec = pendingReceipts.find(r => r.userId === sub.userId || r.userId === sub.user?.id);
                                if (rec) {
                                  return (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-7 px-3 text-xs rounded-lg gap-1 bg-amber-500 hover:bg-amber-600 text-white font-bold"
                                      onClick={() => { setReviewReceipt(rec); setAdminNote(rec.adminNote || ''); }}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      {t(locale, 'معاينة الإيصال', 'View Receipt')}
                                    </Button>
                                  );
                                }
                                return null;
                              })()}
                              <Button
                                size="sm"
                                variant={selectedMerchant?.id === sub.id ? 'default' : 'outline'}
                                className="h-7 px-3 text-xs rounded-lg gap-1"
                                onClick={() => selectedMerchant?.id === sub.id ? setSelectedMerchant(null) : openMerchantEdit(sub)}
                              >
                                {selectedMerchant?.id === sub.id
                                  ? <><ChevronUp className="h-3.5 w-3.5" />{t(locale, 'إغلاق', 'Close')}</>
                                  : <><ChevronDown className="h-3.5 w-3.5" />{t(locale, 'تعديل', 'Edit')}</>
                                }
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Inline edit panel */}
                        {selectedMerchant?.id === sub.id && (
                          <TableRow className="bg-brand/5 hover:bg-brand/5">
                            <TableCell colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Status */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">{t(locale, 'تغيير الحالة', 'Change Status')}</Label>
                                  <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                                    <SelectTrigger className="h-9 rounded-xl text-xs w-full">
                                      <SelectValue placeholder={t(locale, 'اختر الحالة', 'Select status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(STATUS_LABELS).map(([val, cfg]) => (
                                        <SelectItem key={val} value={val}>{t(locale, cfg.ar, cfg.en)}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Package */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">{t(locale, 'تغيير الباقة', 'Change Plan')}</Label>
                                  <Select value={editForm.packageId} onValueChange={v => setEditForm(f => ({ ...f, packageId: v }))}>
                                    <SelectTrigger className="h-9 rounded-xl text-xs w-full">
                                      <SelectValue placeholder={t(locale, 'اختر الباقة', 'Select plan')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {packages.map(pkg => (
                                        <SelectItem key={pkg.id} value={pkg.id}>
                                          {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Add Days */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">{t(locale, 'إضافة أيام', 'Add Days')}</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={editForm.addDays}
                                    onChange={e => setEditForm(f => ({ ...f, addDays: e.target.value }))}
                                    className="h-9 rounded-xl font-mono"
                                  />
                                </div>

                                {/* Start Date */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">{t(locale, 'تاريخ البدء', 'Start Date')}</Label>
                                  <Input
                                    type="date"
                                    value={editForm.startDate}
                                    onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))}
                                    className="h-9 rounded-xl font-mono text-xs"
                                  />
                                </div>

                                {/* End Date */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">{t(locale, 'تاريخ الانتهاء', 'End Date')}</Label>
                                  <Input
                                    type="date"
                                    value={editForm.endDate}
                                    onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))}
                                    className="h-9 rounded-xl font-mono text-xs"
                                  />
                                </div>

                                {/* Free Commission */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">{t(locale, 'إعفاء من العمولة', 'Free Commission')}</Label>
                                  <div className="flex items-center gap-2 py-2 px-3 border rounded-xl bg-muted/20">
                                    <Switch
                                      id={`freeCommission-${sub.id}`}
                                      checked={editForm.freeCommission}
                                      onCheckedChange={v => setEditForm(f => ({ ...f, freeCommission: v }))}
                                    />
                                    <Label htmlFor={`freeCommission-${sub.id}`} className="text-xs cursor-pointer">
                                      {editForm.freeCommission
                                        ? t(locale, 'معفى من العمولة', 'Commission exempt')
                                        : t(locale, 'غير معفى', 'Not exempt')}
                                    </Label>
                                  </div>
                                </div>

                                {/* Override Note (spans 2 cols) */}
                                <div className="space-y-1.5 sm:col-span-2">
                                  <Label className="text-xs font-semibold">{t(locale, 'ملاحظة خاصة', 'Override Note')}</Label>
                                  <Textarea
                                    placeholder={t(locale, 'ملاحظة خاصة بهذا الاشتراك...', 'Special note for this subscription...')}
                                    value={editForm.overrideNote}
                                    onChange={e => setEditForm(f => ({ ...f, overrideNote: e.target.value }))}
                                    className="h-16 rounded-xl text-xs"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedMerchant(null)}>
                                  {t(locale, 'إلغاء', 'Cancel')}
                                </Button>
                                <Button size="sm" disabled={isSavingMerchant} className="gap-1.5 rounded-xl" onClick={handleSaveMerchant}>
                                  {isSavingMerchant ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                  {t(locale, 'حفظ التعديلات', 'Save Changes')}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* ════════════════════════════════════════════════════════════════════
            TAB 5 — Pending Slips
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="pending-slips">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    {t(locale, 'مراجعة الإيصالات المعلقة', 'Review Pending Payment Slips')}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {pendingReceipts.length} {t(locale, 'إيصال في انتظار المراجعة', 'slips awaiting review')}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 rounded-xl gap-1.5 text-xs" onClick={() => fetchData()}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t(locale, 'تحديث', 'Refresh')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start ps-4 text-xs">{t(locale, 'التاجر', 'Merchant')}</TableHead>
                      <TableHead className="text-start text-xs">{t(locale, 'معاينة الإيصال', 'Slip Preview')}</TableHead>
                      <TableHead className="text-start text-xs">{t(locale, 'المبلغ', 'Amount')}</TableHead>
                      <TableHead className="text-start text-xs">{t(locale, 'ملاحظة التاجر', 'Merchant Note')}</TableHead>
                      <TableHead className="text-start text-xs">{t(locale, 'تاريخ التقديم', 'Submitted')}</TableHead>
                      <TableHead className="text-start text-xs pe-4">{t(locale, 'الإجراءات', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReceipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-14 text-muted-foreground font-bold text-sm">
                          <div className="flex flex-col items-center gap-2">
                            <Check className="h-8 w-8 text-green-400" />
                            {t(locale, 'لا توجد إيصالات معلقة حالياً 🎉', 'No pending slips — all clear! 🎉')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : pendingReceipts.map(rec => (
                      <TableRow key={rec.id}>
                        <TableCell className="ps-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarFallback className="text-[10px] bg-amber-500/10 text-amber-600 font-bold">
                                {rec.user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                              <p className="font-bold">{rec.user?.name || '—'}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{rec.user?.email || '—'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {rec.receiptImage ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImageReceipt(rec)}
                              className="w-12 h-10 rounded-lg border bg-muted/30 overflow-hidden hover:border-brand transition-colors flex items-center justify-center"
                            >
                              <img src={rec.receiptImage} alt="slip" className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <div className="w-12 h-10 rounded-lg border bg-muted/30 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-bold font-mono text-brand">
                          {fmt(rec.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate" title={rec.merchantNote}>
                          {rec.merchantNote || '—'}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {new Date(rec.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="pe-4">
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline"
                              className="h-7 px-2 text-xs gap-1 rounded-lg"
                              onClick={() => { setReviewReceipt(rec); setAdminNote(''); }}>
                              <Eye className="h-3.5 w-3.5" />
                              {t(locale, 'مراجعة', 'Review')}
                            </Button>
                            <Button size="sm"
                              className="h-7 px-2 text-xs gap-1 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => { setReviewReceipt(rec); setAdminNote(''); }}>
                              <Check className="h-3.5 w-3.5" />
                              {t(locale, 'قبول', 'Approve')}
                            </Button>
                            <Button size="sm" variant="destructive"
                              className="h-7 px-2 text-xs gap-1 rounded-lg"
                              onClick={() => { setReviewReceipt(rec); setAdminNote(''); }}>
                              <X className="h-3.5 w-3.5" />
                              {t(locale, 'رفض', 'Reject')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* The Review dialog is moved to a global overlay below */}

          {previewImageReceipt && (
            <div
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setPreviewImageReceipt(null)}
            >
              <div className="max-w-2xl w-full rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <img
                  src={previewImageReceipt.receiptImage}
                  alt="Receipt Full Preview"
                  className="w-full object-contain rounded-2xl"
                />
                <div className="bg-card border-t p-3 flex justify-end rounded-b-2xl">
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPreviewImageReceipt(null)}>
                    {t(locale, 'إغلاق', 'Close')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 5 — Revenue Report
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="revenue">
          <div className="space-y-5">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                {
                  label: t(locale, 'اشتراكات نشطة', 'Active Subscriptions'),
                  value: activeSubs.length.toString(),
                  icon: <TrendingUp className="h-5 w-5 text-green-500" />,
                  color: 'text-green-600',
                  bg: 'bg-green-500/10 border-green-200',
                },
                {
                  label: t(locale, 'إيرادات هذا الشهر (متوقعة)', 'Monthly Revenue (est.)'),
                  value: fmt(monthlyRevenue),
                  icon: <DollarSign className="h-5 w-5 text-brand" />,
                  color: 'text-brand',
                  bg: 'bg-brand/10 border-brand/20',
                },
                {
                  label: t(locale, 'تنتهي هذا الشهر', 'Expiring This Month'),
                  value: expiringThisMonth.length.toString(),
                  icon: <CalendarDays className="h-5 w-5 text-amber-500" />,
                  color: 'text-amber-600',
                  bg: 'bg-amber-500/10 border-amber-200',
                },
                {
                  label: t(locale, 'إيصالات معلقة', 'Pending Slips'),
                  value: pendingReceipts.length.toString(),
                  icon: <Clock className="h-5 w-5 text-orange-500" />,
                  color: 'text-orange-600',
                  bg: 'bg-orange-500/10 border-orange-200',
                },
                {
                  label: t(locale, 'متاجر موقوفة', 'Suspended Merchants'),
                  value: suspendedSubs.length.toString(),
                  icon: <ShieldOff className="h-5 w-5 text-red-500" />,
                  color: 'text-red-600',
                  bg: 'bg-red-500/10 border-red-200',
                },
              ].map(({ label, value, icon, color, bg }) => (
                <Card key={label} className={`border ${bg}`}>
                  <CardContent className="pt-5 pb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {icon}
                      <p className="text-xs text-muted-foreground font-medium leading-tight">{label}</p>
                    </div>
                    <p className={`text-2xl font-black font-mono ${color}`}>{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Status breakdown */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  {t(locale, 'توزيع الاشتراكات حسب الحالة', 'Subscription Distribution by Status')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(STATUS_LABELS).map(([status, cfg]) => {
                    const count = subscriptions.filter(s => s.status === status).length;
                    return (
                      <div key={status} className="flex items-center justify-between p-3 rounded-xl border bg-muted/10">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={status} locale={locale} />
                        </div>
                        <span className="text-lg font-black font-mono">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by package */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-500" />
                  {t(locale, 'الإيرادات حسب الباقة (اشتراكات نشطة)', 'Revenue by Plan (Active Subs)')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {packages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">{t(locale, 'لا توجد بيانات كافية', 'No data available yet')}</p>
                ) : (
                  <div className="space-y-3">
                    {packages.map(pkg => {
                      const pkgActiveSubs = activeSubs.filter(s => s.packageId === pkg.id || s.package?.id === pkg.id);
                      const pkgRevenue = pkgActiveSubs.length * (pkg.price || 0);
                      const pct = monthlyRevenue > 0 ? (pkgRevenue / monthlyRevenue) * 100 : 0;
                      return (
                        <div key={pkg.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold" style={{ color: pkg.color }}>
                              {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">{pkgActiveSubs.length} {t(locale, 'مشترك', 'subs')}</span>
                              <span className="font-bold font-mono text-brand">{fmt(pkgRevenue)}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: pkg.color || 'var(--brand)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t flex justify-between text-sm font-bold">
                      <span>{t(locale, 'الإجمالي المتوقع شهرياً', 'Estimated Monthly Total')}</span>
                      <span className="text-brand font-mono">{fmt(monthlyRevenue)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Global Receipt Review Modal */}
      {reviewReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setReviewReceipt(null)}>
          <div className="max-w-xl w-full" onClick={e => e.stopPropagation()}>
            <Card className="border-brand/40 bg-card shadow-2xl">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between bg-muted/20 rounded-t-xl">
                <div>
                  <CardTitle className="text-base font-black flex items-center gap-2 text-foreground">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    {t(locale, 'تفاصيل مراجعة الإيصال يدوياً', 'Review manual receipt details')}
                  </CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => setReviewReceipt(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3.5 border rounded-xl bg-muted/20">
                    <p className="text-muted-foreground mb-1 text-xs">{t(locale, 'التاجر المودع', 'Depositing Merchant')}</p>
                    <p className="font-bold">{reviewReceipt.user?.name}</p>
                  </div>
                  <div className="p-3.5 border border-brand/30 rounded-xl bg-brand/5">
                    <p className="text-muted-foreground mb-1 text-xs">{t(locale, 'المبلغ المصرّح به', 'Declared Amount')}</p>
                    <p className="font-black text-brand text-lg font-mono">{fmt(reviewReceipt.amount)}</p>
                  </div>
                </div>

                {reviewReceipt.merchantNote && (
                  <div className="p-3.5 rounded-xl border bg-yellow-500/10 border-yellow-500/20 text-sm">
                    <p className="text-amber-600 font-bold mb-1 text-xs">{t(locale, 'ملاحظة التاجر:', 'Merchant Note:')}</p>
                    <p className="text-foreground leading-relaxed">{reviewReceipt.merchantNote}</p>
                  </div>
                )}

                {/* Slip Preview image block */}
                {reviewReceipt.receiptImage && (
                  <div className="space-y-1.5 mt-2">
                    <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'مرفق مع طلب الاشتراك', 'Subscription receipt attachment')}</Label>
                    <div 
                      className="rounded-xl border-2 overflow-hidden bg-slate-900 aspect-video flex items-center justify-center cursor-zoom-in relative group shadow-inner"
                      onClick={() => setPreviewImageReceipt(reviewReceipt)}
                    >
                      <img src={reviewReceipt.receiptImage} alt="Receipt slip" className="max-h-56 object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 text-white text-sm font-bold gap-2">
                        <ExternalLink className="h-5 w-5" />
                        {t(locale, 'اضغط للتكبير', 'Click to zoom')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Note / Rejection Reason */}
                <div className="space-y-2 pt-3">
                  <Textarea
                    placeholder={t(locale, 'مثال: تم قبول الدفع بنجاح / أو: الصورة غير واضحة، يرجى إعادة الإرسال...', 'e.g. Payment approved successfully / or: Image is blurred, please resend...')}
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    className="h-20 rounded-xl text-sm border-2 focus-visible:ring-brand/30"
                  />
                  <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t(locale, '* حقل إلزامي فقط في حالة رفض الإيصال', '* Required only if rejecting the receipt')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-2">
                  <Button variant="outline" className="rounded-xl flex-1 h-11 text-sm font-bold shadow-sm" disabled={isProcessing} onClick={() => setReviewReceipt(null)}>
                    {t(locale, 'إلغاء', 'Cancel')}
                  </Button>
                  <Button variant="destructive" className="gap-2 rounded-xl flex-1 h-11 text-sm font-bold shadow-sm hover:shadow-red-500/20" disabled={isProcessing} onClick={() => handleReviewReceipt('rejected')}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    {t(locale, 'رفض الوصل', 'Reject Slip')}
                  </Button>
                  <Button className="gap-2 rounded-xl flex-1 h-11 text-sm bg-green-600 hover:bg-green-700 text-white font-bold shadow-sm hover:shadow-green-500/20" disabled={isProcessing} onClick={() => handleReviewReceipt('approved')}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {t(locale, 'موافقة وتفعيل', 'Approve & Activate')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
