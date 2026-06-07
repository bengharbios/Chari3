'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  Loader2, RefreshCw, Wallet, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function WalletsPage() {
  const { isAdminAuthenticated } = useAdminAuthStore();
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
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
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

  const fetchWallets = useCallback(async () => {
    if (!isAdminAuthenticated) return;
    setIsLoading(true);
    try {
      let allUsers: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      
      while (currentPage <= totalPages) {
        const res = await fetch(`/api/admin/users?pageSize=50&page=${currentPage}`);
        const data = await res.json();
        if (data.success) {
          allUsers = [...allUsers, ...(data.users || [])];
          totalPages = data.pagination?.totalPages || 1;
          currentPage++;
        } else {
          break;
        }
      }
      
      setAdminUsers(allUsers);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      toast.error(t(locale, 'فشل تحميل بيانات المحافظ', 'Failed to load wallets data'));
    } finally {
      setIsLoading(false);
    }
  }, [isAdminAuthenticated, locale]);

  useEffect(() => {
    if (isMounted) {
      fetchWallets();
    }
  }, [isMounted, fetchWallets]);

  if (!isMounted || !isAdminAuthenticated) return null;

  const merchants = adminUsers.filter(u => u.role === 'seller' || u.role === 'store_manager');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const totalCount = merchants.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const paginatedMerchants = merchants.slice((page - 1) * limit, page * limit);

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center gap-4 mb-6">
        <Link href={getAdminPath('')}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-500" />
            {t(locale, 'المحافظ والمديونيات', 'Wallets & Debts')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(locale, 'متابعة أرصدة التجار وعمولات المبيعات المستحقة بشكل مفصل', 'Track merchant balances and outstanding sales commissions in detail')}
          </p>
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-brand" />
              {t(locale, 'أرصدة التجار الحالية', 'Current Merchant Balances')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t(locale, `تم العثور على ${totalCount} متجراً`, `${totalCount} stores found`)}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-xl gap-1" onClick={fetchWallets}>
            <RefreshCw className="h-3.5 w-3.5" />
            {t(locale, 'تحديث البيانات', 'Refresh')}
          </Button>
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
                    <TableHead className="text-start ps-4 text-xs">{t(locale, 'التاجر / المتجر', 'Merchant / Store')}</TableHead>
                    <TableHead className="text-start text-xs">{t(locale, 'الرصيد المتاح', 'Available Balance')}</TableHead>
                    <TableHead className="text-start text-xs">{t(locale, 'المديونية (عمولات)', 'Debt (Commissions)')}</TableHead>
                    <TableHead className="text-start text-xs">{t(locale, 'إجمالي المبيعات', 'Total Sales')}</TableHead>
                    <TableHead className="text-start text-xs pe-4">{t(locale, 'إجراءات', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMerchants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16 text-muted-foreground text-sm font-bold">
                        {t(locale, 'لا يوجد تجار', 'No merchants found')}
                      </TableCell>
                    </TableRow>
                  ) : paginatedMerchants.map((userObj: any) => {
                    const wallet = userObj.wallet || { balance: 0, debt: 0, totalSales: 0 };
                    return (
                      <TableRow key={userObj.id} className="hover:bg-muted/5">
                        <TableCell className="ps-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs bg-brand/10 text-brand font-bold">
                                {userObj.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                              <p className="font-bold text-foreground">
                                {userObj.role === 'store_manager' && userObj.store?.name 
                                  ? userObj.store.name 
                                  : userObj.role === 'seller' && userObj.sellerProfile?.storeName 
                                  ? userObj.sellerProfile.storeName 
                                  : userObj.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono leading-tight">{userObj.email}</p>
                              <p className="text-[9px] text-muted-foreground/60 uppercase">{userObj.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-bold font-mono px-2 py-1 rounded-md ${wallet.balance > 0 ? 'bg-green-500/10 text-green-600' : 'text-muted-foreground'}`}>
                            {fmt(wallet.balance || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-bold font-mono px-2 py-1 rounded-md ${wallet.debt > 0 ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'text-muted-foreground'}`}>
                            {fmt(wallet.debt || 0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {fmt(wallet.totalEarned || 0)}
                        </TableCell>
                        <TableCell className="pe-4">
                          <Button size="sm" variant="outline" className="h-7 px-3 text-xs rounded-lg text-muted-foreground hover:text-foreground">
                            {t(locale, 'تصفية المديونية', 'Clear Debt')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination controls */}
      <div className="flex items-center justify-between pt-2 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground">
            {t(locale, `الصفحة ${page} من ${totalPages}`, `Page ${page} of ${totalPages}`)}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t(locale, 'الصفوف:', 'Rows:')}</span>
            <select
              value={String(limit)}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="h-8 text-xs rounded-lg font-bold w-[70px] border px-2 bg-background text-foreground"
            >
              {[5, 10, 25, 50, 100].map(size => (
                <option key={size} value={String(size)}>{size}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <span className={`font-bold ${locale === 'ar' ? '' : 'rotate-180'}`}>&gt;</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <span className={`font-bold ${locale === 'ar' ? '' : 'rotate-180'}`}>&lt;</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
