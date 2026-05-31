'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Shield, Truck, ArrowLeft, ArrowRight, ShoppingBag, Award, Quote, SlidersHorizontal, X, Search } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
    seller?: { storeName?: string; rating: number; level: number; logo?: string; slug?: string } | null;
    store?: { name: string; rating: number; level: number; logo?: string; slug?: string } | null;
    category: { name: string };
  }[];
  topSellers: {
    id: string; storeName?: string; rating: number; level: number; totalSales: number; logo?: string; slug?: string;
    user: { name: string; avatar?: string };
    _count: { products: number };
  }[];
  topStores: {
    id: string; name: string; nameEn?: string; rating: number; level: number; totalSales: number; logo?: string; slug?: string;
    manager: { name: string; avatar?: string };
    _count: { products: number };
  }[];
  advertisements: Record<string, { id: string; title: string; imageUrl: string; linkUrl?: string }[]>;
  testimonials: { name: string; text: string; rating: number; city: string }[];
  layout?: string[];
  heroSlides?: any[];
}

function AdBanner({ ads, className = '' }: { ads?: { id: string; title: string; imageUrl: string; linkUrl?: string }[]; className?: string }) {
  if (!ads || ads.length === 0 || !ads[0]) return null;
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
  const router = useRouter();
  const { locale } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [data, setData] = useState<HomepageData | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMerchantTab, setActiveMerchantTab] = useState<'stores' | 'sellers'>('stores');

  // Advanced filter state
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSort, setFilterSort] = useState('newest');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<HomepageData['featuredProducts']>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    fetch('/api/homepage')
      .then((r) => r.json())
      .then((d) => { if (d.success) { setData(d); setFilteredProducts(d.featuredProducts || []); } })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch filtered products whenever filters change
  const fetchFilteredProducts = useCallback(async () => {
    setIsFilterLoading(true);
    try {
      const params = new URLSearchParams({ status: 'active', limit: '20', sort: filterSort });
      if (filterSearch) params.set('q', filterSearch);
      if (filterCategory) params.set('categoryId', filterCategory);
      if (filterMinPrice) params.set('minPrice', filterMinPrice);
      if (filterMaxPrice) params.set('maxPrice', filterMaxPrice);
      const res = await fetch(`/api/products?${params.toString()}`);
      const d = await res.json();
      if (d.products) setFilteredProducts(d.products);
    } catch {}
    setIsFilterLoading(false);
  }, [filterSearch, filterCategory, filterSort, filterMinPrice, filterMaxPrice]);

  // Debounce filter fetch
  useEffect(() => {
    const timer = setTimeout(fetchFilteredProducts, 500);
    return () => clearTimeout(timer);
  }, [fetchFilteredProducts]);

  // Reset display count when filtered products change
  useEffect(() => {
    setDisplayCount(20);
  }, [filteredProducts]);

  const hasActiveFilters = !!(filterSearch || filterCategory || filterMinPrice || filterMaxPrice || filterSort !== 'newest');

  const clearFilters = () => {
    setFilterSearch('');
    setFilterCategory('');
    setFilterSort('newest');
    setFilterMinPrice('');
    setFilterMaxPrice('');
  };

  const rawSlides = data?.heroSlides ?? [];
  const validSlides = Array.isArray(rawSlides)
    ? rawSlides.filter((s: any) => s && typeof s === 'object' && (s.title || s.titleEn))
    : [];
  const currentHeroSlides = validSlides.length > 0 ? validSlides : DEFAULT_HERO_SLIDES;

  useEffect(() => {
    if (!currentHeroSlides.length) return;
    const interval = setInterval(() => setHeroIndex((i) => (i + 1) % currentHeroSlides.length), 5000);
    return () => clearInterval(interval);
  }, [currentHeroSlides]);

  const slide = currentHeroSlides[heroIndex] || currentHeroSlides[0] || DEFAULT_HERO_SLIDES[0];
  const slideBg = slide?.bg || 'from-blue-900 via-blue-800 to-indigo-900';
  const slideBadge = slide?.badge || '';
  const slideTitle = isAr ? (slide?.title || '') : (slide?.titleEn || slide?.title || '');
  const slideSubtitle = isAr ? (slide?.subtitle || '') : (slide?.subtitleEn || slide?.subtitle || '');

  const renderSection = (sectionName: string) => {
    switch (sectionName) {
      case 'hero':
        return (
          <section key="hero" className={`relative overflow-hidden bg-gradient-to-br ${slideBg} text-white`}>
            <div className="container-platform py-20 md:py-28 relative z-10">
              <div className="max-w-2xl">
                {slideBadge && (
                  <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm px-4 py-1.5">
                    {slideBadge}
                  </Badge>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                  {slideTitle}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 md:mb-8">
                  {slideSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 font-bold px-8 w-full sm:w-auto">
                    {slide.cta || t('تسوق الآن', 'Shop Now')}
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
            {currentHeroSlides.length > 1 && (
              <div className="absolute bottom-6 start-1/2 -translate-x-1/2 flex gap-2 z-10">
                {currentHeroSlides.map((_, i) => (
                  <button key={i} onClick={() => setHeroIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
                ))}
              </div>
            )}
            {currentHeroSlides.length > 1 && (
              <>
                <button onClick={() => setHeroIndex((i) => (i - 1 + currentHeroSlides.length) % currentHeroSlides.length)}
                  className="absolute start-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white z-10 hidden md:block">
                  {isAr ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
                </button>
                <button onClick={() => setHeroIndex((i) => (i + 1) % currentHeroSlides.length)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white z-10 hidden md:block">
                  {isAr ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
                </button>
              </>
            )}
          </section>
        );

      case 'features':
        return (
          <section key="features" className="bg-muted/30 border-y border-border">
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
        );

      case 'categories':
        const catGradients = [
          'from-blue-500/20 to-indigo-500/10','from-emerald-500/20 to-teal-500/10',
          'from-amber-500/20 to-orange-500/10','from-rose-500/20 to-pink-500/10',
          'from-purple-500/20 to-violet-500/10','from-cyan-500/20 to-sky-500/10',
          'from-lime-500/20 to-green-500/10','from-red-500/20 to-rose-500/10',
          'from-teal-500/20 to-emerald-500/10','from-orange-500/20 to-amber-500/10',
          'from-indigo-500/20 to-blue-500/10','from-pink-500/20 to-fuchsia-500/10',
        ];
        const displayCats = (data?.categories ?? []).filter((c) => c && c.id).slice(0, 12);
        return (
          <section key="categories" className="container-platform py-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{t('تسوق حسب الفئة', 'Shop by Category')}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t('اكتشف آلاف المنتجات مرتبة بعناية', 'Discover thousands of curated products')}</p>
              </div>
              {filterCategory && (
                <Button variant="ghost" size="sm" className="text-destructive gap-1 text-xs" onClick={() => setFilterCategory('')}>
                  <X className="size-3" />
                  {t('إلغاء الفلتر', 'Clear Filter')}
                </Button>
              )}
            </div>
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : displayCats.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <ShoppingBag className="size-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">{t('لا توجد تصنيفات متاحة حالياً', 'No categories available yet')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {displayCats.map((cat, idx) => {
                  const isActive = filterCategory === cat.id;
                  const grad = catGradients[idx % catGradients.length];
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(isActive ? '' : cat.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 bg-gradient-to-br ${grad} ${
                        isActive
                          ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                          : 'border-transparent hover:border-primary/40 hover:scale-105 hover:shadow-md'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl drop-shadow-sm">{cat.icon || '📦'}</span>
                      <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight line-clamp-2">
                        {isAr ? cat.name : (cat.nameEn || cat.name)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );


      case 'featured_products':
        const productsToShow = filteredProducts.length > 0 ? filteredProducts : (data?.featuredProducts ?? []);
        return (
          <section key="featured_products" className="container-platform py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{t('منتجات مميزة', 'Featured Products')}</h2>
                <p className="text-sm text-muted-foreground">{t('اختيارات حصرية من أفضل التجار', 'Exclusive picks from top sellers')}</p>
              </div>
              <Button
                variant={showFilterPanel ? 'default' : 'outline'}
                size="sm"
                className="gap-2 relative"
                onClick={() => setShowFilterPanel(p => !p)}
              >
                <SlidersHorizontal className="size-4" />
                {t('فلتر', 'Filter')}
                {hasActiveFilters && (
                  <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </Button>
            </div>
            {showFilterPanel && (
              <div className="mb-5 p-4 rounded-2xl bg-card border border-border space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                      placeholder={t('ابحث عن منتج...', 'Search products...')}
                      className="ps-9 h-9 text-sm rounded-xl"
                    />
                  </div>
                  <select
                    value={filterSort}
                    onChange={e => setFilterSort(e.target.value)}
                    className="h-9 rounded-xl border border-input bg-background px-3 text-sm min-w-[140px]"
                  >
                    <option value="newest">{t('الأحدث', 'Newest')}</option>
                    <option value="price_asc">{t('السعر: الأقل', 'Price: Low to High')}</option>
                    <option value="price_desc">{t('السعر: الأعلى', 'Price: High to Low')}</option>
                    <option value="rating">{t('الأعلى تقييماً', 'Top Rated')}</option>
                    <option value="popular">{t('الأكثر مبيعاً', 'Best Selling')}</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="h-9 rounded-xl border border-input bg-background px-3 text-sm flex-1"
                  >
                    <option value="">{t('كل الفئات', 'All Categories')}</option>
                    {(data?.categories || []).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon || ''} {isAr ? cat.name : (cat.nameEn || cat.name)}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={filterMinPrice}
                      onChange={e => setFilterMinPrice(e.target.value)}
                      placeholder={t('سعر من', 'Min price')}
                      className="h-9 rounded-xl text-sm w-28"
                    />
                    <span className="text-muted-foreground text-sm">—</span>
                    <Input
                      type="number"
                      value={filterMaxPrice}
                      onChange={e => setFilterMaxPrice(e.target.value)}
                      placeholder={t('سعر إلى', 'Max price')}
                      className="h-9 rounded-xl text-sm w-28"
                    />
                    <span className="text-xs text-muted-foreground">DZD</span>
                  </div>
                  {hasActiveFilters && (
                    <Button size="sm" variant="ghost" onClick={clearFilters} className="h-9 gap-1 text-muted-foreground hover:text-destructive">
                      <X className="size-3.5" />
                      {t('مسح', 'Clear')}
                    </Button>
                  )}
                </div>
              </div>
            )}
            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground mb-3">
                {isFilterLoading ? t('جاري البحث...', 'Searching...') : `${filteredProducts.length} ${t('نتيجة', 'results')}`}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {(isLoading || isFilterLoading)
                ? Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-muted animate-pulse h-64" />
                  ))
                : productsToShow
                    .filter((product) => product && product.id)
                    .slice(0, displayCount)
                    .map((product) => {
                      let images: string[] = [];
                      if (Array.isArray(product.images)) {
                        images = product.images;
                      } else if (typeof product.images === 'string') {
                        try { images = JSON.parse(product.images); } catch {}
                      }
                      if (!Array.isArray(images)) images = [];

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
                            router.push(`/products/${product.id}`);
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
                            <p className="text-[10px] md:text-xs text-muted-foreground mb-1 truncate">{product.category?.name || ''}</p>
                            <p className="text-xs md:text-sm font-semibold line-clamp-2 mb-1.5">{isAr ? product.name : (product.nameEn || product.name)}</p>
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
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border gap-1.5 text-[10px] md:text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-sm shrink-0">{LEVEL_BADGE[sellerLevel] || '🌱'}</span>
                                    <span className="font-medium text-foreground/80 truncate">{sellerName}</span>
                                  </div>
                                  {(product.seller?.rating || product.store?.rating) !== undefined && (
                                    <div className="flex items-center gap-0.5 shrink-0 text-amber-500 font-bold">
                                      <Star className="size-3 fill-amber-400 text-amber-400" />
                                      <span>{(product.seller?.rating || product.store?.rating || 0).toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
            </div>
            {productsToShow.filter(p => p && p.id).length > displayCount && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 min-w-[200px] border-primary/30 hover:border-primary hover:bg-primary/5"
                  onClick={() => setDisplayCount(prev => prev + 20)}
                >
                  <ShoppingBag className="size-4" />
                  {t('عرض المزيد', 'Load More')}
                  <Badge variant="secondary" className="ms-1">
                    +{Math.min(20, productsToShow.filter(p => p && p.id).length - displayCount)}
                  </Badge>
                </Button>
              </div>
            )}
          </section>
        );

      case 'top_sellers':
        const stores = data?.topStores || [];
        const sellers = data?.topSellers || [];

        return (
          <section key="top_sellers" className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white py-16 mt-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
              <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
            </div>
            <div className="container-platform relative z-10">
              <div className="text-center mb-10 px-4 max-w-2xl mx-auto">
                <Badge className="mb-3.5 bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs px-3.5 py-1">
                  ⭐ {t('تجار شاري داي المميزين', 'ChariDay Top Merchants')}
                </Badge>
                <h2 className="text-2xl md:text-4xl font-black mb-3.5 leading-tight tracking-tight font-cairo">
                  {t('تسوق من الشركاء الموثوقين', 'Shop from Our Certified Partners')}
                </h2>
                <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                  {t('نوفر لك نخبة من كبرى المتاجر الجزائرية والتجار الأحرار الموثقين بشارات الجودة والمستويات الاحترافية.', 'We connect you with premier Algerian stores and verified independent merchants possessing professional badges.')}
                </p>
                <div className="inline-flex p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 mt-8 gap-1.5 font-cairo">
                  <button
                    onClick={() => setActiveMerchantTab('stores')}
                    className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                      activeMerchantTab === 'stores' ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]' : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    🏪 {t('المتاجر الكبرى المتميزة', 'Premium Stores')}
                  </button>
                  <button
                    onClick={() => setActiveMerchantTab('sellers')}
                    className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                      activeMerchantTab === 'sellers' ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]' : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    💼 {t('التجار المستقلون الأحرار', 'Independent Sellers')}
                  </button>
                </div>
              </div>
              {activeMerchantTab === 'stores' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 font-cairo">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-2xl bg-white/5 animate-pulse h-44" />)
                  ) : stores.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-white/50 text-sm">
                      {t('لا توجد متاجر نشطة حالياً', 'No active stores at the moment.')}
                    </div>
                  ) : (
                    stores.map((store) => (
                      <Card
                        key={store.id}
                        className="bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all cursor-pointer group text-white shadow-xl"
                        onClick={() => router.push(`/store/${store.slug || store.id}`)}
                      >
                        <CardContent className="p-5 text-center flex flex-col items-center h-full">
                          <div className="relative mb-4 w-16 h-16 shrink-0 group-hover:scale-105 transition-transform duration-300">
                            {store.logo ? (
                              <img src={store.logo} className="w-full h-full rounded-2xl object-cover border-2 border-white/20 shadow-md" alt={store.name} />
                            ) : (
                              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-bold">🏪</div>
                            )}
                            <span className="absolute -bottom-1 -end-1 text-lg">{LEVEL_BADGE[store.level] || '⭐'}</span>
                          </div>
                          <div className="grow min-w-0">
                            <h3 className="font-bold text-sm md:text-base truncate group-hover:text-amber-400 transition-colors">
                              {isAr ? store.name : (store.nameEn || store.name)}
                            </h3>
                            <p className="text-[10px] md:text-xs text-white/40 mt-1 truncate">
                              👤 {t('مدير المتجر:', 'Manager:')} {store.manager?.name || ''}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/5 w-full">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold">{store.rating.toFixed(1)}</span>
                            <span className="text-white/30 text-[10px]">•</span>
                            <span className="text-white/50 text-[10px]">{store._count?.products || 0} {t('منتج', 'products')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Render Sellers Tab */}
              {activeMerchantTab === 'sellers' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 font-cairo">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-2xl bg-white/5 animate-pulse h-44" />)
                  ) : sellers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-white/50 text-sm">
                      {t('لا يوجد تجار مستقلون حالياً', 'No active independent sellers at the moment.')}
                    </div>
                  ) : (
                    sellers.map((seller) => (
                      <Card
                        key={seller.id}
                        className="bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all cursor-pointer group text-white shadow-xl"
                        onClick={() => {
                          useAppStore.getState().setSelectedSellerId(seller.id);
                          router.push(`/sellers/${seller.id}`);
                        }}
                      >
                        <CardContent className="p-5 text-center flex flex-col items-center h-full">
                          <div className="relative mb-4 w-16 h-16 shrink-0 group-hover:scale-105 transition-transform duration-300">
                            {seller.user?.avatar ? (
                              <img src={seller.user.avatar} className="w-full h-full rounded-full object-cover border-2 border-white/20 shadow-md" alt={seller.user.name} />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl font-bold">{seller.user?.name?.charAt(0) || ''}</div>
                            )}
                            <span className="absolute -bottom-1 -end-1 text-lg" title={`Level ${seller.level}`}>{LEVEL_BADGE[seller.level] || '⭐'}</span>
                          </div>
                          <div className="grow min-w-0">
                            <h3 className="font-bold text-sm md:text-base truncate group-hover:text-amber-400 transition-colors">
                              {seller.storeName || seller.user?.name}
                            </h3>
                            <p className="text-[10px] md:text-xs text-white/40 mt-1 truncate">
                              💼 {t('تاجر مستقل معتمد', 'Certified Freelance Merchant')}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/5 w-full">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold">{seller.rating.toFixed(1)}</span>
                            <span className="text-white/30 text-[10px]">•</span>
                            <span className="text-white/50 text-[10px]">{seller._count?.products || 0} {t('منتج', 'products')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 gap-2"
                  onClick={() => setActiveMerchantTab(activeMerchantTab === 'stores' ? 'sellers' : 'stores')}
                >
                  {t('عرض جميع التجار', 'View All Merchants')}
                </Button>
              </div>
            </div>
          </section>
        );

      case 'testimonials':
        return (
          <section key="testimonials" className="container-platform py-14">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">{t('آراء عملائنا', 'Customer Reviews')}</Badge>
              <h2 className="text-3xl font-black mb-2">{t('ماذا قالوا عنا؟', 'What They Said About Us?')}</h2>
              <p className="text-muted-foreground">{t('آراء حقيقية من مشترين حقيقيين', 'Real reviews from real buyers')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(data?.testimonials?.length ? data.testimonials : DEFAULT_TESTIMONIALS)
                .filter((t2) => t2 && typeof t2 === 'object')
                .map((t2, i) => (
                  <Card key={i} className="border-border hover:shadow-lg transition-all">
                    <CardContent className="p-5">
                      <Quote className="size-6 text-primary/30 mb-3" />
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t2.text || ''}"</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{t2.name || ''}</p>
                          <p className="text-xs text-muted-foreground">{t2.city || ''}</p>
                        </div>
                        <StarRating rating={Number(t2.rating) || 5} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key="cta" className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20 py-10 md:py-14">
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
        );

      default:
        return null;
    }
  };

  const defaultLayout = ['hero', 'features', 'categories', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
  const activeLayout = Array.isArray(data?.layout) && data.layout.length > 0
    ? data.layout
    : defaultLayout;

  return (
    <div className="min-h-screen">
      {/* ── TOP AD BANNER ── */}
      {data?.advertisements?.banner_top && (
        <div className="h-14 w-full">
          <AdBanner ads={data.advertisements.banner_top} className="h-full" />
        </div>
      )}

      {/* Render Dynamic Order of Sections */}
      {activeLayout.map((sectionName) => renderSection(sectionName))}

      {/* ── BOTTOM AD ── */}
      {data?.advertisements?.banner_bottom && (
        <div className="container-platform mb-10">
          <AdBanner ads={data.advertisements.banner_bottom} className="h-28" />
        </div>
      )}
    </div>
  );
}
