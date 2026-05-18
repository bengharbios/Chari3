'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Paintbrush, DollarSign, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const { adminUser, isAdminAuthenticated } = useAdminAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({
    site_name: 'شاري داي',
    site_logo: '',
    primary_color: '#FFD700',
    commission_rate: '10',
    min_withdrawal: '1000',
    enable_registration: true,
  });

  useEffect(() => {
    setIsMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          adminId: adminUser?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('تم حفظ الإعدادات بنجاح!');
      } else {
        alert('فشل حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">إعدادات النظام</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">تحكم في هوية وعمليات المنصة دون الحاجة لتعديل الكود.</p>
        </div>
        
        <Button onClick={handleSave} className="bg-brand text-navy hover:bg-brand/90 font-bold gap-2" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ كل التغييرات
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <TabsTrigger value="branding" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 gap-2">
              <Paintbrush className="h-4 w-4" />
              الهوية والألوان
            </TabsTrigger>
            <TabsTrigger value="financials" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 gap-2">
              <DollarSign className="h-4 w-4" />
              الماليات والعمولات
            </TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 gap-2">
              <ShieldCheck className="h-4 w-4" />
              التشغيل والأمان
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الهوية والشعار</CardTitle>
                <CardDescription>تحكم في المظهر العام للمنصة.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">اسم المنصة</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site_logo">رابط الشعار (Logo URL)</Label>
                  <Input
                    id="site_logo"
                    placeholder="https://example.com/logo.png"
                    value={settings.site_logo}
                    onChange={(e) => setSettings({ ...settings, site_logo: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_color">اللون الأساسي للمنصة</Label>
                  <div className="flex gap-3">
                    <Input
                      id="primary_color"
                      type="color"
                      className="w-16 h-10 p-1 cursor-pointer"
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>الماليات والعمولات</CardTitle>
                <CardDescription>تحديد النسب المئوية والحدود المالية.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">نسبة عمولة المنصة الافتراضية (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    value={settings.commission_rate}
                    onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min_withdrawal">الحد الأدنى لطلب السحب (دج)</Label>
                  <Input
                    id="min_withdrawal"
                    type="number"
                    value={settings.min_withdrawal}
                    onChange={(e) => setSettings({ ...settings, min_withdrawal: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations">
            <Card>
              <CardHeader>
                <CardTitle>التشغيل والأمان</CardTitle>
                <CardDescription>التحكم في ميزات المنصة التشغيلية.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable_registration">تفعيل تسجيل التجار الجدد</Label>
                    <p className="text-xs text-slate-500">إذا تم إيقافه، لن يتمكن أي تاجر جديد من إنشاء حساب.</p>
                  </div>
                  <Switch
                    id="enable_registration"
                    checked={settings.enable_registration}
                    onCheckedChange={(checked) => setSettings({ ...settings, enable_registration: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
