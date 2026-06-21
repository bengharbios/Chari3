'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileUpload } from '@/components/ui/file-upload'; // Assuming a FileUpload exists, or we use a basic input type file

export default function LegalStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-bold mb-4 block">{t('onboarding.legal.entityType')}</Label>
        <RadioGroup 
          value={data.entityType || 'natural'} 
          onValueChange={(val) => updateData({ entityType: val })}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="natural" id="natural" />
            <Label htmlFor="natural" className="cursor-pointer">{t('onboarding.legal.natural')}</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="legal" id="legal" />
            <Label htmlFor="legal" className="cursor-pointer">{t('onboarding.legal.legal')}</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{t('onboarding.legal.country')}</Label>
          <Input 
            value={data.countryOfRegistration || 'Algeria'} 
            disabled 
            className="bg-gray-50 text-gray-500" 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('onboarding.legal.companyName')}</Label>
          <Input 
            placeholder={t('onboarding.legal.companyName')} 
            value={data.companyName || ''} 
            onChange={(e) => updateData({ companyName: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('onboarding.legal.issueAuthority')}</Label>
          <Input 
            placeholder={t('onboarding.legal.issueAuthority')} 
            value={data.issueAuthority || ''} 
            onChange={(e) => updateData({ issueAuthority: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('onboarding.legal.crNumber')}</Label>
          <Input 
            placeholder="1234567890" 
            value={data.commercialRegisterNumber || ''} 
            onChange={(e) => updateData({ commercialRegisterNumber: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('onboarding.legal.issueDate')}</Label>
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
        <Label className="text-base font-bold">{t('onboarding.legal.uploadDoc')}</Label>
        <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
        <Input 
          type="file" 
          accept=".pdf,.jpg,.png" 
          onChange={(e) => {
            // Fake upload for now
            const file = e.target.files?.[0];
            if (file) updateData({ commercialRegisterFile: 'https://fake-s3.com/upload.pdf' });
          }} 
        />
        {data.commercialRegisterFile && <p className="text-sm text-green-600">تم رفع الملف بنجاح</p>}
      </div>
    </div>
  );
}
