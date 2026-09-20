'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Store as StoreIcon, Search, Eye, RefreshCw, CheckCircle2, XCircle, Clock,
  TrendingUp, Users, Package, AlertTriangle, ShieldCheck, ShieldAlert,
  SlidersHorizontal, ChevronRight, ChevronLeft, ArrowUpDown, Filter,
  ExternalLink, Settings, DollarSign, Award, Layers, Sparkles, UserCheck,
  UserX, Smartphone, MessageCircle, Database, Check, History, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StoreData {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  isActive: boolean;
  rating: number;
  totalSales: number;
  totalEarnings: number;
  commission: number;
  level: number;
  customDomain?: string | null;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    accountStatus: string;
    avatar?: string | null;
  } | null;
  package?: {
    id: string;
    name: string;
    nameEn?: string | null;
    price: number;
    maxProducts: number;
    maxBranches: number;
  } | null;
  stats: {
    productsCount: number;
    staffCount: number;
  };
  staff: Array<{
    id: string;
    role: string;
    status: string;
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      isActive: boolean;
      avatar?: string | null;
    };
  }>;
  features: {
    addonMobileApp: boolean;
    addonWhatsAppSupport: boolean;
    addonAdvancedCRM: boolean;
    addonEchangoPOS: boolean;
    addonBusinessUpgrade: boolean;
  };
}

interface AuditLogEntry {
  id: string;
  adminId: string;
  action: string;
  details: any;
  ipAddress?: string | null;
  createdAt: string;
}

