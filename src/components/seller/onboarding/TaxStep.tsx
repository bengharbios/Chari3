'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function TaxStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-bold mb-4 block">{t('onboarding.tax.hasVat')}</Label>
        <RadioGroup 
          value={data.hasVat ? 'yes' : 'no'} 
          onValueChange={(val) => updateData({ hasVat: val === 'yes' })}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="yes" id="vat-yes" />
            <Label htmlFor="vat-yes" className="cursor-pointer">{t('onboarding.tax.yesVat')}</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="no" id="vat-no" />
            <Label htmlFor="vat-no" className="cursor-pointer">{t('onboarding.tax.noVat')}</Label>
          </div>
        </RadioGroup>
      </div>

      {data.hasVat && (
        <div className="space-y-6 pt-4 border-t">
          <div className="space-y-2">
            <Label>{t('onboarding.tax.trn')}</Label>
            <Input 
              placeholder="e.g. 10023000..." 
              value={data.vatNumber || ''} 
              onChange={(e) => updateData({ vatNumber: e.target.value })} 
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">{t('onboarding.tax.uploadDoc')}</Label>
            <p className="text-sm text-gray-500">{t('onboarding.tax.fileDesc')}</p>
            <Input 
              type="file" 
              accept=".pdf,.jpg,.png" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) updateData({ vatCertificateFile: 'https://fake-s3.com/vat.pdf' });
              }} 
            />
            {data.vatCertificateFile && <p className="text-sm text-green-600">{t('onboarding.common.uploadSuccess')}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
