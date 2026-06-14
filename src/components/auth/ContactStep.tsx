'use client';

import React, { useState } from 'react';
import { Phone, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

// ============================================
// COUNTRY CODES
// ============================================

const COUNTRY_CODES = [
  { code: '+213', label: 'DZ', flag: '🇩🇿' },
  { code: '+216', label: 'TN', flag: '🇹🇳' },
  { code: '+212', label: 'MA', flag: '🇲🇦' },
  { code: '+966', label: 'SA', flag: '🇸🇦' },
  { code: '+971', label: 'AE', flag: '🇦🇪' },
  { code: '+20', label: 'EG', flag: '🇪🇬' },
  { code: '+962', label: 'JO', flag: '🇯🇴' },
  { code: '+961', label: 'LB', flag: '🇱🇧' },
  { code: '+964', label: 'IQ', flag: '🇮🇶' },
  { code: '+90', label: 'TR', flag: '🇹🇷' },
  { code: '+33', label: 'FR', flag: '🇫🇷' },
];

// ============================================
// CONTACT STEP COMPONENT
// ============================================

export default function ContactStep() {
  const locale = useAppStore((s) => s.locale);
  const {
    method,
    phone,
    email,
    countryCode,
    isLoading,
    error,
    setMethod,
    setPhone,
    setEmail,
    setCountryCode,
    sendOtp,
    setError,
  } = useAuthFlowStore();

  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  const handleSend = async () => {
    const ok = await sendOtp();
    if (ok) {
      toast.success(
        t(locale, 'تم إرسال رمز التحقق', 'Verification code sent')
      );
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold">
          {t(locale, 'تسجيل الدخول', 'Sign In')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t(locale, 'أدخل رقم هاتفك أو بريدك الإلكتروني', 'Enter your phone number or email')}
        </p>
      </div>

      {/* Tab Toggle: Phone / Email */}
      <div className="flex rounded-lg bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => { setMethod('phone'); setError(null); }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all',
            method === 'phone'
              ? 'gradient-navy text-[var(--navy-foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
          )}
        >
          <Phone className="size-4" />
          {t(locale, 'هاتف', 'Phone')}
        </button>
        <button
          type="button"
          onClick={() => { setMethod('email'); setError(null); }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all',
            method === 'email'
              ? 'gradient-navy text-[var(--navy-foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
          )}
        >
          <Mail className="size-4" />
          Email
        </button>
      </div>

      {/* Phone Mode */}
      {method === 'phone' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {/* Country Code Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="flex items-center gap-1.5 h-11 px-3 rounded-lg border border-[var(--input)] bg-transparent text-sm font-medium hover:bg-[var(--surface)] transition-colors"
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
                  <div className="absolute top-full mt-1 start-0 z-50 w-48 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg py-1 animate-fade-in max-h-64 overflow-y-auto no-scrollbar">
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
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 15)); setError(null); }}
              className="flex-1 text-start font-mono tracking-wider h-11"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
        </div>
      )}

      {/* Email Mode */}
      {method === 'email' && (
        <div>
          <Input
            type="email"
            dir="ltr"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            className="text-start h-11"
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
        disabled={isLoading || (method === 'phone' ? phone.replace(/\D/g, '').length < 9 : !email.trim())}
        className="w-full h-11 gradient-navy text-[var(--navy-foreground)] font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {t(locale, 'جاري الإرسال...', 'Sending...')}
          </span>
        ) : (
          t(locale, 'إرسال رمز التحقق', 'Send Verification Code')
        )}
      </Button>

      {/* Social Login Placeholders */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--card)] px-2 text-[var(--muted-foreground)]">
            {t(locale, 'أو المتابعة عبر', 'Or continue with')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button" className="h-11">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
        <Button variant="outline" type="button" className="h-11">
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.43.987 3.96.948 1.637-.026 2.62-1.516 3.603-2.981 1.153-1.682 1.629-3.313 1.656-3.4-.041-.013-3.181-1.22-3.216-4.856-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.619 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Apple
        </Button>
      </div>
    </div>
  );
}
