'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Shield, Truck, ArrowLeft, ArrowRight, ShoppingBag, Award, Quote } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const CURRENCY = { symbol: 'د.ج', code: 'DZD' };

function fmt(amount: number) {
  return `${amount.toLocaleString('ar-DZ')} ${CURRENCY.symbol}`;
}

const DEFAULT_HERO_SLIDES = [
  {
    id: '1',
    title: 'تسوق بثقة',
    titleEn: 'Shop with Confidence',
    subtitle: 'آلاف المنتجات من تجار موثوقين في الجزائر',
    subtitleEn: 'Thousands of products from verified Algerian sellers',
    bg: 'from-blue-900 via-blue-800 to-indigo-900',
    badge: '🔥 العروض الحصرية',
    cta: 'تسوق الآن',
  },
  {
    id: '2',
    title: 'توصيل سريع',
    titleEn: 'Fast Delivery',
    subtitle: 'نوصل لجميع ولايات الجزائر خلال 24-72 ساعة',
    subtitleEn: 'Delivery to all wilayas within 24-72 hours',
    bg: 'from-emerald-900 via-teal-800 to-cyan-900',
    badge: '🚀 توصيل سريع',
    cta: 'اكتشف المزيد',
  },
  {
    id: '3',
    title: 'ضمان الجودة',
    titleEn: 'Quality Guarantee',
    subtitle: 'جميع المنتجات مضمونة وقابلة للإرجاع',
    subtitleEn: 'All products are guaranteed with easy returns',
    bg: 'from-purple-900 via-violet-800 to-indigo-900',
    badge: '✅ ضمان الجودة',
    cta: 'ابدأ التسوق',
  },
];

const DEFAULT_TESTIMONIALS = [
  { name: 'فاطمة بن علي', text: 'خدمة ممتازة وتوصيل سريع، أنصح الجميع بالتسوق من هنا!', rating: 5, city: 'الجزائر العاصمة' },
  { name: 'محمد الأمين', text: 'منصة رائعة، المنتجات أصلية والأسعار معقولة جداً', rating: 5, city: 'وهران' },
  { name: 'نور الدين حداد', text: 'تعاملت مع عدة تجار والكل موثوق ومحترف', rating: 4, city: 'قسنطينة' },
  { name: 'سارة بوزيان', text: 'أفضل تجربة تسوق أونلاين في الجزائر حتى الآن', rating: 5, city: 'عنابة' },
];

const FEATURES = [
  { icon: Shield, title: 'توثيق كامل', desc: 'جميع التجار موثقون رسمياً' },
  { icon: Truck, title: 'توصيل لكل ولاية', desc: '58 ولاية مغطاة في الجزائر' },
  { icon: Award, title: 'ضمان الجودة', desc: 'إرجاع مجاني خلال 14 يوم' },
  { icon: TrendingUp, title: 'أفضل الأسعار', desc: 'مقارنة أسعار فورية بين التجار' },
];

interface HomepageData {
  categories: { id: string; name: string; nameEn?: string; icon?: string; image?: string }[];
  featuredProducts: {
    id: string; name: string; nameEn?: string; price: number; comparePrice?: number;
    images: string; rating: number; soldCount: number;
    seller?: { storeName?: string; rating: number; level: number; logo?: string } | null;
    store?: { name: string; rating: number; level: number; logo?: string } | null;
    category: { name: string };
  }[];
  topSellers: {
    id: string; storeName?: string; rating: number; level: number; totalSales: number; logo?: string;
    user: { name: string; avatar?: string };
    _count: { products: number };
  }[];
  advertisements: Record<string, { id: string; title: string; imageUrl: string; linkUrl?: string }[]>;
  testimonials: { name: string; text: string; rating: number; city: string }[];
}

function AdBanner({ ads, className = '' }: { ads?: { id: string; title: string; imageUrl: string; linkUrl?: string }[]; className?: string }) {
  if (!ads || ads.length === 0) return null;
  const ad = ads[0];
  return (
    <a href={ad.linkUrl || '#'} className={`block overflow-hidden rounded-2xl ${className}`} onClick={() => fetch(`/api/admin/advertisements`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ad.id, clicks: 1 }) }).catch(() => {})}>
      <div className="relative w-full h-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center p-6">
        <p className="text-white font-bold text-lg">{ad.title}</p>
        <Badge className="absolute top-3 end-3 bg-white text-orange-600">إعلان</Badge>
      </div>
    </a>
  );
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${size === 'sm' ? 'size-3' : 'size-4'} ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

