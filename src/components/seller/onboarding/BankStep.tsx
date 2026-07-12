'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export default function BankStep({ data, updateData, onPreviewFile, isBusiness = true }: { data: any; updateData: (d: any) => void; onPreviewFile: (url: string) => void; isBusiness?: boolean }) {
  const { t } = useTranslation();
  const [paymentType, setPaymentType] = useState<'bank' | 'ccp'>(data.swiftCode ? 'bank' : 'ccp');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Label className="text-base font-bold mb-4 block">{t('onboarding.bank.paymentMethod')}</Label>
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
          <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <RadioGroupItem value="bank" id="type-bank" />
            <Label htmlFor="type-bank" className="cursor-pointer">{t('onboarding.bank.typeBank')}</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <RadioGroupItem value="ccp" id="type-ccp" />
            <Label htmlFor="type-ccp" className="cursor-pointer">{t('onboarding.bank.typeCcp')}</Label>
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
            className="dark:bg-slate-900 dark:border-slate-800"
          />
        </div>

        {paymentType === 'bank' ? (
          <>
            <div className="space-y-2">
              <Label>{t('onboarding.bank.bankName')} *</Label>
              <Input 
                placeholder={t('onboarding.bank.bankNamePlaceholder')} 
                value={data.bankName || ''} 
                onChange={(e) => updateData({ bankName: e.target.value })} 
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('onboarding.bank.swift')} *</Label>
              <Input 
                placeholder={t('onboarding.bank.swiftPlaceholder')} 
                value={data.swiftCode || ''} 
                onChange={(e) => updateData({ swiftCode: e.target.value })} 
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>{t('onboarding.bank.iban')} *</Label>
              <Input 
                placeholder={t('onboarding.bank.ibanPlaceholder')} 
                value={data.iban || ''} 
                onChange={(e) => updateData({ iban: e.target.value })} 
                dir="ltr"
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>{t('onboarding.bank.ccpNumber')}</Label>
              <Input 
                placeholder={t('onboarding.bank.ccpNumberPlaceholder')} 
                value={data.ccpNumber || ''} 
                onChange={(e) => updateData({ ccpNumber: e.target.value })} 
                dir="ltr"
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('onboarding.bank.ccpCle')}</Label>
              <Input 
                placeholder={t('onboarding.bank.ccpClePlaceholder')} 
                value={data.ccpCle || ''} 
                onChange={(e) => updateData({ ccpCle: e.target.value })} 
                maxLength={2}
                dir="ltr"
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>{t('onboarding.bank.rip')}</Label>
              <Input 
                placeholder={t('onboarding.bank.ripPlaceholder')} 
                value={data.iban || ''} 
                onChange={(e) => updateData({ iban: e.target.value })} 
                maxLength={20}
                dir="ltr"
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
          </>
        )}
      </div>

      <div className="pt-4 border-t dark:border-slate-800">
        <Label className="text-base font-bold mb-4 block">{t('onboarding.bank.beneficiaryMatch')}</Label>
        <RadioGroup 
          value={data.isBeneficiaryMatching ? 'yes' : 'no'} 
          onValueChange={(val) => updateData({ isBeneficiaryMatching: val === 'yes' })}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <RadioGroupItem value="yes" id="match-yes" />
            <Label htmlFor="match-yes" className="cursor-pointer">
              {isBusiness ? t('onboarding.bank.sameAsCompany') : t('onboarding.bank.sameAsPersonal', 'نعم، اسم المستفيد يطابق اسمي الشخصي')}
            </Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <RadioGroupItem value="no" id="match-no" />
            <Label htmlFor="match-no" className="cursor-pointer">
              {isBusiness ? t('onboarding.bank.diffFromCompany') : t('onboarding.bank.diffFromPersonal', 'لا، اسم المستفيد يختلف عن اسمي الشخصي')}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="pt-4 border-t dark:border-slate-800 space-y-4">
        <Label className="text-base font-bold mb-4 block">{t('onboarding.bank.bankProof')}</Label>
        <p className="text-sm text-gray-500 dark:text-slate-400">{t('onboarding.bank.bankProofDesc')}</p>
        <Input 
          type="file" 
          accept=".pdf,.jpg,.png,.jpeg" 
          className="dark:bg-slate-900 dark:border-slate-800"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const uploadToast = toast.loading(t('onboarding.bank.uploading') || 'جاري رفع إثبات الحساب...');
            const formData = new FormData();
            formData.append('file', file);

            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });
              const json = await res.json();
              if (json.success) {
                updateData({ bankLetterFile: json.url });
                toast.success(t('onboarding.bank.uploadSuccess') || 'تم رفع إثبات الحساب بنجاح!', { id: uploadToast });
              } else {
                toast.error(json.error || 'فشل رفع الملف', { id: uploadToast });
              }
            } catch (err) {
              toast.error('حدث خطأ أثناء رفع الملف', { id: uploadToast });
            }
          }} 
        />
        {data.bankLetterFile && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/30 flex items-center justify-between">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">{t('onboarding.common.uploadSuccess')}</p>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => onPreviewFile(data.bankLetterFile)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {t('onboarding.common.previewFile')}
              </button>
              <span className="text-gray-300 dark:text-slate-700">|</span>
              <a 
                href={data.bankLetterFile} 
                download
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {t('onboarding.common.downloadFile')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
