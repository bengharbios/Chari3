'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Loader2, Save, ArrowRight, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const { isAdminAuthenticated, adminUser } = useAdminAuthStore();
  const { locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  
  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const [isMounted, setIsMounted] = useState(false);
  
  const [settings, setSettings] = useState({
    upload_max_size_mb: '5',
    upload_recommended_width: '800',
    upload_recommended_height: '800',
    enable_brand_system: 'true',
    enable_urgency_triggers: 'true',
    enable_delivery_calculator: 'true',
    enable_volume_discounts: 'true',
    enable_product_qa: 'true',
    seller_dashboard_template: 'default',
    google_maps_api_key: '',
    // Registration toggles
    enable_seller_registration: 'true',
    enable_buyer_registration: 'true',
    enable_supplier_registration: 'true',
    enable_logistics_registration: 'true',
    enable_store_registration: 'true',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      const currentPath = window.location.pathname.replace('/settings', '');
      window.location.href = `${currentPath}/login`;
    }
  }, [isMounted, isAdminAuthenticated]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [res, platRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/platform-settings')
        ]);
        const data = await res.json();
        const platData = await platRes.json();

        if (data.success && data.settings) {
          setSettings((prev) => ({
            ...prev,
            upload_max_size_mb: data.settings.upload_max_size_mb || '5',
            upload_recommended_width: data.settings.upload_recommended_width || '800',
            upload_recommended_height: data.settings.upload_recommended_height || '800',
            enable_brand_system: data.settings.enable_brand_system !== undefined
              ? String(data.settings.enable_brand_system)
              : 'true',
            enable_urgency_triggers: data.settings.enable_urgency_triggers !== undefined
              ? String(data.settings.enable_urgency_triggers)
              : 'true',
            enable_delivery_calculator: data.settings.enable_delivery_calculator !== undefined
              ? String(data.settings.enable_delivery_calculator)
              : 'true',
            enable_volume_discounts: data.settings.enable_volume_discounts !== undefined
              ? String(data.settings.enable_volume_discounts)
              : 'true',
            enable_product_qa: data.settings.enable_product_qa !== undefined
              ? String(data.settings.enable_product_qa)
              : 'true',
            seller_dashboard_template: data.settings.seller_dashboard_template || 'default',
            google_maps_api_key: data.settings.google_maps_api_key || '',
            enable_seller_registration: data.settings.enable_seller_registration !== undefined ? String(data.settings.enable_seller_registration) : 'true',
            enable_buyer_registration: data.settings.enable_buyer_registration !== undefined ? String(data.settings.enable_buyer_registration) : 'true',
            enable_supplier_registration: data.settings.enable_supplier_registration !== undefined ? String(data.settings.enable_supplier_registration) : 'true',
            enable_logistics_registration: data.settings.enable_logistics_registration !== undefined ? String(data.settings.enable_logistics_registration) : 'true',
            enable_store_registration: data.settings.enable_store_registration !== undefined ? String(data.settings.enable_store_registration) : 'true',
          }));
        }

        if (platData.success && platData.data) {
          setSettings((prev) => ({
            ...prev,
            upgrade_price: String(platData.data.price || 0),
            is_upgrade_free_promo: String(platData.data.isFreePromo)
          }));
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (isMounted && isAdminAuthenticated) {
      fetchSettings();
    }
  }, [isMounted, isAdminAuthenticated]);

  if (!isMounted || !isAdminAuthenticated) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save global UI settings
      const p1 = fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          adminId: adminUser?.id,
        }),
      }).then(res => res.json());

      // 2. Save Business Upgrade settings (PlatformSettings & BillingAddon)
      const p2 = fetch('/api/admin/platform-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isUpgradeFreePromo: settings.is_upgrade_free_promo === 'true',
        }),
      }).then(res => res.json());

      const p3 = fetch('/api/admin/billing-addons/business_upgrade', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(settings.upgrade_price || 0),
        }),
      }).then(res => res.json());

      const [data1, data2, data3] = await Promise.all([p1, p2, p3]);

      if (data1.success && data2.success && data3.success) {
        toast.success(locale === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
      } else {
        throw new Error(data1.error || data2.error || data3.error || 'Unknown error');
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center gap-4 mb-6">
        <Link href={getAdminPath('')}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-brand" />
            {t('إعدادات النظام العامة', 'General System Settings')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('تحكم في الضوابط والقيود التقنية للمنصة من هنا', 'Control platform technical constraints and rules here')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('ضوابط رفع الصور والملفات', 'Media Upload Constraints')}</CardTitle>
              <CardDescription>
                {t('حدد الحجم الأقصى المسموح به والمقاسات الموصى بها ليراها التجار عند رفع الصور.', 'Set max allowed file size and recommended dimensions to be displayed to merchants.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload_max_size_mb">{t('الحد الأقصى لحجم الصورة (بالميجابايت)', 'Max Image Size (MB)')}</Label>
                <Input
                  id="upload_max_size_mb"
                  name="upload_max_size_mb"
                  type="number"
                  value={settings.upload_max_size_mb}
                  onChange={handleChange}
                  className="font-mono bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upload_recommended_width">{t('العرض الموصى به (px)', 'Recommended Width (px)')}</Label>
                  <Input
                    id="upload_recommended_width"
                    name="upload_recommended_width"
                    type="number"
                    value={settings.upload_recommended_width}
                    onChange={handleChange}
                    className="font-mono bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload_recommended_height">{t('الطول الموصى به (px)', 'Recommended Height (px)')}</Label>
                  <Input
                    id="upload_recommended_height"
                    name="upload_recommended_height"
                    type="number"
                    value={settings.upload_recommended_height}
                    onChange={handleChange}
                    className="font-mono bg-background"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full mt-4 font-bold gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('حفظ التعديلات', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('إعدادات ميزات المنصة', 'Platform Feature Toggles')}</CardTitle>
              <CardDescription>
                {t('قم بتفعيل أو تعطيل الأنظمة والوحدات الاختيارية في المنصة.', 'Enable or disable optional platform modules.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="enable_brand_system">{t('نظام الماركات والعلامات التجارية', 'Brands & Trademarks System')}</Label>
                <select
                  id="enable_brand_system"
                  name="enable_brand_system"
                  value={settings.enable_brand_system}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_brand_system: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مفعّل (يُعرض حقل الماركة في صفحة المنتج)', 'Enabled (Show brand selection on products)')}</option>
                  <option value="false">{t('معطّل (إخفاء نظام الماركات بالكامل)', 'Disabled (Hide brand system completely)')}</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('عند التعطيل، سيتم إخفاء حقل الماركة تماماً من لوحة تحكم التجار ولن يظهر للمشترين.', 'When disabled, the Brand selector will be hidden from the merchant dashboard and catalog.')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enable_urgency_triggers">{t('محفزات الاستعجال والإثبات الاجتماعي', 'Urgency & Social Proof Triggers')}</Label>
                <select
                  id="enable_urgency_triggers"
                  name="enable_urgency_triggers"
                  value={settings.enable_urgency_triggers}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_urgency_triggers: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مفعّل (إظهار المشاهدات الفورية ومبيعات اليوم)', 'Enabled (Show live views and daily sales)')}</option>
                  <option value="false">{t('معطّل (إخفاء محفزات الاستعجال)', 'Disabled (Hide urgency triggers)')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enable_delivery_calculator">{t('حاسبة التوصيل المتوقع', 'Estimated Delivery Calculator')}</Label>
                <select
                  id="enable_delivery_calculator"
                  name="enable_delivery_calculator"
                  value={settings.enable_delivery_calculator}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_delivery_calculator: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مفعّل (عرض كرت موعد الوصول المتوقع للمشتري)', 'Enabled (Show estimated delivery date to buyers)')}</option>
                  <option value="false">{t('معطّل (إخفاء حاسبة التوصيل)', 'Disabled (Hide delivery calculator)')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enable_volume_discounts">{t('نظام خصم الكميات وشراء الجملة', 'Volume Discounts & Wholesale System')}</Label>
                <select
                  id="enable_volume_discounts"
                  name="enable_volume_discounts"
                  value={settings.enable_volume_discounts}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_volume_discounts: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مفعّل (إتاحة جدول خصومات الكمية في المنتجات)', 'Enabled (Allow quantity-based discount tables)')}</option>
                  <option value="false">{t('معطّل (إيقاف نظام خصم الكمية)', 'Disabled (Disable volume discount system)')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enable_product_qa">{t('نظام الأسئلة والأجوبة (Q&A)', 'Customer Q&A System')}</Label>
                <select
                  id="enable_product_qa"
                  name="enable_product_qa"
                  value={settings.enable_product_qa}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_product_qa: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مفعّل (عرض تبويب الأسئلة والأجوبة بصفحة المنتج)', 'Enabled (Show customer Q&A tab on product page)')}</option>
                  <option value="false">{t('معطّل (إخفاء نظام الأسئلة)', 'Disabled (Hide Q&A system)')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seller_dashboard_template">{t('قالب لوحة تحكم التجار', 'Seller Dashboard Template')}</Label>
                <select
                  id="seller_dashboard_template"
                  name="seller_dashboard_template"
                  value={settings.seller_dashboard_template}
                  onChange={(e) => setSettings(prev => ({ ...prev, seller_dashboard_template: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="default">{t('الافتراضي (ChariDay UI)', 'Default (ChariDay UI)')}</option>
                  <option value="gentelella">{t('Gentelella (النسخة الكلاسيكية)', 'Gentelella (Classic Version)')}</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('اختر التصميم الذي سيظهر للتجار في لوحات التحكم الخاصة بهم.', 'Select the design template for the seller dashboards.')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_maps_api_key">{t('مفتاح Google Maps API', 'Google Maps API Key')}</Label>
                <Input
                  id="google_maps_api_key"
                  name="google_maps_api_key"
                  type="text"
                  value={settings.google_maps_api_key}
                  onChange={handleChange}
                  placeholder={t('أدخل مفتاح API هنا...', 'Enter API key here...')}
                  className="bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('مطلوب لتشغيل الخرائط في المتجر وتحديد مواقع المشترين.', 'Required to enable maps and location selection for buyers.')}
                </p>
              </div>
              
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full mt-10 font-bold gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('حفظ التعديلات', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>

          {/* New Card for Roles & Registration */}
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('الصلاحيات وإعدادات التسجيل', 'Roles & Registration Settings')}</CardTitle>
              <CardDescription>
                {t('التحكم في أنواع الحسابات المسموح بتسجيلها في المنصة.', 'Control which account types are allowed to register on the platform.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="enable_seller_registration">{t('تسجيل الباعة المستقلين (Freelancers)', 'Independent Seller Registration')}</Label>
                <select
                  id="enable_seller_registration"
                  name="enable_seller_registration"
                  value={settings.enable_seller_registration}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_seller_registration: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مسموح', 'Allowed')}</option>
                  <option value="false">{t('موقوف مؤقتاً', 'Suspended')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="enable_store_registration">{t('تسجيل المتاجر والشركات (Stores)', 'Store / Corporate Registration')}</Label>
                <select
                  id="enable_store_registration"
                  name="enable_store_registration"
                  value={settings.enable_store_registration}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_store_registration: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مسموح', 'Allowed')}</option>
                  <option value="false">{t('موقوف مؤقتاً', 'Suspended')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="enable_supplier_registration">{t('تسجيل الموردين (Suppliers)', 'Supplier Registration')}</Label>
                <select
                  id="enable_supplier_registration"
                  name="enable_supplier_registration"
                  value={settings.enable_supplier_registration}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_supplier_registration: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مسموح', 'Allowed')}</option>
                  <option value="false">{t('موقوف مؤقتاً', 'Suspended')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="enable_logistics_registration">{t('تسجيل مناديب الشحن (Logistics)', 'Logistics Registration')}</Label>
                <select
                  id="enable_logistics_registration"
                  name="enable_logistics_registration"
                  value={settings.enable_logistics_registration}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_logistics_registration: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مسموح', 'Allowed')}</option>
                  <option value="false">{t('موقوف مؤقتاً', 'Suspended')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="enable_buyer_registration">{t('تسجيل المشترين (Buyers)', 'Buyer Registration')}</Label>
                <select
                  id="enable_buyer_registration"
                  name="enable_buyer_registration"
                  value={settings.enable_buyer_registration}
                  onChange={(e) => setSettings(prev => ({ ...prev, enable_buyer_registration: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('مسموح', 'Allowed')}</option>
                  <option value="false">{t('موقوف مؤقتاً', 'Suspended')}</option>
                </select>
              </div>
              
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full mt-10 font-bold gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('حفظ التعديلات', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>

          {/* New Card for Business Upgrade Settings */}
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('إعدادات ترقية الأعمال', 'Business Upgrade Settings')}</CardTitle>
              <CardDescription>
                {t('التحكم في سعر ترقية التاجر الفردي إلى متجر أعمال وإدارة العروض المجانية.', 'Control the pricing for upgrading individual sellers to business stores and manage free promos.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upgrade_price">{t('سعر الترقية (DZD)', 'Upgrade Price (DZD)')}</Label>
                <Input
                  id="upgrade_price"
                  name="upgrade_price"
                  type="number"
                  value={settings.upgrade_price || '0'}
                  onChange={handleChange}
                  className="font-mono bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="is_upgrade_free_promo">{t('حالة العرض (ترقية مجانية مؤقتاً)', 'Promo Status (Free Upgrade Temporary)')}</Label>
                <select
                  id="is_upgrade_free_promo"
                  name="is_upgrade_free_promo"
                  value={settings.is_upgrade_free_promo || 'true'}
                  onChange={(e) => setSettings(prev => ({ ...prev, is_upgrade_free_promo: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm font-bold"
                >
                  <option value="true">{t('تفعيل العرض المجاني', 'Enable Free Promo')}</option>
                  <option value="false">{t('تعطيل (تطبيق السعر الأساسي)', 'Disable (Apply Base Price)')}</option>
                </select>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full mt-10 font-bold gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('حفظ التعديلات', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-surface md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('إدارة وتصميم الصفحة الرئيسية', 'Homepage Manager & Designer')}</CardTitle>
              <CardDescription>
                {t('تحكم في ترتيب أقسام الصفحة الرئيسية، وثبّت منتجات أو متاجر معينة، واضبط العداد التنازلي الترويجي.', 'Manage section order, pin items, and configure countdown timer deals.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={getAdminPath('settings/homepage')}>
                <Button className="w-full font-bold gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  {t('الدخول لمدير الصفحة الرئيسية', 'Open Homepage Manager')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
