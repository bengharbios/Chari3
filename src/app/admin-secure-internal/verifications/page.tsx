'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { ShieldCheck, Search, Filter, CheckCircle, XCircle, Clock, Eye, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

function t(locale: string, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

const statusConfig: any = {
  NOT_SUBMITTED: { labelAr: 'لم يرسل', labelEn: 'Not Submitted', color: 'bg-gray-100 text-gray-800' },
  PENDING_REVIEW: { labelAr: 'قيد المراجعة', labelEn: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { labelAr: 'معتمد', labelEn: 'Approved', color: 'bg-green-100 text-green-800' },
  REJECTED: { labelAr: 'مرفوض', labelEn: 'Rejected', color: 'bg-red-100 text-red-800' },
  REQUIRES_RESUBMISSION: { labelAr: 'مطلوب تعديل', labelEn: 'Requires Resubmission', color: 'bg-orange-100 text-orange-800' }
};

export default function AdminVerificationsPage() {
  const { locale } = useAppStore();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');
  const [docStatuses, setDocStatuses] = useState<Record<string, { status: string, reason: string }>>({});

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verifications');
      const data = await res.json();
      if (data.success) {
        setVerifications(data.data);
      }
    } catch (e) {
      toast.error(t(locale, 'فشل جلب البيانات', 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (verificationId: string, globalStatus: string) => {
    try {
      const documentUpdates = Object.keys(docStatuses).map(docId => ({
        id: docId,
        status: docStatuses[docId].status,
        rejectionReason: docStatuses[docId].reason
      }));

      const res = await fetch(`/api/admin/verifications/${verificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REVIEWED_APPLICATION',
          status: globalStatus,
          notes: adminNote,
          documentUpdates
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم تحديث حالة التوثيق بنجاح', 'Verification updated successfully'));
        setSelectedVerification(null);
        fetchVerifications();
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error(t(locale, 'حدث خطأ', 'An error occurred'));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t(locale, 'مراجعة التوثيق (KYC/KYB)', 'KYC/KYB Verifications')}</h1>
          <p className="text-sm text-muted-foreground">{t(locale, 'إدارة طلبات توثيق المتاجر والبائعين', 'Manage seller verification requests')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verification List */}
        <div className="md:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t(locale, 'بحث عن بائع...', 'Search seller...')} className="pr-9" />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {loading ? (
              <p className="text-sm text-center text-muted-foreground">{t(locale, 'جاري التحميل...', 'Loading...')}</p>
            ) : verifications.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground">{t(locale, 'لا توجد طلبات توثيق', 'No verifications found')}</p>
            ) : (
              verifications.map(v => (
                <Card 
                  key={v.id} 
                  className={`cursor-pointer hover:border-primary transition-all ${selectedVerification?.id === v.id ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => {
                    setSelectedVerification(v);
                    const initialStatuses: any = {};
                    v.documents.forEach((d: any) => {
                      initialStatuses[d.id] = { status: d.status, reason: d.rejectionReason || '' };
                    });
                    setDocStatuses(initialStatuses);
                    setAdminNote('');
                  }}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{v.seller?.storeName || v.seller?.user?.name || 'Unknown'}</h4>
                      <p className="text-xs text-muted-foreground">{v.seller?.user?.email}</p>
                    </div>
                    <Badge variant="secondary" className={`${statusConfig[v.status]?.color} border-0`}>
                      {statusConfig[v.status]?.[locale === 'ar' ? 'labelAr' : 'labelEn']}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Verification Detail View */}
        <div className="md:col-span-2">
          {selectedVerification ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t(locale, 'تفاصيل الطلب', 'Application Details')}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(locale, 'مستوى المخاطر:', 'Risk Level:')} 
                    <Badge className="mr-2" variant={selectedVerification.riskLevel === 'HIGH' ? 'destructive' : 'secondary'}>
                      {selectedVerification.riskLevel}
                    </Badge>
                  </p>
                </div>
                <Badge variant="outline">{selectedVerification.documents.length} {t(locale, 'مستندات', 'Documents')}</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Documents List */}
                <div className="space-y-4">
                  <h3 className="font-semibold">{t(locale, 'المستندات المرفوعة', 'Uploaded Documents')}</h3>
                  {selectedVerification.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t(locale, 'لم يتم رفع مستندات بعد', 'No documents uploaded yet')}</p>
                  ) : (
                    selectedVerification.documents.map((doc: any) => (
                      <div key={doc.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/20">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-sm">{doc.type.replace(/_/g, ' ')}</p>
                            <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                              <ExternalLink className="h-3 w-3" />
                              {t(locale, 'عرض المستند (مشفّر)', 'View Document (Secure)')}
                            </a>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant={docStatuses[doc.id]?.status === 'APPROVED' ? 'default' : 'outline'}
                              onClick={() => setDocStatuses(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], status: 'APPROVED' } }))}
                              className={docStatuses[doc.id]?.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                            >
                              <CheckCircle className="h-4 w-4 ml-1" /> {t(locale, 'قبول', 'Approve')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={docStatuses[doc.id]?.status === 'REJECTED' ? 'destructive' : 'outline'}
                              onClick={() => setDocStatuses(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], status: 'REJECTED' } }))}
                            >
                              <XCircle className="h-4 w-4 ml-1" /> {t(locale, 'رفض', 'Reject')}
                            </Button>
                          </div>
                        </div>

                        {docStatuses[doc.id]?.status === 'REJECTED' && (
                          <Input 
                            placeholder={t(locale, 'سبب الرفض (سيظهر للتاجر)...', 'Rejection reason (visible to seller)...')} 
                            value={docStatuses[doc.id]?.reason || ''}
                            onChange={(e) => setDocStatuses(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], reason: e.target.value } }))}
                            className="mt-2 text-sm border-red-200"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">{t(locale, 'ملاحظات الإدارة (سجل التدقيق)', 'Admin Notes (Audit Trail)')}</h3>
                  <Textarea 
                    placeholder={t(locale, 'اكتب ملاحظة داخلية (لن يراها التاجر)...', 'Write an internal note (seller will not see this)...')}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    onClick={() => handleReview(selectedVerification.id, 'APPROVED')}
                  >
                    <CheckCircle className="h-4 w-4 ml-2" />
                    {t(locale, 'اعتماد التوثيق نهائياً', 'Finalize Approval')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 flex-1"
                    onClick={() => handleReview(selectedVerification.id, 'REQUIRES_RESUBMISSION')}
                  >
                    <AlertTriangle className="h-4 w-4 ml-2" />
                    {t(locale, 'طلب إعادة رفع', 'Request Resubmission')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleReview(selectedVerification.id, 'REJECTED')}
                  >
                    <XCircle className="h-4 w-4 ml-2" />
                    {t(locale, 'رفض نهائي', 'Final Rejection')}
                  </Button>
                </div>

              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border rounded-xl border-dashed">
              <ShieldCheck className="h-12 w-12 mb-4 opacity-20" />
              <p>{t(locale, 'اختر طلباً من القائمة لعرض التفاصيل', 'Select an application to view details')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
