'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  Loader2, Wallet, Search, CheckCircle2, XCircle, Clock, 
  ArrowRight, Eye, Building2, Banknote, CreditCard, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function AdminWithdrawalsPage() {
  const { isAdminAuthenticated, adminUser } = useAdminAuthStore();
  const { locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'paid' | 'rejected' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    if (!isAdminAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/withdrawals?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.withdrawals);
      }
    } catch (err) {
      toast.error(t(locale, 'فشل جلب الطلبات', 'Failed to fetch requests'));
    } finally {
      setIsLoading(false);
    }
  }, [isAdminAuthenticated, statusFilter, locale]);

  useEffect(() => {
    if (isMounted) {
      fetchWithdrawals();
    }
  }, [isMounted, fetchWithdrawals]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !actionType) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser?.id,
          status: actionType,
          adminNote
        })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(
          actionType === 'paid' 
            ? t(locale, 'تم تسجيل الدفع بنجاح', 'Payment recorded successfully') 
            : t(locale, 'تم رفض الطلب', 'Request rejected')
        );
        setSelectedRequest(null);
        setAdminNote('');
        fetchWithdrawals();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'حدث خطأ', 'An error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodInfo = (m: string) => {
    switch (m) {
      case 'ccp': return { icon: <CreditCard className="h-4 w-4" />, label: 'CCP' };
      case 'cib': return { icon: <CreditCard className="h-4 w-4" />, label: 'CIB' };
      case 'bank_transfer': return { icon: <Building2 className="h-4 w-4" />, label: t(locale, 'تحويل بنكي', 'Bank Transfer') };
      case 'cash': return { icon: <Banknote className="h-4 w-4" />, label: t(locale, 'نقداً', 'Cash') };
      default: return { icon: <Wallet className="h-4 w-4" />, label: m };
    }
  };

  const filteredRequests = requests.filter(req => {
    const q = searchQuery.toLowerCase();
    const name = req.seller?.user?.name?.toLowerCase() || '';
    const email = req.seller?.user?.email?.toLowerCase() || '';
    const phone = req.seller?.user?.phone?.toLowerCase() || '';
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  if (!isMounted || !isAdminAuthenticated) return null;

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start font-cairo">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/billing">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-foreground">
              <Wallet className="h-6 w-6 text-emerald-500" />
              {t(locale, 'طلبات سحب الأرباح', 'Payout Requests')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t(locale, 'إدارة طلبات السحب من التجار والموافقة عليها', 'Manage and approve merchant payout requests')}
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t(locale, 'بحث باسم التاجر أو البريد...', 'Search merchant name or email...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`h-9 rounded-xl ${locale === 'ar' ? 'pr-9' : 'pl-9'}`}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px] h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t(locale, 'كل الحالات', 'All Statuses')}</SelectItem>
                  <SelectItem value="pending">{t(locale, 'قيد المراجعة', 'Pending')}</SelectItem>
                  <SelectItem value="paid">{t(locale, 'تم الدفع', 'Paid')}</SelectItem>
                  <SelectItem value="rejected">{t(locale, 'مرفوض', 'Rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[400px]">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-start ps-4">{t(locale, 'التاجر', 'Merchant')}</TableHead>
                  <TableHead className="text-start">{t(locale, 'التاريخ', 'Date')}</TableHead>
                  <TableHead className="text-start">{t(locale, 'المبلغ المطلوب', 'Amount')}</TableHead>
                  <TableHead className="text-start">{t(locale, 'بيانات التحويل', 'Payout Details')}</TableHead>
                  <TableHead className="text-center">{t(locale, 'الحالة', 'Status')}</TableHead>
                  <TableHead className="text-center pe-4">{t(locale, 'إجراءات', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand" />
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                      {t(locale, 'لا توجد طلبات سحب', 'No payout requests found')}
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="ps-4">
                      <div className="font-bold text-sm">{req.seller?.user?.name || '-'}</div>
                      <div className="text-xs text-muted-foreground">{req.seller?.user?.email || '-'}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(req.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </TableCell>
                    <TableCell className="font-bold text-sm font-mono text-emerald-600">
                      {req.amount.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} DZD
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          {getMethodInfo(req.method).icon}
                          {getMethodInfo(req.method).label}
                        </div>
                        {req.bankName && <div className="text-muted-foreground">البنك: {req.bankName}</div>}
                        <div className="text-muted-foreground">الاسم: {req.accountName}</div>
                        <div className="font-mono text-muted-foreground">الحساب: {req.accountNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {req.status === 'pending' ? <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10 whitespace-nowrap"><Clock className="h-3 w-3 me-1"/> {t(locale, 'قيد المراجعة', 'Pending')}</Badge> :
                       req.status === 'paid' ? <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10 whitespace-nowrap"><CheckCircle2 className="h-3 w-3 me-1"/> {t(locale, 'تم الدفع', 'Paid')}</Badge> :
                       req.status === 'rejected' ? <Badge variant="outline" className="border-rose-500 text-rose-500 bg-rose-500/10 whitespace-nowrap"><XCircle className="h-3 w-3 me-1"/> {t(locale, 'مرفوض', 'Rejected')}</Badge> :
                       <Badge variant="secondary">{req.status}</Badge>}
                    </TableCell>
                    <TableCell className="text-center pe-4">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            size="sm" 
                            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs"
                            onClick={() => { setSelectedRequest(req); setActionType('paid'); setAdminNote(''); }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                            {t(locale, 'اعتماد كمدفوع', 'Mark Paid')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-rose-500 border-rose-200 hover:bg-rose-50 rounded-lg text-xs"
                            onClick={() => { setSelectedRequest(req); setActionType('rejected'); setAdminNote(''); }}
                          >
                            <XCircle className="h-3.5 w-3.5 me-1" />
                            {t(locale, 'رفض', 'Reject')}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 rounded-lg text-xs text-muted-foreground"
                          onClick={() => { setSelectedRequest(req); setActionType(null); setAdminNote(req.adminNote || ''); }}
                        >
                          <Eye className="h-3.5 w-3.5 me-1" />
                          {t(locale, 'التفاصيل', 'View')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={(o) => !o && setSelectedRequest(null)}>
        <DialogContent dir={dir} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-start flex items-center gap-2">
              {actionType === 'paid' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : 
               actionType === 'rejected' ? <XCircle className="h-5 w-5 text-rose-500" /> : 
               <Eye className="h-5 w-5 text-muted-foreground" />}
              {actionType === 'paid' ? t(locale, 'تأكيد الدفع والاقتطاع', 'Confirm Payment & Deduction') :
               actionType === 'rejected' ? t(locale, 'رفض طلب السحب', 'Reject Withdrawal Request') :
               t(locale, 'تفاصيل الطلب', 'Request Details')}
            </DialogTitle>
            <DialogDescription className="text-start">
              {actionType === 'paid' ? t(locale, 'تأكيد إرسال المبلغ للتاجر سيقوم بخصم القيمة من محفظته وتسجيل الحركة المالية نهائياً.', 'Confirming will deduct the amount from the merchant\'s wallet permanently.') :
               actionType === 'rejected' ? t(locale, 'يرجى كتابة سبب الرفض ليعلمه التاجر.', 'Please provide a reason for rejection.') :
               t(locale, 'هذا الطلب تمت معالجته مسبقاً ولا يمكن تعديله.', 'This request has already been processed.')}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 pt-4">
              <div className="bg-muted/30 p-3 rounded-xl space-y-2 text-sm border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(locale, 'المبلغ', 'Amount')}:</span>
                  <span className="font-bold font-mono">{selectedRequest.amount} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(locale, 'التاجر', 'Merchant')}:</span>
                  <span className="font-bold">{selectedRequest.seller?.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(locale, 'طريقة الدفع', 'Method')}:</span>
                  <span className="font-bold">{getMethodInfo(selectedRequest.method).label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(locale, 'رقم الحساب', 'Account')}:</span>
                  <span className="font-bold font-mono">{selectedRequest.accountNumber}</span>
                </div>
              </div>

              <form onSubmit={handleActionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-start block">
                    {actionType === 'paid' ? t(locale, 'ملاحظة الإيصال (اختياري)', 'Receipt Note (Optional)') :
                     actionType === 'rejected' ? t(locale, 'سبب الرفض (مطلوب)', 'Rejection Reason (Required)') :
                     t(locale, 'ملاحظة الإدارة', 'Admin Note')}
                  </Label>
                  <Input
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder={actionType === 'paid' ? 'مثال: تم التحويل برقم مرجع 12345' : ''}
                    disabled={!actionType}
                    required={actionType === 'rejected'}
                    className="h-10 rounded-xl"
                  />
                </div>

                <DialogFooter className="pt-2 flex sm:justify-start">
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setSelectedRequest(null)}>
                    {t(locale, actionType ? 'إلغاء' : 'إغلاق', actionType ? 'Cancel' : 'Close')}
                  </Button>
                  {actionType && (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || (actionType === 'rejected' && !adminNote)} 
                      className={`gap-2 rounded-xl font-bold text-white ${actionType === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {actionType === 'paid' ? t(locale, 'تأكيد وتم الدفع', 'Confirm Paid') : t(locale, 'تأكيد الرفض', 'Confirm Reject')}
                    </Button>
                  )}
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