export default function StoresPage() {
  const { t, locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // State
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [packages, setPackages] = useState<Array<{ id: string; name: string; nameEn?: string | null }>>([]);
  const [aggregates, setAggregates] = useState({
    totalStores: 0,
    activeStores: 0,
    suspendedStores: 0,
    totalSalesSum: 0,
  });

  // Query / Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selection & Bulk
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCommissionInput, setBulkCommissionInput] = useState('10');
  const [showBulkCommissionModal, setShowBulkCommissionModal] = useState(false);

  // Drawer / Single Store State
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  // Form edit fields for Drawer
  const [editCommission, setEditCommission] = useState<number>(10);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editPackageId, setEditPackageId] = useState<string>('');
  const [editSlug, setEditSlug] = useState<string>('');
  const [editFeatures, setEditFeatures] = useState({
    addonMobileApp: false,
    addonWhatsAppSupport: false,
    addonAdvancedCRM: false,
    addonEchangoPOS: false,
    addonBusinessUpgrade: false,
  });

  // Audit Logs for selected store
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Fetch stores from API
  const fetchStores = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
        packageId: packageFilter,
      });
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/admin/stores?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setStores(json.data.stores);
        setTotalPages(json.data.pagination.totalPages);
        setTotalCount(json.data.pagination.total);
        setAggregates(json.data.aggregates);
        setPackages(json.data.packages || []);
      } else {
        toast.error(json.error || 'Failed to load stores');
      }
    } catch (err: any) {
      toast.error('Network error loading stores');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [page, limit, search, statusFilter, packageFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Open Drawer and initialize edit state
  const handleOpenDrawer = (store: StoreData) => {
    setSelectedStore(store);
    setEditCommission(store.commission);
    setEditIsActive(store.isActive);
    setEditPackageId(store.package?.id || '');
    setEditSlug(store.slug);
    setEditFeatures({
      addonMobileApp: store.features.addonMobileApp,
      addonWhatsAppSupport: store.features.addonWhatsAppSupport,
      addonAdvancedCRM: store.features.addonAdvancedCRM,
      addonEchangoPOS: store.features.addonEchangoPOS,
      addonBusinessUpgrade: store.features.addonBusinessUpgrade,
    });
    setActiveTab('overview');
    setIsDrawerOpen(true);
    fetchAuditLogs(store.id);
  };

  // Fetch audit logs for drawer
  const fetchAuditLogs = async (storeId: string) => {
    setLoadingAudit(true);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/audit`);
      const json = await res.json();
      if (json.success) {
        setAuditLogs(json.logs || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingAudit(false);
    }
  };

  // Save Store Configuration
  const handleSaveStore = async () => {
    if (!selectedStore) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/stores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: selectedStore.id,
          commission: editCommission,
          isActive: editIsActive,
          packageId: editPackageId || null,
          slug: editSlug,
          features: editFeatures,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(locale === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Store updated successfully');
        // Optimistic local update
        setStores(prev =>
          prev.map(s =>
            s.id === selectedStore.id
              ? {
                  ...s,
                  commission: editCommission,
                  isActive: editIsActive,
                  slug: editSlug,
                  features: editFeatures,
                  package: packages.find(p => p.id === editPackageId) as any,
                }
              : s
          )
        );
        setIsDrawerOpen(false);
        fetchStores(true);
      } else {
        toast.error(json.error || 'Failed to save store');
      }
    } catch {
      toast.error('Error saving store');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Impersonate
  const handleImpersonate = async (userId?: string) => {
    if (!userId) {
      toast.error(locale === 'ar' ? 'لا يوجد مدير مرتبط بهذا المتجر' : 'No manager associated with this store');
      return;
    }
    setImpersonating(true);
    toast.info(locale === 'ar' ? 'جاري تهيئة جلسة الدخول كتاجر...' : 'Initializing merchant session...');
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(locale === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Session initiated');
        window.location.href = data.redirectUrl || '/seller/dashboard';
      } else {
        toast.error(data.error || 'Impersonation failed');
        setImpersonating(false);
      }
    } catch {
      toast.error('Network error during impersonation');
      setImpersonating(false);
    }
  };

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(stores.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleBulkAction = async (action: 'activate' | 'suspend' | 'set_commission', value?: any) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/stores/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeIds: selectedIds,
          action,
          value,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || 'Bulk operation completed');
        setSelectedIds([]);
        setShowBulkCommissionModal(false);
        fetchStores(true);
      } else {
        toast.error(json.error || 'Bulk operation failed');
      }
    } catch {
      toast.error('Error during bulk action');
    } finally {
      setBulkLoading(false);
    }
  };

  const formatDZD = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'en-US').format(amount) + ' ' + (locale === 'ar' ? 'د.ج' : 'DZD');
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <StoreIcon className="h-7 w-7 text-brand" />
            {t('adminStores.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('adminStores.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStores()}
            disabled={loading}
            className="gap-2 font-bold shadow-xs hover:bg-surface"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            {locale === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Top Aggregates KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-surface p-4 shadow-xs border-border/70">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <StoreIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{aggregates.totalStores}</p>
              <p className="text-xs font-semibold text-muted-foreground">{t('adminStores.totalStores')}</p>
            </div>
          </div>
        </Card>

        <Card className="card-surface p-4 shadow-xs border-border/70">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{aggregates.activeStores}</p>
              <p className="text-xs font-semibold text-muted-foreground">{t('adminStores.activeStores')}</p>
            </div>
          </div>
        </Card>

        <Card className="card-surface p-4 shadow-xs border-border/70">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{aggregates.suspendedStores}</p>
              <p className="text-xs font-semibold text-muted-foreground">{t('adminStores.suspendedStores')}</p>
            </div>
          </div>
        </Card>

        <Card className="card-surface p-4 shadow-xs border-border/70">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{formatDZD(aggregates.totalSalesSum)}</p>
              <p className="text-xs font-semibold text-muted-foreground">{t('adminStores.totalSalesVolume')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 shadow-xs border-border/70 bg-card">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('adminStores.searchPlaceholder')}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="ps-9 h-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={val => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder={t('adminStores.statusAll')} />
              </SelectTrigger>
              <SelectContent dir={dir}>
                <SelectItem value="all">{t('adminStores.statusAll')}</SelectItem>
                <SelectItem value="active">{t('adminStores.statusActive')}</SelectItem>
                <SelectItem value="suspended">{t('adminStores.statusSuspended')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Package Filter */}
            <Select
              value={packageFilter}
              onValueChange={val => {
                setPackageFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder={t('adminStores.packagesAll')} />
              </SelectTrigger>
              <SelectContent dir={dir}>
                <SelectItem value="all">{t('adminStores.packagesAll')}</SelectItem>
                {packages.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {locale === 'ar' ? p.name : (p.nameEn || p.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Limit Selector */}
            <Select
              value={limit.toString()}
              onValueChange={val => {
                setLimit(parseInt(val, 10));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[110px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir={dir}>
                <SelectItem value="15">15 {locale === 'ar' ? 'سجل' : 'rows'}</SelectItem>
                <SelectItem value="20">20 {locale === 'ar' ? 'سجل' : 'rows'}</SelectItem>
                <SelectItem value="50">50 {locale === 'ar' ? 'سجل' : 'rows'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stores Table */}
      <Card className="overflow-hidden shadow-xs border-border/70 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-surface/80 border-b border-border/70">
              <tr>
                <th className="p-3.5 w-12 text-center">
                  <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length === stores.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="text-start p-3.5 font-bold text-muted-foreground">{locale === 'ar' ? 'المتجر' : 'Store'}</th>
                <th className="text-start p-3.5 font-bold text-muted-foreground hidden md:table-cell">{locale === 'ar' ? 'المدير / الحساب' : 'Manager'}</th>
                <th className="text-start p-3.5 font-bold text-muted-foreground hidden lg:table-cell">{locale === 'ar' ? 'الباقة' : 'Package'}</th>
                <th className="text-start p-3.5 font-bold text-muted-foreground hidden sm:table-cell">{locale === 'ar' ? 'المنتجات' : 'Products'}</th>
                <th className="text-start p-3.5 font-bold text-muted-foreground">{locale === 'ar' ? 'المبيعات' : 'Sales'}</th>
                <th className="text-start p-3.5 font-bold text-muted-foreground hidden lg:table-cell">{locale === 'ar' ? 'العمولة' : 'Commission'}</th>
                <th className="text-start p-3.5 font-bold text-muted-foreground">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="text-end p-3.5 font-bold text-muted-foreground">{locale === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-3.5 text-center"><Skeleton className="h-4 w-4 mx-auto rounded" /></td>
                    <td className="p-3.5"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-xl" /><div className="space-y-1.5"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></td>
                    <td className="p-3.5 hidden md:table-cell"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-3.5 hidden lg:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-3.5 hidden sm:table-cell"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-3.5"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-3.5 hidden lg:table-cell"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-3.5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="p-3.5 text-end"><Skeleton className="h-8 w-20 ms-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-muted-foreground">
                    <StoreIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold text-base">{t('adminStores.noStoresFound')}</p>
                  </td>
                </tr>
              ) : (
                stores.map(store => {
                  const isChecked = selectedIds.includes(store.id);
                  return (
                    <tr
                      key={store.id}
                      className={cn(
                        'hover:bg-surface/60 transition-colors group',
                        isChecked && 'bg-brand/5'
                      )}
                    >
                      <td className="p-3.5 text-center">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleSelect(store.id)}
                          aria-label={`Select ${store.name}`}
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-xl border shrink-0 bg-surface">
                            <AvatarImage src={store.logo || undefined} alt={store.name} className="object-cover" />
                            <AvatarFallback className="font-bold text-sm bg-brand/10 text-brand">
                              {store.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-foreground text-sm truncate">{store.name}</p>
                              {store.rating > 0 && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-amber-400/50 text-amber-500 font-bold">
                                  ★ {store.rating.toFixed(1)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono truncate">/{store.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 hidden md:table-cell">
                        <p className="font-medium text-foreground text-xs">{store.manager?.name || '—'}</p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">{store.manager?.email || store.manager?.phone || ''}</p>
                      </td>

                      <td className="p-3.5 hidden lg:table-cell">
                        <Badge variant="secondary" className="font-medium text-[11px] bg-surface text-foreground border">
                          {store.package ? (locale === 'ar' ? store.package.name : (store.package.nameEn || store.package.name)) : (locale === 'ar' ? 'بدون باقة' : 'No Plan')}
                        </Badge>
                      </td>

                      <td className="p-3.5 hidden sm:table-cell font-semibold text-xs">
                        <span className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          {store.stats.productsCount}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-xs text-foreground">
                        {formatDZD(store.totalSales)}
                      </td>

                      <td className="p-3.5 hidden lg:table-cell font-bold text-xs">
                        <Badge variant="outline" className="text-brand border-brand/30 bg-brand/5">
                          {store.commission}%
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-2 py-0.5 font-bold',
                            store.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          )}
                        >
                          {store.isActive ? t('adminStores.statusActive') : t('adminStores.statusSuspended')}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Impersonate */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-500/10"
                            title={t('adminStores.impersonate')}
                            disabled={impersonating}
                            onClick={() => {
                              const targetId = (store.manager?.id?.startsWith('branch-owner-') && store.staff?.[0]?.user?.id)
                                ? store.staff[0].user.id
                                : store.manager?.id;
                              handleImpersonate(targetId);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Control Drawer Trigger */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-bold gap-1.5 border-border shadow-xs hover:bg-surface"
                            onClick={() => handleOpenDrawer(store)}
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5 text-brand" />
                            {t('adminStores.manageStore')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Traditional Server-Side Pagination Controls */}
        <div className="p-4 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            {locale === 'ar'
              ? `عرض ${Math.min(totalCount, (page - 1) * limit + 1)} إلى ${Math.min(totalCount, page * limit)} من أصل ${totalCount} متجر`
              : `Showing ${Math.min(totalCount, (page - 1) * limit + 1)} to ${Math.min(totalCount, page * limit)} of ${totalCount} stores`}
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-bold"
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              {locale === 'ar' ? 'السابق' : 'Previous'}
            </Button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    className={cn('h-8 w-8 p-0 text-xs font-bold', page === pageNum && 'bg-brand text-brand-foreground')}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && <span className="text-xs text-muted-foreground">... {totalPages}</span>}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-bold"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              {locale === 'ar' ? 'التالي' : 'Next'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 border border-white/20 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-sm font-bold flex items-center gap-2">
            <Badge className="bg-brand text-white">{selectedIds.length}</Badge>
            {t('adminStores.bulkSelected').replace('{count}', selectedIds.length.toString())}
          </span>

          <div className="h-5 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={bulkLoading}
              onClick={() => handleBulkAction('activate')}
              className="h-8 text-xs font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 border-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5 me-1" />
              {t('adminStores.bulkActivate')}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              disabled={bulkLoading}
              onClick={() => handleBulkAction('suspend')}
              className="h-8 text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border-0"
            >
              <XCircle className="h-3.5 w-3.5 me-1" />
              {t('adminStores.bulkSuspend')}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              disabled={bulkLoading}
              onClick={() => setShowBulkCommissionModal(true)}
              className="h-8 text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-0"
            >
              <DollarSign className="h-3.5 w-3.5 me-1" />
              {t('adminStores.bulkCommission')}
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds([])}
            className="h-8 text-xs text-white/70 hover:text-white"
          >
            {t('adminStores.cancel')}
          </Button>
        </div>
      )}

      {/* Store Control Drawer (Sheet) */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side={locale === 'ar' ? 'left' : 'right'} className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col" dir={dir}>
          {selectedStore && (
            <>
              {/* Drawer Header */}
              <div className="p-6 pb-4 border-b border-border/70 bg-surface/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-background shadow-sm bg-surface">
                      <AvatarImage src={selectedStore.logo || undefined} alt={selectedStore.name} className="object-cover" />
                      <AvatarFallback className="font-black text-xl bg-brand text-white">
                        {selectedStore.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-xl font-black text-foreground">
                        {selectedStore.name}
                      </SheetTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        ID: {selectedStore.id} • /{selectedStore.slug}
                      </p>
                    </div>
                  </div>

                  {/* Impersonate Primary Action */}
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5 shadow-sm shrink-0"
                    disabled={impersonating}
                    onClick={() => handleImpersonate(selectedStore.manager?.id)}
                  >
                    <Eye className="h-4 w-4" />
                    {t('adminStores.impersonate')}
                  </Button>
                </div>
              </div>

              {/* Drawer Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="px-6 border-b border-border/70 bg-card">
                  <TabsList className="h-11 bg-transparent p-0 gap-4 overflow-x-auto w-full justify-start no-scrollbar">
                    <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-brand rounded-none px-2 py-2 text-xs font-bold">
                      {t('adminStores.tabOverview')}
                    </TabsTrigger>
                    <TabsTrigger value="config" className="data-[state=active]:border-b-2 data-[state=active]:border-brand rounded-none px-2 py-2 text-xs font-bold">
                      {t('adminStores.tabConfig')}
                    </TabsTrigger>
                    <TabsTrigger value="features" className="data-[state=active]:border-b-2 data-[state=active]:border-brand rounded-none px-2 py-2 text-xs font-bold">
                      {t('adminStores.tabFeatures')}
                    </TabsTrigger>
                    <TabsTrigger value="plan" className="data-[state=active]:border-b-2 data-[state=active]:border-brand rounded-none px-2 py-2 text-xs font-bold">
                      {t('adminStores.tabPlan')}
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="data-[state=active]:border-b-2 data-[state=active]:border-brand rounded-none px-2 py-2 text-xs font-bold">
                      {t('adminStores.tabStaff')} ({selectedStore.staff.length})
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="data-[state=active]:border-b-2 data-[state=active]:border-brand rounded-none px-2 py-2 text-xs font-bold">
                      {t('adminStores.tabAudit')}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  {/* Tab 1: Overview */}
                  <TabsContent value="overview" className="mt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-3.5 bg-surface/50 border">
                        <span className="text-xs text-muted-foreground font-semibold">{locale === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</span>
                        <p className="text-xl font-black text-foreground mt-1">{formatDZD(selectedStore.totalSales)}</p>
                      </Card>
                      <Card className="p-3.5 bg-surface/50 border">
                        <span className="text-xs text-muted-foreground font-semibold">{locale === 'ar' ? 'عدد المنتجات' : 'Products Count'}</span>
                        <p className="text-xl font-black text-brand mt-1">{selectedStore.stats.productsCount}</p>
                      </Card>
                    </div>

                    <Card className="p-4 bg-card border">
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-brand" />
                        {locale === 'ar' ? 'بيانات المالك والمدير' : 'Manager & Owner Info'}
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'الاسم' : 'Name'}</span>
                          <span className="font-bold">{selectedStore.manager?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                          <span className="font-mono font-bold">{selectedStore.manager?.email || '—'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'الهاتف' : 'Phone'}</span>
                          <span className="font-mono font-bold">{selectedStore.manager?.phone || '—'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}</span>
                          <span>{new Date(selectedStore.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Tab 2: Config & Commission */}
                  <TabsContent value="config" className="mt-0 space-y-4">
                    <Card className="p-4 bg-card border space-y-4">
                      <div>
                        <Label className="text-xs font-bold">{t('adminStores.commission')}</Label>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={editCommission}
                            onChange={e => setEditCommission(parseFloat(e.target.value) || 0)}
                            className="font-bold"
                          />
                          <span className="text-sm font-bold text-muted-foreground">%</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {locale === 'ar' ? 'نسبة اقتطاع المنصة من كل عملية بيع ناجحة لهذا المتجر' : 'Platform fee percentage for this specific store'}
                        </p>
                      </div>

                      <div className="pt-3 border-t">
                        <Label className="text-xs font-bold">{t('adminStores.storeSlug')}</Label>
                        <Input
                          value={editSlug}
                          onChange={e => setEditSlug(e.target.value)}
                          className="font-mono text-sm mt-1.5"
                        />
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between">
                        <div>
                          <Label className="text-xs font-bold">{t('adminStores.storeStatus')}</Label>
                          <p className="text-[11px] text-muted-foreground">
                            {editIsActive ? t('adminStores.statusActive') : t('adminStores.statusSuspended')}
                          </p>
                        </div>
                        <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Tab 3: Feature Toggles */}
                  <TabsContent value="features" className="mt-0 space-y-3">
                    <Card className="p-4 bg-card border divide-y divide-border/50">
                      <div className="py-2.5 flex items-center justify-between">
                        <div>
                          <Label className="text-xs font-bold flex items-center gap-1.5">
                            <Smartphone className="h-3.5 w-3.5 text-brand" />
                            {locale === 'ar' ? 'تطبيق الجوال المخصص' : 'Custom Mobile App'}
                          </Label>
                          <p className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'إتاحة ربط تطبيق المتجر على المتاجر' : 'Enable native mobile app linking'}</p>
                        </div>
                        <Switch
                          checked={editFeatures.addonMobileApp}
                          onCheckedChange={v => setEditFeatures(f => ({ ...f, addonMobileApp: v }))}
                        />
                      </div>

                      <div className="py-2.5 flex items-center justify-between">
                        <div>
                          <Label className="text-xs font-bold flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                            {locale === 'ar' ? 'دعم وتنبيهات واتساب' : 'WhatsApp Automation'}
                          </Label>
                          <p className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'إرسال الفواتير والتنبيهات عبر واتساب' : 'Automated WhatsApp order alerts'}</p>
                        </div>
                        <Switch
                          checked={editFeatures.addonWhatsAppSupport}
                          onCheckedChange={v => setEditFeatures(f => ({ ...f, addonWhatsAppSupport: v }))}
                        />
                      </div>

                      <div className="py-2.5 flex items-center justify-between">
                        <div>
                          <Label className="text-xs font-bold flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-indigo-500" />
                            {locale === 'ar' ? 'نظام CRM وإدارة العملاء المتقدم' : 'Advanced CRM'}
                          </Label>
                          <p className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'سجلات سلوك الشراء واستهداف العملاء' : 'Customer behavioral analytics'}</p>
                        </div>
                        <Switch
                          checked={editFeatures.addonAdvancedCRM}
                          onCheckedChange={v => setEditFeatures(f => ({ ...f, addonAdvancedCRM: v }))}
                        />
                      </div>

                      <div className="py-2.5 flex items-center justify-between">
                        <div>
                          <Label className="text-xs font-bold flex items-center gap-1.5">
                            <Database className="h-3.5 w-3.5 text-amber-500" />
                            {locale === 'ar' ? 'نظام نقاط البيع والكاشير (Echango POS)' : 'Echango POS Cashier'}
                          </Label>
                          <p className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'ربط البيع الحضوري مع المخزون السحابي' : 'Offline in-store retail POS'}</p>
                        </div>
                        <Switch
                          checked={editFeatures.addonEchangoPOS}
                          onCheckedChange={v => setEditFeatures(f => ({ ...f, addonEchangoPOS: v }))}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Tab 4: Plan & Subscription */}
                  <TabsContent value="plan" className="mt-0 space-y-4">
                    <Card className="p-4 bg-card border space-y-3">
                      <div>
                        <Label className="text-xs font-bold">{locale === 'ar' ? 'باقة الاشتراك المسندة للمتجر' : 'Assigned Package'}</Label>
                        <Select value={editPackageId} onValueChange={setEditPackageId}>
                          <SelectTrigger className="w-full mt-1.5">
                            <SelectValue placeholder={locale === 'ar' ? 'اختر باقة...' : 'Select package...'} />
                          </SelectTrigger>
                          <SelectContent dir={dir}>
                            {packages.map(pkg => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Tab 5: Staff */}
                  <TabsContent value="staff" className="mt-0 space-y-3">
                    {selectedStore.staff.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-semibold">{locale === 'ar' ? 'لا يوجد موظفين ملحقين بهذا المتجر حالياً' : 'No staff assigned to this store'}</p>
                      </div>
                    ) : (
                      selectedStore.staff.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border bg-surface/50 text-xs">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-foreground">{member.user.name}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{member.user.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-bold">
                            {member.role}
                          </Badge>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Tab 6: Audit History */}
                  <TabsContent value="audit" className="mt-0 space-y-3">
                    {loadingAudit ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-brand" />
                        {locale === 'ar' ? 'جاري تحميل السجلات...' : 'Loading audit history...'}
                      </div>
                    ) : auditLogs.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-xs font-semibold">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        {locale === 'ar' ? 'لا توجد سجلات تعديل سابقة لهذا المتجر' : 'No audit entries found'}
                      </div>
                    ) : (
                      auditLogs.map(log => (
                        <div key={log.id} className="p-3 rounded-xl border bg-surface/40 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-brand">{log.action}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                            </span>
                          </div>
                          {log.details && (
                            <pre className="text-[10px] bg-background p-2 rounded border overflow-x-auto text-muted-foreground font-mono">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </TabsContent>
                </div>
              </Tabs>

              {/* Drawer Sticky Footer */}
              <div className="p-4 border-t border-border/70 bg-surface/50 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)} disabled={isSaving}>
                  {t('adminStores.cancel')}
                </Button>
                <Button
                  size="sm"
                  className="bg-brand text-brand-foreground font-bold shadow-sm"
                  onClick={handleSaveStore}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin me-1.5" />
                      {t('adminStores.saving')}
                    </>
                  ) : (
                    t('adminStores.saveChanges')
                  )}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Bulk Commission Modal */}
      {showBulkCommissionModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="w-full max-w-sm p-5 space-y-4 bg-card shadow-2xl border">
            <h3 className="text-base font-bold text-foreground">
              {locale === 'ar' ? 'تعديل عمولة المتاجر المحددة' : 'Set Bulk Commission'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === 'ar'
                ? `سيتم تطبيق نسبة العمولة هذه على ${selectedIds.length} متجر دفعة واحدة.`
                : `This commission rate will be applied to all ${selectedIds.length} selected stores.`}
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={bulkCommissionInput}
                onChange={e => setBulkCommissionInput(e.target.value)}
                className="font-bold text-lg"
              />
              <span className="font-bold text-muted-foreground">%</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowBulkCommissionModal(false)} disabled={bulkLoading}>
                {t('adminStores.cancel')}
              </Button>
              <Button
                size="sm"
                className="bg-brand text-brand-foreground font-bold"
                onClick={() => handleBulkAction('set_commission', bulkCommissionInput)}
                disabled={bulkLoading}
              >
                {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t('adminStores.apply')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
