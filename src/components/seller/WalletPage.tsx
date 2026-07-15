'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/useTranslation';
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
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const { user } = useAuthStore();
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const router = useRouter();

  useEffect(() => {
    if (user && ['staff', 'editor', 'viewer', 'support'].includes(user.role)) {
      toast.error(t('wallet.restrictedAccess'));
      router.push('/seller/dashboard');
    }
  }, [user, router]);
  
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
      toast.error(t('wallet.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMethod || !formAmount || !formAccountName || !formAccountNumber) {
      toast.error(t('wallet.fieldsRequired'));
      return;
    }

    const amt = Number(formAmount);
    if (amt < minAmount) {
      toast.error(t('wallet.minWithdrawalError', { minAmount }));
      return;
    }
    if (amt > availableBalance) {
      toast.error(t('wallet.insufficientBalance'));
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
        toast.success(t('wallet.submitSuccess'));
        setIsModalOpen(false);
        setFormAmount('');
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(t('wallet.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodInfo = (m: string) => {
    switch (m) {
      case 'ccp': return { icon: <CreditCard className="h-4 w-4" />, label: 'CCP' };
      case 'cib': return { icon: <CreditCard className="h-4 w-4" />, label: 'CIB' };
      case 'bank_transfer': return { icon: <Building2 className="h-4 w-4" />, label: t('wallet.bankTransfer') };
      case 'cash': return { icon: <Banknote className="h-4 w-4" />, label: t('wallet.cash') };
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
            {t('wallet.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('wallet.desc')}
          </p>
        </div>
        <Button 
          onClick={() => { setFormMethod(''); setIsModalOpen(true); }} 
          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
          disabled={availableBalance < minAmount}
        >
          <ArrowUpRight className="h-4 w-4" />
          {t('wallet.requestButton')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">{t('wallet.totalBalance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono">
              {walletBalance.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} <span className="text-lg font-bold">{currency}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('wallet.availableBalance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground font-mono">
              {availableBalance.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} <span className="text-base">{currency}</span>
            </div>
            {availableBalance < minAmount && (
              <p className="text-xs text-rose-500 mt-1 font-semibold">
                {t('wallet.minWithdrawalLabel', { minAmount, currency })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('wallet.pendingRequests')}</CardTitle>
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
            {t('wallet.historyTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-start">{t('wallet.colDate')}</TableHead>
                  <TableHead className="text-start">{t('wallet.colAmount')}</TableHead>
                  <TableHead className="text-start">{t('wallet.colMethod')}</TableHead>
                  <TableHead className="text-center">{t('wallet.colStatus')}</TableHead>
                  <TableHead className="text-start">{t('wallet.colNote')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('wallet.noHistory')}
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
                        {w.status === 'pending' ? <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10"><Clock className="h-3 w-3 me-1"/> {t('wallet.statusPending')}</Badge> :
                         w.status === 'paid' ? <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10"><CheckCircle2 className="h-3 w-3 me-1"/> {t('wallet.statusPaid')}</Badge> :
                         w.status === 'rejected' ? <Badge variant="outline" className="border-rose-500 text-rose-500 bg-rose-500/10"><XCircle className="h-3 w-3 me-1"/> {t('wallet.statusRejected')}</Badge> :
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
            <DialogTitle className="text-start">{t('wallet.dialogTitle')}</DialogTitle>
            <DialogDescription className="text-start">
              {t('wallet.dialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-start block">{t('wallet.dialogAmountLabel')}</Label>
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
                {t('wallet.dialogAvailableLabel', { availableBalance })}
              </p>
            </div>
            <div className="space-y-2 text-start block">
              <Label>{t('wallet.dialogMethodLabel')}</Label>
              <Select value={formMethod} onValueChange={setFormMethod} required>
                <SelectTrigger className="text-start w-full">
                  <SelectValue placeholder={t('wallet.dialogSelectMethodPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {methods.includes('ccp') && <SelectItem value="ccp">البريد الجزائري (CCP)</SelectItem>}
                  {methods.includes('cib') && <SelectItem value="cib">البطاقة الذهبية (CIB)</SelectItem>}
                  {methods.includes('bank_transfer') && <SelectItem value="bank_transfer">{t('wallet.bankTransfer')}</SelectItem>}
                  {methods.includes('cash') && <SelectItem value="cash">{t('wallet.cashPickup')}</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            
            {formMethod && (
              <>
                {formMethod === 'bank_transfer' && (
                  <div className="space-y-2">
                    <Label className="text-start block">{t('wallet.dialogBankNameLabel')}</Label>
                    <Input required value={formBankName} onChange={e => setFormBankName(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-start block">{t('wallet.dialogAccountNameLabel')}</Label>
                  <Input required value={formAccountName} onChange={e => setFormAccountName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-start block">{t('wallet.dialogAccountNumberLabel')}</Label>
                  <Input required value={formAccountNumber} onChange={e => setFormAccountNumber(e.target.value)} className="font-mono text-start" />
                </div>
              </>
            )}

            <DialogFooter className="pt-4 flex sm:justify-start">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('wallet.dialogCancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || !formMethod} className="bg-emerald-500 hover:bg-emerald-600">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
                {t('wallet.dialogConfirm')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
