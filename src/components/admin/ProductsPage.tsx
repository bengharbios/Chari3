'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Search, Package, Eye, Star, TrendingUp, TrendingDown, AlertTriangle,
  RefreshCw, MoreHorizontal, ShoppingBag, Archive, CheckCircle2,
  XCircle, Loader2, ImageOff, DollarSign, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';

function t(locale: Locale, ar: string, en: string) { return locale === 'ar' ? ar : en; }
function formatDZD(amount: number) { return new Intl.NumberFormat('ar-DZ').format(amount) + ' د.ج'; }

interface Product {
  id: string; name: string; nameEn: string; category: string; price: number;
  comparePrice?: number; stock: number; status: 'active' | 'draft' | 'out_of_stock';
  rating: number; soldCount: number; storeName: string; image?: string; createdAt: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'هاتف سامسونج A54', nameEn: 'Samsung A54', category: 'إلكترونيات', price: 85000, comparePrice: 95000, stock: 45, status: 'active', rating: 4.5, soldCount: 120, storeName: 'متجر التقنية', image: '', createdAt: '2025-01-10' },
  { id: '2', name: 'حقيبة يد نسائية فاخرة', nameEn: 'Luxury Handbag', category: 'أزياء', price: 12000, stock: 8, status: 'active', rating: 4.2, soldCount: 35, storeName: 'بوتيك الأناقة', image: '', createdAt: '2025-01-11' },
  { id: '3', name: 'لابتوب HP ProBook 250', nameEn: 'HP ProBook 250', category: 'إلكترونيات', price: 135000, stock: 0, status: 'out_of_stock', rating: 4.8, soldCount: 89, storeName: 'متجر التقنية', image: '', createdAt: '2025-01-12' },
  { id: '4', name: 'كريم مرطب طبيعي بالأرغان', nameEn: 'Natural Argan Cream', category: 'تجميل', price: 1800, comparePrice: 2200, stock: 200, status: 'active', rating: 4.9, soldCount: 500, storeName: 'متجر الطبيعة', image: '', createdAt: '2025-01-13' },
  { id: '5', name: 'دراجة هوائية جبلية', nameEn: 'Mountain Bike', category: 'رياضة', price: 65000, stock: 12, status: 'active', rating: 4.3, soldCount: 28, storeName: 'متجر الرياضة', image: '', createdAt: '2025-01-14' },
  { id: '6', name: 'طقم أواني مطبخ 12 قطعة', nameEn: '12pc Kitchen Set', category: 'منزل', price: 28000, stock: 5, status: 'active', rating: 4.1, soldCount: 42, storeName: 'متجر المنزل', image: '', createdAt: '2025-01-15' },
  { id: '7', name: 'سماعة بلوتوث لاسلكية', nameEn: 'Wireless Earbuds', category: 'إلكترونيات', price: 3500, stock: 0, status: 'out_of_stock', rating: 3.8, soldCount: 150, storeName: 'متجر التقنية', image: '', createdAt: '2025-01-16' },
  { id: '8', name: 'قميص قطني رجالي', nameEn: 'Cotton Men Shirt', category: 'أزياء', price: 2800, stock: 80, status: 'draft', rating: 0, soldCount: 0, storeName: 'بوتيك الأناقة', image: '', createdAt: '2025-01-17' },
  { id: '9', name: 'شاشة تلفزيون 55 بوصة 4K', nameEn: '55" 4K TV', category: 'إلكترونيات', price: 125000, comparePrice: 145000, stock: 7, status: 'active', rating: 4.6, soldCount: 63, storeName: 'متجر التقنية', image: '', createdAt: '2025-01-18' },
  { id: '10', name: 'صابون أرغان عضوي', nameEn: 'Organic Argan Soap', category: 'تجميل', price: 900, stock: 300, status: 'active', rating: 4.7, soldCount: 800, storeName: 'متجر الطبيعة', image: '', createdAt: '2025-01-19' },
];