const LEVEL_BADGE: Record<number, string> = {
  1: '🌱', 2: '⭐', 3: '🌟', 4: '💫', 5: '🔥',
  6: '💎', 7: '👑', 8: '🏆', 9: '🦅', 10: '🌠',
};

export default function StorefrontHomepage() {
  const { locale } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [data, setData] = useState<HomepageData | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/homepage')
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % DEFAULT_HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = DEFAULT_HERO_SLIDES[heroIndex];

  return (
    <div className="min-h-screen">
      {/* ── TOP AD BANNER ── */}
      {data?.advertisements?.banner_top && (
        <div className="h-14 w-full">
          <AdBanner ads={data.advertisements.banner_top} className="h-full" />
        </div>
      )}

      {/* ── HERO SLIDER ── */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${slide.bg} text-white`}>
        <div className="container-platform py-20 md:py-28 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm px-4 py-1.5">
              {slide.badge}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
              {isAr ? slide.title : slide.titleEn}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 md:mb-8">
              {isAr ? slide.subtitle : slide.subtitleEn}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 font-bold px-8 w-full sm:w-auto">
                {slide.cta}
                {isAr ? <ArrowLeft className="ms-2 size-5" /> : <ArrowRight className="ms-2 size-5" />}
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto">
                  {t('سجل متجرك', 'Start Selling')}
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-6 start-1/2 -translate-x-1/2 flex gap-2 z-10">
          {DEFAULT_HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
          ))}
        </div>
        {/* Nav arrows */}
        <button onClick={() => setHeroIndex((i) => (i - 1 + DEFAULT_HERO_SLIDES.length) % DEFAULT_HERO_SLIDES.length)}
          className="absolute start-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white z-10 hidden md:block">
          {isAr ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
        </button>
        <button onClick={() => setHeroIndex((i) => (i + 1) % DEFAULT_HERO_SLIDES.length)}
          className="absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white z-10 hidden md:block">
          {isAr ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
        </button>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container-platform py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-start gap-2 md:gap-3">
                <div className="p-2 md:p-2.5 rounded-xl bg-primary/10 shrink-0">
                  <f.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold">{f.title}</p>
                  <p className="hidden md:block text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="container-platform py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('تسوق حسب الفئة', 'Shop by Category')}</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            {t('عرض الكل', 'View All')}
            {isAr ? <ArrowLeft className="ms-1 size-4" /> : <ArrowRight className="ms-1 size-4" />}
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shrink-0 w-24 h-24 rounded-2xl bg-muted animate-pulse" />
              ))
            : (data?.categories ?? []).map((cat) => (
                <button key={cat.id}
                  className="shrink-0 flex flex-col items-center gap-2 p-4 w-24 rounded-2xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all group">
                  <span className="text-2xl">{cat.icon || '🛍️'}</span>
                  <span className="text-xs font-medium text-center truncate w-full">{isAr ? cat.name : (cat.nameEn || cat.name)}</span>
                </button>
              ))}
        </div>
      </section>

      {/* ── MID AD BANNER ── */}
      {data?.advertisements?.banner_mid && (
        <div className="container-platform mb-8">
          <AdBanner ads={data.advertisements.banner_mid} className="h-32 rounded-2xl" />
        </div>
      )}

      {/* ── FEATURED PRODUCTS ── */}
      <section className="container-platform py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{t('منتجات مميزة', 'Featured Products')}</h2>
            <p className="text-sm text-muted-foreground">{t('اختيارات حصرية من أفضل التجار', 'Exclusive picks from top sellers')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-muted animate-pulse h-64" />
              ))
            : (data?.featuredProducts ?? []).map((product) => {
                let images: string[] = [];
                try { images = JSON.parse(product.images); } catch {}
                const seller = product.seller || product.store;
                const sellerName = product.seller?.storeName || product.store?.name || '';
                const sellerLevel = product.seller?.level || product.store?.level || 1;
                const discount = product.comparePrice
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : 0;

                return (
                  <Card key={product.id}
                    className="overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/30"
                    onClick={() => {
                      useAppStore.getState().setSelectedProductId(product.id);
                      useAppStore.getState().setCurrentPage('product-detail');
                    }}
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden shrink-0">
                      {images[0] ? (
                        <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary/10 to-primary/5">
                          <ShoppingBag className="size-10 text-primary/30" />
                        </div>
                      )}
                      {discount > 0 && (
                        <Badge className="absolute top-2 start-2 bg-red-500 text-white text-xs">-{discount}%</Badge>
                      )}
                    </div>
                    <CardContent className="p-2.5 md:p-3 flex flex-col grow">
                      <p className="text-[10px] md:text-xs text-muted-foreground mb-1 truncate">{product.category.name}</p>
                      <p className="text-xs md:text-sm font-semibold line-clamp-2 mb-1.5">{product.name}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <StarRating rating={product.rating} />
                        <span className="text-[10px] md:text-xs text-muted-foreground">({product.soldCount})</span>
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-end justify-between">
                          <div className="w-full">
                            <p className="text-sm md:text-base font-bold text-primary truncate">{fmt(product.price)}</p>
                            {product.comparePrice && (
                              <p className="text-[10px] md:text-xs text-muted-foreground line-through truncate">{fmt(product.comparePrice)}</p>
                            )}
                          </div>
                        </div>
                        {sellerName && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                            <span className="text-xs">{LEVEL_BADGE[sellerLevel] || '🌱'}</span>
                            <span className="text-[10px] md:text-xs text-muted-foreground truncate">{sellerName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </section>

      {/* ── TOP SELLERS ── */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-14 mt-10">
        <div className="container-platform">
          <div className="text-center mb-8 md:mb-10 px-4">
            <Badge className="mb-3 bg-amber-500/20 text-amber-400 border-amber-500/30">
              {t('التجار الأفضل', 'Top Sellers')}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-black mb-2">{t('تجار موثوقون بتقييمات عالية', 'Trusted Sellers with High Ratings')}</h2>
            <p className="text-sm md:text-base text-white/60">{t('تسوق من التجار الأكثر تميزاً ومصداقية على المنصة', 'Shop from our most distinguished and reliable sellers')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-2xl bg-white/10 animate-pulse h-36" />)
              : (data?.topSellers ?? []).map((seller) => (
                  <Card key={seller.id}
                    className="bg-white/10 border-white/10 hover:bg-white/15 transition-all cursor-pointer group"
                    onClick={() => {
                      useAppStore.getState().setSelectedSellerId(seller.id);
                      useAppStore.getState().setCurrentPage('seller-profile');
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="relative mx-auto mb-3 w-14 h-14">
                        {seller.user.avatar ? (
                          <img src={seller.user.avatar} className="w-full h-full rounded-full object-cover border-2 border-amber-400" alt={seller.user.name} />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl font-bold text-white">
                            {seller.user.name.charAt(0)}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -end-1 text-base">{LEVEL_BADGE[seller.level] || '⭐'}</span>
                      </div>
                      <p className="text-white font-semibold text-sm truncate">{seller.storeName || seller.user.name}</p>
                      <div className="flex items-center justify-center gap-1 my-1">
                        <StarRating rating={seller.rating} />
                        <span className="text-white/60 text-xs">{seller.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-white/50 text-xs">{seller._count.products} {t('منتج', 'products')}</p>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="container-platform py-14">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">{t('آراء عملائنا', 'Customer Reviews')}</Badge>
          <h2 className="text-3xl font-black mb-2">{t('ماذا قالوا عنا؟', 'What They Said About Us?')}</h2>
          <p className="text-muted-foreground">{t('آراء حقيقية من مشترين حقيقيين', 'Real reviews from real buyers')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(data?.testimonials?.length ? data.testimonials : DEFAULT_TESTIMONIALS).map((t2, i) => (
            <Card key={i} className="border-border hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <Quote className="size-6 text-primary/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t2.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{t2.name}</p>
                    <p className="text-xs text-muted-foreground">{t2.city}</p>
                  </div>
                  <StarRating rating={t2.rating} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── BOTTOM AD ── */}
      {data?.advertisements?.banner_bottom && (
        <div className="container-platform mb-10">
          <AdBanner ads={data.advertisements.banner_bottom} className="h-28" />
        </div>
      )}

      {/* ── CTA SECTION ── */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20 py-10 md:py-14">
        <div className="container-platform text-center px-4">
          <h2 className="text-2xl md:text-3xl font-black mb-3">{t('ابدأ البيع اليوم!', 'Start Selling Today!')}</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-xl mx-auto">
            {t('انضم لآلاف التجار الناجحين على منصة شاري داي وابدأ رحلتك نحو النجاح التجاري', 'Join thousands of successful sellers on Chariday and start your journey to commercial success')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto sm:max-w-none">
            <Button size="lg" className="gradient-navy text-white px-8 w-full sm:w-auto">
              {t('أنشئ حساب تاجر', 'Create Seller Account')}
            </Button>
            <Button size="lg" variant="outline" className="px-8 w-full sm:w-auto">
              {t('تعرف على الباقات', 'View Packages')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
