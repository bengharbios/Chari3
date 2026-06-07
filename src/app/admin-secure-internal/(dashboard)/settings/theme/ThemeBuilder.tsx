'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Plus, Trash2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeSettings, defaultSellerTheme } from '@/lib/theme-defaults';

export default function ThemeBuilder() {
  const { adminLocale, adminUser } = useAdminAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState<'seller' | 'buyer' | 'admin' | 'storefront'>('seller');
  
  const [themes, setThemes] = useState<Record<string, ThemeSettings>>({
    seller: defaultSellerTheme,
    buyer: defaultSellerTheme,
    admin: defaultSellerTheme,
    storefront: defaultSellerTheme,
  });

  const isRTL = adminLocale === 'ar';
  const t = {
    title: isRTL ? 'إدارة القوالب والتصميم' : 'Theme & Design Management',
    save: isRTL ? 'حفظ التغييرات' : 'Save Changes',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    success: isRTL ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully',
    error: isRTL ? 'حدث خطأ أثناء الحفظ' : 'Error saving changes',
    tabs: {
      seller: isRTL ? 'لوحة التاجر' : 'Seller Dashboard',
      buyer: isRTL ? 'لوحة المشتري' : 'Buyer Dashboard',
      admin: isRTL ? 'لوحة الإدارة' : 'Admin Dashboard',
      storefront: isRTL ? 'واجهة المتجر' : 'Storefront',
    },
    sections: {
      colors: isRTL ? 'الألوان الأساسية' : 'Primary Colors',
      typography: isRTL ? 'الخطوط' : 'Typography',
      footer: isRTL ? 'إعدادات الفوتر' : 'Footer Settings',
      css: isRTL ? 'CSS مخصص' : 'Custom CSS',
    },
    colorLabels: {
      sidebarBackground: isRTL ? 'خلفية القائمة الجانبية' : 'Sidebar Background',
      sidebarText: isRTL ? 'نص القائمة الجانبية' : 'Sidebar Text',
      headerBackground: isRTL ? 'خلفية الهيدر' : 'Header Background',
      headerText: isRTL ? 'نص الهيدر' : 'Header Text',
      mainBackground: isRTL ? 'خلفية المحتوى' : 'Main Background',
      mainText: isRTL ? 'نص المحتوى' : 'Main Text',
      primaryColor: isRTL ? 'اللون الأساسي (Primary)' : 'Primary Color',
      footerBackground: isRTL ? 'خلفية الفوتر' : 'Footer Background',
      footerText: isRTL ? 'نص الفوتر' : 'Footer Text',
      lightMode: isRTL ? 'الوضع النهاري' : 'Light Mode',
      darkMode: isRTL ? 'الوضع الليلي' : 'Dark Mode',
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/admin/settings');

      const data = await res.json();
      if (data.success && data.settings) {
        const newThemes = { ...themes };
        if (data.settings.theme_seller_dashboard) newThemes.seller = JSON.parse(data.settings.theme_seller_dashboard);
        if (data.settings.theme_buyer_dashboard) newThemes.buyer = JSON.parse(data.settings.theme_buyer_dashboard);
        if (data.settings.theme_admin_dashboard) newThemes.admin = JSON.parse(data.settings.theme_admin_dashboard);
        if (data.settings.theme_storefront) newThemes.storefront = JSON.parse(data.settings.theme_storefront);
        setThemes(newThemes);
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        settings: {
          theme_seller_dashboard: JSON.stringify(themes.seller),
          theme_buyer_dashboard: JSON.stringify(themes.buyer),
          theme_admin_dashboard: JSON.stringify(themes.admin),
          theme_storefront: JSON.stringify(themes.storefront),
        },
        adminId: adminUser?.id

      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });


      const data = await res.json();
      if (data.success) {
        toast.success(t.success);
      } else {
        toast.error(t.error);
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorChange = (key: keyof ThemeSettings['colors'], mode: 'light' | 'dark', value: string) => {
    setThemes(prev => ({
      ...prev,
      [currentTab]: {
        ...prev[currentTab],
        colors: {
          ...prev[currentTab].colors,
          [key]: {
            ...prev[currentTab].colors[key],
            [mode]: value
          }
        }
      }
    }));
  };

  const theme = themes[currentTab];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-brand" />
          {t.title}
        </h1>
        <Button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand/90 text-navy">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
          {isSaving ? t.saving : t.save}
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={(val) => setCurrentTab(val as any)} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="seller">{t.tabs.seller}</TabsTrigger>
          <TabsTrigger value="buyer">{t.tabs.buyer}</TabsTrigger>
          <TabsTrigger value="admin">{t.tabs.admin}</TabsTrigger>
          <TabsTrigger value="storefront">{t.tabs.storefront}</TabsTrigger>
        </TabsList>

        <div className="space-y-8 bg-white p-6 rounded-xl border border-slate-200">
          
          {/* Colors Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">{t.sections.colors}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(theme.colors).map(([key, value]) => {
                const colorKey = key as keyof ThemeSettings['colors'];
                return (
                  <div key={key} className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <Label className="font-semibold text-sm">
                      {t.colorLabels[colorKey] || key}
                    </Label>
                    <div className="flex gap-4">
                      {/* Light Mode Color */}
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-slate-500">{t.colorLabels.lightMode}</Label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={value.light} 
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                          />
                          <Input 
                            value={value.light}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                      {/* Dark Mode Color */}
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-slate-500">{t.colorLabels.darkMode}</Label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={value.dark} 
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                          />
                          <Input 
                            value={value.dark}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Typography Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
              <Palette className="h-5 w-5 text-slate-500" />
              {t.sections.typography}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <Label className="font-semibold text-sm block mb-1">الخط الأساسي (Font Family)</Label>
                <p className="text-xs text-muted-foreground mb-3">اختر من خطوط جوجل المدعومة أو أدخل اسم خط مخصص</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={theme.typography.fontFamily.split(',')[0].replace(/['"]/g, '')}
                    onChange={(e) => {
                      const font = e.target.value;
                      const value = font ? `"${font}", sans-serif` : '';
                      setThemes({...themes, [currentTab]: {...theme, typography: {...theme.typography, fontFamily: value}}});
                    }}
                  >
                    <option value="">-- اختر خطاً --</option>
                    <optgroup label="خطوط عربية (Arabic)">
                      <option value="Cairo">Cairo</option>
                      <option value="Tajawal">Tajawal</option>
                      <option value="Almarai">Almarai</option>
                      <option value="Changa">Changa</option>
                      <option value="El Messiri">El Messiri</option>
                      <option value="Amiri">Amiri</option>
                      <option value="Readex Pro">Readex Pro</option>
                      <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                    </optgroup>
                    <optgroup label="خطوط لاتينية (Latin)">
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Oswald">Oswald</option>
                      <option value="Raleway">Raleway</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Rubik">Rubik</option>
                      <option value="DM Sans">DM Sans</option>
                      <option value="Playfair Display">Playfair Display</option>
                    </optgroup>
                  </select>
                  
                  <Input 
                    value={theme.typography.fontFamily} 
                    onChange={(e) => setThemes({...themes, [currentTab]: {...theme, typography: {...theme.typography, fontFamily: e.target.value}}})}
                    placeholder="e.g. 'Cairo', sans-serif"
                    className="w-full font-mono text-xs"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 flex justify-between items-center">
              {t.sections.footer}
              <div className="flex items-center gap-2 text-sm font-normal">
                <Switch 
                  checked={theme.footer.enabled} 
                  onCheckedChange={(c) => setThemes({...themes, [currentTab]: {...theme, footer: {...theme.footer, enabled: c}}})}
                />
                <Label>تفعيل الفوتر</Label>
              </div>
            </h2>
            
            {theme.footer.enabled && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border rounded-lg">
                  <h3 className="font-semibold mb-2">أعمدة الفوتر (Footer Columns)</h3>
                  {theme.footer.columns.map((col, idx) => (
                    <div key={col.id} className="mb-4 p-4 border bg-white rounded-lg">
                      <div className="flex gap-2 mb-2">
                        <Input 
                          placeholder="مفتاح الترجمة (Translation Key)" 
                          value={col.titleKey}
                          onChange={(e) => {
                            const newCols = [...theme.footer.columns];
                            newCols[idx].titleKey = e.target.value;
                            setThemes({...themes, [currentTab]: {...theme, footer: {...theme.footer, columns: newCols}}});
                          }}
                        />
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Sub-links logic could be expanded here */}
                      <p className="text-xs text-muted-foreground">يحتوي على {col.links.length} رابط. (بناء الروابط سيتم في المرحلة القادمة)</p>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full border-dashed">
                    <Plus className="h-4 w-4 me-2" /> إضافة عمود جديد
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Custom CSS Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">{t.sections.css}</h2>
            <textarea
              className="w-full h-48 p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-lg outline-none"
              placeholder="/* Add your custom CSS here */&#10;body {&#10;  /* overrides */&#10;}"
              value={theme.customCss}
              onChange={(e) => setThemes({...themes, [currentTab]: {...theme, customCss: e.target.value}})}
              dir="ltr"
            />
          </div>

        </div>
      </Tabs>
    </div>
  );
}
