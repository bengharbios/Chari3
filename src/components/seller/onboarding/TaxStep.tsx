'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export default function TaxStep({ data, updateData, onPreviewFile }: { data: any; updateData: (d: any) => void; onPreviewFile: (url: string) => void }) {
  const { t, locale } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-bold mb-4 block">{t('onboarding.tax.hasVat')}</Label>
        <RadioGroup 
          value={data.hasVat ? 'yes' : 'no'} 
          onValueChange={(val) => updateData({ hasVat: val === 'yes' })}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <RadioGroupItem value="yes" id="vat-yes" />
            <Label htmlFor="vat-yes" className="cursor-pointer">{t('onboarding.tax.yesVat')}</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border dark:border-slate-800 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <RadioGroupItem value="no" id="vat-no" />
            <Label htmlFor="vat-no" className="cursor-pointer">{t('onboarding.tax.noVat')}</Label>
          </div>
        </RadioGroup>
      </div>

      {data.hasVat && (
        <div className="space-y-6 pt-4 border-t dark:border-slate-800">
          <div className="space-y-2">
            <Label>{t('onboarding.tax.trn')}</Label>
            <Input 
              placeholder="e.g. 10023000..." 
              value={data.vatNumber || ''} 
              onChange={(e) => updateData({ vatNumber: e.target.value })} 
              className="dark:bg-slate-900 dark:border-slate-800"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">{t('onboarding.tax.uploadDoc')}</Label>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('onboarding.tax.fileDesc')}</p>
            <Input 
              type="file" 
              accept=".pdf,.jpg,.png" 
              className="dark:bg-slate-900 dark:border-slate-800"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const uploadToast = toast.loading(locale === 'ar' ? 'جاري رفع شهادة الضريبة...' : 'Uploading VAT certificate...');
                const formData = new FormData();
                formData.append('file', file);

                try {
                  const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  const json = await res.json();
                  if (json.success) {
                    updateData({ vatCertificateFile: json.url });
                    toast.success(locale === 'ar' ? 'تم رفع شهادة الضريبة بنجاح!' : 'VAT certificate uploaded successfully!', { id: uploadToast });
                  } else {
                    toast.error(json.error || (locale === 'ar' ? 'فشل رفع الملف' : 'Upload failed'), { id: uploadToast });
                  }
                } catch (err) {
                  toast.error(locale === 'ar' ? 'حدث خطأ أثناء رفع الملف' : 'Error uploading file', { id: uploadToast });
                }
              }} 
            />
            {data.vatCertificateFile && (
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/30 flex items-center justify-between">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">{t('onboarding.common.uploadSuccess')}</p>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => onPreviewFile(data.vatCertificateFile)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {t('onboarding.common.previewFile')}
                  </button>
                  <span className="text-gray-300 dark:text-slate-700">|</span>
                  <a 
                    href={data.vatCertificateFile} 
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
      )}
    </div>
  );
}

