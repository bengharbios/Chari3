'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search, Plus, MoreHorizontal, Edit, Trash2, Tag, ArrowUpDown, Filter, Eye, Copy, SlidersHorizontal, Image as ImageIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const MOCK_PRODUCTS = [
  { id: 'P-1001', nameAr: 'سماعات بلوتوث برو', nameEn: 'Bluetooth Pro Earbuds', categoryAr: 'إلكترونيات', categoryEn: 'Electronics', price: 8500, stock: 124, status: 'active', variants: 3, sales: 342, image: 'bg-blue-500' },
  { id: 'P-1002', nameAr: 'ساعة ذكية مقاومة للماء', nameEn: 'Waterproof Smartwatch', categoryAr: 'إلكترونيات', categoryEn: 'Electronics', price: 12000, stock: 45, status: 'active', variants: 2, sales: 189, image: 'bg-emerald-500' },
  { id: 'P-1003', nameAr: 'حقيبة ظهر رياضية', nameEn: 'Sport Backpack', categoryAr: 'أزياء', categoryEn: 'Fashion', price: 4500, stock: 0, status: 'out_of_stock', variants: 4, sales: 512, image: 'bg-orange-500' },
  { id: 'P-1004', nameAr: 'مصباح مكتب ليد ذكي', nameEn: 'Smart LED Desk Lamp', categoryAr: 'المنزل', categoryEn: 'Home', price: 3200, stock: 8, status: 'low_stock', variants: 1, sales: 76, image: 'bg-yellow-500' },
  { id: 'P-1005', nameAr: 'حذاء رياضي مريح', nameEn: 'Comfort Running Shoes', categoryAr: 'أزياء', categoryEn: 'Fashion', price: 6800, stock: 210, status: 'active', variants: 6, sales: 890, image: 'bg-purple-500' },
  { id: 'P-1006', nameAr: 'كاميرا أمان واي فاي', nameEn: 'WiFi Security Camera', categoryAr: 'إلكترونيات', categoryEn: 'Electronics', price: 9900, stock: 32, status: 'draft', variants: 1, sales: 0, image: 'bg-slate-500' },
];

export default function StoreProductsPage() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'out_of_stock'>('all');

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesSearch = p.nameAr.includes(searchTerm) || p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm);
    const matchesTab = activeTab === 'all' || p.status === activeTab || (activeTab === 'out_of_stock' && p.stock === 0);
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">{t('نفذ الكمية', 'Out of Stock')}</Badge>;
    if (status === 'draft') return <Badge className="bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20">{t('مسودة', 'Draft')}</Badge>;
    if (stock < 10) return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">{t('مخزون منخفض', 'Low Stock')}</Badge>;
    return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">{t('نشط', 'Active')}</Badge>;
  };

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6 text-start"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('إدارة المنتجات المتطورة', 'Advanced Product Management')}
          description={t('كتالوج المتجر، إدارة المخزون، السيو (SEO)، والمتغيرات.', 'Store catalog, inventory management, SEO, and variants.')}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl font-bold bg-background/50 backdrop-blur-md">
            <Copy className="h-4 w-4 me-2" />
            {t('استيراد / تصدير', 'Import / Export')}
          </Button>
          <Button className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Plus className="h-4 w-4 me-2" />
            {t('منتج جديد', 'New Product')}
          </Button>
        </div>
      </motion.div>

      {/* KPI mini-cards */}
      <motion.div variants={FADE_UP} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('المنتجات النشطة', 'Active Products'), value: '342', color: 'text-emerald-500' },
          { label: t('نفذت الكمية', 'Out of Stock'), value: '12', color: 'text-red-500' },
          { label: t('إجمالي المخزون', 'Total Inventory'), value: '8,430', color: 'text-blue-500' },
          { label: t('إجمالي المتغيرات', 'Total Variants'), value: '1,204', color: 'text-purple-500' },
        ].map((kpi, idx) => (
          <Card key={idx} className="border-white/10 bg-background/60 backdrop-blur-xl shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Table Card */}
      <motion.div variants={FADE_UP}>
        <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
              {[
                { id: 'all', label: t('الكل', 'All') },
                { id: 'active', label: t('النشطة', 'Active') },
                { id: 'draft', label: t('المسودات', 'Drafts') },
                { id: 'out_of_stock', label: t('نافذة الكمية', 'Out of Stock') },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input 
                  placeholder={t('ابحث بالاسم أو الرمز (SKU)...', 'Search by name or SKU...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`rounded-xl bg-background/50 border-white/10 focus-visible:ring-primary ${isAr ? 'pr-9' : 'pl-9'}`}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-[300px]">{t('المنتج', 'Product')}</TableHead>
                  <TableHead>{t('التصنيف', 'Category')}</TableHead>
                  <TableHead className="text-center">{t('السعر', 'Price')}</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-primary transition-colors">
                      {t('المخزون', 'Inventory')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">{t('الحالة', 'Status')}</TableHead>
                  <TableHead className="text-end">{t('الإجراءات', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        {t('لم يتم العثور على منتجات.', 'No products found.')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <motion.tr 
                        key={product.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-12 w-12 rounded-xl ${product.image} flex items-center justify-center shrink-0 shadow-inner`}>
                              <ImageIcon className="h-5 w-5 text-white/50" />
                            </div>
                            <div>
                              <p className="font-bold text-sm max-w-[200px] truncate">{isAr ? product.nameAr : product.nameEn}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-muted-foreground font-mono">{product.id}</span>
                                {product.variants > 1 && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                                    <SlidersHorizontal className="h-3 w-3" />
                                    {product.variants} {t('متغيرات', 'Variants')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-background/50 border-white/10 font-medium">
                            <Tag className="h-3 w-3 me-1 text-muted-foreground" />
                            {isAr ? product.categoryAr : product.categoryEn}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {product.price.toLocaleString()} {t('د.ج', 'DZD')}
                        </TableCell>
                        <TableCell className="text-center font-mono font-medium">
                          {product.stock}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(product.status, product.stock)}
                        </TableCell>
                        <TableCell className="text-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isAr ? "start" : "end"} className="w-48 rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                              <DropdownMenuLabel>{t('إدارة المنتج', 'Manage Product')}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="h-4 w-4 me-2" />
                                {t('تعديل البيانات', 'Edit Details')}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="h-4 w-4 me-2" />
                                {t('معاينة في المتجر', 'View on Store')}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <SlidersHorizontal className="h-4 w-4 me-2" />
                                {t('تعديل المتغيرات (Variants)', 'Edit Variants')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                                <Trash2 className="h-4 w-4 me-2" />
                                {t('حذف المنتج', 'Delete Product')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
            <p>{t('عرض', 'Showing')} <strong className="text-foreground">{filteredProducts.length}</strong> {t('من أصل', 'out of')} <strong className="text-foreground">{MOCK_PRODUCTS.length}</strong> {t('منتج', 'products')}</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled>{t('السابق', 'Prev')}</Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled>{t('التالي', 'Next')}</Button>
            </div>
          </div>
        </Card>
      </motion.div>

    </motion.div>
  );
}
