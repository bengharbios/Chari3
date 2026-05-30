'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tag, Plus, Trash2, Calendar, AlertCircle, Loader2, Sparkles, Check, DollarSign, Percent
} from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Coupon Form States
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage'); // percentage or flat
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const fetchCoupons = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/coupons?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to load coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ أثناء تحميل الكوبونات', 'Error loading coupons'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [user?.id]);

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
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t('🎉 تم إنشاء الكوبون الجديد بنجاح!', '🎉 New coupon successfully created!'));
        setCode('');
        setValue('');
        setMinOrder('');
        setUsageLimit('');
        setExpiresAt('');
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
      const res = await fetch(`/api/seller/coupons?id=${couponId}&userId=${user.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('🗑️ تم حذف الكوبون بنجاح!', '🗑️ Coupon successfully deleted!'));
        fetchCoupons();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t('فشل حذف الكوبون', 'Failed to delete coupon'));
    }
  };

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6 text-start"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('الكوبونات وعروض الخصم (Coupons)', 'Store Coupons')}
          description={t('قم بإنشاء وتعديل أكواد الخصم والتحكم بنسب التخفيض لمنتجات متجرك.', 'Create, manage, and distribute shopping discount codes for your store.')}
        />
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full sm:w-auto"
        >
          {showAddForm ? t('إلغاء', 'Cancel') : (
            <>
              <Plus className="h-4 w-4 me-2" />
              {t('إنشاء كوبون جديد', 'Create New Coupon')}
            </>
          )}
        </Button>
      </motion.div>

      {/* Add New Coupon Section */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
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
                      <Label className="font-bold">{t('رمز الكوبون (الرمز السري) *', 'Coupon Code *')}</Label>
                      <Input 
                        placeholder="e.g. SUMMER26" 
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        required
                        className="bg-muted/30 border-white/10 rounded-xl uppercase font-mono tracking-widest text-center"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">{t('نوع الخصم *', 'Discount Type *')}</Label>
                      <div className="flex bg-muted/40 rounded-xl p-1 border border-white/5">
                        <button
                          type="button"
                          onClick={() => setType('percentage')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            type === 'percentage' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'
                          }`}
                        >
                          <Percent className="h-3 w-3 inline me-1" />
                          {t('نسبة مئوية', 'Percentage')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setType('flat')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            type === 'flat' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'
                          }`}
                        >
                          <DollarSign className="h-3 w-3 inline me-1" />
                          {t('قيمة ثابتة', 'Flat Amount')}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">{t('قيمة الخصم *', 'Discount Value *')}</Label>
                      <Input 
                        type="number"
                        placeholder={type === 'percentage' ? '15%' : '500 DZD'}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        required
                        className="bg-muted/30 border-white/10 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('الحد الأدنى للشراء (د.ج / ريال)', 'Min Order Value')}</Label>
                      <Input 
                        type="number"
                        placeholder="e.g. 5000"
                        value={minOrder}
                        onChange={(e) => setMinOrder(e.target.value)}
                        className="bg-muted/30 border-white/10 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('الحد الأقصى لمرات الاستخدام', 'Usage Limit')}</Label>
                      <Input 
                        type="number"
                        placeholder="e.g. 100"
                        value={usageLimit}
                        onChange={(e) => setUsageLimit(e.target.value)}
                        className="bg-muted/30 border-white/10 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('تاريخ انتهاء الصلاحية', 'Expiration Date')}</Label>
                      <Input 
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="bg-muted/30 border-white/10 rounded-xl text-start"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl font-bold bg-primary text-primary-foreground w-full sm:w-auto shadow-md"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
                      {t('إنشاء وتفعيل الكوبون', 'Save and Activate')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons List Section */}
      <motion.div variants={FADE_UP}>
        {isLoading ? (
          <div className="h-[250px] w-full flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">{t('جاري تحميل سجل الكوبونات والخصومات...', 'Loading coupons registry...')}</p>
          </div>
        ) : coupons.length === 0 ? (
          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl h-[250px] flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Tag className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-bold text-foreground">{t('لا توجد عروض أو كوبونات حالياً', 'No active coupons')}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {t('لم تقم بإنشاء أي أكواد خصم لمتجرك حتى الآن. انقر على الزر بالأعلى لإضافة أول خصم لعملائك!', 'No discounts configured yet. Click above to create your first coupon campaign!')}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
              const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
              const isInactive = !coupon.isActive || isExpired || isLimitReached;

              return (
                <motion.div
                  key={coupon.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`border-white/10 shadow-xl rounded-3xl overflow-hidden relative backdrop-blur-xl ${
                    isInactive ? 'bg-slate-900/30 opacity-70' : 'bg-background/60 border-primary/20'
                  }`}>
                    {/* Visual dashed coupon separator */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-0.5 pointer-events-none">
                      <div className="size-4 bg-sidebar rounded-full -ms-2.5 border border-white/10" />
                      <div className="border-t-2 border-dashed border-white/5 w-full mx-1.5 self-center" />
                      <div className="size-4 bg-sidebar rounded-full -me-2.5 border border-white/10" />
                    </div>

                    {/* Top half */}
                    <div className="p-5 pb-8 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="font-mono font-bold text-lg tracking-widest text-foreground uppercase">{coupon.code}</span>
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-bold ${
                          isExpired ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          isLimitReached ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          coupon.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          {isExpired ? t('منتهي الصلاحية', 'Expired') :
                           isLimitReached ? t('نفذ استخدامها', 'Limit Reached') :
                           coupon.isActive ? t('نشط', 'Active') :
                           t('مسودة', 'Draft')}
                        </Badge>
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-primary">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} DZD`}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">{t('تخفيض للعملاء', 'Discount')}</span>
                      </div>
                    </div>

                    {/* Bottom half */}
                    <div className="p-5 pt-8 flex items-center justify-between text-xs text-muted-foreground border-t border-white/5">
                      <div className="space-y-1">
                        {coupon.minOrder && (
                          <p className="font-medium text-[10px]">
                            {t('الحد الأدنى للطلب: ', 'Min Order: ')}
                            <span className="text-foreground font-bold">{coupon.minOrder} DZD</span>
                          </p>
                        )}
                        {coupon.expiresAt && (
                          <p className="flex items-center gap-1 text-[10px]">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {t('ينتهي في: ', 'Expires: ')}
                            <span className="text-foreground font-semibold">{new Date(coupon.expiresAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                          </p>
                        )}
                        <p className="text-[10px]">
                          {t('مرات الاستخدام: ', 'Usage: ')}
                          <span className="text-foreground font-bold">{coupon.usedCount}</span>
                          {coupon.usageLimit && <span className="text-muted-foreground"> / {coupon.usageLimit}</span>}
                        </p>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(coupon.id)}
                        className="size-8 rounded-full text-destructive hover:bg-destructive/10 shrink-0 self-end"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
