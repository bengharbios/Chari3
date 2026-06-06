'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Receipt, Loader2, ArrowUpRight, Clock, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function DebtsPage() {
  const { user } = useAuthStore();
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [isLoading, setIsLoading] = useState(true);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [debtAmount, setDebtAmount] = useState(0);
  const [currency, setCurrency] = useState('DZD');
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      
      // We will need a new API /api/seller/debts to fetch receipts and debt
      const res = await fetch(`/api/seller/debts?sellerId=${user.id}`);
      const data = await res.json();
      
      if (data.success) {
        setReceipts(data.receipts);
        setDebtAmount(data.debtAmount);
        setCurrency(data.currency || 'DZD');
      }
    } catch (err) {
      toast.error(t(locale, 'فشل جلب البيانات', 'Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [user, locale]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !receiptFile) {
      toast.error(t(locale, 'يرجى إدخال المبلغ وإرفاق صورة الإيصال', 'Please enter amount and attach receipt'));
      return;
    }

    const amt = Number(formAmount);
    if (amt <= 0) {
      toast.error(t(locale, 'المبلغ يجب أن يكون أكبر من الصفر', 'Amount must be greater than zero'));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('sellerId', user!.id);
      formData.append('amount', String(amt));
      formData.append('note', formNote);
      formData.append('receipt', receiptFile);

      const res = await fetch('/api/seller/debts', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(t(locale, 'تم رفع الإيصال بنجاح. قيد المراجعة.', 'Receipt uploaded successfully. Pending review.'));
        setIsModalOpen(false);
        setFormAmount('');
        setFormNote('');
        setReceiptFile(null);
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(t(locale, 'حدث خطأ أثناء رفع الإيصال', 'Error uploading receipt'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start font-cairo">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-foreground">
            <Receipt className="h-6 w-6 text-rose-500" />
            {t(locale, 'سداد المديونية', 'Pay Debts')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(locale, 'ارفع إيصالات الدفع لتسديد عمولات المنصة المستحقة', 'Upload payment receipts to clear outstanding platform commissions')}
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl"
        >
          <ArrowUpRight className="h-4 w-4" />
          {t(locale, 'إرفاق إيصال سداد جديد', 'Upload Payment Receipt')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">{t(locale, 'إجمالي المديونية الحالية', 'Total Current Debt')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono">
              {debtAmount.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} <span className="text-lg font-bold">{currency}</span>
            </div>
            {debtAmount > 0 && (
              <p className="text-xs opacity-80 mt-1 font-semibold">
                {t(locale, 'يرجى تسديد المديونية لتجنب إيقاف الحساب', 'Please pay outstanding debts to avoid account suspension')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            {t(locale, 'سجل إيصالات السداد', 'Payment Receipts History')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-start">{t(locale, 'التاريخ', 'Date')}</TableHead>
                  <TableHead className="text-start">{t(locale, 'المبلغ', 'Amount')}</TableHead>
                  <TableHead className="text-center">{t(locale, 'الحالة', 'Status')}</TableHead>
                  <TableHead className="text-start">{t(locale, 'الإيصال', 'Receipt')}</TableHead>
                  <TableHead className="text-start">{t(locale, 'ملاحظة', 'Note')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t(locale, 'لا توجد إيصالات مسجلة', 'No payment receipts found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  receipts.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(r.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </TableCell>
                      <TableCell className="font-bold text-sm font-mono text-rose-500">
                        {r.amount.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} {currency}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.status === 'pending' ? <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10"><Clock className="h-3 w-3 me-1"/> {t(locale, 'قيد المراجعة', 'Pending')}</Badge> :
                         r.status === 'approved' ? <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10"><CheckCircle2 className="h-3 w-3 me-1"/> {t(locale, 'مقبول', 'Approved')}</Badge> :
                         r.status === 'rejected' ? <Badge variant="outline" className="border-rose-500 text-rose-500 bg-rose-500/10"><XCircle className="h-3 w-3 me-1"/> {t(locale, 'مرفوض', 'Rejected')}</Badge> :
                         <Badge variant="secondary">{r.status}</Badge>}
                      </TableCell>
                      <TableCell>
                        {r.receiptImage ? (
                          <a href={r.receiptImage} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-brand hover:underline">
                            <FileText className="h-3 w-3" /> {t(locale, 'عرض', 'View')}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {r.adminNote || r.merchantNote || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-start">{t(locale, 'إرفاق إيصال سداد جديد', 'Upload Payment Receipt')}</DialogTitle>
            <DialogDescription className="text-start">
              {t(locale, 'يرجى تحويل المبلغ إلى الحساب البنكي للمنصة وإرفاق صورة الإيصال ليتم مراجعتها.', 'Please transfer the amount to the platform bank account and upload the receipt image.')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-start block">{t(locale, 'المبلغ المودع', `Deposited Amount (${currency})`)}</Label>
              <Input
                type="number"
                min={1}
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                placeholder="10000"
                className="font-mono text-start"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-start block">{t(locale, 'صورة الإيصال (إلزامي)', 'Receipt Image (Required)')}</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setReceiptFile(e.target.files[0]);
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-start block">{t(locale, 'ملاحظة للإدارة (اختياري)', 'Note to Admin (Optional)')}</Label>
              <Input
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                placeholder={t(locale, 'رقم الحوالة، تاريخ الدفع...', 'Transfer number, payment date...')}
              />
            </div>

            <DialogFooter className="pt-4 flex sm:justify-start">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {t(locale, 'إلغاء', 'Cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-rose-500 hover:bg-rose-600">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
                {t(locale, 'إرسال الإيصال', 'Submit Receipt')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
