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
  require_two_person_approval: boolean;
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
  require_two_person_approval: true,
};

export default function AdminSecuritySettingsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';

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
      toast.error(t('adminSecurity.loadError'));
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
        toast.success(t('adminSecurity.saveSuccess'));
      } else {
        toast.error(data.error || t('adminSecurity.saveError'));
      }
    } catch {
      toast.error(t('security.connError'));
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
              {t('adminSecurity.pageTitle')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('adminSecurity.pageDesc')}
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
          {t('adminSecurity.saveBtn')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Withdrawal Security */}
        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-base">
                {t('adminSecurity.withdrawalLockTitle')}
              </CardTitle>
            </div>
            <CardDescription>
              {t('adminSecurity.withdrawalLockDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal-hold-hours">
                {t('adminSecurity.holdDurationLabel')}
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
                    ? t('adminSecurity.disabled')
                    : settings.withdrawal_hold_hours === 24
                      ? t('adminSecurity.hours24')
                      : settings.withdrawal_hold_hours === 48
                        ? t('adminSecurity.hours48')
                        : settings.withdrawal_hold_hours === 72
                          ? t('adminSecurity.hours72')
                          : t('adminSecurity.hoursCount', { hours: settings.withdrawal_hold_hours })
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
                    {h === 0 ? t('adminSecurity.offBtn') : `${h}h`}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {t('adminSecurity.require2faWithdrawal')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('adminSecurity.require2faWithdrawalDesc')}
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
                {t('adminSecurity.sessionsTitle')}
              </CardTitle>
            </div>
            <CardDescription>
              {t('adminSecurity.sessionsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-sessions">
                  {t('adminSecurity.maxSessionsLabel')}
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
                  {t('adminSecurity.sessionLifetimeLabel')}
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
              {t('adminSecurity.sessionsTip')}
            </div>
          </CardContent>
        </Card>

        {/* Login Protection */}
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base">
                {t('adminSecurity.loginProtectionTitle')}
              </CardTitle>
            </div>
            <CardDescription>
              {t('adminSecurity.loginProtectionDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="login-attempts">
                  {t('adminSecurity.allowedAttemptsLabel')}
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
                  {t('adminSecurity.lockoutDurationLabel')}
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
                {t('adminSecurity.alertsTitle')}
              </CardTitle>
            </div>
            <CardDescription>
              {t('adminSecurity.alertsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {t('adminSecurity.alertNewDevice')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('adminSecurity.alertNewDeviceDesc')}
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
                  {t('adminSecurity.alertSensitiveChange')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('adminSecurity.alertSensitiveChangeDesc')}
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
                {t('adminSecurity.mfaGracePeriodLabel')}
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
                {t('adminSecurity.mfaGracePeriodDesc')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Two-Person Approval (الرقابة الثنائية) */}
        <Card className="border-purple-200 dark:border-purple-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-base">
                {t('adminSecurity.twoPersonApprovalTitle')}
              </CardTitle>
            </div>
            <CardDescription>
              {t('adminSecurity.twoPersonApprovalDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {t('adminSecurity.requireTwoPersonRule')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('adminSecurity.requireTwoPersonRuleDesc')}
                </p>
              </div>
              <Switch
                id="require-two-person-approval"
                checked={!!settings.require_two_person_approval}
                onCheckedChange={v => setToggle('require_two_person_approval', v)}
              />
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-xs text-purple-700 dark:text-purple-300">
              {t('adminSecurity.twoPersonTip')}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Live Security Summary */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <CardHeader>
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            {t('adminSecurity.summaryTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{settings.withdrawal_hold_hours}h</p>
              <p className="text-xs text-slate-400">{t('adminSecurity.summaryHold')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{settings.max_sessions_per_user}</p>
              <p className="text-xs text-slate-400">{t('adminSecurity.summaryMaxSessions')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{settings.login_attempt_limit}</p>
              <p className="text-xs text-slate-400">{t('adminSecurity.summaryAttempts')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{settings.session_lifetime_days}d</p>
              <p className="text-xs text-slate-400">{t('adminSecurity.summaryLifetime')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
