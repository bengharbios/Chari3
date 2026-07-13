'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function LegalStep({ data, updateData, onPreviewFile, isBusiness = true }: { data: any; updateData: (d: any) => void; onPreviewFile: (url: string) => void; isBusiness?: boolean }) {
  const { t, locale } = useTranslation();
  
  // Parsing existing CR number if any: e.g. "16/00-21A1234567"
  const parseCR = (cr: string) => {
    const defaultCr = { wilaya: '16', branch: '00', year: '21', type: 'A', sn: '' };
    if (!cr) return defaultCr;
    
    // Rough regex to match the pattern: (\d{2})/(\d{2})-(\d{2})([ABDabd])(\d*)
    const match = cr.match(/^(\d{2})\/(\d{2})-(\d{2})([A-Za-z])(\d*)$/);
    if (match) {
      return {
        wilaya: match[1],
        branch: match[2],
        year: match[3],
        type: match[4].toUpperCase(),
        sn: match[5]
      };
    }
    // If it doesn't match, extract only digits for SN to avoid infinite appending
    return { ...defaultCr, sn: cr.replace(/\D/g, '') };
  };

  const [crParts, setCrParts] = useState(parseCR(data.commercialRegisterNumber || ''));
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(data.country || 'DZ');
  const [crFormat, setCrFormat] = useState(() => {
    if (!data.commercialRegisterNumber) return 'structured';
    const isStructured = /^(\d{2})\/(\d{2})-(\d{2})([A-Za-z])(\d*)$/.test(data.commercialRegisterNumber);
    return isStructured ? 'structured' : 'freeform';
  });

  // Sync state with async loaded data prop
  useEffect(() => {
    if (data.country && data.country !== selectedCountry) {
      setSelectedCountry(data.country);
    }
  }, [data.country]);

  useEffect(() => {
    if (data.commercialRegisterNumber) {
      const isStructured = /^(\d{2})\/(\d{2})-(\d{2})([A-Za-z])(\d*)$/.test(data.commercialRegisterNumber);
      const targetFormat = isStructured ? 'structured' : 'freeform';
      if (targetFormat !== crFormat) {
        setCrFormat(targetFormat);
      }
    }
  }, [data.commercialRegisterNumber]);

  useEffect(() => {
    if (data.commercialRegisterNumber) {
      const parsed = parseCR(data.commercialRegisterNumber);
      setCrParts(prev => {
        if (
          prev.wilaya === parsed.wilaya &&
          prev.branch === parsed.branch &&
          prev.year === parsed.year &&
          prev.type === parsed.type &&
          prev.sn === parsed.sn
        ) {
          return prev;
        }
        return parsed;
      });
    }
  }, [data.commercialRegisterNumber]);

  useEffect(() => {
    fetch('/api/regions/countries')
      .then(res => res.json())
      .then(d => {
        if (d.success) setCountries(d.countries);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      return;
    }
    fetch(`/api/regions/states?countryCode=${selectedCountry}`)
      .then(res => res.json())
      .then(d => {
        if (d.success) setStates(d.states);
      })
      .catch(() => {});
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry === 'DZ' && crFormat === 'structured') {
      const formattedCR = `${crParts.wilaya}/${crParts.branch}-${crParts.year}${crParts.type}${crParts.sn}`;
      if (formattedCR !== data.commercialRegisterNumber) {
        updateData({ commercialRegisterNumber: formattedCR });
      }
    }
  }, [crParts, selectedCountry, crFormat]);

  const handleCrChange = (field: keyof typeof crParts, value: string) => {
    setCrParts(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {isBusiness && (
        <div>
          <Label className="text-base font-bold mb-4 block">{t('طبيعة النشاط / نوع التاجر *', 'Activity Type / Merchant Type *')}</Label>
          <RadioGroup 
            value={crParts.type} 
            onValueChange={(val) => {
              handleCrChange('type', val);
              let eType = 'natural';
              if (val === 'B') eType = 'legal';
              if (val === 'D') eType = 'mobile';
              updateData({ entityType: eType });
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 text-sm">
              <RadioGroupItem value="A" id="type-a" />
              <Label htmlFor="type-a" className="cursor-pointer">{t('شخص طبيعي (A)', 'Natural Person (A)')}</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 text-sm">
              <RadioGroupItem value="B" id="type-b" />
              <Label htmlFor="type-b" className="cursor-pointer">{t('شخص معنوي - شركة (B)', 'Legal Entity - Company (B)')}</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 text-sm">
              <RadioGroupItem value="D" id="type-d" />
              <Label htmlFor="type-d" className="cursor-pointer">{t('نشاط غير قار / متنقل (D)', 'Mobile / Non-fixed Activity (D)')}</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-slate-800">
        <div className="space-y-2">
          <Label>{t('بلد تسجيل الأعمال *', 'Country of Registration *')}</Label>
          <Select 
            value={selectedCountry} 
            onValueChange={(val) => {
              setSelectedCountry(val);
              updateData({ country: val, state: '' });
              if (val !== 'DZ') {
                updateData({ commercialRegisterNumber: '' });
              }
            }}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <SelectTrigger className="dark:bg-slate-900 dark:border-slate-800">
              <SelectValue placeholder={t('اختر الدولة', 'Select Country')} />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
              {countries.map(c => (
                <SelectItem key={c.code} value={c.code}>{locale === 'ar' ? c.nameAr : c.nameEn} ({c.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>{t('الولاية / المقاطعة *', 'State / Province *')}</Label>
          <Select 
            value={data.state || ''} 
            onValueChange={(val) => updateData({ state: val })} 
            disabled={!selectedCountry || states.length === 0}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <SelectTrigger className="dark:bg-slate-900 dark:border-slate-800">
              <SelectValue placeholder={t('اختر الولاية', 'Select State')} />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
              {states.map((s, idx) => (
                <SelectItem key={s.id || idx} value={s.nameAr || s.name || s.id}>{locale === 'ar' ? (s.nameAr || s.name) : (s.name || s.nameAr)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>{isBusiness ? t('اسم الشركة / المتجر المذكور في السجل *', 'Company Name as in Register *') : t('اسم النشاط التجاري / الاسم المستعار *', 'Trade Name / Pseudonym *')}</Label>
          <Input 
            placeholder={isBusiness ? t('يرجى إدخال الاسم الدقيق للشركة', 'Enter precise company name') : t('مثال: متجري الخاص', 'e.g. My Shop')} 
            value={data.companyName || ''} 
            onChange={(e) => updateData({ companyName: e.target.value })} 
            dir="auto"
            className="dark:bg-slate-900 dark:border-slate-800"
          />
        </div>

        {isBusiness ? (
          <>
            {selectedCountry === 'DZ' && (
              <div className="space-y-2 col-span-1 md:col-span-2 p-4 bg-gray-100 dark:bg-slate-800/30 rounded-lg border dark:border-slate-800">
                <Label className="font-bold block mb-2">{t('طريقة إدخال رقم السجل', 'Register Number Format')}</Label>
                <RadioGroup
                  value={crFormat}
                  onValueChange={(val) => {
                    setCrFormat(val);
                    if (val === 'structured') {
                      const formattedCR = `${crParts.wilaya}/${crParts.branch}-${crParts.year}${crParts.type}${crParts.sn}`;
                      updateData({ commercialRegisterNumber: formattedCR });
                    }
                  }}
                  className="flex gap-4 mb-2"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="structured" id="fmt-structured" />
                    <Label htmlFor="fmt-structured" className="cursor-pointer text-xs">{t('التنسيق المنظم (رسمي)', 'Structured Format')}</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="freeform" id="fmt-freeform" />
                    <Label htmlFor="fmt-freeform" className="cursor-pointer text-xs">{t('تنسيق حر (إدخال يدوي)', 'Freeform Format')}</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {selectedCountry === 'DZ' && crFormat === 'structured' ? (
              <div className="space-y-2 col-span-1 md:col-span-2 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-800">
                <Label className="text-base font-bold mb-2 block">{t('رقم السجل التجاري *', 'Commercial Register Number *')}</Label>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">{t('مثال: 16/00-21A1234567', 'e.g. 16/00-21A1234567')}</p>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap" dir="ltr">
                  <Input 
                    className="text-center font-mono w-16 shrink-0 dark:bg-slate-900 dark:border-slate-800" 
                    placeholder="16" 
                    maxLength={2}
                    value={crParts.wilaya} 
                    onChange={(e) => handleCrChange('wilaya', e.target.value.replace(/\D/g, ''))} 
                  />
                  <span className="font-bold text-gray-400">/</span>
                  <Input 
                    className="text-center font-mono w-16 shrink-0 dark:bg-slate-900 dark:border-slate-800" 
                    placeholder="00" 
                    maxLength={2}
                    value={crParts.branch} 
                    onChange={(e) => handleCrChange('branch', e.target.value.replace(/\D/g, ''))} 
                  />
                  <span className="font-bold text-gray-400">-</span>
                  <Input 
                    className="text-center font-mono w-16 shrink-0 dark:bg-slate-900 dark:border-slate-800" 
                    placeholder="21" 
                    maxLength={2}
                    value={crParts.year} 
                    onChange={(e) => handleCrChange('year', e.target.value.replace(/\D/g, ''))} 
                  />
                  <div className="px-4 py-2 border rounded bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 font-mono font-bold text-center w-16 shrink-0">
                    {crParts.type}
                  </div>
                  <span className="font-bold text-gray-400"> </span>
                  <Input 
                    className="text-center font-mono dark:bg-slate-900 dark:border-slate-800" 
                    placeholder="" 
                    value={crParts.sn} 
                    onChange={(e) => handleCrChange('sn', e.target.value.replace(/\D/g, ''))} 
                  />
                </div>
                <div className="mt-3 text-sm text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 p-2 rounded" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <strong>{t('الرقم المجمع:', 'Combined Number:')}</strong> <span dir="ltr" className="inline-block">{crParts.wilaya}/{crParts.branch}-{crParts.year}{crParts.type}{crParts.sn}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 col-span-1 md:col-span-2 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-800">
                <Label className="text-base font-bold mb-2 block">{t('رقم السجل التجاري *', 'Commercial Register Number *')}</Label>
                <Input 
                  placeholder={t('أدخل رقم السجل التجاري الخاص بدولتك', 'Enter commercial register number')} 
                  value={data.commercialRegisterNumber || ''} 
                  onChange={(e) => updateData({ commercialRegisterNumber: e.target.value })} 
                  dir="auto"
                  className="dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2 col-span-1 md:col-span-2 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-800">
            <Label className="text-base font-bold mb-2 block">{t('رقم بطاقة النشاط / رخصة الأعمال *', 'Activity Card Number *')}</Label>
            <Input 
              placeholder={t('مثال: 23/00-123456', 'e.g. 23/00-123456')} 
              value={data.commercialRegisterNumber || ''} 
              onChange={(e) => updateData({ commercialRegisterNumber: e.target.value })} 
              dir="auto"
              className="dark:bg-slate-900 dark:border-slate-800"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>{t('جهة إصدار الرخصة / السجل *', 'Issuing Authority *')}</Label>
          <Input 
            placeholder={t('مثال: المركز الوطني للسجل التجاري - فرع الجزائر', 'e.g. National Center of Commercial Registry')} 
            value={data.issueAuthority || ''} 
            onChange={(e) => updateData({ issueAuthority: e.target.value })} 
            dir="auto"
            className="dark:bg-slate-900 dark:border-slate-800"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('عنوان المقر / الشركة *', 'Business Address *')}</Label>
          <Input 
            placeholder={t('العنوان كاملاً', 'Full Address')} 
            value={data.companyAddress || ''} 
            onChange={(e) => updateData({ companyAddress: e.target.value })} 
            dir="auto"
            className="dark:bg-slate-900 dark:border-slate-800"
          />
        </div>
        
        <div className="space-y-2">
          <Label>{t('تاريخ الإصدار *', 'Issue Date *')}</Label>
          <Input 
            type="date" 
            value={data.issueDate ? data.issueDate.split('T')[0] : ''} 
            onChange={(e) => updateData({ issueDate: e.target.value ? new Date(e.target.value).toISOString() : null })} 
            className="dark:bg-slate-900 dark:border-slate-800"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('تاريخ الانتهاء', 'Expiry Date')}</Label>
          <Input 
            type="date" 
            value={data.expiryDate ? data.expiryDate.split('T')[0] : ''} 
            onChange={(e) => {
              if (!e.target.value) {
                updateData({ expiryDate: null });
                return;
              }
              const selectedDate = new Date(e.target.value + 'T00:00:00');
              updateData({ expiryDate: selectedDate.toISOString() });
            }} 
            className="dark:bg-slate-900 dark:border-slate-800"
          />
          {(() => {
            if (!data.expiryDate) return null;
            const expiry = new Date(data.expiryDate);
            const now = new Date();
            now.setHours(0,0,0,0);
            const diffTime = expiry.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 0) {
              return (
                <p className="text-xs text-red-500 font-bold mt-1">
                  {t('⚠️ هذا المستند منتهي الصلاحية! سيتم رفضه تلقائياً من قبل الإدارة.', '⚠️ This document is expired! It will be rejected automatically by admin.')}
                </p>
              );
            } else if (diffDays <= 30) {
              return (
                <p className="text-xs text-red-500 font-semibold mt-1 animate-pulse">
                  {t(`⚠️ تنبيه: المستند ينتهي خلال ${diffDays} يوم! يرجى رفع وثيقة مجددة لتفادي الرفض.`, `⚠️ Warning: Document expires in ${diffDays} days! Please upload a renewed document.`)}
                </p>
              );
            } else if (diffDays <= 180) {
              const months = Math.floor(diffDays / 30);
              return (
                <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-1">
                  {t(`⚠️ تحذير: الصلاحية المتبقية قصيرة (حوالي ${months || 1} أشهر). قد يطلب الإدمن تجديدها.`, `⚠️ Warning: Short validity remaining (about ${months || 1} months). Admin may request renewal.`)}
                </p>
              );
            } else {
              return (
                <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium mt-1">
                  {t('✓ تاريخ الصلاحية كافٍ ومقبول لدى الإدارة.', '✓ Document validity is sufficient and acceptable.')}
                </p>
              );
            }
          })()}
        </div>
      </div>

      <div className="mt-8 border-t dark:border-slate-800 pt-6 space-y-4">
        <Label className="text-base font-bold">{isBusiness ? t('وثيقة تسجيل الأعمال (مستخرج السجل التجاري) *', 'Commercial Register Document *') : t('صورة بطاقة النشاط *', 'Activity Card Image *')}</Label>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('قم بتحميل نسخة واضحة وصالحة (PDF, JPG, PNG - بحد أقصى 10 ميجابايت)', 'Please upload a clear scanned copy (PDF, JPG, PNG - Max 10MB)')}
        </p>
        <Input 
          type="file" 
          accept=".pdf,.jpg,.jpeg,.png" 
          className="dark:bg-slate-900 dark:border-slate-800"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const uploadToast = toast.loading(
              isBusiness 
                ? (locale === 'ar' ? 'جاري رفع السجل التجاري...' : 'Uploading Commercial Register...')
                : (locale === 'ar' ? 'جاري رفع صورة بطاقة النشاط...' : 'Uploading Activity Card...')
            );
            const formData = new FormData();
            formData.append('file', file);

            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });
              const json = await res.json();
              if (json.success) {
                updateData({ commercialRegisterFile: json.url });
                toast.success(
                  isBusiness 
                    ? (locale === 'ar' ? 'تم رفع السجل التجاري بنجاح!' : 'Commercial Register uploaded successfully!')
                    : (locale === 'ar' ? 'تم رفع صورة بطاقة النشاط بنجاح!' : 'Activity Card uploaded successfully!'),
                  { id: uploadToast }
                );
              } else {
                toast.error(json.error || (locale === 'ar' ? 'فشل رفع الملف' : 'Upload failed'), { id: uploadToast });
              }
            } catch (err) {
              toast.error(locale === 'ar' ? 'حدث خطأ أثناء رفع الملف' : 'Error uploading file', { id: uploadToast });
            }
          }} 
        />
        {data.commercialRegisterFile && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/30 flex items-center justify-between">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">{t('تم رفع الملف بنجاح', 'File uploaded successfully')}</p>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => onPreviewFile(data.commercialRegisterFile)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {t('معاينة الملف', 'Preview File')}
              </button>
              <span className="text-gray-300 dark:text-slate-700">|</span>
              <a 
                href={data.commercialRegisterFile} 
                download
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {t('تحميل الملف', 'Download File')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
