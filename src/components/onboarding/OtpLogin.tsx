'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Store,
  UserCircle,
  Package,
  Truck,
  ShoppingCart,
  Check,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useOnboardingStore, type OtpLoginStep } from '@/lib/store/onboarding';
import type { UserRole, Locale } from '@/types';
import { cn } from '@/lib/utils';

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

// ============================================
// ROLE CONFIG
// ============================================

interface RoleOption {
  id: UserRole;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: React.ElementType;
  bgClass: string;
  emoji: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'store_manager',
    labelAr: 'متجر رسمي',
    labelEn: 'Official Store',
    descAr: 'متجر كامل مع فريق عمل',
    descEn: 'Full store with team access',
    icon: Store,
    bgClass: 'bg-[var(--navy)]',
    emoji: '🏢',
  },
  {
    id: 'seller',
    labelAr: 'تاجر مستقل',
    labelEn: 'Freelancer',
    descAr: 'بيع منتجاتك بسهولة',
    descEn: 'Sell your products easily',
    icon: UserCircle,
    bgClass: 'bg-purple-600',
    emoji: '👤',
  },
  {
    id: 'supplier',
    labelAr: 'مورد',
    labelEn: 'Supplier',
    descAr: 'توريد بالجملة للمنصات',
    descEn: 'Wholesale supply for platforms',
    icon: Package,
    bgClass: 'bg-orange-500',
    emoji: '📦',
  },
  {
    id: 'logistics',
    labelAr: 'شركة شحن',
    labelEn: 'Logistics',
    descAr: 'إدارة الشحن والتوصيل',
    descEn: 'Manage shipping & delivery',
    icon: Truck,
    bgClass: 'bg-cyan-600',
    emoji: '🚚',
  },
  {
    id: 'buyer',
    labelAr: 'مشتري',
    labelEn: 'Buyer',
    descAr: 'تسوق واطلب أونلاين',
    descEn: 'Shop & order online',
    icon: ShoppingCart,
    bgClass: 'bg-green-600',
    emoji: '🛒',
  },
];

const COUNTDOWN_SECONDS = 60;

const COUNTRY_CODES = [
  { code: '+213', label: 'DZ', flag: '🇩🇿' },
  { code: '+216', label: 'TN', flag: '🇹🇳' },
  { code: '+212', label: 'MA', flag: '🇲🇦' },
  { code: '+966', label: 'SA', flag: '🇸🇦' },
  { code: '+971', label: 'AE', flag: '🇦🇪' },
  { code: '+965', label: 'KW', flag: '🇰🇼' },
  { code: '+974', label: 'QA', flag: '🇶🇦' },
  { code: '+968', label: 'OM', flag: '🇴🇲' },
  { code: '+973', label: 'BH', flag: '🇧🇭' },
  { code: '+20', label: 'EG', flag: '🇪🇬' },
  { code: '+962', label: 'JO', flag: '🇯🇴' },
  { code: '+961', label: 'LB', flag: '🇱🇧' },
  { code: '+964', label: 'IQ', flag: '🇮🇶' },
  { code: '+90', label: 'TR', flag: '🇹🇷' },
  { code: '+33', label: 'FR', flag: '🇫🇷' },
];

// ============================================
// STEP INDICATOR
// ============================================

const FLOW_STEPS: OtpLoginStep[] = ['phone', 'otp', 'role', 'basic-info'];

