'use client';

import React, { useEffect, useState } from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { config, PuckLocaleContext } from '@/lib/puck/config';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Save, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CustomPageBuilder({ params }: { params: { id: string } }) {
  const { t, isAr, locale } = useTranslation();
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [pageMeta, setPageMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [params.id]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/pages/${params.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPageMeta(data.data);
        
        // Parse content safely
        let content = { content: [], root: {}, zones: {} };
        if (data.data.content) {
          try {
            const parsed = JSON.parse(data.data.content);
            if (parsed && typeof parsed === 'object') {
              content = parsed;
              if (!content.content) content.content = [];
              if (!content.root) content.root = {};
              if (!content.zones) content.zones = {};
            }
          } catch(e) {
            console.error('Failed to parse Puck data');
          }
        }
        setInitialData(content);
      } else {
        toast.error('Page not found');
        router.push('/admin-secure-internal/pages');
      }
    } catch (e) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const res = await fetch(`/api/admin/pages/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(t('admin.saved', 'Saved successfully'));
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error('Error saving page');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  // We provide PuckLocaleContext as 'ar' in the editor to preview it in Arabic by default, 
  // or we could use the current dashboard locale! Let's use current dashboard locale.
  const previewLocale = locale === 'en' ? 'en' : locale === 'fr' ? 'fr' : 'ar';

  return (
    <div className="flex flex-col h-screen -m-6"> {/* Negative margin to break out of dashboard padding */}
      {/* Custom Top Bar */}
      <div className="h-14 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin-secure-internal/pages')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 flex items-center justify-center transition-colors"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          <div>
            <h1 className="font-bold text-sm">
              {pageMeta?.titleAr}
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono">/pages/{pageMeta?.slug}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-900/30 rounded-lg text-xs font-medium">
            تلميح: أضف المحتوى بجميع اللغات من القائمة الجانبية
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <PuckLocaleContext.Provider value={previewLocale}>
          <Puck
            config={config}
            data={initialData}
            onPublish={handleSave}
            overrides={{
              headerActions: ({ children }) => (
                <div className="flex items-center gap-2">
                  {children}
                </div>
              ),
            }}
          />
        </PuckLocaleContext.Provider>
      </div>
    </div>
  );
}
