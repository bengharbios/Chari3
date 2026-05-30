'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { Loader2, FolderTree, ArrowRight, Plus, Check, X, Search, ShieldAlert, CheckCircle2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const { isAdminAuthenticated, adminUser } = useAdminAuthStore();
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;

  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      window.location.href = '/admin-secure-internal/login';
    }
  }, [isMounted, isAdminAuthenticated]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catsRes, reqsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/categories/requests')
      ]);
      const catsData = await catsRes.json();
      const reqsData = await reqsRes.json();
      
      if (catsData.success) setCategories(catsData.categories);
      if (reqsData.success) setRequests(reqsData.requests);
    } catch (error) {
      console.error(error);
      toast.error(t('خطأ في تحميل البيانات', 'Error loading data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted && isAdminAuthenticated) fetchData();
  }, [isMounted, isAdminAuthenticated]);

  const handleRequestAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/categories/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم تحديث الطلب', 'Request updated'));
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(t('حدث خطأ', 'Error occurred'));
    }
  };

  if (!isMounted || !isAdminAuthenticated) return null;

  return (
    <div dir={dir} className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin-secure-internal">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <FolderTree className="h-6 w-6 text-brand" />
              {t('إدارة التصنيفات العالمية', 'Global Categories Management')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('تحكم كامل في أقسام المنتجات، المتاجر، الشحن، وطلبات التجار', 'Full control over products, stores, shipping categories and seller requests')}
            </p>
          </div>
        </div>
        <Button className="gap-2 font-bold" onClick={() => toast.info(t('سيتم إضافة نافذة الإنشاء قريباً', 'Create modal coming soon'))}>
          <Plus className="h-4 w-4" />
          {t('إضافة تصنيف رسمي', 'Add Official Category')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Categories Section */}
          <Card className="lg:col-span-2 card-surface">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('شجرة التصنيفات الحالية', 'Current Category Tree')}</CardTitle>
              <CardDescription>{t('قائمة بجميع التصنيفات المفعلة في المنصة', 'List of all active categories')}</CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FolderTree className="h-10 w-10 mx-auto opacity-20 mb-2" />
                  <p>{t('لا توجد تصنيفات حالياً', 'No categories found')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                      <div className="flex items-center gap-3">
                        {cat.icon ? (
                          <div className="text-xl" dangerouslySetInnerHTML={{ __html: cat.icon }} />
                        ) : (
                          <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">📦</div>
                        )}
                        <div>
                          <p className="font-bold text-sm">{isAr ? cat.name : (cat.nameEn || cat.name)}</p>
                          <p className="text-xs text-muted-foreground">{cat.slug} • {t('النوع:', 'Type:')} {cat.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span title={t('منتجات', 'Products')}>{cat._count?.products || 0} 🛍️</span>
                        <span title={t('متاجر', 'Stores')}>{cat._count?.stores || 0} 🏪</span>
                        <Button variant="ghost" size="sm">{t('تعديل', 'Edit')}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requests Section */}
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                {t('اقتراحات التجار', 'Seller Suggestions')}
                {requests.length > 0 && <Badge variant="destructive" className="rounded-full px-2">{requests.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShieldAlert className="h-10 w-10 mx-auto opacity-20 mb-2" />
                  <p>{t('لا توجد طلبات معلقة', 'No pending requests')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="p-3 rounded-lg border border-border bg-background space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">{req.nameAr} <span className="text-muted-foreground text-xs font-normal">({req.nameEn || 'لا يوجد إنجليزي'})</span></h4>
                          <p className="text-xs text-muted-foreground mt-1">{t('نوع التصنيف المطلوب:', 'Requested Type:')} {req.type}</p>
                          {req.description && <p className="text-xs mt-1 bg-slate-50 p-1 rounded">{req.description}</p>}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground border-t border-border pt-2 flex items-center gap-1">
                        👤 {req.user?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 gap-1" onClick={() => handleRequestAction(req.id, 'approved')}>
                          <CheckCircle2 className="h-3 w-3" /> {t('قبول وإضافة', 'Approve')}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50 gap-1" onClick={() => handleRequestAction(req.id, 'rejected')}>
                          <X className="h-3 w-3" /> {t('رفض', 'Reject')}
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
