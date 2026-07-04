'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function ForcePasswordChangePage() {
  const { user, loginWithUser } = useAuthStore();
  const { locale } = useAppStore();
  const router = useRouter();
  const isRTL = locale === 'ar';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // If user doesn't need force change, redirect away
  useEffect(() => {
    if (user && !(user as any).forcePasswordChange) {
      router.replace('/seller/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error(t(locale, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'Password must be at least 8 characters'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t(locale, 'كلمة المرور الجديدة غير متطابقة', 'New passwords do not match'));
      return;
    }
    if (newPassword === currentPassword) {
      toast.error(t(locale, 'كلمة المرور الجديدة يجب أن تختلف عن الحالية', 'New password must differ from the current one'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/force-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, currentPassword, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(t(locale, '✅ تم تغيير كلمة المرور بنجاح!', '✅ Password changed successfully!'));
        // Update user state to clear the force flag
        if (user) {
          loginWithUser({ ...user, forcePasswordChange: false } as any);
        }
        router.replace('/seller/dashboard');
      } else {
        toast.error(data.error || t(locale, 'حدث خطأ', 'An error occurred'));
      }
    } catch (err) {
      toast.error(t(locale, 'حدث خطأ في الاتصال', 'Connection error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 flex items-center justify-center p-4 font-cairo"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="relative w-full max-w-md bg-slate-900/80 border-rose-500/20 backdrop-blur-xl shadow-2xl">
        {/* Top accent bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 rounded-t-xl" />

        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 w-fit">
            <ShieldAlert className="h-10 w-10 text-rose-400 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-white">
              {t(locale, 'تغيير كلمة المرور مطلوب', 'Password Change Required')}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2 leading-relaxed">
              {t(
                locale,
                'لأسباب أمنية، يجب عليك تغيير كلمة المرور الافتراضية قبل المتابعة. اختر كلمة مرور قوية وفريدة.',
                'For security reasons, you must change your default password before continuing. Choose a strong, unique password.',
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold">
                {t(locale, 'كلمة المرور الحالية', 'Current Password')}
              </Label>
              <div className="relative">
                <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="bg-slate-800/60 border-slate-700 text-white ps-10 pe-10 focus:border-rose-400 focus:ring-rose-400/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold">
                {t(locale, 'كلمة المرور الجديدة', 'New Password')}
              </Label>
              <div className="relative">
                <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-slate-800/60 border-slate-700 text-white ps-10 pe-10 focus:border-amber-400 focus:ring-amber-400/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {newPassword && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        newPassword.length >= i * 3
                          ? i <= 1 ? 'bg-rose-500' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-400'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold">
                {t(locale, 'تأكيد كلمة المرور الجديدة', 'Confirm New Password')}
              </Label>
              <div className="relative">
                <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`bg-slate-800/60 border-slate-700 text-white ps-10 pe-10 focus:ring-0 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-rose-500 focus:border-rose-500'
                      : confirmPassword && confirmPassword === newPassword
                      ? 'border-emerald-500 focus:border-emerald-500'
                      : 'focus:border-amber-400'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-rose-400 font-medium">
                  {t(locale, '⚠ كلمات المرور غير متطابقة', '⚠ Passwords do not match')}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
              className="w-full mt-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                t(locale, 'تغيير كلمة المرور', 'Change Password')
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-slate-500">
            {t(
              locale,
              '🔒 كلمة مرور قوية تحمي حسابك ومتجرك. استخدم مزيجاً من الأحرف والأرقام والرموز.',
              '🔒 A strong password protects your account and store. Use a mix of letters, numbers, and symbols.',
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
