'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Package, ArrowLeft, ArrowRight, ShoppingCart, Shield, TrendingUp, Users, Award } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const CURRENCY = { symbol: 'د.ج' };
const fmt = (n: number) => `${n.toLocaleString('ar-DZ')} ${CURRENCY.symbol}`;

const LEVEL_BADGE: Record<number, string> = {
  1: '🌱', 2: '⭐', 3: '🌟', 4: '💫', 5: '🔥',
  6: '💎', 7: '👑', 8: '🏆', 9: '🦅', 10: '🌠',
};

function StarRating({ rating, color }: { rating: number; color?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          className={`size-4 ${s <= Math.round(rating) ? (color ? '' : 'fill-amber-400 text-amber-400') : 'text-gray-300'}`} 
          style={s <= Math.round(rating) && color ? { fill: color, color } : {}}
        />
      ))}
    </div>
  );
}

interface SellerData {
  id: string;
  storeName?: string;
  storeNameEn?: string;
  bio?: string;
  logo?: string;
  coverImage?: string;
  rating: number;
  level: number;
  totalSales: number;
  totalCustomers: number;
  isVerified: boolean;
  completionRate: number;
  responseRate: number;
  user: { name: string; nameEn?: string; avatar?: string; createdAt: string };
  _count: { products: number };
  themeSettings?: { primaryColor: string; accentColor: string };
  products: {
    id: string; name: string; nameEn?: string; price: number; comparePrice?: number;
    images: string; rating: number; soldCount: number; reviewCount: number; isFeatured: boolean;
    category: { name: string };
  }[];
}

