'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ShieldAlert, CheckCircle2, X, Clock, Loader2, RefreshCw,
  User, AlertTriangle, Info
} from 'lucide-react';

const t = (locale: string, ar: string, en: string) => locale === 'ar' ? ar : en;

export default function CriticalActionReview() {
  const { adminUser } = useAdminAuthStore();
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const adminId = adminUser?.id;
  const isSuperAdmin = (adminUser as any)?.role === 'super_admin';

  const [actions, setActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/critical-actions?status=${statusFilter}&requesterId=${adminId}`);
      const data = await res.json();
      if (data.success) setActions(data.actions || []);
    } catch { /* noop */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { if (adminId) fetchActions(); }, [statusFilter, adminId]);

  const handleDecision = async (actionId: string, decision: 'approve' | 'reject') => {
    setProcessingId(actionId);
    try {
      const res = await fetch('/api/admin/critical-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, approverId: adminId, decision, note: notes[actionId] || '' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(decision === 'approve'
          ? t(locale, '✅ تمت الموافقة على الإجراء', '✅ Action approved')
          : t(locale, '❌ تم رفض الإجراء', '❌ Action rejected'));
        fetchActions();
      } else {
        toast.error(locale === 'ar' ? (data.error || 'فشل') : (data.errorEn || data.error));
      }
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { labelAr: string; labelEn: string; cls: string }> = {
      pending:  { labelAr: 'قيد المراجعة', labelEn: 'Pending',  cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      approved: { labelAr: 'مقبول',         labelEn: 'Approved', cls: 'bg-green-500/10 text-green-600 border-green-500/20' },
      rejected: { labelAr: 'مرفوض',         labelEn: 'Rejected', cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
    };
    const s = map[status] || { labelAr: status, labelEn: status, cls: 'bg-muted text-muted-foreground border-border' };
    return <Badge className={`border text-xs font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{isRTL ? s.labelAr : s.labelEn}</Badge>;
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">

      {/* Info banner for SUPER_ADMIN */}
      {isSuperAdmin && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          {t(locale,
            'بصفتك SUPER_ADMIN، إجراءاتك تُنفَّذ فوراً دون الحاجة لموافقة أحد. هذه الصفحة لمراجعة إجراءات المديرين الآخرين.',
            'As SUPER_ADMIN, your actions execute immediately without approval. This page shows other admins\' pending actions.'
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <Button key={f} size="sm" variant={statusFilter === f ? 'default' : 'outline'} className="rounded-xl text-xs font-bold" onClick={() => setStatusFilter(f)}>
            {f === 'pending'  ? t(locale, 'قيد المراجعة', 'Pending')
            : f === 'approved' ? t(locale, 'مقبولة', 'Approved')
            : f === 'rejected' ? t(locale, 'مرفوضة', 'Rejected')
            : t(locale, 'الكل', 'All')}
          </Button>
        ))}
        <Button size="sm" variant="ghost" className="rounded-xl gap-2" onClick={fetchActions}>
          <RefreshCw className="h-3.5 w-3.5" />{t(locale, 'تحديث', 'Refresh')}
        </Button>
      </div>

      {/* Actions List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : actions.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <ShieldAlert className="h-10 w-10 opacity-30" />
            <p className="font-bold">{t(locale, 'لا توجد إجراءات', 'No actions found')}</p>
            {statusFilter === 'pending' && <p className="text-sm">{t(locale, 'لا توجد إجراءات تنتظر موافقتك', 'No actions awaiting your approval')}</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {actions.map((action: any) => {
            const isMine = action.createdBy === adminId;
            const canApprove = !isMine && action.status === 'pending';
            return (
              <Card key={action.id} className={`border overflow-hidden ${action.status === 'pending' ? 'border-amber-200 dark:border-amber-900/40' : 'border-border'}`}>
                <CardHeader className="pb-3 bg-muted/20 border-b border-border">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      {isRTL ? action.labelAr : action.labelEn}
                      {statusBadge(action.status)}
                      {isMine && <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs rounded-full px-2">{t(locale, 'طلبك', 'Your request')}</Badge>}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {new Date(action.createdAt).toLocaleString(isRTL ? 'ar-DZ' : 'en-GB')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {/* Requester info */}
                  <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{isRTL ? (action.creator?.name || action.creator?.nameEn) : (action.creator?.nameEn || action.creator?.name)}</p>
                      <p className="text-xs text-muted-foreground">{action.creator?.email}</p>
                    </div>
                    <Badge className="ms-auto text-xs border border-border">{action.creator?.role}</Badge>
                  </div>

                  {/* Payload details */}
                  {action.payload && Object.keys(action.payload).filter(k => !k.startsWith('_')).length > 0 && (
                    <div className="p-3 bg-muted/20 rounded-xl text-xs font-mono">
                      {Object.entries(action.payload)
                        .filter(([k]) => !k.startsWith('_'))
                        .map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <span className="text-muted-foreground">{k}:</span>
                            <span className="font-bold">{String(v)}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Approver info */}
                  {action.approver && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      {t(locale, 'تمت المعالجة بواسطة:', 'Processed by:')} <span className="font-bold">{isRTL ? action.approver.name : (action.approver.nameEn || action.approver.name)}</span>
                    </div>
                  )}

                  {/* Note textarea for pending actions */}
                  {canApprove && (
                    <div className="space-y-2">
                      <Label className="text-xs">{t(locale, 'ملاحظة (اختياري)', 'Note (optional)')}</Label>
                      <Textarea
                        value={notes[action.id] || ''}
                        onChange={e => setNotes(p => ({ ...p, [action.id]: e.target.value }))}
                        rows={2}
                        className="rounded-xl resize-none text-sm"
                        placeholder={t(locale, 'أضف ملاحظة...', 'Add a note...')}
                      />
                    </div>
                  )}

                  {/* Self-approval warning */}
                  {isMine && action.status === 'pending' && (
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {t(locale, 'هذا طلبك — ينتظر موافقة مدير آخر', 'This is your request — waiting for another admin\'s approval')}
                    </div>
                  )}

                  {/* Action buttons */}
                  {canApprove && (
                    <div className="flex gap-3 pt-1 border-t border-border">
                      <Button
                        className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                        onClick={() => handleDecision(action.id, 'approve')}
                        disabled={processingId === action.id}
                        id={`approve-action-${action.id}`}
                      >
                        {processingId === action.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        {t(locale, 'موافقة وتنفيذ', 'Approve & Execute')}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl border-red-500/40 text-red-500 hover:bg-red-500/10 font-bold gap-2"
                        onClick={() => handleDecision(action.id, 'reject')}
                        disabled={processingId === action.id}
                        id={`reject-action-${action.id}`}
                      >
                        {processingId === action.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        {t(locale, 'رفض', 'Reject')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
