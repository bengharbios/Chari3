'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Star, TrendingUp, Shield, Truck, 
  ArrowLeft, ArrowRight, ShoppingBag, Award, Quote, SlidersHorizontal, 
  X, Search, Tag, ShoppingCart, Flame, Sparkles, CheckCircle2 
} from 'lucide-react';

const safeImageSrc = (img: any): string => {
  if (!img) return '';
  if (Array.isArray(img)) return img[0] || '';
  if (typeof img === 'string') {
    if (img.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(img);
        return Array.isArray(parsed) ? parsed[0] || '' : img;
      } catch (e) {
        return img;
      }
    }
    return img;
  }
  return '';
};

import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  HeroSliderSkeleton, CategoryCirclesSkeleton, BentoPromoGridSkeleton, 
  ProductSliderSkeleton 
} from './SkeletonLoaders';
import "@measured/puck/puck.css";





export interface SectionProps {
  section: any;
  data: any;
  locale: string;
}

        {discount > 0 && (
          <Badge className="absolute top-2.5 start-2.5 bg-rose-600 text-white text-[9px] font-black py-0.5 px-2 rounded-full shadow-sm">-{discount}%</Badge>
        )}
      </div>
      <CardContent className="p-3 flex flex-col grow text-start">
        <p className="text-[9px] text-muted-foreground mb-0.5 truncate">{product.category?.name || ''}</p>
        <h4 className="text-xs font-bold line-clamp-2 mb-1.5 text-slate-850 dark:text-slate-100 leading-tight min-h-[32px]">{isAr ? product.name : (product.nameEn || product.name)}</h4>
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.rating} />
          <span className="text-[9px] text-muted-foreground font-bold">({product.soldCount || 8})</span>
        </div>
        <div className="mt-auto">
          <div className="flex items-center justify-between gap-1">
            <div className="w-full">
              <p className="text-xs md:text-sm font-black text-amber-500 tracking-tight">{fmt(product.price)}</p>
              {product.comparePrice && (
                <p className="text-[9px] text-muted-foreground line-through font-semibold">{fmt(product.comparePrice)}</p>
              )}
            </div>
            <Button 
              size="icon" 
              variant={isInCart ? "default" : "secondary"} 
              className={`rounded-full shrink-0 size-7 shadow ${isInCart ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-850'}`}
              onClick={handleAddToCart}
            >
              {isInCart ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            </Button>
          </div>
          
          {sellerName && !isOfferCard && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 gap-1 text-[9px] text-muted-foreground">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs shrink-0">{LEVEL_BADGE[sellerLevel] || '🌱'}</span>
                <span className="font-bold text-foreground/80 truncate">{sellerName}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getLocalizedField(obj: any, fieldName: string, locale: string, fallbackField?: string): string {
  if (!obj) return '';

  const suffix = locale.charAt(0).toUpperCase() + locale.slice(1);
  const localizedKey = `${fieldName}${suffix}`;

  if (obj[localizedKey] !== undefined && obj[localizedKey] !== null && obj[localizedKey] !== '') {
    return String(obj[localizedKey]);
  }

  if (obj.metadata && typeof obj.metadata === 'object') {
    if (obj.metadata[localizedKey] !== undefined && obj.metadata[localizedKey] !== null && obj.metadata[localizedKey] !== '') {
      return String(obj.metadata[localizedKey]);
    }
  }

  if (locale === 'fr') {
    const enKey = `${fieldName}En`;
    if (obj[enKey] !== undefined && obj[enKey] !== null && obj[enKey] !== '') {
      return String(obj[enKey]);
    }
    if (obj.metadata && typeof obj.metadata === 'object') {
      if (obj.metadata[enKey] !== undefined && obj.metadata[enKey] !== null && obj.metadata[enKey] !== '') {
        return String(obj.metadata[enKey]);
      }
    }
  }

  const arKey = `${fieldName}Ar`;
  if (obj[arKey] !== undefined && obj[arKey] !== null && obj[arKey] !== '') {
    return String(obj[arKey]);
  }
  if (obj.metadata && typeof obj.metadata === 'object') {
    if (obj.metadata[arKey] !== undefined && obj.metadata[arKey] !== null && obj.metadata[arKey] !== '') {
      return String(obj.metadata[arKey]);
    }
  }

  if (obj[fieldName] !== undefined && obj[fieldName] !== null && obj[fieldName] !== '') {
    return String(obj[fieldName]);
  }
  if (obj.metadata && typeof obj.metadata === 'object') {
    if (obj.metadata[fieldName] !== undefined && obj.metadata[fieldName] !== null && obj.metadata[fieldName] !== '') {
      return String(obj.metadata[fieldName]);
    }
  }

  if (fallbackField && obj[fallbackField] !== undefined && obj[fallbackField] !== null && obj[fallbackField] !== '') {
    return String(obj[fallbackField]);
  }

  return '';
}

interface SectionHeaderProps {
  section: any;
  isAr: boolean;
  locale: string;
  t: (ar: string, en: string) => string;
  children?: React.ReactNode;
}

function CategoryProductsRow({
  categoryId,
  section,
  locale,
  layoutStyle = 'carousel',
  storeId,
  sellerId,
  filterType = 'newest',
  children
}: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const title = getLocalizedField(section, 'title', locale, 'type');
  const badge = getLocalizedField(section, 'badge', locale);
  const isAr = locale === 'ar';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const params = new URLSearchParams({
      status: 'active',
      limit: '10',
      sort: filterType
    });
    if (categoryId) params.set('categoryId', categoryId);
    if (storeId) params.set('storeId', storeId);
    if (sellerId) params.set('sellerId', sellerId);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d.products) {
          setProducts(d.products);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categoryId, storeId, sellerId, filterType]);

  return (
    <div className="container-platform py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-black text-navy dark:text-white font-cairo">
            {title || section?.type}
          </h3>
          {badge && (
            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold">{badge}</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {section?.metadata?.enableTimer && section?.metadata?.timerEndDate && (
            <CountdownTimer targetDate={section.metadata.timerEndDate} />
          )}
          {children}
        </div>
      </div>

      {isLoading ? (
        <ProductSliderSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-xs bg-white/40 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          {isAr ? 'لا توجد منتجات حالياً في هذا القسم' : 'No products available in this section'}
        </div>
      ) : layoutStyle === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
          {products.map((p: any) => (
            <div key={p.id} className="w-[180px] md:w-[220px] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCirclesRow({ categoryId, section, locale }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isAr = locale === 'ar';

  useEffect(() => {
    if (!categoryId) return;
    let isMounted = true;
    setIsLoading(true);
    fetch(`/api/categories?parentId=${categoryId}`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d.success) {
          setCategories(d.categories || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  if (!categoryId) return null;
  const title = getLocalizedField(section, 'title', locale) || (isAr ? 'التصنيفات الفرعية' : 'Subcategories');

  return (
    <section className="container-platform py-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-black text-navy dark:text-white font-cairo">{title}</h3>
      </div>
      {isLoading ? (
        <CategoryCirclesSkeleton />
      ) : categories.length === 0 ? (
        <p className="text-xs text-muted-foreground">{isAr ? 'لا توجد تصنيفات فرعية' : 'No subcategories available'}</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?categoryId=${cat.id}`}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-[22px] bg-white/70 dark:bg-slate-950/70 border border-border/80 hover:border-amber-500/30 hover:scale-105 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 shrink-0 snap-start select-none"
              style={{ minWidth: '92px' }}
            >
              <span className="text-2xl drop-shadow-sm select-none">{cat.icon || '📦'}</span>
              <span className="text-[10px] font-bold text-center leading-tight line-clamp-1 max-w-[80px]">
                {isAr ? cat.name : (cat.nameEn || cat.name)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function HeroSliderBlock({ section, data, locale }: SectionProps) {
  const isAr = locale === 'ar';
  const rawSlides = data?.heroSlides ?? [];
  const validSlides = Array.isArray(rawSlides)
    ? rawSlides.filter((s: any) => s && typeof s === 'object' && (s.title || s.titleEn))
    : [];
  const currentHeroSlides = validSlides.length > 0 ? validSlides : DEFAULT_HERO_SLIDES;
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!currentHeroSlides.length) return;
    const interval = setInterval(() => setHeroIndex((i) => (i + 1) % currentHeroSlides.length), 6000);
    return () => clearInterval(interval);
  }, [currentHeroSlides]);

  if (currentHeroSlides.length === 0) return null;
  const slide = currentHeroSlides[heroIndex];
  
  return (
    <section className="container-platform py-6 overflow-hidden relative font-cairo">
      <div className="relative w-full h-[400px] md:h-[500px] rounded-[32px] overflow-hidden group shadow-2xl">
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg || 'from-slate-900 to-indigo-950'} opacity-100 transition-colors duration-1000`} />
        {slide.image && (
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img src={safeImageSrc(slide.image)} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        
        <div className="relative h-full flex flex-col justify-center px-8 md:px-16 md:w-2/3">
          <Badge className="w-fit mb-6 bg-white/10 text-white hover:bg-white/20 border-white/20 px-4 py-1.5 text-xs md:text-sm shadow-xl backdrop-blur-md">
            {locale === 'ar' ? slide.badge : (slide.badgeFr || slide.badgeEn || slide.badge)}
          </Badge>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg tracking-tight">
            {locale === 'ar' ? slide.title : (slide.titleFr || slide.titleEn || slide.title)}
          </h2>
          <p className="text-base md:text-2xl text-slate-200 mb-10 max-w-xl font-medium leading-relaxed drop-shadow">
            {locale === 'ar' ? slide.subtitle : (slide.subtitleFr || slide.subtitleEn || slide.subtitle)}
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-black px-8 py-6 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-1 text-base">
              {locale === 'ar' ? slide.cta : (slide.ctaFr || slide.ctaEn || slide.cta)}
              <ArrowLeft className="ml-2 size-5 rtl:hidden" />
              <ArrowRight className="mr-2 size-5 ltr:hidden" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {currentHeroSlides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === heroIndex ? 'w-8 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesBlock({ section, data, locale }: SectionProps) {
  return (
    <section className="container-platform py-2">
      <div className="bg-white/50 dark:bg-slate-900/50 border border-border/80 rounded-[24px] backdrop-blur-md p-5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
                <f.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{locale === 'ar' ? f.title : locale === 'fr' ? (f.titleFr || f.titleEn || f.title) : (f.titleEn || f.title)}</p>
                <p className="hidden md:block text-[10px] text-muted-foreground mt-0.5">{locale === 'ar' ? f.desc : locale === 'fr' ? (f.descFr || f.descEn || f.desc) : (f.descEn || f.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


export function SectionHeader({ section, isAr, locale, t, children }: any) {
  const title = isAr ? section.titleAr : (section.titleEn || section.titleAr);
  const metadata = section.metadata || {};
  const hasBackground = metadata.backgroundColor && metadata.backgroundColor !== 'transparent';
  return (
    <div className="flex justify-between items-end mb-5">
      <div className="flex items-center gap-3">
        {hasBackground && (
          <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 dark:text-slate-100 flex items-center gap-2">
            {title}
          </h2>
          {metadata.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{metadata.subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function CategoryCirclesRowBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  const displayCats = (data?.categories ?? []).filter((c: any) => c && c.id).slice(0, 12);
  const [filterCategory, setFilterCategory] = useState('');

  return (
    <section className="container-platform py-6">
      <SectionHeader section={section} isAr={isAr} locale={locale} t={t}>
        {filterCategory && (
          <Button variant="ghost" size="sm" className="text-destructive gap-1 text-xs" onClick={() => setFilterCategory('')}>
            <X className="size-3" />
            {(locale === 'ar' ? 'مسح التصفية' : 'Clear Filter')}
          </Button>
        )}
      </SectionHeader>
      {displayCats.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-[24px] border border-border/60">
          <ShoppingBag className="size-10 mx-auto mb-2 opacity-25" />
          <p className="text-sm">{(locale === 'ar' ? 'لا توجد أقسام متاحة حتى الآن' : 'No categories available yet')}</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
          {displayCats.map((cat: any) => {
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(isActive ? '' : cat.id)}
                className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-[22px] transition-all duration-300 shrink-0 snap-start select-none ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 scale-105 shadow-md font-bold'
                    : 'bg-white/70 dark:bg-slate-950/70 border border-border/80 hover:border-amber-500/30 hover:scale-105 hover:bg-white dark:hover:bg-slate-900'
                }`}
                style={{ minWidth: '92px' }}
              >
                <span className="text-2xl drop-shadow-sm select-none">{cat.icon || '📦'}</span>
                <span className="text-[10px] font-bold text-center leading-tight line-clamp-1 max-w-[80px]">
                  {isAr ? cat.name : (cat.nameEn || cat.name)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function BentoOffersBlock({ section, data, locale }: SectionProps) {
  const { t: globalT } = useTranslation();
  const isAr = locale === 'ar';
  const router = useRouter();

  const getLocalizedField = (section: any, field: string, locale: string) => {
    if (!section?.metadata) return null;
    if (locale === 'ar') return section.metadata[`${field}Ar`] || section.metadata[field];
    if (locale === 'fr') return section.metadata[`${field}Fr`] || section.metadata[`${field}En`] || section.metadata[field];
    return section.metadata[`${field}En`] || section.metadata[field];
  };

  const hasCountdown = section.metadata?.enableTimer || data?.countdownConfig?.enabled || false;
  const bentoLimit = section.limit || 8;
  const timerProducts = (data?.bentoCenterProducts?.length ?? 0) > 0 
    ? data!.bentoCenterProducts!.slice(0, bentoLimit)
    : (data?.featuredProducts || []).slice(0, bentoLimit);
  
  const rightCardProducts = (data?.bentoRightProducts?.length ?? 0) > 0 
    ? data!.bentoRightProducts!.slice(0, 4) 
    : (data?.featuredProducts || []).slice(2, 6);
    
  const leftCardProducts = (data?.bentoLeftProducts?.length ?? 0) > 0 
    ? data!.bentoLeftProducts!.slice(0, 2) 
    : (data?.featuredProducts || []).slice(6, 8);

  const rightCardType = section.metadata?.rightCardType || 'products';
  const rightCardAdImage = getLocalizedField(section, 'rightCardAdImage', locale);
  const rightCardAdLink = section.metadata?.rightCardAdLink || '#';

  const centerCardType = section.metadata?.centerCardType || 'products';
  const centerCardAdImage = getLocalizedField(section, 'centerCardAdImage', locale);
  const centerCardAdLink = section.metadata?.centerCardAdLink || '#';

  const leftCardType = section.metadata?.leftCardType || 'products';
  const leftCardAdImage = getLocalizedField(section, 'leftCardAdImage', locale);
  const leftCardAdLink = section.metadata?.leftCardAdLink || '#';

  const customText1 = getLocalizedField(section, 'customText1', locale)
    || (locale === 'ar' ? (globalT('homepage.noonItMore') || 'نزلنا الأسعار وتوفر أكثر! تسوق من تشكيلة واسعة') : 'Shop more & save on what you love');
    
  const customText2 = getLocalizedField(section, 'customText2', locale)
    || (locale === 'ar' ? (globalT('homepage.onSale') || 'تنزيلات كبرى') : 'Hot Deals');

  const sectionBadge = getLocalizedField(section, 'badge', locale);

  return (
    <section className="container-platform py-6 font-cairo">
      {sectionBadge && (
        <div className="flex justify-center mb-4">
          <Badge className="bg-amber-500 text-white text-xs font-bold py-1 px-3 shadow-md border-0">{sectionBadge}</Badge>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-5 h-auto xl:h-[460px]">
        {/* Banner Side 1: Yellow/Amber */}
        <div className="w-full xl:w-[260px] flex flex-row xl:flex-col gap-4 shrink-0">
          <div 
            className="flex-1 rounded-[24px] bg-amber-300 flex items-center justify-center text-amber-900 border border-amber-400 overflow-hidden relative group hover:scale-[1.02] transition-transform cursor-pointer"
            onClick={() => router.push(rightCardType === 'ad' ? rightCardAdLink : '#')}
          >
            {rightCardType === 'ad' && rightCardAdImage ? (
              <img src={safeImageSrc(rightCardAdImage)} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="p-4 text-center">
                <h4 className="text-xl font-black uppercase tracking-wider">{customText2}</h4>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {rightCardProducts.slice(0,4).map((p: any) => (
                    <div key={p.id} className="bg-white rounded-xl p-1 shadow-sm aspect-square">
                      <img src={safeImageSrc(p.images)} className="w-full h-full object-cover rounded-lg" alt="" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Mega Offers with Timer */}
        <div className="flex-1 rounded-[24px] bg-white dark:bg-slate-900 border border-border overflow-hidden flex flex-col xl:flex-row">
          <div className="w-full xl:w-[280px] bg-amber-50 dark:bg-slate-950 p-6 flex flex-col justify-center border-b xl:border-b-0 xl:border-e border-border/60">
            <h3 className="text-2xl font-black mb-2 text-slate-800 dark:text-slate-100">{isAr ? section.titleAr || 'عروض ميجا' : section.titleEn || 'Mega Offers'}</h3>
            <p className="text-sm text-muted-foreground mb-6 font-medium">{customText1}</p>
            {hasCountdown && data?.countdownConfig?.endDate && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  {isAr ? data.countdownConfig.titleAr : data.countdownConfig.titleEn}
                </p>
                <CountdownTimer targetDate={data.countdownConfig.endDate} />
              </div>
            )}
            <Button className="w-full bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 rounded-xl font-bold">
              {isAr ? 'عرض الكل' : 'View All'}
            </Button>
          </div>
          <div className="flex-1 p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-full">
              {timerProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        {/* Banner Side 2: Dark indigo glassmorphism */}
        <div className="w-full xl:w-[260px] flex flex-row xl:flex-col gap-4 shrink-0">
          <div 
            className="flex-1 rounded-[24px] bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col justify-between border border-white/5 shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-all cursor-pointer" 
            onClick={() => router.push(leftCardType === 'ad' ? leftCardAdLink : '#')}
          >
            {leftCardType === 'ad' && leftCardAdImage ? (
              <>
                <img src={safeImageSrc(leftCardAdImage)} className="absolute inset-0 w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/10 hover:bg-black/25 transition-colors" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-white/5 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                <div className="z-10 p-5 text-start">
                  <Badge className="bg-white/10 text-white border-white/10 text-[8px] font-bold py-0.5 px-2 mb-1.5 select-none">{sectionBadge}</Badge>
                  <h4 className="text-sm font-black leading-snug">{customText2}</h4>
                </div>
                <div className="z-10 flex justify-between items-center p-5 mt-3">
                  <span className="text-[10px] font-black underline text-amber-400">{isAr ? 'تسوق الآن' : 'Shop Now'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoryProductsRowBlock({ section, data, locale, categoryId, storeId, sellerId, filterType, layoutStyle }: any) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  
  // Logic to fetch and show products based on props, fallback to data.featuredProducts
  const products = data?.featuredProducts || [];
  
  return (
    <section className="container-platform py-6">
      <SectionHeader section={section} isAr={isAr} locale={locale} t={t} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {products.slice(0, section.limit || 10).map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function FeaturedProductsGridBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  const products = data?.featuredProducts || [];
  
  return (
    <section className="container-platform py-6">
      <SectionHeader section={section} isAr={isAr} locale={locale} t={t} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {products.slice(0, section.limit || 10).map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function TopSellersBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  const stores = (data?.topStores || []).slice(0, section.limit || 8);
  const sellers = (data?.topSellers || []).slice(0, section.limit || 8);
  const [activeTab, setActiveTab] = useState<'stores'|'sellers'>('stores');
  
  const getLocalizedField = (s: any, field: string, l: string) => {
    if (!s?.metadata) return null;
    return s.metadata[`${field}${l === 'ar' ? 'Ar' : 'En'}`] || s.metadata[field];
  };

  return (
    <section className="bg-gradient-to-br from-stone-950 via-slate-900 to-indigo-950 text-white py-16 mt-12 relative overflow-hidden border-y border-white/5">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
      </div>
      <div className="container-platform relative z-10">
        <div className="text-center mb-10 px-4 max-w-2xl mx-auto">
          <Badge className="mb-3.5 bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs px-3.5 py-1.5 rounded-full select-none">
            {getLocalizedField(section, 'badge', locale) || (locale === 'ar' ? 'أفضل المتاجر' : 'Top Stores')}
          </Badge>
          <h3 className="text-2xl md:text-4xl font-black mb-3.5 leading-tight tracking-tight font-cairo">
            {getLocalizedField(section, 'title', locale) || (locale === 'ar' ? 'تسوق من شركائنا' : 'Shop from Partners')}
          </h3>
          <div className="inline-flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mt-8 gap-1.5 font-cairo select-none">
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all ${
                activeTab === 'stores' ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              🏢 {(locale === 'ar' ? 'المتاجر' : 'Stores')}
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all ${
                activeTab === 'sellers' ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              👤 {(locale === 'ar' ? 'التجار' : 'Sellers')}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 font-cairo">
          {(activeTab === 'stores' ? stores : sellers).map((item: any) => (
            <Link key={item.id} href={`/${activeTab === 'stores' ? 'store' : 'seller'}/${item.slug}`} className="group block">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-1 h-full flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-amber-500 p-0.5 mb-3">
                  <img src={safeImageSrc(item.logo || item.image)} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1 line-clamp-1">{item.name || item.storeName}</h4>
                <div className="flex items-center gap-1.5 mb-2 bg-black/20 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold">{item.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  const testimonials = data?.testimonials?.length > 0 ? data.testimonials : DEFAULT_TESTIMONIALS;
  
  return (
    <section className="container-platform py-12">
      <SectionHeader section={section} isAr={isAr} locale={locale} t={t} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.slice(0, 3).map((item: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-border/80 rounded-2xl p-6 shadow-sm">
            <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
            <p className="text-sm font-medium mb-6 text-slate-700 dark:text-slate-300">
              {isAr ? item.text : item.textEn || item.text}
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold">
                {(isAr ? item.name : item.nameEn || item.name).charAt(0)}
              </div>
              <div>
                <h5 className="font-bold text-sm">{isAr ? item.name : item.nameEn || item.name}</h5>
                <StarRating rating={item.rating || 5} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CtaBlock({ section, data, locale }: SectionProps) {
  const { t } = useTranslation();
  const isAr = locale === 'ar';
  
  return (
    <section className="container-platform py-8">
      <div className="bg-amber-500 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 text-slate-950 md:w-2/3">
          <h3 className="text-3xl md:text-4xl font-black mb-4">{isAr ? section.titleAr || 'ابدأ البيع الآن!' : section.titleEn || 'Start Selling Now!'}</h3>
          <p className="text-sm md:text-base font-medium opacity-80 max-w-xl">
            {(locale === 'ar' ? 'انضم إلى آلاف البائعين' : 'Join thousands of sellers')}
          </p>
        </div>
        <div className="relative z-10 flex gap-4 w-full md:w-auto">
          <Button size="lg" className="bg-slate-950 text-white hover:bg-slate-800 rounded-xl w-full md:w-auto">
            {(locale === 'ar' ? 'سجل الآن' : 'Register Now')}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function CustomBannerBlock({ section, data, locale }: SectionProps) {
  const isAr = locale === 'ar';
  const imgUrl = isAr ? section.imageArUrl : (section.imageEnUrl || section.imageArUrl);
  if (!imgUrl) return null;
  
  return (
    <section className="container-platform py-4">
      <Link href={section.linkUrl || '#'} className="block rounded-2xl overflow-hidden group">
        <img src={safeImageSrc(imgUrl)} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500" alt="" />
      </Link>
    </section>
  );
}
