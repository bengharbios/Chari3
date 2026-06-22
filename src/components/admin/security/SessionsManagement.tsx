'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Monitor, Smartphone, Globe, ShieldOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAppStore } from '@/lib/store';

export default function SessionsManagement() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { locale } = useAppStore();

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/security/sessions');
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revokeSession = async (id: string) => {
    if (!confirm(t('security.sessions.confirmRevoke'))) return;
    
    try {
      const res = await fetch(`/api/admin/security/sessions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('security.sessions.revokeSuccess'));
        fetchSessions();
      }
    } catch (e) {
      toast.error(t('security.sessions.revokeFailed'));
    }
  };

  const revokeAll = async () => {
    if (!confirm(t('security.sessions.confirmRevokeAll'))) return;
    
    try {
      const res = await fetch(`/api/admin/security/sessions?action=revoke_all`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('security.sessions.revokeAllSuccess'));
        fetchSessions();
      }
    } catch (e) {
      toast.error(t('security.sessions.revokeAllFailed'));
    }
  };

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('security.sessions.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('security.sessions.desc')}
          </p>
        </div>
        <Button variant="destructive" onClick={revokeAll} className="gap-2">
          <ShieldOff className="w-4 h-4" />
          {t('security.sessions.revokeAll')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.sessions.currentSessions')} ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">{t('security.sessions.noSessions')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-3 font-semibold">{t('security.sessions.user')}</th>
                    <th className="p-3 font-semibold">{t('security.sessions.role')}</th>
                    <th className="p-3 font-semibold">{t('security.sessions.ip')}</th>
                    <th className="p-3 font-semibold">{t('security.sessions.userAgent')}</th>
                    <th className="p-3 font-semibold">{t('security.sessions.time')}</th>
                    <th className={`p-3 font-semibold ${locale === 'ar' ? 'text-left' : 'text-right'}`}>{t('security.sessions.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium">{s.user?.name || t('security.sessions.unknown')}</td>
                      <td className="p-3">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                          {s.user?.role}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground" dir="ltr">{s.ipAddress || t('security.sessions.notAvailable')}</td>
                      <td className="p-3 text-muted-foreground max-w-xs truncate" title={s.userAgent}>
                        <div className="flex items-center gap-2">
                          {s.userAgent?.toLowerCase().includes('mobile') ? <Smartphone className="w-4 h-4 text-primary" /> : <Monitor className="w-4 h-4 text-primary" />}
                          <span className="truncate">{s.userAgent || t('security.sessions.notAvailable')}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground" dir="ltr">
                        {new Date(s.createdAt).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'en-US')}
                      </td>
                      <td className={`p-3 ${locale === 'ar' ? 'text-left' : 'text-right'}`}>
                        <Button variant="ghost" size="sm" onClick={() => revokeSession(s.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4 ml-2" />
                          {t('security.sessions.revoke')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
