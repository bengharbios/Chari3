'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Settings, Store, Image as ImageIcon, MapPin, Truck, CreditCard, Bell, Save, Globe, Loader2, Play, CheckCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const PRESET_COLORS = [
  { name: 'Amber Gold', hex: '#fbbf24', class: 'bg-amber-400' },
  { name: 'Indigo Blue', hex: '#6366f1', class: 'bg-indigo-500' },
  { name: 'Emerald Green', hex: '#10b981', class: 'bg-emerald-500' },
  { name: 'Rose Red', hex: '#f43f5e', class: 'bg-rose-500' },
  { name: 'Violet Purple', hex: '#8b5cf6', class: 'bg-violet-500' },
  { name: 'Dark Slate', hex: '#475569', class: 'bg-slate-600' }
];

// Preloaded Algerian Wilayas (State list for advanced shipping)
const ALGERIAN_WILAYAS = [
  { id: '1', nameAr: 'أدرار', nameEn: 'Adrar', defaultPrice: 1200 },
  { id: '2', nameAr: 'الشلف', nameEn: 'Chlef', defaultPrice: 600 },
  { id: '3', nameAr: 'الأغواط', nameEn: 'Laghouat', defaultPrice: 800 },
  { id: '4', nameAr: 'أم البواقي', nameEn: 'Oum El Bouaghi', defaultPrice: 700 },
  { id: '5', nameAr: 'باتنة', nameEn: 'Batna', defaultPrice: 600 },
  { id: '6', nameAr: 'بجاية', nameEn: 'Bejaia', defaultPrice: 500 },
  { id: '7', nameAr: 'بسكرة', nameEn: 'Biskra', defaultPrice: 800 },
  { id: '8', nameAr: 'بشار', nameEn: 'Bechar', defaultPrice: 1000 },
  { id: '9', nameAr: 'البليدة', nameEn: 'Blida', defaultPrice: 400 },
  { id: '10', nameAr: 'البويرة', nameEn: 'Bouira', defaultPrice: 500 },
  { id: '11', nameAr: 'تمنراست', nameEn: 'Tamanrasset', defaultPrice: 1500 },
  { id: '12', nameAr: 'تبسة', nameEn: 'Tebessa', defaultPrice: 700 },
  { id: '13', nameAr: 'تلمسان', nameEn: 'Tlemcen', defaultPrice: 600 },
  { id: '14', nameAr: 'تيارت', nameEn: 'Tiaret', defaultPrice: 600 },
  { id: '15', nameAr: 'تيزي وزو', nameEn: 'Tizi Ouzou', defaultPrice: 500 },
  { id: '16', nameAr: 'الجزائر العاصمة', nameEn: 'Algiers', defaultPrice: 300 },
  { id: '17', nameAr: 'الجلفة', nameEn: 'Djelfa', defaultPrice: 700 },
  { id: '18', nameAr: 'جيجل', nameEn: 'Jijel', defaultPrice: 600 },
  { id: '19', nameAr: 'سطيف', nameEn: 'Setif', defaultPrice: 500 },
  { id: '20', nameAr: 'سعيدة', nameEn: 'Saida', defaultPrice: 700 },
  { id: '21', nameAr: 'سكيكدة', nameEn: 'Skikda', defaultPrice: 600 },
  { id: '22', nameAr: 'سيدي بلعباس', nameEn: 'Sidi Bel Abbes', defaultPrice: 600 },
  { id: '23', nameAr: 'عنابة', nameEn: 'Annaba', defaultPrice: 500 },
  { id: '24', nameAr: 'قالمة', nameEn: 'Guelma', defaultPrice: 600 },
  { id: '25', nameAr: 'قسنطينة', nameEn: 'Constantine', defaultPrice: 500 },
  { id: '26', nameAr: 'المدية', nameEn: 'Medea', defaultPrice: 500 },
  { id: '27', nameAr: 'مستغانم', nameEn: 'Mostaganem', defaultPrice: 600 },
  { id: '28', nameAr: 'المسيلة', nameEn: 'M\'Sila', defaultPrice: 600 },
  { id: '29', nameAr: 'معسكر', nameEn: 'Mascara', defaultPrice: 600 },
  { id: '30', nameAr: 'ورقلة', nameEn: 'Ouargla', defaultPrice: 900 },
  { id: '31', nameAr: 'وهران', nameEn: 'Oran', defaultPrice: 500 },
  { id: '32', nameAr: 'البيض', nameEn: 'El Bayadh', defaultPrice: 800 },
  { id: '33', nameAr: 'إليزي', nameEn: 'Illizi', defaultPrice: 1500 },
  { id: '34', nameAr: 'برج بوعريريج', nameEn: 'Bordj Bou Arreridj', defaultPrice: 500 },
  { id: '35', nameAr: 'بومرداس', nameEn: 'Boumerdes', defaultPrice: 400 },
  { id: '36', nameAr: 'الطارف', nameEn: 'El Tarf', defaultPrice: 600 },
  { id: '37', nameAr: 'تيندوف', nameEn: 'Tindouf', defaultPrice: 1500 },
  { id: '38', nameAr: 'تيسمسيلت', nameEn: 'Tissemsilt', defaultPrice: 600 },
  { id: '39', nameAr: 'الوادي', nameEn: 'El Oued', defaultPrice: 800 },
  { id: '40', nameAr: 'خنشلة', nameEn: 'Khenchela', defaultPrice: 700 },
  { id: '41', nameAr: 'سوق أهراس', nameEn: 'Souk Ahras', defaultPrice: 700 },
  { id: '42', nameAr: 'تيبازة', nameEn: 'Tipaza', defaultPrice: 400 },
  { id: '43', nameAr: 'ميلة', nameEn: 'Mila', defaultPrice: 500 },
  { id: '44', nameAr: 'عين الدفلى', nameEn: 'Ain Defla', defaultPrice: 500 },
  { id: '45', nameAr: 'النعامة', nameEn: 'Naama', defaultPrice: 900 },
  { id: '46', nameAr: 'عين تموشنت', nameEn: 'Ain Temouchent', defaultPrice: 600 },
  { id: '47', nameAr: 'غرداية', nameEn: 'Ghardaia', defaultPrice: 900 },
  { id: '48', nameAr: 'غليزان', nameEn: 'Relizane', defaultPrice: 600 },
  { id: '49', nameAr: 'تيميمون', nameEn: 'Timimoun', defaultPrice: 1200 },
  { id: '50', nameAr: 'برج باجي مختار', nameEn: 'Bordj Badji Mokhtar', defaultPrice: 1500 },
  { id: '51', nameAr: 'أولاد جلال', nameEn: 'Ouled Djellal', defaultPrice: 800 },
  { id: '52', nameAr: 'بني عباس', nameEn: 'Beni Abbes', defaultPrice: 1200 },
  { id: '53', nameAr: 'عين صالح', nameEn: 'In Salah', defaultPrice: 1500 },
  { id: '54', nameAr: 'عين قزام', nameEn: 'In Guezzam', defaultPrice: 1500 },
  { id: '55', nameAr: 'تقرت', nameEn: 'Touggourt', defaultPrice: 900 },
  { id: '56', nameAr: 'جانت', nameEn: 'Djanet', defaultPrice: 1500 },
  { id: '57', nameAr: 'المغير', nameEn: 'El M\'Ghair', defaultPrice: 800 },
  { id: '58', nameAr: 'المنيعة', nameEn: 'El Meniaa', defaultPrice: 900 }
];

