'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  Search, Store, Eye, Star, RefreshCw, ShoppingBag, CheckCircle2,
  XCircle, Clock, TrendingUp, Users, Package, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';

function t(locale: Locale, ar: string, en: string) { return locale === 'ar' ? ar : en; }
function formatDZD(amount: number) { return new Intl.NumberFormat('ar-DZ').format(amount) + ' د.ج'; }

interface Store {
  id: string; name: string; nameEn: string; managerName: string; category: string;
  productsCount: number; rating: number; revenue: number; status: 'active' | 'pending' | 'suspended';
  joinDate: string; description?: string; city: string;
}

const MOCK_STORES: Store[] = [
  { id: '1', name: 'متجر التقنية', nameEn: 'Tech Store', managerName: 'عبد الرحمن', category: 'إلكترونيات', productsCount: 156, rating: 4.7, revenue: 2500000, status: 'active', joinDate: '2024-06-15', description: 'أفضل متجر للإلكترونيات والهواتف', city: 'الجزائر العاصمة' },
  { id: '2', name: 'بوتيك الأناقة', nameEn: 'Fashion Boutique', managerName: 'ليلى بن عمر', category: 'أزياء', productsCount: 89, rating: 4.3, revenue: 890000, status: 'active', joinDate: '2024-08-20', description: 'أحدث صيحات الموضة', city: 'وهران' },
  { id: '3', name: 'متجر الطبيعة', nameEn: 'Nature Store', managerName: 'سميرة بلحاج', category: 'تجميل', productsCount: 65, rating: 4.9, revenue: 1200000, status: 'active', joinDate: '2024-09-10', description: 'منتجات طبيعية 100%', city: 'قسنطينة' },
  { id: '4', name: 'متجر الرياضة', nameEn: 'Sports Shop', managerName: 'كريم شريف', category: 'رياضة', productsCount: 42, rating: 4.1, revenue: 680000, status: 'active', joinDate: '2024-10-05', description: 'معدات رياضية احترافية', city: 'البليدة' },
  { id: '5', name: 'متجر المنزل', nameEn: 'Home Store', managerName: 'نادية بلقاسم', category: 'منزل', productsCount: 38, rating: 4.5, revenue: 520000, status: 'active', joinDate: '2024-11-01', description: 'كل ما يحتاجه منزلك', city: 'عنابة' },
  { id: '6', name: 'عالمتنقل الجزائري', nameEn: 'DZ Express', managerName: 'يوسف حمداني', category: 'شحن', productsCount: 0, rating: 3.8, revenue: 340000, status: 'pending', joinDate: '2025-01-10', description: 'خدمة شحن سريعة في الجزائر', city: 'سطيف' },
  { id: '7', name: 'متجر الهدايا', nameEn: 'Gift Shop', managerName: 'حنان بن ناصر', category: 'هدايا', productsCount: 15, rating: 0, revenue: 0, status: 'pending', joinDate: '2025-01-18', description: 'هدايا فريدة ومناسبات', city: 'المسيلة' },
  { id: '8', name: 'مكتبة المعرفة', nameEn: 'Knowledge Books', managerName: 'أحمد بن علي', category: 'كتب', productsCount: 220, rating: 4.6, revenue: 1800000, status: 'suspended', joinDate: '2024-05-01', description: 'كتب عربية وعالمية', city: 'تلمسان' },
];

