'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthFlowStore, type AuthStep } from '@/lib/store/auth-flow';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';
import ContactStep from './ContactStep';
import OtpStep from './OtpStep';
import RegisterStep from './RegisterStep';

// ============================================
// HELPERS
// ============================================

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

// ============================================
// STEP INDICATOR
// ============================================

const FLOW_STEPS: AuthStep[] = ['contact', 'otp', 'register'];

function StepIndicator({ step }: { step: AuthStep }) {
  const currentIdx = FLOW_STEPS.indexOf(step);
  const totalSteps = FLOW_STEPS.length;

  // Only show up to 3 steps (contact, otp, register)
  // For the success step, show all dots as completed
  const displayIdx = step === 'success' ? totalSteps : currentIdx;

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              i < displayIdx
                ? 'bg-[var(--brand)]'
                : i === displayIdx
                  ? 'bg-[var(--brand)] scale-125 shadow-[var(--shadow-brand)]'
                  : 'bg-[var(--border)]',
            )}
          />
          {i < totalSteps - 1 && (
            <div
              className={cn(
                'w-8 h-0.5 rounded-full transition-colors duration-300',
                i < displayIdx ? 'bg-[var(--brand)]' : 'bg-[var(--border)]',
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================
// SUCCESS STEP
// ============================================

function SuccessStep() {
  const locale = useAppStore((s) => s.locale);

  return (
    <div className="animate-scale-in text-center space-y-4 py-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
        <Check className="size-8 text-[var(--success)]" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--success)]">
          {t(locale, 'تم بنجاح!', 'Success!')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t(locale, 'جاري تحويلك...', 'Redirecting you...')}
        </p>
      </div>
    </div>
  );
}

// ============================================
// AUTH PAGE (MAIN CONTAINER)
// ============================================

export default function AuthPage() {
  const locale = useAppStore((s) => s.locale);
  const { step } = useAuthFlowStore();

  const activeStep = step === 'success' ? 'success' : step;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--surface)]">
      <div className="w-full max-w-md">
        <Card className="card-surface overflow-hidden">
          {/* Brand Header */}
          <div className="gradient-brand py-6 flex flex-col items-center justify-center gap-2">
            <span className="text-3xl font-extrabold text-[var(--navy)]">
              {locale === 'ar' ? 'شاري داي' : 'ChariDay'}
            </span>
            <span className="text-xs text-[var(--navy)]/70 font-medium">
              {t(locale, 'تسوق بذكاء، بيع بسهولة', 'Shop smart, sell easy')}
            </span>
          </div>

          {/* Content */}
          <CardContent className="p-6">
            {/* Step Indicator (hide on success) */}
            {activeStep !== 'success' && <StepIndicator step={step} />}

            {/* Step Content */}
            {activeStep === 'contact' && <ContactStep />}
            {activeStep === 'otp' && <OtpStep />}
            {activeStep === 'register' && <RegisterStep />}
            {activeStep === 'success' && <SuccessStep />}
          </CardContent>

          {/* Footer */}
          {activeStep !== 'success' && (
            <div className="px-6 pb-6">
              <p className="text-xs text-center text-[var(--muted-foreground)]">
                {t(locale, 'المتابعة تعني موافقتك على', 'By continuing, you agree to our')}
                {' '}
                <a href="#" className="text-[var(--navy)] underline underline-offset-2 hover:opacity-80">
                  {t(locale, 'شروط الاستخدام', 'Terms of Service')}
                </a>
                {' & '}
                <a href="#" className="text-[var(--navy)] underline underline-offset-2 hover:opacity-80">
                  {t(locale, 'سياسة الخصوصية', 'Privacy Policy')}
                </a>
              </p>
            </div>
          )}
        </Card>

        {/* Bottom branding */}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-4">
          © 2024 ChariDay — {t(locale, 'جميع الحقوق محفوظة', 'All rights reserved')}
        </p>
      </div>
    </div>
  );
}
