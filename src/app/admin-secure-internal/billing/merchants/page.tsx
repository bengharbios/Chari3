'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  Loader2, Save, Search, Filter, ChevronDown, ChevronUp,
  Users, Check, X, ShieldAlert, BadgePercent, AlertCircle,
  TrendingDown, RefreshCw, ArrowRight, UserCheck, UserX,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

                        {/* Inline edit details block */}
                        {selectedSub?.id === sub.id && (
                          <TableRow className="bg-brand/5 hover:bg-brand/5 border-t">
                            <TableCell colSpan={8} className="px-6 py-5">
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {/* Change Status */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'تغيير حالة الاشتراك', 'Change Status')}</Label>
                                  <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                                    <SelectTrigger className="h-9 rounded-xl text-xs font-bold w-full bg-background border-border">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="text-xs">
                                      {Object.entries(STATUS_LABELS).map(([val, cfg]) => (
                                        <SelectItem key={val} value={val}>{t(locale, cfg.ar, cfg.en)}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                
                                {/* Receipt Image Viewer Button */}
                                {sub.invoices && sub.invoices[0]?.receipts && sub.invoices[0].receipts[0]?.receiptImage && (
                                  <div className="md:col-span-3 lg:col-span-5 border-t border-dashed border-brand/20 pt-4 mt-2 flex flex-col items-start gap-2">
                                    <Label className="text-xs font-bold text-muted-foreground">{t(locale, 'المرفقات الدليلية', 'Proof Attachments')}</Label>
                                    <button 
                                      onClick={() => setZoomImage(sub.invoices[0].receipts[0].receiptImage)}
                                      className="inline-flex items-center gap-2 bg-brand text-navy hover:bg-brand/90 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                                    >
                                      <FileText className="h-4 w-4" />
                                      {t(locale, 'معاينة إيصال الدفع البنكي 📄', 'View Bank Payment Receipt 📄')}
                                    </button>
                                  </div>
                                )}

                                {/* Reassign Package */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'تغيير الباقة الحالية', 'Change Plan')}</Label>
                                  <Select value={editForm.packageId} onValueChange={v => setEditForm(f => ({ ...f, packageId: v }))}>
                                    <SelectTrigger className="h-9 rounded-xl text-xs font-bold w-full bg-background border-border">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="text-xs">
                                      {packages.map(pkg => (
                                        <SelectItem key={pkg.id} value={pkg.id}>
                                          {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Extend end date */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'إضافة أيام إضافية للصلاحية', 'Add Active Days')}</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder={t(locale, 'أدخل عدد الأيام...', 'Days to add...')}
                                    value={editForm.addDays}
                                    onChange={e => setEditForm(f => ({ ...f, addDays: e.target.value }))}
                                    className="h-9 rounded-xl font-mono text-xs bg-background"
                                  />
                                </div>

                                {/* Free Commission toggle */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'الإعفاء من عمولات المبيعات', 'Commission Exemption')}</Label>
                                  <div className="flex items-center gap-2 py-2 px-3 border rounded-xl bg-background h-9 border-border">
                                    <Switch
                                      id={`freeCommissionToggle-${sub.id}`}
                                      checked={editForm.freeCommission}
                                      onCheckedChange={v => setEditForm(f => ({ ...f, freeCommission: v }))}
                                    />
                                    <Label htmlFor={`freeCommissionToggle-${sub.id}`} className="text-xs cursor-pointer select-none">
                                      {editForm.freeCommission
                                        ? t(locale, 'معفى بالكامل ✅', 'Fully Exempt ✅')
                                        : t(locale, 'يطبق نسب العمولات ❌', 'Charge Commissions ❌')}
                                    </Label>
                                  </div>
                                </div>

                                {/* Override Note */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold">{t(locale, 'ملاحظة الأدمن المرفقة', 'Admin Override Note')}</Label>
                                  <Textarea
                                    placeholder={t(locale, 'اكتب سبباً للتجاوز اليدوي...', 'Reason for manual override...')}
                                    value={editForm.overrideNote}
                                    onChange={e => setEditForm(f => ({ ...f, overrideNote: e.target.value }))}
                                    className="h-9 min-h-[36px] rounded-xl text-xs py-2 bg-background border-border resize-none"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                <Button variant="outline" size="sm" className="rounded-xl font-bold" asChild>
                                  <Link href={getAdminPath('billing/receipts')}>
                                    {t(locale, 'عرض إيصالات التاجر', 'View Receipts')}
                                  </Link>
                                </Button>
                                <Button variant="destructive" size="sm" className="rounded-xl font-bold bg-red-100 text-red-600 hover:bg-red-200 border-0" onClick={() => handleDeleteSubscription(sub.id)}>
                                  {t(locale, 'حذف', 'Delete')}
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => setSelectedSub(null)}>
                                  {t(locale, 'إلغاء', 'Cancel')}
                                </Button>
                                <Button size="sm" disabled={isSaving} className="gap-1 rounded-xl font-bold" onClick={() => handleSaveSubscription(sub.id)}>
                                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                  {t(locale, 'تطبيق التحديثات المحددة', 'Apply Overrides')}
                                </Button>
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
    </div>
  );
}
