'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function BankStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const { t } = useTranslation();
  const [paymentType, setPaymentType] = useState<'bank' | 'ccp'>(data.swiftCode ? 'bank' : 'ccp');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Label className="text-base font-bold mb-4 block">طريقة الدفع *</Label>
        <RadioGroup 
          value={paymentType} 
          onValueChange={(val: 'bank' | 'ccp') => {
            setPaymentType(val);
            if (val === 'ccp') {
              updateData({ swiftCode: '', bankName: 'Algerie Poste' });
            } else {
              updateData({ bankName: '' });
            }
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="bank" id="type-bank" />
            <Label htmlFor="type-bank" className="cursor-pointer">حساب بنكي (Bank Account)</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="ccp" id="type-ccp" />
            <Label htmlFor="type-ccp" className="cursor-pointer">حساب بريدي جاري (CCP / RIP)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <Label>{t('onboarding.bank.beneficiaryName')} *</Label>
          <Input 
            placeholder={t('onboarding.bank.beneficiaryName')} 
            value={data.beneficiaryName || ''} 
            onChange={(e) => updateData({ beneficiaryName: e.target.value })} 
          />
        </div>

        {paymentType === 'bank' ? (
          <>
            <div className="space-y-2">
              <Label>{t('onboarding.bank.bankName')} *</Label>
              <Input 
                placeholder="مثال: BDL, CPA, BADR..." 
                value={data.bankName || ''} 
                onChange={(e) => updateData({ bankName: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>{t('onboarding.bank.swift')} *</Label>
              <Input 
                placeholder="SWIFT / BIC" 
                value={data.swiftCode || ''} 
                onChange={(e) => updateData({ swiftCode: e.target.value })} 
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>{t('onboarding.bank.iban')} *</Label>
              <Input 
                placeholder="RIB / IBAN (20 أرقام على الأقل)" 
                value={data.iban || ''} 
                onChange={(e) => updateData({ iban: e.target.value })} 
                dir="ltr"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>رقم الحساب البريدي (N° CCP) *</Label>
              <Input 
                placeholder="مثال: 1234567" 
                value={data.ccpNumber || ''} 
                onChange={(e) => updateData({ ccpNumber: e.target.value })} 
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>المفتاح (Clé) *</Label>
              <Input 
                placeholder="مثال: 45" 
                value={data.ccpCle || ''} 
                onChange={(e) => updateData({ ccpCle: e.target.value })} 
                maxLength={2}
                dir="ltr"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>الرقم التعريفي البريدي (RIP) المكون من 20 رقم *</Label>
              <Input 
                placeholder="مثال: 00799999001234567845" 
                value={data.iban || ''} 
                onChange={(e) => updateData({ iban: e.target.value })} 
                maxLength={20}
                dir="ltr"
              />
            </div>
          </>
        )}
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
        <Label className="text-base font-bold">إثبات وسيلة الدفع *</Label>
        <p className="text-sm text-gray-500">قم بتحميل المستند المناسب لنوع الإثبات المختار (شيك ملغى أو شهادة بنكية/بريدية - Max 5MB)</p>
        <Input 
          type="file" 
          accept=".pdf,.jpg,.png,.jpeg" 
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
