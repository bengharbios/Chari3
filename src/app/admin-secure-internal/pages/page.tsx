'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LayoutTemplate, Plus, MoreVertical, Edit, Globe, EyeOff, Trash2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function CustomPagesList() {
  const { t, isAr } = useTranslation();
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New page state
  const [newSlug, setNewSlug] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTitleFr, setNewTitleFr] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      if (data.success) {
        setPages(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch pages');
      }
    } catch (e) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug || !newTitleAr || !newTitleEn || !newTitleFr) {
      toast.error(t('admin.requiredFields', 'Please fill all required fields'));
      return;
    }
    
    // Auto format slug
    const formattedSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: formattedSlug,
          titleAr: newTitleAr,
          titleEn: newTitleEn,
          titleFr: newTitleFr
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('admin.pageCreated', 'Page created successfully'));
        setShowCreateModal(false);
        setNewSlug(''); setNewTitleAr(''); setNewTitleEn(''); setNewTitleFr('');
        router.push(`/admin-secure-internal/pages/${data.data.id}/builder`);
      } else {
        toast.error(data.error || 'Failed to create page');
      }
    } catch (e) {
      toast.error('Error creating page');
    } finally {
      setIsCreating(false);
    }
  };

  const togglePublish = async (page: any) => {
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !page.isPublished })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('admin.saved', 'Saved successfully'));
        setPages(pages.map(p => p.id === page.id ? { ...p, isPublished: !p.isPublished } : p));
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDelete', 'Are you sure you want to delete this?'))) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('admin.deleted', 'Deleted successfully'));
        setPages(pages.filter(p => p.id !== id));
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Error deleting');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-brand" />
            {t('admin.customPages', 'الصفحات المخصصة')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('admin.customPagesDesc', 'إدارة وتصميم صفحات الموقع (مثل: من نحن، الشروط، الأسئلة الشائعة)')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-brand text-brand-foreground px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('admin.createNewPage', 'إنشاء صفحة جديدة')}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutTemplate className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
            {t('admin.noPagesYet', 'لا توجد صفحات حالياً')}
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
            {t('admin.noPagesDesc', 'ابدأ بإنشاء صفحتك الأولى باستخدام أداة التصميم المرئية المتقدمة الخاصة بنا.')}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold shadow hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('admin.createNewPage', 'إنشاء صفحة جديدة')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page.id} className="group overflow-hidden flex flex-col border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:border-brand/30">
              <div className="p-5 flex-1 relative">
                <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${page.isPublished ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                    {page.isPublished ? t('admin.published', 'منشور') : t('admin.draft', 'مسودة')}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-1 pr-16 rtl:pl-16 rtl:pr-0 truncate" dir="auto">{page.titleAr}</h3>
                <p className="text-xs text-muted-foreground mb-4 truncate">{page.titleEn} / {page.titleFr}</p>
                
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg font-mono">
                  <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">/pages/{page.slug}</span>
                </div>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-900/20 px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin-secure-internal/pages/${page.id}/builder`)}
                    className="h-8 px-3 flex items-center gap-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-xs font-bold transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {t('admin.design', 'تصميم الصفحة')}
                  </button>
                  <a
                    href={`/pages/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                    title="معاينة"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePublish(page)}
                    className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${page.isPublished ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                    title={page.isPublished ? 'إلغاء النشر' : 'نشر'}
                  >
                    {page.isPublished ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {t('admin.createNewPage', 'إنشاء صفحة جديدة')}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                املأ البيانات الأساسية للصفحة (يمكنك تغييرها لاحقاً)
              </p>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">الرابط (Slug) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono" dir="ltr">/pages/</span>
                  <input
                    type="text"
                    required
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="about-us"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand pl-[60px]"
                    dir="ltr"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">يجب أن يكون باللغة الإنجليزية وبدون مسافات (مثال: privacy-policy)</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">العنوان بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="مثال: من نحن"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">العنوان بالإنجليزية *</label>
                <input
                  type="text"
                  required
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g. About Us"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">العنوان بالفرنسية *</label>
                <input
                  type="text"
                  required
                  value={newTitleFr}
                  onChange={(e) => setNewTitleFr(e.target.value)}
                  placeholder="e.g. À propos"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                  dir="ltr"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl py-2.5 text-sm font-bold transition-colors"
                >
                  {t('common.cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-brand text-brand-foreground rounded-xl py-2.5 text-sm font-bold shadow-lg hover:bg-brand/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isCreating ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : 'حفظ ومتابعة التصميم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
