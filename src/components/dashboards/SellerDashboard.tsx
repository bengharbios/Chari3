'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, Package, Star, ShieldCheck, ArrowLeft, ArrowRight,
  Wallet, AlertTriangle, ChevronUp, BarChart3, Clock, CheckCircle,
  XCircle, Eye, Plus, Edit, Trash2, Trophy, Target, Zap
} from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useOnboardingStore } from '@/lib/store/onboarding';
import { useAppStore as appStore } from '@/lib/store';

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

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    fetch(`/api/seller/dashboard?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  // Show different sub-pages
  if (currentPage === 'seller-products') return <SellerProductsTab data={data} isLoading={isLoading} t={t} isAr={isAr} />;
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
function SellerProductsTab({ data, isLoading, t, isAr }: { data: DashboardData | null; isLoading: boolean; t: (a: string, e: string) => string; isAr: boolean }) {
  const STATUS_COLOR: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    inactive: 'bg-red-100 text-red-600',
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('إدارة المنتجات', 'Product Management')}</h1>
        <Button className="gap-2"><Plus className="size-4" />{t('إضافة منتج', 'Add Product')}</Button>
      </div>
      <Card>
        <CardContent className="pt-4">
          {isLoading ? <div className="h-48 animate-pulse bg-muted rounded-xl" /> : (
            <div className="divide-y divide-border">
              {(data?.products ?? []).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Package className="size-10 mx-auto mb-2 opacity-30" />
                  <p>{t('لا توجد منتجات بعد', 'No products yet')}</p>
                  <Button size="sm" className="mt-3"><Plus className="size-4 me-1" />{t('أضف أول منتج', 'Add first product')}</Button>
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
                    <Button size="icon" variant="ghost" className="size-7"><Edit className="size-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="size-7 text-destructive"><Trash2 className="size-3.5" /></Button>
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
