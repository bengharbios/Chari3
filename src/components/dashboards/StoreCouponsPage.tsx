'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Plus, Trash2, Calendar, Loader2, Sparkles, Check, DollarSign, Percent, Globe, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function StoreCouponsPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  const [coupons, setCoupons] = useState<any[]>([]);
  const [globalCoupons, setGlobalCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // New Coupon Form States
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [applicableTo, setApplicableTo] = useState('all'); // all, categories, products
  const [targetIds, setTargetIds] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchCoupons();
      fetchGlobalCoupons();
      fetchCategoriesAndProducts();
    }
  }, [user?.id]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`/api/seller/coupons?userId=${user?.id}`);
      const data = await res.json();
      if (data.success) setCoupons(data.coupons || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGlobalCoupons = async () => {
    try {
      const res = await fetch(`/api/seller/coupons/global?userId=${user?.id}`);
      const data = await res.json();
      if (data.success) setGlobalCoupons(data.globalCoupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoriesAndProducts = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/seller/products?userId=${user?.id}`)
      ]);
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      if (catData.success) setCategories(catData.categories);
      if (prodData.success) setProducts(prodData.products);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !code || !value) {
      toast.warning(t('يرجى ملء الحقول المطلوبة!', 'Please fill in required fields!'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/seller/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          code: code.toUpperCase().trim(),
          type,
          value: parseFloat(value),
          minOrder: minOrder ? parseFloat(minOrder) : null,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          applicableTo,
          targetIds: applicableTo === 'all' ? [] : targetIds
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t('تم إنشاء الكوبون الجديد بنجاح!', 'New coupon successfully created!'));
        setCode(''); setValue(''); setMinOrder(''); setUsageLimit(''); setExpiresAt(''); setApplicableTo('all'); setTargetIds([]);
        setShowAddForm(false);
        fetchCoupons();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t('فشل إضافة الكوبون', 'Failed to add coupon'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!user?.id) return;
    if (!confirm(t('هل أنت متأكد من رغبتك في حذف هذا الكوبون؟', 'Are you sure you want to delete this coupon?'))) return;
    try {
      const res = await fetch(`/api/seller/coupons?id=${couponId}&userId=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم حذف الكوبون بنجاح!', 'Coupon successfully deleted!'));
        fetchCoupons();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t('فشل حذف الكوبون', 'Failed to delete coupon'));
    }
  };

  const handleOptIn = async (couponId: string, action: 'opt-in' | 'opt-out') => {
    try {
      const res = await fetch('/api/seller/coupons/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, couponId, action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'opt-in' ? t('تم الانضمام للعرض بنجاح', 'Opted in successfully') : t('تم الانسحاب من العرض', 'Opted out successfully'));
        fetchGlobalCoupons();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(t('حدث خطأ', 'Error occurred'));
    }
  };

  const toggleTargetId = (id: string) => {
    setTargetIds(prev => prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]);
  };

  return (
    <motion.div className="space-y-6 p-4 md:p-6 text-start" variants={STAGGER_CONTAINER} initial="hidden" animate="visible">
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('الكوبونات وعروض الخصم', 'Store Coupons')}
          description={t('قم بإنشاء وتعديل أكواد الخصم والتحكم بنسب التخفيض والانضمام للحملات العالمية.', 'Create, manage, and distribute shopping discount codes or join global campaigns.')}
        />
      </motion.div>

      <Tabs defaultValue="my-coupons" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/50 rounded-xl p-1 border border-white/5">
          <TabsTrigger value="my-coupons" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
            <Tag className="w-4 h-4 me-2" />
            {t('كوبوناتي الخاصة', 'My Coupons')}
          </TabsTrigger>
          <TabsTrigger value="global" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
            <Globe className="w-4 h-4 me-2" />
            {t('الكوبونات العالمية', 'Global Campaigns')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-coupons" className="mt-6 space-y-6">
          <div className="flex justify-end">
             <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:scale-105 transition-all">
                {showAddForm ? t('إلغاء', 'Cancel') : <><Plus className="h-4 w-4 me-2" />{t('إنشاء كوبون جديد', 'Create New Coupon')}</>}
             </Button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden relative">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      {t('بيانات الكوبون الجديد', 'New Coupon Details')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">{t('رمز الكوبون *', 'Coupon Code *')}</Label>
                          <Input placeholder="e.g. SUMMER26" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required className="bg-muted/30 border-white/10 rounded-xl uppercase font-mono tracking-widest text-center" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">{t('نوع الخصم *', 'Discount Type *')}</Label>
                          <div className="flex bg-muted/40 rounded-xl p-1 border border-white/5">
                            <button type="button" onClick={() => setType('percentage')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${type === 'percentage' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}>
                              <Percent className="h-3 w-3 inline me-1" />{t('نسبة مئوية', 'Percentage')}
                            </button>
                            <button type="button" onClick={() => setType('flat')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${type === 'flat' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}>
                              <DollarSign className="h-3 w-3 inline me-1" />{t('قيمة ثابتة', 'Flat Amount')}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">{t('قيمة الخصم *', 'Discount Value *')}</Label>
                          <Input type="number" placeholder={type === 'percentage' ? '15%' : '500 DZD'} value={value} onChange={(e) => setValue(e.target.value)} required className="bg-muted/30 border-white/10 rounded-xl font-bold" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-primary mt-4">{t('المنتجات المشمولة بالخصم', 'Applicable To')}</Label>
                        <div className="flex bg-muted/40 rounded-xl p-1 border border-white/5 max-w-md">
                           <button type="button" onClick={() => setApplicableTo('all')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${applicableTo === 'all' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}>
                              {t('كل المتجر', 'All Store')}
                           </button>
                           <button type="button" onClick={() => { setApplicableTo('categories'); setTargetIds([]); }} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${applicableTo === 'categories' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}>
                              {t('أقسام محددة', 'Specific Categories')}
                           </button>
                           <button type="button" onClick={() => { setApplicableTo('products'); setTargetIds([]); }} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${applicableTo === 'products' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}>
                              {t('منتجات محددة', 'Specific Products')}
                           </button>
                        </div>
                      </div>

                      {applicableTo === 'categories' && (
                        <div className="p-4 border border-white/10 rounded-xl bg-background/50 grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                          {categories.map(c => (
                            <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                              <input type="checkbox" checked={targetIds.includes(c.id)} onChange={() => toggleTargetId(c.id)} className="rounded border-primary" />
                              <span className="text-sm">{isAr ? c.name : c.nameEn}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {applicableTo === 'products' && (
                        <div className="p-4 border border-white/10 rounded-xl bg-background/50 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {products.map(p => (
                            <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                              <input type="checkbox" checked={targetIds.includes(p.id)} onChange={() => toggleTargetId(p.id)} className="rounded border-primary" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium line-clamp-1">{isAr ? p.name : p.nameEn}</span>
                                <span className="text-xs text-muted-foreground">{p.price} د.ج</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                          <Label>{t('الحد الأدنى للطلب (د.ج)', 'Min Order Value')}</Label>
                          <Input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="bg-muted/30 border-white/10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('الحد الأقصى لمرات الاستخدام', 'Usage Limit')}</Label>
                          <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className="bg-muted/30 border-white/10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('تاريخ انتهاء الصلاحية', 'Expiration Date')}</Label>
                          <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="bg-muted/30 border-white/10 rounded-xl" />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold bg-primary text-primary-foreground w-full sm:w-auto">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
                          {t('حفظ', 'Save')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden relative p-5">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-lg"><Tag className="h-4 w-4" />{coupon.code}</div>
                    <Badge variant="outline">{coupon.isActive ? t('نشط', 'Active') : t('غير نشط', 'Inactive')}</Badge>
                 </div>
                 <div className="text-3xl font-black mb-4">{coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} DZD`}</div>
                 <div className="text-xs text-muted-foreground space-y-1">
                    <p>{t('المشمول: ', 'Applies to: ')}<span className="text-foreground">{coupon.applicableTo === 'all' ? t('كل المنتجات', 'All Products') : coupon.applicableTo === 'categories' ? t('أقسام محددة', 'Specific Categories') : t('منتجات محددة', 'Specific Products')}</span></p>
                    <p>{t('ينتهي: ', 'Expires: ')}<span className="text-foreground">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : t('مفتوح', 'Never')}</span></p>
                    <p>{t('الاستخدام: ', 'Usage: ')}<span className="text-foreground">{coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}</span></p>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="absolute bottom-4 left-4 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
              </Card>
            ))}
            {coupons.length === 0 && !isLoading && (
              <div className="col-span-full text-center p-8 text-muted-foreground">{t('لا توجد كوبونات خاصة بمتجرك', 'No store coupons found')}</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="global" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {globalCoupons.map((coupon) => {
              const hasOptedInStore = coupon.optInStores?.length > 0;
              const hasOptedInSeller = coupon.optInSellers?.length > 0;
              const isOptedIn = hasOptedInStore || hasOptedInSeller;
              const limitReached = coupon.maxStoresLimit && (coupon._count?.optInStores + coupon._count?.optInSellers) >= coupon.maxStoresLimit;

              return (
                <Card key={coupon.id} className="border-primary/20 bg-primary/5 backdrop-blur-xl shadow-xl rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex justify-between items-start mb-4 relative">
                     <div>
                       <Badge className="bg-primary text-primary-foreground mb-2"><Globe className="w-3 h-3 me-1 inline" /> {t('حملة عالمية', 'Global Campaign')}</Badge>
                       <h3 className="font-black tracking-widest text-xl">{coupon.code}</h3>
                     </div>
                     <div className="text-right">
                       <span className="text-3xl font-black text-primary block">{coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} DZD`}</span>
                       <span className="text-xs text-muted-foreground">{t('تخفيض من المنصة', 'Platform Discount')}</span>
                     </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-6 space-y-1 relative">
                     <p>{t('الحد الأدنى للطلب: ', 'Min Order: ')}<span className="text-foreground font-bold">{coupon.minOrder || 0} د.ج</span></p>
                     <p>{t('المتاجر المنضمة: ', 'Joined Stores: ')}<span className="text-foreground font-bold">{(coupon._count?.optInStores || 0) + (coupon._count?.optInSellers || 0)}</span> {coupon.maxStoresLimit ? ` / ${coupon.maxStoresLimit}` : ''}</p>
                  </div>
                  {isOptedIn ? (
                    <Button onClick={() => handleOptIn(coupon.id, 'opt-out')} variant="outline" className="w-full rounded-xl border-red-500/50 text-red-500 hover:bg-red-500/10">
                      {t('الانسحاب من العرض', 'Opt-out of Campaign')}
                    </Button>
                  ) : (
                    <Button onClick={() => handleOptIn(coupon.id, 'opt-in')} disabled={limitReached} className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:scale-105 transition-transform font-bold">
                      <Sparkles className="w-4 h-4 me-2" />
                      {limitReached ? t('اكتمل العدد', 'Limit Reached') : t('الانضمام للعرض الآن', 'Join Campaign Now')}
                    </Button>
                  )}
                </Card>
              );
            })}
            {globalCoupons.length === 0 && !isLoading && (
              <div className="col-span-full text-center p-8 text-muted-foreground">{t('لا توجد حملات عالمية نشطة حالياً', 'No active global campaigns')}</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
