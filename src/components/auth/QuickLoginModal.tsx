'use client';

import React, { useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useAuthFlowStore, type AuthStep } from '@/lib/store/auth-flow';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import ContactStep from './ContactStep';
import OtpStep from './OtpStep';
import RegisterStep from './RegisterStep';
import PasswordLoginStep from './PasswordLoginStep';
import { cn } from '@/lib/utils';

// ============================================
// STEP INDICATOR
// ============================================

const VISUAL_STEPS = ['contact', 'verify', 'password-setup'];

function StepIndicator({ step }: { step: AuthStep }) {
  let displayIdx = 0;
  if (step === 'verify-email' || step === 'verify-phone') displayIdx = 1;
  else if (step === 'password-setup') displayIdx = 2;
  else if (step === 'success') displayIdx = 3;

  const totalSteps = VISUAL_STEPS.length;

  return (
    <div className="flex items-center justify-center gap-2 mb-6 mt-4">
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
  const { t } = useTranslation();

  return (
    <div className="animate-scale-in text-center space-y-4 py-8">
      <div className="mx-auto w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
        <Check className="size-8 text-[var(--success)]" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--success)]">
          {t('checkout.logged_in', 'تم الدخول بنجاح!')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t('checkout.redirecting', 'جاري إعادتك لإكمال الدفع...')}
        </p>
      </div>
    </div>
  );
}


interface QuickLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickLoginModal({ isOpen, onClose, onSuccess }: QuickLoginModalProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const { t } = useTranslation();
  
  const { step, setIntent, setStep } = useAuthFlowStore();
  const activeStep = step === 'success' ? 'success' : step;

  // Setup initial intent and reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIntent('checkout');
      setStep('contact'); // Always start fresh
    }
  }, [isOpen, setIntent, setStep]);

  // Handle success logic
  useEffect(() => {
    if (activeStep === 'success' && isOpen) {
      const timer = setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500); // 1.5 seconds delay to show success animation
      return () => clearTimeout(timer);
    }
  }, [activeStep, isOpen, onClose, onSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 rounded-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="relative">
          {/* Header Banner */}
          <div className="bg-brand/10 p-6 pb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 gradient-brand"></div>
            <DialogTitle className="text-xl font-black font-cairo text-foreground">
              {t('checkout.all_data_secured', 'جميع البيانات مؤمنة')}
            </DialogTitle>
            <p className="text-sm font-semibold text-primary mt-2 flex items-center justify-center gap-1.5">
              <Lock className="size-4" />
              {t('checkout.free_shipping_offer', 'شحن مجاني عرض خاص لك')}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3 text-green-500" />
                {t('checkout.free_return', 'إرجاع مجاني')}
              </span>
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3 text-green-500" />
                {t('checkout.up_to_90_days', 'لمدة تصل إلى ٩٠ يومًا')}
              </span>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 pb-6 bg-surface -mt-4 rounded-t-3xl relative z-10 flex flex-col min-h-[400px]">
            {/* Step Indicator (hide on success) */}
            {activeStep !== 'success' && <StepIndicator step={step} />}

            <div className="flex-1 mt-2">
              {/* Step Content */}
              {activeStep === 'contact' && <ContactStep />}
              {(activeStep === 'verify-email' || activeStep === 'verify-phone') && <OtpStep />}
              {activeStep === 'password-setup' && <RegisterStep />}
              {activeStep === 'password-login' && <PasswordLoginStep />}
              {activeStep === 'success' && <SuccessStep />}
            </div>

            {/* Terms text */}
            {activeStep !== 'success' && (
              <p className="text-[10px] text-center text-muted-foreground mt-6 leading-relaxed">
                {t('checkout.terms_agreement', 'بالمتابعة، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بـ ChariDay.')}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
