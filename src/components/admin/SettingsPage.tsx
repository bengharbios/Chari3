'use client';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { locale } = useTranslation();
  const { setAllowGuestCheckout, allowGuestCheckout } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [localGuestCheckout, setLocalGuestCheckout] = useState(allowGuestCheckout);
  const [localCurrency, setLocalCurrency] = useState('DZD');
  const [localMapsEnabled, setLocalMapsEnabled] = useState(false);
  const [localMapsKey, setLocalMapsKey] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const [settingsRes, flagsRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/flags')
        ]);
        const data = await settingsRes.json();
        const flagsData = await flagsRes.json();

        if (data.success && data.settings) {
          if (data.settings.allow_guest_checkout !== undefined) {
            const guestEnabled = data.settings.allow_guest_checkout === 'true';
            setLocalGuestCheckout(guestEnabled);
            setAllowGuestCheckout(guestEnabled);
          }
          if (data.settings.currency !== undefined) {
            setLocalCurrency(data.settings.currency);
          }
          if (data.settings.google_maps_api_key !== undefined) {
            setLocalMapsKey(data.settings.google_maps_api_key);
          }
        }
        if (flagsData.success && flagsData.flags) {
          setLocalMapsEnabled(flagsData.flags.flag_enable_google_maps ?? false);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [setAllowGuestCheckout]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            allow_guest_checkout: localGuestCheckout.toString(),
            currency: localCurrency,
            google_maps_api_key: localMapsKey,
          },
        }),
      });

      const flagsRes = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flags: {
            flag_enable_google_maps: localMapsEnabled,
          },
        }),
      });
      
      const data = await res.json();
      const flagsData = await flagsRes.json();
      if (data.success && flagsData.success) {
        toast.success(
          locale === 'ar' 
            ? 'تم حفظ الإعدادات بنجاح' 
            : 'Settings saved successfully'
        );
        setAllowGuestCheckout(localGuestCheckout);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(
        locale === 'ar' 
          ? 'فشل حفظ الإعدادات' 
          : 'Failed to save settings'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <p className="text-sm font-semibold text-muted-foreground">
          {locale === 'ar' ? 'جاري تحميل الإعدادات...' : 'Loading system settings...'}
        </p>
      </div>
    );
  }

  return (
    <div dir={dir} className="space-y-6 text-start">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-brand" />
        <div>
          <h1 className="text-2xl font-black">
            {locale === 'ar' ? 'إعدادات النظام' : 'System Settings'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === 'ar' 
              ? 'التحكم في الإعدادات العامة للمنصة' 
              : 'Manage platform global settings'}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Checkout Settings */}
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              {locale === 'ar' ? 'إعدادات الدفع والشراء' : 'Checkout Settings'}
            </CardTitle>
            <CardDescription>
              {locale === 'ar' 
                ? 'تكوين خيارات الشراء للزوار والأعضاء' 
                : 'Configure purchase options for guests and members'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Guest checkout */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
              <div>
                <p className="font-bold text-foreground">
                  {locale === 'ar' ? 'السماح بالشراء للزوار (Guest Checkout)' : 'Allow Guest Checkout'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[80%]">
                  {locale === 'ar' 
                    ? 'عند التفعيل، يمكن للمستخدمين غير المسجلين إتمام الطلبات وتتبعها.' 
                    : 'When enabled, unregistered users can complete orders.'}
                </p>
              </div>
              <Switch 
                checked={localGuestCheckout} 
                onCheckedChange={setLocalGuestCheckout} 
                className="data-[state=checked]:bg-brand"
              />
            </div>

            {/* Currency settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-xl border gap-4">
              <div className="flex-1">
                <p className="font-bold text-foreground">
                  {locale === 'ar' ? 'العملة الافتراضية للمنصة' : 'Default Platform Currency'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[90%]">
                  {locale === 'ar' 
                    ? 'العملة الرسمية المستخدمة في عرض الإحصائيات وتقارير الإدارة والمبيعات الإجمالية.' 
                    : 'The official currency used to display stats, reports, and aggregates in the admin panel.'}
                </p>
              </div>
              <div className="w-full sm:w-48 shrink-0">
                <select
                  value={localCurrency}
                  onChange={(e) => setLocalCurrency(e.target.value)}
                  className="w-full bg-surface text-foreground text-sm font-bold border border-border/80 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand focus:outline-none cursor-pointer"
                >
                  <option value="DZD">{locale === 'ar' ? 'د.ج (الدينار الجزائري)' : 'DZD (Algerian Dinar)'}</option>
                  <option value="SAR">{locale === 'ar' ? 'ر.س (الريال السعودي)' : 'SAR (Saudi Riyal)'}</option>
                  <option value="USD">{locale === 'ar' ? '$ (الدولار الأمريكي)' : 'USD (US Dollar)'}</option>
                  <option value="EUR">{locale === 'ar' ? '€ (اليورو)' : 'EUR (Euro)'}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations Settings */}
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              {locale === 'ar' ? 'الربط والخدمات الخارجية' : 'Integrations'}
            </CardTitle>
            <CardDescription>
              {locale === 'ar' 
                ? 'إعدادات ربط المنصة مع خدمات الطرف الثالث مثل خرائط جوجل' 
                : 'Configure platform integration with third-party services like Google Maps'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
              <div>
                <p className="font-bold text-foreground">
                  {locale === 'ar' ? 'تفعيل خرائط جوجل (تحديد الموقع الدقيق)' : 'Enable Google Maps Location'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[80%]">
                  {locale === 'ar' 
                    ? 'يسمح للمشترين بتحديد موقعهم على الخريطة لتسهيل التوصيل.' 
                    : 'Allows buyers to pin their exact location on the map for delivery.'}
                </p>
              </div>
              <Switch 
                checked={localMapsEnabled} 
                onCheckedChange={setLocalMapsEnabled} 
                className="data-[state=checked]:bg-brand"
              />
            </div>

            <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
              <div>
                <p className="font-bold text-foreground">
                  {locale === 'ar' ? 'مفتاح واجهة برمجة خرائط جوجل (API Key)' : 'Google Maps API Key'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === 'ar' 
                    ? 'أدخل مفتاح الـ API الخاص بخرائط جوجل. في حال تركه فارغاً، ستستخدم المنصة واجهة محاكاة للتجربة.' 
                    : 'Enter your Google Maps API Key. If empty, the platform will use a simulated map.'}
                </p>
              </div>
              <input
                type="text"
                dir="ltr"
                placeholder="AIzaSy..."
                value={localMapsKey}
                onChange={(e) => setLocalMapsKey(e.target.value)}
                className="w-full bg-surface text-foreground text-sm font-bold border border-border/80 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gradient-brand text-navy font-bold gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
