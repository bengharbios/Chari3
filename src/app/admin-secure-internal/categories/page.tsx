'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import {
  Loader2, FolderTree, ArrowRight, Plus, X, ShieldAlert,
  CheckCircle2, MessageSquare, Edit2, ToggleLeft, ToggleRight, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const CATEGORY_TYPES = [
  { value: 'product', label: 'منتجات', labelEn: 'Products', emoji: '🛍️' },
  { value: 'store', label: 'متاجر', labelEn: 'Stores', emoji: '🏪' },
  { value: 'supplier', label: 'موردون', labelEn: 'Suppliers', emoji: '🏭' },
  { value: 'logistics', label: 'شحن ولوجستيات', labelEn: 'Logistics', emoji: '🚚' },
];

const TYPE_COLORS: Record<string, string> = {
  product: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  store: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  supplier: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  logistics: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const COMMON_ICONS = ['📦','🛍️','👗','👟','📱','💻','🏠','🍕','💊','🚗','📚','🎮','💄','⚽','🎵','🌱','🔧','💎','🏪','🏭'];

export default function AdminCategoriesPage() {
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
  const [categories, setCategories] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState('product');

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIcon, setFormIcon] = useState('📦');
  const [formType, setFormType] = useState('product');
  const [formParentId, setFormParentId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      window.location.href = getAdminPath('login');
    }
  }, [isMounted, isAdminAuthenticated]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catsRes, reqsRes] = await Promise.all([
        fetch(`/api/admin/categories?type=${activeType}`),
        fetch('/api/admin/categories/requests?status=pending')
      ]);
      const catsData = await catsRes.json();
      const reqsData = await reqsRes.json();
      if (catsData.success) setCategories(catsData.categories);
      if (reqsData.success) setRequests(reqsData.requests);
    } catch {
      toast.error(t('خطأ في تحميل البيانات', 'Error loading data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted && isAdminAuthenticated) fetchData();
  }, [isMounted, isAdminAuthenticated, activeType]);

  const openCreateModal = (prefill?: any) => {
    setEditingCat(null);
    setFormName(prefill?.nameAr || '');
    setFormNameEn(prefill?.nameEn || '');
    setFormSlug(prefill?.nameEn ? prefill.nameEn.toLowerCase().replace(/\s+/g, '-') : '');
    setFormIcon('📦');
    setFormType(prefill?.type || activeType);
    setFormParentId('');
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCat(cat);
    setFormName(cat.name);
    setFormNameEn(cat.nameEn || '');
    setFormSlug(cat.slug);
    setFormIcon(cat.icon || '📦');
    setFormType(cat.type);
    setFormParentId(cat.parentId || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName || !formSlug) {
      toast.error(t('الاسم والرابط مطلوبان', 'Name and slug are required'));
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: formName,
        nameEn: formNameEn,
        slug: formSlug,
        icon: formIcon,
        type: formType,
        parentId: formParentId || null,
      };

      if (editingCat) {
        const res = await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCat.id, ...payload }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success(t('تم تحديث التصنيف', 'Category updated'));
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success(t('تم إنشاء التصنيف بنجاح', 'Category created successfully'));
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || t('فشل الحفظ', 'Save failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (cat: any) => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, isActive: !cat.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(cat.isActive ? t('تم إخفاء التصنيف', 'Category hidden') : t('تم تفعيل التصنيف', 'Category activated'));
        fetchData();
      }
    } catch {
      toast.error(t('فشل تغيير الحالة', 'Failed to toggle status'));
    }
  };

  const handleRequestAction = async (req: any, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/categories/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: req.id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(status === 'approved' ? t('تم قبول الطلب', 'Request approved') : t('تم رفض الطلب', 'Request rejected'));
        if (status === 'approved') {
          openCreateModal({ nameAr: req.nameAr, nameEn: req.nameEn, type: req.type });
        }
        fetchData();
      }
    } catch {
      toast.error(t('حدث خطأ', 'Error occurred'));
    }
  };

  if (!isMounted || !isAdminAuthenticated) return null;

  return (
    <div dir={dir} className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-brand" />
                {editingCat ? t('تعديل التصنيف', 'Edit Category') : t('إضافة تصنيف رسمي جديد', 'Add New Official Category')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground rounded-full p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Icon Picker */}
            <div>
              <Label className="text-xs font-bold mb-2 block">{t('اختر أيقونة', 'Choose Icon')}</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setFormIcon(icon)}
                    className={`text-xl p-1.5 rounded-lg border-2 transition-all ${formIcon === icon ? 'border-brand bg-brand/10' : 'border-transparent hover:border-border'}`}
                  >
                    {icon}
                  </button>
                ))}
                <input
                  type="text"
                  value={formIcon}
                  onChange={e => setFormIcon(e.target.value)}
                  className="w-12 text-center bg-background border border-border rounded-lg text-xl"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold">{t('الاسم بالعربية *', 'Arabic Name *')}</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} className="mt-1" placeholder="إلكترونيات" />
              </div>
              <div>
                <Label className="text-xs font-bold">{t('الاسم بالإنجليزية', 'English Name')}</Label>
                <Input
                  value={formNameEn}
                  onChange={e => {
                    setFormNameEn(e.target.value);
                    if (!editingCat) setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                  }}
                  className="mt-1"
                  placeholder="Electronics"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">{t('الرابط (Slug) *', 'URL Slug *')}</Label>
              <Input value={formSlug} onChange={e => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} className="mt-1 font-mono" placeholder="electronics" />
              <p className="text-xs text-muted-foreground mt-1">/{formSlug}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold">{t('نوع التصنيف', 'Category Type')}</Label>
                <select value={formType} onChange={e => setFormType(e.target.value)} className="mt-1 w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm">
                  {CATEGORY_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value}>{ct.emoji} {isAr ? ct.label : ct.labelEn}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs font-bold">{t('التصنيف الأب (اختياري)', 'Parent Category (optional)')}</Label>
                <select value={formParentId} onChange={e => setFormParentId(e.target.value)} className="mt-1 w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm">
                  <option value="">{t('— بدون أب (رئيسي) —', '— None (Top-level) —')}</option>
                  {categories.filter(c => c.id !== editingCat?.id && !c.parentId).map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {isAr ? c.name : (c.nameEn || c.name)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>{t('إلغاء', 'Cancel')}</Button>
              <Button className="flex-1 font-bold gap-2" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingCat ? t('حفظ التعديلات', 'Save Changes') : t('إنشاء التصنيف', 'Create Category')}
              </Button>
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
              <FolderTree className="h-6 w-6 text-brand" />
              {t('إدارة التصنيفات العالمية', 'Global Categories Management')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('تحكم كامل في أقسام المنتجات، المتاجر، الموردين والشحن', 'Full control over products, stores, suppliers and logistics categories')}
            </p>
          </div>
        </div>
        <Button className="gap-2 font-bold" onClick={() => openCreateModal()}>
          <Plus className="h-4 w-4" />
          {t('إضافة تصنيف رسمي', 'Add Official Category')}
        </Button>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_TYPES.map(ct => (
          <button
            key={ct.value}
            onClick={() => setActiveType(ct.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              activeType === ct.value
                ? 'bg-brand text-white border-brand shadow-md'
                : 'bg-background border-border text-muted-foreground hover:border-brand/40'
            }`}
          >
            <span>{ct.emoji}</span>
            {isAr ? ct.label : ct.labelEn}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Categories Tree */}
          <Card className="lg:col-span-2 card-surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-bold">{t('شجرة التصنيفات', 'Category Tree')}</CardTitle>
                <CardDescription>
                  {categories.length} {t('تصنيف', 'categories')} • {t('النوع:', 'Type:')} {isAr ? CATEGORY_TYPES.find(c => c.value === activeType)?.label : CATEGORY_TYPES.find(c => c.value === activeType)?.labelEn}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-14 text-muted-foreground">
                  <FolderTree className="h-12 w-12 mx-auto opacity-15 mb-3" />
                  <p className="font-semibold">{t('لا توجد تصنيفات لهذا النوع', 'No categories for this type')}</p>
                  <p className="text-xs mt-1">{t('ابدأ بإضافة أول تصنيف رسمي', 'Start by adding the first official category')}</p>
                  <Button size="sm" className="mt-4 gap-1.5" onClick={() => openCreateModal()}>
                    <Plus className="h-3.5 w-3.5" />
                    {t('إضافة الآن', 'Add Now')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Top-level */}
                  {categories.filter(c => !c.parentId).map(cat => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-brand/30 transition-all group">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cat.icon || '📦'}</span>
                          <div>
                            <p className="font-bold text-sm">{isAr ? cat.name : (cat.nameEn || cat.name)}</p>
                            <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                          </div>
                          <Badge className={`text-[10px] px-2 ${TYPE_COLORS[cat.type] || ''}`}>{cat.type}</Badge>
                          {!cat.isActive && <Badge variant="secondary" className="text-[10px]">{t('مخفي', 'Hidden')}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span title={t('منتجات', 'Products')}>🛍️ {cat._count?.products || 0}</span>
                          <span title={t('متاجر', 'Stores')}>🏪 {cat._count?.stores || 0}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModal(cat)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleActive(cat)}>
                              {cat.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Sub-categories */}
                      {categories.filter(c => c.parentId === cat.id).map(sub => (
                        <div key={sub.id} className="flex items-center justify-between p-2.5 ms-8 rounded-xl border border-dashed border-border bg-muted/30 hover:border-brand/20 transition-all group mt-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{sub.icon || '📁'}</span>
                            <div>
                              <p className="font-semibold text-xs">{isAr ? sub.name : (sub.nameEn || sub.name)}</p>
                              <p className="text-[10px] text-muted-foreground">/{sub.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditModal(sub)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleActive(sub)}>
                              {sub.isActive ? <ToggleRight className="h-3.5 w-3.5 text-green-500" /> : <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                {t('اقتراحات التجار', 'Seller Suggestions')}
                {requests.length > 0 && (
                  <Badge variant="destructive" className="rounded-full px-2 text-xs">{requests.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>{t('طلبات التصنيفات المعلقة للمراجعة', 'Pending category requests for review')}</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <ShieldAlert className="h-10 w-10 mx-auto opacity-15 mb-2" />
                  <p className="text-sm font-semibold">{t('لا توجد طلبات معلقة', 'No pending requests')}</p>
                  <p className="text-xs mt-1">{t('جميع اقتراحات التجار تمت مراجعتها', 'All seller suggestions reviewed')}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {requests.map(req => (
                    <div key={req.id} className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{req.nameAr}</h4>
                          {req.nameEn && <p className="text-xs text-muted-foreground">{req.nameEn}</p>}
                          <Badge className={`text-[10px] mt-1 px-2 ${TYPE_COLORS[req.type] || ''}`}>{req.type}</Badge>
                        </div>
                        <Tag className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      </div>
                      {req.description && (
                        <p className="text-xs bg-white dark:bg-black/20 p-2 rounded-lg text-muted-foreground border border-border">
                          "{req.description}"
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 border-t border-border/50 pt-2">
                        👤 <span className="font-medium">{req.user?.name || 'Unknown'}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span>{req.user?.role}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1 text-xs"
                          onClick={() => handleRequestAction(req, 'approved')}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t('قبول وإنشاء', 'Approve & Create')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 gap-1 text-xs border-red-200"
                          onClick={() => handleRequestAction(req, 'rejected')}
                        >
                          <X className="h-3.5 w-3.5" />
                          {t('رفض', 'Reject')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
