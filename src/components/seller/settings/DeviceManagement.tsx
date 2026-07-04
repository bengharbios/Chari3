'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Laptop, Smartphone, Globe, Trash2, ShieldAlert, Loader2, 
  CheckCircle2, Clock, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { useAppStore } from '@/lib/store';

const tStr = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function DeviceManagement() {
  const { data: session } = useSession();
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isAr = locale === 'ar';

  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/auth/sessions?userId=${session.user.id}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      } else {
        toast.error(tStr(locale, 'فشل جلب الأجهزة النشطة', 'Failed to fetch active devices'));
      }
    } catch (e) {
      toast.error(tStr(locale, 'حدث خطأ في الاتصال', 'Connection error'));
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, locale]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (sessionId: string) => {
    if (!session?.user?.id) return;
    
    const confirmMsg = tStr(
      locale,
      'هل أنت متأكد من إنهاء هذه الجلسة وتسجيل خروج الجهاز؟',
      'Are you sure you want to end this session and log out this device?'
    );
    if (!window.confirm(confirmMsg)) return;

    setRevokingId(sessionId);
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(tStr(locale, 'تم إنهاء الجلسة وطرد الجهاز بنجاح', 'Session ended successfully'));
        // If current session was deleted, trigger reload or logout
        const endedSession = sessions.find(s => s.id === sessionId);
        if (endedSession?.isCurrent) {
          window.location.reload();
        } else {
          fetchSessions();
        }
      } else {
        toast.error(data.error || tStr(locale, 'فشل إنهاء الجلسة', 'Failed to end session'));
      }
    } catch (e) {
      toast.error(tStr(locale, 'حدث خطأ أثناء الاتصال بالخادم', 'Server connection error'));
    } finally {
      setRevokingId(null);
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    if (deviceType === 'mobile' || deviceType === 'tablet') {
      return <Smartphone className="h-5 w-5 text-indigo-400" />;
    }
    return <Laptop className="h-5 w-5 text-emerald-400" />;
  };

  return (
    <Card dir={dir} className="border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-emerald-500/20" />
      
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25">
            <Globe className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-white">
              {tStr(locale, 'الأجهزة النشطة وجلسات الدخول', 'Active Devices & Sessions')}
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-1">
              {tStr(
                locale,
                'تابع جميع الأجهزة التي سجلت الدخول إلى حسابك حالياً وقم بطرد أو إنهاء أي جلسة مشبوهة.',
                'Monitor all devices currently logged into your account and revoke any suspicious sessions.'
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            <span className="text-xs text-slate-400 font-bold">{tStr(locale, 'جاري جلب قائمة الأجهزة...', 'Fetching devices...')}</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            {tStr(locale, 'لا توجد جلسات نشطة حالياً.', 'No active sessions found.')}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sessions.map((s) => (
              <div key={s.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-slate-800 border border-white/5">
                    {getDeviceIcon(s.deviceType)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">
                        {s.os || 'Unknown OS'} • {s.browser || 'Browser'}
                      </span>
                      {s.isCurrent && (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] py-0 px-2 rounded-full font-bold">
                          <CheckCircle2 className="h-2.5 w-2.5 me-1 shrink-0" />
                          {tStr(locale, 'هذا الجهاز حالياً', 'This Device')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      IP: <span className="font-mono">{s.ipAddress || 'unknown'}</span> • {s.city || 'Unknown City'}, {s.countryCode || 'DZ'}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tStr(locale, 'آخر نشاط:', 'Last active:')} {new Date(s.updatedAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRevokeSession(s.id)}
                    disabled={revokingId === s.id}
                    className="h-9 w-9 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                    title={tStr(locale, 'إنهاء الجلسة وطرد الجهاز', 'Revoke session')}
                  >
                    {revokingId === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-2.5">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-300/80 leading-relaxed font-semibold">
            {tStr(
              locale,
              'تنبيه أمني: إذا لاحظت وجود أي جهاز أو موقع جغرافي غير مألوف، يرجى إنهاء الجلسة فوراً وتغيير كلمة المرور الخاصة بك فوراً لتأمين المتجر.',
              'Security Tip: If you notice any unfamiliar device or location, end the session immediately and change your password to protect your store.'
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