const STATUS_CFG: Record<string, { lAr: string; lEn: string; c: string }> = {
  active: { lAr: 'نشط', lEn: 'Active', c: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  draft: { lAr: 'مسودة', lEn: 'Draft', c: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400' },
  out_of_stock: { lAr: 'نفذ', lEn: 'Out of Stock', c: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function ProductsPage() {
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = useMemo(() => ['all', ...new Set(MOCK_PRODUCTS.map(p => p.category))], []);

  const stats = useMemo(() => ({
    total: MOCK_PRODUCTS.length,
    active: MOCK_PRODUCTS.filter(p => p.status === 'active').length,
    draft: MOCK_PRODUCTS.filter(p => p.status === 'draft').length,
    outOfStock: MOCK_PRODUCTS.filter(p => p.status === 'out_of_stock').length,
  }), []);

  const filtered = useMemo(() => MOCK_PRODUCTS.filter(p => {
    const ms = !search || p.name.includes(search) || (p.nameEn && p.nameEn.toLowerCase().includes(search.toLowerCase()));
    const mc = categoryFilter === 'all' || p.category === categoryFilter;
    const mst = statusFilter === 'all' || p.status === statusFilter;
    return ms && mc && mst;
  }), [search, categoryFilter, statusFilter]);

  const statsCards = [
    { label: t(locale, 'إجمالي المنتجات', 'Total'), value: stats.total, color: 'text-[var(--navy)]', bg: 'bg-[var(--navy)]/10', icon: ShoppingBag },
    { label: t(locale, 'نشط', 'Active'), value: stats.active, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', icon: CheckCircle2 },
    { label: t(locale, 'مسودة', 'Draft'), value: stats.draft, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800/20', icon: Package },
    { label: t(locale, 'نفذ المخزون', 'Out of Stock'), value: stats.outOfStock, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{t(locale, 'إدارة المنتجات', 'Products Management')}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{t(locale, 'متابعة وإدارة جميع منتجات المنصة', 'Track and manage all platform products')}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info(t(locale, 'تحديث البيانات', 'Refreshing...'))}>
          <RefreshCw className="h-4 w-4" /> {t(locale, 'تحديث', 'Refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map(s => {
          const Icon = s.icon;
          return <Card key={s.label} className="p-4"><div className="flex items-center gap-3"><div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', s.bg)}><Icon className={cn('h-5 w-5', s.color)} /></div><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-[var(--muted-foreground)]">{s.label}</p></div></div></Card>;
        })}
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder={t(locale, 'بحث بالاسم...', 'Search by name...')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder={t(locale, 'التصنيف', 'Category')} /></SelectTrigger>
            <SelectContent dir={dir}>
              {categories.map(c => <SelectItem key={c} value={c}>{c === 'all' ? t(locale, 'الكل', 'All') : c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder={t(locale, 'الحالة', 'Status')} /></SelectTrigger>
            <SelectContent dir={dir}>
              <SelectItem value="all">{t(locale, 'الكل', 'All')}</SelectItem>
              <SelectItem value="active">{t(locale, 'نشط', 'Active')}</SelectItem>
              <SelectItem value="draft">{t(locale, 'مسودة', 'Draft')}</SelectItem>
              <SelectItem value="out_of_stock">{t(locale, 'نفذ', 'Out of Stock')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] border-b">
              <tr>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'المنتج', 'Product')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)] hidden sm:table-cell">{t(locale, 'التصنيف', 'Category')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'السعر', 'Price')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)] hidden md:table-cell">{t(locale, 'المخزون', 'Stock')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)] hidden md:table-cell">{t(locale, 'المبيعات', 'Sold')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'الحالة', 'Status')}</th>
                <th className="text-start p-3 font-medium text-[var(--muted-foreground)]">{t(locale, 'إجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(p => {
                const sc = STATUS_CFG[p.status];
                return (
                  <tr key={p.id} className="hover:bg-[var(--surface)]/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[var(--surface)] flex items-center justify-center shrink-0">
                          {p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <ImageOff className="h-4 w-4 text-[var(--muted-foreground)]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.name}</p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">{p.storeName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell"><Badge variant="outline">{p.category}</Badge></td>
                    <td className="p-3">
                      <p className="font-semibold">{formatDZD(p.price)}</p>
                      {p.comparePrice && <p className="text-xs text-[var(--muted-foreground)] line-through">{formatDZD(p.comparePrice)}</p>}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className={cn('font-medium', p.stock === 0 ? 'text-red-600' : p.stock < 10 ? 'text-amber-600' : 'text-foreground')}>{p.stock}</span>
                    </td>
                    <td className="p-3 hidden md:table-cell"><span className="text-[var(--muted-foreground)]">{p.soldCount}</span></td>
                    <td className="p-3"><Badge variant="secondary" className={cn('text-[10px] px-2 py-0.5', sc.c)}>{locale === 'ar' ? sc.lAr : sc.lEn}</Badge></td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedProduct(p)}><Eye className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center"><Package className="h-12 w-12 mx-auto mb-3 text-[var(--muted-foreground)]/30" /><p className="font-medium text-[var(--muted-foreground)]">{t(locale, 'لا توجد منتجات', 'No products')}</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={!!selectedProduct} onOpenChange={open => !open && setSelectedProduct(null)}>
        <SheetContent side={locale === 'ar' ? 'left' : 'right'} className="w-full sm:max-w-lg overflow-y-auto" dir={dir}>
          {selectedProduct && (
            <>
              <SheetHeader><SheetTitle>{t(locale, 'تفاصيل المنتج', 'Product Details')}</SheetTitle></SheetHeader>
              <div className="px-6 pb-6 space-y-5 mt-4">
                <div className="h-48 rounded-xl bg-[var(--surface)] flex items-center justify-center">
                  <ImageOff className="h-12 w-12 text-[var(--muted-foreground)]/30" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedProduct.name}</h3>
                  <div className="flex items-center gap-2 mt-1"><Badge variant="outline">{selectedProduct.category}</Badge><span className="text-sm text-[var(--muted-foreground)]">{selectedProduct.storeName}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">{formatDZD(selectedProduct.price)}</span>
                  {selectedProduct.comparePrice && <span className="text-lg line-through text-[var(--muted-foreground)]">{formatDZD(selectedProduct.comparePrice)}</span>}
                  {selectedProduct.comparePrice && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{Math.round((1 - selectedProduct.price / selectedProduct.comparePrice) * 100)}% {t(locale, 'خصم', 'off')}</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3 text-center bg-[var(--surface)]"><p className="text-lg font-bold">{selectedProduct.stock}</p><p className="text-[10px] text-[var(--muted-foreground)]">{t(locale, 'المخزون', 'Stock')}</p></Card>
                  <Card className="p-3 text-center bg-[var(--surface)]"><p className="text-lg font-bold">{selectedProduct.soldCount}</p><p className="text-[10px] text-[var(--muted-foreground)]">{t(locale, 'المبيعات', 'Sold')}</p></Card>
                  <Card className="p-3 text-center bg-[var(--surface)]"><div className="flex items-center justify-center gap-1"><Star className="h-4 w-4 text-amber-400 fill-amber-400" /><span className="text-lg font-bold">{selectedProduct.rating}</span></div><p className="text-[10px] text-[var(--muted-foreground)]">{t(locale, 'التقييم', 'Rating')}</p></Card>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gradient-navy text-white gap-2" onClick={() => toast.success(t(locale, 'تم تحديث المنتج', 'Product updated'))}><RefreshCw className="h-4 w-4" />{t(locale, 'تعديل', 'Edit')}</Button>
                  <Button variant="outline" className="gap-2" onClick={() => toast.info(t(locale, 'تم أرشفة المنتج', 'Product featured'))}><Star className="h-4 w-4" />{t(locale, 'أرشفة', 'Feature')}</Button>
                  <Button variant="outline" className="text-red-600 gap-2" onClick={() => toast.info(t(locale, 'تم أرشفة المنتج', 'Product archived'))}><Archive className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