const STATUS_CFG = {
  active: { lAr: 'نشط', lEn: 'Active', c: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  pending: { lAr: 'قيد المراجعة', lEn: 'Pending Review', c: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  suspended: { lAr: 'معلّق', lEn: 'Suspended', c: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function StoresPage() {
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const stats = useMemo(() => ({
    total: MOCK_STORES.length,
    active: MOCK_STORES.filter(s => s.status === 'active').length,
    pending: MOCK_STORES.filter(s => s.status === 'pending').length,
    suspended: MOCK_STORES.filter(s => s.status === 'suspended').length,
  }), []);

  const filtered = useMemo(() => MOCK_STORES.filter(s => {
    const ms = !search || s.name.includes(search) || s.managerName.includes(search) || s.city.includes(search);
    const mst = statusFilter === 'all' || s.status === statusFilter;
    return ms && mst;
  }), [search, statusFilter]);

  const cards = [
    { label: t(locale, 'إجمالي المتاجر', 'Total'), value: stats.total, color: 'text-[var(--navy)]', bg: 'bg-[var(--navy)]/10', icon: Store },
    { label: t(locale, 'نشط', 'Active'), value: stats.active, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', icon: CheckCircle2 },
    { label: t(locale, 'قيد المراجعة', 'Pending'), value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20', icon: Clock },
    { label: t(locale, 'معلّق', 'Suspended'), value: stats.suspended, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', icon: XCircle },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{t(locale, 'إدارة المتاجر', 'Stores Management')}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{t(locale, 'متابعة وإدارة متاجر المنصة', 'Track and manage platform stores')}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info(t(locale, 'تحديث', 'Refreshing...'))}><RefreshCw className="h-4 w-4" />{t(locale, 'تحديث', 'Refresh')}</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(s => { const Icon = s.icon; return <Card key={s.label} className="p-4"><div className="flex items-center gap-3"><div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', s.bg)}><Icon className={cn('h-5 w-5', s.color)} /></div><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-[var(--muted-foreground)]">{s.label}</p></div></div></Card>; })}
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder={t(locale, 'بحث بالاسم أو المدير أو المدينة...', 'Search...')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder={t(locale, 'الحالة', 'Status')} /></SelectTrigger>
            <SelectContent dir={dir}>
              <SelectItem value="all">{t(locale, 'الكل', 'All')}</SelectItem>
              <SelectItem value="active">{t(locale, 'نشط', 'Active')}</SelectItem>
              <SelectItem value="pending">{t(locale, 'قيد المراجعة', 'Pending')}</SelectItem>
              <SelectItem value="suspended">{t(locale, 'معلّق', 'Suspended')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] border-b"><tr>
              <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'المتجر', 'Store')}</th>
              <th className="text-start p-3 font-medium text-[var(--muted-foreground)] hidden md:table-cell">{t(locale, 'المدير', 'Manager')}</th>
              <th className="text-start p-3 font-medium text-[var(--muted-foreground)] hidden sm:table-cell">{t(locale, 'المنتجات', 'Products')}</th>
              <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'الإيرادات', 'Revenue')}</th>
              <th className="text-start p-3 font-medium text-[var(--muted-foreground)] hidden lg:table-cell">{t(locale, 'التقييم', 'Rating')}</th>
              <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'الحالة', 'Status')}</th>
              <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'إجراءات', 'Actions')}</th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(s => {
                const sc = STATUS_CFG[s.status];
                return (
                  <tr key={s.id} className="hover:bg-[var(--surface)]/50 transition-colors">
                    <td className="p-3"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg gradient-navy flex items-center justify-center text-white font-bold text-sm shrink-0">{s.name[0]}</div><div><p className="font-medium">{s.name}</p><p className="text-xs text-[var(--muted-foreground)]">{s.city}</p></div></div></td>
                    <td className="p-3 hidden md:table-cell"><p className="font-medium">{s.managerName}</p><Badge variant="outline">{s.category}</Badge></td>
                    <td className="p-3 hidden sm:table-cell"><span className="font-medium">{s.productsCount}</span></td>
                    <td className="p-3"><span className="font-semibold">{formatDZD(s.revenue)}</span></td>
                    <td className="p-3 hidden lg:table-cell"><div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /><span>{s.rating}</span></div></td>
                    <td className="p-3"><Badge variant="secondary" className={cn('text-[10px] px-2 py-0.5', sc.c)}>{locale === 'ar' ? sc.lAr : sc.lEn}</Badge></td>
                    <td className="p-3"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedStore(s)}><Eye className="h-4 w-4" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={!!selectedStore} onOpenChange={o => !o && setSelectedStore(null)}>
        <SheetContent side={locale === 'ar' ? 'left' : 'right'} className="w-full sm:max-w-lg overflow-y-auto" dir={dir}>
          {selectedStore && <>
            <SheetHeader><SheetTitle>{selectedStore.name}</SheetTitle></SheetHeader>
            <div className="px-6 pb-6 space-y-5 mt-4">
              <Badge className={cn('text-xs px-3 py-1 w-fit', STATUS_CFG[selectedStore.status].c)}>{locale === 'ar' ? STATUS_CFG[selectedStore.status].lAr : STATUS_CFG[selectedStore.status].lEn}</Badge>
              <p className="text-sm text-[var(--muted-foreground)]">{selectedStore.description}</p>
              <Card className="p-4 bg-[var(--surface)]">
                <h4 className="font-semibold text-sm mb-3">{t(locale, 'معلومات المتجر', 'Store Info')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{t(locale, 'المدير', 'Manager')}</span><span className="font-medium">{selectedStore.managerName}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{t(locale, 'التصنيف', 'Category')}</span><Badge variant="outline">{selectedStore.category}</Badge></div>
                  <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{t(locale, 'المدينة', 'City')}</span><span>{selectedStore.city}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{t(locale, 'تاريخ الانضمام', 'Joined')}</span><span>{selectedStore.joinDate}</span></div>
                </div>
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 text-center bg-[var(--surface)]"><p className="text-2xl font-bold">{formatDZD(selectedStore.revenue)}</p><p className="text-xs text-[var(--muted-foreground)]">{t(locale, 'إجمالي الإيرادات', 'Total Revenue')}</p></Card>
                <Card className="p-4 text-center bg-[var(--surface)]"><p className="text-2xl font-bold">{selectedStore.productsCount}</p><p className="text-xs text-[var(--muted-foreground)]">{t(locale, 'المنتجات', 'Products')}</p></Card>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gradient-navy text-white gap-2" onClick={() => toast.success(t(locale, 'تم قبول المتجر', 'Store approved'))}><CheckCircle2 className="h-4 w-4" />{t(locale, 'قبول', 'Approve')}</Button>
                <Button variant="outline" className="gap-2" onClick={() => toast.info(t(locale, 'تم تعليق المتجر', 'Store suspended'))}><XCircle className="h-4 w-4 text-red-500" />{t(locale, 'تعليق', 'Suspend')}</Button>
              </div>
            </div>
          </>}
        </SheetContent>
      </Sheet>
    </div>
  );
}
