'use client';

import React from 'react';
import { Check, ShoppingCart, Truck, ShieldCheck, Star } from 'lucide-react';
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
// HERO BANNER — Marketing content above auth form
// ============================================

function HeroBanner() {
  const locale = useAppStore((s) => s.locale);

  const features = [
    { icon: ShoppingCart, ar: 'آلاف المنتجات', en: 'Thousands of Products' },
    { icon: Truck, ar: 'توصيل سريع', en: 'Fast Delivery' },
    { icon: ShieldCheck, ar: 'دفع آمن', en: 'Secure Payment' },
    { icon: Star, ar: 'تقييمات حقيقية', en: 'Real Reviews' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--navy)] via-[var(--navy-light)] to-[var(--navy)] text-white p-8 md:p-12 mb-6">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 start-4 h-32 w-32 rounded-full bg-brand blur-3xl" />
        <div className="absolute bottom-4 end-4 h-24 w-24 rounded-full bg-brand blur-3xl" />
      </div>

      <div className="relative z-10 text-center space-y-6">
        {/* Logo */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {t(locale, 'شاري داي', 'CharyDay')}
          </h1>
          <p className="text-lg text-white/80 font-medium max-w-md mx-auto">
            {t(locale, 'منصة التجارة الإلكترونية الأولى في الجزائر', 'The First E-Commerce Platform in Algeria')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {features.map(({ icon: Icon, ar, en }) => (
            <div
              key={ar}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-white/90"
            >
              <Icon className="h-4 w-4 text-[var(--brand)] shrink-0" />
              <span>{t(locale, ar, en)}</span>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p className="text-xs text-white/50">
          {t(locale, 'تسوق بذكاء، بيع بسهولة — انضم إلينا الآن', 'Shop smart, sell easy — Join us now')}
        </p>
      </div>
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
      <div className="w-full max-w-md py-8">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Auth Card */}
        <Card className="card-surface overflow-hidden">
          {/* Brand Header */}
          <div className="gradient-brand py-5 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl font-extrabold text-[var(--navy)]">
              {t(locale, 'تسجيل الدخول', 'Sign In')}
            </span>
            <span className="text-xs text-[var(--navy)]/70 font-medium">
              {t(locale, 'أدخل رقم هاتفك أو بريدك الإلكتروني', 'Enter your phone number or email')}
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

        {/* Bottom branding — Fixed: 2025 + CharyDay */}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-4">
          © 2025 {t('شاري داي', 'CharyDay')} — {t(locale, 'جميع الحقوق محفوظة', 'All rights reserved')}
        </p>
      </div>
    </div>
  );
}