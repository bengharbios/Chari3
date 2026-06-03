'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  Loader2, Check, X, Eye, RefreshCw, Clock, ArrowRight,
  FileText, AlertCircle, Calendar, DollarSign, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

const SLIP_STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  pending:  { ar: 'معلق', en: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  approved: { ar: 'مقبول', en: 'Approved', color: 'bg-green-500/10 text-green-600 border-green-200' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'bg-red-500/10 text-red-600 border-red-200' },
};

export default function BillingReceiptsPage() {
  const { isAdminAuthenticated, adminUser } = useAdminAuthStore();
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const [currency, setCurrency] = useState('DZD');

  const fmt = useCallback((n: number) => {
    return `${n.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} ${currency}`;
  }, [locale, currency]);

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Data states
  const [receipts, setReceipts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Detail review & image preview
  const [reviewReceipt, setReviewReceipt] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Fetch public currency setting
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings?.currency) {
          setCurrency(data.settings.currency);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      window.location.href = getAdminPath('login');
    }
  }, [isMounted, isAdminAuthenticated]);

  const fetchReceipts = useCallback(async () => {
    if (!isAdminAuthenticated) return;
    setIsLoading(true);
    try {
      const statusParam = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/billing/receipts${statusParam}`);
      const data = await res.json();
      if (data.success) {
        setReceipts(data.receipts || []);
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
      toast.error(t(locale, 'فشل تحميل إيصالات الدفع', 'Failed to load payment receipts'));
    } finally {
      setIsLoading(false);
    }
  }, [isAdminAuthenticated, statusFilter, locale]);

  useEffect(() => {
    if (isMounted) {
      fetchReceipts();
    }
  }, [isMounted, statusFilter, fetchReceipts]);

  const handleReviewReceipt = async (actionStatus: 'approved' | 'rejected') => {
    if (!reviewReceipt) return;
    if (actionStatus === 'rejected' && !adminNote.trim()) {
      toast.error(t(locale, 'الرجاء إدخال سبب الرفض في الملاحظات', 'Please enter a rejection reason in the notes'));
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/billing/receipts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: reviewReceipt.id,
          status: actionStatus,
          adminNote: adminNote,
          adminId: adminUser?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          actionStatus === 'approved'
            ? t(locale, 'تم قبول الإيصال وتغذية محفظة التاجر بنجاح 🎉', 'Approved and merchant wallet credited successfully 🎉')
            : t(locale, 'تم رفض الإيصال وإشعار التاجر بنجاح ❌', 'Slip rejected and merchant notified ❌')
        );
        setReviewReceipt(null);
        setAdminNote('');
        fetchReceipts();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشلت معالجة الإيصال', 'Failed to process slip'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted || !isAdminAuthenticated) return null;

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={getAdminPath('')}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-500" />
              {t(locale, 'مراجعة إيصالات الدفع اليدوي', 'Review Payment Slips')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t(locale, 'مراجعة حوالات CCP و BaridiMob المرفوعة من المتاجر لتصفية المديونيات أو تفعيل الباقات', 'Review bank and postal transfer slips uploaded by merchants to clear debts or activate subscription packages')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-40 text-xs rounded-xl font-bold bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="pending">{t(locale, 'الإيصالات المعلقة', 'Pending Slips')}</SelectItem>
              <SelectItem value="approved">{t(locale, 'الإيصالات المقبولة', 'Approved Slips')}</SelectItem>
              <SelectItem value="rejected">{t(locale, 'الإيصالات المرفوضة', 'Rejected Slips')}</SelectItem>
              <SelectItem value="ALL">{t(locale, 'جميع الإيصالات', 'All Slips')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold" asChild>
            <Link href={getAdminPath('billing/merchants')}>
              {t(locale, 'اشتراكات التجار', 'Merchants')}
            </Link>
          </Button>

          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={fetchReceipts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Review Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Slips table (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                {t(locale, 'إيصالات تسديد المديونية المستلمة', 'Payment Receipt Submissions')}
              </CardTitle>
              <CardDescription className="text-xs">
                {receipts.length} {t(locale, 'إيصال معروض حالياً', 'receipts listed')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="text-xs text-start ps-4">{t(locale, 'التاجر', 'Merchant')}</TableHead>
                        <TableHead className="text-xs text-start">{t(locale, 'صورة الوصل', 'Receipt Slip')}</TableHead>
                        <TableHead className="text-xs text-start">{t(locale, 'المبلغ', 'Amount')}</TableHead>
                        <TableHead className="text-xs text-start">{t(locale, 'ملاحظة التاجر', 'Merchant Note')}</TableHead>
                        <TableHead className="text-xs text-start">{t(locale, 'تاريخ الإرسال', 'Submitted At')}</TableHead>
                        <TableHead className="text-xs text-center pe-4">{t(locale, 'الإجراءات', 'Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm font-semibold">
                            {t(locale, 'لا توجد إيصالات دفع للمراجعة حالياً 🎉', 'No payment slips found for this filter 🎉')}
                          </TableCell>
                        </TableRow>
                      ) : receipts.map(rec => (
                        <TableRow key={rec.id} className={reviewReceipt?.id === rec.id ? 'bg-brand/5' : ''}>
                          {/* Merchant detail */}
                          <TableCell className="ps-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="text-xs bg-brand/10 text-brand font-bold">
                                  {rec.user?.name?.charAt(0) || 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-xs">
                                <p className="font-bold text-foreground">{rec.user?.name || '—'}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{rec.user?.email || '—'}</p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Image Thumbnail */}
                          <TableCell>
                            {rec.receiptImage ? (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(rec.receiptImage)}
                                className="w-12 h-10 rounded-lg border bg-muted/40 overflow-hidden hover:border-brand transition-colors flex items-center justify-center relative group"
                                title={t(locale, 'معاينة بالحجم الكامل', 'View full-size')}
                              >
                                <img src={rec.receiptImage} alt="slip thumbnail" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <ExternalLink className="h-3 w-3 text-white" />
                                </div>
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          {/* Amount */}
                          <TableCell className="text-xs font-bold font-mono text-brand">
                            {fmt(rec.amount)}
                          </TableCell>

                          {/* Merchant Note */}
                          <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate" title={rec.merchantNote}>
                            {rec.merchantNote || '—'}
                          </TableCell>

                          {/* Timestamp */}
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {new Date(rec.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>

                          {/* Action Buttons */}
                          <TableCell className="pe-4 text-center">
                            {rec.status === 'pending' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-3 text-xs rounded-lg gap-1 font-bold"
                                onClick={() => { setReviewReceipt(rec); setAdminNote(rec.adminNote || ''); }}
                              >
                                <Eye className="h-3.5 w-3.5 text-indigo-500" />
                                {t(locale, 'مراجعة الوصل', 'Review')}
                              </Button>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                rec.status === 'approved' 
                                  ? 'bg-green-500/10 text-green-600 border-green-200' 
                                  : 'bg-red-500/10 text-red-600 border-red-200'
                              }`}>
                                {t(locale, SLIP_STATUS_LABELS[rec.status]?.ar || rec.status, SLIP_STATUS_LABELS[rec.status]?.en || rec.status)}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Review Form (Right 1 col) */}
        <div className="lg:col-span-1">
          {reviewReceipt ? (
            <Card className="border-brand/40 bg-card shadow-md">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    {t(locale, 'تفاصيل مراجعة الإيصال يدوياً', 'Review payment details')}
                  </CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted" onClick={() => setReviewReceipt(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 border rounded-xl bg-muted/20">
                    <p className="text-muted-foreground mb-1">{t(locale, 'التاجر المودع', 'Depositing Merchant')}</p>
                    <p className="font-bold">{reviewReceipt.user?.name}</p>
                  </div>
                  <div className="p-3 border border-brand/20 rounded-xl bg-brand/5">
                    <p className="text-muted-foreground mb-1">{t(locale, 'المبلغ المصرّح به', 'Declared Amount')}</p>
                    <p className="font-black text-brand text-base font-mono">{fmt(reviewReceipt.amount)}</p>
                  </div>
                </div>

                {reviewReceipt.merchantNote && (
                  <div className="p-3 rounded-xl border bg-yellow-500/5 border-yellow-200 text-xs">
                    <p className="text-amber-700 font-bold mb-1">{t(locale, 'ملاحظة التاجر:', 'Merchant Note:')}</p>
                    <p className="text-muted-foreground leading-relaxed">{reviewReceipt.merchantNote}</p>
                  </div>
                )}

                {/* Slip Preview image block */}
                {reviewReceipt.receiptImage && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{t(locale, 'معاينة إيصال التحويل البنكي', 'Transfer Slip Image')}</Label>
                    <div 
                      className="rounded-xl border overflow-hidden bg-slate-900 aspect-video flex items-center justify-center cursor-zoom-in relative group"
                      onClick={() => setPreviewImage(reviewReceipt.receiptImage)}
                    >
                      <img src={reviewReceipt.receiptImage} alt="Receipt slip" className="max-h-48 object-contain" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                        <ExternalLink className="h-4 w-4" />
                        {t(locale, 'اضغط للتكبير', 'Click to zoom')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Note / Rejection Reason */}
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="adminNoteInput" className="text-xs font-bold">
                    {t(locale, 'ملاحظة الإدارة أو سبب الرفض *', 'Admin Response / Rejection Reason *')}
                  </Label>
                  <Textarea
                    id="adminNoteInput"
                    placeholder={t(locale, 'مثال: تم قبول الدفع بنجاح / أو: الصورة غير واضحة، يرجى إعادة الإرسال...', 'e.g. Approved / Transfer reference is blurred...')}
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    className="h-20 rounded-xl text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {t(locale, '* حقل إلزامي فقط في حالة رفض الإيصال', '* Required only if rejecting the receipt')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                  <Button variant="outline" className="rounded-xl flex-1 text-xs" disabled={isProcessing} onClick={() => setReviewReceipt(null)}>
                    {t(locale, 'إلغاء', 'Cancel')}
                  </Button>
                  <Button variant="destructive" className="gap-1 rounded-xl flex-1 text-xs" disabled={isProcessing} onClick={() => handleReviewReceipt('rejected')}>
                    <X className="h-3.5 w-3.5" />
                    {t(locale, 'رفض الوصل', 'Reject Slip')}
                  </Button>
                  <Button className="gap-1 rounded-xl flex-1 text-xs bg-green-600 hover:bg-green-700 text-white" disabled={isProcessing} onClick={() => handleReviewReceipt('approved')}>
                    <Check className="h-3.5 w-3.5" />
                    {t(locale, 'موافقة وتفعيل', 'Approve & Credit')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="py-24 flex flex-col items-center justify-center text-muted-foreground gap-3">
                <FileText className="h-16 w-16 text-muted-foreground/20" />
                <p className="text-sm font-bold text-center">
                  {t(locale, 'اختر إيصالاً من القائمة على اليسار لمراجعته، ومطابقته مع حسابات CCP، وتأكيده أو رفضه بنقرة واحدة.', 'Select a payment receipt from the left to review, reconcile it with your bank account, and approve or reject it.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* High-res Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-3xl w-full rounded-2xl overflow-hidden bg-card border-none" onClick={e => e.stopPropagation()}>
            <div className="p-3 border-b flex justify-between items-center bg-card">
              <span className="font-bold text-xs">{t(locale, 'معاينة الوصل بالحجم الكامل', 'Full-size Slip Preview')}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPreviewImage(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 bg-slate-900 flex justify-center items-center max-h-[80vh] overflow-y-auto">
              <img
                src={previewImage}
                alt="Receipt Full Preview"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="bg-card border-t p-3 flex justify-end">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold" onClick={() => setPreviewImage(null)}>
                {t(locale, 'إغلاق المعاينة', 'Close Preview')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
