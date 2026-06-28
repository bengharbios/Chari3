'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Loader2, User, Phone, Lock, Eye, EyeOff, CheckCircle2, XCircle,
  Shield, ShieldCheck, ShieldOff, Globe, Smartphone, Laptop, Tablet,
  LogOut, RefreshCw, Clock, MapPin, Copy, QrCode, Key, AlertTriangle,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// ── Password strength calculator ─────────────────────────────────────────────
interface StrengthRule {
  label: string;
  labelAr: string;
  test: (v: string) => boolean;
}

const STRENGTH_RULES: StrengthRule[] = [
  { label: 'At least 8 characters', labelAr: '8 أحرف على الأقل', test: (v) => v.length >= 8 },
  { label: 'Uppercase letter (A-Z)', labelAr: 'حرف كبير (A-Z)', test: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter (a-z)', labelAr: 'حرف صغير (a-z)', test: (v) => /[a-z]/.test(v) },
  { label: 'Number (0-9)', labelAr: 'رقم (0-9)', test: (v) => /\d/.test(v) },
  { label: 'Special character (!@#$...)', labelAr: 'رمز خاص (!@#$...)', test: (v) => /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~]/.test(v) },
];

function getStrengthScore(password: string): number {
  if (!password) return 0;
  return STRENGTH_RULES.filter(r => r.test(password)).length;
}

function getStrengthLabel(score: number, isAr: boolean): { text: string; color: string } {
  if (score <= 1) return { text: isAr ? 'ضعيفة جداً' : 'Very Weak', color: 'bg-red-500' };
  if (score === 2) return { text: isAr ? 'ضعيفة' : 'Weak', color: 'bg-orange-400' };
  if (score === 3) return { text: isAr ? 'متوسطة' : 'Fair', color: 'bg-yellow-400' };
  if (score === 4) return { text: isAr ? 'جيدة' : 'Good', color: 'bg-blue-500' };
  return { text: isAr ? 'قوية جداً ✓' : 'Very Strong ✓', color: 'bg-green-500' };
}

// ── Interfaces ────────────────────────────────────────────────────────────────
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

// ── TAB definitions ───────────────────────────────────────────────────────────
type TabKey = 'profile' | 'password' | '2fa' | 'sessions';

