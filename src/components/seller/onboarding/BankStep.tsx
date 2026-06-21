'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function BankStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{t('onboarding.bank.bankName')}</Label>
          <Input 
            placeholder="e.g. BDL, CPA, BADR..." 
            value={data.bankName || ''} 
            onChange={(e) => updateData({ bankName: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('onboarding.bank.iban')}</Label>
          <Input 
            placeholder="RIB / IBAN" 
            value={data.iban || ''} 
            onChange={(e) => updateData({ iban: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('onboarding.bank.swift')}</Label>
          <Input 
            placeholder="SWIFT / BIC" 
            value={data.swiftCode || ''} 
            onChange={(e) => updateData({ swiftCode: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('onboarding.bank.beneficiaryName')}</Label>
          <Input 
            placeholder={t('onboarding.bank.beneficiaryName')} 
            value={data.beneficiaryName || ''} 
            onChange={(e) => updateData({ beneficiaryName: e.target.value })} 
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <Label className="text-base font-bold mb-4 block">تطابق اسم المستفيد</Label>
        <RadioGroup 
          value={data.isBeneficiaryMatching ? 'yes' : 'no'} 
          onValueChange={(val) => updateData({ isBeneficiaryMatching: val === 'yes' })}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="yes" id="match-yes" />
            <Label htmlFor="match-yes" className="cursor-pointer">{t('onboarding.bank.sameAsCompany')}</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="no" id="match-no" />
            <Label htmlFor="match-no" className="cursor-pointer">{t('onboarding.bank.diffFromCompany')}</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="pt-4 border-t space-y-4">
        <Label className="text-base font-bold">{t('onboarding.bank.uploadDoc')}</Label>
        <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB) - الشيك الملغى أو شهادة بنكية (RIB)</p>
        <Input 
          type="file" 
          accept=".pdf,.jpg,.png" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) updateData({ bankLetterFile: 'https://fake-s3.com/bank.pdf' });
          }} 
        />
        {data.bankLetterFile && <p className="text-sm text-green-600">تم رفع الملف بنجاح</p>}
      </div>
    </div>
  );
}
