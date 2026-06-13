'use client';

import React, { useState, useEffect, useMemo } from 'react';
if (typeof window !== 'undefined') { (window as any).React = React; }
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { Loader2 } from "lucide-react";
import { useTranslation } from '@/lib/i18n/useTranslation';
import { getSaadaConfig } from '@/lib/puck/PuckConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useTranslationStore } from '@/lib/store/translation-store';

export default function SaadaBuilderPage() {
  const [data, setData] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [templateKey, setTemplateKey] = useState('saada_homepage_layout');
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([
    'saada_homepage_layout',
    'saada_modern_template',
    'saada_store_default',
    'saada_seller_default'
  ]);
  const { t, locale } = useTranslation();
  const { languages } = useTranslationStore();
  const activeLanguages = languages && languages.length > 0 ? languages : [{code: 'ar', nameAr: 'العربية'}, {code: 'en', nameAr: 'English'}];
  const saadaConfig = useMemo(() => getSaadaConfig(locale, storeData, activeLanguages), [locale, storeData, activeLanguages]);
  const router = useRouter();
  const isRTL = locale === 'ar';

  useEffect(() => {
    fetch('/api/admin/saada-homepage?action=list_templates')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          // Merge default with fetched so we don't lose the standard ones
          setAvailableTemplates((prev) => Array.from(new Set([...prev, ...res.data])));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Fetch real store data for previews
    fetch(`/api/homepage?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.success) setStoreData(d); })
      .catch(() => {});
      
    setData(null); // Show loader while fetching
    fetch(`/api/admin/saada-homepage?templateKey=${templateKey}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setData({ content: [], root: {}, zones: {} });
        }
      });
  }, [templateKey]);

  const save = async (newData: any) => {
    setIsSaving(true);
    try {
      await fetch(`/api/admin/saada-homepage?templateKey=${templateKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Bar for Template Selection */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-[#1a2332] border-b border-gray-200 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {t('saada.editorTitle') || 'SAADA Builder'}
          </h1>
          <div className="w-[250px]">
            <Select value={templateKey} onValueChange={setTemplateKey}>
              <SelectTrigger>
                <SelectValue placeholder={t('saada.selectTemplate') || 'Select Template'} />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map((tk) => (
                  <SelectItem key={tk} value={tk}>{tk}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              const newKey = window.prompt("أدخل اسم القالب الجديد باللغة الإنجليزية (مثال: my_custom_template):");
              if (newKey && newKey.trim()) {
                const formattedKey = newKey.trim().replace(/\s+/g, '_').toLowerCase();
                setAvailableTemplates(prev => Array.from(new Set([...prev, formattedKey])));
                setTemplateKey(formattedKey);
              }
            }}
          >
            إنشاء قالب جديد
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              await fetch(`/api/admin/saada-homepage`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'set_active_template', templateKey })
              });
              alert('تم تعيين القالب النشط للواجهة الرئيسية بنجاح!');
            }}
          >
            تعيين كقالب نشط للواجهة
          </Button>
        </div>
        {isSaving && <Loader2 className="w-5 h-5 animate-spin text-brand" />}
      </div>

      <div className="flex-1 overflow-hidden" dir="ltr">
        {/* 
          Note: Puck is currently best supported in LTR, 
          so we force LTR for the editor wrapper itself. 
          But the generated components inside respect isRTL correctly!
        */}
        {!data ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : (
          <div className="puck-rtl-preview-wrapper h-full">
            <Puck 
              config={saadaConfig as any} 
              data={data} 
              onPublish={save}
              headerTitle={t('saada.editorTitle') || "SAADA Page Builder"}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* 
.puck-rtl-preview-wrapper [data-puck-preview] { direction: rtl; } 
*/
