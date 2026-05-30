'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { Loader2, Save, ArrowRight, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const { isAdminAuthenticated, adminUser } = useAdminAuthStore();
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [isMounted, setIsMounted] = useState(false);
  
  const [settings, setSettings] = useState({
    upload_max_size_mb: '5',
    upload_recommended_width: '800',
    upload_recommended_height: '800',
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
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings((prev) => ({
            ...prev,
            upload_max_size_mb: data.settings.upload_max_size_mb || '5',
            upload_recommended_width: data.settings.upload_recommended_width || '800',
            upload_recommended_height: data.settings.upload_recommended_height || '800',
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
        toast.success(locale === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
      } else {
        throw new Error(data.error);
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
    <div dir={dir} className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin-secure-internal">
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
        </div>
      )}
    </div>
  );
}
