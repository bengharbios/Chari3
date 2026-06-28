'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Loader2, Save, Shield, Lock, Smartphone, Clock, AlertTriangle,
  Key, Eye, RefreshCw, Settings2
} from 'lucide-react';

interface SecuritySettings {
  withdrawal_hold_hours: number;
  require_2fa_for_withdrawal: boolean;
  max_sessions_per_user: number;
  session_lifetime_days: number;
  login_attempt_limit: number;
  login_lockout_minutes: number;
  mfa_grace_period_hours: number;
  alert_on_new_device: boolean;
  alert_on_sensitive_change: boolean;
}

const DEFAULTS: SecuritySettings = {
  withdrawal_hold_hours: 48,
  require_2fa_for_withdrawal: false,
  max_sessions_per_user: 5,
  session_lifetime_days: 30,
  login_attempt_limit: 5,
  login_lockout_minutes: 15,
  mfa_grace_period_hours: 0,
  alert_on_new_device: true,
  alert_on_sensitive_change: true,
};

export default function AdminSecuritySettingsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const tStr = (ar, en) => locale === 'ar' ? ar : en;

  const [settings, setSettings] = useState<SecuritySettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/security/settings');
      const data = await res.json();
      if (data.success) {
        setSettings({ ...DEFAULTS, ...data.settings });
      }
    } catch {
      toast.error(tStr('خطأ في تحميل الإعدادات', 'Error loading settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/security/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(tStr('تم حفظ إعدادات الأمان بنجاح ✓', 'Security settings saved successfully ✓'));
      } else {
        toast.error(data.error || tStr('حدث خطأ', 'An error occurred'));
      }
    } catch {
      toast.error(tStr('خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setSaving(false);
    }
  };

  const setNum = (key: keyof SecuritySettings, val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0) {
      setSettings(prev => ({ ...prev, [key]: n }));
    }
  };

  const setToggle = (key: keyof SecuritySettings, val: boolean) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {tStr('إعدادات الأمان المتقدمة', 'Advanced Security Settings')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {tStr('تحكم في سياسات الأمان وحماية الحسابات على مستوى المنصة', 'Control security policies and account protection platform-wide')}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-primary hover:bg-primary/90 text-white"
          id="save-security-settings-btn"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {tStr('حفظ الإعدادات', 'Save Settings')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Withdrawal Security */}
        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-base">
                {tStr('قفل السحب الأمني', 'Withdrawal Security Lock')}
              </CardTitle>
            </div>
            <CardDescription>
              {tStr('مدة تجميد عمليات السحب بعد تغيير البيانات الحساسة (البريد أو الهاتف)',
                'Duration to freeze withdrawals after sensitive data changes (email or phone)'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal-hold-hours">
                {tStr('مدة الحظر (بالساعات)', 'Hold Duration (hours)')}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="withdrawal-hold-hours"
                  type="number"
                  min={0}
                  max={168}
                  value={settings.withdrawal_hold_hours}
                  onChange={e => setNum('withdrawal_hold_hours', e.target.value)}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">
                  {settings.withdrawal_hold_hours === 0
                    ? tStr('معطّل', 'Disabled')
                    : settings.withdrawal_hold_hours === 24
                      ? tStr('24 ساعة (يوم)', '24 hours (1 day)')
                      : settings.withdrawal_hold_hours === 48
                        ? tStr('48 ساعة (يومان) ← الافتراضي', '48 hours (2 days) ← Default')
                        : settings.withdrawal_hold_hours === 72
                          ? tStr('72 ساعة (3 أيام)', '72 hours (3 days)')
                          : `${settings.withdrawal_hold_hours} ${tStr('ساعة', 'hours')}`
                  }
                </span>
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {[0, 24, 48, 72].map(h => (
                  <Button
                    key={h}
                    variant={settings.withdrawal_hold_hours === h ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings(p => ({ ...p, withdrawal_hold_hours: h }))}
                    id={`hold-hours-${h}-btn`}
                  >
                    {h === 0 ? tStr('معطّل', 'Off') : `${h}h`}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {tStr('اشتراط 2FA لعمليات السحب', 'Require 2FA for Withdrawals')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tStr('يجبر التاجر على تفعيل المصادقة الثنائية قبل السحب', 'Forces merchants to enable 2FA before withdrawing')}
                </p>
              </div>
              <Switch
                id="require-2fa-withdrawal"
                checked={!!settings.require_2fa_for_withdrawal}
                onCheckedChange={v => setToggle('require_2fa_for_withdrawal', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card className="border-blue-200 dark:border-blue-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">
                {tStr('إدارة الجلسات', 'Session Management')}
              </CardTitle>
            </div>
            <CardDescription>
              {tStr('التحكم في عدد الجلسات المسموحة وعمرها', 'Control allowed session count and lifetime')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-sessions">
                  {tStr('أقصى عدد جلسات', 'Max Sessions per User')}
                </Label>
                <Input
                  id="max-sessions"
                  type="number"
                  min={1}
                  max={20}
                  value={settings.max_sessions_per_user}
                  onChange={e => setNum('max_sessions_per_user', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-lifetime">
                  {tStr('عمر الجلسة (يوماً)', 'Session Lifetime (days)')}
                </Label>
                <Input
                  id="session-lifetime"
                  type="number"
                  min={1}
                  max={365}
                  value={settings.session_lifetime_days}
                  onChange={e => setNum('session_lifetime_days', e.target.value)}
                />
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              {tStr('💡 إذا تجاوز المستخدم الحد الأقصى، سيتم إنهاء أقدم الجلسات تلقائياً.',
                '💡 If a user exceeds the limit, the oldest sessions will be automatically terminated.'
              )}
            </div>
          </CardContent>
        </Card>

        {/* Login Protection */}
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base">
                {tStr('حماية تسجيل الدخول', 'Login Protection')}
              </CardTitle>
            </div>
            <CardDescription>
              {tStr('سياسة القفل التلقائي عند محاولات الدخول الفاشلة', 'Auto-lockout policy for failed login attempts')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="login-attempts">
                  {tStr('عدد المحاولات المسموحة', 'Allowed Attempts')}
                </Label>
                <Input
                  id="login-attempts"
                  type="number"
                  min={3}
                  max={20}
                  value={settings.login_attempt_limit}
                  onChange={e => setNum('login_attempt_limit', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lockout-minutes">
                  {tStr('مدة القفل (دقائق)', 'Lockout Duration (min)')}
                </Label>
                <Input
                  id="lockout-minutes"
                  type="number"
                  min={5}
                  max={1440}
                  value={settings.login_lockout_minutes}
                  onChange={e => setNum('login_lockout_minutes', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="border-green-200 dark:border-green-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">
                {tStr('التنبيهات والإشعارات', 'Alerts & Notifications')}
              </CardTitle>
            </div>
            <CardDescription>
              {tStr('إشعارات الأمان التلقائية عند النشاطات الحساسة', 'Automatic security alerts for sensitive activities')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {tStr('تنبيه عند تسجيل الدخول من جهاز جديد', 'Alert on New Device Login')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tStr('إرسال إشعار للتاجر عند الدخول من جهاز غير معروف', 'Notify merchant when logging in from unknown device')}
                </p>
              </div>
              <Switch
                id="alert-new-device"
                checked={!!settings.alert_on_new_device}
                onCheckedChange={v => setToggle('alert_on_new_device', v)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {tStr('تنبيه عند تعديل البيانات الحساسة', 'Alert on Sensitive Change')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tStr('إشعار عند تغيير البريد أو الهاتف أو كلمة المرور', 'Notify on email, phone or password change')}
                </p>
              </div>
              <Switch
                id="alert-sensitive-change"
                checked={!!settings.alert_on_sensitive_change}
                onCheckedChange={v => setToggle('alert_on_sensitive_change', v)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="mfa-grace-period">
                {tStr('مهلة المصادقة الثنائية (ساعات)', '2FA Grace Period (hours)')}
              </Label>
              <Input
                id="mfa-grace-period"
                type="number"
                min={0}
                max={72}
                value={settings.mfa_grace_period_hours}
                onChange={e => setNum('mfa_grace_period_hours', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {tStr('المدة المسموحة للتاجر لإكمال إعداد 2FA بعد طلب الإدارة (0 = فوري)',
                  'Grace period for merchant to complete 2FA setup after admin request (0 = immediate)'
                )}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Live Security Summary */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <CardHeader>
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            {tStr('ملخص السياسة الأمنية الحالية', 'Current Security Policy Summary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{settings.withdrawal_hold_hours}h</p>
              <p className="text-xs text-slate-400">{tStr('قفل السحب', 'Withdrawal Lock')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{settings.max_sessions_per_user}</p>
              <p className="text-xs text-slate-400">{tStr('أقصى جلسات', 'Max Sessions')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{settings.login_attempt_limit}</p>
              <p className="text-xs text-slate-400">{tStr('محاولات الدخول', 'Login Attempts')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{settings.session_lifetime_days}d</p>
              <p className="text-xs text-slate-400">{tStr('عمر الجلسة', 'Session Lifetime')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
