'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { t } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export function AdminUpgradeQueue() {
  const { locale } = useTranslation();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Rejection modal states
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/upgrade-requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject', customNote?: string) => {
    setActionLoading(id);
    try {
      const req = requests.find(r => r.id === id);
      const res = await fetch(`/api/admin/upgrade-requests/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: req.userId,
          requestId: req.id,
          rejectionNote: action === 'reject' ? (customNote || 'Rejected by admin') : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, `تم إجراء الـ ${action} بنجاح`, `Request ${action}d successfully`));
        fetchRequests();
      } else {
        toast.error(data.error || `Failed to ${action} request`);
      }
    } catch (error) {
      toast.error(`Error processing ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectRequestId(id);
    setRejectionNote('');
    setIsRejectOpen(true);
  };

  const confirmRejection = async () => {
    if (!rejectRequestId) return;
    setIsRejectOpen(false);
    await handleAction(rejectRequestId, 'reject', rejectionNote);
    setRejectRequestId(null);
    setRejectionNote('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
            {t(locale, 'تمت الموافقة', 'Approved')}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none">
            {t(locale, 'مرفوض', 'Rejected')}
          </Badge>
        );
      case 'READY_FOR_REVIEW':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">
            {t(locale, 'جاهز للمراجعة', 'Ready for Review')}
          </Badge>
        );
      case 'AWAITING_PAYMENT':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none">
            {t(locale, 'بانتظار الدفع', 'Awaiting Payment')}
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge variant="secondary">
            {t(locale, 'قيد الانتظار', 'Pending')}
          </Badge>
        );
    }
  };

  return (
    <>
      <Card className="card-surface mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">{t(locale, 'طابور ترقيات الأعمال', 'Business Upgrade Queue')}</CardTitle>
          <Button variant="outline" size="icon" onClick={fetchRequests} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {loading && requests.length === 0 ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t(locale, 'لا يوجد طلبات ترقية حالياً', 'No upgrade requests currently')}</p>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="flex justify-between items-center p-4 border rounded-xl min-h-[80px]">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base">{req.user?.name || req.user?.email || 'Unknown User'}</h4>
                    <div className="flex flex-wrap gap-2 items-center">
                      {getStatusBadge(req.status)}
                      <Badge variant="outline">{req.feeSnapshot} DZD</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {req.status === 'AWAITING_PAYMENT' && (
                      <>
                        <Button variant="outline" onClick={() => handleAction(req.id, 'approve')} disabled={actionLoading === req.id}>
                          {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t(locale, 'تأكيد الدفع وموافقة', 'Confirm Payment & Approve')}
                        </Button>
                        <Button variant="destructive" onClick={() => handleRejectClick(req.id)} disabled={actionLoading === req.id}>
                          {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t(locale, 'رفض', 'Reject')}
                        </Button>
                      </>
                    )}
                    {req.status === 'READY_FOR_REVIEW' && (
                      <>
                        <Button onClick={() => handleAction(req.id, 'approve')} disabled={actionLoading === req.id}>
                          {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t(locale, 'موافقة', 'Approve')}
                        </Button>
                        <Button variant="destructive" onClick={() => handleRejectClick(req.id)} disabled={actionLoading === req.id}>
                          {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t(locale, 'رفض', 'Reject')}
                        </Button>
                      </>
                    )}
                    {req.status === 'PENDING' && (
                      <Button variant="destructive" onClick={() => handleRejectClick(req.id)} disabled={actionLoading === req.id}>
                        {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t(locale, 'رفض', 'Reject')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Note Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t(locale, 'رفض طلب الترقية', 'Reject Upgrade Request')}</DialogTitle>
            <DialogDescription>
              {t(locale, 'يرجى كتابة سبب رفض الطلب. سيتم إظهار هذا السبب للتاجر في لوحته الخاصة.', 'Please write the reason for rejecting the request. This reason will be shown to the merchant on their dashboard.')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder={t(locale, 'اكتب سبب الرفض هنا...', 'Type rejection reason here...')}
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              {t(locale, 'إلغاء', 'Cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmRejection} disabled={!rejectionNote.trim()}>
              {t(locale, 'تأكيد الرفض', 'Confirm Rejection')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
