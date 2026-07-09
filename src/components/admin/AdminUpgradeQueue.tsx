'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export function AdminUpgradeQueue() {
  const { t, locale } = useTranslation();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Note: in a real app, you would fetch these from a dedicated GET /api/admin/upgrade-requests API
  // that we would build, but for this plan we are putting the skeleton here.

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
          <p className="text-muted-foreground text-sm">{t('لا يوجد طلبات ترقية حالياً', 'No upgrade requests currently')}</p>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="flex justify-between items-center p-4 border rounded-xl">
                <div>
                  <h4 className="font-bold">{req.store?.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{req.status}</Badge>
                    <Badge variant="secondary">{req.feeSnapshot} DZD</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {req.status === 'AWAITING_PAYMENT' && (
                    <Button variant="outline" onClick={() => {/* confirm payment */}}>
                      {t('تأكيد الدفع', 'Confirm Payment')}
                    </Button>
                  )}
                  {req.status === 'READY_FOR_REVIEW' && (
                    <>
                      <Button onClick={() => {/* approve */}}>{t('موافقة', 'Approve')}</Button>
                      <Button variant="destructive" onClick={() => {/* reject */}}>{t('رفض', 'Reject')}</Button>
                    </>
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
