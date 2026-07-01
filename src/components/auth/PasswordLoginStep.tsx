'use client';

import React, { useState } from 'react';
import { Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthFlowStore } from '@/lib/store/auth-flow';
import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Locale, User } from '@/types';
import { Turnstile } from '@marsidev/react-turnstile';

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

export default function PasswordLoginStep() {
  const locale = useAppStore((s) => s.locale);
  const {
    method,
    email,
    phone,
    isLoading,
    error,
    setStep,
    setError,
    setLoading,
    captchaToken,
    setCaptchaToken,
  } = useAuthFlowStore();

  const [password, setPassword] = useState('');
  const [captchaConfig, setCaptchaConfig] = useState({ enabled: false, siteKey: '' });
  const [configLoaded, setConfigLoaded] = useState(false);

  React.useEffect(() => {
    fetch('/api/auth/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCaptchaConfig({
            enabled: data.config.captchaEnabled,
            siteKey: data.config.captchaSiteKey,
          });
        }
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, []);

  const displayContact = method === 'phone' ? phone : email;

  // Clear token on mount so we don't reuse the spent token from ContactStep
  React.useEffect(() => {
    setCaptchaToken(null);
  }, [setCaptchaToken]);

  const handleLogin = async () => {
    if (!password) {
      setError(t(locale, 'أدخل كلمة المرور', 'Enter your password'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: displayContact,
          password,
          captchaToken,
        }),
      });

      const data = await res.json();
      
      if (data.success && data.user) {
        // Trigger login
        const { loginWithUser } = useAuthStore.getState();
        loginWithUser(data.user as unknown as User);
        setStep('success');
      } else {
        setError(data.message || t(locale, 'كلمة المرور غير صحيحة', 'Incorrect password'));
      }
    } catch (e) {
      setError(t(locale, 'حدث خطأ في الاتصال', 'Connection error'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const success = await useAuthFlowStore.getState().sendOtp(true);
    if (success) {
      toast.success(t(locale, 'OU. OO1O3OU, O1U.O O U,OO-U,U,', 'Verification code sent'));
    }
  };

  const handleBack = () => {
    setStep('contact');
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="mx-auto w-14 h-14 rounded-full bg-[var(--surface)] flex items-center justify-center mb-3">
          <Lock className="size-7 text-[var(--navy)]" />
        </div>
        <h2 className="text-xl font-bold">
          {t(locale, 'أهلاً بعودتك', 'Welcome Back')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {displayContact}
        </p>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(locale, 'كلمة المرور', 'Password')}
        </label>
        <Input
          type="password"
          dir="ltr"
          placeholder="••••••••"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          className={cn('text-start h-11', error && 'border-[var(--destructive)]')}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-[var(--destructive)] text-center animate-fade-in">{error}</p>
      )}

      {/* Captcha */}
      {configLoaded && captchaConfig.enabled && captchaConfig.siteKey && (
        <div className="flex justify-center my-4 animate-fade-in">
          <Turnstile
            key="password-step-captcha"
            siteKey={captchaConfig.siteKey}
            onSuccess={(token) => setCaptchaToken(token)}
          />
        </div>
      )}

      {/* Login Button */}
      <Button
        onClick={handleLogin}
        disabled={isLoading || !password || (captchaConfig.enabled && !captchaToken)}
        className="w-full h-11 gradient-navy text-[var(--navy-foreground)] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {t(locale, 'جاري الدخول...', 'Logging in...')}
          </span>
        ) : (
          t(locale, 'تسجيل الدخول', 'Sign In')
        )}
      </Button>

      {/* Back link */}
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center justify-center gap-1 w-full text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        {locale === 'ar'
          ? <ArrowRight className="size-3.5" />
          : <ArrowLeft className="size-3.5" />
        }
        {t(locale, 'رجوع للبريد الإلكتروني', 'Back to Email')}
      </button>
    </div>
  );
}
