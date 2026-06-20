'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  Loader2, Save, Plug, Search, Puzzle, CheckCircle2, XCircle, Settings, BookOpen, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function PluginsManagerPage() {
  const { isAdminAuthenticated } = useAdminAuthStore();
  const { locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchPlugins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/plugins');
      const data = await res.json();
      if (data.success) {
        setPlugins(data.plugins || []);
      }
    } catch (err) {
      toast.error(t(locale, 'فشل جلب الإضافات', 'Failed to fetch plugins'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted && isAdminAuthenticated) {
      fetchPlugins();
    }
  }, [isMounted, isAdminAuthenticated]);

  const togglePluginStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const res = await fetch('/api/admin/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setPlugins(prev => prev.map(p => p.id === id ? { ...p, isActive: newStatus } : p));
        toast.success(
          newStatus 
            ? t(locale, 'تم تفعيل الإضافة بنجاح', 'Plugin enabled successfully')
            : t(locale, 'تم تعطيل الإضافة', 'Plugin disabled')
        );
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'حدث خطأ', 'An error occurred'));
    }
  };

  const openConfigModal = (plugin: any) => {
    setSelectedPlugin(plugin);
    setConfigValues({}); // Start fresh to avoid security leaks, or we can fetch masked values
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedPlugin) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedPlugin.id, 
          configData: configValues 
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حفظ إعدادات الإضافة مشفرة بنجاح 🔒', 'Plugin config encrypted and saved 🔒'));
        setIsConfigModalOpen(false);
        fetchPlugins();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل الحفظ', 'Save failed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted || !isAdminAuthenticated) return null;

  const filteredPlugins = plugins.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div dir={dir} className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <Plug className="h-8 w-8 text-indigo-500" />
            {t(locale, 'متجر الإضافات (App Store)', 'Plugins Manager')}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            {t(locale, 'تحكم في تفعيل أو تعطيل الخدمات الخارجية (بوابات الدفع، شركات الشحن، خدمات الرسائل) المربوطة بنظامك.', 'Manage external services (gateways, shipping, SMS) plugged into your platform.')}
          </p>
        </div>
        <Link href="/admin-secure-internal/cms/docs">
          <Button variant="outline" className="gap-2 rounded-xl border-indigo-500/30 text-indigo-600 hover:bg-indigo-50">
            <BookOpen className="h-4 w-4" />
            {t(locale, 'دليل المطورين لبرمجة الإضافات', 'Developer SDK Guide')}
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-card border rounded-2xl p-2 shadow-sm">
        <div className="relative flex-1">
          <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(locale, 'ابحث عن اسم الإضافة...', 'Search plugins by name...')}
            className={`h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 ${locale === 'ar' ? 'pr-10' : 'pl-10'} text-base font-bold`}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : filteredPlugins.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-card">
          <Puzzle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground">
            {t(locale, 'لم يتم العثور على أي إضافات', 'No plugins found')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(locale, 'لا توجد إضافات تطابق بحثك أو لم يتم دمج أي إضافة في النظام.', 'No plugins match your search or none are installed.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <Card key={plugin.id} className={`border-border shadow-sm hover:shadow-md transition-all overflow-hidden ${!plugin.isActive ? 'opacity-70 grayscale-[30%]' : ''}`}>
              <div className={`h-2 w-full ${plugin.type === 'PAYMENT' ? 'bg-emerald-500' : plugin.type === 'SHIPPING' ? 'bg-amber-500' : 'bg-blue-500'}`} />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-lg text-foreground">{plugin.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] font-mono rounded-md bg-muted/30">v{plugin.version}</Badge>
                      <Badge variant="secondary" className="text-[10px] rounded-md">{plugin.type}</Badge>
                    </div>
                  </div>
                  <Switch 
                    checked={plugin.isActive}
                    onCheckedChange={() => togglePluginStatus(plugin.id, plugin.isActive)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-4">
                  {plugin.description || t(locale, 'لا يوجد وصف متاح.', 'No description available.')}
                </p>

                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                    {plugin.hasConfig ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {t(locale, 'الإعدادات محفوظة', 'Configured')}</span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {t(locale, 'يحتاج إعداد', 'Needs Config')}</span>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs font-bold gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    onClick={() => openConfigModal(plugin)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    {t(locale, 'الإعدادات العامة', 'Global Config')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Config Modal */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="sm:max-w-[500px]" dir={dir}>
          <DialogHeader className="text-start">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-500" />
              {t(locale, 'إعدادات الإضافة:', 'Plugin Settings:')} {selectedPlugin?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t(locale, 'هذه الإعدادات ستُستخدم لعمليات المنصة العامة. سيتم تشفيرها أمنياً (AES-256) قبل الحفظ في قاعدة البيانات.', 'These settings are used for platform-wide operations. They will be encrypted securely (AES-256) before saving.')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedPlugin?.configSchema ? (
              JSON.parse(selectedPlugin.configSchema).map((field: any) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-sm font-bold flex items-center gap-1">
                    {locale === 'ar' ? field.labelAr : field.labelEn}
                    {field.required && <span className="text-rose-500">*</span>}
                  </Label>
                  <Input 
                    type={field.type === 'password' ? 'password' : 'text'}
                    value={configValues[field.key] || ''}
                    onChange={(e) => setConfigValues({...configValues, [field.key]: e.target.value})}
                    placeholder={locale === 'ar' ? field.descriptionAr : field.descriptionEn}
                    className="h-10 rounded-xl"
                  />
                  {(field.descriptionAr || field.descriptionEn) && (
                    <p className="text-[10px] text-muted-foreground">
                      {locale === 'ar' ? field.descriptionAr : field.descriptionEn}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t(locale, 'هذه الإضافة لا تتطلب إعدادات إضافية.', 'This plugin requires no extra configuration.')}
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-start flex-row-reverse">
            <Button disabled={isSaving} onClick={handleSaveConfig} className="rounded-xl px-8 font-bold gap-2 bg-indigo-600 hover:bg-indigo-700">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t(locale, 'حفظ وتشفير', 'Save & Encrypt')}
            </Button>
            <Button disabled={isSaving} variant="outline" onClick={() => setIsConfigModalOpen(false)} className="rounded-xl mr-2 ml-2">
              {t(locale, 'إلغاء', 'Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
