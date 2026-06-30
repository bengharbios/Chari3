"use client";

import React from 'react';
import { useOnboardingStore } from '@/lib/store/onboarding';
import { User, Building2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface MerchantTypeSelectorProps {
  onNext: () => void;
}

export function MerchantTypeSelector({ onNext }: MerchantTypeSelectorProps) {
  const { merchantType, setMerchantType } = useOnboardingStore();
  const { t } = useTranslation();

  const options = [
    {
      id: 'individual' as const,
      icon: User,
      title: t('بائع فردي / مستقل', 'Individual / Freelancer'),
      description: t(
        'مثالي للأفراد وأصحاب العمل الحر. يتطلب فقط الهوية الوطنية والحساب البنكي الشخصي.',
        'Perfect for individuals and freelancers. Requires only National ID and personal bank account.'
      ),
    },
    {
      id: 'business' as const,
      icon: Building2,
      title: t('حساب شركات / مؤسسات', 'Business / Corporate'),
      description: t(
        'مخصص للشركات المسجلة قانونياً. يتطلب سجل تجاري وحساب بنكي تجاري.',
        'For legally registered businesses. Requires Commercial Register and corporate bank account.'
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('اختر نوع الحساب', 'Choose Account Type')}
        </h2>
        <p className="text-gray-500">
          {t(
            'حدد نوع نشاطك التجاري لنتمكن من تخصيص تجربة التوثيق لك.',
            'Select your business type so we can customize your verification experience.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = merchantType === option.id;

          return (
            <button
              key={option.id}
              onClick={() => setMerchantType(option.id)}
              className={cn(
                "relative p-6 rounded-2xl border-2 text-start transition-all duration-300",
                "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-gray-200 hover:border-primary/50 bg-white"
              )}
            >
              {isSelected && (
                <div className="absolute top-4 rtl:left-4 ltr:right-4 text-primary animate-scale-in">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
                  isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
        >
          {t('متابعة', 'Continue')}
        </button>
      </div>
    </div>
  );
}
