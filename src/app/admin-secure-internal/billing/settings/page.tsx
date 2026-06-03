'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  Loader2, Save, Plus, Trash2, Edit2, Check, X, 
  Settings, DollarSign, Wallet, CalendarDays, PlusCircle,
  ToggleLeft, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b mb-4">
      {icon}
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
    </div>
  );
}

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

export default function BillingSettingsPage() {
  const { isAdminAuthenticated, adminUser } = useAdminAuthStore();
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const fmt = useCallback((n: number) => {
    const symbol = locale === 'ar' ? 'د.ج' : 'DZD';
    return `${n.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} ${symbol}`;
  }, [locale]);

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingAddon, setIsSavingAddon] = useState(false);

  // Platform Settings States
  const [enableSubs, setEnableSubs] = useState(true);
  const [enableTrial, setEnableTrial] = useState(true);
  const [trialDays, setTrialDays] = useState('14');
  const [autoSuspend, setAutoSuspend] = useState(true);
  const [suspendGraceDays, setSuspendGraceDays] = useState('7');

  const [enableCommissions, setEnableCommissions] = useState(true);
  const [enableDebt, setEnableDebt] = useState(true);
  const [defaultCommType, setDefaultCommType] = useState('percentage');
  const [defaultCommValue, setDefaultCommValue] = useState('10');
  const [globalDebtLimit, setGlobalDebtLimit] = useState('-5000');

  const [ccpName, setCcpName] = useState('');
  const [ccpRip, setCcpRip] = useState('');

  // Addons States
  const [addons, setAddons] = useState<any[]>([]);
  const [editingAddon, setEditingAddon] = useState<any | null>(null);
  const [addonForm, setAddonForm] = useState({
    id: '',
    key: '',
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: '0',
    isCounter: false,
    isActive: true,
    sortOrder: '0'
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      window.location.href = getAdminPath('login');
    }
  }, [isMounted, isAdminAuthenticated]);

  const fetchAllData = useCallback(async () => {
    if (!isAdminAuthenticated) return;
    setIsLoading(true);
    try {
      const [settingsRes, addonsRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/addons')
      ]);

      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings) {
        const s = settingsData.settings;
        if (s.billing_enable_subscriptions !== undefined) setEnableSubs(s.billing_enable_subscriptions === 'true' || s.billing_enable_subscriptions === true);
        if (s.billing_enable_trial !== undefined) setEnableTrial(s.billing_enable_trial === 'true' || s.billing_enable_trial === true);
        if (s.billing_trial_days) setTrialDays(s.billing_trial_days);
        if (s.billing_auto_suspend !== undefined) setAutoSuspend(s.billing_auto_suspend === 'true' || s.billing_auto_suspend === true);
        if (s.billing_suspend_grace_days) setSuspendGraceDays(s.billing_suspend_grace_days);
        if (s.billing_enable_commissions !== undefined) setEnableCommissions(s.billing_enable_commissions === 'true' || s.billing_enable_commissions === true);
        if (s.billing_enable_debt !== undefined) setEnableDebt(s.billing_enable_debt === 'true' || s.billing_enable_debt === true);
        if (s.billing_default_commission_type) setDefaultCommType(s.billing_default_commission_type);
        if (s.billing_default_commission_value) setDefaultCommValue(s.billing_default_commission_value);
        if (s.billing_global_debt_limit) setGlobalDebtLimit(s.billing_global_debt_limit);
        if (s.ccp_account_name) setCcpName(s.ccp_account_name);
        if (s.ccp_account_rip) setCcpRip(s.ccp_account_rip);
      }

      const addonsData = await addonsRes.json();
      if (addonsData.success) {
        setAddons(addonsData.addons || []);
      }
    } catch (err) {
      console.error('Error fetching settings data:', err);
      toast.error(t(locale, 'فشل تحميل الإعدادات', 'Failed to load settings'));
    } finally {
      setIsLoading(false);
    }
  }, [isAdminAuthenticated, locale]);

  useEffect(() => {
    if (isMounted) {
      fetchAllData();
    }
  }, [isMounted, fetchAllData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser?.id,
          settings: {
            billing_enable_subscriptions: enableSubs,
            billing_enable_trial: enableTrial,
            billing_trial_days: trialDays,
            billing_auto_suspend: autoSuspend,
            billing_suspend_grace_days: suspendGraceDays,
            billing_enable_commissions: enableCommissions,
            billing_enable_debt: enableDebt,
            billing_default_commission_type: defaultCommType,
            billing_default_commission_value: defaultCommValue,
            billing_global_debt_limit: globalDebtLimit,
            ccp_account_name: ccpName,
            ccp_account_rip: ccpRip,
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حفظ إعدادات المنصة بنجاح ✅', 'Platform settings saved successfully ✅'));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل حفظ الإعدادات', 'Failed to save settings'));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleOpenAddonForm = (addon: any | null = null) => {
    if (addon) {
      setEditingAddon(addon);
      setAddonForm({
        id: addon.id,
        key: addon.key,
        nameAr: addon.nameAr,
        nameEn: addon.nameEn,
        descriptionAr: addon.descriptionAr || '',
        descriptionEn: addon.descriptionEn || '',
        price: String(addon.price),
        isCounter: addon.isCounter ?? false,
        isActive: addon.isActive ?? true,
        sortOrder: String(addon.sortOrder ?? 0)
      });
    } else {
      setEditingAddon({ id: 'new' });
      setAddonForm({
        id: '',
        key: '',
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        price: '0',
        isCounter: false,
        isActive: true,
        sortOrder: '0'
      });
    }
  };

  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonForm.key || !addonForm.nameAr || !addonForm.nameEn) {
      toast.error(t(locale, 'يرجى ملء جميع الحقول المطلوبة', 'Please fill all required fields'));
      return;
    }
    setIsSavingAddon(true);
    try {
      const isNew = editingAddon?.id === 'new';
      const url = '/api/admin/addons';
      const method = isNew ? 'POST' : 'PATCH';
      
      const payload = isNew 
        ? { ...addonForm, id: undefined }
        : addonForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          isNew 
            ? t(locale, 'تمت إضافة الميزة الإضافية بنجاح 🎉', 'Add-on created successfully 🎉')
            : t(locale, 'تم تحديث الميزة الإضافية بنجاح ✅', 'Add-on updated successfully ✅')
        );
        setEditingAddon(null);
        fetchAllData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل حفظ الإضافة', 'Failed to save add-on'));
    } finally {
      setIsSavingAddon(false);
    }
  };

  const handleDeleteAddon = async (id: string) => {
    if (!confirm(t(locale, 'هل أنت متأكد من حذف هذه الميزة الإضافية نهائياً؟', 'Are you sure you want to delete this add-on permanently?'))) return;
    try {
      const res = await fetch(`/api/admin/addons?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حذف الإضافة بنجاح', 'Add-on deleted successfully'));
        fetchAllData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل حذف الإضافة', 'Failed to delete add-on'));
    }
  };

  if (!isMounted || !isAdminAuthenticated) return null;

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center gap-4 mb-6">
        <Link href={getAdminPath('')}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-rose-500" />
            {t(locale, 'إعدادات المنصة والعمولة والخدمات', 'Platform & Commission Settings')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(locale, 'تحكم في شروط الاشتراك، نسب العمولات، وإدارة الخدمات الإضافية المتاحة للتجار', 'Manage subscriptions, commission rates, and dynamic add-on settings for merchants')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 min-h-[50vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground font-medium">
            {t(locale, 'جاري تحميل الإعدادات...', 'Loading platform settings...')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Platform & Commission forms (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Section A: Subscriptions */}
              <Card className="border-border bg-card shadow-sm hover:shadow transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-rose-500" />
                    {t(locale, 'نظام الاشتراكات الفعّال', 'Subscription System Settings')}
                  </CardTitle>
                  <CardDescription>
                    {t(locale, 'تحديد شروط الفترة التجريبية وتفعيل الفوترة الإلزامية للمتاجر', 'Configure trial periods, billing settings and automatic suspension policies')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SwitchRow
                      id="enable_subs"
                      checked={enableSubs}
                      onCheckedChange={setEnableSubs}
                      label={t(locale, 'تفعيل نظام الاشتراكات بالمنصة', 'Enable Subscriptions')}
                    />
                    <SwitchRow
                      id="enable_trial"
                      checked={enableTrial}
                      onCheckedChange={setEnableTrial}
                      label={t(locale, 'تفعيل الفترة التجريبية للمشتركين الجدد', 'Enable Trial Period')}
                    />
                    <div className="sm:col-span-2">
                      <SwitchRow
                        id="auto_suspend"
                        checked={autoSuspend}
                        onCheckedChange={setAutoSuspend}
                        label={t(locale, 'تعليق حساب التاجر تلقائياً فور انتهاء صلاحية الباقة', 'Auto-suspend on Subscription Expiry')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="trialDays" className="text-xs font-semibold">
                        {t(locale, 'مدة الفترة التجريبية (بالأيام)', 'Trial Duration (days)')}
                      </Label>
                      <Input
                        id="trialDays"
                        type="number"
                        min="0"
                        value={trialDays}
                        onChange={e => setTrialDays(e.target.value)}
                        className="h-9 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="suspendGraceDays" className="text-xs font-semibold">
                        {t(locale, 'فترة السماح قبل التعليق (أيام)', 'Grace Period Before Suspension (days)')}
                      </Label>
                      <Input
                        id="suspendGraceDays"
                        type="number"
                        min="0"
                        value={suspendGraceDays}
                        onChange={e => setSuspendGraceDays(e.target.value)}
                        className="h-9 rounded-xl font-mono font-bold"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section B: Commissions */}
              <Card className="border-border bg-card shadow-sm hover:shadow transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                    {t(locale, 'إعدادات العمولات والمديونية', 'Commission & Debt Settings')}
                  </CardTitle>
                  <CardDescription>
                    {t(locale, 'تعيين قيمة العمولة الافتراضية والحد الأقصى لمديونية المتجر قبل تجميده', 'Configure platform default commissions, debt accumulation and max debt ceilings')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SwitchRow
                      id="enable_commissions"
                      checked={enableCommissions}
                      onCheckedChange={setEnableCommissions}
                      label={t(locale, 'تفعيل العمولات على مبيعات التجار', 'Enable Sales Commissions')}
                    />
                    <SwitchRow
                      id="enable_debt"
                      checked={enableDebt}
                      onCheckedChange={setEnableDebt}
                      label={t(locale, 'تراكم العمولات كمديونية (خصم مستقبلي)', 'Accumulate Commissions as Debt')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="defaultCommType" className="text-xs font-semibold">
                        {t(locale, 'نوع العمولة الافتراضية', 'Default Commission Type')}
                      </Label>
                      <Select value={defaultCommType} onValueChange={setDefaultCommType}>
                        <SelectTrigger className="h-9 rounded-xl text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="percentage">{t(locale, 'نسبة مئوية (%)', 'Percentage (%)')}</SelectItem>
                          <SelectItem value="fixed">{t(locale, 'مبلغ ثابت', 'Fixed Amount')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="defaultCommValue" className="text-xs font-semibold">
                        {t(locale, 'قيمة العمولة الافتراضية', 'Default Commission Value')}
                      </Label>
                      <Input
                        id="defaultCommValue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={defaultCommValue}
                        onChange={e => setDefaultCommValue(e.target.value)}
                        className="h-9 rounded-xl font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="globalDebtLimit" className="text-xs font-semibold">
                        {t(locale, 'سقف المديونية الأقصى (سالب)', 'Max Debt Limit (negative DZD)')}
                      </Label>
                      <Input
                        id="globalDebtLimit"
                        type="number"
                        max="0"
                        value={globalDebtLimit}
                        onChange={e => setGlobalDebtLimit(e.target.value)}
                        className="h-9 rounded-xl font-mono font-bold text-red-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section C: CCP Payment Info */}
              <Card className="border-border bg-card shadow-sm hover:shadow transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-indigo-500" />
                    {t(locale, 'معلومات حساب الدفع البريدي (CCP)', 'Postal Payment Details (CCP)')}
                  </CardTitle>
                  <CardDescription>
                    {t(locale, 'تعديل بيانات الحساب الجاري الموصى بها ليقوم التجار بتحويل المستحقات إليه', 'Modify details where merchants submit subscription bank slips')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ccpName" className="text-xs font-semibold">
                      {t(locale, 'اسم الحساب الجاري (الاسم الكامل)', 'CCP Account Owner Name')}
                    </Label>
                    <Input
                      id="ccpName"
                      value={ccpName}
                      onChange={e => setCcpName(e.target.value)}
                      className="h-9 rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ccpRip" className="text-xs font-semibold">
                      {t(locale, 'رقم الحساب البريدي / RIP', 'RIP / Account Number')}
                    </Label>
                    <Input
                      id="ccpRip"
                      value={ccpRip}
                      onChange={e => setCcpRip(e.target.value)}
                      className="h-9 rounded-xl font-mono"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSavingSettings} className="gap-2 px-8 rounded-xl font-bold">
                  {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {t(locale, 'حفظ جميع الإعدادات العامة', 'Save All Settings')}
                </Button>
              </div>
            </form>
          </div>

          {/* Add-ons CRUD Dashboard (Right 1 col) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border bg-card shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-emerald-500" />
                    {t(locale, 'الميزات والخدمات الإضافية', 'Optional Add-ons')}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {addons.length} {t(locale, 'ميزات معرّفة', 'defined features')}
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1" onClick={() => handleOpenAddonForm(null)}>
                  <Plus className="h-3.5 w-3.5" />
                  {t(locale, 'إضافة ميزة', 'Add Feature')}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto border-t">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-xs text-start ps-4">{t(locale, 'الميزة', 'Add-on')}</TableHead>
                        <TableHead className="text-xs text-start">{t(locale, 'السعر', 'Price')}</TableHead>
                        <TableHead className="text-xs text-center pe-4">{t(locale, 'إجراءات', 'Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addons.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-10 text-muted-foreground text-xs font-semibold">
                            {t(locale, 'لا توجد خدمات إضافية بعد', 'No add-ons created yet')}
                          </TableCell>
                        </TableRow>
                      ) : addons.map(addon => (
                        <TableRow key={addon.id} className={!addon.isActive ? 'opacity-60 bg-muted/10' : ''}>
                          <TableCell className="ps-4">
                            <div className="text-xs font-bold">
                              {locale === 'ar' ? addon.nameAr : addon.nameEn}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {addon.key}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-bold font-mono text-brand">
                            {fmt(addon.price)}
                          </TableCell>
                          <TableCell className="pe-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-indigo-500 hover:text-indigo-700"
                                onClick={() => handleOpenAddonForm(addon)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteAddon(addon.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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

            {/* Addon modal/form card when active */}
            {editingAddon && (
              <Card className="border-brand/40 shadow-md bg-card">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>
                      {editingAddon.id === 'new' 
                        ? t(locale, '➕ ميزة جديدة', 'Create Add-on') 
                        : t(locale, '📝 تعديل ميزة', 'Edit Add-on')
                      }
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted" onClick={() => setEditingAddon(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleSaveAddon} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">{t(locale, 'المفتاح الفريد (إنجليزي فقط)', 'Addon Key (unique EN)')} *</Label>
                      <Input
                        required
                        placeholder="e.g. mobile_app"
                        disabled={editingAddon.id !== 'new'}
                        value={addonForm.key}
                        onChange={e => setAddonForm(f => ({ ...f, key: e.target.value }))}
                        className="h-9 rounded-xl font-mono text-xs font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'الاسم بالعربية', 'Name (AR)')} *</Label>
                        <Input
                          required
                          value={addonForm.nameAr}
                          onChange={e => setAddonForm(f => ({ ...f, nameAr: e.target.value }))}
                          className="h-9 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'الاسم بالإنجليزية', 'Name (EN)')} *</Label>
                        <Input
                          required
                          value={addonForm.nameEn}
                          onChange={e => setAddonForm(f => ({ ...f, nameEn: e.target.value }))}
                          className="h-9 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'سعر الميزة (دج / شهرياً)', 'Monthly Price (DZD)')}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={addonForm.price}
                          onChange={e => setAddonForm(f => ({ ...f, price: e.target.value }))}
                          className="h-9 rounded-xl font-mono text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'ترتيب العرض', 'Sort Order')}</Label>
                        <Input
                          type="number"
                          value={addonForm.sortOrder}
                          onChange={e => setAddonForm(f => ({ ...f, sortOrder: e.target.value }))}
                          className="h-9 rounded-xl font-mono text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">{t(locale, 'الوصف (عربي)', 'Description (AR)')}</Label>
                      <Input
                        value={addonForm.descriptionAr}
                        onChange={e => setAddonForm(f => ({ ...f, descriptionAr: e.target.value }))}
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">{t(locale, 'الوصف (إنجليزي)', 'Description (EN)')}</Label>
                      <Input
                        value={addonForm.descriptionEn}
                        onChange={e => setAddonForm(f => ({ ...f, descriptionEn: e.target.value }))}
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center gap-2 py-1 px-2 border rounded-xl bg-muted/20">
                        <Switch
                          id="isCounter"
                          checked={addonForm.isCounter}
                          onCheckedChange={v => setAddonForm(f => ({ ...f, isCounter: v }))}
                        />
                        <Label htmlFor="isCounter" className="text-xs cursor-pointer select-none">
                          {t(locale, 'عداد أجهزة / كميات', 'Counter-based')}
                        </Label>
                      </div>

                      <div className="flex items-center gap-2 py-1 px-2 border rounded-xl bg-muted/20">
                        <Switch
                          id="addonActive"
                          checked={addonForm.isActive}
                          onCheckedChange={v => setAddonForm(f => ({ ...f, isActive: v }))}
                        />
                        <Label htmlFor="addonActive" className="text-xs cursor-pointer select-none">
                          {t(locale, 'الميزة نشطة', 'Active')}
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setEditingAddon(null)}>
                        {t(locale, 'إلغاء', 'Cancel')}
                      </Button>
                      <Button type="submit" size="sm" disabled={isSavingAddon} className="gap-1.5 rounded-xl font-bold bg-brand text-navy">
                        {isSavingAddon ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        {t(locale, 'حفظ الميزة', 'Save Addon')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
