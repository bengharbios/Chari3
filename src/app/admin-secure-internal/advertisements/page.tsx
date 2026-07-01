'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
  Loader2, Plus, X, Edit2, Trash2, ToggleLeft, ToggleRight,
  Monitor, ArrowRight, ExternalLink, Calendar, Eye, MousePointerClick,
  AlertCircle, CheckCircle2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/ui/ImageUploader';
import Link from 'next/link';

const AD_ZONES = [
  { value: 'banner_top', label: 'إعلان علوي (Banner Top)', labelEn: 'Top Banner', desc: 'يظهر في أعلى كل صفحات الموقع' },
  { value: 'banner_bottom', label: 'إعلان سفلي (Banner Bottom)', labelEn: 'Bottom Banner', desc: 'يظهر في أسفل الصفحة الرئيسية' },
  { value: 'hero', label: 'بانر الهيرو (Hero)', labelEn: 'Hero Slide', desc: 'يظهر في سلايدر الصفحة الرئيسية' },
  { value: 'category_header', label: 'رأس التصنيفات (Category Header)', labelEn: 'Category Header', desc: 'يظهر في ترويسة صفحات التصنيف' },
  { value: 'sidebar', label: 'إعلان جانبي (Sidebar)', labelEn: 'Sidebar Ad', desc: 'يظهر في الأشرطة الجانبية' },
  { value: 'inline_products', label: 'إعلان وسط المنتجات (Inline Products)', labelEn: 'Inline Products', desc: 'يظهر مندمجاً مع شبكة المنتجات' },
];

const TARGET_ROLES = [
  { value: 'all', label: 'الجميع', labelEn: 'All users' },
  { value: 'buyer', label: 'المشترين المسجلين فقط', labelEn: 'Buyers only' },
  { value: 'guest', label: 'الزوار غير المسجلين فقط', labelEn: 'Guests only' },
];