function StepIndicator({ step, locale }: {
  step: OtpLoginStep;
  locale: Locale;
}) {
  const currentIdx = FLOW_STEPS.indexOf(step);
  const totalSteps = 4;

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              i < currentIdx
                ? 'bg-[var(--brand)]'
                : i === currentIdx
                  ? 'bg-[var(--brand)] scale-125 shadow-[var(--shadow-brand)]'
                  : 'bg-[var(--border)]',
            )}
          />
          {i < totalSteps - 1 && (
            <div
              className={cn(
                'w-8 h-0.5 rounded-full transition-colors duration-300',
                i < currentIdx ? 'bg-[var(--brand)]' : 'bg-[var(--border)]',
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================
// STEP 1: PHONE / EMAIL ENTRY
// ============================================

function PhoneEmailEntry({ locale }: { locale: Locale }) {
  const store = useOnboardingStore();
  const { contactMethod, phone, email } = store;
  const [error, setError] = useState('');
  const [countryCode, setCountryCode] = useState('+213');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setError('');
    if (contactMethod === 'phone') {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 9) {
        setError(t(locale, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل', 'Phone number must be at least 9 digits'));
        return;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError(t(locale, 'البريد الإلكتروني غير صالح', 'Invalid email address'));
        return;
      }
    }

    setIsSending(true);

    // Call real API
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: contactMethod,
          value: contactMethod === 'phone' ? phone : email,
          countryCode: countryCode,
        }),
      });
      const data = await res.json();
      setIsSending(false);
      if (data.success) {
        // Show the OTP code for testing (no real SMS/email yet)
        if (data._devCode) {
          toast.info(
            t(locale, `رمز التحقق: ${data._devCode}`, `Verification code: ${data._devCode}`),
            { duration: 10000 }
          );
        }
        store.otpNextStep();
      } else {
        setError(data.message || t(locale, 'حدث خطأ', 'An error occurred'));
      }
    } catch {
      // Fallback to local flow for demo
      setIsSending(false);
      store.otpNextStep();
    }
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold">
          {t(locale, 'تسجيل الدخول', 'Sign In')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t(locale, 'أدخل رقم هاتفك أو بريدك الإلكتروني', 'Enter your phone number or email')}
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex rounded-lg bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => { store.setContactMethod('phone'); setError(''); }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all',
            contactMethod === 'phone'
              ? 'gradient-navy text-[var(--navy-foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
          )}
        >
          <Phone className="size-4" />
          {t(locale, 'هاتف', 'Phone')}
        </button>
        <button
          type="button"
          onClick={() => { store.setContactMethod('email'); setError(''); }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all',
            contactMethod === 'email'
              ? 'gradient-navy text-[var(--navy-foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
          )}
        >
          <Mail className="size-4" />
          Email
        </button>
      </div>

      {/* Phone Mode */}
      {contactMethod === 'phone' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {/* Country Code Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="flex items-center gap-1.5 h-9 ps-3 pe-2 rounded-md border border-[var(--input)] bg-transparent text-sm font-medium hover:bg-[var(--surface)] transition-colors"
              >
                <span>{selectedCountry.flag}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{countryCode}</span>
                <svg className="size-3 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCountryPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCountryPicker(false)} />
                  <div className="absolute top-full mt-1 start-0 z-50 w-48 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg py-1 animate-fade-in">
                    {COUNTRY_CODES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(c.code);
                          setShowCountryPicker(false);
                        }}
                        className={cn(
                          'flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--surface)] transition-colors',
                          c.code === countryCode && 'bg-[var(--surface)] font-medium',
                        )}
                      >
                        <span>{c.flag}</span>
                        <span>{c.code}</span>
                        <span className="text-[var(--muted-foreground)]">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Phone Input */}
            <Input
              type="tel"
              dir="ltr"
              placeholder="5XXXXXXXX"
              value={phone}
              onChange={(e) => store.setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
              className="flex-1 text-start font-mono tracking-wider"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
        </div>
      )}

      {/* Email Mode */}
      {contactMethod === 'email' && (
        <div>
          <Input
            type="email"
            dir="ltr"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => store.setEmail(e.target.value)}
            className="text-start"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-[var(--destructive)] text-center animate-fade-in">{error}</p>
      )}

      {/* Send Code Button */}
      <Button
        onClick={handleSend}
        disabled={isSending}
        className="w-full h-11 gradient-navy text-[var(--navy-foreground)] font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        {isSending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {t(locale, 'جاري الإرسال...', 'Sending...')}
          </span>
        ) : (
          t(locale, 'إرسال رمز التحقق', 'Send Verification Code')
        )}
      </Button>

      {/* Footer Note */}
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
  );
}

// ============================================
// STEP 2: OTP VERIFICATION
// ============================================

