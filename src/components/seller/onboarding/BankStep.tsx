'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export default function BankStep({ data, updateData, onPreviewFile, isBusiness = true }: { data: any; updateData: (d: any) => void; onPreviewFile: (url: string) => void; isBusiness?: boolean }) {
  const { t, locale } = useTranslation();
  const [paymentType, setPaymentType] = useState<'bank' | 'ccp'>(data.swiftCode ? 'bank' : 'ccp');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Label className="text-base font-bold mb-4 block">{t('طريقة الدفع ومطابقة وسيلة السداد *', 'Payment Method *')}</Label>
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
            <Label htmlFor="type-bank" className="cursor-pointer">{t('حساب بنكي (Bank Account)', 'Bank Account')}</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <RadioGroupItem value="ccp" id="type-ccp" />
            <Label htmlFor="type-ccp" className="cursor-pointer">{t('حساب بريدي جاري (CCP / RIP)', 'CCP / RIP Account')}</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <Label>{t('اسم المستفيد الكامل من الحساب *', 'Beneficiary Full Name *')}</Label>
          <Input 
            placeholder={t('أدخل اسم صاحب الحساب البنكي أو البريدي', 'Enter beneficiary full name')} 
            value={data.beneficiaryName || ''} 
            onChange={(e) => updateData({ beneficiaryName: e.target.value })} 
            className="dark:bg-slate-900 dark:border-slate-800"
          />
        </div>

        {paymentType === 'bank' ? (
          <>
            <div className="space-y-2">
              <Label>{t('اسم البنك *', 'Bank Name *')}</Label>
              <Input 
                placeholder={t('مثال: BDL, CPA, BADR...', 'e.g. BDL, CPA, BADR...')} 
                value={data.bankName || ''} 
                onChange={(e) => updateData({ bankName: e.target.value })} 
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('رمز البنك (SWIFT) *', 'Bank Swift Code *')}</Label>
              <Input 
                placeholder={t('SWIFT / BIC', 'SWIFT / BIC')} 
                value={data.swiftCode || ''} 
                onChange={(e) => updateData({ swiftCode: e.target.value })} 
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>{t('رقم الحساب (RIB / IBAN) *', 'Bank Account Number (RIB / IBAN) *')}</Label>
              <Input 
                placeholder={t('RIB / IBAN (يتكون من 20 رقماً على الأقل)', 'RIB / IBAN (At least 20 digits)')} 
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
              <Label>{t('رقم الحساب البريدي (N° CCP) *', 'CCP Account Number *')}</Label>
              <Input 
                placeholder={t('مثال: 1234567', 'e.g. 1234567')} 
                value={data.ccpNumber || ''} 
                onChange={(e) => updateData({ ccpNumber: e.target.value })} 
                dir="ltr"
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('المفتاح (Clé) *', 'Key (Clé) *')}</Label>
              <Input 
                placeholder={t('مثال: 45', 'e.g. 45')} 
                value={data.ccpCle || ''} 
                onChange={(e) => updateData({ ccpCle: e.target.value })} 
                maxLength={2}
                dir="ltr"
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>{t('الرقم التعريفي البريدي (RIP) المكون من 20 رقماً *', 'Postal RIP Number (20 digits) *')}</Label>
              <Input 
                placeholder={t('مثال: 00799999001234567845', 'e.g. 00799999001234567845')} 
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
        <Label className="text-base font-bold mb-4 block">{t('تطابق اسم المستفيد *', 'Beneficiary Match *')}</Label>
        <RadioGroup 
          value={data.isBeneficiaryMatching ? 'yes' : 'no'} 
          onValueChange={(val) => updateData({ isBeneficiaryMatching: val === 'yes' })}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <RadioGroupItem value="yes" id="match-yes" />
            <Label htmlFor="match-yes" className="cursor-pointer">
              {isBusiness 
                ? t('نعم، اسم المستفيد يطابق الاسم القانوني للشركة', 'Yes, beneficiary matches corporate legal name') 
                : t('نعم، اسم المستفيد يطابق اسمي الشخصي بالكامل', 'Yes, beneficiary matches my personal full name')
              }
            </Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <RadioGroupItem value="no" id="match-no" />
            <Label htmlFor="match-no" className="cursor-pointer">
              {isBusiness 
                ? t('لا، اسم المستفيد يختلف عن اسم الشركة المعتمد', 'No, beneficiary differs from corporate name') 
                : t('لا، اسم المستفيد يختلف عن اسمي الشخصي', 'No, beneficiary differs from my personal name')
              }
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="pt-4 border-t dark:border-slate-800 space-y-4">
        <Label className="text-base font-bold mb-4 block">{t('إثبات وسيلة الدفع والحساب *', 'Payment Account Proof *')}</Label>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('قم بتحميل مستند يثبت ملكية الحساب (شيك ملغى أو شهادة بنكية/بريدية - كحد أقصى 5 ميجابايت)', 'Please upload account ownership proof (voided check or bank certificate - Max 5MB)')}
        </p>
        <Input 
          type="file" 
          accept=".pdf,.jpg,.png,.jpeg" 
          className="dark:bg-slate-900 dark:border-slate-800"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const uploadToast = toast.loading(locale === 'ar' ? 'جاري رفع إثبات الحساب...' : 'Uploading account proof...');
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
                toast.success(locale === 'ar' ? 'تم رفع إثبات الحساب بنجاح!' : 'Account proof uploaded successfully!', { id: uploadToast });
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
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">{t('تم رفع الملف بنجاح', 'File uploaded successfully')}</p>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => onPreviewFile(data.bankLetterFile)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {t('معاينة الملف', 'Preview File')}
              </button>
              <span className="text-gray-300 dark:text-slate-700">|</span>
              <a 
                href={data.bankLetterFile} 
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
