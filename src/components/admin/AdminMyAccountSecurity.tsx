'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Shield, Lock, Mail, Key, Eye, EyeOff, Loader2, CheckCircle2,
  AlertTriangle, Copy, RefreshCw, Download, ShieldCheck, ShieldAlert,
  Smartphone
} from 'lucide-react';

const t = (locale: string, ar: string, en: string) => locale === 'ar' ? ar : en;

export default function AdminMyAccountSecurity() {
  const { adminUser } = useAdminAuthStore();
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const adminId = adminUser?.id;

  // ── Password Change ──────────────────────────────────────
  const [pwCurrent, setPwCurrent]     = useState('');
  const [pwNew, setPwNew]             = useState('');
  const [pwConfirm, setPwConfirm]     = useState('');
  const [pwTotp, setPwTotp]           = useState('');
  const [pwLoading, setPwLoading]     = useState(false);
  const [showPw, setShowPw]           = useState(false);
  const [needs2FA, setNeeds2FA]       = useState(false);

  // ── Email Change ─────────────────────────────────────────
  const [emailStep, setEmailStep]     = useState<'form' | 'otp'>('form');
  const [newEmail, setNewEmail]       = useState('');
  const [emailPw, setEmailPw]         = useState('');
  const [currentOtp, setCurrentOtp]   = useState('');
  const [newOtp, setNewOtp]           = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // ── Recovery Codes ───────────────────────────────────────
  const [rcRemaining, setRcRemaining] = useState<number | null>(null);
  const [rcPw, setRcPw]              = useState('');
  const [rcTotp, setRcTotp]          = useState('');
  const [rcCodes, setRcCodes]        = useState<string[]>([]);
  const [rcLoading, setRcLoading]    = useState(false);
  const [rcGenerated, setRcGenerated] = useState(false);
  const [rcNeeds2FA, setRcNeeds2FA]  = useState(false);
  const codesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adminId) fetchRecoveryStatus();
  }, [adminId]);

  const fetchRecoveryStatus = async () => {
    try {
      const res = await fetch(`/api/admin/account/recovery-codes?adminId=${adminId}`);
      const d = await res.json();
      if (d.success) setRcRemaining(d.remaining);
    } catch { /* noop */ }
  };

  // ── Password Change Handler ──────────────────────────────
  const handlePasswordChange = async () => {
    if (!pwNew || !pwCurrent) {
      toast.error(t(locale, 'يرجى ملء جميع الحقول', 'Please fill all fields'));
      return;
    }
    if (pwNew !== pwConfirm) {
      toast.error(t(locale, 'كلمتا السر غير متطابقتين', 'Passwords do not match'));
      return;
    }
    if (pwNew.length < 12) {
      toast.error(t(locale, 'كلمة السر يجب أن تكون 12 حرفاً على الأقل', 'Password must be at least 12 characters'));
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/admin/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, currentPassword: pwCurrent, newPassword: pwNew, totpCode: pwTotp || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, '✅ تم تغيير كلمة السر. سيتم تسجيل خروجك.', '✅ Password changed. You will be logged out.'));
        setPwCurrent(''); setPwNew(''); setPwConfirm(''); setPwTotp('');
        setNeeds2FA(false);
        setTimeout(() => window.location.reload(), 2000);
      } else if (data.requires2FA) {
        setNeeds2FA(true);
        toast.info(t(locale, 'يرجى إدخال رمز المصادقة الثنائية', 'Please enter your 2FA code'));
      } else {
        toast.error(locale === 'ar' ? (data.error || 'فشل') : (data.errorEn || data.error));
      }
    } finally {
      setPwLoading(false);
    }
  };

  // ── Email Change Handler ─────────────────────────────────
  const handleEmailInitiate = async () => {
    if (!newEmail || !emailPw) {
      toast.error(t(locale, 'يرجى ملء جميع الحقول', 'Please fill all fields'));
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch('/api/admin/account/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, step: 'initiate', newEmail, password: emailPw }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStep('otp');
        toast.success(t(locale, 'تم إرسال رمزَي التحقق إلى البريدين', 'Verification codes sent to both emails'));
        if (data.devCurrentOtp) console.log('[DEV] Current OTP:', data.devCurrentOtp);
        if (data.devNewOtp) console.log('[DEV] New OTP:', data.devNewOtp);
      } else {
        toast.error(locale === 'ar' ? (data.error || 'فشل') : (data.errorEn || data.error));
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailConfirm = async () => {
    if (!currentOtp || !newOtp) {
      toast.error(t(locale, 'يرجى إدخال كلا الرمزين', 'Please enter both codes'));
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch('/api/admin/account/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, step: 'confirm', currentOtp, newOtp }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, '✅ تم تغيير البريد الإلكتروني بنجاح', '✅ Email changed successfully'));
        setEmailStep('form'); setNewEmail(''); setEmailPw(''); setCurrentOtp(''); setNewOtp('');
      } else {
        toast.error(locale === 'ar' ? (data.error || 'فشل') : (data.errorEn || data.error));
      }
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Recovery Codes Handler ───────────────────────────────
  const handleGenerateCodes = async () => {
    if (!rcPw) {
      toast.error(t(locale, 'يرجى إدخال كلمة السر للتأكيد', 'Please enter your password to confirm'));
      return;
    }
    setRcLoading(true);
    try {
      const res = await fetch('/api/admin/account/recovery-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password: rcPw, totpCode: rcTotp || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setRcCodes(data.codes);
        setRcGenerated(true);
        setRcRemaining(data.count);
        toast.success(t(locale, '🔑 تم توليد الرموز. احفظها الآن!', '🔑 Codes generated. Save them now!'));
      } else if (data.requires2FA) {
        setRcNeeds2FA(true);
        toast.info(t(locale, 'يرجى إدخال رمز المصادقة الثنائية', 'Please enter your 2FA code'));
      } else {
        toast.error(locale === 'ar' ? (data.error || 'فشل') : (data.errorEn || data.error));
      }
    } finally {
      setRcLoading(false);
    }
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(rcCodes.join('\n'));
    toast.success(t(locale, 'تم نسخ الرموز', 'Codes copied'));
  };

  const downloadCodes = () => {
    const blob = new Blob([
      `ChariDay Admin — Recovery Codes\nGenerated: ${new Date().toLocaleString()}\n\n${rcCodes.join('\n')}\n\n⚠️ احتفظ بهذا الملف في مكان آمن خارج الإنترنت.`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'charday-admin-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z\d]/.test(pw)) score++;
    return score;
  };
  const pwStrength = passwordStrength(pwNew);
  const pwStrengthColors = ['bg-red-500', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-500'];
  const pwStrengthLabels = [
    t(locale, 'ضعيفة جداً', 'Very Weak'),
    t(locale, 'ضعيفة', 'Weak'),
    t(locale, 'متوسطة', 'Fair'),
    t(locale, 'جيدة', 'Good'),
    t(locale, 'قوية', 'Strong'),
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">

      {/* ── Section: Change Password ── */}
      <Card className="border-orange-200 dark:border-orange-900/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10"><Lock className="h-5 w-5 text-orange-500" /></div>
            <div>
              <CardTitle className="text-base">{t(locale, 'تغيير كلمة السر', 'Change Password')}</CardTitle>
              <CardDescription>{t(locale, 'استخدم كلمة سر قوية لا تقل عن 12 حرفاً', 'Use a strong password with at least 12 characters')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t(locale, 'كلمة السر الحالية', 'Current Password')}</Label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={pwCurrent}
                  onChange={e => setPwCurrent(e.target.value)}
                  className="rounded-xl pr-10"
                  placeholder="••••••••••••"
                  id="admin-current-password"
                  autoComplete="new-password"
                />
                <button onClick={() => setShowPw(v => !v)} className="absolute inset-y-0 end-3 flex items-center text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t(locale, 'كلمة السر الجديدة', 'New Password')}</Label>
              <Input
                type="password"
                value={pwNew}
                onChange={e => setPwNew(e.target.value)}
                className="rounded-xl"
                placeholder="••••••••••••"
                id="admin-new-password"
              />
              {/* Strength meter */}
              {pwNew && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwStrengthColors[pwStrength - 1] : 'bg-muted'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{pwStrengthLabels[Math.max(0, pwStrength - 1)]}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t(locale, 'تأكيد كلمة السر الجديدة', 'Confirm New Password')}</Label>
              <Input
                type="password"
                value={pwConfirm}
                onChange={e => setPwConfirm(e.target.value)}
                className="rounded-xl"
                placeholder="••••••••••••"
                id="admin-confirm-password"
              />
              {pwConfirm && pwNew !== pwConfirm && (
                <p className="text-xs text-red-500">{t(locale, 'كلمتا السر غير متطابقتين', 'Passwords do not match')}</p>
              )}
            </div>
            {needs2FA && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-500" />
                  {t(locale, 'رمز التحقق الثنائي (TOTP)', 'Two-Factor Code (TOTP)')}
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pwTotp}
                  onChange={e => setPwTotp(e.target.value)}
                  className="rounded-xl tracking-widest font-mono text-center text-lg"
                  placeholder="000000"
                  id="admin-totp-code"
                />
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            {t(locale,
              'بعد تغيير كلمة السر ستُلغى جميع جلساتك النشطة وستحتاج لتسجيل الدخول من جديد.',
              'After changing your password, all active sessions will be revoked and you will need to log in again.'
            )}
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={pwLoading || !pwCurrent || !pwNew || pwNew !== pwConfirm}
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2"
            id="admin-change-password-btn"
          >
            {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {t(locale, 'تغيير كلمة السر', 'Change Password')}
          </Button>
        </CardContent>
      </Card>

      {/* ── Section: Change Email ── */}
      <Card className="border-blue-200 dark:border-blue-900/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10"><Mail className="h-5 w-5 text-blue-500" /></div>
            <div>
              <CardTitle className="text-base">{t(locale, 'تغيير البريد الإلكتروني', 'Change Email')}</CardTitle>
              <CardDescription>{t(locale, 'يتطلب تأكيداً على البريد الحالي والجديد معاً', 'Requires confirmation on both current and new email')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailStep === 'form' ? (
            <>
              <div className="p-3 bg-muted/30 rounded-xl text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t(locale, 'البريد الحالي:', 'Current email:')}</span>
                <span className="font-bold">{adminUser?.email}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(locale, 'البريد الجديد', 'New Email')}</Label>
                  <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="rounded-xl" placeholder="new@example.com" id="admin-new-email" />
                </div>
                <div className="space-y-2">
                  <Label>{t(locale, 'كلمة السر الحالية للتأكيد', 'Current Password to Confirm')}</Label>
                  <Input type="password" value={emailPw} onChange={e => setEmailPw(e.target.value)} className="rounded-xl" placeholder="••••••••••••" id="admin-email-password" />
                </div>
              </div>
              <Button onClick={handleEmailInitiate} disabled={emailLoading || !newEmail || !emailPw} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2" id="admin-initiate-email-btn">
                {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {t(locale, 'إرسال رموز التحقق', 'Send Verification Codes')}
              </Button>
            </>
          ) : (
            <>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900/40 text-sm text-blue-700 dark:text-blue-300">
                {t(locale, `تم إرسال رمزَي التحقق. الرمز الأول لبريدك الحالي، والثاني للبريد الجديد (${newEmail}).`, `Verification codes sent. First code to your current email, second to new email (${newEmail}).`)}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(locale, 'رمز البريد الحالي', 'Current Email Code')}</Label>
                  <Input type="text" inputMode="numeric" maxLength={6} value={currentOtp} onChange={e => setCurrentOtp(e.target.value)} className="rounded-xl font-mono text-center text-lg tracking-widest" placeholder="000000" id="admin-current-otp" />
                </div>
                <div className="space-y-2">
                  <Label>{t(locale, 'رمز البريد الجديد', 'New Email Code')}</Label>
                  <Input type="text" inputMode="numeric" maxLength={6} value={newOtp} onChange={e => setNewOtp(e.target.value)} className="rounded-xl font-mono text-center text-lg tracking-widest" placeholder="000000" id="admin-new-otp" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleEmailConfirm} disabled={emailLoading || !currentOtp || !newOtp} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2" id="admin-confirm-email-btn">
                  {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {t(locale, 'تأكيد التغيير', 'Confirm Change')}
                </Button>
                <Button variant="ghost" onClick={() => setEmailStep('form')} className="rounded-xl">{t(locale, 'رجوع', 'Back')}</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Section: Recovery Codes ── */}
      <Card className="border-green-200 dark:border-green-900/40">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/10"><Key className="h-5 w-5 text-green-500" /></div>
              <div>
                <CardTitle className="text-base">{t(locale, 'رموز الاسترداد الطارئة', 'Emergency Recovery Codes')}</CardTitle>
                <CardDescription>{t(locale, 'للاستخدام عند فقدان هاتف المصادقة الثنائية', 'Use when you lose your 2FA device')}</CardDescription>
              </div>
            </div>
            {rcRemaining !== null && (
              <Badge className={`rounded-full text-xs font-bold px-3 py-1 ${rcRemaining > 5 ? 'bg-green-500/10 text-green-600 border-green-500/20' : rcRemaining > 0 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'} border`}>
                {rcRemaining > 0
                  ? `${rcRemaining} ${t(locale, 'رمز متبقٍ', 'codes remaining')}`
                  : t(locale, 'لا توجد رموز', 'No codes')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!rcGenerated ? (
            <>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                {t(locale,
                  '⚠️ توليد رموز جديدة سيُلغي الرموز القديمة. احتفظ بها خارج الإنترنت (ورقياً أو في خزنة كلمات السر).',
                  '⚠️ Generating new codes will invalidate old ones. Store them offline (paper or password manager).'
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(locale, 'كلمة السر للتأكيد', 'Password to Confirm')}</Label>
                  <Input type="password" value={rcPw} onChange={e => setRcPw(e.target.value)} className="rounded-xl" placeholder="••••••••••••" id="admin-rc-password" />
                </div>
                {rcNeeds2FA && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-blue-500" />{t(locale, 'رمز TOTP', 'TOTP Code')}</Label>
                    <Input type="text" inputMode="numeric" maxLength={6} value={rcTotp} onChange={e => setRcTotp(e.target.value)} className="rounded-xl font-mono text-center text-lg tracking-widest" placeholder="000000" id="admin-rc-totp" />
                  </div>
                )}
              </div>
              <Button onClick={handleGenerateCodes} disabled={rcLoading || !rcPw} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold gap-2" id="admin-generate-rc-btn">
                {rcLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {t(locale, 'توليد رموز جديدة', 'Generate New Codes')}
              </Button>
            </>
          ) : (
            <div className="space-y-4" ref={codesRef}>
              <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-500/20 flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                {t(locale,
                  '✅ تم توليد الرموز. هذه هي المرة الوحيدة التي تظهر فيها. احفظها الآن!',
                  '✅ Codes generated. This is the only time they will be shown. Save them now!'
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {rcCodes.map((code, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 font-mono text-sm border border-border">
                    <span className="text-muted-foreground text-xs">{i + 1}.</span>
                    <span className="tracking-wider font-bold">{code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(code); toast.success(t(locale, 'تم النسخ', 'Copied')); }} className="text-muted-foreground hover:text-primary">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={copyAllCodes} variant="outline" className="rounded-xl gap-2" id="admin-copy-codes-btn">
                  <Copy className="h-4 w-4" />{t(locale, 'نسخ الكل', 'Copy All')}
                </Button>
                <Button onClick={downloadCodes} variant="outline" className="rounded-xl gap-2" id="admin-download-codes-btn">
                  <Download className="h-4 w-4" />{t(locale, 'تحميل ملف', 'Download File')}
                </Button>
                <Button onClick={() => { setRcGenerated(false); setRcCodes([]); setRcPw(''); setRcTotp(''); setRcNeeds2FA(false); }} variant="ghost" className="rounded-xl ms-auto text-muted-foreground text-xs">
                  {t(locale, 'تم الحفظ ✓', 'Saved ✓')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
