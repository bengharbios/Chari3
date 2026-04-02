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
    </div>
  );
}
