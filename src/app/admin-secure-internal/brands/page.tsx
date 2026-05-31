'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  Loader2, Plus, ArrowRight, Tag, Trash2, Edit2, 
  Search, ShieldAlert, CheckCircle, XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function AdminBrandsPage() {
  const { isAdminAuthenticated, adminUser } = useAdminAuthStore();
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const [isMounted, setIsMounted] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      window.location.href = getAdminPath('login');
    }
  }, [isMounted, isAdminAuthenticated]);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands);
      } else {
        toast.error(t('فشل تحميل الماركات', 'Failed to load brands'));
      }
    } catch {
      toast.error(t('خطأ في الاتصال بالخادم', 'Connection error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted && isAdminAuthenticated) {
      fetchBrands();
    }
  }, [isMounted, isAdminAuthenticated]);

  if (!isMounted || !isAdminAuthenticated) return null;

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormName('');
    setFormNameEn('');
    setFormLogo('');
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormNameEn(brand.nameEn || '');
    setFormLogo(brand.logo || '');
    setFormIsActive(brand.isActive);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error(t('اسم الماركة مطلوب', 'Brand name is required'));
      return;
    }

    setIsSaving(true);
    try {
      const url = '/api/admin/brands';
      const method = editingBrand ? 'PATCH' : 'POST';
      const body = editingBrand
        ? { id: editingBrand.id, name: formName, nameEn: formNameEn, logo: formLogo, isActive: formIsActive }
        : { name: formName, nameEn: formNameEn, logo: formLogo, isActive: formIsActive };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          editingBrand
            ? t('تم تحديث الماركة بنجاح', 'Brand updated successfully')
            : t('تم إنشاء الماركة بنجاح', 'Brand created successfully')
        );
        setShowModal(false);
        fetchBrands();
      } else {
        toast.error(data.error || t('فشل حفظ التغييرات', 'Failed to save changes'));
      }
    } catch {
      toast.error(t('خطأ في الاتصال', 'Connection error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('هل أنت متأكد من رغبتك في حذف هذه الماركة نهائياً؟', 'Are you sure you want to delete this brand permanently?'))) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم حذف الماركة بنجاح', 'Brand deleted successfully'));
        fetchBrands();
      } else {
        toast.error(data.error || t('فشل حذف الماركة', 'Failed to delete brand'));
      }
    } catch {
      toast.error(t('خطأ في الاتصال', 'Connection error'));
    }
  };

  const toggleBrandActive = async (brand: any) => {
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: brand.id, isActive: !brand.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم تحديث حالة الماركة', 'Brand status updated'));
        fetchBrands();
      } else {
        toast.error(t('فشل تحديث الحالة', 'Failed to update status'));
      }
    } catch {
      toast.error(t('خطأ في الاتصال', 'Connection error'));
    }
  };

  const filteredBrands = brands.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.nameEn && b.nameEn.toLowerCase().includes(q))
    );
  });

  return (
    <div dir={dir} className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-1.5 bg-brand w-full" />
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <Tag className="h-5 w-5 text-brand" />
                {editingBrand ? t('تعديل الماركة', 'Edit Brand') : t('إضافة ماركة جديدة', 'Create Brand')}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="brandName">{t('اسم الماركة بالعربية *', 'Brand Name in Arabic *')}</Label>
                  <Input
                    id="brandName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="نايكي، سامسونج..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="brandNameEn">{t('الاسم بالإنجليزية', 'Name in English')}</Label>
                  <Input
                    id="brandNameEn"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="Nike, Samsung..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="brandLogo">{t('رابط شعار الماركة (اختياري)', 'Brand Logo URL (Optional)')}</Label>
                  <Input
                    id="brandLogo"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border">
                  <Label htmlFor="brandActive" className="cursor-pointer font-bold">
                    {t('الماركة نشطة ومتاحة للتجار', 'Active & Available for Merchants')}
                  </Label>
                  <input
                    id="brandActive"
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setShowModal(false)} disabled={isSaving}>
                    {t('إلغاء', 'Cancel')}
                  </Button>
                  <Button type="submit" className="flex-1 font-bold bg-brand text-navy hover:bg-brand/90" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('حفظ', 'Save')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={getAdminPath('')}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowRight className={`h-5 w-5 ${isAr ? '' : 'rotate-180'}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Tag className="h-6 w-6 text-brand" />
              {t('إدارة الماركات والعلامات التجارية', 'Global Brands Management')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('قم بإنشاء وتوثيق الماركات لضمان جودة وأصالة منتجات المنصة.', 'Create and verify brands to ensure quality and authenticity.')}
            </p>
          </div>
        </div>
        <Button className="gap-2 font-bold bg-brand text-navy hover:bg-brand/90" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          {t('إضافة ماركة جديدة', 'Add New Brand')}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="card-surface">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('البحث عن ماركة...', 'Search brands...')}
              className="ps-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground font-bold">
            {t(`إجمالي الماركات: ${brands.length}`, `Total Brands: ${brands.length}`)}
          </div>
        </CardContent>
      </Card>

      {/* Brands Table Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : filteredBrands.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <ShieldAlert className="h-12 w-12 text-muted-foreground animate-bounce" />
          <h3 className="text-lg font-bold">{t('لا توجد ماركات حالياً', 'No Brands Found')}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t('ابدأ بإضافة الماركات العالمية أو المحلية المعتمدة للمنصة من الزر العلوي.', 'Start adding verified brands for the platform using the button above.')}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBrands.map((b) => (
            <Card key={b.id} className="card-surface overflow-hidden hover:scale-[1.02] transition-transform duration-200">
              <div className="p-5 flex flex-col h-full space-y-4">
                {/* Logo and Status */}
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-border">
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} className="h-full w-full object-cover" />
                    ) : (
                      <Tag className="h-6 w-6 text-brand" />
                    )}
                  </div>
                  <button 
                    onClick={() => toggleBrandActive(b)}
                    className="focus:outline-none transition-transform active:scale-95"
                    title={t('تعديل حالة التفعيل', 'Toggle active status')}
                  >
                    {b.isActive ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full border border-green-500/20">
                        <CheckCircle className="h-3 w-3" />
                        {t('نشطة', 'Active')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-full border border-rose-500/20">
                        <XCircle className="h-3 w-3" />
                        {t('معطلة', 'Inactive')}
                      </span>
                    )}
                  </button>
                </div>

                {/* Name details */}
                <div className="flex-1">
                  <h3 className="font-bold text-base text-foreground">{b.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">{b.nameEn || 'No english name'}</p>
                </div>

                {/* Product Count stats */}
                <div className="flex justify-between items-center pt-3 border-t border-border/60 text-xs font-bold text-muted-foreground">
                  <span>{t('المنتجات المرتبطة:', 'Linked Products:')}</span>
                  <span className="text-brand font-black bg-brand/10 px-2 py-0.5 rounded-full">{b._count?.products || 0}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs font-bold" onClick={() => handleOpenEdit(b)}>
                    <Edit2 className="h-3.5 w-3.5" />
                    {t('تعديل', 'Edit')}
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-1 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('حذف', 'Delete')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