function OtpVerification({ locale }: { locale: Locale }) {
  const store = useOnboardingStore();
  const { contactMethod, phone, email } = store;
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [countryCode] = useState('+213');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayContact = contactMethod === 'phone'
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
    if (isSuccess || isVerifying) return;
    const digit = value.replace(/\D/g, '').slice(-1);
    setError('');

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < 5) {
      focusInput(index + 1);
    }

    // Auto-submit when all 6 digits filled
    if (digit && newDigits.every((d) => d !== '')) {
      const code = newDigits.join('');
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
    if (isSuccess || isVerifying) return;
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    setError('');

    const nextEmpty = newDigits.findIndex((d) => d === '');
    focusInput(nextEmpty === -1 ? 5 : nextEmpty);

    if (newDigits.every((d) => d !== '')) {
      const code = newDigits.join('');
      submitOtp(code);
    }
  };

  const goBackToPhone = useCallback(() => {
    setDigits(['', '', '', '', '', '']);
    setError('');
    setIsVerifying(false);
    setIsSuccess(false);
    store.setOtpStep('phone');
  }, [store]);

  const submitOtp = async (code: string) => {
    setIsVerifying(true);
    setError('');

    // Abort controller with 20s timeout for slow MySQL on Hostinger
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: store.contactMethod,
          value: store.contactMethod === 'phone' ? store.phone : store.email,
          code,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      setIsVerifying(false);

      if (data.verified) {
        setIsSuccess(true);
        store.setOtpVerified(true);

        // Store user info if returning user
        if (data.user) {
          // ── SECURITY: Verify returned user matches submitted contact ──
          const returnedUser = data.user as Record<string, unknown>;
          const submittedValue = store.contactMethod === 'phone' ? store.phone : store.email;
          const userPhone = returnedUser.phone as string | null;
          const userEmail = returnedUser.email as string | null;
          const isMatch =
            (store.contactMethod === 'phone' && userPhone === submittedValue) ||
            (store.contactMethod === 'email' && userEmail === submittedValue);

          if (!isMatch) {
            console.error('[otp] SECURITY: User mismatch after verification!', {
              submitted: submittedValue,
              returned: { phone: userPhone, email: userEmail },
            });
            toast.error(t(locale, 'خطأ في التحقق. حاول مرة أخرى.', 'Verification error. Please try again.'));
            setDigits(['', '', '', '', '', '']);
            setIsSuccess(false);
            focusInput(0);
            return;
          }

          store.setFullName(data.user.name);
          if (data.user.role) store.setSelectedRole(data.user.role as UserRole);
        }

        toast.success(t(locale, 'تم التحقق بنجاح!', 'Verified successfully!'));

        // If existing user, log them in directly (any status: active, incomplete, pending)
        if (data.user && !data.isNewUser) {
          setTimeout(() => {
            const { loginWithUser } = useAuthStore.getState();
            loginWithUser(data.user as unknown as import('@/types').User);
            // Reset OTP flow so returning users don't see registration again
            store.resetOtpFlow();
          }, 1000);
        } else {
          // New user — proceed to role selection
          setTimeout(() => {
            store.setOtpStep('role');
          }, 1000);
        }
      } else if (res.status === 429) {
        // Rate limited
        setError(t(locale, 'محاولات كثيرة. انتظر قليلاً ثم حاول مجدداً', 'Too many attempts. Please wait and try again.'));
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
        setDigits(['', '', '', '', '', '']);
        focusInput(0);
      } else {
        setError(t(locale, 'رمز التحقق غير صحيح', 'Incorrect verification code'));
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
        setDigits(['', '', '', '', '', '']);
        focusInput(0);
      }
    } catch {
      // Timeout or network error — fallback to local mock verification
      clearTimeout(timeoutId);
      setIsVerifying(false);
      const isValid = store.verifyOtp(code);
      if (isValid) {
        setIsSuccess(true);
        store.setOtpVerified(true);
        toast.success(t(locale, 'تم التحقق بنجاح!', 'Verified successfully!'));
        setTimeout(() => {
          store.setOtpStep('role');
        }, 1000);
      } else {
        setError(t(locale, 'رمز التحقق غير صحيح', 'Incorrect verification code'));
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
        setDigits(['', '', '', '', '', '']);
        focusInput(0);
      }
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCountdown(COUNTDOWN_SECONDS);
    setCanResend(false);
    setDigits(['', '', '', '', '', '']);
    setError('');
    focusInput(0);

    // Try real API resend
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: store.contactMethod,
          value: store.contactMethod === 'phone' ? store.phone : store.email,
          countryCode: countryCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.info(t(locale, 'تم إعادة إرسال الرمز', 'Code resent'));
      } else {
        toast.error(data.message || t(locale, 'فشل إعادة الإرسال', 'Failed to resend code'));
      }
    } catch {
      toast.info(t(locale, 'تم إعادة إرسال الرمز', 'Code resent'));
    }

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
            disabled={isVerifying || isSuccess}
            autoFocus={i === 0}
            className={cn(
              'w-11 h-13 rounded-lg border-2 text-center text-xl font-bold transition-all duration-200 outline-none',
              'focus:ring-0 focus:outline-none',
              digit && !isSuccess && 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--navy)]',
              !digit && !error && 'border-[var(--border)] bg-[var(--surface)]',
              error && !isSuccess && 'border-[var(--destructive)] bg-[var(--destructive)]/5',
              isSuccess && 'border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]',
              isVerifying && 'opacity-50 cursor-wait',
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
            {t(locale, 'تم التحقق بنجاح ✓', 'Verified successfully ✓')}
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
      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-[var(--muted-foreground)]">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">{t(locale, 'جاري التحقق...', 'Verifying...')}</span>
        </div>
      )}

      {/* Back to phone/email button */}
      <button
        type="button"
        onClick={goBackToPhone}
        className={cn(
          'flex items-center justify-center gap-1.5 w-full text-sm font-medium py-2 rounded-lg transition-colors',
          locale === 'ar' ? 'flex-row-reverse' : '',
          !isVerifying && !isSuccess
            ? 'text-[var(--navy)] hover:bg-[var(--surface)]'
            : 'text-[var(--muted-foreground)] cursor-not-allowed',
        )}
      >
        {locale === 'ar'
          ? <ArrowRight className="size-3.5" />
          : <ArrowLeft className="size-3.5" />
        }
        {contactMethod === 'phone'
          ? t(locale, 'تغيير الرقم', 'Change number')
          : t(locale, 'تغيير البريد', 'Change email')}
      </button>

      {/* Resend / Change */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isVerifying || isSuccess}
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

