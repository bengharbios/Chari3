'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { t } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export function AdminUpgradeQueue() {
  const { locale } = useTranslation();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
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

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const req = requests.find(r => r.id === id);
      const res = await fetch(`/api/admin/upgrade-requests/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: req.userId, requestId: req.id, rejectionNote: action === 'reject' ? 'Rejected by admin' : undefined })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Request ${action}d successfully`);
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

  return (
    <Card className="card-surface mt-6">
      <CardHeader>
        <CardTitle>{t(locale, 'طابور ترقيات الأعمال', 'Business Upgrade Queue')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t(locale, 'لا يوجد طلبات ترقية حالياً', 'No upgrade requests currently')}</p>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="flex justify-between items-center p-4 border rounded-xl">
                <div>
                  <h4 className="font-bold">{req.user?.name || req.user?.email || 'Unknown User'}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{req.status}</Badge>
                    <Badge variant="secondary">{req.feeSnapshot} DZD</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {req.status === 'AWAITING_PAYMENT' && (
                    <Button variant="outline" onClick={() => handleAction(req.id, 'approve')} disabled={actionLoading === req.id}>
                      {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t(locale, 'تأكيد الدفع وموافقة', 'Confirm Payment & Approve')}
                    </Button>
                  )}
                  {req.status === 'READY_FOR_REVIEW' && (
                    <>
                      <Button onClick={() => handleAction(req.id, 'approve')} disabled={actionLoading === req.id}>
                        {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t(locale, 'موافقة', 'Approve')}
                      </Button>
                      <Button variant="destructive" onClick={() => handleAction(req.id, 'reject')} disabled={actionLoading === req.id}>
                        {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t(locale, 'رفض', 'Reject')}
                      </Button>
                    </>
                  )}
                  {req.status === 'PENDING' && (
                    <Button variant="destructive" onClick={() => handleAction(req.id, 'reject')} disabled={actionLoading === req.id}>
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
  );
}
