'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  Loader2, Save, Plus, Trash2, Edit2, Check, X, 
  Package, DollarSign, Settings, Settings2, ShieldCheck, 
  PlusCircle, Trash, RefreshCw, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

const INITIAL_PACKAGE = {
  name: '',
  nameEn: '',
  description: '',
  price: 0,
  commissionRate: 10,
  maxProducts: 5,
  maxMonthlyOrders: 50,
  maxImagesPerProduct: 3,
  hasVideoUpload: false,
  hasAnalytics: false,
  hasPromotedListing: false,
  hasCoupons: false,
  hasApiAccess: false,
  hasPrioritySupport: false,
  maxTeamMembers: 1,
  hasCustomDomain: false,
  hasPixels: false,
  hasMultiCurrency: false,
  hasDataExport: false,
  maxLandingPages: 0,
  hasEmailSupport: false,
  hasBusinessIntelligence: false,
  hasGA4: false,
  color: '#6B7280',
  icon: 'Package',
  isActive: true,
  sortOrder: 0
};

export default function BillingPackagesPage() {
  const { isAdminAuthenticated } = useAdminAuthStore();
  const { locale } = useTranslation();
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
  const [packages, setPackages] = useState<any[]>([]);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);

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

  const fetchPackages = useCallback(async () => {
    if (!isAdminAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages || []);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      toast.error(t(locale, 'فشل تحميل الباقات', 'Failed to load packages'));
    } finally {
      setIsLoading(false);
    }
  }, [isAdminAuthenticated, locale]);

  useEffect(() => {
    if (isMounted) {
      fetchPackages();
    }
  }, [isMounted, fetchPackages]);

  const handleOpenForm = (pkg: any | null = null) => {
    if (pkg) {
      setEditingPackage({ ...pkg });
    } else {
      setEditingPackage({ ...INITIAL_PACKAGE });
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage.name) {
      toast.error(t(locale, 'الاسم مطلوب', 'Name is required'));
      return;
    }
    setIsSaving(true);
    try {
      const isNew = !editingPackage.id;
      const url = '/api/admin/packages';
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPackage),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          isNew 
            ? t(locale, 'تمت إضافة الباقة بنجاح 🎉', 'Package created successfully 🎉')
            : t(locale, 'تم تحديث الباقة بنجاح ✅', 'Package updated successfully ✅')
        );
        setEditingPackage(null);
        fetchPackages();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل حفظ الباقة', 'Failed to save package'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm(t(locale, 'هل أنت متأكد من حذف هذه الباقة نهائياً؟', 'Are you sure you want to delete this package permanently?'))) return;
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حذف الباقة بنجاح', 'Package deleted successfully'));
        fetchPackages();
        if (editingPackage?.id === id) {
          setEditingPackage(null);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل حذف الباقة', 'Failed to delete package'));
    }
  };

  if (!isMounted || !isAdminAuthenticated) return null;

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={getAdminPath('')}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-amber-500" />
              {t(locale, 'إدارة باقات الاشتراكات', 'Subscription Plans')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t(locale, 'إنشاء وتعديل باقات الخدمة للمتاجر، وتحديد الحدود الفنية والخصائص المدعومة لكل فئة', 'Create, update and delete merchant plans, and define custom features/limits for each plan')}
            </p>
          </div>
        </div>

        <Button className="rounded-xl font-bold gap-1.5" onClick={() => handleOpenForm(null)}>
          <PlusCircle className="h-4.5 w-4.5" />
          {t(locale, 'باقة جديدة', 'Create Plan')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 min-h-[50vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground font-medium">
            {t(locale, 'جاري تحميل الباقات...', 'Loading plans...')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Package Grid List (Left 1 col) */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-brand" />
                    {t(locale, 'الباقات المتاحة', 'Available Plans')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {packages.length} {t(locale, 'باقات مسجلة بالمنصة', 'plans registered')}
                  </CardDescription>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={fetchPackages}>
                  <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {packages.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                    {t(locale, 'لم يتم العثور على باقات اشتراك', 'No subscription plans found')}
                  </div>
                ) : packages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => handleOpenForm(pkg)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      editingPackage?.id === pkg.id
                        ? 'border-brand bg-brand/5 shadow-sm'
                        : 'border-border hover:border-brand/40 hover:bg-muted/10'
                    } ${!pkg.isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pkg.color || '#6B7280' }} />
                          <h4 className="font-extrabold text-sm" style={{ color: pkg.color }}>
                            {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                          </h4>
                          {!pkg.isActive && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">{t(locale, 'معطلة', 'Inactive')}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {pkg.description || t(locale, 'لا يوجد وصف مضاف', 'No description')}
                        </p>
                      </div>
                      <div className="text-end shrink-0">
                        <div className="text-xs font-black text-brand">{fmt(pkg.price)}</div>
                        <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{pkg.commissionRate}% {t(locale, 'عمولة', 'commission')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Create/Edit Form Area (Right 2 cols) */}
          <div className="lg:col-span-2">
            {editingPackage ? (
              <form onSubmit={handleSavePackage}>
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Settings className="h-5 w-5 text-brand" />
                        {editingPackage.id 
                          ? t(locale, `تعديل باقة: ${editingPackage.name}`, `Edit Plan: ${editingPackage.name}`)
                          : t(locale, 'إنشاء باقة جديدة', 'Create New Plan')
                        }
                      </CardTitle>
                      <CardDescription>
                        {t(locale, 'تحديث حدود المنصة والأسعار وقائمة الخصائص المعتمدة لهذه الباقة', 'Define core details, price, quotas, and toggle flags for this plan')}
                      </CardDescription>
                    </div>
                    {editingPackage.id && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 rounded-xl text-xs gap-1"
                        onClick={() => handleDeletePackage(editingPackage.id)}
                      >
                        <Trash className="h-3.5 w-3.5" />
                        {t(locale, 'حذف الباقة', 'Delete Plan')}
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Basic Info (Names & Color) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t(locale, 'اسم الباقة (عربي) *', 'Plan Name (AR) *')}</Label>
                        <Input
                          required
                          value={editingPackage.name}
                          onChange={e => setEditingPackage({ ...editingPackage, name: e.target.value })}
                          className="h-9 rounded-xl font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t(locale, 'الاسم بالإنجليزية *', 'Plan Name (EN) *')}</Label>
                        <Input
                          required
                          value={editingPackage.nameEn || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, nameEn: e.target.value })}
                          className="h-9 rounded-xl font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">{t(locale, 'لون الباقة', 'Plan Color')}</Label>
                          <Input
                            type="color"
                            value={editingPackage.color || '#6B7280'}
                            onChange={e => setEditingPackage({ ...editingPackage, color: e.target.value })}
                            className="h-9 rounded-xl p-1 w-full cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">{t(locale, 'الترتيب', 'Sort Order')}</Label>
                          <Input
                            type="number"
                            value={editingPackage.sortOrder}
                            onChange={e => setEditingPackage({ ...editingPackage, sortOrder: parseInt(e.target.value) || 0 })}
                            className="h-9 rounded-xl font-mono text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">{t(locale, 'وصف مختصر للباقة', 'Short Description')}</Label>
                      <Input
                        value={editingPackage.description || ''}
                        placeholder={t(locale, 'مثال: مناسبة للمتاجر الناشئة بميزات أساسية...', 'e.g. Best for emerging stores starting out...')}
                        onChange={e => setEditingPackage({ ...editingPackage, description: e.target.value })}
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>

                    {/* Pricing & Limits */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-brand" />
                          {t(locale, 'السعر الشهري', 'Monthly Price')}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={editingPackage.price}
                          onChange={e => setEditingPackage({ ...editingPackage, price: parseFloat(e.target.value) || 0 })}
                          className="h-9 rounded-xl font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t(locale, 'نسبة العمولة (%)', 'Commission Rate (%)')}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={editingPackage.commissionRate}
                          onChange={e => setEditingPackage({ ...editingPackage, commissionRate: parseFloat(e.target.value) || 0 })}
                          className="h-9 rounded-xl font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t(locale, 'أعضاء الفريق', 'Team Members')}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={editingPackage.maxTeamMembers}
                          onChange={e => setEditingPackage({ ...editingPackage, maxTeamMembers: parseInt(e.target.value) || 1 })}
                          className="h-9 rounded-xl font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t(locale, 'الصور لكل منتج', 'Max Images / Product')}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={editingPackage.maxImagesPerProduct}
                          onChange={e => setEditingPackage({ ...editingPackage, maxImagesPerProduct: parseInt(e.target.value) || 3 })}
                          className="h-9 rounded-xl font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Limits/Quotas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                      {[
                        { key: 'maxProducts', label: t(locale, 'الحد الأقصى للمنتجات', 'Max Product Limit') },
                        { key: 'maxMonthlyOrders', label: t(locale, 'الحد الأقصى للطلبات شهرياً', 'Max Monthly Orders') },
                        { key: 'maxLandingPages', label: t(locale, 'صفحات الهبوط', 'Max Landing Pages') },
                      ].map(({ key, label }) => (
                        <div key={key} className="space-y-1.5">
                          <Label className="text-xs font-bold">{label}</Label>
                          <Input
                            type="number"
                            value={editingPackage[key]}
                            onChange={e => setEditingPackage({ ...editingPackage, [key]: parseInt(e.target.value) || 0 })}
                            className="h-9 rounded-xl font-mono font-bold"
                          />
                          <p className="text-[10px] text-muted-foreground">{t(locale, 'ضع -1 للحدود المفتوحة والغير محدودة', 'Set -1 for unlimited access')}</p>
                        </div>
                      ))}
                    </div>

                    {/* Features list checklist */}
                    <div className="border-t pt-4 space-y-3">
                      <Label className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" />
                        {t(locale, 'الميزات المضمنة في الباقة', 'Package Features & Privileges')}
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {[
                          { key: 'hasCustomDomain', label: t(locale, 'دعم النطاق المخصص', 'Custom Domain') },
                          { key: 'hasPixels', label: t(locale, 'بيكسلات التتبع (Pixels)', 'Tracking Pixels') },
                          { key: 'hasMultiCurrency', label: t(locale, 'تعدد العملات', 'Multi Currency') },
                          { key: 'hasDataExport', label: t(locale, 'تصدير التقارير والبيانات', 'Data Export') },
                          { key: 'hasEmailSupport', label: t(locale, 'دعم فني بريدي', 'Email Support') },
                          { key: 'hasBusinessIntelligence', label: t(locale, 'تقارير ذكاء الأعمال BI', 'BI Reports') },
                          { key: 'hasGA4', label: 'Google Analytics (GA4)' },
                          { key: 'hasVideoUpload', label: t(locale, 'رفع فيديو للمنتجات', 'Video Upload') },
                          { key: 'hasAnalytics', label: t(locale, 'إحصائيات متقدمة للمتجر', 'Advanced Analytics') },
                          { key: 'hasPromotedListing', label: t(locale, 'المنتجات المميزة والترويج', 'Promoted Listings') },
                          { key: 'hasCoupons', label: t(locale, 'إنشاء الكوبونات والعروض', 'Merchant Coupons') },
                          { key: 'hasApiAccess', label: t(locale, 'الوصول لواجهة البرمجة API', 'Developer API Access') },
                          { key: 'hasPrioritySupport', label: t(locale, 'دعم فني ذو أولوية', 'Priority Support') },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2 p-2.5 border rounded-xl bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors text-xs font-medium">
                            <input
                              type="checkbox"
                              checked={!!editingPackage[key]}
                              onChange={e => setEditingPackage({ ...editingPackage, [key]: e.target.checked })}
                              className="rounded accent-brand h-4 w-4 shrink-0"
                            />
                            <span className="truncate">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Activation status toggle */}
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 py-2 px-3 border rounded-xl bg-muted/20 max-w-xs">
                        <Switch
                          id="pkgActive"
                          checked={editingPackage.isActive}
                          onCheckedChange={v => setEditingPackage({ ...editingPackage, isActive: v })}
                        />
                        <Label htmlFor="pkgActive" className="text-xs cursor-pointer select-none">
                          {editingPackage.isActive 
                            ? t(locale, 'الباقة معروضة ومتاحة للاشتراك للتجار', 'Plan is active and visible to merchants')
                            : t(locale, 'الباقة مخفية وغير متاحة للاشتراك', 'Plan is hidden and suspended')
                          }
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t pt-4">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditingPackage(null)}>
                      {t(locale, 'إلغاء', 'Cancel')}
                    </Button>
                    <Button type="submit" disabled={isSaving} className="gap-1.5 rounded-xl font-bold">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {t(locale, 'حفظ الباقة', 'Save Plan')}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            ) : (
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Package className="h-16 w-16 text-muted-foreground/20" />
                  <p className="text-sm font-bold text-center">
                    {t(locale, 'اختر باقة من القائمة لتعديل ميزاتها، أو انقر على زر "باقة جديدة" لإنشاء باقة جديدة بالكامل.', 'Select a subscription plan from the list to edit, or click "Create Plan" to design a new package.')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
