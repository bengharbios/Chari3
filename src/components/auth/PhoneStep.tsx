'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, Loader2, FastForward } from 'lucide-react';
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

export default function PhoneStep() {
  const locale = useAppStore((s) => s.locale);
  const {
    method,
    phone,
    countryCode,
    isLoading,
    error,
    setMethod,
    setPhone,
    setCountryCode,
    sendOtp,
    setError,
    setStep,
    setSkipPhone,
  } = useAuthFlowStore();

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [availableMethods, setAvailableMethods] = useState({
    sms: false,
    whatsapp: false,
    telegram: false,
    allowSkip: true,
  });

  React.useEffect(() => {
    // Default method to phone/sms
    setMethod('phone');
    fetch('/api/auth/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // We need a specific endpoint to return available methods, 
          // but for now we assume they are configured, or we fetch them.
          // Let's modify /api/auth/config to return these as well.
          setAvailableMethods({
            sms: data.config.smsEnabled !== false, 
            whatsapp: data.config.whatsappEnabled === true,
            telegram: data.config.telegramEnabled === true,
            allowSkip: data.config.allowPhoneSkip !== false,
          });
        }
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, [setMethod]);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  const handleSend = async (selectedMethod: 'phone' | 'whatsapp' | 'telegram') => {
    setMethod(selectedMethod);
    const ok = await sendOtp();
    if (ok) {
      toast.success(
        t(locale, 'تم إرسال رمز التحقق لهاتفك', 'Verification code sent to your phone')
      );
    }
  };

  const handleSkip = () => {
    setSkipPhone(true);
    setStep('password-setup');
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold">
          {t(locale, 'رقم الهاتف', 'Phone Number')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t(locale, 'أدخل رقم هاتفك لتأمين حسابك', 'Enter your phone number to secure your account')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Phone Input */}
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
          <Input
            type="tel"
            dir="ltr"
            placeholder="5XXXXXXXX"
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 15)); setError(null); }}
            className="flex-1 text-start font-mono tracking-wider h-11"
            autoFocus
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-[var(--destructive)] text-center animate-fade-in">{error}</p>
        )}

        {/* Send Options */}
        <div className="pt-2 grid gap-2">
          {configLoaded && (
            <>
              {availableMethods.whatsapp && (
                <Button
                  onClick={() => handleSend('whatsapp')}
                  disabled={isLoading || phone.length < 9}
                  className="w-full h-11 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-lg transition-colors"
                >
                  {isLoading && method === 'whatsapp' ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <MessageSquare className="size-4 mr-2" />
                  )}
                  {t(locale, 'أرسل الكود عبر واتساب', 'Send Code via WhatsApp')}
                </Button>
              )}

              {availableMethods.sms && (
                <Button
                  variant="outline"
                  onClick={() => handleSend('phone')}
                  disabled={isLoading || phone.length < 9}
                  className="w-full h-11 font-semibold rounded-lg"
                >
                  {isLoading && method === 'phone' ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Phone className="size-4 mr-2" />
                  )}
                  {t(locale, 'أرسل الكود عبر رسالة (SMS)', 'Send Code via SMS')}
                </Button>
              )}

              {availableMethods.allowSkip && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full text-muted-foreground hover:text-foreground mt-2"
                >
                  <FastForward className="size-4 mr-2" />
                  {t(locale, 'تخطي هذه الخطوة مؤقتاً', 'Skip this step for now')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
