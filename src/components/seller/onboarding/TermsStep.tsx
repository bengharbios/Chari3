'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function TermsStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-lg border dark:border-slate-800 h-64 overflow-y-auto text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
        <h3 className="font-bold text-lg mb-4">{t('onboarding.terms.termsTitle')}</h3>
        <p className="mb-4">
          {t('onboarding.terms.intro')}
        </p>
        <p className="mb-4">
          {t('onboarding.terms.rule1')}
        </p>
        <p className="mb-4">
          {t('onboarding.terms.rule2')}
        </p>
        <p className="mb-4">
          {t('onboarding.terms.rule3')}
        </p>
        <p className="mb-4">
          {t('onboarding.terms.rule4')}
        </p>
        <p className="mb-4">
          {t('onboarding.terms.rule5')}
        </p>
      </div>

      <div className="flex items-start space-x-3 space-x-reverse bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-slate-800">
        <Checkbox 
          id="terms" 
          checked={data.agreedToTerms || false}
          onCheckedChange={(checked) => updateData({ agreedToTerms: checked === true })}
        />
        <div className="grid gap-1.5 leading-none mt-1">
          <Label 
            htmlFor="terms" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {t('onboarding.terms.agreeCheckbox')}
          </Label>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('onboarding.terms.agreeCheckboxDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
