'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Save, Settings2, ShieldCheck, Image, ListPlus, Tag, Layers, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductSettingsPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [maxBullets, setMaxBullets] = useState('10');
  const [maxImages, setMaxImages] = useState('8');
  const [enableBrand, setEnableBrand] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [enableVolumeDiscounts, setEnableVolumeDiscounts] = useState(true);
  const [enableUrgencyTriggers, setEnableUrgencyTriggers] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        if (s.max_bullet_points) setMaxBullets(s.max_bullet_points);
        if (s.max_product_images) setMaxImages(s.max_product_images);
        if (s.enable_brand_system !== undefined) setEnableBrand(s.enable_brand_system !== 'false');
        if (s.require_admin_approval_for_products !== undefined) setRequireApproval(s.require_admin_approval_for_products === 'true');
        if (s.enable_volume_discounts !== undefined) setEnableVolumeDiscounts(s.enable_volume_discounts !== 'false');
        if (s.enable_urgency_triggers !== undefined) setEnableUrgencyTriggers(s.enable_urgency_triggers !== 'false');
      }
    } catch (e) {
      toast.error('Failed to load settings');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        settings: {
          max_bullet_points: maxBullets,
          max_product_images: maxImages,
          enable_brand_system: String(enableBrand),
          require_admin_approval_for_products: String(requireApproval),
          enable_volume_discounts: String(enableVolumeDiscounts),
          enable_urgency_triggers: String(enableUrgencyTriggers),
        },
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t('common.save') || 'Saved successfully');
      } else {
        toast.error(data.error || 'Save failed');
      }
    } catch (e) {
      toast.error(String(e));
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        جار تحميل إعدادات المنتجات...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="size-6 text-primary" />
            إعدادات وخصائص المنتجات العامة
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            التحكم الكامل في حدود وقواعد نموذج المنتجات وشروط النشر والموافقات
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
        >
          <Save className="size-4" />
          {isSaving ? 'جار الحفظ...' : t('common.save')}
        </button>
      </div>

      {/* Settings Grid */}
      <div className="space-y-6">

        {/* 1. Approval Rules */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">شروط النشر والموافقة الإدارية</h2>
              <p className="text-xs text-muted-foreground">اشتراط مراجعة الأدمن قبل ظهور المنتج للمشترين</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="mt-1 size-4 rounded accent-primary"
              />
              <div>
                <span className="font-bold text-sm text-foreground">اشتراط موافقة الأدمن المسبقة على المنتجات قبل نشرها</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  عند التفعيل، المنتجات المنشأة حديثاً أو المعدلة ستدخل حالة (بانتظار موافقة الأدمن) وتصلك في قائمة المراجعة أولاً قبل نزولها في المتجر.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 2. Limits and Capacities */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
              <ListPlus className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">حدود وقدرات المنتجات لكل تاجر</h2>
              <p className="text-xs text-muted-foreground">تحديد السعة المسموح بها للمميزات والصور المرفوعة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <ListPlus className="size-4 text-primary" />
                الحد الأقصى لمميزات المنتج (Bullet Points)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxBullets}
                onChange={(e) => setMaxBullets(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
              />
              <p className="text-[11px] text-muted-foreground">أقصى عدد نقاط وصفيّة يمكن للبائع إضافتها للمنتج الواحد.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Image className="size-4 text-primary" />
                الحد الأقصى لعدد صور المنتج المرفوعة
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxImages}
                onChange={(e) => setMaxImages(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
              />
              <p className="text-[11px] text-muted-foreground">أقصى عدد صور يسمح للبائع برفعها بالمنتج الواحد.</p>
            </div>
          </div>
        </div>

        {/* 3. Feature Switches & Modules */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Zap className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">وحدات ومميزات المنتج المتاحة للبائع</h2>
              <p className="text-xs text-muted-foreground">تفعيل أو إخفاء خصائص وموديولات إضافية في نموذج التاجر</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableBrand}
                onChange={(e) => setEnableBrand(e.target.checked)}
                className="mt-1 size-4 rounded accent-primary"
              />
              <div>
                <span className="font-bold text-sm text-foreground">تفعيل نظام العلامات التجارية / الماركات (Brand System)</span>
                <p className="text-xs text-muted-foreground">إظهار حقل اختيار الماركة الرسمية للبائع عند إضافة المنتجات.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableVolumeDiscounts}
                onChange={(e) => setEnableVolumeDiscounts(e.target.checked)}
                className="mt-1 size-4 rounded accent-primary"
              />
              <div>
                <span className="font-bold text-sm text-foreground">تفعيل نظام خصومات الكمية بالجملة (Tiered Pricing)</span>
                <p className="text-xs text-muted-foreground">إتاحة تبويب إدخال خصومات الشراء بالكمية للبائع (مثال: اشتر 3 واحصل على خصم 10%).</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableUrgencyTriggers}
                onChange={(e) => setEnableUrgencyTriggers(e.target.checked)}
                className="mt-1 size-4 rounded accent-primary"
              />
              <div>
                <span className="font-bold text-sm text-foreground">تفعيل محفّزات الاستعجال والشراء المباشر (Urgency Triggers)</span>
                <p className="text-xs text-muted-foreground">إتاحة خيارات العد التنازلي وتنبيهات المخزون المحفزة للشراء بصفحة المنتج.</p>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