// ============================================
// STEP 3: ROLE SELECTION
// ============================================

function RoleSelection({ locale }: { locale: Locale }) {
  const store = useOnboardingStore();
  const { selectedRole } = store;

  const handleContinue = () => {
    if (!selectedRole) return;
    store.otpNextStep();
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold">
          {t(locale, 'اختر نوع حسابك', 'Choose Your Account Type')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t(locale, 'حدد نوع حسابك للبدء', 'Select your account type to get started')}
        </p>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={`${role.id}-${role.labelAr}`}
              type="button"
              onClick={() => store.setSelectedRole(isSelected ? null : role.id)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 text-center',
                'hover:shadow-md hover:-translate-y-0.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2',
                isSelected
                  ? 'border-[var(--brand)] bg-[var(--brand)]/5 shadow-[var(--shadow-brand)]'
                  : 'border-[var(--border)] bg-[var(--card)]',
              )}
            >
              {/* Icon */}
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-white transition-transform',
                role.bgClass,
                isSelected && 'scale-110',
              )}>
                <Icon className="size-5" />
              </div>

              {/* Label */}
              <span className="text-sm font-semibold leading-tight">
                {locale === 'ar' ? role.labelAr : role.labelEn}
              </span>

              {/* Description */}
              <span className="text-[10px] text-[var(--muted-foreground)] leading-tight">
                {locale === 'ar' ? role.descAr : role.descEn}
              </span>

              {/* Checkmark */}
              {isSelected && (
                <div className="absolute -top-1.5 -end-1.5 w-6 h-6 rounded-full gradient-brand flex items-center justify-center shadow-sm animate-scale-in">
                  <Check className="size-3.5 text-[var(--navy)]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Back link */}
      <button
        type="button"
        onClick={() => store.otpGoBack()}
        className="flex items-center justify-center gap-1 w-full text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        {locale === 'ar'
          ? <ArrowRight className="size-3.5" />
          : <ArrowLeft className="size-3.5" />
        }
        {t(locale, 'رجوع', 'Back')}
      </button>

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={!selectedRole}
        className={cn(
          'w-full h-11 font-semibold rounded-lg transition-all',
          selectedRole
            ? 'gradient-navy text-[var(--navy-foreground)] hover:opacity-90'
            : 'bg-[var(--surface)] text-[var(--muted-foreground)] cursor-not-allowed',
        )}
      >
        {t(locale, 'متابعة', 'Continue')}
        {selectedRole && (
          locale === 'ar'
            ? <ArrowLeft className="size-4 ms-1" />
            : <ArrowRight className="size-4 me-1" />
        )}
      </Button>
    </div>
  );
}

