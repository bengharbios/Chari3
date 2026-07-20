'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { ShieldCheck, CheckCircle2, XCircle, Eye, Store, Tag, Package, AlertTriangle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock: number;
  images?: string;
  specifications?: string;
  status: string;
  createdAt: string;
  category?: { id: string; name: string; nameEn?: string };
  brand?: { id: string; name: string; nameEn?: string };
  store?: { id: string; name: string; logo?: string };
  seller?: { id: string; storeName?: string; user?: { name?: string; email?: string } };
}

export default function AdminProductApprovalsPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending_approval');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/products/approvals?status=${statusTab}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      toast.error('Failed to load products');
    }
    setIsLoading(false);
  }, [statusTab]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAction = async (productId: string, action: 'approve' | 'reject') => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/products/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          action,
          notes: action === 'reject' ? rejectionNotes : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(action === 'approve' ? 'تمت الموافقة على نشر المنتج ونشره حياً' : 'تم رفض المنتج وإرسال الملاحظات للبائع');
        setSelectedProduct(null);
        setRejectionNotes('');
        fetchProducts();
      } else {
        toast.error(data.error || 'فشلت العملية');
      }
    } catch (e) {
      toast.error(String(e));
    }
    setIsProcessing(false);
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.nameEn?.toLowerCase().includes(q) ||
      p.store?.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="size-6 text-amber-500" />
            مراجعة وقبول المنتجات (Approval Queue)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            فحص ومراجعة كافة المنتجات المرفوعة من التجار قبل تفعيلها ونشرها للمشترين
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setStatusTab('pending_approval')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${statusTab === 'pending_approval' ? 'bg-amber-500 text-slate-950 shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            ⏳ بانتظار الموافقة
          </button>
          <button
            onClick={() => setStatusTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${statusTab === 'active' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            ✅ المقبولة (نشطة)
          </button>
          <button
            onClick={() => setStatusTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${statusTab === 'all' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            🌐 جميع المنتجات
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برمز SKU، اسم المنتج، أو اسم المتجر..."
          className="w-full bg-background border border-border pl-3 pr-9 py-2 rounded-xl text-sm"
        />
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">جار تحميل قائمة المراجعة...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl">
          <Package className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="font-bold text-foreground">لا توجد منتجات في هذه القائمة حالياً</h3>
          <p className="text-xs text-muted-foreground mt-1">كافة المنتجات المرفوعة تمت مراجعتها ومتابعتها.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                <tr>
                  <th className="p-3.5">المنتج والصور</th>
                  <th className="p-3.5">المتجر / التاجر</th>
                  <th className="p-3.5">الفئة والماركة</th>
                  <th className="p-3.5">السعر والمخزون</th>
                  <th className="p-3.5">الحالة الحالية</th>
                  <th className="p-3.5 text-center">الإجراءات والسريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => {
                  let imgList: string[] = [];
                  try {
                    imgList = p.images ? JSON.parse(p.images) : [];
                  } catch (e) {
                    imgList = [];
                  }
                  const firstImg = imgList[0] || '/images/placeholder.jpg';

                  return (
                    <tr key={p.id} className="hover:bg-muted/20 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={firstImg} alt={p.name} className="size-12 rounded-xl object-cover border border-border bg-muted" />
                          <div>
                            <p className="font-bold text-foreground text-sm line-clamp-1">{p.name}</p>
                            {p.nameEn && <p className="text-[11px] text-muted-foreground dir-ltr text-right">{p.nameEn}</p>}
                            {p.sku && <span className="inline-block mt-0.5 text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">SKU: {p.sku}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <Store className="size-3.5 text-muted-foreground" />
                          <div>
                            <p className="font-bold text-foreground">{p.store?.name || p.seller?.storeName || 'متجر غير معرف'}</p>
                            <p className="text-[10px] text-muted-foreground">{p.seller?.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div>
                          <p className="font-bold text-foreground">{p.category?.name || 'بدون فئة'}</p>
                          {p.brand && <p className="text-[10px] text-amber-500 font-bold">🏷️ {p.brand.name}</p>}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div>
                          <p className="font-black text-foreground">{p.price} د.ج</p>
                          <p className="text-[10px] text-muted-foreground">المخزون: {p.stock} قطعة</p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {p.status === 'pending_approval' && (
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            ⏳ بانتظار الموافقة
                          </span>
                        )}
                        {p.status === 'active' && (
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            ✅ مقبول ونشط
                          </span>
                        )}
                        {p.status === 'draft' && (
                          <span className="bg-muted text-muted-foreground border border-border px-2.5 py-1 rounded-full text-[10px] font-bold">
                            📝 مسودة / يتطلب تعديل
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
                          >
                            <Eye className="size-3.5" />
                            معاينة وفحص
                          </button>
                          <button
                            onClick={() => handleAction(p.id, 'approve')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
                          >
                            قبول
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect & Review Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  فحص المنتج والموافقة
                </span>
                <h2 className="text-xl font-bold text-foreground mt-1">{selectedProduct.name}</h2>
                {selectedProduct.nameEn && <p className="text-xs text-muted-foreground dir-ltr text-right">{selectedProduct.nameEn}</p>}
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Images Preview */}
            {(() => {
              let imgs: string[] = [];
              try {
                imgs = selectedProduct.images ? JSON.parse(selectedProduct.images) : [];
              } catch (e) {
                imgs = [];
              }
              return (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground">صور المنتج المرفوعة ({imgs.length}):</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {imgs.map((img, i) => (
                      <img key={i} src={img} alt="Product" className="aspect-square rounded-xl object-cover border border-border bg-muted" />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-muted/20 p-4 rounded-2xl border border-border">
              <div>
                <span className="text-muted-foreground">المتجر التابع:</span>
                <p className="font-bold text-foreground">{selectedProduct.store?.name || 'غير معروف'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">الفئة الرئيسية:</span>
                <p className="font-bold text-foreground">{selectedProduct.category?.name || 'غير معروف'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">سعر البيع:</span>
                <p className="font-bold text-foreground">{selectedProduct.price} د.ج</p>
              </div>
              <div>
                <span className="text-muted-foreground">المخزون المتوفر:</span>
                <p className="font-bold text-foreground">{selectedProduct.stock} قطعة</p>
              </div>
            </div>

            {/* Rejection Notes Input */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-500" />
                ملاحظات الرفض / طلب التعديل (تصل للبائع في الإشعارات):
              </label>
              <textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="اكتب أسباب الرفض أو التعديلات المطلوبة (مثال: يرجى تحسين الصورة الرئيسية أو إضافة وصف دقيق)..."
                rows={2}
                className="w-full bg-background border border-border px-3 py-2 rounded-xl text-xs"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                إغلاق
              </button>
              <button
                disabled={isProcessing}
                onClick={() => handleAction(selectedProduct.id, 'reject')}
                className="flex items-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                <XCircle className="size-4" />
                رفض مع ملاحظات
              </button>
              <button
                disabled={isProcessing}
                onClick={() => handleAction(selectedProduct.id, 'approve')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" />
                قبول ونشر المنتج حياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