export default function SellerProfilePage() {
  const router = useRouter();
  const { locale, selectedSellerId, setCurrentPage } = useAppStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [seller, setSeller] = useState<SellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');

  useEffect(() => {
    if (!selectedSellerId) { setCurrentPage('home'); return; }
    setIsLoading(true);
    fetch(`/api/sellers/${selectedSellerId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setSeller(d.seller); else setCurrentPage('home'); })
      .catch(() => setCurrentPage('home'))
      .finally(() => setIsLoading(false));
  }, [selectedSellerId]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-muted" />
        <div className="container-platform py-6 space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!seller) return null;

  const joinYear = new Date(seller.user.createdAt).getFullYear();
  const storeName = isAr ? seller.storeName : (seller.storeNameEn || seller.storeName);

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {seller.coverImage && (
          <img src={seller.coverImage} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 start-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 transition-all text-sm font-medium"
          >
            {isAr ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
            {t('العودة', 'Back')}
          </button>
        </div>
      </div>

      <div className="container-platform relative z-10">
        {/* Seller Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative shrink-0 -mt-12 sm:-mt-16">
            {seller.logo ? (
              <img src={seller.logo} alt={storeName || ''} className="size-24 md:size-32 rounded-2xl object-cover border-4 border-background shadow-md bg-background" />
            ) : (
              <div className="size-24 md:size-32 rounded-2xl bg-primary/10 border-4 border-background shadow-md flex items-center justify-center text-4xl bg-background">🏪</div>
            )}
            {seller.isVerified && (
              <div className="absolute -bottom-2 -end-2 size-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg border-2 border-background">
                <Shield className="size-4" />
              </div>
            )}
          </div>
          <div className="flex-1 pb-2 pt-2 sm:pt-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-black">{storeName}</h1>
              <span className="text-2xl">{LEVEL_BADGE[seller.level] || '🌱'}</span>
              {seller.isVerified && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 gap-1"><Shield className="size-3" /> {t('تاجر موثق', 'Verified Seller')}</Badge>}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <StarRating rating={seller.rating ?? 0} color={seller.themeSettings?.primaryColor} />
              <span className="font-bold">{(seller.rating ?? 0).toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-sm text-muted-foreground">{t(`عضو منذ ${joinYear}`, `Member since ${joinYear}`)}</span>
            </div>
          </div>
          <div className="pb-2">
            <Button 
              className="gap-2 font-bold w-full sm:w-auto"
              style={seller.themeSettings?.primaryColor ? { backgroundColor: seller.themeSettings.primaryColor, color: '#000' } : {}}
            >
              <ShoppingCart className="size-4" />
              {t('تسوق من المتجر', 'Shop This Store')}
            </Button>
          </div>
        </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: TrendingUp, label: t('إجمالي المبيعات', 'Total Sales'), value: (seller.totalSales ?? 0).toLocaleString(), color: 'text-green-500' },
            { icon: Users, label: t('العملاء', 'Customers'), value: (seller.totalCustomers ?? 0).toLocaleString(), color: 'text-blue-500' },
            { icon: Package, label: t('المنتجات', 'Products'), value: (seller._count?.products ?? 0).toString(), color: 'text-purple-500' },
            { icon: Award, label: t('معدل الإنجاز', 'Completion Rate'), value: `${seller.completionRate || 95}%`, color: 'text-amber-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="border-border hover:border-primary/30 transition-all">
              <CardContent className="p-4 text-center">
                <Icon className={`size-6 mx-auto mb-2 ${color}`} />
                <p className="text-xl font-black">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {[
            { key: 'products', label: t('المنتجات', 'Products') },
            { key: 'about', label: t('عن المتجر', 'About') },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'products' | 'about')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === tab.key ? (seller.themeSettings?.primaryColor ? '' : 'border-primary text-primary') : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              style={activeTab === tab.key && seller.themeSettings?.primaryColor ? { borderBottomColor: seller.themeSettings.primaryColor, color: seller.themeSettings.primaryColor } : {}}
            >
              {tab.label}
              {tab.key === 'products' && <Badge className="ms-2 text-xs">{seller._count.products}</Badge>}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-10">
            {seller.products.map((p) => {
              let imgs: string[] = [];
              try {
                if (p.images) {
                  if (typeof p.images === 'string') {
                    const parsed = JSON.parse(p.images);
                    if (Array.isArray(parsed)) imgs = parsed;
                  } else if (Array.isArray(p.images)) {
                    imgs = p.images;
                  }
                }
              } catch {}
              if (!Array.isArray(imgs)) imgs = [];

              const disc = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
              return (
                <Card
                  key={p.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
                  onClick={() => {
                    useAppStore.getState().setSelectedProductId(p.id);
                    router.push(`/products/${p.id}`);
                  }}
                >
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {imgs[0] ? (
                      <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="size-10 text-muted-foreground/30" />
                      </div>
                    )}
                    {disc > 0 && <Badge className="absolute top-2 start-2 bg-red-500 text-white text-xs">-{disc}%</Badge>}
                    {p.isFeatured && <Badge className="absolute top-2 end-2 bg-amber-500 text-white text-xs">⭐</Badge>}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-1 truncate">{p.category?.name || ''}</p>
                    <p className="text-xs md:text-sm font-semibold line-clamp-2 mb-1.5">{isAr ? p.name : (p.nameEn || p.name)}</p>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`size-3 ${s <= Math.round(p.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}
                      </div>
                      <span className="text-xs text-muted-foreground">({p.soldCount})</span>
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-bold text-primary" style={seller.themeSettings?.primaryColor ? { color: seller.themeSettings.primaryColor } : {}}>{fmt(p.price)}</p>
                      {p.comparePrice && <p className="text-xs text-muted-foreground line-through">{fmt(p.comparePrice)}</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="pb-10 space-y-6 max-w-2xl">
            {seller.bio && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold mb-2">{t('عن المتجر', 'About the Store')}</h3>
                  <p className="text-muted-foreground leading-relaxed">{seller.bio}</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold">{t('معلومات المتجر', 'Store Info')}</h3>
                {[
                  { label: t('حالة التوثيق', 'Verification'), value: seller.isVerified ? t('✓ موثق رسمياً', '✓ Officially Verified') : t('غير موثق', 'Unverified') },
                  { label: t('مستوى التاجر', 'Seller Level'), value: `${LEVEL_BADGE[seller.level] || '🌱'} ${t(`المستوى ${seller.level}`, `Level ${seller.level}`)}` },
                  { label: t('معدل الاستجابة', 'Response Rate'), value: `${seller.responseRate || 98}%` },
                  { label: t('معدل الإنجاز', 'Completion Rate'), value: `${seller.completionRate || 95}%` },
                  { label: t('عضو منذ', 'Member Since'), value: joinYear.toString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground text-sm">{label}</span>
                    <span className="font-semibold text-sm">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