export default function SecurityCenterPage() {
  const { t, locale } = useTranslation();
  const { user } = useAuthStore();
  const isAr = locale === 'ar';
  const tStr = (ar: string, en: string, fr: string = en) => { if (locale === 'ar') return ar; if (locale === 'fr') return fr; return en; };
  const dateFnsLocale = isAr ? ar : enUS;

  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  // ── Profile state ─────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // ── Password state ────────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const strengthScore = getStrengthScore(newPwd);
  const strengthInfo = getStrengthLabel(strengthScore, isAr);
  const strengthPercent = (strengthScore / STRENGTH_RULES.length) * 100;

  // ── 2FA state ─────────────────────────────────────────────────────────────
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'codes'>('idle');
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disableOtp, setDisableOtp] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [setup2FALoading, setSetup2FALoading] = useState(false);
  const [codescopied, setCodesCopied] = useState(false);

  // ── Sessions state ────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Populate form from user store
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone((user as any).phone || '');
      setIs2FAEnabled(!!(user as any).twoFactorEnabled);
    }
  }, [user]);

  // ── API helpers ───────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/user/sessions');
      const data = await res.json();
      if (data.success) setSessions(data.sessions);
    } catch {
      toast.error(tStr('خطأ في تحميل الجلسات', 'Error loading sessions'));
    } finally {
      setSessionsLoading(false);
    }
  }, [isAr]);

  // Load sessions when tab opens
  useEffect(() => {
    if (activeTab === 'sessions') {
      if (user?.id?.includes('-001')) {
        setSessions([]);
        return;
      }
      fetchSessions();
    }
  }, [activeTab, user?.id, fetchSessions]);

  const handleProfileSave = async () => {
    if (!profileName.trim() || profileName.trim().length < 2) {
      toast.error(tStr('الاسم يجب أن يكون حرفين على الأقل', 'Name must be at least 2 characters'));
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileSaved(true);
        toast.success(tStr('✅ تم حفظ البيانات بنجاح', '✅ Profile updated successfully'));
        setTimeout(() => setProfileSaved(false), 3000);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error(tStr('خطأ في الاتصال', 'Connection error'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      toast.error(tStr('يرجى ملء جميع الحقول', 'Please fill all fields'));
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error(tStr('كلمة المرور الجديدة لا تتطابق مع التأكيد', 'Passwords do not match'));
      return;
    }
    if (strengthScore < 4) {
      toast.error(tStr('كلمة المرور ضعيفة جداً، الرجاء اختيار كلمة مرور أقوى', 'Password is too weak, please choose a stronger one'));
      return;
    }
    setPwdLoading(true);
    try {
      const res = await fetch('/api/user/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd, confirmPassword: confirmPwd }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(tStr('✅ تم تغيير كلمة المرور، تم إنهاء جميع الجلسات الأخرى', '✅ Password changed! All other sessions were terminated.'));
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error(tStr('خطأ في الاتصال', 'Connection error'));
    } finally {
      setPwdLoading(false);
    }
  };

  const handle2FASetup = async () => {
    setSetup2FALoading(true);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup' }),
      });
      const data = await res.json();
      if (data.success) { setSetupData(data); setSetupStep('qr'); }
      else toast.error(data.error);
    } finally { setSetup2FALoading(false); }
  };

  const handle2FAEnable = async () => {
    if (otpInput.length !== 6) return;
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable', otpCode: otpInput }),
      });
      const data = await res.json();
      if (data.success) {
        setSetupStep('codes'); setIs2FAEnabled(true);
        toast.success(tStr('✅ تم تفعيل المصادقة الثنائية!', '✅ 2FA Enabled!'));
      } else toast.error(data.error || (tStr('رمز خاطئ', 'Invalid code')));
    } finally { setOtpLoading(false); setOtpInput(''); }
  };

  const handle2FADisable = async () => {
    if (!disableOtp) return;
    setDisableLoading(true);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable', otpCode: disableOtp }),
      });
      const data = await res.json();
      if (data.success) {
        setIs2FAEnabled(false); setShowDisable2FA(false); setSetupStep('idle'); setSetupData(null);
        toast.success(tStr('تم إيقاف 2FA', '2FA has been disabled'));
      } else toast.error(data.error || (tStr('رمز خاطئ', 'Invalid code')));
    } finally { setDisableLoading(false); setDisableOtp(''); }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const res = await fetch(`/api/user/sessions?sessionId=${sessionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        toast.success(tStr('تم إنهاء الجلسة', 'Session terminated'));
      }
    } finally { setRevokingId(null); }
  };

  const handleRevokeAll = async () => {
    for (const s of sessions.filter(s => !s.isCurrent)) {
      await handleRevokeSession(s.id);
    }
  };

  const copyRecoveryCodes = () => {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.recoveryCodes.join('\n'));
    setCodesCopied(true);
    toast.success(tStr('تم نسخ رموز الاستعادة', 'Recovery codes copied'));
    setTimeout(() => setCodesCopied(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-4" dir={tStr('rtl', 'ltr')}>
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {tStr('الأمان والخصوصية', 'Security & Privacy')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tStr('إدارة بيانات حسابك وأمانه', 'Manage your account info and security settings')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'profile', icon: User, label: tStr('البيانات الشخصية', 'Profile') },
          { id: 'password', icon: Lock, label: tStr('كلمة المرور', 'Password') },
          { id: '2fa', icon: ShieldCheck, label: tStr('المصادقة الثنائية', '2FA') },
          { id: 'sessions', icon: Globe, label: tStr('الجلسات', 'Sessions') },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`security-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as TabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB: Profile ───────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              {tStr('البيانات الشخصية', 'Personal Information')}
            </CardTitle>
            <CardDescription>
              {tStr('تحديث اسمك ورقم هاتفك', 'Update your name and phone number')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {tStr('البريد الإلكتروني (لا يمكن تغييره)', 'Email address (cannot be changed)')}
              </Label>
              <Input value={user?.email || ''} disabled className="bg-muted/50 font-mono text-sm" />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">
                {tStr('الاسم الكامل', 'Full Name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder={tStr('أدخل اسمك', 'Enter your name')}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">
                {tStr('رقم الهاتف', 'Phone Number')}
              </Label>
              <div className="relative">
                <Phone className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${tStr('right-3', 'left-3')}`} />
                <Input
                  id="profile-phone"
                  type="tel"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  placeholder="+213 5XX XXX XXX"
                  className={tStr('pr-10', 'pl-10')}
                  dir="ltr"
                />
              </div>
            </div>

            <Button
              id="save-profile-btn"
              onClick={handleProfileSave}
              disabled={profileLoading}
              className="w-full gap-2"
            >
              {profileLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : profileSaved
                ? <CheckCircle2 className="h-4 w-4" />
                : <User className="h-4 w-4" />
              }
              {profileSaved
                ? (tStr('تم الحفظ ✓', 'Saved ✓'))
                : (tStr('حفظ البيانات', 'Save Changes'))
              }
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── TAB: Password ──────────────────────────────────────────────────── */}
      {activeTab === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {tStr('تغيير كلمة المرور', 'Change Password')}
            </CardTitle>
            <CardDescription>
              {tStr('يجب إدخال كلمة المرور الحالية، وستنتهي جميع الجلسات الأخرى بعد التغيير', 'You must enter your current password. All other sessions will be terminated after change.')
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Current password */}
            <div className="space-y-1.5">
              <Label htmlFor="current-pwd">
                {tStr('كلمة المرور الحالية', 'Current Password')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="current-pwd"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  placeholder="••••••••"
                  className={tStr('pl-10', 'pr-10')}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(v => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${tStr('left-3', 'right-3')}`}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Separator />

            {/* New password */}
            <div className="space-y-1.5">
              <Label htmlFor="new-pwd">
                {tStr('كلمة المرور الجديدة', 'New Password')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="new-pwd"
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                  className={tStr('pl-10', 'pr-10')}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${tStr('left-3', 'right-3')}`}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {newPwd && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{tStr('قوة كلمة المرور:', 'Password strength:')}</span>
                    <span className={`font-semibold ${
                      strengthScore <= 2 ? 'text-red-500'
                      : strengthScore === 3 ? 'text-yellow-500'
                      : strengthScore === 4 ? 'text-blue-500'
                      : 'text-green-500'
                    }`}>
                      {strengthInfo.text}
                    </span>
                  </div>
                  <Progress
                    value={strengthPercent}
                    className={`h-1.5 transition-all ${
                      strengthScore <= 2 ? '[&>div]:bg-red-500'
                      : strengthScore === 3 ? '[&>div]:bg-yellow-400'
                      : strengthScore === 4 ? '[&>div]:bg-blue-500'
                      : '[&>div]:bg-green-500'
                    }`}
                  />
                  {/* Rules checklist */}
                  <ul className="space-y-1 text-xs">
                    {STRENGTH_RULES.map((rule, i) => {
                      const passed = rule.test(newPwd);
                      return (
                        <li key={i} className={`flex items-center gap-1.5 ${passed ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {passed
                            ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            : <XCircle className="h-3.5 w-3.5 shrink-0" />
                          }
                          {isAr ? rule.labelAr : rule.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pwd">
                {tStr('تأكيد كلمة المرور الجديدة', 'Confirm New Password')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm-pwd"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className={`${tStr('pl-10', 'pr-10')} ${
                    confirmPwd && (confirmPwd === newPwd ? 'border-green-500 focus-visible:ring-green-500' : 'border-red-500 focus-visible:ring-red-500')
                  }`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${tStr('left-3', 'right-3')}`}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPwd && confirmPwd !== newPwd && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  {tStr('كلمتا المرور غير متطابقتين', 'Passwords do not match')}
                </p>
              )}
              {confirmPwd && confirmPwd === newPwd && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {tStr('كلمتا المرور متطابقتان ✓', 'Passwords match ✓')}
                </p>
              )}
            </div>

            {/* Security note */}
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 flex gap-2 text-xs">
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                {tStr('بعد تغيير كلمة المرور، سيتم إنهاء جميع الجلسات النشطة على الأجهزة الأخرى تلقائياً لحماية حسابك.', 'After changing your password, all active sessions on other devices will be automatically terminated to protect your account.')
                }
              </p>
            </div>

            <Button
              id="change-password-btn"
              onClick={handleChangePassword}
              disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd || newPwd !== confirmPwd || strengthScore < 4}
              className="w-full gap-2"
              variant="default"
            >
              {pwdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {tStr('تغيير كلمة المرور', 'Change Password')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── TAB: 2FA ───────────────────────────────────────────────────────── */}
      {activeTab === '2fa' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${is2FAEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                {is2FAEnabled
                  ? <ShieldCheck className="h-5 w-5 text-green-600" />
                  : <Shield className="h-5 w-5 text-orange-500" />
                }
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">
                  {tStr('المصادقة الثنائية (2FA)', 'Two-Factor Authentication')}
                </CardTitle>
                <CardDescription>
                  {tStr('حماية إضافية باستخدام Google Authenticator أو Authy', 'Extra protection via Google Authenticator or Authy')}
                </CardDescription>
              </div>
              <Badge variant={is2FAEnabled ? 'default' : 'secondary'} className={is2FAEnabled ? 'bg-green-500 text-white' : ''}>
                {is2FAEnabled ? (tStr('✓ مفعّل', '✓ Enabled')) : (tStr('غير مفعّل', 'Disabled'))}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Not enabled prompt */}
            {!is2FAEnabled && setupStep === 'idle' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{tStr('حسابك غير محمي بـ 2FA', 'Your account is not protected with 2FA')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tStr('يُنصح بتفعيله لحماية محفظتك وبياناتك', 'Strongly recommended to protect your wallet and account')}
                  </p>
                </div>
                <Button id="setup-2fa-btn" onClick={handle2FASetup} disabled={setup2FALoading} className="gap-2 shrink-0">
                  {setup2FALoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                  {tStr('تفعيل 2FA', 'Enable 2FA')}
                </Button>
              </div>
            )}

            {/* QR Setup step */}
            {setupStep === 'qr' && setupData && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-sm">
                  <p className="font-bold mb-1">📱 {tStr('الخطوة 1: امسح رمز QR', 'Step 1: Scan QR Code')}</p>
                  <p className="text-muted-foreground text-xs">
                    {tStr('افتح Google Authenticator أو Authy ثم أضف حساباً جديداً', 'Open Google Authenticator or Authy and add a new account')}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-xl shadow-sm border">
                    <QRCode value={setupData.qrCodeUrl} size={160} />
                  </div>
                  <div className="w-full space-y-2">
                    <Label className="text-xs text-muted-foreground">{tStr('أو أدخل الكود يدوياً:', 'Or enter key manually:')}</Label>
                    <div className="flex items-center gap-2">
                      <code className={`flex-1 p-2 rounded-lg bg-muted font-mono text-sm ${showSecret ? '' : 'blur-sm select-none'}`}>{setupData.secret}</code>
                      <Button variant="ghost" size="icon" onClick={() => setShowSecret(v => !v)}>
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(setupData.secret); toast.success(tStr('تم النسخ', 'Copied')); }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>🔐 {tStr('الخطوة 2: أدخل الرمز للتأكيد', 'Step 2: Enter code to confirm')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="totp-input"
                      type="text" inputMode="numeric" maxLength={6}
                      value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000" className="font-mono text-center text-lg tracking-widest w-40" dir="ltr"
                    />
                    <Button id="enable-2fa-btn" onClick={handle2FAEnable} disabled={otpLoading || otpInput.length !== 6} className="gap-2">
                      {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      {tStr('تفعيل', 'Enable')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Recovery codes step */}
            {setupStep === 'codes' && setupData && (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-300 dark:border-yellow-700">
                  <p className="font-bold text-sm mb-1">⚠️ {tStr('احتفظ بهذه الرموز في مكان آمن', 'Save these codes in a safe place')}</p>
                  <p className="text-xs text-muted-foreground">{tStr('تُستخدم مرة واحدة فقط عند فقدان جهازك. لن تظهر مجدداً.', 'Used once if you lose access. Cannot be shown again.')}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {setupData.recoveryCodes.map((code, i) => (
                    <code key={i} className="p-2 bg-muted rounded-lg font-mono text-sm text-center border">{code}</code>
                  ))}
                </div>
                <Button id="copy-codes-btn" onClick={copyRecoveryCodes} variant="outline" className="w-full gap-2">
                  <Copy className="h-4 w-4" />
                  {codescopied ? (tStr('✓ تم النسخ', '✓ Copied')) : (tStr('نسخ الرموز', 'Copy Codes'))}
                </Button>
                <Button id="finish-2fa-btn" onClick={() => { setSetupStep('idle'); setSetupData(null); }} className="w-full">
                  {tStr('تم — إغلاق', 'Done — Close')}
                </Button>
              </div>
            )}

            {/* Already enabled */}
            {is2FAEnabled && setupStep === 'idle' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-green-700 dark:text-green-400">{tStr('حسابك محمي بـ 2FA', 'Your account is protected with 2FA')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tStr('سيُطلب رمز التحقق عند كل تسجيل دخول', 'A code will be required at every login')}</p>
                </div>
                <Button id="disable-2fa-btn" variant="destructive" size="sm" onClick={() => setShowDisable2FA(true)} className="gap-2 shrink-0">
                  <ShieldOff className="h-4 w-4" />
                  {tStr('إيقاف', 'Disable')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── TAB: Sessions ──────────────────────────────────────────────────── */}
      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">{tStr('الجلسات النشطة', 'Active Sessions')}</CardTitle>
                  <CardDescription>{tStr('جميع الأجهزة المتصلة بحسابك', 'All devices logged into your account')}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={fetchSessions}>
                  <RefreshCw className={`h-4 w-4 ${sessionsLoading ? 'animate-spin' : ''}`} />
                </Button>
                {sessions.filter(s => !s.isCurrent).length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleRevokeAll} className="gap-1.5 text-xs">
                    <LogOut className="h-3.5 w-3.5" />
                    {tStr('إنهاء الكل', 'End All')}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
            ) : sessions.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">{tStr('لا توجد جلسات نشطة', 'No active sessions')}</p>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      session.isCurrent ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 hover:border-muted-foreground/30'
                    }`}
                  >
                    <DeviceIcon type={session.deviceType} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{session.browser} — {session.os}</p>
                        {session.isCurrent && (
                          <Badge variant="outline" className="text-xs text-primary border-primary/30 px-1.5 py-0">
                            {tStr('الجلسة الحالية', 'Current')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.city && session.countryCode ? `${session.city}, ${session.countryCode}` : tStr('غير معروف', 'Unknown')}</span>
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{session.ipAddress}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: dateFnsLocale })}
                        </span>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokingId === session.id}
                        className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        id={`revoke-${session.id}`}
                      >
                        {revokingId === session.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                        {tStr('إنهاء', 'End')}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Disable 2FA Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showDisable2FA} onOpenChange={setShowDisable2FA}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldOff className="h-5 w-5" />
              {tStr('إيقاف المصادقة الثنائية', 'Disable Two-Factor Authentication')}
            </DialogTitle>
            <DialogDescription>
              {tStr('أدخل رمز التحقق من التطبيق للتأكيد. سيصبح حسابك أقل أماناً.', 'Enter the code from your app to confirm. Your account will be less secure.')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <Label htmlFor="disable-otp">{tStr('رمز التحقق (6 أرقام)', 'Verification Code (6 digits)')}</Label>
            <Input
              id="disable-otp"
              type="text" inputMode="numeric" maxLength={6}
              value={disableOtp} onChange={e => setDisableOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000" className="font-mono text-center tracking-widest" dir="ltr"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowDisable2FA(false); setDisableOtp(''); }}>
              {tStr('إلغاء', 'Cancel')}
            </Button>
            <Button id="confirm-disable-2fa" variant="destructive" onClick={handle2FADisable} disabled={disableLoading || disableOtp.length !== 6} className="gap-2">
              {disableLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
              {tStr('إيقاف 2FA', 'Disable 2FA')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
