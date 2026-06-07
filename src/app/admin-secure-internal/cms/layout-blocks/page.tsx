'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';

export default function LayoutBlocksCMS() {
  const { adminLocale, token, admin } = useAdminAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [headerBlocks, setHeaderBlocks] = useState<any[]>([]);
  const [footerBlocks, setFooterBlocks] = useState<any[]>([]);

  const isRTL = adminLocale === 'ar';
  const t = {
    title: isRTL ? 'إدارة قوالب الواجهة (Header/Footer)' : 'Layout Blocks Management',
    save: isRTL ? 'حفظ التغييرات' : 'Save Changes',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    success: isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully',
    error: isRTL ? 'حدث خطأ' : 'Error occurred',
    tabs: {
      header: isRTL ? 'عناصر الهيدر' : 'Header Blocks',
      footer: isRTL ? 'عناصر الفوتر' : 'Footer Blocks',
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.header_blocks) {
          setHeaderBlocks(JSON.parse(data.settings.header_blocks));
        }
        if (data.settings.footer_blocks) {
          setFooterBlocks(JSON.parse(data.settings.footer_blocks));
        }
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        settings: {
          header_blocks: JSON.stringify(headerBlocks),
          footer_blocks: JSON.stringify(footerBlocks),
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
      toast.error(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  const addHeaderBlock = () => {
    setHeaderBlocks([...headerBlocks, { id: Date.now().toString(), type: 'announcement', contentAr: 'إعلان جديد', contentEn: 'New Announcement', link: '', isActive: true }]);
  };

  const addFooterBlock = () => {
    setFooterBlocks([...footerBlocks, { id: Date.now().toString(), type: 'link_column', titleAr: 'قسم جديد', titleEn: 'New Section', links: [] }]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutTemplate className="h-6 w-6 text-brand" />
          {t.title}
        </h1>
        <Button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand/90 text-navy">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
          {isSaving ? t.saving : t.save}
        </Button>
      </div>

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="header">{t.tabs.header}</TabsTrigger>
          <TabsTrigger value="footer">{t.tabs.footer}</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">شريط الإعلانات (Announcement Bar)</h2>
              <Button onClick={addHeaderBlock} variant="outline" size="sm">
                <Plus className="h-4 w-4 me-1" /> إضافة شريط
              </Button>
            </div>
            
            <div className="space-y-4">
              {headerBlocks.map((block, idx) => (
                <div key={block.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setHeaderBlocks(headerBlocks.filter(b => b.id !== block.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label>النص (عربي)</Label>
                      <Input 
                        value={block.contentAr} 
                        onChange={(e) => {
                          const newBlocks = [...headerBlocks];
                          newBlocks[idx].contentAr = e.target.value;
                          setHeaderBlocks(newBlocks);
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>النص (إنجليزي)</Label>
                      <Input 
                        value={block.contentEn} 
                        onChange={(e) => {
                          const newBlocks = [...headerBlocks];
                          newBlocks[idx].contentEn = e.target.value;
                          setHeaderBlocks(newBlocks);
                        }} 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>الرابط (اختياري)</Label>
                      <Input 
                        value={block.link || ''} 
                        onChange={(e) => {
                          const newBlocks = [...headerBlocks];
                          newBlocks[idx].link = e.target.value;
                          setHeaderBlocks(newBlocks);
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {headerBlocks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">لا توجد عناصر حالياً. قم بإضافة عناصر جديدة للهيدر.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">أعمدة روابط الفوتر (Footer Links)</h2>
              <Button onClick={addFooterBlock} variant="outline" size="sm">
                <Plus className="h-4 w-4 me-1" /> إضافة عمود
              </Button>
            </div>

            <div className="space-y-4">
              {footerBlocks.map((block, idx) => (
                <div key={block.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setFooterBlocks(footerBlocks.filter(b => b.id !== block.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-4">
                    <div className="space-y-2">
                      <Label>عنوان العمود (عربي)</Label>
                      <Input 
                        value={block.titleAr} 
                        onChange={(e) => {
                          const newBlocks = [...footerBlocks];
                          newBlocks[idx].titleAr = e.target.value;
                          setFooterBlocks(newBlocks);
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>عنوان العمود (إنجليزي)</Label>
                      <Input 
                        value={block.titleEn} 
                        onChange={(e) => {
                          const newBlocks = [...footerBlocks];
                          newBlocks[idx].titleEn = e.target.value;
                          setFooterBlocks(newBlocks);
                        }} 
                      />
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-xs font-bold text-slate-500">الروابط الداخلية</Label>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          const newBlocks = [...footerBlocks];
                          newBlocks[idx].links = [...(newBlocks[idx].links || []), { labelAr: 'رابط جديد', labelEn: 'New Link', url: '/' }];
                          setFooterBlocks(newBlocks);
                        }}
                      >
                        <Plus className="h-3 w-3 me-1" /> إضافة رابط
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {block.links?.map((link: any, linkIdx: number) => (
                        <div key={linkIdx} className="flex gap-2">
                          <Input 
                            placeholder="الاسم عربي" 
                            className="h-8 text-xs" 
                            value={link.labelAr}
                            onChange={(e) => {
                              const newBlocks = [...footerBlocks];
                              newBlocks[idx].links[linkIdx].labelAr = e.target.value;
                              setFooterBlocks(newBlocks);
                            }}
                          />
                          <Input 
                            placeholder="الاسم انجليزي" 
                            className="h-8 text-xs" 
                            value={link.labelEn}
                            onChange={(e) => {
                              const newBlocks = [...footerBlocks];
                              newBlocks[idx].links[linkIdx].labelEn = e.target.value;
                              setFooterBlocks(newBlocks);
                            }}
                          />
                          <Input 
                            placeholder="الرابط /url" 
                            className="h-8 text-xs w-1/3" 
                            value={link.url}
                            onChange={(e) => {
                              const newBlocks = [...footerBlocks];
                              newBlocks[idx].links[linkIdx].url = e.target.value;
                              setFooterBlocks(newBlocks);
                            }}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 shrink-0 text-red-500"
                            onClick={() => {
                              const newBlocks = [...footerBlocks];
                              newBlocks[idx].links.splice(linkIdx, 1);
                              setFooterBlocks(newBlocks);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
              {footerBlocks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">لا توجد أعمدة. قم بإضافة عمود لروابط الفوتر.</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
