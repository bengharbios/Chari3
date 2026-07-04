'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ShieldAlert, CheckCircle2, X, Clock, Loader2, FileText,
  User, ExternalLink, RefreshCw
} from 'lucide-react';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function AdminAppealsQueue() {
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const [appeals, setAppeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const fetchAppeals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/appeals?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) setAppeals(data.appeals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAppeals(); }, [statusFilter]);

  const handleAction = async (appealId: string, action: 'approve' | 'reject') => {
    setProcessingId(appealId);
    try {
      const res = await fetch('/api/admin/appeals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appealId, action, adminNote: adminNotes[appealId] || '' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'approve'
          ? t(locale, '✅ تم قبول الاستئناف وإعادة تفعيل الحساب', '✅ Appeal approved and account reactivated')
          : t(locale, '❌ تم رفض الاستئناف', '❌ Appeal rejected'));
        fetchAppeals();
      } else {
        toast.error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; labelEn: string; color: string }> = {
      pending:  { label: 'قيد المراجعة', labelEn: 'Pending',  color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      approved: { label: 'مقبول',        labelEn: 'Approved', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      rejected: { label: 'مرفوض',        labelEn: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    };
    const s = map[status] || { label: status, labelEn: status, color: 'bg-muted text-muted-foreground border-border' };
    return <Badge className={`border text-xs font-bold px-2 py-0.5 rounded-full ${s.color}`}>{isAr ? s.label : s.labelEn}</Badge>;
  };

  return (
    <div dir={dir} className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <Button
            key={f}
            size="sm"
            variant={statusFilter === f ? 'default' : 'outline'}
            className="rounded-xl text-xs font-bold"
            onClick={() => setStatusFilter(f)}
          >
            {f === 'pending' ? t(locale, 'قيد المراجعة', 'Pending')
              : f === 'approved' ? t(locale, 'مقبولة', 'Approved')
              : f === 'rejected' ? t(locale, 'مرفوضة', 'Rejected')
              : t(locale, 'الكل', 'All')}
          </Button>
        ))}
        <Button size="sm" variant="ghost" className="rounded-xl gap-2" onClick={fetchAppeals}>
          <RefreshCw className="h-3.5 w-3.5" />
          {t(locale, 'تحديث', 'Refresh')}
        </Button>
      </div>

      {/* Appeals List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : appeals.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-16 text-center flex flex-col items-center gap-3 text-muted-foreground">
            <ShieldAlert className="h-10 w-10 opacity-30" />
            <p className="font-bold">{t(locale, 'لا توجد استئنافات', 'No appeals found')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal: any) => (
            <Card key={appeal.id} className="border-border bg-card overflow-hidden">
              <CardHeader className="pb-3 bg-muted/20 border-b border-border">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                    {t(locale, 'استئناف #', 'Appeal #')}{appeal.id.slice(-6).toUpperCase()}
                    {statusBadge(appeal.status)}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {new Date(appeal.createdAt).toLocaleDateString(isAr ? 'ar-DZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Merchant info */}
                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{isAr ? (appeal.user?.name || appeal.user?.nameEn) : (appeal.user?.nameEn || appeal.user?.name)}</p>
                    <p className="text-xs text-muted-foreground">{appeal.user?.email}</p>
                  </div>
                  <Badge className="ms-auto text-xs border border-border">{appeal.user?.role}</Badge>
                </div>

                {/* Appeal reason */}
                <div>
                  <p className="text-xs text-muted-foreground font-bold mb-1">{t(locale, 'سبب الاستئناف:', 'Appeal Reason:')}</p>
                  <p className="text-sm bg-muted/20 p-3 rounded-xl leading-relaxed whitespace-pre-line">{appeal.reason}</p>
                </div>

                {/* Supporting doc */}
                {appeal.documentUrl && (
                  <a
                    href={appeal.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    {t(locale, 'عرض المستند الداعم', 'View Supporting Document')}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                {/* Admin note for pending */}
                {appeal.status === 'pending' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{t(locale, 'ملاحظة للتاجر (اختياري):', 'Note to merchant (optional):')}</Label>
                    <Textarea
                      value={adminNotes[appeal.id] || ''}
                      onChange={e => setAdminNotes(prev => ({ ...prev, [appeal.id]: e.target.value }))}
                      placeholder={t(locale, 'أضف ملاحظة توضيحية للتاجر...', 'Add an explanatory note to the merchant...')}
                      rows={2}
                      className="rounded-xl resize-none text-sm"
                    />
                  </div>
                )}

                {/* Actions */}
                {appeal.status === 'pending' && (
                  <div className="flex gap-3 pt-2 border-t border-border">
                    <Button
                      className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                      onClick={() => handleAction(appeal.id, 'approve')}
                      disabled={processingId === appeal.id}
                    >
                      {processingId === appeal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {t(locale, 'قبول وإعادة التفعيل', 'Approve & Reactivate')}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-red-500/40 text-red-500 hover:bg-red-500/10 font-bold gap-2"
                      onClick={() => handleAction(appeal.id, 'reject')}
                      disabled={processingId === appeal.id}
                    >
                      {processingId === appeal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      {t(locale, 'رفض الاستئناف', 'Reject Appeal')}
                    </Button>
                  </div>
                )}

                {/* Resolved note */}
                {appeal.status !== 'pending' && appeal.adminNote && (
                  <div className={`p-3 rounded-xl border text-sm ${appeal.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}>
                    <p className="font-bold mb-1">{t(locale, 'ملاحظة الإدارة:', 'Admin Note:')}</p>
                    <p>{appeal.adminNote}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
