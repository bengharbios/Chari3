'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wallet, Loader2, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, CreditCard, Building2, Banknote, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function WalletPage() {
  const { user } = useAuthStore();
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [currency, setCurrency] = useState('DZD');
  
  // Settings from API
  const [minAmount, setMinAmount] = useState(5000);
  const [methods, setMethods] = useState<string[]>(['ccp']);
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMethod, setFormMethod] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formBankName, setFormBankName] = useState('');

  const availableBalance = walletBalance - totalPending;

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Fetch withdrawals and settings
      const wRes = await fetch(`/api/seller/withdrawals?sellerId=${user.id}`);
      const wData = await wRes.json();
      
      if (wData.success) {
        setWithdrawals(wData.withdrawals);
        setMinAmount(wData.settings.minAmount);
        setMethods(wData.settings.methods);
        
        // Calculate pending
        const pending = wData.withdrawals
          .filter((w: any) => w.status === 'pending')
          .reduce((sum: number, w: any) => sum + w.amount, 0);
        setTotalPending(pending);
      }

      // Fetch dashboard for wallet balance
      const dRes = await fetch(`/api/seller/dashboard?userId=${user.id}`);
      const dData = await dRes.json();
      if (dData.success) {
        setWalletBalance(dData.kpis.walletBalance);
        setCurrency(dData.currency || 'DZD');
      }
    } catch (err) {
      toast.error(tStr('فشل جلب البيانات', 'Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [user, locale]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMethod || !formAmount || !formAccountName || !formAccountNumber) {
      toast.error(tStr('يرجى ملء جميع الحقول المطلوبة', 'Please fill all required fields'));
      return;
    }

    const amt = Number(formAmount);
    if (amt < minAmount) {
      toast.error(tStr(`الحد الأدنى للسحب هو ${minAmount}`, `Minimum withdrawal is ${minAmount}`));
      return;
    }
    if (amt > availableBalance) {
      toast.error(tStr('الرصيد المتاح غير كافٍ', 'Insufficient available balance'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/seller/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user?.id,
          amount: amt,
          method: formMethod,
          accountName: formAccountName,
          accountNumber: formAccountNumber,
          bankName: formMethod === 'bank_transfer' ? formBankName : null,
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(tStr('تم إرسال طلب السحب بنجاح قيد المراجعة', 'Withdrawal request submitted successfully'));
        setIsModalOpen(false);
        setFormAmount('');
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(tStr('حدث خطأ أثناء إرسال الطلب', 'Error submitting request'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodInfo = (m: string) => {
    switch (m) {
      case 'ccp': return { icon: <CreditCard className="h-4 w-4" />, label: 'CCP' };
      case 'cib': return { icon: <CreditCard className="h-4 w-4" />, label: 'CIB' };
      case 'bank_transfer': return { icon: <Building2 className="h-4 w-4" />, label: tStr('تحويل بنكي', 'Bank Transfer') };
      case 'cash': return { icon: <Banknote className="h-4 w-4" />, label: tStr('نقداً', 'Cash') };
      default: return { icon: <HelpCircle className="h-4 w-4" />, label: m };
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
            <Wallet className="h-6 w-6 text-emerald-500" />
            {tStr('محفظتي وأرباحي', 'My Wallet & Earnings')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tStr('اسحب أرباحك وتابع رصيدك المتاح وسجل السحوبات', 'Withdraw earnings and track your available balance')}
          </p>
        </div>
        <Button 
          onClick={() => { setFormMethod(''); setIsModalOpen(true); }} 
          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
          disabled={availableBalance < minAmount}
        >
          <ArrowUpRight className="h-4 w-4" />
          {tStr('طلب سحب رصيد', 'Request Withdrawal')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">{tStr('الرصيد الإجمالي', 'Total Balance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono">
              {walletBalance.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} <span className="text-lg font-bold">{currency}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tStr('الرصيد المتاح للسحب', 'Available for Withdrawal')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground font-mono">
              {availableBalance.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} <span className="text-base">{currency}</span>
            </div>
            {availableBalance < minAmount && (
              <p className="text-xs text-rose-500 mt-1 font-semibold">
                {tStr(`الحد الأدنى للسحب هو ${minAmount} ${currency}`, `Minimum withdrawal is ${minAmount} ${currency}`)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tStr('طلبات قيد المعالجة', 'Pending Requests')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-500 font-mono">
              {totalPending.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} <span className="text-base">{currency}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            {tStr('سجل السحوبات', 'Withdrawal History')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-start">{tStr('التاريخ', 'Date')}</TableHead>
                  <TableHead className="text-start">{tStr('المبلغ', 'Amount')}</TableHead>
                  <TableHead className="text-start">{tStr('وسيلة السحب', 'Method')}</TableHead>
                  <TableHead className="text-center">{tStr('الحالة', 'Status')}</TableHead>
                  <TableHead className="text-start">{tStr('ملاحظة', 'Note')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {tStr('لا توجد طلبات سحب سابقة', 'No withdrawal history found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(w.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </TableCell>
                      <TableCell className="font-bold text-sm font-mono">
                        {w.amount.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} {currency}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {getMethodInfo(w.method).icon}
                          {getMethodInfo(w.method).label}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {w.status === 'pending' ? <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10"><Clock className="h-3 w-3 me-1"/> {tStr('قيد المراجعة', 'Pending')}</Badge> :
                         w.status === 'paid' ? <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10"><CheckCircle2 className="h-3 w-3 me-1"/> {tStr('تم الدفع', 'Paid')}</Badge> :
                         w.status === 'rejected' ? <Badge variant="outline" className="border-rose-500 text-rose-500 bg-rose-500/10"><XCircle className="h-3 w-3 me-1"/> {tStr('مرفوض', 'Rejected')}</Badge> :
                         <Badge variant="secondary">{w.status}</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {w.adminNote || '-'}
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
            <DialogTitle className="text-start">{tStr('طلب سحب رصيد', 'Request Withdrawal')}</DialogTitle>
            <DialogDescription className="text-start">
              {tStr('سيتم مراجعة طلبك من قبل الإدارة وإرسال المبلغ في أقرب وقت ممكن.', 'Your request will be reviewed by admin and transferred soon.')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-start block">{tStr('المبلغ المطلوب (د.ج)', 'Amount (DZD)')}</Label>
              <Input
                type="number"
                min={minAmount}
                max={availableBalance}
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                placeholder={String(minAmount)}
                className="font-mono text-start"
                required
              />
              <p className="text-[10px] text-muted-foreground text-start">
                {tStr(`المتاح: ${availableBalance} دج`, `Available: ${availableBalance} DZD`)}
              </p>
            </div>
            <div className="space-y-2 text-start block">
              <Label>{tStr('طريقة السحب', 'Withdrawal Method')}</Label>
              <Select value={formMethod} onValueChange={setFormMethod} required>
                <SelectTrigger className="text-start w-full">
                  <SelectValue placeholder={tStr('اختر الطريقة', 'Select Method')} />
                </SelectTrigger>
                <SelectContent>
                  {methods.includes('ccp') && <SelectItem value="ccp">البريد الجزائري (CCP)</SelectItem>}
                  {methods.includes('cib') && <SelectItem value="cib">البطاقة الذهبية (CIB)</SelectItem>}
                  {methods.includes('bank_transfer') && <SelectItem value="bank_transfer">{tStr('تحويل بنكي', 'Bank Transfer')}</SelectItem>}
                  {methods.includes('cash') && <SelectItem value="cash">{tStr('استلام نقدي', 'Cash Pickup')}</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            
            {formMethod && (
              <>
                {formMethod === 'bank_transfer' && (
                  <div className="space-y-2">
                    <Label className="text-start block">{tStr('اسم البنك', 'Bank Name')}</Label>
                    <Input required value={formBankName} onChange={e => setFormBankName(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-start block">{tStr('اسم صاحب الحساب', 'Account Holder Name')}</Label>
                  <Input required value={formAccountName} onChange={e => setFormAccountName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-start block">{tStr('رقم الحساب (RIP/RIB)', 'Account Number')}</Label>
                  <Input required value={formAccountNumber} onChange={e => setFormAccountNumber(e.target.value)} className="font-mono text-start" />
                </div>
              </>
            )}

            <DialogFooter className="pt-4 flex sm:justify-start">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {tStr('إلغاء', 'Cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || !formMethod} className="bg-emerald-500 hover:bg-emerald-600">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
                {tStr('تأكيد الطلب', 'Confirm Request')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
