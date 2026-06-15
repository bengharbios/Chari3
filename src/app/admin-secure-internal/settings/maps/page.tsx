'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, MapPin, Save } from 'lucide-react';

export default function MapsSettingsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    map_enabled: 'false',
    map_provider: 'osm',
    map_default_lat: '25.2048',
    map_default_lng: '55.2708',
    map_default_zoom: '12',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/maps');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('admin.settingsSaved', 'Settings saved successfully'));
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black font-cairo">إعدادات الخرائط (OpenStreetMap)</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            التحكم في إظهار الخرائط للمشترين والموقع الافتراضي للبدء.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 font-bold px-6">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t('common.save', 'Save')}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand" />
              تفعيل خرائط التوصيل
            </CardTitle>
            <CardDescription>
              عند التفعيل سيتمكن المشتري من استخدام الخريطة لتحديد موقع التوصيل بدقة وجلب عنوان الشارع تلقائياً. الخرائط مجانية 100%.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between border p-4 rounded-xl">
              <div>
                <Label className="font-bold text-base">تمكين الخرائط</Label>
                <p className="text-sm text-muted-foreground">السماح بتحديد المواقع عبر الخريطة</p>
              </div>
              <Switch 
                checked={settings.map_enabled === 'true'}
                onCheckedChange={(c) => setSettings({ ...settings, map_enabled: String(c) })}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-base">مزود الخرائط (Map Provider)</Label>
              <p className="text-sm text-muted-foreground mb-2">اختر نظام الخرائط الذي تفضله للمتجر.</p>
              <select
                value={settings.map_provider || 'osm'}
                onChange={(e) => setSettings({ ...settings, map_provider: e.target.value })}
                className="w-full border p-2 rounded-md bg-background focus:ring-1 focus:ring-brand outline-none"
              >
                <option value="osm">OpenStreetMap (مجاني 100٪)</option>
                <option value="google">Google Maps (دقة فائقة - يتطلب مفتاح API في الإعدادات العامة)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>خط العرض الافتراضي (Latitude)</Label>
                <Input 
                  value={settings.map_default_lat}
                  onChange={e => setSettings({ ...settings, map_default_lat: e.target.value })}
                  placeholder="25.2048"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>خط الطول الافتراضي (Longitude)</Label>
                <Input 
                  value={settings.map_default_lng}
                  onChange={e => setSettings({ ...settings, map_default_lng: e.target.value })}
                  placeholder="55.2708"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>مستوى التكبير الافتراضي (Zoom Level)</Label>
                <Input 
                  type="number"
                  value={settings.map_default_zoom}
                  onChange={e => setSettings({ ...settings, map_default_zoom: e.target.value })}
                  placeholder="12"
                  min="1" max="20"
                  dir="ltr"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
