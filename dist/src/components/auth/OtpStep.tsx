'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShieldCheck, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthFlowStore } from '@/lib/store/auth-flow';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';

// ============================================
// HELPERS
// ============================================

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

function maskPhone(phone: string): string {
  if (phone.length < 3) return phone;
  const visible = phone.slice(-3);
  const masked = '*'.repeat(Math.max(0, phone.length - 3));
  return masked + visible;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  const maskedUser = user.length > 2 ? user[0] + '***' + user.slice(-1) : '***';
  return maskedUser + '@' + domain;
}

const COUNTDOWN_SECONDS = 60;

// ============================================
// OTP STEP COMPONENT
// ============================================

export default function OtpStep() {
  const locale = useAppStore((s) => s.locale);
  const {
    method,
    phone,
    email,
    countryCode,
    isLoading,
    error,
    otpCode,
    setOtpCode,
    setError,
    verifyOtp,
    setStep,
    sendOtp,
  } = useAuthFlowStore();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNewUserResult, setIsNewUserResult] = useState<boolean | null>(null);
  const [existingUserName, setExistingUserName] = useState<string>('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayContact = method === 'phone'
    ? `${countryCode}${maskPhone(phone)}`
    : maskEmail(email);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const focusInput = (index: number) => {
    requestAnimationFrame(() => {
      inputRefs.current[index]?.focus();
    });
  };

  const handleDigitChange = (index: number, value: string) => {
    if (isSuccess || isLoading) return;
    const digit = value.replace(/\D/g, '').slice(-1);
    setError(null);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < 5) {
      focusInput(index + 1);
    }

    // Auto-submit when all 6 digits filled
    if (digit && newDigits.every((d) => d !== '')) {
      const code = newDigits.join('');
      setOtpCode(code);
      submitOtp(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        focusInput(index - 1);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (isSuccess || isLoading) return;
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    setError(null);

    const nextEmpty = newDigits.findIndex((d) => d === '');
    focusInput(nextEmpty === -1 ? 5 : nextEmpty);

    if (newDigits.every((d) => d !== '')) {
      const code = newDigits.join('');
      setOtpCode(code);
      submitOtp(code);
    }
  };

  const goBackToContact = useCallback(() => {
    setDigits(['', '', '', '', '', '']);
    setError(null);
    setIsSuccess(false);
    setIsNewUserResult(null);
    setOtpCode('');
    setStep('contact');
  }, [setStep, setError, setOtpCode]);

  const submitOtp = async (code: string) => {
    setIsSuccess(false);
    setIsNewUserResult(null);
    setIsShaking(false);

    // Temporarily set otpCode in store so verifyOtp can read it
    setOtpCode(code);

    // Small delay to let store update
    await new Promise((r) => setTimeout(r, 50));

    const result = await verifyOtp();

    if (result.verified) {
      setIsSuccess(true);

      if (!result.isNewUser) {
        // Existing user
        setIsNewUserResult(false);
        if (result.user) {
          setExistingUserName(result.user.name);
        }
        toast.success(t(locale, 'تم التحقق بنجاح!', 'Verified successfully!'));
      } else {
        // New user
        setIsNewUserResult(true);
        toast.success(t(locale, 'تم التحقق! أكمل التسجيل', 'Verified! Complete your registration'));
        // Auto-advance to register step after 1s
        setTimeout(() => {
          setStep('register');
        }, 1000);
      }
    } else {
      // Verification failed
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      setDigits(['', '', '', '', '', '']);
      setOtpCode('');
      focusInput(0);
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading || isSuccess) return;

    setCountdown(COUNTDOWN_SECONDS);
    setCanResend(false);
    setDigits(['', '', '', '', '', '']);
    setError(null);
    focusInput(0);

    // Try resend via API
    const ok = await sendOtp();
    if (ok) {
      toast.info(t(locale, 'تم إعادة إرسال الرمز', 'Code resent'));
    } else {
      toast.error(t(locale, 'فشل إعادة الإرسال', 'Failed to resend code'));
    }

    // Restart countdown
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header with Shield Icon */}
      <div className="text-center space-y-1">
        <div className="mx-auto w-14 h-14 rounded-full bg-[var(--surface)] flex items-center justify-center mb-3">
          <ShieldCheck className={cn(
            'size-7 transition-colors duration-300',
            isSuccess ? 'text-[var(--success)]' : 'text-[var(--navy)]',
          )} />
        </div>
        <h2 className="text-xl font-bold">
          {t(locale, 'تحقق من الرمز', 'Verify Code')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t(locale, 'أدخل رمز التحقق المكون من 6 أرقام', 'Enter the 6-digit verification code')}
        </p>
      </div>

      {/* Display masked contact */}
      <div className="text-center">
        <span className="text-sm font-medium text-[var(--foreground)]" dir="ltr">
          {displayContact}
        </span>
      </div>

      {/* OTP Input Boxes */}
      <div
        className={cn(
          'flex items-center justify-center gap-2',
          isShaking && 'animate-[shake_0.6s_ease-in-out]',
        )}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            dir="ltr"
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={isLoading || isSuccess}
            autoFocus={i === 0}
            className={cn(
              'w-11 h-13 rounded-lg border-2 text-center text-xl font-bold transition-all duration-200 outline-none',
              'focus:ring-0 focus:outline-none',
              digit && !isSuccess && 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--navy)]',
              !digit && !error && 'border-[var(--border)] bg-[var(--surface)]',
              error && !isSuccess && 'border-[var(--destructive)] bg-[var(--destructive)]/5',
              isSuccess && 'border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]',
              isLoading && 'opacity-50 cursor-wait',
              'disabled:cursor-not-allowed',
            )}
          />
        ))}
      </div>

      {/* Success state */}
      {isSuccess && (
        <div className="flex items-center justify-center gap-2 text-[var(--success)] animate-fade-in">
          <Check className="size-5" />
          <span className="text-sm font-medium">
            {isNewUserResult === false && existingUserName
              ? t(locale, `مرحباً بعودتك ${existingUserName}!`, `Welcome back ${existingUserName}!`)
              : isNewUserResult === true
                ? t(locale, 'تم التحقق! أكمل التسجيل', 'Verified! Complete your registration')
                : t(locale, 'تم التحقق بنجاح ✓', 'Verified successfully ✓')
            }
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <p className="text-sm text-[var(--destructive)] text-center animate-fade-in">
          {error}
        </p>
      )}

      {/* Verifying indicator */}
      {isLoading && !isSuccess && (
        <div className="flex items-center justify-center gap-2 text-[var(--muted-foreground)]">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">{t(locale, 'جاري التحقق...', 'Verifying...')}</span>
        </div>
      )}

      {/* Back to contact button */}
      <button
        type="button"
        onClick={goBackToContact}
        className={cn(
          'flex items-center justify-center gap-1.5 w-full text-sm font-medium py-2 rounded-lg transition-colors',
          locale === 'ar' ? 'flex-row-reverse' : '',
          !isLoading && !isSuccess
            ? 'text-[var(--navy)] hover:bg-[var(--surface)]'
            : 'text-[var(--muted-foreground)] cursor-not-allowed',
        )}
      >
        {locale === 'ar'
          ? <ArrowRight className="size-3.5" />
          : <ArrowLeft className="size-3.5" />
        }
        {method === 'phone'
          ? t(locale, 'تغيير الرقم', 'Change number')
          : t(locale, 'تغيير البريد', 'Change email')}
      </button>

      {/* Resend */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isLoading || isSuccess}
          className={cn(
            'font-medium transition-colors',
            canResend && !isSuccess
              ? 'text-[var(--navy)] hover:underline'
              : 'text-[var(--muted-foreground)] cursor-not-allowed',
          )}
        >
          {t(locale, 'إعادة الإرسال', 'Resend')}
          {!canResend && !isSuccess && (
            <span className="ms-1 font-mono text-xs">({formatCountdown(countdown)})</span>
          )}
        </button>
      </div>

      {/* Demo code hint */}
      <div className="text-center">
        <p className="text-xs text-[var(--muted-foreground)] bg-[var(--surface)] rounded-md px-3 py-2 inline-block">
          🔑 {t(locale, 'رمز تجريبي: 123456', 'Demo code: 123456')}
        </p>
      </div>
    </div>
  );
}