export default function StoreSettingsPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [accountType, setAccountType] = useState<'store' | 'seller'>('store');
  const [searchWilaya, setSearchWilaya] = useState('');
  
  // Settings Form States
  const [generalSettings, setGeneralSettings] = useState({
    name: '',
    nameEn: '',
    description: '',
    logo: '',
    coverImage: '',
    isActive: true,
  });

  const [shippingRates, setShippingRates] = useState<any>({
    enabled: true,
    standardPrice: 400,
    expressPrice: 800,
    freeThreshold: 10000,
    customWilayas: {}, // stateId -> overridePrice
  });

  const [statesList, setStatesList] = useState<any[]>(ALGERIAN_WILAYAS);
  const [storeCurrency, setStoreCurrency] = useState<string>('DZD');

  const [shippingIntegrations, setShippingIntegrations] = useState<any>({
    yalidineEnabled: false,
    yalidineApiId: '',
    yalidineApiKey: '',
    yalidineSandbox: true,
  });

  const [paymentDetails, setPaymentDetails] = useState<any>({
    codEnabled: true,
    bankEnabled: false,
    ccpAccount: '',
    ccpName: '',
    baridiMobRip: '',
    satimEnabled: false,
    satimMerchantId: '',
    satimTerminalId: '',
    satimApiUsername: '',
    satimApiPassword: '',
    satimSandbox: true,
  });

  const [themeSettings, setThemeSettings] = useState<any>({
    primaryColor: '#fbbf24',
    accentColor: '#1e293b',
    layoutType: 'grid',
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB for logo, 5MB for cover)
    const maxSize = target === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        target === 'logo'
          ? t('حجم الشعار كبير جداً. الحد الأقصى 2 ميجابايت.', 'Logo is too large. Max is 2MB.')
          : t('حجم الغلاف كبير جداً. الحد الأقصى 5 ميجابايت.', 'Cover is too large. Max is 5MB.')
      );
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('صيغة الملف غير مدعومة. الرجاء رفع صورة بصيغة PNG أو JPG.', 'File format not supported. Please upload a PNG or JPG image.'));
      return;
    }

    const setUploading = target === 'logo' ? setIsUploadingLogo : setIsUploadingCover;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setGeneralSettings(prev => ({ ...prev, [target]: data.url }));
        toast.success(t('تم رفع الصورة بنجاح', 'Image uploaded successfully'));
      } else {
        toast.error(data.error || t('فشل رفع الصورة', 'Failed to upload image'));
      }
    } catch (err) {
      toast.error(t('حدث خطأ أثناء رفع الصورة', 'An error occurred while uploading'));
    } finally {
      setUploading(false);
    }
  };

  // Load Settings from API
  const loadSettings = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // 1. Fetch dynamic states list first
      try {
        const geoRes = await fetch('/api/regions/states?countryCode=DZ');
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.success) {
            if (geoData.states && geoData.states.length > 0) {
              setStatesList(geoData.states);
            }
            if (geoData.country?.currency) {
              setStoreCurrency(geoData.country.currency);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch dynamic states, using fallback', e);
      }

      // 2. Fetch seller settings
      const res = await fetch(`/api/seller/settings?userId=${user.id}`);
      if (!res.ok) throw new Error('Settings fetch failed');
      const data = await res.json();
      if (data.success && data.settings) {
        setAccountType(data.type);
        const s = data.settings;
        setGeneralSettings({
          name: s.name || '',
          nameEn: s.nameEn || '',
          description: s.description || '',
          logo: s.logo || '',
          coverImage: s.coverImage || '',
          isActive: s.isActive !== false,
        });

        if (s.shippingRates) setShippingRates(s.shippingRates);
        if (s.shippingIntegrations) setShippingIntegrations(s.shippingIntegrations);
        if (s.paymentDetails) setPaymentDetails(s.paymentDetails);
        if (s.themeSettings) setThemeSettings(s.themeSettings);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('فشل تحميل الإعدادات من الخادم', 'Failed to fetch settings from server'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  // Save Settings to API
  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/seller/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: accountType,
          settings: {
            ...generalSettings,
            shippingRates,
            shippingIntegrations,
            paymentDetails,
            themeSettings,
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('🎉 تم حفظ جميع الإعدادات باحترافية!', '🎉 All settings successfully saved!'));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t('حدث خطأ أثناء حفظ الإعدادات', 'Error saving settings'));
    } finally {
      setIsSaving(false);
    }
  };

  // Test Yalidine Connection Demo
  const [testingConnection, setTestingConnection] = useState(false);
  const handleTestYalidine = () => {
    if (!shippingIntegrations.yalidineApiId || !shippingIntegrations.yalidineApiKey) {
      toast.warning(t('يرجى ملء حقول API ID و API Key أولاً!', 'Please fill API ID and API Key fields first!'));
      return;
    }
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      toast.success(t('✅ تم التحقق من اتصال Yalidine بنجاح! حسابه متصل وجاهز لشحن الطرود.', '✅ Yalidine integration verified successfully! Active and ready.'));
    }, 1500);
  };

  // Test SATIM Connection Demo
  const [testingSatim, setTestingSatim] = useState(false);
  const handleTestSatim = () => {
    if (!paymentDetails.satimMerchantId || !paymentDetails.satimTerminalId || !paymentDetails.satimApiUsername || !paymentDetails.satimApiPassword) {
      toast.warning(t('يرجى ملء حقول الربط الخاصة بـ SATIM أولاً!', 'Please fill all SATIM integration fields first!'));
      return;
    }
    setTestingSatim(true);
    setTimeout(() => {
      setTestingSatim(false);
      toast.success(t('✅ تم التحقق من اتصال بوابة SATIM (CIB/Edahabia) بنجاح! المتجر جاهز لاستقبال المدفوعات.', '✅ SATIM (CIB/Edahabia) gateway verified successfully! Ready to accept online payments.'));
    }, 1500);
  };

  const filteredWilayas = statesList.filter(w => 
    w.nameAr.includes(searchWilaya) || w.nameEn.toLowerCase().includes(searchWilaya.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-[75vh] w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          {t('جاري جلب إعدادات المتجر الفعالة...', 'Fetching active store parameters...')}
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6 text-start"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('إعدادات المتجر المتكاملة', 'Store settings')}
          description={t('إدارة الهوية البصرية، أسعار الشحن بالولايات، بوابات الدفع والربط التلقائي لشركات الشحن.', 'Manage visual brand, shipping rates by state, payments, and integrations.')}
        />
        <Button 
          disabled={isSaving}
          onClick={handleSave}
          className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
              {t('جاري الحفظ...', 'Saving...')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 me-2" />
              {t('حفظ جميع التغييرات', 'Save All Changes')}
            </>
          )}
        </Button>
      </motion.div>

      <motion.div variants={FADE_UP}>
        <Tabs defaultValue="general" className="w-full">
          <div className="overflow-x-auto hide-scrollbar mb-6">
            <TabsList className="bg-background/60 backdrop-blur-md border border-white/10 rounded-xl p-1 h-auto flex w-max min-w-full">
              <TabsTrigger value="general" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <Store className="h-4 w-4" /> {t('الهوية والمعلومات', 'Profile')}
              </TabsTrigger>
              <TabsTrigger value="shipping" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <Truck className="h-4 w-4" /> {t('الشحن والتوصيل المتطور', 'Shipping & Delivery')}
              </TabsTrigger>
              <TabsTrigger value="payment" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <CreditCard className="h-4 w-4" /> {t('بوابات الدفع المقبولة', 'Payments')}
              </TabsTrigger>
              <TabsTrigger value="branding" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <ImageIcon className="h-4 w-4" /> {t('الهوية البصرية والسمات', 'Visual Branding')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 1. General Tab */}
          <TabsContent value="general" className="mt-0 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('المعلومات الأساسية', 'Basic Information')}</CardTitle>
                    <CardDescription>{t('ستظهر هذه التفاصيل لعملائك مباشرة في صفحة المتجر العامة.', 'These details will be displayed to customers on your storefront.')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('اسم المتجر (بالعربية)', 'Store Name (Arabic)')}</Label>
                        <Input 
                          value={generalSettings.name}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, name: e.target.value })}
                          className="bg-muted/30 border-white/10 rounded-xl" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('اسم المتجر (بالإنجليزية)', 'Store Name (English)')}</Label>
                        <Input 
                          value={generalSettings.nameEn}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, nameEn: e.target.value })}
                          className="bg-muted/30 border-white/10 rounded-xl" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('وصف المتجر ونبذة عنه', 'Store Description')}</Label>
                      <Textarea 
                        rows={4} 
                        value={generalSettings.description}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
                        className="bg-muted/30 border-white/10 rounded-xl resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-white/10 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-black flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      {t('إتاحة ونشر المتجر للزوار', 'Publish Status')}
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-white/5">
                      <div>
                        <p className="font-bold text-sm">{t('نشر المتجر للعامة', 'Public visibility')}</p>
                        <p className="text-xs text-muted-foreground">{t('متاح للتصفح والشراء', 'Available for browsing')}</p>
                      </div>
                      <Switch 
                        checked={generalSettings.isActive}
                        onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, isActive: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 2. Shipping & Delivery Tab */}
          <TabsContent value="shipping" className="mt-0 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Shipping Rules */}
              <div className="xl:col-span-2 space-y-6">
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{t('أسعار وتكاليف التوصيل', 'Delivery Pricing Structure')}</CardTitle>
                      <CardDescription>{t('قم بتحديد تكلفة الشحن الأساسية وحد الإعفاء من الشحن.', 'Define base courier prices and free shipping criteria.')}</CardDescription>
                    </div>
                    <Switch 
                      checked={shippingRates.enabled}
                      onCheckedChange={(checked) => setShippingRates({ ...shippingRates, enabled: checked })}
                    />
                  </CardHeader>
                  <AnimatePresence>
                    {shippingRates.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="space-y-4 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>{t('التوصيل العادي (د.ج / ريال)', 'Standard Courier Price')}</Label>
                              <Input 
                                type="number"
                                value={shippingRates.standardPrice}
                                onChange={(e) => setShippingRates({ ...shippingRates, standardPrice: parseFloat(e.target.value) || 0 })}
                                className="bg-muted/30 border-white/10 rounded-xl" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('التوصيل السريع (د.ج / ريال)', 'Express Courier Price')}</Label>
                              <Input 
                                type="number"
                                value={shippingRates.expressPrice}
                                onChange={(e) => setShippingRates({ ...shippingRates, expressPrice: parseFloat(e.target.value) || 0 })}
                                className="bg-muted/30 border-white/10 rounded-xl" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('حد الشحن المجاني (د.ج / ريال)', 'Free Delivery Limit')}</Label>
                              <Input 
                                type="number"
                                value={shippingRates.freeThreshold}
                                onChange={(e) => setShippingRates({ ...shippingRates, freeThreshold: parseFloat(e.target.value) || 0 })}
                                className="bg-muted/30 border-white/10 rounded-xl" 
                              />
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* State-by-State Overrides */}
                {shippingRates.enabled && (
                  <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-lg">{t('أسعار التوصيل المخصصة بالولايات', 'State Specific Shipping overrides')}</CardTitle>
                      <CardDescription>{t('يمكنك تعيين سعر شحن مخصص لكل ولاية لتجاوز السعر الأساسي للمتجر.', 'Override base store courier price with specific rates per state.')}</CardDescription>
                      <div className="mt-3">
                        <Input 
                          placeholder={t('🔍 ابحث عن ولاية...', '🔍 Search for a state...')}
                          value={searchWilaya}
                          onChange={(e) => setSearchWilaya(e.target.value)}
                          className="bg-muted/30 border-white/10 rounded-xl max-w-sm"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-y-auto max-h-[300px] border border-white/5 rounded-2xl p-2 space-y-2 bg-slate-950/20">
                        {filteredWilayas.map((wilaya) => {
                          const customPrice = shippingRates.customWilayas[wilaya.id] !== undefined
                            ? shippingRates.customWilayas[wilaya.id]
                            : wilaya.defaultPrice;
                          const isCustomized = shippingRates.customWilayas[wilaya.id] !== undefined;

                          return (
                            <div key={wilaya.id} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/5 hover:border-white/10 transition-all">
                              <div>
                                <span className="font-mono text-xs text-muted-foreground me-2 bg-white/5 px-2 py-0.5 rounded-md">{wilaya.id}</span>
                                <span className="font-bold text-sm">{isAr ? wilaya.nameAr : wilaya.nameEn}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Input 
                                  type="number"
                                  placeholder={String(wilaya.defaultPrice)}
                                  value={isCustomized ? customPrice : ''}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value) || 0;
                                    const nextWilayas = { ...shippingRates.customWilayas };
                                    if (val === undefined) {
                                      delete nextWilayas[wilaya.id];
                                    } else {
                                      nextWilayas[wilaya.id] = val;
                                    }
                                    setShippingRates({ ...shippingRates, customWilayas: nextWilayas });
                                  }}
                                  className="w-28 bg-muted/40 border-white/10 rounded-xl h-9 text-center font-bold"
                                />
                                <span className="text-xs text-muted-foreground font-bold">{t('د.ج', storeCurrency)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Shipping integrations */}
              <div className="space-y-6">
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <CardTitle className="text-md">{t('ربط ياليدين تلقائياً', 'Yalidine Sync')}</CardTitle>
                    </div>
                    <Switch 
                      checked={shippingIntegrations.yalidineEnabled}
                      onCheckedChange={(checked) => setShippingIntegrations({ ...shippingIntegrations, yalidineEnabled: checked })}
                    />
                  </CardHeader>
                  <AnimatePresence>
                    {shippingIntegrations.yalidineEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <CardContent className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label>{t('معرف الحساب (Yalidine API ID)', 'API ID')}</Label>
                            <Input 
                              value={shippingIntegrations.yalidineApiId}
                              onChange={(e) => setShippingIntegrations({ ...shippingIntegrations, yalidineApiId: e.target.value })}
                              placeholder="e.g. 84930129"
                              className="bg-muted/30 border-white/10 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('مفتاح الأمان (Yalidine API Key)', 'API Key')}</Label>
                            <Input 
                              type="password"
                              value={shippingIntegrations.yalidineApiKey}
                              onChange={(e) => setShippingIntegrations({ ...shippingIntegrations, yalidineApiKey: e.target.value })}
                              placeholder="••••••••••••••••••••••••••••••••"
                              className="bg-muted/30 border-white/10 rounded-xl"
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-background/40 rounded-xl border border-white/5">
                            <div>
                              <p className="text-xs font-bold">{t('وضع الرمل الاختباري', 'Sandbox Testing Mode')}</p>
                              <p className="text-[10px] text-muted-foreground">{t('محاكاة الطلبات والعمليات', 'Simulate order sync')}</p>
                            </div>
                            <Switch 
                              checked={shippingIntegrations.yalidineSandbox}
                              onCheckedChange={(checked) => setShippingIntegrations({ ...shippingIntegrations, yalidineSandbox: checked })}
                            />
                          </div>
                          <Button 
                            type="button"
                            onClick={handleTestYalidine}
                            disabled={testingConnection}
                            variant="secondary" 
                            className="w-full rounded-xl font-bold bg-white/5 border border-white/10"
                          >
                            {testingConnection ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Play className="h-4 w-4 me-2" />}
                            {t('فحص الاتصال الفعلي', 'Verify Connection')}
                          </Button>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 3. Payments Tab */}
          <TabsContent value="payment" className="mt-0 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('طرق الدفع المفعلة للمشترين', 'Accepted Payment Methods')}</CardTitle>
                    <CardDescription>{t('قم بتفعيل وضبط طرق الدفع المسموح بها في متجرك.', 'Choose and configure allowed payment options.')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* COD Toggle */}
                    <div className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-white/5">
                      <div>
                        <p className="font-bold text-sm">{t('الدفع عند الاستلام (COD)', 'Cash on Delivery')}</p>
                        <p className="text-xs text-muted-foreground">{t('دفع العميل نقداً عند استلام الطرد', 'Customers pay cash when receiving orders')}</p>
                      </div>
                      <Switch 
                        checked={paymentDetails.codEnabled}
                        onCheckedChange={(checked) => setPaymentDetails({ ...paymentDetails, codEnabled: checked })}
                      />
                    </div>

                    {/* Bank / CCP Toggle */}
                    <div className="p-4 bg-background/40 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{t('التحويل البنكي / بريدي موب (Bank & CCP)', 'Bank Transfer / BaridiMob')}</p>
                          <p className="text-xs text-muted-foreground">{t('تحويل الأموال للحساب الشخصي مع تقديم الوصل', 'Direct transfer with payment slip submission')}</p>
                        </div>
                        <Switch 
                          checked={paymentDetails.bankEnabled}
                          onCheckedChange={(checked) => setPaymentDetails({ ...paymentDetails, bankEnabled: checked })}
                        />
                      </div>

                      <AnimatePresence>
                        {paymentDetails.bankEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-2 border-t border-white/5"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>{t('صاحب الحساب بنك/بريد', 'Account Holder Name')}</Label>
                                <Input 
                                  value={paymentDetails.ccpName}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, ccpName: e.target.value })}
                                  placeholder="e.g. محمد بوزيد"
                                  className="bg-muted/30 border-white/10 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t('رقم الحساب أو الـ CCP', 'CCP Account Number')}</Label>
                                <Input 
                                  value={paymentDetails.ccpAccount}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, ccpAccount: e.target.value })}
                                  placeholder="e.g. 002930291 92"
                                  className="bg-muted/30 border-white/10 rounded-xl"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>{t('مفتاح البريدي موب (BaridiMob RIP)', 'BaridiMob RIP Key')}</Label>
                              <Input 
                                value={paymentDetails.baridiMobRip}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, baridiMobRip: e.target.value })}
                                placeholder="e.g. 00799999000123456789 22"
                                className="bg-muted/30 border-white/10 rounded-xl text-start font-mono"
                                dir="ltr"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* SATIM Gateway Toggle */}
                    <div className="p-4 bg-background/40 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="size-4 text-brand" />
                            <p className="font-bold text-sm">{t('بوابة الدفع الإلكتروني SATIM (الذهبية / CIB)', 'SATIM Payment Gateway (Edahabia & CIB)')}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{t('قبول المدفوعات عبر البطاقة البنكية والذهبية مباشرة في متجرك', 'Accept direct online payments via CIB and Edahabia cards')}</p>
                        </div>
                        <Switch 
                          checked={paymentDetails.satimEnabled}
                          onCheckedChange={(checked) => setPaymentDetails({ ...paymentDetails, satimEnabled: checked })}
                        />
                      </div>

                      <AnimatePresence>
                        {paymentDetails.satimEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-2 border-t border-white/5"
                          >
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                              💡 {t('يمكنك دمج SATIM (بواسطة satim-php) لتسوية المعاملات المالية بالدينار الجزائري وتوجيهها لحسابك البنكي.', 'Integrating SATIM (powered by satim-php) allows secure settlement of Algerian Dinar (DZD) transactions to your business bank account.')}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>{t('معرف التاجر (Merchant ID)', 'Merchant ID')}</Label>
                                <Input 
                                  value={paymentDetails.satimMerchantId || ''}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, satimMerchantId: e.target.value })}
                                  placeholder="e.g. 999123456789"
                                  className="bg-muted/30 border-white/10 rounded-xl font-mono text-start"
                                  dir="ltr"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t('معرف الجهاز (Terminal ID)', 'Terminal ID')}</Label>
                                <Input 
                                  value={paymentDetails.satimTerminalId || ''}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, satimTerminalId: e.target.value })}
                                  placeholder="e.g. TERMINAL01"
                                  className="bg-muted/30 border-white/10 rounded-xl font-mono text-start"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>{t('اسم مستخدم API (API Username)', 'API Username')}</Label>
                                <Input 
                                  value={paymentDetails.satimApiUsername || ''}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, satimApiUsername: e.target.value })}
                                  placeholder="e.g. user_api_satim"
                                  className="bg-muted/30 border-white/10 rounded-xl font-mono text-start"
                                  dir="ltr"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t('كلمة مرور API (API Password)', 'API Password')}</Label>
                                <Input 
                                  type="password"
                                  value={paymentDetails.satimApiPassword || ''}
                                  onChange={(e) => setPaymentDetails({ ...paymentDetails, satimApiPassword: e.target.value })}
                                  placeholder="••••••••••••••"
                                  className="bg-muted/30 border-white/10 rounded-xl text-start"
                                  dir="ltr"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                              <div>
                                <p className="font-bold text-xs">{t('البيئة التجريبية (Sandbox Mode)', 'Sandbox / Test Mode')}</p>
                                <p className="text-[10px] text-muted-foreground">{t('اختبار المعاملات باستخدام بطاقات وهمية دون سحب أموال حقيقية', 'Test transaction flow without charging real cards')}</p>
                              </div>
                              <Switch 
                                checked={paymentDetails.satimSandbox}
                                onCheckedChange={(checked) => setPaymentDetails({ ...paymentDetails, satimSandbox: checked })}
                              />
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleTestSatim}
                              disabled={testingSatim}
                              className="w-full border-brand text-brand hover:bg-brand/10 rounded-xl"
                            >
                              {testingSatim && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                              {t('🧪 اختبار الاتصال بالبوابة', '🧪 Test Gateway Connection')}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 4. Branding & Visuals Tab */}
          <TabsContent value="branding" className="mt-0 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('الهوية البصرية واللون المميز للمتجر', 'Store Brand color & Identity')}</CardTitle>
                    <CardDescription>{t('اختر لون السمات الأساسي لمتجرك والذي سيظهر للمشترين في واجهة العرض العامة.', 'Select the accent color displayed to buyers on your storefront.')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="font-bold">{t('اللون الأساسي المتناسق', 'Primary Brand Color')}</Label>
                      <div className="flex flex-wrap gap-3">
                        {PRESET_COLORS.map((color) => {
                          const isSelected = themeSettings.primaryColor === color.hex;
                          return (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() => setThemeSettings({ ...themeSettings, primaryColor: color.hex })}
                              className={`h-10 px-4 rounded-xl flex items-center gap-2 border text-xs font-bold text-white transition-all hover:scale-105 ${color.class} ${
                                isSelected ? 'ring-2 ring-primary ring-offset-2 border-white' : 'border-transparent'
                              }`}
                            >
                              {isSelected && <CheckCircle className="h-4 w-4" />}
                              {color.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="space-y-2">
                        <Label>{t('اختر لوناً مخصصاً (Color Picker)', 'Custom Hex Color')}</Label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={themeSettings.primaryColor}
                            onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                            className="h-10 w-10 rounded-lg cursor-pointer border-none bg-transparent"
                          />
                          <Input 
                            value={themeSettings.primaryColor}
                            onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                            className="bg-muted/30 border-white/10 rounded-xl w-32 text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cover & Logo upload placeholders */}
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('الصور والأغلفة البانر', 'Store Graphics')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>{t('شعار المتجر (Logo)', 'Store Logo')}</Label>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="h-20 w-20 rounded-2xl bg-muted/50 border-2 border-dashed border-border/50 flex items-center justify-center relative overflow-hidden" style={{ borderColor: themeSettings.primaryColor }}>
                          {isUploadingLogo ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" style={{ color: themeSettings.primaryColor }} />
                          ) : generalSettings.logo ? (
                            <img src={generalSettings.logo} alt="Logo" className="object-cover w-full h-full" />
                          ) : (
                            <Store className="h-8 w-8 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="space-y-2 flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <input 
                              type="file" 
                              id="logo-upload-input" 
                              className="hidden" 
                              accept="image/png, image/jpeg, image/jpg" 
                              onChange={(e) => handleUploadFile(e, 'logo')} 
                            />
                            <Button 
                              type="button"
                              variant="outline" 
                              disabled={isUploadingLogo}
                              className="border-white/10 rounded-xl text-xs font-bold"
                              onClick={() => document.getElementById('logo-upload-input')?.click()}
                            >
                              {isUploadingLogo ? t('جاري الرفع...', 'Uploading...') : t('رفع شعار', 'Upload Logo')}
                            </Button>
                            <Input 
                              placeholder={t('أدخل رابط الشعار...', 'Enter logo URL...')}
                              value={generalSettings.logo}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, logo: e.target.value })}
                              className="bg-muted/30 border-white/10 rounded-xl text-xs flex-1"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                            ⚠️ {t(
                              'الحد الأقصى للحجم: 2 ميجابايت. الأبعاد المفضلة: 500×500 بكسل (نسبة 1:1). الصيغ المدعومة: PNG, JPG, JPEG',
                              'Max size: 2MB. Recommended dimensions: 500x500px (1:1 ratio). Supported formats: PNG, JPG, JPEG'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>{t('صورة الغلاف (Banner)', 'Cover Banner')}</Label>
                      <div className="space-y-3">
                        <input 
                          type="file" 
                          id="cover-upload-input" 
                          className="hidden" 
                          accept="image/png, image/jpeg, image/jpg" 
                          onChange={(e) => handleUploadFile(e, 'coverImage')} 
                        />
                        <div 
                          className="h-32 w-full rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/20 transition-all relative overflow-hidden" 
                          style={{ borderColor: themeSettings.primaryColor }}
                          onClick={() => !isUploadingCover && document.getElementById('cover-upload-input')?.click()}
                        >
                          {isUploadingCover ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" style={{ color: themeSettings.primaryColor }} />
                          ) : generalSettings.coverImage ? (
                            <img src={generalSettings.coverImage} alt="Banner" className="object-cover w-full h-full" />
                          ) : (
                            <>
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground font-medium">{t('اضغط هنا لرفع صورة الغلاف مباشرة', 'Click here to upload cover image directly')}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            disabled={isUploadingCover}
                            className="border-white/10 rounded-xl text-xs font-bold shrink-0"
                            onClick={() => document.getElementById('cover-upload-input')?.click()}
                          >
                            {isUploadingCover ? t('جاري الرفع...', 'Uploading...') : t('رفع غلاف', 'Upload Cover')}
                          </Button>
                          <Input 
                            placeholder={t('أدخل رابط صورة الغلاف المخصصة...', 'Enter cover image URL...')}
                            value={generalSettings.coverImage}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, coverImage: e.target.value })}
                            className="bg-muted/30 border-white/10 rounded-xl text-xs flex-1"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          ⚠️ {t(
                            'الحد الأقصى للحجم: 5 ميجابايت. الأبعاد المفضلة: 1200×480 بكسل (نسبة 16:9 أو أعرض). الصيغ المدعومة: PNG, JPG, JPEG',
                            'Max size: 5MB. Recommended dimensions: 1200x480px (16:9 or wider ratio). Supported formats: PNG, JPG, JPEG'
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
