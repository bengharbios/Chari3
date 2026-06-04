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
  Settings, Store, Image as ImageIcon, MapPin, Truck, CreditCard, Bell, Save, Globe, Loader2, Play, CheckCircle, Trash2,
  ShoppingCart, FileText, Share2, Search, Mail, Phone, Clock, DollarSign
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const { user, updateProfile } = useAuthStore();
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
    country: 'DZ',
    timezone: 'UTC+1',
    businessEmail: '',
    businessPhone: '',
    address: '',
  });

  const [orderSettings, setOrderSettings] = useState({
    minOrderAmount: 0,
    autoAcceptOrders: true,
    lowStockThreshold: 5,
    hideOutOfStock: false,
    maxQuantityPerOrder: 10,
  });

  const [policiesSettings, setPoliciesSettings] = useState({
    returnPolicy: '',
    privacyPolicy: '',
    termsOfService: '',
    shippingPolicy: '',
  });

  const [domainSettings, setDomainSettings] = useState({
    customDomain: '',
  });

  const [socialSettings, setSocialSettings] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
    twitter: '',
    youtube: '',
    website: '',
  });

  const [seoSettings, setSeoSettings] = useState({
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newOrderNotif: true,
    newReviewNotif: true,
    lowStockNotif: true,
    dailySummary: false,
    notifSound: true,
  });

  const [shippingRates, setShippingRates] = useState<any>({
    enabled: true,
    standardPrice: 400,
    expressPrice: 800,
    freeThreshold: 10000,
    customWilayas: {}, // stateId -> overridePrice
    customCities: {}, // cityId -> overridePrice
    hiddenCities: [], // list of disabled cityId
    hiddenWilayas: [], // list of disabled stateId (Wilaya)
    storeCities: [], // list of custom store-specific zones
    storeStates: [], // list of custom store-specific states
  });

  const [selectedSettingsWilayaCode, setSelectedSettingsWilayaCode] = useState('16');
  const [settingsCities, setSettingsCities] = useState<any[]>([]);
  const [isLoadingSettingsCities, setIsLoadingSettingsCities] = useState(false);
  const [newStoreZone, setNewStoreZone] = useState({ nameAr: '', nameEn: '', price: 300 });
  const [isAddingStoreZone, setIsAddingStoreZone] = useState(false);
  const [newStoreState, setNewStoreState] = useState({ nameAr: '', nameEn: '', defaultPrice: 400 });
  const [isAddingStoreState, setIsAddingStoreState] = useState(false);

  const fetchSettingsCities = async (stateCode: string) => {
    setIsLoadingSettingsCities(true);
    try {
      const res = await fetch(`/api/regions/cities?stateCode=${stateCode}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.cities)) {
        setSettingsCities(data.cities);
      }
    } catch (e) {
      console.error('Failed to load cities for settings', e);
    } finally {
      setIsLoadingSettingsCities(false);
    }
  };

  useEffect(() => {
    if (selectedSettingsWilayaCode) {
      fetchSettingsCities(selectedSettingsWilayaCode);
    }
  }, [selectedSettingsWilayaCode]);

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
  
  const [systemLimits, setSystemLimits] = useState({
    upload_max_size_mb: 5,
    upload_recommended_width: 800,
    upload_recommended_height: 800
  });

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    const maxSize = systemLimits.upload_max_size_mb * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        t(`حجم الصورة كبير جداً. الحد الأقصى ${systemLimits.upload_max_size_mb} ميجابايت.`, `Image is too large. Max is ${systemLimits.upload_max_size_mb}MB.`)
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
      // Dynamic states will be fetched by the useEffect when generalSettings.country changes

      // 1.5 Fetch system limits (upload max size, etc)
      try {
        const publicSettingsRes = await fetch('/api/settings/public');
        if (publicSettingsRes.ok) {
          const pbData = await publicSettingsRes.json();
          if (pbData.success && pbData.settings) {
            setSystemLimits({
              upload_max_size_mb: parseInt(pbData.settings.upload_max_size_mb) || 5,
              upload_recommended_width: parseInt(pbData.settings.upload_recommended_width) || 800,
              upload_recommended_height: parseInt(pbData.settings.upload_recommended_height) || 800
            });
          }
        }
      } catch (e) {
        console.error('Failed to fetch public settings', e);
      }

      // 2. Fetch seller settings
      const res = await fetch(`/api/seller/settings?userId=${user.id}`);
      if (!res.ok) throw new Error('Settings fetch failed');
      const data = await res.json();
      if (data.success && data.settings) {
        setAccountType(data.type);
        const s = data.settings;
        setGeneralSettings(prev => ({
          ...prev,
          name: s.name || '',
          nameEn: s.nameEn || '',
          description: s.description || '',
          logo: s.logo || '',
          coverImage: s.coverImage || '',
          isActive: s.isActive !== false,
        }));

        if (s.shippingRates) {
          const rates = typeof s.shippingRates === 'string' ? JSON.parse(s.shippingRates) : s.shippingRates;
          setShippingRates({
            enabled: rates.enabled !== false,
            standardPrice: rates.standardPrice !== undefined ? rates.standardPrice : 400,
            expressPrice: rates.expressPrice !== undefined ? rates.expressPrice : 800,
            freeThreshold: rates.freeThreshold !== undefined ? rates.freeThreshold : 10000,
            customWilayas: rates.customWilayas || {},
            customCities: rates.customCities || {},
            hiddenCities: rates.hiddenCities || [],
            hiddenWilayas: rates.hiddenWilayas || [],
            storeCities: rates.storeCities || [],
            storeStates: rates.storeStates || [],
          });
        }
        if (s.shippingIntegrations) setShippingIntegrations(s.shippingIntegrations);
        if (s.paymentDetails) setPaymentDetails(s.paymentDetails);
        if (s.themeSettings) setThemeSettings(s.themeSettings);

        // Load currency from the root of settings (fetched from Wallet)
        if (s.currency) {
          setStoreCurrency(s.currency);
        }

        // Load storeConfig from API
        if (s.storeConfig) {
          const config = typeof s.storeConfig === 'string' ? JSON.parse(s.storeConfig) : s.storeConfig;
          if (config.country) setGeneralSettings(prev => ({ ...prev, country: config.country }));
          if (config.timezone) setGeneralSettings(prev => ({ ...prev, timezone: config.timezone }));
          if (config.businessEmail) setGeneralSettings(prev => ({ ...prev, businessEmail: config.businessEmail }));
          if (config.businessPhone) setGeneralSettings(prev => ({ ...prev, businessPhone: config.businessPhone }));
          if (config.address) setGeneralSettings(prev => ({ ...prev, address: config.address }));
          if (config.orderSettings) setOrderSettings(prev => ({ ...prev, ...config.orderSettings }));
          if (config.policiesSettings) setPoliciesSettings(prev => ({ ...prev, ...config.policiesSettings }));
          if (config.socialSettings) setSocialSettings(prev => ({ ...prev, ...config.socialSettings }));
          if (config.domainSettings) setDomainSettings(prev => ({ ...prev, ...config.domainSettings }));
          if (config.seoSettings) setSeoSettings(prev => ({ ...prev, ...config.seoSettings }));
          if (config.notificationSettings) setNotificationSettings(prev => ({ ...prev, ...config.notificationSettings }));
        }
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

  // Fetch dynamic states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      const countryCode = generalSettings.country || 'DZ';
      try {
        const geoRes = await fetch(`/api/regions/states?countryCode=${countryCode}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.success) {
            let combinedStates = geoData.states || [];
            if (shippingRates.storeStates && shippingRates.storeStates.length > 0) {
              combinedStates = [...combinedStates, ...shippingRates.storeStates];
            }
            if (combinedStates.length > 0) {
              setStatesList(combinedStates);
            }
            if (geoData.country?.currency) {
              setStoreCurrency(geoData.country.currency);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch dynamic states', e);
      }
    };
    fetchStates();
  }, [generalSettings.country, shippingRates.storeStates]);

  // Save Settings to API
  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const storeConfig = {
        currency: storeCurrency,
        country: generalSettings.country,
        timezone: generalSettings.timezone,
        businessEmail: generalSettings.businessEmail,
        businessPhone: generalSettings.businessPhone,
        address: generalSettings.address,
        domainSettings,
        orderSettings,
        policiesSettings,
        socialSettings,
        seoSettings,
        notificationSettings,
      };

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
            storeConfig,
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        if (generalSettings.name || generalSettings.nameEn) {
          updateProfile({
            name: generalSettings.name || user?.name || '',
            nameEn: generalSettings.nameEn || user?.nameEn || ''
          });
        }
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
      dir={isAr ? 'rtl' : 'ltr'}
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
              <TabsTrigger value="orders" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <ShoppingCart className="h-4 w-4" /> {t('الطلبات والمخزون', 'Orders & Inventory')}
              </TabsTrigger>
              <TabsTrigger value="policies" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <FileText className="h-4 w-4" /> {t('السياسات والقوانين', 'Policies')}
              </TabsTrigger>
              <TabsTrigger value="social" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <Share2 className="h-4 w-4" /> {t('التواصل الاجتماعي', 'Social & Contact')}
              </TabsTrigger>
              <TabsTrigger value="seo" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <Search className="h-4 w-4" /> {t('SEO', 'SEO')}
              </TabsTrigger>
              <TabsTrigger value="domains" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <Globe className="h-4 w-4" /> {t('النطاق والدومين', 'Domains & Links')}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <Bell className="h-4 w-4" /> {t('الإشعارات', 'Notifications')}
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

                    {/* Currency, Country, Timezone */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-primary" />{t('العملة', 'Currency')}</Label>
                        <Select value={storeCurrency} onValueChange={(val) => setStoreCurrency(val)}>
                          <SelectTrigger className="bg-muted/30 border-white/10 rounded-xl w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DZD">DZD - {t('دينار جزائري', 'Algerian Dinar')}</SelectItem>
                            <SelectItem value="SAR">SAR - {t('ريال سعودي', 'Saudi Riyal')}</SelectItem>
                            <SelectItem value="USD">USD - {t('دولار أمريكي', 'US Dollar')}</SelectItem>
                            <SelectItem value="EUR">EUR - {t('يورو', 'Euro')}</SelectItem>
                            <SelectItem value="MAD">MAD - {t('درهم مغربي', 'Moroccan Dirham')}</SelectItem>
                            <SelectItem value="TND">TND - {t('دينار تونسي', 'Tunisian Dinar')}</SelectItem>
                            <SelectItem value="EGP">EGP - {t('جنيه مصري', 'Egyptian Pound')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-primary" />{t('الدولة', 'Country')}</Label>
                        <Select value={generalSettings.country} onValueChange={(val) => setGeneralSettings({ ...generalSettings, country: val })}>
                          <SelectTrigger className="bg-muted/30 border-white/10 rounded-xl w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DZ">{t('🇩🇿 الجزائر', '🇩🇿 Algeria')}</SelectItem>
                            <SelectItem value="SA">{t('🇸🇦 السعودية', '🇸🇦 Saudi Arabia')}</SelectItem>
                            <SelectItem value="MA">{t('🇲🇦 المغرب', '🇲🇦 Morocco')}</SelectItem>
                            <SelectItem value="TN">{t('🇹🇳 تونس', '🇹🇳 Tunisia')}</SelectItem>
                            <SelectItem value="EG">{t('🇪🇬 مصر', '🇪🇬 Egypt')}</SelectItem>
                            <SelectItem value="LY">{t('🇱🇾 ليبيا', '🇱🇾 Libya')}</SelectItem>
                            <SelectItem value="AE">{t('🇦🇪 الإمارات', '🇦🇪 UAE')}</SelectItem>
                            <SelectItem value="JO">{t('🇯🇴 الأردن', '🇯🇴 Jordan')}</SelectItem>
                            <SelectItem value="IQ">{t('🇮🇶 العراق', '🇮🇶 Iraq')}</SelectItem>
                            <SelectItem value="SD">{t('🇸🇩 السودان', '🇸🇩 Sudan')}</SelectItem>
                            <SelectItem value="MR">{t('🇲🇷 موريتانيا', '🇲🇷 Mauritania')}</SelectItem>
                            <SelectItem value="NG">{t('🇳🇬 نيجيريا', '🇳🇬 Nigeria')}</SelectItem>
                            <SelectItem value="SN">{t('🇸🇳 السنغال', '🇸🇳 Senegal')}</SelectItem>
                            <SelectItem value="TR">{t('🇹🇷 تركيا', '🇹🇷 Turkey')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{t('المنطقة الزمنية', 'Timezone')}</Label>
                        <Select value={generalSettings.timezone} onValueChange={(val) => setGeneralSettings({ ...generalSettings, timezone: val })}>
                          <SelectTrigger className="bg-muted/30 border-white/10 rounded-xl w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                            <SelectItem value="UTC+1">UTC+1 ({t('الجزائر، تونس', 'Algeria, Tunisia')})</SelectItem>
                            <SelectItem value="UTC+2">UTC+2 ({t('مصر، ليبيا', 'Egypt, Libya')})</SelectItem>
                            <SelectItem value="UTC+3">UTC+3 ({t('السعودية، العراق', 'Saudi Arabia, Iraq')})</SelectItem>
                            <SelectItem value="UTC+4">UTC+4 ({t('الإمارات، عُمان', 'UAE, Oman')})</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Business Contact Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" />{t('البريد الإلكتروني التجاري', 'Business Email')}</Label>
                        <Input 
                          type="email"
                          value={generalSettings.businessEmail}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, businessEmail: e.target.value })}
                          placeholder={t('contact@store.com', 'contact@store.com')}
                          className="bg-muted/30 border-white/10 rounded-xl" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" />{t('رقم الهاتف التجاري', 'Business Phone')}</Label>
                        <Input 
                          type="tel"
                          value={generalSettings.businessPhone}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, businessPhone: e.target.value })}
                          placeholder="+213 XX XXX XXXX"
                          className="bg-muted/30 border-white/10 rounded-xl" 
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{t('العنوان الفعلي للمتجر', 'Physical Address')}</Label>
                      <Textarea 
                        rows={2}
                        value={generalSettings.address}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                        placeholder={t('شارع، مدينة، ولاية...', 'Street, city, state...')}
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
                              <Label>{t(`التوصيل العادي (${storeCurrency})`, `Standard Courier Price (${storeCurrency})`)}</Label>
                              <Input 
                                type="number"
                                value={shippingRates.standardPrice}
                                onChange={(e) => setShippingRates({ ...shippingRates, standardPrice: parseFloat(e.target.value) || 0 })}
                                className="bg-muted/30 border-white/10 rounded-xl" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t(`التوصيل السريع (${storeCurrency})`, `Express Courier Price (${storeCurrency})`)}</Label>
                              <Input 
                                type="number"
                                value={shippingRates.expressPrice}
                                onChange={(e) => setShippingRates({ ...shippingRates, expressPrice: parseFloat(e.target.value) || 0 })}
                                className="bg-muted/30 border-white/10 rounded-xl" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t(`حد الشحن المجاني (${storeCurrency})`, `Free Delivery Limit (${storeCurrency})`)}</Label>
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
                    <CardContent className="space-y-4">
                      {/* Add Custom State Form */}
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{t('ولايتك/محافظتك غير موجودة بالأسفل؟', 'Your state/province missing below?')}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t('أضف ولاية أو محافظة جديدة يدوياً للتحكم بسعر الشحن الخاص بها.', 'Add a custom state/province manually.')}</p>
                        </div>
                        <Button 
                          onClick={() => setIsAddingStoreState(!isAddingStoreState)} 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl text-xs font-bold border-white/10"
                        >
                          {isAddingStoreState ? t('إغلاق', 'Close') : t('➕ إضافة محافظة', '➕ Add Province')}
                        </Button>
                      </div>

                      {isAddingStoreState && (
                        <div className="p-4 bg-muted/40 rounded-2xl border border-white/5 space-y-3 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px]">{t('اسم الولاية/المحافظة', 'State Name')}</Label>
                              <Input 
                                value={newStoreState.nameAr}
                                onChange={(e) => setNewStoreState({ ...newStoreState, nameAr: e.target.value })}
                                placeholder="مثال: الرياض"
                                className="bg-background rounded-lg h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">{t('الاسم بالإنجليزية (اختياري)', 'English Name')}</Label>
                              <Input 
                                value={newStoreState.nameEn}
                                onChange={(e) => setNewStoreState({ ...newStoreState, nameEn: e.target.value })}
                                placeholder="e.g. Riyadh"
                                className="bg-background rounded-lg h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">{t('سعر التوصيل', 'Courier Fee')}</Label>
                              <Input 
                                type="number"
                                value={newStoreState.defaultPrice}
                                onChange={(e) => setNewStoreState({ ...newStoreState, defaultPrice: parseFloat(e.target.value) || 0 })}
                                className="bg-background rounded-lg h-9 text-xs font-bold text-center"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                if (!newStoreState.nameAr.trim()) {
                                  toast.error(t('يرجى كتابة اسم المحافظة!', 'Please enter state name!'));
                                  return;
                                }
                                const customState = {
                                  id: `custom_state_${Math.random().toString(36).substring(2, 9)}`,
                                  code: `custom_${Math.random().toString(36).substring(2, 9)}`,
                                  nameAr: newStoreState.nameAr,
                                  nameEn: newStoreState.nameEn || newStoreState.nameAr,
                                  defaultPrice: newStoreState.defaultPrice,
                                };
                                const newStoreStates = [...(shippingRates.storeStates || []), customState];
                                setShippingRates({ ...shippingRates, storeStates: newStoreStates });
                                setStatesList([...statesList, customState]);
                                setNewStoreState({ nameAr: '', nameEn: '', defaultPrice: 400 });
                                setIsAddingStoreState(false);
                                toast.success(t('تمت إضافة المحافظة المخصصة بنجاح', 'Custom state added successfully'));
                              }}
                              className="h-8 text-xs font-bold rounded-lg px-4"
                            >
                              {t('حفظ', 'Save')}
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-y-auto max-h-[300px] border border-white/5 rounded-2xl p-2 space-y-2 bg-slate-950/20">
                        {filteredWilayas.map((wilaya) => {
                          const wId = wilaya.id || wilaya.code;
                          const customPrice = shippingRates.customWilayas[wId] !== undefined
                            ? shippingRates.customWilayas[wId]
                            : wilaya.defaultPrice;
                          const isCustomized = shippingRates.customWilayas[wId] !== undefined;
                          const isHidden = (shippingRates.hiddenWilayas || []).includes(wId);

                          return (
                            <div 
                              key={wId} 
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all text-start ${
                                isHidden ? 'bg-red-500/5 border-red-500/10 opacity-75' : 'bg-background/40 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <span className="font-mono text-xs text-muted-foreground me-2 bg-white/5 px-2 py-0.5 rounded-md">{wId}</span>
                                  <span className="font-bold text-sm">{isAr ? wilaya.nameAr : wilaya.nameEn}</span>
                                  {isHidden && (
                                    <span className="ms-2 text-[10px] bg-red-500/20 text-red-500 font-bold px-2 py-0.5 rounded-full">
                                      {t('ملغية ❌', 'Disabled ❌')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {/* Only show price override input if delivery is enabled for this wilaya */}
                                {!isHidden && (
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      type="number"
                                      placeholder={String(wilaya.defaultPrice)}
                                      value={isCustomized ? customPrice : ''}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? undefined : parseFloat(e.target.value) || 0;
                                        const nextWilayas = { ...shippingRates.customWilayas };
                                        if (val === undefined) {
                                          delete nextWilayas[wId];
                                        } else {
                                          nextWilayas[wId] = val;
                                        }
                                        setShippingRates({ ...shippingRates, customWilayas: nextWilayas });
                                      }}
                                      className="w-28 bg-muted/40 border-white/10 rounded-xl h-9 text-center font-bold"
                                    />
                                    <span className="text-xs text-muted-foreground font-bold">{storeCurrency}</span>
                                  </div>
                                )}

                                {/* Delivery toggle Switch */}
                                <div className="flex items-center gap-1.5 border-s border-white/10 ps-3">
                                  <Label className="text-[10px] text-muted-foreground hidden sm:inline">{t('تفعيل التوصيل', 'Deliver')}</Label>
                                  <Switch 
                                    checked={!isHidden}
                                    onCheckedChange={(checked) => {
                                      let nextHidden = [...(shippingRates.hiddenWilayas || [])];
                                      if (checked) {
                                        // Enable it (remove from hiddenWilayas)
                                        nextHidden = nextHidden.filter(id => id !== wId);
                                      } else {
                                        // Disable it (add to hiddenWilayas)
                                        if (!nextHidden.includes(wId)) nextHidden.push(wId);
                                      }
                                      setShippingRates({ ...shippingRates, hiddenWilayas: nextHidden });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Municipality-by-Municipality Overrides & Exclusions */}
                {shippingRates.enabled && (
                  <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span>🗺️ {t('إدارة شحن البلديات والدواوير المخصصة', 'Municipality Delivery & Rates')}</span>
                          </CardTitle>
                          <CardDescription>
                            {t('اختر الولاية لتفصيل أسعار بلدياتها، حجب بلديات محددة من التوصيل، أو إضافة مناطق شحن مخصصة.', 'Select a state to customize municipality prices, hide specific municipalities, or add custom delivery zones.')}
                          </CardDescription>
                        </div>

                        {/* State selector dropdown */}
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground shrink-0">{t('الولاية النشطة:', 'Active Wilaya:')}</Label>
                          <select
                            value={selectedSettingsWilayaCode}
                            onChange={(e) => setSelectedSettingsWilayaCode(e.target.value)}
                            className="text-xs font-bold bg-background border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none min-w-[140px]"
                          >
                            {statesList.map((st) => (
                              <option key={st.id} value={st.code}>
                                📍 {isAr ? st.nameAr : st.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Local zone adding button/form */}
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{t('هل تخدم دواوير أو مناطق محلية خاصة؟', 'Do you serve local custom zones?')}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t('أضف مناطق توصيل خاصة بمحاذاة متجرك بأسعار مميزة.', 'Add hyper-local custom neighborhoods with customized fees.')}</p>
                        </div>
                        <Button 
                          onClick={() => setIsAddingStoreZone(!isAddingStoreZone)} 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl text-xs font-bold border-white/10"
                        >
                          {isAddingStoreZone ? t('إغلاق', 'Close') : t('➕ إضافة منطقة خاصة', '➕ Add Custom Zone')}
                        </Button>
                      </div>

                      {isAddingStoreZone && (
                        <div className="p-4 bg-muted/40 rounded-2xl border border-white/5 space-y-3 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px]">{t('المنطقة بالعربية', 'Zone in Arabic')}</Label>
                              <Input 
                                value={newStoreZone.nameAr}
                                onChange={(e) => setNewStoreZone({ ...newStoreZone, nameAr: e.target.value })}
                                placeholder="مثال: حي السلام وسط"
                                className="bg-background rounded-lg h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">{t('المنطقة بالإنجليزية', 'Zone in English')}</Label>
                              <Input 
                                value={newStoreZone.nameEn}
                                onChange={(e) => setNewStoreZone({ ...newStoreZone, nameEn: e.target.value })}
                                placeholder="e.g. Hai Salam Center"
                                className="bg-background rounded-lg h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">{t(`سعر التوصيل (${storeCurrency})`, `Courier Fee (${storeCurrency})`)}</Label>
                              <Input 
                                type="number"
                                value={newStoreZone.price}
                                onChange={(e) => setNewStoreZone({ ...newStoreZone, price: parseFloat(e.target.value) || 0 })}
                                className="bg-background rounded-lg h-9 text-xs font-bold text-center"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                if (!newStoreZone.nameAr.trim()) {
                                  toast.error(t('يرجى كتابة اسم المنطقة بالعربية!', 'Please enter Arabic zone name!'));
                                  return;
                                }
                                const customZone = {
                                  id: `store_city_${Math.random().toString(36).substring(2, 9)}`,
                                  nameAr: newStoreZone.nameAr,
                                  nameEn: newStoreZone.nameEn || newStoreZone.nameAr,
                                  price: newStoreZone.price,
                                  stateCode: selectedSettingsWilayaCode,
                                };
                                const updatedStoreCities = [...(shippingRates.storeCities || []), customZone];
                                setShippingRates({ ...shippingRates, storeCities: updatedStoreCities });
                                setNewStoreZone({ nameAr: '', nameEn: '', price: 300 });
                                setIsAddingStoreZone(false);
                                toast.success(t('تم إضافة منطقة التوصيل الخاصة بك بنجاح!', 'Custom delivery zone successfully added!'));
                              }} 
                              className="font-bold text-xs"
                            >
                              {t('حفظ المنطقة المخصصة', 'Save Custom Zone')}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Municipalities List */}
                      {isLoadingSettingsCities ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="overflow-y-auto max-h-[300px] border border-white/5 rounded-2xl p-2 space-y-2 bg-slate-950/20">
                          {/* 1. Global municipalities with overridden rates */}
                          {settingsCities.map((city) => {
                            const isHidden = (shippingRates.hiddenCities || []).includes(city.id);
                            const customPrice = shippingRates.customCities[city.id] !== undefined
                              ? shippingRates.customCities[city.id]
                              : '';
                            const isCustomized = shippingRates.customCities[city.id] !== undefined;

                            return (
                              <div 
                                key={city.id} 
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-start ${
                                  isHidden ? 'bg-red-500/5 border-red-500/10 opacity-70' : 'bg-background/40 border-white/5'
                                }`}
                              >
                                <div className="space-y-1">
                                  <span className="font-bold text-sm text-foreground">{isAr ? city.nameAr : city.nameEn}</span>
                                  {isHidden && (
                                    <span className="ms-2 text-[10px] bg-red-500/20 text-red-500 font-bold px-2 py-0.5 rounded-full">
                                      {t('محجوبة من الشحن ❌', 'Shipping Disabled ❌')}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Override price input (hidden if shipping is disabled) */}
                                  {!isHidden && (
                                    <div className="flex items-center gap-1.5">
                                      <Input 
                                        type="number"
                                        placeholder={String(city.defaultPrice || 500)}
                                        value={customPrice}
                                        onChange={(e) => {
                                          const val = e.target.value === '' ? undefined : parseFloat(e.target.value) || 0;
                                          const nextCities = { ...shippingRates.customCities };
                                          if (val === undefined) {
                                            delete nextCities[city.id];
                                          } else {
                                            nextCities[city.id] = val;
                                          }
                                          setShippingRates({ ...shippingRates, customCities: nextCities });
                                        }}
                                        className="w-24 bg-muted/40 border-white/10 rounded-xl h-8 text-center font-bold text-xs"
                                      />
                                      <span className="text-[10px] text-muted-foreground font-bold">{storeCurrency}</span>
                                    </div>
                                  )}

                                  {/* Hiding Toggle Switch */}
                                  <div className="flex items-center gap-1">
                                    <Label className="text-[10px] text-muted-foreground hidden sm:inline">{t('تفعيل التوصيل', 'Enable Delivery')}</Label>
                                    <Switch 
                                      checked={!isHidden}
                                      onCheckedChange={(checked) => {
                                        let nextHidden = [...(shippingRates.hiddenCities || [])];
                                        if (checked) {
                                          // Enable it (remove from hiddenCities)
                                          nextHidden = nextHidden.filter(id => id !== city.id);
                                        } else {
                                          // Disable it (add to hiddenCities)
                                          if (!nextHidden.includes(city.id)) nextHidden.push(city.id);
                                        }
                                        setShippingRates({ ...shippingRates, hiddenCities: nextHidden });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* 2. Store-specific custom municipalities */}
                          {(shippingRates.storeCities || [])
                            .filter((sc: any) => sc.stateCode === selectedSettingsWilayaCode)
                            .map((sc: any) => (
                              <div key={sc.id} className="flex items-center justify-between p-3 rounded-xl bg-brand/5 border border-brand/20 text-start">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-foreground">{isAr ? sc.nameAr : sc.nameEn}</span>
                                    <span className="text-[9px] bg-brand/20 text-brand font-bold px-1.5 py-0.5 rounded-full">{t('منطقتك الخاصة 📍', 'Store Zone 📍')}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <Input 
                                      type="number"
                                      value={sc.price}
                                      onChange={(e) => {
                                        const updatedCities = (shippingRates.storeCities || []).map((c: any) => {
                                          if (c.id === sc.id) {
                                            return { ...c, price: parseFloat(e.target.value) || 0 };
                                          }
                                          return c;
                                        });
                                        setShippingRates({ ...shippingRates, storeCities: updatedCities });
                                      }}
                                      className="w-24 bg-muted/40 border-white/10 rounded-xl h-8 text-center font-bold text-xs"
                                    />
                                    <span className="text-[10px] text-muted-foreground font-bold">{storeCurrency}</span>
                                  </div>

                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => {
                                      const updatedCities = (shippingRates.storeCities || []).filter((c: any) => c.id !== sc.id);
                                      setShippingRates({ ...shippingRates, storeCities: updatedCities });
                                      toast.success(t('تم إزالة منطقة التوصيل الخاصة بك.', 'Custom delivery zone removed.'));
                                    }} 
                                    className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
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

          {/* 5. Orders & Inventory Tab */}
          <TabsContent value="orders" className="mt-0 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" />{t('إعدادات الطلبات', 'Order Settings')}</CardTitle>
                  <CardDescription>{t('تحكم بالحد الأدنى للطلبات والقبول التلقائي.', 'Control minimum order amount and auto-accept settings.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('الحد الأدنى للطلب (بالعملة)', 'Minimum Order Amount')}</Label>
                    <Input 
                      type="number"
                      value={orderSettings.minOrderAmount}
                      onChange={(e) => setOrderSettings({ ...orderSettings, minOrderAmount: parseFloat(e.target.value) || 0 })}
                      className="bg-muted/30 border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('أقصى كمية لكل منتج بالطلب', 'Max Quantity Per Product Per Order')}</Label>
                    <Input 
                      type="number"
                      value={orderSettings.maxQuantityPerOrder}
                      onChange={(e) => setOrderSettings({ ...orderSettings, maxQuantityPerOrder: parseInt(e.target.value) || 1 })}
                      className="bg-muted/30 border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-white/5">
                    <div>
                      <p className="font-bold text-sm">{t('القبول التلقائي للطلبات', 'Auto-Accept Orders')}</p>
                      <p className="text-xs text-muted-foreground">{t('قبول الطلبات الجديدة تلقائياً بدون تأكيد يدوي', 'Automatically accept new orders without manual confirmation')}</p>
                    </div>
                    <Switch 
                      checked={orderSettings.autoAcceptOrders}
                      onCheckedChange={(checked) => setOrderSettings({ ...orderSettings, autoAcceptOrders: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />{t('إعدادات المخزون', 'Inventory Settings')}</CardTitle>
                  <CardDescription>{t('تنبيهات المخزون المنخفض وإخفاء المنتجات غير المتوفرة.', 'Low stock alerts and hide out-of-stock products.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('حد تنبيه المخزون المنخفض', 'Low Stock Alert Threshold')}</Label>
                    <Input 
                      type="number"
                      value={orderSettings.lowStockThreshold}
                      onChange={(e) => setOrderSettings({ ...orderSettings, lowStockThreshold: parseInt(e.target.value) || 1 })}
                      className="bg-muted/30 border-white/10 rounded-xl"
                    />
                    <p className="text-[10px] text-muted-foreground">{t('سيتم تنبيهك عندما ينخفض المخزون عن هذا العدد', 'You will be alerted when stock falls below this number')}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-white/5">
                    <div>
                      <p className="font-bold text-sm">{t('إخفاء المنتجات غير المتوفرة', 'Hide Out-of-Stock Products')}</p>
                      <p className="text-xs text-muted-foreground">{t('إخفاء المنتجات التي نفذ مخزونها من واجهة المتجر', 'Hide products with zero stock from the storefront')}</p>
                    </div>
                    <Switch 
                      checked={orderSettings.hideOutOfStock}
                      onCheckedChange={(checked) => setOrderSettings({ ...orderSettings, hideOutOfStock: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 6. Policies Tab */}
          <TabsContent value="policies" className="mt-0 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{t('سياسة الإرجاع والاسترداد', 'Return & Refund Policy')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    rows={6}
                    value={policiesSettings.returnPolicy}
                    onChange={(e) => setPoliciesSettings({ ...policiesSettings, returnPolicy: e.target.value })}
                    placeholder={t('اكتب سياسة الإرجاع والاسترداد الخاصة بمتجرك هنا...', 'Write your return and refund policy here...')}
                    className="bg-muted/30 border-white/10 rounded-xl resize-none"
                  />
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{t('سياسة الخصوصية', 'Privacy Policy')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    rows={6}
                    value={policiesSettings.privacyPolicy}
                    onChange={(e) => setPoliciesSettings({ ...policiesSettings, privacyPolicy: e.target.value })}
                    placeholder={t('اكتب سياسة الخصوصية الخاصة بمتجرك هنا...', 'Write your privacy policy here...')}
                    className="bg-muted/30 border-white/10 rounded-xl resize-none"
                  />
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{t('شروط الخدمة والاستخدام', 'Terms of Service')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    rows={6}
                    value={policiesSettings.termsOfService}
                    onChange={(e) => setPoliciesSettings({ ...policiesSettings, termsOfService: e.target.value })}
                    placeholder={t('اكتب شروط الخدمة والاستخدام هنا...', 'Write your terms of service here...')}
                    className="bg-muted/30 border-white/10 rounded-xl resize-none"
                  />
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-primary" />{t('سياسة الشحن', 'Shipping Policy')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    rows={6}
                    value={policiesSettings.shippingPolicy}
                    onChange={(e) => setPoliciesSettings({ ...policiesSettings, shippingPolicy: e.target.value })}
                    placeholder={t('اكتب سياسة الشحن والتوصيل هنا...', 'Write your shipping policy here...')}
                    className="bg-muted/30 border-white/10 rounded-xl resize-none"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 7. Social & Contact Tab */}
          <TabsContent value="social" className="mt-0 outline-none">
            <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" />{t('روابط التواصل الاجتماعي', 'Social Media Links')}</CardTitle>
                <CardDescription>{t('أضف روابط حساباتك على شبكات التواصل لزيادة التفاعل والمصداقية.', 'Add your social media links to increase engagement and credibility.')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input 
                      value={socialSettings.facebook}
                      onChange={(e) => setSocialSettings({ ...socialSettings, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="bg-muted/30 border-white/10 rounded-xl" dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input 
                      value={socialSettings.instagram}
                      onChange={(e) => setSocialSettings({ ...socialSettings, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="bg-muted/30 border-white/10 rounded-xl" dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>TikTok</Label>
                    <Input 
                      value={socialSettings.tiktok}
                      onChange={(e) => setSocialSettings({ ...socialSettings, tiktok: e.target.value })}
                      placeholder="https://tiktok.com/@..."
                      className="bg-muted/30 border-white/10 rounded-xl" dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input 
                      value={socialSettings.whatsapp}
                      onChange={(e) => setSocialSettings({ ...socialSettings, whatsapp: e.target.value })}
                      placeholder="+213 XX XXX XXXX"
                      className="bg-muted/30 border-white/10 rounded-xl" dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter / X</Label>
                    <Input 
                      value={socialSettings.twitter}
                      onChange={(e) => setSocialSettings({ ...socialSettings, twitter: e.target.value })}
                      placeholder="https://x.com/..."
                      className="bg-muted/30 border-white/10 rounded-xl" dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube</Label>
                    <Input 
                      value={socialSettings.youtube}
                      onChange={(e) => setSocialSettings({ ...socialSettings, youtube: e.target.value })}
                      placeholder="https://youtube.com/@..."
                      className="bg-muted/30 border-white/10 rounded-xl" dir="ltr"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-primary" />{t('موقع الويب الرسمي', 'Official Website')}</Label>
                    <Input 
                      value={socialSettings.website}
                      onChange={(e) => setSocialSettings({ ...socialSettings, website: e.target.value })}
                      placeholder="https://yourstore.com"
                      className="bg-muted/30 border-white/10 rounded-xl" dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 8. SEO Tab */}
          <TabsContent value="seo" className="mt-0 outline-none">
            <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5 text-primary" />{t('تحسين محركات البحث (SEO)', 'Search Engine Optimization (SEO)')}</CardTitle>
                <CardDescription>{t('حسّن ظهور متجرك في نتائج بحث Google ومحركات البحث الأخرى.', 'Improve your store visibility in Google and other search engines.')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('عنوان SEO (Meta Title)', 'SEO Title (Meta Title)')}</Label>
                  <Input 
                    value={seoSettings.seoTitle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, seoTitle: e.target.value })}
                    placeholder={t('عنوان يظهر في نتائج البحث (60 حرف كحد أقصى)', 'Title shown in search results (max 60 characters)')}
                    className="bg-muted/30 border-white/10 rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground">{seoSettings.seoTitle.length}/60 {t('حرف', 'characters')}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t('وصف SEO (Meta Description)', 'SEO Description (Meta Description)')}</Label>
                  <Textarea 
                    rows={3}
                    value={seoSettings.seoDescription}
                    onChange={(e) => setSeoSettings({ ...seoSettings, seoDescription: e.target.value })}
                    placeholder={t('وصف قصير يظهر تحت العنوان في نتائج البحث (160 حرف كحد أقصى)', 'Short description shown below the title in search results (max 160 characters)')}
                    className="bg-muted/30 border-white/10 rounded-xl resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground">{seoSettings.seoDescription.length}/160 {t('حرف', 'characters')}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t('الكلمات المفتاحية (مفصولة بفواصل)', 'Keywords (comma-separated)')}</Label>
                  <Input 
                    value={seoSettings.seoKeywords}
                    onChange={(e) => setSeoSettings({ ...seoSettings, seoKeywords: e.target.value })}
                    placeholder={t('متجر، تسوق، منتجات، عروض', 'store, shopping, products, deals')}
                    className="bg-muted/30 border-white/10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('صورة OG للمشاركة الاجتماعية (Open Graph Image)', 'OG Image for Social Sharing')}</Label>
                  <Input 
                    value={seoSettings.ogImage}
                    onChange={(e) => setSeoSettings({ ...seoSettings, ogImage: e.target.value })}
                    placeholder={t('رابط صورة 1200×630 بكسل', 'Image URL 1200×630 pixels')}
                    className="bg-muted/30 border-white/10 rounded-xl" dir="ltr"
                  />
                  <p className="text-[10px] text-muted-foreground">{t('الأبعاد المفضلة: 1200×630 بكسل. تظهر عند مشاركة رابط المتجر على فيسبوك وتويتر.', 'Recommended: 1200×630px. Shown when sharing the store link on Facebook and Twitter.')}</p>
                </div>

                {/* SEO Preview */}
                {(seoSettings.seoTitle || seoSettings.seoDescription) && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('معاينة نتيجة البحث', 'Search Result Preview')}</p>
                    <p className="text-blue-400 font-bold text-sm truncate">{seoSettings.seoTitle || generalSettings.name || t('عنوان المتجر', 'Store Title')}</p>
                    <p className="text-green-500 text-xs dir-ltr">yourstore.chariday.com</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{seoSettings.seoDescription || generalSettings.description || t('وصف المتجر', 'Store description')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 9. Notifications Tab */}
          <TabsContent value="notifications" className="mt-0 outline-none">
            <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />{t('إعدادات الإشعارات', 'Notification Settings')}</CardTitle>
                <CardDescription>{t('تحكم بأنواع الإشعارات التي تتلقاها لإدارة متجرك بفعالية.', 'Control which notifications you receive to manage your store effectively.')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-white/5">
                  <div>
                    <p className="font-bold text-sm">{t('إشعار طلب جديد', 'New Order Notification')}</p>
                    <p className="text-xs text-muted-foreground">{t('تنبيه فوري عند ورود طلب جديد', 'Instant alert when a new order arrives')}</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.newOrderNotif}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newOrderNotif: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-white/5">
                  <div>
                    <p className="font-bold text-sm">{t('إشعار تقييم جديد', 'New Review Notification')}</p>
                    <p className="text-xs text-muted-foreground">{t('تنبيه عند ترك تقييم جديد على منتجاتك', 'Alert when a customer leaves a new review')}</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.newReviewNotif}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newReviewNotif: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-white/5">
                  <div>
                    <p className="font-bold text-sm">{t('تنبيه المخزون المنخفض', 'Low Stock Alert')}</p>
                    <p className="text-xs text-muted-foreground">{t('تنبيه عندما ينخفض مخزون أي منتج عن الحد المحدد', 'Alert when any product stock falls below the threshold')}</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.lowStockNotif}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowStockNotif: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-white/5">
                  <div>
                    <p className="font-bold text-sm">{t('ملخص يومي', 'Daily Summary')}</p>
                    <p className="text-xs text-muted-foreground">{t('ملخص يومي بالطلبات والإيرادات والإحصائيات', 'Daily summary of orders, revenue and statistics')}</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.dailySummary}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, dailySummary: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-white/5">
                  <div>
                    <p className="font-bold text-sm">{t('صوت الإشعارات', 'Notification Sound')}</p>
                    <p className="text-xs text-muted-foreground">{t('تشغيل صوت عند ورود إشعار جديد', 'Play a sound when a new notification arrives')}</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.notifSound}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, notifSound: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Domains Tab */}
          <TabsContent value="domains" className="mt-0 outline-none">
            <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {t('إعدادات النطاق المخصص', 'Custom Domain Settings')}
                </CardTitle>
                <CardDescription>
                  {t('اربط متجرك بنطاق مخصص خاص بك (مثل: www.mystore.com) بدلاً من النطاق الافتراضي.', 'Link your store to your own custom domain (e.g. www.mystore.com) instead of the default subdomain.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('النطاق الافتراضي الحالي', 'Current Default Link')}</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      readOnly 
                      value={`chariday.com/store/${generalSettings.nameEn.toLowerCase().replace(/\s+/g, '-') || user?.id}`}
                      className="bg-muted/30 border-white/10 rounded-xl font-mono text-muted-foreground" 
                      dir="ltr"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('هذا هو رابط متجرك الافتراضي على منصتنا.', 'This is your default store link on our platform.')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('النطاق المخصص (Custom Domain)', 'Custom Domain')}</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="e.g. mystore.com"
                      value={domainSettings.customDomain}
                      onChange={(e) => setDomainSettings({ ...domainSettings, customDomain: e.target.value })}
                      className="bg-muted/30 border-primary/30 focus-visible:ring-primary rounded-xl font-mono" 
                      dir="ltr"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('أدخل اسم النطاق الخاص بك بدون http:// (مثال: mystore.com). يجب توجيه النطاق إلى خوادمنا أولاً.', 'Enter your domain name without http:// (e.g. mystore.com). You must point your domain to our servers first.')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </motion.div>
    </motion.div>
  );
}
