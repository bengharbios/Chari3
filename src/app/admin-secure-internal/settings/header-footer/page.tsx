'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTranslationStore } from '@/lib/store/translation-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, Loader2, Plus, Trash, PanelTop, PanelBottom, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_CONFIG = {
  header: {
    topBarLink: '',
    topBarBgColor: '#0f172a',
    topBarTextColor: '#ffffff',
    logoUrl: '',
    primaryColor: '#3b82f6',
  },
  footer: {
    columns: [],
    socialLinks: { facebook: '', instagram: '', twitter: '', tiktok: '' },
  }
};

export default function HeaderFooterSettingsPage() {
  const { t, isAr } = useTranslation();
  const { languages } = useTranslationStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(DEFAULT_CONFIG);

  const activeLangs = languages?.length > 0 ? languages : [
    { code: 'ar', name: t('common.arabic', 'العربية') },
    { code: 'en', name: t('common.english', 'English') },
    { code: 'fr', name: t('common.french', 'Français') }
  ];

  // Helper to get suffix like Ar, En, Fr
  const getSuffix = (code: string) => code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();

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
  }, [t]);

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
        columns: [...(prev.footer.columns || []), { id: Math.random().toString(), links: [] }]
      }
    }));
  };

  const updateFooterColumn = (idx: number, key: string, value: string) => {
    setConfig((prev: any) => {
      const cols = [...(prev.footer.columns || [])];
      cols[idx] = { ...cols[idx], [key]: value };
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  };

  const addFooterLink = (colIdx: number) => {
    setConfig((prev: any) => {
      const cols = [...(prev.footer.columns || [])];
      cols[colIdx].links = [...(cols[colIdx].links || []), { id: Math.random().toString(), url: '' }];
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  };

  const updateFooterLink = (colIdx: number, linkIdx: number, key: string, value: string) => {
    setConfig((prev: any) => {
      const cols = [...(prev.footer.columns || [])];
      const links = [...cols[colIdx].links];
      links[linkIdx] = { ...links[linkIdx], [key]: value };
      cols[colIdx].links = links;
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  };

  const removeFooterLink = (colIdx: number, linkIdx: number) => {
    setConfig((prev: any) => {
      const cols = [...(prev.footer.columns || [])];
      const links = [...cols[colIdx].links];
      links.splice(linkIdx, 1);
      cols[colIdx].links = links;
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  };

  const removeFooterColumn = (idx: number) => {
    setConfig((prev: any) => {
      const cols = [...(prev.footer.columns || [])];
      cols.splice(idx, 1);
      return { ...prev, footer: { ...prev.footer, columns: cols } };
    });
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;
  }

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('headerFooterSettings.title', 'إعدادات الهيدر والفوتر')}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">
              {t('headerFooterSettings.subtitle', 'تحكم في تصميم وروابط الهيدر والفوتر الخاص بالمنصة')}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg" className="bg-brand hover:bg-brand/90 shadow-md">
          {saving ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Save className="w-5 h-5 ml-2" />}
          {t('common.save', 'حفظ التعديلات')}
        </Button>
      </div>

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
          <TabsTrigger value="header" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <PanelTop className="w-4 h-4 ml-2" />
            {t('headerFooterSettings.headerTab', 'إعدادات الهيدر (Header)')}
          </TabsTrigger>
          <TabsTrigger value="footer" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <PanelBottom className="w-4 h-4 ml-2" />
            {t('headerFooterSettings.footerTab', 'إعدادات الفوتر (Footer)')}
          </TabsTrigger>
        </TabsList>

        {/* HEADER TAB */}
        <TabsContent value="header" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-6">
              <CardTitle className="text-lg">{t('headerFooterSettings.topBar', 'الشريط العلوي الترويجي')}</CardTitle>
              <CardDescription>{t('headerFooterSettings.topBarDesc', 'شريط صغير يظهر أعلى الموقع للإعلانات والخصومات')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLangs.map((lang: any) => {
                  const suffix = getSuffix(lang.code);
                  const key = `topBarText${suffix}`;
                  return (
                    <div key={lang.code} className="space-y-2">
                      <Label className="text-slate-600 dark:text-slate-400 font-medium">نص الشريط ({lang.name})</Label>
                      <Input 
                        value={config.header[key] || ''} 
                        onChange={(e) => updateHeader(key, e.target.value)} 
                        className="bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 max-w-xl">
                <Label className="text-slate-600 dark:text-slate-400 font-medium">{t('headerFooterSettings.topBarLink', 'رابط الشريط الترويجي (اختياري)')}</Label>
                <Input value={config.header.topBarLink} onChange={(e) => updateHeader('topBarLink', e.target.value)} placeholder="https://..." dir="ltr" className="font-mono bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-slate-400 font-medium">{t('headerFooterSettings.topBarBgColor', 'لون الخلفية')}</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={config.header.topBarBgColor} onChange={(e) => updateHeader('topBarBgColor', e.target.value)} className="w-14 p-1 h-10 cursor-pointer" />
                    <Input value={config.header.topBarBgColor} onChange={(e) => updateHeader('topBarBgColor', e.target.value)} dir="ltr" className="font-mono uppercase bg-slate-50 dark:bg-slate-900" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-slate-400 font-medium">{t('headerFooterSettings.topBarTextColor', 'لون النص')}</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={config.header.topBarTextColor} onChange={(e) => updateHeader('topBarTextColor', e.target.value)} className="w-14 p-1 h-10 cursor-pointer" />
                    <Input value={config.header.topBarTextColor} onChange={(e) => updateHeader('topBarTextColor', e.target.value)} dir="ltr" className="font-mono uppercase bg-slate-50 dark:bg-slate-900" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-6">
              <CardTitle className="text-lg">{t('headerFooterSettings.logo', 'الشعار (Logo)')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="max-w-md">
                <ImageUploader 
                  value={config.header.logoUrl ? [config.header.logoUrl] : []}
                  onChange={(urls) => updateHeader('logoUrl', urls[0] || '')}
                  maxFiles={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER TAB */}
        <TabsContent value="footer" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-6">
              <CardTitle className="text-lg">{t('headerFooterSettings.footerAbout', 'نص تعريفي للفوتر')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLangs.map((lang: any) => {
                  const suffix = getSuffix(lang.code);
                  const key = `aboutText${suffix}`;
                  return (
                    <div key={lang.code} className="space-y-2">
                      <Label className="text-slate-600 dark:text-slate-400 font-medium">النص ({lang.name})</Label>
                      <Textarea 
                        rows={4}
                        value={config.footer[key] || ''} 
                        onChange={(e) => updateFooter(key, e.target.value)} 
                        className="bg-slate-50 dark:bg-slate-900 resize-none"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-6">
              <CardTitle className="text-lg">{t('headerFooterSettings.socials', 'التواصل الاجتماعي')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {['facebook', 'instagram', 'twitter', 'tiktok'].map(network => (
                  <div key={network} className="space-y-2">
                    <Label className="capitalize text-slate-600 dark:text-slate-400 font-medium">{network}</Label>
                    <Input 
                      value={config.footer.socialLinks?.[network] || ''} 
                      onChange={(e) => updateFooter('socialLinks', { ...config.footer.socialLinks, [network]: e.target.value })} 
                      placeholder={`https://${network}.com/...`}
                      dir="ltr"
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('headerFooterSettings.footerColumns', 'أعمدة روابط الفوتر')}</CardTitle>
                <CardDescription className="mt-1">{t('headerFooterSettings.footerColumnsDesc', 'أضف أعمدة تحتوي على روابط تهم الزائر')}</CardDescription>
              </div>
              <Button onClick={addFooterColumn} variant="outline" size="sm" className="bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800">
                <Plus className="w-4 h-4 ml-2" />
                إضافة عمود جديد
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {config.footer.columns?.length === 0 && (
                <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  لا توجد أعمدة حتى الآن
                </div>
              )}
              {config.footer.columns?.map((col: any, cIdx: number) => (
                <div key={col.id} className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-sm relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFooterColumn(cIdx)}
                    className="absolute top-4 left-4 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                  
                  <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 block">عنوان العمود</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {activeLangs.map((lang: any) => {
                        const suffix = getSuffix(lang.code);
                        const key = `title${suffix}`;
                        return (
                          <Input 
                            key={`title-${lang.code}`}
                            value={col[key] || ''}
                            onChange={(e) => updateFooterColumn(cIdx, key, e.target.value)}
                            placeholder={`العنوان (${lang.name})`}
                            className="bg-slate-50 dark:bg-slate-900"
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">الروابط</Label>
                      <Button onClick={() => addFooterLink(cIdx)} variant="ghost" size="sm" className="h-8 text-brand hover:text-brand hover:bg-brand/10">
                        <Plus className="w-3 h-3 ml-1" /> إضافة رابط
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {col.links?.map((link: any, lIdx: number) => (
                        <div key={link.id} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                            {activeLangs.map((lang: any) => {
                              const suffix = getSuffix(lang.code);
                              const key = `text${suffix}`;
                              return (
                                <Input 
                                  key={`link-${lang.code}`}
                                  value={link[key] || ''}
                                  onChange={(e) => updateFooterLink(cIdx, lIdx, key, e.target.value)}
                                  placeholder={`نص الرابط (${lang.name})`}
                                  className="h-9 text-sm bg-white dark:bg-slate-950"
                                />
                              );
                            })}
                          </div>
                          <Input 
                            value={link.url}
                            onChange={(e) => updateFooterLink(cIdx, lIdx, 'url', e.target.value)}
                            placeholder="/about-us"
                            dir="ltr"
                            className="flex-1 font-mono text-sm h-9 bg-white dark:bg-slate-950"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeFooterLink(cIdx, lIdx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 h-9 w-9">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-6">
              <CardTitle className="text-lg">حقوق الملكية (Copyright)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLangs.map((lang: any) => {
                  const suffix = getSuffix(lang.code);
                  const key = `copyrightText${suffix}`;
                  return (
                    <div key={lang.code} className="space-y-2">
                      <Label className="text-slate-600 dark:text-slate-400 font-medium">النص ({lang.name})</Label>
                      <Input 
                        value={config.footer[key] || ''} 
                        onChange={(e) => updateFooter(key, e.target.value)} 
                        className="bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
