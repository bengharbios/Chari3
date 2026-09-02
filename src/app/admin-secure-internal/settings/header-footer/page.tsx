'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, Loader2, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_CONFIG = {
  header: {
    topBarTextAr: '',
    topBarTextEn: '',
    topBarLink: '',
    topBarBgColor: '#0f172a',
    topBarTextColor: '#ffffff',
    logoUrl: '',
    primaryColor: '#3b82f6',
  },
  footer: {
    aboutTextAr: '',
    aboutTextEn: '',
    columns: [
      { id: '1', titleAr: 'روابط سريعة', titleEn: 'Quick Links', links: [] }
    ],
    socialLinks: { facebook: '', instagram: '', twitter: '', tiktok: '' },
    copyrightTextAr: 'جميع الحقوق محفوظة',
    copyrightTextEn: 'All rights reserved',
  }
};

export default function HeaderFooterSettingsPage() {
  const { t, isAr } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(DEFAULT_CONFIG);

  useEffect(() => {
    fetch('/api/admin/platform-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.headerFooterConfig) {
          try {
            const parsed = JSON.parse(data.data.headerFooterConfig);
            setConfig({
              header: { ...DEFAULT_CONFIG.header, ...(parsed.header || {}) },
              footer: { ...DEFAULT_CONFIG.footer, ...(parsed.footer || {}) }
            });
          } catch(e) {
            console.error('Failed to parse config');
          }
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error(t('settings.fetchError', 'Failed to fetch settings'));
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/platform-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headerFooterConfig: config })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('settings.saveSuccess', 'Settings saved successfully!'));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t('settings.saveError', 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const updateHeader = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, header: { ...prev.header, [key]: value } }));
  };

  const updateFooter = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, footer: { ...prev.footer, [key]: value } }));
  };

  const addFooterColumn = () => {
    setConfig((prev: any) => ({
      ...prev,
      footer: {
        ...prev.footer,
        columns: [...prev.footer.columns, { id: Math.random().toString(), titleAr: '', titleEn: '', links: [] }]
      }
    }));
  };

  const updateFooterColumn = (idx: number, key: string, value: string) => {
    setConfig((prev: any) => {
      const cols = [...prev.footer.columns];
      cols[idx] = { ...cols[idx], [key]: value };
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  };

  const addFooterLink = (colIdx: number) => {
    setConfig((prev: any) => {
      const cols = [...prev.footer.columns];
      cols[colIdx].links = [...cols[colIdx].links, { id: Math.random().toString(), textAr: '', textEn: '', url: '' }];
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  };

  const updateFooterLink = (colIdx: number, linkIdx: number, key: string, value: string) => {
    setConfig((prev: any) => {
      const cols = [...prev.footer.columns];
      const links = [...cols[colIdx].links];
      links[linkIdx] = { ...links[linkIdx], [key]: value };
      cols[colIdx].links = links;
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  };

  const removeFooterLink = (colIdx: number, linkIdx: number) => {
    setConfig((prev: any) => {
      const cols = [...prev.footer.columns];
      const links = [...cols[colIdx].links];
      links.splice(linkIdx, 1);
      cols[colIdx].links = links;
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  };

  const removeFooterColumn = (idx: number) => {
    setConfig((prev: any) => {
      const cols = [...prev.footer.columns];
      cols.splice(idx, 1);
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('headerFooterSettings.title', 'إعدادات الهيدر والفوتر', 'Header & Footer Settings')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('headerFooterSettings.subtitle', 'تحكم في تصميم وروابط الهيدر والفوتر الخاص بالمنصة', 'Manage the design and links of the platform header and footer')}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-brand hover:bg-brand/90">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {t('common.save', 'حفظ التعديلات', 'Save Changes')}
        </Button>
      </div>

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="header">{t('headerFooterSettings.headerTab', 'إعدادات الهيدر (Header)', 'Header Settings')}</TabsTrigger>
          <TabsTrigger value="footer">{t('headerFooterSettings.footerTab', 'إعدادات الفوتر (Footer)', 'Footer Settings')}</TabsTrigger>
        </TabsList>

        {/* HEADER TAB */}
        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('headerFooterSettings.topBar', 'الشريط العلوي الترويجي', 'Top Promo Bar')}</CardTitle>
              <CardDescription>{t('headerFooterSettings.topBarDesc', 'شريط صغير يظهر أعلى الموقع للإعلانات والخصومات', 'Small bar at the top of the site for announcements and discounts')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('headerFooterSettings.topBarTextAr', 'نص الشريط (عربي)', 'Top Bar Text (Arabic)')}</Label>
                  <Input value={config.header.topBarTextAr} onChange={(e) => updateHeader('topBarTextAr', e.target.value)} placeholder="مثال: شحن مجاني للطلبات فوق 50$" />
                </div>
                <div className="space-y-2">
                  <Label>{t('headerFooterSettings.topBarTextEn', 'نص الشريط (إنجليزي)', 'Top Bar Text (English)')}</Label>
                  <Input value={config.header.topBarTextEn} onChange={(e) => updateHeader('topBarTextEn', e.target.value)} placeholder="e.g. Free shipping on orders over $50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('headerFooterSettings.topBarLink', 'رابط الشريط الترويجي (اختياري)', 'Top Bar Link (Optional)')}</Label>
                <Input value={config.header.topBarLink} onChange={(e) => updateHeader('topBarLink', e.target.value)} placeholder="https://..." dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('headerFooterSettings.topBarBgColor', 'لون الخلفية', 'Background Color')}</Label>
                  <Input type="color" value={config.header.topBarBgColor} onChange={(e) => updateHeader('topBarBgColor', e.target.value)} className="h-10 px-1 py-1" />
                </div>
                <div className="space-y-2">
                  <Label>{t('headerFooterSettings.topBarTextColor', 'لون النص', 'Text Color')}</Label>
                  <Input type="color" value={config.header.topBarTextColor} onChange={(e) => updateHeader('topBarTextColor', e.target.value)} className="h-10 px-1 py-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('headerFooterSettings.logo', 'الشعار (Logo)', 'Logo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <ImageUploader 
                  value={config.header.logoUrl} 
                  onChange={(url) => updateHeader('logoUrl', url)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER TAB */}
        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('headerFooterSettings.footerAbout', 'نص تعريفي للفوتر', 'Footer About Text')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.arabic', 'عربي', 'Arabic')}</Label>
                <Textarea value={config.footer.aboutTextAr} onChange={(e) => updateFooter('aboutTextAr', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.english', 'إنجليزي', 'English')}</Label>
                <Textarea value={config.footer.aboutTextEn} onChange={(e) => updateFooter('aboutTextEn', e.target.value)} rows={3} dir="ltr" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('headerFooterSettings.footerColumns', 'أعمدة روابط الفوتر', 'Footer Link Columns')}</CardTitle>
                <CardDescription>{t('headerFooterSettings.footerColumnsDesc', 'أضف أعمدة تحتوي على روابط تهم الزائر', 'Add columns containing useful links')}</CardDescription>
              </div>
              <Button onClick={addFooterColumn} variant="outline" size="sm"><Plus className="w-4 h-4 ml-2" /> إضافة عمود</Button>
            </CardHeader>
            <CardContent className="space-y-8">
              {config.footer.columns.map((col: any, colIdx: number) => (
                <div key={col.id || colIdx} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>عنوان العمود (عربي)</Label>
                      <Input value={col.titleAr} onChange={(e) => updateFooterColumn(colIdx, 'titleAr', e.target.value)} placeholder="مثال: روابط سريعة" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>عنوان العمود (إنجليزي)</Label>
                      <Input value={col.titleEn} onChange={(e) => updateFooterColumn(colIdx, 'titleEn', e.target.value)} placeholder="e.g. Quick Links" dir="ltr" />
                    </div>
                    <div className="pt-8">
                      <Button variant="ghost" size="icon" onClick={() => removeFooterColumn(colIdx)} className="text-red-500"><Trash className="w-5 h-5" /></Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-brand font-semibold">الروابط داخل هذا العمود:</Label>
                    {col.links.map((link: any, linkIdx: number) => (
                      <div key={link.id || linkIdx} className="flex gap-2 items-center bg-white dark:bg-slate-800 p-2 rounded border">
                        <Input value={link.textAr} onChange={(e) => updateFooterLink(colIdx, linkIdx, 'textAr', e.target.value)} placeholder="النص (عربي)" className="flex-1 h-8" />
                        <Input value={link.textEn} onChange={(e) => updateFooterLink(colIdx, linkIdx, 'textEn', e.target.value)} placeholder="النص (إنجليزي)" className="flex-1 h-8" dir="ltr" />
                        <Input value={link.url} onChange={(e) => updateFooterLink(colIdx, linkIdx, 'url', e.target.value)} placeholder="الرابط /url" className="flex-1 h-8" dir="ltr" />
                        <Button variant="ghost" size="icon" onClick={() => removeFooterLink(colIdx, linkIdx)} className="h-8 w-8 text-red-500"><Trash className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    <Button onClick={() => addFooterLink(colIdx)} variant="ghost" size="sm" className="w-full border border-dashed"><Plus className="w-4 h-4 ml-2" /> إضافة رابط جديد</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('headerFooterSettings.socials', 'التواصل الاجتماعي', 'Social Media')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input value={config.footer.socialLinks?.facebook || ''} onChange={(e) => setConfig((p: any) => ({ ...p, footer: { ...p.footer, socialLinks: { ...p.footer.socialLinks, facebook: e.target.value } } }))} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input value={config.footer.socialLinks?.instagram || ''} onChange={(e) => setConfig((p: any) => ({ ...p, footer: { ...p.footer, socialLinks: { ...p.footer.socialLinks, instagram: e.target.value } } }))} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>Twitter (X) URL</Label>
                <Input value={config.footer.socialLinks?.twitter || ''} onChange={(e) => setConfig((p: any) => ({ ...p, footer: { ...p.footer, socialLinks: { ...p.footer.socialLinks, twitter: e.target.value } } }))} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>TikTok URL</Label>
                <Input value={config.footer.socialLinks?.tiktok || ''} onChange={(e) => setConfig((p: any) => ({ ...p, footer: { ...p.footer, socialLinks: { ...p.footer.socialLinks, tiktok: e.target.value } } }))} dir="ltr" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
