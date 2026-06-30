'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, Mail, Key, Loader2, ArrowRight } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

export default function AdminLoginPage() {
  const { data: session, isPending } = useSession();
  const isAdminAuthenticated = !isPending && !!session && ((session.user as any)?.role === 'admin' || (session.user as any)?.role === 'SUPER_ADMIN');
  const isLoading = isPending;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [captchaConfig, setCaptchaConfig] = useState({ enabled: false, siteKey: '' });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
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

  const canSubmit = captchaConfig.enabled && captchaConfig.siteKey ? !!captchaToken : true;

  // Handle successful login redirection
  useEffect(() => {
    if (isAdminAuthenticated) {
      // Remove /login from the current path to go to the admin root
      // This respects whatever secret slug the user accessed this through!
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const targetPath = currentPath.replace(/\/login\/?$/, '');
        window.location.href = targetPath || '/';
      }
    }
  }, [isAdminAuthenticated]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          password: password,
          captchaToken: captchaToken,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'بيانات الدخول غير صحيحة');
        setIsSubmitting(false);
      } else {
        // Redirection will be handled by the useEffect above
        // Force a re-fetch of the session by reloading the page if needed,
        // but useEffect should catch it since useSession polls or we can just redirect manually
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const targetPath = currentPath.replace(/\/login\/?$/, '');
          window.location.href = targetPath || '/';
        }
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="bg-brand text-navy p-3 rounded-2xl shadow-lg">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">بوابة الإدارة الآمنة</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">ChariDay Admin Portal</p>
        </div>

        <Card className="border-0 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
          {/* Top colored bar */}
          <div className="h-1.5 bg-brand w-full" />
          
          <CardHeader className="pt-6">
            <CardTitle className="text-xl text-center font-bold">
              تسجيل الدخول
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@charyday.com"
                    className="ps-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="ps-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {configLoaded && captchaConfig.enabled && captchaConfig.siteKey && (
                <div className="flex justify-center my-4 animate-fade-in">
                  <Turnstile
                    siteKey={captchaConfig.siteKey}
                    onSuccess={React.useCallback((token: string) => setCaptchaToken(token), [])}
                  />
                </div>
              )}

              <Button type="submit" className="w-full font-bold h-11 bg-brand text-navy hover:bg-brand/90" disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'دخول'
                )}
              </Button>
              
              <div className="text-center mt-2">
                <p className="text-xs text-slate-500">يجب استخدام حساب مسؤول مسجل في قاعدة البيانات</p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer branding */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2025 ChariDay — نظام إدارة المنصة
        </p>
      </div>
    </div>
  );
}
