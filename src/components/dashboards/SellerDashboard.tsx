'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, Package, Star, ShieldCheck, ArrowLeft, ArrowRight,
  Wallet, AlertTriangle, ChevronUp, BarChart3, Clock, CheckCircle,
  XCircle, Eye, Plus, Edit, Trash2, Trophy, Target, Zap, Wrench, Loader2
} from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useOnboardingStore } from '@/lib/store/onboarding';
import { useAppStore as appStore } from '@/lib/store';
import { toast } from 'sonner';

const DZD = (n: number) => `${n.toLocaleString('ar-DZ')} د.ج`;

const LEVEL_INFO: Record<number, { name: string; badge: string; color: string }> = {
  1: { name: 'صاعد', badge: '🌱', color: 'from-gray-500 to-gray-600' },
  2: { name: 'نشط', badge: '⭐', color: 'from-blue-500 to-blue-600' },
  3: { name: 'محترف', badge: '🌟', color: 'from-teal-500 to-teal-600' },
  4: { name: 'متميز', badge: '💫', color: 'from-purple-500 to-purple-600' },
  5: { name: 'خبير', badge: '🔥', color: 'from-orange-500 to-orange-600' },
  6: { name: 'نجم', badge: '💎', color: 'from-cyan-500 to-cyan-600' },
  7: { name: 'ستار', badge: '👑', color: 'from-yellow-500 to-amber-600' },
  8: { name: 'ليجند', badge: '🏆', color: 'from-rose-500 to-red-600' },
  9: { name: 'إمبراطور', badge: '🦅', color: 'from-indigo-500 to-violet-600' },
  10: { name: 'أسطورة', badge: '🌠', color: 'from-amber-400 to-yellow-500' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'جديد', color: 'bg-blue-100 text-blue-700', icon: Clock },
  processing: { label: 'قيد التجهيز', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  shipped:    { label: 'تم الشحن', color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
  delivered:  { label: 'مكتمل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled:  { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: XCircle },
};

interface DashboardData {
  seller: {
    storeName?: string;
    rating: number;
    level: number;
    completionRate: number;
    responseRate: number;
    totalSales: number;
    totalEarnings: number;
    package?: { name: string; commissionRate: number; maxProducts: number };
  };
  kpis: {
    monthRevenue: number;
    monthCommission: number;
    monthNetEarnings: number;
    monthOrderCount: number;
    totalSales: number;
    totalEarnings: number;
    rating: number;
    level: number;
    completionRate: number;
    responseRate: number;
    walletBalance: number;
  };
  products: { id: string; name: string; price: number; stock: number; status: string; soldCount: number; rating: number }[];
  recentOrders: { order: { orderNumber: string; status: string; total: number; createdAt: string }; product: { name: string; price: number }; quantity: number; total: number }[];
  reviews: { id: string; rating: number; comment?: string; sellerReply?: string; createdAt: string }[];
  challenges: { id: string; title: string; description?: string; type: string; targetValue: number; rewardValue: string; endsAt: string }[];
  sellerLevel?: { level: number; nameAr: string; maxProducts: number; commissionDiscount: number };
  nextLevel?: { level: number; nameAr: string; minCustomers: number; minRating: number; minCompletionRate: number };
  pendingWithdrawals: { id: string; amount: number; method: string; createdAt: string }[];
}

export default function SellerDashboard() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const { currentPage } = useAppStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const refreshData = () => {
    if (!user?.id) return;
    setIsLoading(true);
    fetch(`/api/seller/dashboard?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  // Show different sub-pages
  if (currentPage === 'seller-products') {
    if (showAddForm) {
      return (
        <ProductFormTab
          product={editingProduct}
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onSave={refreshData}
          storeId={user?.id || ''}
          sellerId={user?.id || ''}
          t={t}
          isAr={isAr}
        />
      );
    }
    return (
      <SellerProductsTab
        data={data}
        isLoading={isLoading}
        t={t}
        isAr={isAr}
        onAddClick={() => {
          setEditingProduct(null);
          setShowAddForm(true);
        }}
        onEditClick={(prod) => {
          setEditingProduct(prod);
          setShowAddForm(true);
        }}
        onDeleteSuccess={refreshData}
      />
    );
  }
  if (currentPage === 'seller-orders') return <SellerOrdersTab data={data} isLoading={isLoading} t={t} isAr={isAr} />;

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted" />)}
    </div>
  );

  const kpis = data?.kpis;
  const lvl = kpis?.level ?? 1;
  const lvlInfo = LEVEL_INFO[lvl] ?? LEVEL_INFO[1];
  const nextLevel = data?.nextLevel;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">{t('لوحة تحكم التاجر', 'Seller Dashboard')}</h1>
          <p className="text-muted-foreground text-sm">{data?.seller?.storeName || user?.name}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${lvlInfo.color} text-white`}>
          <span className="text-xl">{lvlInfo.badge}</span>
          <div>
            <p className="text-xs opacity-80">{t('المستوى', 'Level')} {lvl}</p>
            <p className="text-sm font-bold">{lvlInfo.name}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('أرباح الشهر', 'Month Earnings'), value: DZD(kpis?.monthNetEarnings ?? 0), icon: Wallet, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10' },
          { label: t('طلبات الشهر', 'Month Orders'), value: kpis?.monthOrderCount ?? 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: t('التقييم العام', 'Overall Rating'), value: `${(kpis?.rating ?? 0).toFixed(1)} ⭐`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
          { label: t('رصيد المحفظة', 'Wallet Balance'), value: DZD(kpis?.walletBalance ?? 0), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
        ].map((kpi) => (
          <Card key={kpi.label} className={kpi.bg}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="text-xl font-black">{kpi.value}</p>
                </div>
                <kpi.icon className={`size-5 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Level Progress */}
      {nextLevel && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-primary" />
                <span className="text-sm font-semibold">{t('تقدمك نحو المستوى', 'Progress to Level')} {nextLevel.level} — {nextLevel.nameAr}</span>
              </div>
              <Badge variant="outline" className="text-primary border-primary/30">{t('مستوى', 'Level')} {lvl} / 10</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { label: t('معدل الإكمال', 'Completion'), current: kpis?.completionRate ?? 0, target: nextLevel.minCompletionRate, unit: '%' },
                { label: t('التقييم', 'Rating'), current: kpis?.rating ?? 0, target: nextLevel.minRating, unit: '⭐' },
                { label: t('العملاء', 'Customers'), current: data?.seller?.totalSales ?? 0, target: nextLevel.minCustomers, unit: '' },
              ].map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.current.toFixed(m.unit === '%' ? 0 : 1)}{m.unit} / {m.target}{m.unit}</span>
                  </div>
                  <Progress value={Math.min(100, (m.current / (m.target || 1)) * 100)} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission info */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{t('الباقة الحالية', 'Current Package')}: <span className="text-primary">{data?.seller?.package?.name ?? t('مجاني', 'Free')}</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('نسبة العمولة', 'Commission rate')}: <strong>{data?.seller?.package?.commissionRate ?? 10}%</strong>
                {' · '}
                {t('حد المنتجات', 'Product limit')}: <strong>{data?.seller?.package?.maxProducts ?? 5}</strong>
                {' · '}
                {t('عمولة هذا الشهر', 'This month commission')}: <strong>{DZD(kpis?.monthCommission ?? 0)}</strong>
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0">{t('ترقية الباقة', 'Upgrade')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      {(data?.challenges?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Trophy className="size-5 text-amber-500" />{t('تحديات نشطة', 'Active Challenges')}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {data?.challenges?.map((c) => (
              <Card key={c.id} className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{c.title}</p>
                      {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                      <Badge className="mt-2 bg-amber-500/20 text-amber-700 border-0 text-xs">{t('المكافأة:', 'Reward:')} {c.rewardValue}</Badge>
                    </div>
                    <Zap className="size-5 text-amber-500 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance metrics */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('📊 مؤشرات الأداء', '📊 Performance Metrics')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: t('معدل إكمال الطلبات', 'Completion Rate'), value: kpis?.completionRate ?? 100, suffix: '%', good: 90 },
              { label: t('معدل نجاح التواصل', 'Response Rate'), value: kpis?.responseRate ?? 100, suffix: '%', good: 80 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className={`font-bold ${m.value >= m.good ? 'text-green-600' : 'text-orange-500'}`}>{m.value.toFixed(0)}{m.suffix}</span>
                </div>
                <Progress value={m.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent orders */}
      {(data?.recentOrders?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              {t('آخر الطلبات', 'Recent Orders')}
              <Button size="sm" variant="ghost" onClick={() => appStore.getState().setCurrentPage('seller-orders' as any)}>
                {t('عرض الكل', 'View All')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {data?.recentOrders?.slice(0, 5).map((item, i) => {
                const st = STATUS_CONFIG[item.order.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = st.icon;
                return (
                  <div key={i} className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">#{item.order.orderNumber} · {item.quantity} × {DZD(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${st.color}`}>
                        <StatusIcon className="size-3" />{st.label}
                      </span>
                      <span className="text-sm font-bold text-primary">{DZD(item.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent reviews */}
      {(data?.reviews?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t('أحدث التقييمات', 'Latest Reviews')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.reviews?.slice(0, 3).map((rev) => (
                <div key={rev.id} className="p-3 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`size-3 ${s < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  {rev.comment && <p className="text-sm text-muted-foreground">{rev.comment}</p>}
                  {rev.sellerReply && <p className="text-xs text-primary mt-1 ps-2 border-s-2 border-primary/30">{rev.sellerReply}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Products sub-page ──────────────────────────────────────────────────────────
function SellerProductsTab({
  data,
  isLoading,
  t,
  isAr,
  onAddClick,
  onEditClick,
  onDeleteSuccess,
}: {
  data: DashboardData | null;
  isLoading: boolean;
  t: (a: string, e: string) => string;
  isAr: boolean;
  onAddClick: () => void;
  onEditClick: (prod: any) => void;
  onDeleteSuccess: () => void;
}) {
  const STATUS_COLOR: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    inactive: 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  };

  const handleDelete = async (prodId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(isAr ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
        onDeleteSuccess();
      } else {
        toast.error(isAr ? 'فشل حذف المنتج' : 'Failed to delete product');
      }
    } catch {
      toast.error(isAr ? 'خطأ في الاتصال بالشبكة' : 'Network communication error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('إدارة المنتجات', 'Product Management')}</h1>
        <Button className="gap-2" onClick={onAddClick}><Plus className="size-4" />{t('إضافة منتج', 'Add Product')}</Button>
      </div>
      <Card>
        <CardContent className="pt-4">
          {isLoading ? <div className="h-48 animate-pulse bg-muted rounded-xl" /> : (
            <div className="divide-y divide-border">
              {(data?.products ?? []).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Package className="size-10 mx-auto mb-2 opacity-30" />
                  <p>{t('لا توجد منتجات بعد', 'No products yet')}</p>
                  <Button size="sm" className="mt-3" onClick={onAddClick}><Plus className="size-4 me-1" />{t('أضف أول منتج', 'Add first product')}</Button>
                </div>
              ) : (data?.products ?? []).map((p) => (
                <div key={p.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{`${p.price.toLocaleString()} د.ج · مخزون: ${p.stock} · مباع: ${p.soldCount}`}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? STATUS_COLOR.draft}`}>
                    {p.status === 'active' ? t('نشط', 'Active') : p.status === 'draft' ? t('مسودة', 'Draft') : t('غير نشط', 'Inactive')}
                  </span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => onEditClick(p)}><Edit className="size-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Orders sub-page ────────────────────────────────────────────────────────────
function SellerOrdersTab({ data, isLoading, t, isAr }: { data: DashboardData | null; isLoading: boolean; t: (a: string, e: string) => string; isAr: boolean }) {
  const DZD2 = (n: number) => `${n.toLocaleString('ar-DZ')} د.ج`;
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t('إدارة الطلبات', 'Orders Management')}</h1>
      <Card>
        <CardContent className="pt-4">
          {isLoading ? <div className="h-48 animate-pulse bg-muted rounded-xl" /> : (
            <div className="divide-y divide-border">
              {(data?.recentOrders ?? []).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Package className="size-10 mx-auto mb-2 opacity-30" />
                  <p>{t('لا توجد طلبات بعد', 'No orders yet')}</p>
                </div>
              ) : (data?.recentOrders ?? []).map((item, i) => {
                const st = STATUS_CONFIG[item.order.status] ?? STATUS_CONFIG.pending;
                const SIcon = st.icon;
                return (
                  <div key={i} className="py-3.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">#{item.order.orderNumber}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${st.color}`}>
                        <SIcon className="size-3" />{st.label}
                      </span>
                      <span className="font-bold text-sm">{DZD2(item.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Product Creator / Editor with Real-Time Preview ─────────────────────────────
interface ProductFormProps {
  product: any;
  onClose: () => void;
  onSave: () => void;
  storeId: string;
  sellerId: string;
  t: (a: string, e: string) => string;
  isAr: boolean;
}

function ProductFormTab({ product, onClose, onSave, storeId, sellerId, t, isAr }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<'core' | 'specs' | 'seo' | 'variants'>('core');
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Core Form States
  const [name, setName] = useState(product?.name || '');
  const [nameEn, setNameEn] = useState(product?.nameEn || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [comparePrice, setComparePrice] = useState(product?.comparePrice || 0);
  const [description, setDescription] = useState(product?.description || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [stock, setStock] = useState(product?.stock || 10);
  const [status, setStatus] = useState<'active' | 'draft' | 'inactive'>(product?.status || 'draft');

  // Bullet Points
  let initialBullets = ['', '', ''];
  if (product?.shortDescription) {
    try {
      const parsed = JSON.parse(product.shortDescription);
      if (Array.isArray(parsed)) initialBullets = [...parsed, '', '', ''].slice(0, 3);
    } catch {}
  }
  const [bullet1, setBullet1] = useState(initialBullets[0]);
  const [bullet2, setBullet2] = useState(initialBullets[1]);
  const [bullet3, setBullet3] = useState(initialBullets[2]);

  // Specifications
  let initialSpecs: any = {};
  if (product?.specifications) {
    try {
      if (typeof product.specifications === 'string') {
        initialSpecs = JSON.parse(product.specifications);
      } else {
        initialSpecs = product.specifications;
      }
    } catch {}
  }
  const [weight, setWeight] = useState(initialSpecs.weight || '0.85 كجم');
  const [dimensions, setDimensions] = useState(initialSpecs.dimensions || '40 × 30 × 10 سم');
  const [material, setMaterial] = useState(initialSpecs.material || 'جلد طبيعي + بوليستر مبطن');
  const [origin, setOrigin] = useState(initialSpecs.origin || 'الجزائر');
  const [warranty, setWarranty] = useState(initialSpecs.warranty || 'ضمان 12 شهراً ضد عيوب الصناعة');

  // SEO & Variants
  const [metaTitle, setMetaTitle] = useState(product?.seoTitle || '');
  const [metaDesc, setMetaDesc] = useState(product?.seoDescription || '');
  const [slug, setSlug] = useState(product?.slug || '');

  const [color1, setColor1] = useState(initialSpecs.color1 || 'أسود فاخر');
  const [color2, setColor2] = useState(initialSpecs.color2 || 'بني كلاسيكي');
  const [sizes, setSizes] = useState(initialSpecs.sizes || '13.3 بوصة, 15.6 بوصة');

  // Images
  let initialImages: string[] = [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
  ];
  if (product?.images) {
    try {
      let parsed;
      if (typeof product.images === 'string') {
        parsed = JSON.parse(product.images);
      } else {
        parsed = product.images;
      }
      if (Array.isArray(parsed) && parsed.length > 0) initialImages = parsed;
    } catch {}
  }
  const [selectedImage, setSelectedImage] = useState(initialImages[0]);

  // Fetch Categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setCategories(d);
          if (!categoryId && d.length > 0) setCategoryId(d[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!name) {
      toast.error(isAr ? 'الرجاء إدخال اسم المنتج' : 'Please enter product name');
      return;
    }
    if (!categoryId) {
      toast.error(isAr ? 'الرجاء اختيار الفئة' : 'Please select a category');
      return;
    }

    setIsSaving(true);
    const shortDescArray = [bullet1, bullet2, bullet3].filter(Boolean);
    const specData = {
      weight,
      dimensions,
      material,
      origin,
      warranty,
      color1,
      color2,
      sizes
    };

    const payload = {
      name,
      nameEn: nameEn || name,
      description,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      sku,
      stock: Number(stock),
      status,
      categoryId,
      storeId,
      sellerId,
      images: [selectedImage],
      shortDescription: JSON.stringify(shortDescArray),
      specifications: specData,
      seoTitle: metaTitle,
      seoDescription: metaDesc
    };

    try {
      const url = product?.id ? `/api/products/${product.id}` : '/api/products';
      const method = product?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(product?.id 
          ? (isAr ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully')
          : (isAr ? 'تم نشر المنتج بنجاح' : 'Product published successfully')
        );
        onSave();
        onClose();
      } else {
        toast.error(isAr ? 'فشل حفظ المنتج' : 'Failed to save product');
      }
    } catch {
      toast.error(isAr ? 'خطأ في الاتصال بالشبكة' : 'Network communication error');
    } finally {
      setIsSaving(false);
    }
  };

  const discount = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const currentCategoryName = categories.find(c => c.id === categoryId)?.name || (isAr ? 'ملحقات وأجهزة' : 'Accessories');

  return (
    <div className="space-y-6 pb-12 font-cairo">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-border">
        <div>
          <h1 className="text-xl font-black text-foreground">
            {product?.id ? (isAr ? 'تعديل المنتج الاحترافي' : 'Edit Professional Product') : (isAr ? 'إضافة منتج بمعايير عالمية' : 'Add Professional Product')}
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            {isAr ? 'هيكل النموذج متوافق مع معايير أمازون وشوبيفاي لزيادة المبيعات' : 'Form schema compliant with Amazon & Shopify conversions standards'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            {isAr ? 'حفظ ونشر المنتج' : 'Save & Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Form Editor (8 cols on lg) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 space-y-6 shadow-sm">
          {/* Sub Tab System */}
          <div className="flex gap-1.5 p-1 bg-muted rounded-xl border border-border">
            {[
              { id: 'core', label: isAr ? 'البيانات الأساسية' : 'Core Info' },
              { id: 'specs', label: isAr ? 'المواصفات والاستخدام' : 'Specifications' },
              { id: 'seo', label: isAr ? 'الثقة والـ SEO' : 'Trust & SEO' },
              { id: 'variants', label: isAr ? 'المتغيرات والترقيات' : 'Variants' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-1 text-center rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted-foreground/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: Core Info */}
          {activeTab === 'core' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'اسم المنتج الاحترافي (معادلة أمازون)' : 'Professional Title (Amazon Formula)'}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="البراند + اسم المنتج + الميزة الأساسية + المقاس"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'الاسم بالإنجليزية (اختياري)' : 'Title in English (Optional)'}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Brand + Product Name + Main Feature"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'الفئة الرئيسية للمنتج' : 'Product Category'}</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{isAr ? c.name : (c.nameEn || c.name)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'حالة المنتج' : 'Status'}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  >
                    <option value="active">{isAr ? 'نشط (معروض)' : 'Active (Public)'}</option>
                    <option value="draft">{isAr ? 'مسودة' : 'Draft'}</option>
                    <option value="inactive">{isAr ? 'غير نشط' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'سعر البيع الحالي (د.ج)' : 'Current Price (DZD)'}</label>
                  <input
                    type="number"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'سعر المقارنة المشطوب (د.ج)' : 'Compare Price (DZD)'}</label>
                  <input
                    type="number"
                    value={comparePrice || ''}
                    onChange={(e) => setComparePrice(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">SKU / رمز التخزين</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. BAG-LTHR-001"
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'المخزون المتوفر' : 'Available Stock'}</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'صور المنتج (اختر صورة نمط حياة احترافية)' : 'Product Images (Choose Lifestyle)'}</label>
                <select
                  value={selectedImage}
                  onChange={(e) => setSelectedImage(e.target.value)}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                >
                  <option value="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80">حقيبة جلدية سوداء (ستايل كلاسيكي)</option>
                  <option value="https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80">حقيبة بني كلاسيكي (نمط حياة/مكتب)</option>
                  <option value="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80">حقيبة ظهر عصرية (نمط كاجوال)</option>
                  <option value="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80">حذاء رياضي أحمر متوهج (سنيكرز)</option>
                  <option value="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80">ساعة بيضاء فاخرة (عصرية)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">{isAr ? 'نقاط الوصف الممتازة (Bullet Points)' : 'Bullet points (High converting)'}</label>
                <input
                  type="text"
                  value={bullet1}
                  onChange={(e) => setBullet1(e.target.value)}
                  placeholder="الميزة والمنفعة 1 (مثال: جلد طبيعي مضاد للماء)"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs"
                />
                <input
                  type="text"
                  value={bullet2}
                  onChange={(e) => setBullet2(e.target.value)}
                  placeholder="الميزة والمنفعة 2 (مثال: جيب مبطن ومقاوم للصدمات)"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs"
                />
                <input
                  type="text"
                  value={bullet3}
                  onChange={(e) => setBullet3(e.target.value)}
                  placeholder="الميزة والمنفعة 3 (مثال: شحن سريع لجميع الولايات)"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'الوصف التفصيلي للمنتج' : 'Product Detailed Description'}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="قصة المنتج، لمن يصلح، وطريقة عمله..."
                  rows={3}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: Specifications */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'الوزن الكلي' : 'Product Weight'}</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'أبعاد المنتج' : 'Dimensions'}</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'الخامات المستخدمة' : 'Materials'}</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'بلد المنشأ' : 'Country of Origin'}</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'الضمان المعتمد للمنتج' : 'Product Warranty'}</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: SEO & Trust */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">SEO Meta Title / عنوان جوجل</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="عنوان مغرٍ للنقر لا يتجاوز 60 حرفاً"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">SEO Meta Description / وصف جوجل</label>
                <textarea
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="وصف مختصر للمنتج مع دعوة واضحة للطلب (لا يتجاوز 155 حرفاً)"
                  rows={3}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Friendly URL Slug / رابط الصفحة</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. leather-laptop-bag-pro"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: Variants */}
          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'اللون الأساسي' : 'Primary Color'}</label>
                  <input
                    type="text"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">{isAr ? 'اللون البديل' : 'Secondary Color'}</label>
                  <input
                    type="text"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{isAr ? 'المقاسات المتاحة (مفصولة بفاصلة)' : 'Available Sizes (comma separated)'}</label>
                <input
                  type="text"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Real-Time Live Preview (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-4 bg-slate-900 border border-amber-500/20 rounded-2xl p-5 space-y-5 text-white shadow-xl relative overflow-hidden select-none">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Live Indicator */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full animate-pulse">
                🔴 {isAr ? 'معاينة حية للمتجر' : 'Live Preview'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{currentCategoryName}</span>
            </div>

            {/* Product Title and Price */}
            <div>
              <h2 className="text-base font-extrabold line-clamp-2 text-white">
                {name || (isAr ? 'حقيبة لابتوب جلدية كلاسيكية' : 'Classic Laptop Leather Bag')}
              </h2>
              <div className="flex items-center gap-2 mt-2 justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-amber-400">{(price || 8500).toLocaleString('ar-DZ')} د.ج</span>
                  {comparePrice && comparePrice > price && (
                    <span className="text-xs text-slate-400 line-through">{(comparePrice).toLocaleString('ar-DZ')} د.ج</span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    -{discount}% {isAr ? 'خصم' : 'OFF'}
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Gallery */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex items-center justify-center">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>

            {/* Bullets Preview */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-2">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">{isAr ? 'مميزات وفوائد المنتج:' : 'Key benefits:'}</p>
              <div className="space-y-1.5 text-xs text-slate-200">
                {bullet1 && <div className="flex items-start gap-1.5"><span className="text-amber-400">✓</span><span>{bullet1}</span></div>}
                {bullet2 && <div className="flex items-start gap-1.5"><span className="text-amber-400">✓</span><span>{bullet2}</span></div>}
                {bullet3 && <div className="flex items-start gap-1.5"><span className="text-amber-400">✓</span><span>{bullet3}</span></div>}
              </div>
            </div>

            {/* Tech Specs */}
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wide mb-2">{isAr ? 'المواصفات الفنية المعتمدة:' : 'Technical specs:'}</p>
              <table className="w-full text-[10px] text-slate-300 divide-y divide-white/5">
                <tbody>
                  <tr className="py-1 flex justify-between"><td className="font-bold text-slate-400">{isAr ? 'الوزن' : 'Weight'}</td><td>{weight}</td></tr>
                  <tr className="py-1 flex justify-between"><td className="font-bold text-slate-400">{isAr ? 'الأبعاد' : 'Dimensions'}</td><td>{dimensions}</td></tr>
                  <tr className="py-1 flex justify-between"><td className="font-bold text-slate-400">{isAr ? 'الخامة' : 'Material'}</td><td>{material}</td></tr>
                  <tr className="py-1 flex justify-between"><td className="font-bold text-slate-400">{isAr ? 'المنشأ' : 'Origin'}</td><td>{origin}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Colors Preview */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">{isAr ? 'خيارات المتغيرات:' : 'Variants available:'}</p>
              <div className="flex gap-1.5">
                <span className="text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/40 px-2.5 py-1 rounded-md font-bold">{color1}</span>
                <span className="text-[10px] bg-white/5 text-slate-300 border border-white/10 px-2.5 py-1 rounded-md font-medium">{color2}</span>
              </div>
            </div>

            {/* Trust Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-[9px] text-slate-300">
              <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex flex-col items-center gap-1">
                <span>🛡️</span>
                <span className="font-bold">{isAr ? 'ضمان حقيقي' : 'Warranty'}</span>
                <span className="text-[7px] text-slate-500 line-clamp-1">{warranty}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex flex-col items-center gap-1">
                <span>🚚</span>
                <span className="font-bold">{isAr ? 'شحن سريع' : 'Fast Shipping'}</span>
                <span className="text-[7px] text-slate-500">{isAr ? '58 ولاية' : '58 Wilayas'}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex flex-col items-center gap-1">
                <span>🔄</span>
                <span className="font-bold">{isAr ? 'إرجاع سهل' : 'Easy Returns'}</span>
                <span className="text-[7px] text-slate-500">{isAr ? '14 يوماً' : '14 Days'}</span>
              </div>
            </div>

            {/* Checkout button */}
            <button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-2.5 rounded-xl shadow-lg text-xs tracking-wide">
              {isAr ? 'شراء المنتج الآن (الدفع عند الاستلام)' : 'BUY NOW (Cash on Delivery)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