// ============================================
// STEP 4: BASIC INFO
// ============================================

function BasicInfo({ locale }: { locale: Locale }) {
  const store = useOnboardingStore();
  const { selectedRole, contactMethod, phone, email, fullName, storeName } = store;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; store?: string }>({});

  const showStoreField = selectedRole !== 'buyer';
  const maskedPhone = contactMethod === 'phone' ? maskPhone(phone) : undefined;

  const handleSubmit = async () => {
    const newErrors: { name?: string; store?: string } = {};
    if (!fullName.trim()) {
      newErrors.name = t(locale, 'الاسم مطلوب', 'Name is required');
    }
    if (showStoreField && !storeName.trim()) {
      newErrors.store = t(locale, 'اسم المتجر مطلوب', 'Store name is required');
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    // Abort controller with 30s timeout for slow MySQL on Hostinger
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: contactMethod,
          value: contactMethod === 'phone' ? phone : email,
          fullName: fullName,
          role: store.selectedRole || 'buyer',
          storeName: store.storeName || undefined,
          locale,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      setIsSubmitting(false);

      if (data.success && data.user) {
        // ── SECURITY: Verify returned user matches submitted data ──
        const returnedUser = data.user as Record<string, unknown>;
        const submittedValue = contactMethod === 'phone' ? phone : email;
        const userPhone = returnedUser.phone as string | null;
        const userEmail = returnedUser.email as string | null;

        const isMatch =
          (contactMethod === 'phone' && userPhone === submittedValue) ||
          (contactMethod === 'email' && userEmail === submittedValue);

        if (!isMatch) {
          // SECURITY: Never login with a user that doesn't match the submitted contact
          console.error('[register] SECURITY: User mismatch!', {
            submitted: { method: contactMethod, value: submittedValue },
            returned: { phone: userPhone, email: userEmail, name: returnedUser.name },
          });
          toast.error(t(locale, 'خطأ: المستخدم المرجع لا يتطابق. حاول مرة أخرى.', 'User mismatch error. Try again.'));
          return;
        }

        // For NEW accounts, also verify the name matches (catches DB returning wrong user)
        if (!data.alreadyExists && returnedUser.name !== fullName) {
          console.error('[register] SECURITY: Name mismatch on new account!', {
            submitted: fullName,
            returned: returnedUser.name,
          });
          toast.error(t(locale, 'خطأ في إنشاء الحساب. البيانات لا تتطابق.', 'Account creation error. Data mismatch.'));
          return;
        }

        const { loginWithUser } = useAuthStore.getState();
        loginWithUser(data.user as unknown as import('@/types').User);

        // Reset OTP flow so user doesn't land on registration again
        store.resetOtpFlow();

        if (data.alreadyExists) {
          toast.success(
            t(locale, `مرحباً بعودتك ${data.user?.name || ''}!`, `Welcome back ${data.user?.name || ''}!`),
          );
        } else {
          toast.success(
            t(locale, `مرحباً ${data.user?.name || fullName}! تم إنشاء حسابك بنجاح`, `Welcome ${data.user?.name || fullName}! Account created`),
          );
        }
      } else {
        const errorMsg = data.message || t(locale, 'فشل إنشاء الحساب', 'Failed to create account');
        toast.error(errorMsg);
      }
    } catch {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
      toast.error(t(locale, 'انتهت مهلة الاتصال. حاول مرة أخرى.', 'Connection timeout. Please try again.'));
      // DO NOT fallback to demo login — this caused wrong user login
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold">
          {t(locale, 'معلوماتك الأساسية', 'Basic Information')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t(locale, 'أكمل بياناتك لإنشاء الحساب', 'Complete your details to create your account')}
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(locale, 'الاسم الكامل', 'Full Name')} <span className="text-[var(--destructive)]">*</span>
        </label>
        <Input
          type="text"
          placeholder={locale === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed'}
          value={fullName}
          onChange={(e) => { store.setFullName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
          className={cn(errors.name && 'border-[var(--destructive)]')}
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-[var(--destructive)]">{errors.name}</p>
        )}
      </div>

      {/* Store Name (conditional) */}
      {showStoreField && (
        <div className="space-y-1.5 animate-fade-in">
          <label className="text-sm font-medium text-[var(--foreground)]">
            {t(locale, 'اسم المتجر / النشاط التجاري', 'Store / Business Name')}{' '}
            <span className="text-[var(--destructive)]">*</span>
          </label>
          <Input
            type="text"
            placeholder={locale === 'ar' ? 'متجر النون' : 'Noon Store'}
            value={storeName}
            onChange={(e) => { store.setStoreName(e.target.value); setErrors((p) => ({ ...p, store: undefined })); }}
            className={cn(errors.store && 'border-[var(--destructive)]')}
          />
          {errors.store && (
            <p className="text-xs text-[var(--destructive)]">{errors.store}</p>
          )}
        </div>
      )}

      {/* Email (pre-filled or editable) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(locale, 'البريد الإلكتروني', 'Email')}
        </label>
        <Input
          type="email"
          dir="ltr"
          value={email}
          placeholder={contactMethod === 'email' ? undefined : t(locale, 'email@example.com', 'email@example.com')}
          onChange={(e) => store.setEmail(e.target.value)}
          readOnly={contactMethod === 'email'}
          className={cn('text-start', contactMethod === 'email' && 'bg-[var(--surface)]')}
        />
      </div>

      {/* Phone (pre-filled, read-only, masked) */}
      {contactMethod === 'phone' && maskedPhone && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">
            {t(locale, 'رقم الهاتف', 'Phone Number')}
          </label>
          <Input
            type="text"
            dir="ltr"
            value={maskedPhone}
            readOnly
            className="text-start bg-[var(--surface)] cursor-default"
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full h-11 gradient-navy text-[var(--navy-foreground)] font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {t(locale, 'جاري الإنشاء...', 'Creating...')}
          </span>
        ) : (
          t(locale, 'إنشاء الحساب', 'Create Account')
        )}
      </Button>

      {/* Back link */}
      <button
        type="button"
        onClick={() => store.setOtpStep('role')}
        className="flex items-center justify-center gap-1 w-full text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        {locale === 'ar'
          ? <ArrowRight className="size-3.5" />
          : <ArrowLeft className="size-3.5" />
        }
        {t(locale, 'تغيير نوع الحساب', 'Change account type')}
      </button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function OtpLogin() {
  const locale = useAppStore((s) => s.locale);
  const otpStep = useOnboardingStore((s) => s.otpStep);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--surface)]">
      <div className="w-full max-w-md">
        <Card className="card-surface overflow-hidden">
          {/* Brand Logo */}
          <div className="gradient-brand py-6 flex flex-col items-center justify-center gap-2">
            <span className="text-3xl font-extrabold text-[var(--navy)] tracking-tight">شاري داي</span>
            <span className="text-xs font-medium text-[var(--navy)]/70 tracking-wide">
              {t(locale, 'التجارة الإلكترونية', 'E-Commerce Platform')}
            </span>
          </div>

          <CardContent className="pt-6 pb-8 px-6">
            {/* Step Indicator */}
            <StepIndicator step={otpStep} locale={locale} />

            {/* Steps */}
            {otpStep === 'phone' && <PhoneEmailEntry locale={locale} />}
            {otpStep === 'otp' && <OtpVerification locale={locale} />}
            {otpStep === 'role' && <RoleSelection locale={locale} />}
            {otpStep === 'basic-info' && <BasicInfo locale={locale} />}
          </CardContent>
        </Card>

        {/* Bottom note */}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-4">
          {t(locale, '© 2025 شاري داي. جميع الحقوق محفوظة', '© 2025 CharyDay. All rights reserved')}
        </p>
      </div>
    </div>
  );
}
