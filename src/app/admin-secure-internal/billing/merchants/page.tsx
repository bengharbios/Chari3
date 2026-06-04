'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  Loader2, Save, Search, Filter, ChevronDown, ChevronUp,
  Users, Check, X, ShieldAlert, BadgePercent, AlertCircle,
  TrendingDown, RefreshCw, ArrowRight, UserCheck, UserX,
  ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  TRIAL:           { ar: 'تجريبي',         en: 'Trial',           color: 'bg-blue-500/10 text-blue-600 border-blue-200'      },
  PENDING_PAYMENT: { ar: 'في انتظار الدفع', en: 'Pending Payment', color: 'bg-amber-500/10 text-amber-600 border-amber-200'    },
  PENDING_APPROVAL: { ar: 'بانتظار الموافقة', en: 'Pending Approval', color: 'bg-amber-500/10 text-amber-600 border-amber-200'  },
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

export default function BillingMerchantsPage() {
  const { isAdminAuthenticated } = useAdminAuthStore();
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const [currency, setCurrency] = useState('DZD');

  const fmt = useCallback((n: number) => {
    return `${n.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} ${currency}`;
  }, [locale, currency]);

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data states
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  // Pagination and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit merchant drawer/form state
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    packageId: '',
    addDays: '',
    freeCommission: false,
    overrideNote: '',
  });

  useEffect(() => {
    setIsMounted(true);
    // Fetch public currency setting
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings?.currency) {
          setCurrency(data.settings.currency);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      window.location.href = getAdminPath('login');
    }
  }, [isMounted, isAdminAuthenticated]);

  const fetchSubscriptions = useCallback(async () => {
    if (!isAdminAuthenticated) return;
    setIsLoading(true);
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const statusParam = statusFilter !== 'ALL' ? `&status=${statusFilter}` : '';
      
      const res = await fetch(`/api/admin/subscriptions?page=${page}&limit=10${searchParam}${statusParam}`);
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      toast.error(t(locale, 'فشل تحميل الاشتراكات', 'Failed to load subscriptions'));
    } finally {
      setIsLoading(false);
    }
  }, [isAdminAuthenticated, searchQuery, statusFilter, page, locale]);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages || []);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchSubscriptions();
      fetchPackages();
    }
  }, [isMounted, page, statusFilter, fetchSubscriptions, fetchPackages]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  };

  const handleOpenEdit = (sub: any) => {
    if (selectedSub?.id === sub.id) {
      setSelectedSub(null);
    } else {
      setSelectedSub(sub);
      setEditForm({
        status: sub.status || '',
        packageId: sub.packageId || sub.package?.id || '',
        addDays: '',
        freeCommission: sub.freeCommission ?? false,
        overrideNote: sub.overrideNote || '',
      });
    }
  };

  const handleSaveSubscription = async (id: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حفظ التحديثات', 'Saved successfully'));
        setSelectedSub(null);
        fetchSubscriptions();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm(t(locale, 'هل أنت متأكد من حذف هذا الاشتراك تماماً؟ لا يمكن التراجع عن هذا.', 'Are you sure you want to delete this subscription? This cannot be undone.'))) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حذف الاشتراك بنجاح', 'Subscription deleted'));
        setSelectedSub(null);
        fetchSubscriptions();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting');
    } finally {
      setIsSaving(false);
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
            <Users className="h-6 w-6 text-emerald-500" />
            {t(locale, 'إدارة حسابات التجار والاشتراكات', 'Merchants & Subscriptions')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(locale, 'استعرض تفاصيل اشتراكات التجار والمديونيات الحالية، وقم بتمديد الصلاحية أو تعديل باقة المشتركين', 'Browse merchant subscription statuses, check outstanding wallet debts, extend plans, or manual overrides')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-1.5">
              <Label className="text-xs font-semibold">{t(locale, 'البحث عن تاجر', 'Search Merchant')}</Label>
              <div className="relative">
                <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t(locale, 'ابحث بالاسم أو البريد الإلكتروني للتاجر...', 'Search by merchant name or email...')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="ps-9 h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="w-full md:w-48 space-y-1.5">
              <Label className="text-xs font-semibold">{t(locale, 'تصفية حسب الحالة', 'Filter by Status')}</Label>
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="ALL">{t(locale, 'كل الحالات', 'All Statuses')}</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{t(locale, cfg.ar, cfg.en)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button type="submit" className="h-9 px-6 rounded-xl flex-1 md:flex-initial text-xs font-bold">
                {t(locale, 'تطبيق الفلتر', 'Apply Filter')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3 rounded-xl border-dashed"
                onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setPage(1); }}
              >
                {t(locale, 'إعادة تعيين', 'Reset')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-brand" />
              {t(locale, 'قائمة التجار والاشتراكات الحالية', 'Merchant Subscriptions')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t(locale, `تم العثور على ${totalCount} اشتراك إجمالياً`, `${totalCount} subscriptions found total`)}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-xl gap-1" onClick={fetchSubscriptions}>
            <RefreshCw className="h-3.5 w-3.5" />
            {t(locale, 'تحديث البيانات', 'Refresh')}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-start ps-4 text-xs">{t(locale, 'التاجر والبريد الإلكتروني', 'Merchant Details')}</TableHead>
                    <TableHead className="text-start text-xs">{t(locale, 'الباقة المفعّلة', 'Active Plan')}</TableHead>
                    <TableHead className="text-start text-xs">{t(locale, 'حالة الاشتراك', 'Subscription Status')}</TableHead>
                    <TableHead className="text-start text-xs">{t(locale, 'نهاية الفترة', 'Expiry Date')}</TableHead>
                    <TableHead className="text-start text-xs">{t(locale, 'الرسوم الشهرية', 'Monthly Cost')}</TableHead>
                    <TableHead className="text-start text-xs">{t(locale, 'رصيد المحفظة / المديونية', 'Wallet Balance / Debt')}</TableHead>
                    <TableHead className="text-start text-xs">{t(locale, 'الإعفاء من العمولة', 'Commission Exemption')}</TableHead>
                    <TableHead className="text-center text-xs pe-4">{t(locale, 'إجراءات', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16 text-muted-foreground text-sm font-bold">
                        {t(locale, 'لا توجد نتائج مطابقة لخيارات البحث 🔍', 'No matching merchant subscriptions found 🔍')}
                      </TableCell>
                    </TableRow>
                  ) : subscriptions.map(sub => {
                    const balance = sub.user?.wallet?.balance ?? 0;
                    const isNegative = balance < 0;
                    return (
                      <React.Fragment key={sub.id}>
                        <TableRow className={selectedSub?.id === sub.id ? 'bg-brand/5' : 'hover:bg-muted/5'}>
                          {/* User Details */}
                          <TableCell className="ps-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="text-xs bg-brand/10 text-brand font-bold">
                                  {sub.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-xs">
                                <p className="font-bold text-foreground">{sub.user?.name || '—'}</p>
                                <p className="text-[10px] text-muted-foreground font-mono leading-tight">{sub.user?.email || '—'}</p>
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* Active package */}
                          <TableCell className="text-xs font-bold">
                            {locale === 'ar'
                              ? (sub.package?.name || '—')
                              : (sub.package?.nameEn || sub.package?.name || '—')}
                          </TableCell>

                          {/* Status Badge */}
                          <TableCell>
                            <StatusBadge status={sub.status} locale={locale} />
                          </TableCell>

                          {/* Expiry Date */}
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {sub.endDate
                              ? new Date(sub.endDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                              : (sub.trialEndsAt 
                                  ? new Date(sub.trialEndsAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                  : '—'
                                )}
                          </TableCell>

                          {/* Monthly fee */}
                          <TableCell className="text-xs font-bold text-brand font-mono">
                            {sub.totalMonthly != null ? fmt(sub.totalMonthly) : (sub.package?.price != null ? fmt(sub.package.price) : '—')}
                          </TableCell>

                          {/* Wallet debt */}
                          <TableCell className={`text-xs font-bold font-mono ${isNegative ? 'text-red-500' : 'text-green-600'}`}>
                            {fmt(balance)}
                          </TableCell>

                          {/* Commission exempt */}
                          <TableCell>
                            {sub.freeCommission ? (
                              <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/15 border-green-200 text-[10px] font-bold">
                                {t(locale, 'معفى من العمولة ✅', 'Exempt ✅')}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground font-mono">—</span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="pe-4 text-center">
                            <Button
                              size="sm"
                              variant={selectedSub?.id === sub.id ? 'default' : 'outline'}
                              className="h-7 px-3 text-xs rounded-lg gap-1 font-bold"
                              onClick={() => handleOpenEdit(sub)}
                            >
                              {selectedSub?.id === sub.id
                                ? <><ChevronUp className="h-3.5 w-3.5" />{t(locale, 'إغلاق', 'Close')}</>
                                : <><ChevronDown className="h-3.5 w-3.5" />{t(locale, 'إدارة', 'Manage')}</>
                              }
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Premium Inline edit details block */}
                        {selectedSub?.id === sub.id && (
                          <TableRow className="bg-slate-50/60 dark:bg-slate-900/40 relative shadow-inner">
                            <TableCell colSpan={8} className="p-0 border-b-0">
                              <div className="relative border-s-4 border-brand p-6 xl:p-8 flex flex-col gap-6">
                                
                                {/* Header Section */}
                                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                                  <div>
                                    <h3 className="text-base font-black text-foreground flex items-center gap-2">
                                      <ShieldAlert className="h-5 w-5 text-amber-500" />
                                      {t(locale, 'لوحة تحكم الاشتراك المتقدمة', 'Advanced Subscription Control')}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {t(locale, 'قم بإدارة الباقة، التجاوزات اليدوية، ومعاينة الإيصالات الخاصة بهذا التاجر بصلاحيات الإدارة العليا.', 'Manage plan, manual overrides, and review receipts for this merchant with super-admin privileges.')}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={() => setSelectedSub(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                  
                                  {/* Left Column: Quick Actions (Cols 1-4) */}
                                  <div className="xl:col-span-4 flex flex-col gap-5 bg-background p-5 rounded-2xl border border-border/60 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <RefreshCw className="h-4 w-4 text-brand" />
                                      <span className="font-bold text-sm">{t(locale, 'إعدادات الباقة الأساسية', 'Core Plan Settings')}</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'حالة الاشتراك الحالية', 'Current Status')}</Label>
                                      <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                                        <SelectTrigger className="h-11 rounded-xl text-sm font-bold w-full bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-border transition-colors">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="text-sm font-bold">
                                          {Object.entries(STATUS_LABELS).map(([val, cfg]) => (
                                            <SelectItem key={val} value={val}>{t(locale, cfg.ar, cfg.en)}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'تغيير الباقة الفعالة', 'Active Package')}</Label>
                                      <Select value={editForm.packageId} onValueChange={v => setEditForm(f => ({ ...f, packageId: v }))}>
                                        <SelectTrigger className="h-11 rounded-xl text-sm font-bold w-full bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-border transition-colors">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="text-sm font-bold">
                                          {packages.map(pkg => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                              {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Center Column: Manual Overrides (Cols 5-8) */}
                                  <div className="xl:col-span-4 flex flex-col gap-5 bg-background p-5 rounded-2xl border border-border/60 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <AlertCircle className="h-4 w-4 text-brand" />
                                      <span className="font-bold text-sm">{t(locale, 'التجاوزات والتحكم اليدوي', 'Manual Overrides')}</span>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'إضافة أيام إضافية (هدية / تمديد)', 'Extend Validity (Days)')}</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder={t(locale, 'مثال: 15 يوم...', 'e.g., 15 days...')}
                                        value={editForm.addDays}
                                        onChange={e => setEditForm(f => ({ ...f, addDays: e.target.value }))}
                                        className="h-11 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-border transition-colors"
                                      />
                                    </div>

                                    <div className="space-y-2 pt-1">
                                      <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'إعفاء التاجر من جميع العمولات', 'Global Commission Exemption')}</Label>
                                      <div className="flex items-center justify-between py-2.5 px-4 border border-transparent bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:border-border transition-colors">
                                        <Label htmlFor={`freeCommissionToggle-${sub.id}`} className="text-xs font-bold cursor-pointer select-none">
                                          {editForm.freeCommission
                                            ? <span className="text-green-600">{t(locale, 'التاجر معفى تماماً ✅', 'Fully Exempt ✅')}</span>
                                            : <span className="text-muted-foreground">{t(locale, 'تُطبّق عليه العمولات ❌', 'Standard Rates Apply ❌')}</span>}
                                        </Label>
                                        <Switch
                                          id={`freeCommissionToggle-${sub.id}`}
                                          checked={editForm.freeCommission}
                                          onCheckedChange={v => setEditForm(f => ({ ...f, freeCommission: v }))}
                                          className="data-[state=checked]:bg-green-500"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Column: Receipt & Notes (Cols 9-12) */}
                                  <div className="xl:col-span-4 flex flex-col gap-4">
                                    <div className="flex flex-col gap-2 h-full">
                                      {sub.invoices && sub.invoices[0]?.receipts && sub.invoices[0].receipts[0]?.receiptImage ? (
                                        <div className="bg-brand/10 border border-brand/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center flex-1 min-h-[140px] relative overflow-hidden group">
                                          <div className="absolute inset-0 bg-gradient-to-t from-brand/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                          <BadgePercent className="h-8 w-8 text-brand mb-3 opacity-80" />
                                          <h4 className="font-bold text-sm text-brand-foreground mb-1">{t(locale, 'إيصال دفع بنكي مرفق', 'Bank Receipt Attached')}</h4>
                                          <p className="text-[10px] text-muted-foreground mb-4 px-4">{t(locale, 'التاجر قام برفع إيصال مالي لإثبات التحويل.', 'Merchant uploaded a proof of payment.')}</p>
                                          
                                          <button 
                                            onClick={() => setZoomImage(sub.invoices[0].receipts[0].receiptImage)}
                                            className="w-full relative z-10 flex items-center justify-center gap-2 bg-brand text-navy hover:bg-brand/90 font-black px-6 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgba(255,200,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,200,0,0.23)] hover:-translate-y-0.5 transition-all"
                                          >
                                            <FileText className="h-4 w-4" />
                                            {t(locale, 'معاينة الإيصال', 'View Receipt')}
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center flex-1 min-h-[140px]">
                                          <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                                          <p className="text-xs font-bold text-muted-foreground">{t(locale, 'لا توجد مرفقات دفع', 'No Payment Attachments')}</p>
                                        </div>
                                      )}

                                      <div className="bg-background rounded-2xl border border-border/60 shadow-sm overflow-hidden flex-shrink-0">
                                        <Textarea
                                          placeholder={t(locale, 'اكتب ملاحظة التجاوز اليدوي (اختياري)...', 'Write an admin note (optional)...')}
                                          value={editForm.overrideNote}
                                          onChange={e => setEditForm(f => ({ ...f, overrideNote: e.target.value }))}
                                          className="h-[60px] min-h-[60px] text-xs py-3 px-4 border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                </div>

                                {/* Action Footer */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                    <Button variant="outline" className="rounded-xl font-bold h-10 px-5 text-xs bg-background border-border/60 hover:bg-muted" onClick={() => setSelectedSub(null)}>
                                      {t(locale, 'إلغاء التعديلات', 'Cancel Changes')}
                                    </Button>
                                    <Button variant="outline" className="rounded-xl font-bold h-10 px-5 text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-100" onClick={() => handleDeleteSubscription(sub.id)}>
                                      <X className="h-3.5 w-3.5 me-1.5" />
                                      {t(locale, 'حذف الاشتراك', 'Delete Subscription')}
                                    </Button>
                                  </div>

                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Button variant="outline" className="rounded-xl font-bold h-10 px-5 text-xs" asChild>
                                      <Link href={getAdminPath('billing/receipts')}>
                                        {t(locale, 'أرشيف الإيصالات', 'Receipts Archive')}
                                      </Link>
                                    </Button>
                                    <Button 
                                      disabled={isSaving} 
                                      className="rounded-xl font-black h-10 px-8 text-xs shadow-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 transition-all" 
                                      onClick={() => handleSaveSubscription(sub.id)}
                                    >
                                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
                                      {t(locale, 'حفظ التغييرات واعتمادها', 'Save & Apply Overrides')}
                                    </Button>
                                  </div>
                                </div>

                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {t(locale, `الصفحة ${page} من ${totalPages}`, `Page ${page} of ${totalPages}`)}
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronRight className={`h-4 w-4 ${locale === 'ar' ? '' : 'rotate-180'}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronLeft className={`h-4 w-4 ${locale === 'ar' ? '' : 'rotate-180'}`} />
            </Button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={!!zoomImage} onOpenChange={(open) => {
        if (!open) {
          setZoomImage(null);
          setTimeout(() => setIsZoomedIn(false), 200);
        }
      }}>
        <DialogContent className={`max-w-[95vw] sm:max-w-screen-xl max-h-[95vh] p-2 flex flex-col ${isZoomedIn ? 'justify-start items-start overflow-auto' : 'justify-center items-center'} bg-black/30 backdrop-blur-sm border-none shadow-none`}>
          <DialogTitle className="sr-only">معاينة الإيصال</DialogTitle>
          <DialogDescription className="sr-only">
            معاينة مكبرة لإيصال الدفع البنكي الخاص بالتاجر
          </DialogDescription>
          {zoomImage && (
            <img 
              src={zoomImage} 
              alt="Receipt Preview" 
              title={isZoomedIn ? t(locale, 'انقر للتصغير', 'Click to zoom out') : t(locale, 'انقر للتكبير للحجم الأصلي', 'Click to view original size')}
              onClick={() => setIsZoomedIn(!isZoomedIn)}
              className={isZoomedIn 
                ? "max-w-none cursor-zoom-out" 
                : "max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10 cursor-zoom-in transition-transform hover:scale-[1.01]"
              } 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
