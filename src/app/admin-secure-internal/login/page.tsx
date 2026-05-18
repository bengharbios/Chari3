'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, Mail, Key, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const {
    adminStep,
    login,
    verifyOtp,
    isLoading,
    error,
    setError,
    setStep,
    isAdminAuthenticated
  } = useAdminAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

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
    await login(email, password);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }
    await verifyOtp(otp);
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
              {adminStep === 'login' ? 'تسجيل الدخول' : 'التحقق الثنائي (OTP)'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 text-center">
                {error}
              </div>
            )}

            {adminStep === 'login' && (
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

                <Button type="submit" className="w-full font-bold h-11 bg-brand text-navy hover:bg-brand/90" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'دخول'
                  )}
                </Button>
                
                <div className="text-center mt-2">
                  <p className="text-xs text-slate-500">بيانات الدخول التجريبية: admin@charyday.com / admin123</p>
                </div>
              </form>
            )}

            {adminStep === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">رمز التحقق</Label>
                  <div className="relative">
                    <Key className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      className="ps-10 text-center text-lg tracking-widest"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">أدخل رمز التحقق التجريبي: 123456</p>
                </div>

                <Button type="submit" className="w-full font-bold h-11 bg-brand text-navy hover:bg-brand/90" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'تأكيد الرمز'
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-sm flex items-center justify-center gap-1"
                  onClick={() => setStep('login')}
                >
                  <ArrowRight className="h-4 w-4" />
                  الرجوع لتسجيل الدخول
                </Button>
              </form>
            )}

            {adminStep === 'success' && (
              <div className="text-center py-4 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ShieldCheck className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-lg text-green-600 dark:text-green-400">تم التحقق بنجاح!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">جاري توجيهك إلى لوحة التحكم...</p>
              </div>
            )}
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
