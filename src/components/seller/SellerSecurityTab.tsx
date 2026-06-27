'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Loader2, Shield, ShieldCheck, ShieldOff, Smartphone, Globe,
  Monitor, LogOut, Clock, RefreshCw, Key, AlertTriangle, QrCode,
  Copy, Eye, EyeOff, Tablet, MapPin, Laptop
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import QRCode from 'react-qr-code';

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string;
  deviceType: string;
  os: string;
  browser: string;
  countryCode: string;
  city: string;
  isCurrent: boolean;
}

interface SetupData {
  secret: string;
  qrCodeUrl: string;
  recoveryCodes: string[];
}

function DeviceIcon({ type }: { type: string }) {
  const cls = 'h-5 w-5 text-muted-foreground';
  if (type === 'Mobile') return <Smartphone className={cls} />;
  if (type === 'Tablet') return <Tablet className={cls} />;
  return <Laptop className={cls} />;
}

export default function SellerSecurityTab() {
  const { t, locale } = useTranslation();
  const { user } = useAuthStore();
  const isAr = locale === 'ar';
  const dateFnsLocale = isAr ? ar : enUS;

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setup2FALoading, setSetup2FALoading] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'codes'>('idle');
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [recoveryCodesCopied, setRecoveryCodesCopied] = useState(false);

  // Disable 2FA State
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disableOtp, setDisableOtp] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Load user 2FA status & sessions
  useEffect(() => {
    if (user) {
      setIs2FAEnabled(!!(user as any).twoFactorEnabled);
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/user/sessions');
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch {
      toast.error(t(locale, 'خطأ في تحميل الجلسات', 'Error loading sessions'));
    } finally {
      setSessionsLoading(false);
    }
  }, [locale, t]);

  // ── 2FA SETUP ──────────────────────────────────────────────────────────
  const handle2FASetup = async () => {
    setSetup2FALoading(true);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup' })
      });
      const data = await res.json();
      if (data.success) {
        setSetupData(data);
        setSetupStep('qr');
      } else {
        toast.error(data.error || t(locale, 'حدث خطأ', 'An error occurred'));
      }
    } catch {
      toast.error(t(locale, 'خطأ في الاتصال', 'Connection error'));
    } finally {
      setSetup2FALoading(false);
    }
  };

  const handle2FAEnable = async () => {
    if (!otpInput || otpInput.length !== 6) {
      toast.error(t(locale, 'يرجى إدخال رمز التحقق المكون من 6 أرقام', 'Please enter the 6-digit verification code'));
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable', otpCode: otpInput })
      });
      const data = await res.json();
      if (data.success) {
        setSetupStep('codes');
        setIs2FAEnabled(true);
        toast.success(t(locale, '✅ تم تفعيل المصادقة الثنائية بنجاح!', '✅ Two-Factor Authentication enabled!'));
      } else {
        toast.error(data.error || t(locale, 'رمز التحقق غير صحيح', 'Invalid verification code'));
      }
    } catch {
      toast.error(t(locale, 'خطأ في الاتصال', 'Connection error'));
    } finally {
      setOtpLoading(false);
      setOtpInput('');
    }
  };

  const handle2FADisable = async () => {
    if (!disableOtp) {
      toast.error(t(locale, 'يرجى إدخال رمز التحقق', 'Please enter verification code'));
      return;
    }
    setDisableLoading(true);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable', otpCode: disableOtp })
      });
      const data = await res.json();
      if (data.success) {
        setIs2FAEnabled(false);
        setShowDisable2FA(false);
        setSetupStep('idle');
        setSetupData(null);
        toast.success(t(locale, 'تم إيقاف المصادقة الثنائية', '2FA has been disabled'));
      } else {
        toast.error(data.error || t(locale, 'رمز التحقق غير صحيح', 'Invalid code'));
      }
    } catch {
      toast.error(t(locale, 'خطأ في الاتصال', 'Connection error'));
    } finally {
      setDisableLoading(false);
      setDisableOtp('');
    }
  };

  const copyRecoveryCodes = () => {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.recoveryCodes.join('\n'));
    setRecoveryCodesCopied(true);
    toast.success(t(locale, 'تم نسخ رموز الاستعادة ✓', 'Recovery codes copied ✓'));
    setTimeout(() => setRecoveryCodesCopied(false), 3000);
  };

  // ── SESSION REVOKE ──────────────────────────────────────────────────────
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const res = await fetch(`/api/user/sessions?sessionId=${sessionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        toast.success(t(locale, 'تم إنهاء الجلسة بنجاح', 'Session terminated successfully'));
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error(t(locale, 'خطأ في الاتصال', 'Connection error'));
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOther = async () => {
    const otherSessions = sessions.filter(s => !s.isCurrent);
    for (const s of otherSessions) {
      await handleRevokeSession(s.id);
    }
    toast.success(t(locale, 'تم إنهاء جميع الجلسات الأخرى', 'All other sessions terminated'));
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Section: 2FA ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${is2FAEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
              {is2FAEnabled
                ? <ShieldCheck className="h-5 w-5 text-green-600" />
                : <Shield className="h-5 w-5 text-orange-500" />
              }
            </div>
            <div>
              <CardTitle className="text-base">
                {t(locale, 'المصادقة الثنائية (2FA)', 'Two-Factor Authentication (2FA)')}
              </CardTitle>
              <CardDescription>
                {t(locale,
                  'حماية إضافية لحسابك باستخدام تطبيقات Google Authenticator أو Authy',
                  'Extra protection using Google Authenticator or Authy apps'
                )}
              </CardDescription>
            </div>
            <div className="ms-auto">
              <Badge variant={is2FAEnabled ? 'default' : 'secondary'} className={is2FAEnabled ? 'bg-green-500 text-white' : ''}>
                {is2FAEnabled
                  ? t(locale, '✓ مفعّل', '✓ Enabled')
                  : t(locale, 'غير مفعّل', 'Disabled')
                }
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Not Enabled - Prompt to Setup */}
          {!is2FAEnabled && setupStep === 'idle' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {t(locale, 'حسابك غير محمي بالمصادقة الثنائية', 'Your account is not protected with 2FA')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(locale,
                    'يُنصح بشدة بتفعيل 2FA لحماية حسابك ومحفظتك من الاختراق',
                    'We strongly recommend enabling 2FA to protect your account and wallet'
                  )}
                </p>
              </div>
              <Button
                id="setup-2fa-btn"
                onClick={handle2FASetup}
                disabled={setup2FALoading}
                className="gap-2 shrink-0"
              >
                {setup2FALoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                {t(locale, 'تفعيل 2FA', 'Enable 2FA')}
              </Button>
            </div>
          )}

          {/* QR Code Step */}
          {setupStep === 'qr' && setupData && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-sm">
                <p className="font-bold mb-1">
                  {t(locale, '📱 الخطوة 1: امسح رمز QR', '📱 Step 1: Scan the QR Code')}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t(locale,
                    'افتح تطبيق Google Authenticator أو Authy واضغط على إضافة حساب، ثم امسح الرمز أدناه',
                    'Open Google Authenticator or Authy, tap Add Account, then scan the code below'
                  )}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border">
                  <QRCode value={setupData.qrCodeUrl} size={160} />
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {t(locale, 'أو أدخل الكود يدوياً:', 'Or enter the key manually:')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 p-2 rounded-lg bg-muted font-mono text-sm ${showSecret ? '' : 'blur-sm select-none'}`}>
                      {setupData.secret}
                    </code>
                    <Button variant="ghost" size="icon" onClick={() => setShowSecret(s => !s)}>
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      navigator.clipboard.writeText(setupData.secret);
                      toast.success(t(locale, 'تم النسخ', 'Copied'));
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>
                  {t(locale, '🔐 الخطوة 2: أدخل الرمز من التطبيق للتأكيد', '🔐 Step 2: Enter the code from your app to confirm')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="totp-verify-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="font-mono text-center text-lg tracking-widest w-40"
                  />
                  <Button
                    id="enable-2fa-confirm-btn"
                    onClick={handle2FAEnable}
                    disabled={otpLoading || otpInput.length !== 6}
                    className="gap-2"
                  >
                    {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {t(locale, 'تأكيد وتفعيل', 'Confirm & Enable')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Recovery Codes Step */}
          {setupStep === 'codes' && setupData && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-300 dark:border-yellow-700">
                <p className="font-bold text-sm mb-1">
                  ⚠️ {t(locale, 'احتفظ برموز الاستعادة الاحتياطية في مكان آمن', 'Keep your backup recovery codes in a safe place')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(locale,
                    'هذه الرموز تستخدم مرة واحدة فقط للدخول إذا فقدت جهازك. لن تتمكن من رؤيتها مجدداً.',
                    'These codes are used once only to log in if you lose your device. You will not be able to see them again.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {setupData.recoveryCodes.map((code, i) => (
                  <code key={i} className="p-2 bg-muted rounded-lg font-mono text-sm text-center border">
                    {code}
                  </code>
                ))}
              </div>

              <Button
                id="copy-recovery-codes-btn"
                onClick={copyRecoveryCodes}
                variant="outline"
                className="w-full gap-2"
              >
                <Copy className="h-4 w-4" />
                {recoveryCodesCopied
                  ? t(locale, '✓ تم النسخ', '✓ Copied')
                  : t(locale, 'نسخ جميع الرموز', 'Copy All Codes')
                }
              </Button>

              <Button
                id="finish-2fa-setup-btn"
                onClick={() => { setSetupStep('idle'); setSetupData(null); }}
                className="w-full"
              >
                {t(locale, 'تم — إغلاق', 'Done — Close')}
              </Button>
            </div>
          )}

          {/* Already Enabled */}
          {is2FAEnabled && setupStep === 'idle' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm text-green-700 dark:text-green-400">
                  {t(locale, 'حسابك محمي بالمصادقة الثنائية', 'Your account is protected with 2FA')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(locale,
                    'سيُطلب منك رمز التحقق عند كل تسجيل دخول',
                    'A verification code will be required at every login'
                  )}
                </p>
              </div>
              <Button
                id="disable-2fa-btn"
                variant="destructive"
                size="sm"
                onClick={() => setShowDisable2FA(true)}
                className="gap-2 shrink-0"
              >
                <ShieldOff className="h-4 w-4" />
                {t(locale, 'إيقاف 2FA', 'Disable 2FA')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section: Active Sessions ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {t(locale, 'الجلسات النشطة والأجهزة', 'Active Sessions & Devices')}
                </CardTitle>
                <CardDescription>
                  {t(locale,
                    'جميع الأجهزة التي سجّلت الدخول بها على حسابك',
                    'All devices currently logged into your account'
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={fetchSessions} title={t(locale, 'تحديث', 'Refresh')}>
                <RefreshCw className={`h-4 w-4 ${sessionsLoading ? 'animate-spin' : ''}`} />
              </Button>
              {sessions.filter(s => !s.isCurrent).length > 1 && (
                <Button variant="destructive" size="sm" onClick={handleRevokeAllOther} className="gap-1.5 text-xs">
                  <LogOut className="h-3.5 w-3.5" />
                  {t(locale, 'إنهاء الكل', 'Terminate All')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">
              {t(locale, 'لا توجد جلسات نشطة', 'No active sessions found')}
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    session.isCurrent
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-muted/30 border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <DeviceIcon type={session.deviceType} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">
                        {session.browser} — {session.os}
                      </p>
                      {session.isCurrent && (
                        <Badge variant="outline" className="text-xs text-primary border-primary/30 px-1.5 py-0">
                          {t(locale, 'الجلسة الحالية', 'Current Session')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.city}, {session.countryCode}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {session.ipAddress}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: dateFnsLocale })}
                      </span>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokingId === session.id}
                      className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      id={`revoke-session-${session.id}`}
                    >
                      {revokingId === session.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <LogOut className="h-3.5 w-3.5" />
                      }
                      {t(locale, 'إنهاء', 'End')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Disable 2FA Dialog ─────────────────────────────────────────── */}
      <Dialog open={showDisable2FA} onOpenChange={setShowDisable2FA}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldOff className="h-5 w-5" />
              {t(locale, 'إيقاف المصادقة الثنائية', 'Disable Two-Factor Authentication')}
            </DialogTitle>
            <DialogDescription>
              {t(locale,
                'لإيقاف 2FA، أدخل رمز التحقق من تطبيقك. تحذير: سيصبح حسابك أقل أماناً.',
                'To disable 2FA, enter the verification code from your app. Warning: your account will be less secure.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="disable-otp">
                {t(locale, 'رمز التحقق (6 أرقام)', 'Verification Code (6 digits)')}
              </Label>
              <Input
                id="disable-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={disableOtp}
                onChange={e => setDisableOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="font-mono text-center tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowDisable2FA(false); setDisableOtp(''); }}>
              {t(locale, 'إلغاء', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              id="confirm-disable-2fa-btn"
              onClick={handle2FADisable}
              disabled={disableLoading || disableOtp.length !== 6}
              className="gap-2"
            >
              {disableLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
              {t(locale, 'إيقاف 2FA', 'Disable 2FA')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
