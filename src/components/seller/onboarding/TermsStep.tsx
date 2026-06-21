'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function TermsStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg border h-64 overflow-y-auto text-sm text-gray-700 leading-relaxed">
        <h3 className="font-bold text-lg mb-4">شروط وأحكام استخدام منصة شاري داي للتجار</h3>
        <p className="mb-4">
          مرحباً بك في منصة شاري داي. تشكل هذه الشروط والأحكام اتفاقية ملزمة قانوناً بينك كتاجر وبين منصة شاري داي.
          يرجى قراءتها بعناية قبل الموافقة.
        </p>
        <p className="mb-4">
          1. <strong>العمولات والمبيعات:</strong> يوافق التاجر على نسبة العمولة المحددة لكل طلب والتي يتم خصمها تلقائياً.
        </p>
        <p className="mb-4">
          2. <strong>المنتجات المحظورة:</strong> يُمنع منعاً باتاً عرض أي منتجات مخالفة للقانون الجزائري أو الشريعة الإسلامية.
        </p>
        <p className="mb-4">
          3. <strong>الشحن والتوصيل:</strong> يلتزم التاجر بتجهيز الطلبات في الوقت المحدد وتسليمها لمندوبي الشحن لتجنب أي عقوبات.
        </p>
        <p className="mb-4">
          4. <strong>الضمان والاسترجاع:</strong> يلتزم التاجر بسياسة الاسترجاع الخاصة بالمنصة والتي تحمي حق المشتري في استرجاع المنتجات المعيبة خلال 7 أيام.
        </p>
        <p className="mb-4">
          5. <strong>سياسة الخصوصية:</strong> يوافق التاجر على معالجة بياناته واستخدامها لأغراض التحقق الداخلي والمطابقات القانونية والمالية.
        </p>
      </div>

      <div className="flex items-start space-x-3 space-x-reverse bg-blue-50 p-4 rounded-lg border border-blue-100">
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
            أقر وأوافق على جميع الشروط والأحكام الخاصة بالبائعين
          </Label>
          <p className="text-sm text-gray-500">
            بموافقتك، تعتبر هذه الوثيقة عقداً ملزماً لبدء العمل على منصة شاري داي.
          </p>
        </div>
      </div>
    </div>
  );
}
