'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function LegalStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const { t } = useTranslation();
  
  // Parsing existing CR number if any: e.g. "16/00-21A1234567"
  const parseCR = (cr: string) => {
    const defaultCr = { wilaya: '16', branch: '00', year: '21', type: 'A', sn: '' };
    if (!cr) return defaultCr;
    
    // Rough regex to match the pattern: (\d{2})/(\d{2})-(\d{2})([ABDabd])(\d+)
    const match = cr.match(/^(\d{2})\/(\d{2})-(\d{2})([A-Za-z])(\d+)$/);
    if (match) {
      return {
        wilaya: match[1],
        branch: match[2],
        year: match[3],
        type: match[4].toUpperCase(),
        sn: match[5]
      };
    }
    // If it doesn't match, just put the whole thing in SN and default the rest
    return { ...defaultCr, sn: cr };
  };

  const [crParts, setCrParts] = useState(parseCR(data.commercialRegisterNumber || ''));

  useEffect(() => {
    const formattedCR = `${crParts.wilaya}/${crParts.branch}-${crParts.year}${crParts.type}${crParts.sn}`;
    // Only update if it actually changed and SN is filled
    if (formattedCR !== data.commercialRegisterNumber) {
      updateData({ commercialRegisterNumber: formattedCR });
    }
  }, [crParts]);

  const handleCrChange = (field: keyof typeof crParts, value: string) => {
    setCrParts(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-bold mb-4 block">طبيعة النشاط / نوع التاجر *</Label>
        <RadioGroup 
          value={crParts.type} 
          onValueChange={(val) => {
            handleCrChange('type', val);
            // Also map it to entityType for backend
            let eType = 'natural';
            if (val === 'B') eType = 'legal';
            if (val === 'D') eType = 'mobile';
            updateData({ entityType: eType });
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
            <RadioGroupItem value="A" id="type-a" />
            <Label htmlFor="type-a" className="cursor-pointer">شخص طبيعي (A)</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
            <RadioGroupItem value="B" id="type-b" />
            <Label htmlFor="type-b" className="cursor-pointer">شخص معنوي - شركة (B)</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
            <RadioGroupItem value="D" id="type-d" />
            <Label htmlFor="type-d" className="cursor-pointer">نشاط غير قار / متنقل (D)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        <div className="space-y-2">
          <Label>بلد تسجيل الأعمال *</Label>
          <Input 
            value="الجزائر (Algeria)" 
            disabled 
            className="bg-gray-50 text-gray-500" 
          />
        </div>
        
        <div className="space-y-2">
          <Label>اسم الشركة / المتجر المذكور في السجل *</Label>
          <Input 
            placeholder="يرجى إدخال الاسم الدقيق" 
            value={data.companyName || ''} 
            onChange={(e) => updateData({ companyName: e.target.value })} 
          />
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2 p-4 bg-gray-50 rounded-lg border">
          <Label className="text-base font-bold mb-2 block">رقم السجل التجاري *</Label>
          <p className="text-xs text-gray-500 mb-4">مثال: 16/00-21A1234567</p>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap" dir="ltr">
            {/* SN */}
            <Input 
              className="text-center font-mono" 
              placeholder="1234567" 
              value={crParts.sn} 
              onChange={(e) => handleCrChange('sn', e.target.value.replace(/\D/g, ''))} 
            />
            <span className="font-bold text-gray-400"> </span>
            {/* Type */}
            <div className="px-4 py-2 border rounded bg-white font-mono font-bold text-center w-16 shrink-0">
              {crParts.type}
            </div>
            {/* Year */}
            <Input 
              className="text-center font-mono w-16 shrink-0" 
              placeholder="21" 
              maxLength={2}
              value={crParts.year} 
              onChange={(e) => handleCrChange('year', e.target.value.replace(/\D/g, ''))} 
            />
            <span className="font-bold text-gray-400">-</span>
            {/* Branch */}
            <Input 
              className="text-center font-mono w-16 shrink-0" 
              placeholder="00" 
              maxLength={2}
              value={crParts.branch} 
              onChange={(e) => handleCrChange('branch', e.target.value.replace(/\D/g, ''))} 
            />
            <span className="font-bold text-gray-400">/</span>
            {/* Wilaya */}
            <Input 
              className="text-center font-mono w-16 shrink-0" 
              placeholder="16" 
              maxLength={2}
              value={crParts.wilaya} 
              onChange={(e) => handleCrChange('wilaya', e.target.value.replace(/\D/g, ''))} 
            />
          </div>
          <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-2 rounded" dir="rtl">
            <strong>الرقم المجمع:</strong> <span dir="ltr" className="inline-block">{crParts.wilaya}/{crParts.branch}-{crParts.year}{crParts.type}{crParts.sn}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('onboarding.legal.issueAuthority')} *</Label>
          <Input 
            placeholder="المركز الوطني للسجل التجاري - فرع..." 
            value={data.issueAuthority || ''} 
            onChange={(e) => updateData({ issueAuthority: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>عنوان الشركة / المقر *</Label>
          <Input 
            placeholder="العنوان كاملاً" 
            value={data.companyAddress || ''} 
            onChange={(e) => updateData({ companyAddress: e.target.value })} 
          />
        </div>
        
        <div className="space-y-2">
          <Label>{t('onboarding.legal.issueDate')} *</Label>
          <Input 
            type="date" 
            value={data.issueDate ? data.issueDate.split('T')[0] : ''} 
            onChange={(e) => updateData({ issueDate: e.target.value ? new Date(e.target.value).toISOString() : null })} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('onboarding.legal.expiryDate')}</Label>
          <Input 
            type="date" 
            value={data.expiryDate ? data.expiryDate.split('T')[0] : ''} 
            onChange={(e) => updateData({ expiryDate: e.target.value ? new Date(e.target.value).toISOString() : null })} 
          />
        </div>
      </div>

      <div className="mt-8 border-t pt-6 space-y-4">
        <Label className="text-base font-bold">وثيقة تسجيل الأعمال (مستخرج السجل التجاري) *</Label>
        <p className="text-sm text-gray-500">قم بتحميل نسخة واضحة (PDF, JPG, PNG - Max 10MB)</p>
        <Input 
          type="file" 
          accept=".pdf,.jpg,.jpeg,.png" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) updateData({ commercialRegisterFile: 'https://fake-s3.com/upload.pdf' });
          }} 
        />
        {data.commercialRegisterFile && <p className="text-sm text-green-600">تم رفع الملف بنجاح</p>}
      </div>
    </div>
  );
}
