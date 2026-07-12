'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { t } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Eye, EyeOff, FileText, Check, AlertTriangle, X, Download } from 'lucide-react';
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
  const isAr = locale === 'ar';
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Rejection modal states
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // Expanded document view states
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

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
          rejectionNote: customNote || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, `تمت المعالجة بنجاح`, `Processed successfully`));
        fetchRequests();
      } else {
        toast.error(data.error || `Failed to process request`);
      }
    } catch (error) {
      toast.error(`Error processing action`);
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

  const toggleExpand = (id: string) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
            {t(locale, 'مكتمل ومفعّل', 'Approved & Upgraded')}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none">
            {t(locale, 'مستندات مرفوضة', 'Docs Rejected')}
          </Badge>
        );
      case 'PAYMENT_SUBMITTED':
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-none animate-pulse">
            {t(locale, 'بانتظار تأكيد الدفع', 'Payment Submitted')}
          </Badge>
        );
      case 'AWAITING_PAYMENT':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none">
            {t(locale, 'بانتظار دفع التاجر', 'Awaiting Payout')}
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">
            {t(locale, 'بانتظار مراجعة المستندات', 'Pending Doc Review')}
          </Badge>
        );
    }
  };

  return (
    <>
      <Card className="card-surface mt-6" dir={isAr ? 'rtl' : 'ltr'}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">{t(locale, 'إدارة طلبات ترقيات المتاجر للشركات', 'Business Upgrade Queue')}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {t(locale, 'مراجعة أوراق السجلات التجارية، الحسابات البنكية وتأكيد فواتير الدفع.', 'Review commercial registers, bank letters, and confirm payments.')}
            </CardDescription>
          </div>
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
            <p className="text-muted-foreground text-sm text-center py-6">{t(locale, 'لا يوجد طلبات ترقية حالياً', 'No upgrade requests currently')}</p>
          ) : (
            <div className="space-y-4">
              {requests.map(req => {
                const isExpanded = expandedRequestId === req.id;
                return (
                  <div key={req.id} className="border rounded-xl overflow-hidden transition-all bg-card/40 hover:bg-card/75">
                    
                    {/* Header Summary Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3 bg-muted/20 border-b">
                      <div>
                        <h4 className="font-bold text-base text-foreground">{req.user?.name || req.user?.email || 'Unknown User'}</h4>
                        <p className="text-xs text-muted-foreground">{req.user?.email}</p>
                        <div className="flex flex-wrap gap-2 items-center mt-2">
                          {getStatusBadge(req.status)}
                          <Badge variant="outline" className="font-bold">{req.feeSnapshot} DZD</Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {new Date(req.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <Button variant="outline" size="sm" className="text-xs rounded-xl" onClick={() => toggleExpand(req.id)}>
                          {isExpanded ? <EyeOff className="w-3.5 h-3.5 mr-1 ml-1" /> : <Eye className="w-3.5 h-3.5 mr-1 ml-1" />}
                          {isExpanded ? t(locale, 'إخفاء المستندات', 'Hide Docs') : t(locale, 'معاينة المستندات', 'View Docs')}
                        </Button>

                        {/* PENDING -> Approve Docs / Reject */}
                        {req.status === 'PENDING' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleAction(req.id, 'approve')} 
                              disabled={actionLoading === req.id}
                              className="bg-brand text-navy hover:bg-brand/90 font-bold rounded-xl text-xs"
                            >
                              {actionLoading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : t(locale, 'موافقة وطلب السداد', 'Pre-Approve & Bill')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleRejectClick(req.id)} 
                              disabled={actionLoading === req.id}
                              className="rounded-xl text-xs"
                            >
                              {t(locale, 'رفض المستندات', 'Reject Documents')}
                            </Button>
                          </>
                        )}

                        {/* PAYMENT_SUBMITTED -> Confirm Payment / Reject Receipt */}
                        {req.status === 'PAYMENT_SUBMITTED' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleAction(req.id, 'approve')} 
                              disabled={actionLoading === req.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                            >
                              <Check className="w-3.5 h-3.5 mr-1 ml-1" />
                              {t(locale, 'تأكيد الدفع والترقية', 'Confirm Payment & Upgrade')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleRejectClick(req.id)} 
                              disabled={actionLoading === req.id}
                              className="rounded-xl text-xs"
                            >
                              <X className="w-3.5 h-3.5 mr-1 ml-1" />
                              {t(locale, 'رفض الوصل', 'Reject Receipt')}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="p-5 bg-card/25 border-t space-y-6 text-xs text-foreground">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Business Info and Documents */}
                          <div className="space-y-4">
                            <h5 className="font-bold text-sm text-brand border-b pb-1">{t(locale, 'المستندات القانونية المرفوعة', 'Submitted Corporate Files')}</h5>
                            <div className="space-y-3">
                              
                              <div>
                                <span className="text-muted-foreground block">{t(locale, 'رقم السجل التجاري (RC):', 'Commercial Register Number (RC):')}</span>
                                <span className="font-mono text-sm font-semibold">{req.businessRegisterNumber || t(locale, 'غير متوفر', 'N/A')}</span>
                                {req.businessRegisterFile && (
                                  <a href={req.businessRegisterFile} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand hover:underline mt-1">
                                    <FileText className="w-3.5 h-3.5" />
                                    {t(locale, 'تحميل ملف السجل التجاري', 'Download RC Document')}
                                  </a>
                                )}
                              </div>

                              <div>
                                <span className="text-muted-foreground block">{t(locale, 'الرقم الإحصائي الضريبي (NIS):', 'Statistical Tax Number (NIS):')}</span>
                                <span className="font-mono text-sm font-semibold">{req.businessNisNumber || t(locale, 'غير متوفر', 'N/A')}</span>
                              </div>

                              <div>
                                <span className="text-muted-foreground block">{t(locale, 'رقم IBAN البنكي واسم البنك:', 'IBAN & Bank Name:')}</span>
                                <span className="font-mono text-sm font-semibold">{req.businessBankName || 'N/A'} - {req.businessIban || 'N/A'}</span>
                                {req.businessBankLetterFile && (
                                  <a href={req.businessBankLetterFile} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand hover:underline mt-1">
                                    <FileText className="w-3.5 h-3.5" />
                                    {t(locale, 'تحميل الخطاب البنكي (RIB/IBAN)', 'Download Bank Letter Document')}
                                  </a>
                                )}
                              </div>

                            </div>
                          </div>

                          {/* Signatory and Identity */}
                          <div className="space-y-4">
                            <h5 className="font-bold text-sm text-brand border-b pb-1">{t(locale, 'هوية المدير والمسؤول المفوض', 'Manager Identity Documents')}</h5>
                            <div className="grid grid-cols-2 gap-4">
                              {req.businessManagerIdFront ? (
                                <div className="space-y-2">
                                  <span className="text-muted-foreground block">{t(locale, 'وجه بطاقة الهوية:', 'ID Card Front:')}</span>
                                  <a href={req.businessManagerIdFront} target="_blank" rel="noreferrer" className="block relative border rounded-xl overflow-hidden bg-muted aspect-video group">
                                    <img src={req.businessManagerIdFront} alt="ID Front" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                  </a>
                                </div>
                              ) : (
                                <div className="text-muted-foreground italic">{t(locale, 'لم يرفع الوجه الأمامي', 'Front face missing')}</div>
                              )}

                              {req.businessManagerIdBack ? (
                                <div className="space-y-2">
                                  <span className="text-muted-foreground block">{t(locale, 'ظهر بطاقة الهوية:', 'ID Card Back:')}</span>
                                  <a href={req.businessManagerIdBack} target="_blank" rel="noreferrer" className="block relative border rounded-xl overflow-hidden bg-muted aspect-video group">
                                    <img src={req.businessManagerIdBack} alt="ID Back" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                  </a>
                                </div>
                              ) : (
                                <div className="text-muted-foreground italic">{t(locale, 'لم يرفع الوجه الخلفي', 'Back face missing')}</div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Payment Verification Receipt section */}
                        {req.status === 'PAYMENT_SUBMITTED' && req.paymentReceiptFile && (
                          <div className="border-t pt-4 space-y-3 bg-brand/[0.01] p-3 rounded-xl border-dashed border-brand/20">
                            <h5 className="font-bold text-sm text-brand flex items-center gap-1">
                              <CreditCard className="w-4 h-4 text-brand" />
                              {t(locale, 'إثبات الدفع المرفق من التاجر', 'Payment Receipt Proof')}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="md:col-span-1">
                                <a href={req.paymentReceiptFile} target="_blank" rel="noreferrer" className="block relative border rounded-xl overflow-hidden bg-muted aspect-square group max-w-[120px]">
                                  {req.paymentReceiptFile.endsWith('.pdf') ? (
                                    <div className="flex flex-col items-center justify-center h-full text-red-500 font-bold p-2">
                                      <FileText className="w-10 h-10 mb-1" />
                                      PDF FILE
                                    </div>
                                  ) : (
                                    <img src={req.paymentReceiptFile} alt="Payment Receipt" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                  )}
                                </a>
                              </div>
                              <div className="md:col-span-3 space-y-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground block">{t(locale, 'رقم الفاتورة المقابلة:', 'Invoice ID Reference:')}</span>
                                  <span className="font-mono font-bold text-foreground">{req.invoiceId || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">{t(locale, 'ملاحظة التاجر على التحويل:', 'Merchant Payout Notes:')}</span>
                                  <p className="italic text-foreground">"{req.paymentReceiptNote || t(locale, 'لا توجد ملاحظة إضافية', 'No notes added')}"</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Audit Details */}
                        {(req.rejectionReason || req.paymentRejectionReason) && (
                          <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl text-red-700 dark:text-red-400">
                            <strong>{t(locale, 'سجل الرفض والملاحظات السابقة:', 'Rejection Notes history:')}</strong>
                            <p className="mt-1">{req.rejectionReason || req.paymentRejectionReason}</p>
                          </div>
                        )}
                        
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Note Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t(locale, 'تحديد سبب الرفض والتعليق', 'Reject Upgrade Action')}</DialogTitle>
            <DialogDescription>
              {t(locale, 'يرجى كتابة سبب الرفض بوضوح لمساعدته على التصحيح والمتابعة.', 'Provide a clear rejection message to help the merchant correct issues.')}
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
              {t(locale, 'تأكيد الرفض والإرسال', 'Confirm Rejection')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
