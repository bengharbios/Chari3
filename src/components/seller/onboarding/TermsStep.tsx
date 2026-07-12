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
        <h3 className="font-bold text-lg mb-4">{t('شروط وأحكام منصة شاري داي للتاجر الموثق', 'ChariDay Verified Merchant Terms & Conditions')}</h3>
        <p className="mb-4">
          {t(
            'بصفتك بائعاً مسجلاً أو متجراً معتمداً على منصة شاري داي، فإنك تقر وتلتزم بكافة الضوابط والقوانين التجارية المعمول بها في الجزائر.',
            'As a registered seller or verified store on ChariDay, you acknowledge and agree to comply with all applicable commercial laws in Algeria.'
          )}
        </p>
        <p className="mb-4">
          <strong>1. {t('المصداقية وجودة المنتجات:', 'Authenticity & Product Quality:')}</strong>{' '}
          {t(
            'يلتزم التاجر بتقديم معلومات صحيحة ودقيقة حول السجل التجاري ورقم التعريف الضريبي (NIF)، ويحظر تماماً بيع المنتجات المقلدة أو منتهية الصلاحية.',
            'The merchant agrees to provide accurate Commercial Register and NIF details. Selling counterfeit or expired products is strictly prohibited.'
          )}
        </p>
        <p className="mb-4">
          <strong>2. {t('السياسة المالية والمعاملات:', 'Financial Policy & Transactions:')}</strong>{' '}
          {t(
            'يتم تحويل الأرباح إلى الحساب البريدي الجاري (CCP) أو الحساب البنكي المعتمد والمرفق في ملف التوثيق المالي. المنصة تخلي مسؤوليتها عن أي بيانات خاطئة يتم إدخالها.',
            'Payouts are processed only to the verified bank or CCP account provided in this dashboard. The platform is not responsible for incorrect details.'
          )}
        </p>
        <p className="mb-4">
          <strong>3. {t('حماية البيانات والأمان:', 'Data Protection & Security:')}</strong>{' '}
          {t(
            'تلتزم المنصة بحماية وسرية كافة المستندات المرفوعة (مثل صور الهوية الوطنية والسجل التجاري) واستخدامها فقط لأغراض التوثيق والتحقق الأمني الداخلي.',
            'We guarantee the privacy and safety of all uploaded identity documents and registers, using them solely for security audits and verification.'
          )}
        </p>
        <p className="mb-4">
          <strong>4. {t('تأكيد الطلبات والشحن:', 'Order Fulfillment & Shipping:')}</strong>{' '}
          {t(
            'يتعهد التاجر بتأكيد الطلبات الواردة وشحنها للعملاء في غضون الآجال المحددة وضمان تقديم تجربة تسوق راقية للمشترين.',
            'Merchants promise to confirm and ship orders within the designated timeframe, ensuring a premium shopping experience for buyers.'
          )}
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
            {t('أوافق على كافة الشروط والأحكام المذكورة أعلاه *', 'I agree to the terms and conditions stated above *')}
          </Label>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('بالتأشير هنا، فإنك تؤكد صحة البيانات والمستندات القانونية المرفوعة.', 'By checking this box, you confirm the accuracy of all submitted legal documents.')}
          </p>
        </div>
      </div>
    </div>
  );
}