export default function AdminAdvertisementsPage() {
  const { isAdminAuthenticated } = useAdminAuthStore();
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const t = (ar: string, en: string) => (isAr ? ar : en);

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const [isMounted, setIsMounted] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeZoneFilter, setActiveZoneFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  
  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formZone, setFormZone] = useState('banner_top');
  const [formTargetRole, setFormTargetRole] = useState('all');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formStartsAt, setFormStartsAt] = useState('');
  const [formEndsAt, setFormEndsAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/advertisements');
      const data = await res.json();
      if (data.success) {
        setAds(data.advertisements || []);
      } else {
        toast.error(t('فشل تحميل الإعلانات', 'Failed to load advertisements'));
      }
    } catch {
      toast.error(t('خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted && isAdminAuthenticated) {
      fetchAds();
    }
  }, [isMounted, isAdminAuthenticated]);

  const openCreateModal = () => {
    setEditingAd(null);
    setFormTitle('');
    setFormTitleEn('');
    setFormImageUrl('');
    setFormLinkUrl('');
    setFormZone(activeZoneFilter === 'all' ? 'banner_top' : activeZoneFilter);
    setFormTargetRole('all');
    setFormIsActive(true);
    setFormSortOrder(0);
    setFormStartsAt('');
    setFormEndsAt('');
    setShowModal(true);
  };

  const openEditModal = (ad: any) => {
    setEditingAd(ad);
    setFormTitle(ad.title || '');
    setFormTitleEn(ad.titleEn || '');
    setFormImageUrl(ad.imageUrl || '');
    setFormLinkUrl(ad.linkUrl || '');
    setFormZone(ad.zone || 'banner_top');
    setFormTargetRole(ad.targetRole || 'all');
    setFormIsActive(ad.isActive);
    setFormSortOrder(ad.sortOrder || 0);
    setFormStartsAt(ad.startsAt ? ad.startsAt.substring(0, 16) : '');
    setFormEndsAt(ad.endsAt ? ad.endsAt.substring(0, 16) : '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formTitle || !formImageUrl) {
      toast.error(t('العنوان والصورة مطلوبان', 'Title and Image are required'));
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        title: formTitle,
        titleEn: formTitleEn || null,
        imageUrl: formImageUrl,
        linkUrl: formLinkUrl || null,
        zone: formZone,
        targetRole: formTargetRole,
        isActive: formIsActive,
        sortOrder: Number(formSortOrder),
        startsAt: formStartsAt ? new Date(formStartsAt).toISOString() : null,
        endsAt: formEndsAt ? new Date(formEndsAt).toISOString() : null,
      };

      let res;
      if (editingAd) {
        res = await fetch('/api/admin/advertisements', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAd.id, ...payload }),
        });
      } else {
        res = await fetch('/api/admin/advertisements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success(editingAd ? t('تم تعديل الإعلان بنجاح', 'Advertisement updated successfully') : t('تم إنشاء الإعلان بنجاح', 'Advertisement created successfully'));
        setShowModal(false);
        fetchAds();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t('فشل الحفظ', 'Save failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (ad: any) => {
    try {
      const res = await fetch('/api/admin/advertisements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, isActive: !ad.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(ad.isActive ? t('تم إيقاف الإعلان', 'Advertisement deactivated') : t('تم تفعيل الإعلان', 'Advertisement activated'));
        fetchAds();
      }
    } catch {
      toast.error(t('فشل تغيير الحالة', 'Failed to toggle status'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('هل أنت متأكد من حذف هذا الإعلان؟', 'Are you sure you want to delete this ad?'))) return;
    try {
      const res = await fetch(`/api/admin/advertisements?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم حذف الإعلان بنجاح', 'Advertisement deleted successfully'));
        fetchAds();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t('فشل حذف الإعلان', 'Failed to delete advertisement'));
    }
  };

  if (!isMounted || !isAdminAuthenticated) return null;

  const filteredAds = activeZoneFilter === 'all' 
    ? ads 
    : ads.filter(ad => ad.zone === activeZoneFilter);

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      
      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-3xl shadow-2xl p-6 w-full max-w-xl space-y-5 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-brand" />
                {editingAd ? t('تعديل الإعلان الحالي', 'Edit Advertisement') : t('إنشاء إعلان أو بنر ترويجي جديد', 'Create New Advertisement')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image Upload Component */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold block">{t('صورة الإعلان *', 'Ad Banner Image *')}</Label>
              <ImageUploader 
                value={formImageUrl} 
                onChange={(url) => setFormImageUrl(url)}
                hint={t('ارفع صورة عالية الجودة لتبهر عملائك', 'Upload a high-quality banner image')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t('العنوان بالعربية *', 'Title (Arabic) *')}</Label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="مثال: عروض الجمعة البيضاء" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t('العنوان بالإنجليزية', 'Title (English)')}</Label>
                <Input value={formTitleEn} onChange={e => setFormTitleEn(e.target.value)} placeholder="e.g. White Friday Sales" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t('موقع الإعلان (المنطقة)', 'Ad Placement Zone')}</Label>
                <select 
                  value={formZone} 
                  onChange={e => setFormZone(e.target.value)} 
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                >
                  {AD_ZONES.map(z => (
                    <option key={z.value} value={z.value}>{isAr ? z.label : z.labelEn}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t('المستهدفون', 'Target Audience')}</Label>
                <select 
                  value={formTargetRole} 
                  onChange={e => setFormTargetRole(e.target.value)} 
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                >
                  {TARGET_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{isAr ? r.label : r.labelEn}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t('رابط التوجيه (أو المنتج)', 'Link URL')}</Label>
                <Input value={formLinkUrl} onChange={e => setFormLinkUrl(e.target.value)} placeholder="e.g. /search?q=sale" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t('الترتيب', 'Sort Order')}</Label>
                <Input type="number" value={formSortOrder} onChange={e => setFormSortOrder(Number(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t('تاريخ البدء (اختياري)', 'Start Date (Optional)')}</Label>
                <Input type="datetime-local" value={formStartsAt} onChange={e => setFormStartsAt(e.target.value)} className="w-full" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t('تاريخ الانتهاء (اختياري)', 'End Date (Optional)')}</Label>
                <Input type="datetime-local" value={formEndsAt} onChange={e => setFormEndsAt(e.target.value)} className="w-full" />
              </div>
            </div>

            <div className="flex items-center gap-2 py-1 select-none">
              <button 
                type="button" 
                onClick={() => setFormIsActive(p => !p)} 
                className="text-brand hover:text-brand-dark transition-colors"
              >
                {formIsActive ? <ToggleRight className="h-7 w-7 text-green-500" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('تفعيل الإعلان فوراً ونشره', 'Publish and activate immediately')}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowModal(false)}>{t('إلغاء', 'Cancel')}</Button>
              <Button className="flex-1 font-bold gap-2 rounded-xl bg-brand hover:bg-brand/90 text-navy" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingAd ? t('حفظ التعديلات', 'Save Changes') : t('إنشاء ونشر الإعلان', 'Create Advertisement')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={getAdminPath('')}>
            <Button variant="outline" size="icon" className="rounded-full shadow-sm">
              <ArrowRight className={`h-5 w-5 ${isAr ? '' : 'rotate-180'}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Monitor className="h-6 w-6 text-brand" />
              {t('إدارة الإعلانات والبنرات العامة', 'Global Banner & Ad Management')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('تحكم في البنرات والروابط الترويجية وحملات الخصم في كل زوايا المنصة', 'Manage promotional banners, custom URLs, and discount campaigns across all pages')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchAds} className="rounded-xl">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button className="gap-2 font-bold rounded-xl bg-brand hover:bg-brand/90 text-navy" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            {t('إضافة إعلان جديد', 'Add Advertisement')}
          </Button>
        </div>
      </div>

      {/* Placement Filter Tabs */}
      <div className="flex gap-2 flex-wrap bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveZoneFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeZoneFilter === 'all'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('الكل', 'All placements')}
        </button>
        {AD_ZONES.map(z => (
          <button
            key={z.value}
            onClick={() => setActiveZoneFilter(z.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeZoneFilter === z.value
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isAr ? z.label.split(' ')[0] : z.labelEn}
          </button>
        ))}
      </div>

      {/* Advertisements Grid */}
      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : filteredAds.length === 0 ? (
        <Card className="border-dashed border-2 py-16 text-center text-muted-foreground max-w-3xl mx-auto rounded-3xl">
          <Monitor className="h-12 w-12 mx-auto opacity-15 mb-3" />
          <p className="font-semibold text-base">{t('لا توجد إعلانات نشطة في هذه المنطقة', 'No active advertisements in this zone')}</p>
          <p className="text-xs mt-1">{t('اضغط على "إضافة إعلان جديد" لبدء إنشاء حملتك الترويجية الأولى.', 'Click on "Add Advertisement" to create your first promotion.')}</p>
          <Button className="mt-4 gap-1.5 rounded-xl bg-brand hover:bg-brand/90 text-navy font-bold" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5" />
            {t('إنشاء أول إعلان', 'Create First Ad')}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAds.map(ad => {
            const starts = ad.startsAt ? new Date(ad.startsAt).toLocaleDateString(isAr ? 'ar-DZ' : 'en-US') : null;
            const ends = ad.endsAt ? new Date(ad.endsAt).toLocaleDateString(isAr ? 'ar-DZ' : 'en-US') : null;
            const isScheduled = starts || ends;
            const placement = AD_ZONES.find(z => z.value === ad.zone);
            const placementLabel = placement ? (isAr ? placement.label : placement.labelEn) : ad.zone;

            return (
              <Card 
                key={ad.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-3xl border border-border/80 flex flex-col group hover:-translate-y-1"
              >
                {/* Image & Stats overlay */}
                <div className="relative aspect-[16/9] bg-muted overflow-hidden shrink-0">
                  {ad.imageUrl ? (
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 flex gap-1.5 select-none">
                    <Badge className={ad.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                      {ad.isActive ? t('نشط', 'Active') : t('معطل', 'Inactive')}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-900/60 backdrop-blur-md text-white border-none">
                      {ad.sortOrder !== undefined ? `${t('ترتيب:', 'Order:')} ${ad.sortOrder}` : ''}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4 text-start">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black text-brand tracking-wider">{placementLabel}</span>
                      <span className="text-[10px] text-muted-foreground">{t('المستهدفون:', 'Audience:')} {ad.targetRole}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{isAr ? ad.title : (ad.titleEn || ad.title)}</h3>
                    {ad.linkUrl && (
                      <a 
                        href={ad.linkUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-muted-foreground hover:text-brand flex items-center gap-1 w-fit mt-1 break-all"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {ad.linkUrl}
                      </a>
                    )}
                  </div>

                  {/* Scheduled date */}
                  {isScheduled && (
                    <div className="text-[10px] bg-slate-50 dark:bg-slate-900/60 border p-2 rounded-xl text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-brand shrink-0" />
                      <div>
                        {starts && <span>{t('من', 'From')} {starts}</span>} {ends && <span>{t('إلى', 'To')} {ends}</span>}
                      </div>
                    </div>
                  )}

                  {/* Stats & Actions */}
                  <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold select-none">
                      <span className="flex items-center gap-1" title={t('المشاهدات', 'Impressions')}>
                        <Eye className="h-3.5 w-3.5 opacity-60" />
                        {ad.impressions || 0}
                      </span>
                      <span className="flex items-center gap-1" title={t('النقرات', 'Clicks')}>
                        <MousePointerClick className="h-3.5 w-3.5 opacity-60" />
                        {ad.clicks || 0}
                      </span>
                      {ad.impressions > 0 && (
                        <span className="text-[10px] text-emerald-500 font-bold">
                          {((ad.clicks / ad.impressions) * 100).toFixed(1)}% CTR
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-brand rounded-lg"
                        onClick={() => openEditModal(ad)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-brand rounded-lg"
                        onClick={() => handleToggleActive(ad)}
                      >
                        {ad.isActive ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
