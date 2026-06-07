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
  const { adminLocale, token, admin } = useAdminAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<ThemeSettings>(defaultSellerTheme);

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
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.settings.theme_seller_dashboard) {
        setTheme(JSON.parse(data.settings.theme_seller_dashboard));
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
          theme_seller_dashboard: JSON.stringify(theme)
        },
        adminId: admin?.id
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: {
          ...prev.colors[key],
          [mode]: value
        }
      }
    }));
  };

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

      <Tabs defaultValue="seller" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="seller">{t.tabs.seller}</TabsTrigger>
          <TabsTrigger value="buyer">{t.tabs.buyer}</TabsTrigger>
          <TabsTrigger value="admin">{t.tabs.admin}</TabsTrigger>
          <TabsTrigger value="storefront">{t.tabs.storefront}</TabsTrigger>
        </TabsList>

        <TabsContent value="seller" className="space-y-8 bg-white p-6 rounded-xl border border-slate-200">
          
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
            <h2 className="text-lg font-bold border-b pb-2">{t.sections.typography}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Input 
                  value={theme.typography.fontFamily} 
                  onChange={(e) => setTheme({...theme, typography: {...theme.typography, fontFamily: e.target.value}})}
                  placeholder="e.g. Cairo, sans-serif"
                />
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
                  onCheckedChange={(c) => setTheme({...theme, footer: {...theme.footer, enabled: c}})}
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
                            setTheme({...theme, footer: {...theme.footer, columns: newCols}});
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
              onChange={(e) => setTheme({...theme, customCss: e.target.value})}
              dir="ltr"
            />
          </div>

        </TabsContent>
        
        {/* Placeholder for other tabs */}
        <TabsContent value="buyer" className="p-12 text-center text-slate-500 border rounded-xl bg-slate-50">
          سيتم توفير واجهة تخصيص المشتري لاحقاً
        </TabsContent>
        <TabsContent value="admin" className="p-12 text-center text-slate-500 border rounded-xl bg-slate-50">
          سيتم توفير واجهة تخصيص الإدارة لاحقاً
        </TabsContent>
        <TabsContent value="storefront" className="p-12 text-center text-slate-500 border rounded-xl bg-slate-50">
          سيتم توفير واجهة تخصيص المتجر لاحقاً
        </TabsContent>
      </Tabs>
    </div>
  );
}
