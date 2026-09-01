'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Star, TrendingUp, Shield, Truck, 
  ArrowLeft, ArrowRight, ShoppingBag, Award, Quote, SlidersHorizontal, 
  X, Search, Tag, ShoppingCart, Flame, Sparkles, CheckCircle2 
} from 'lucide-react';
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
import { Render } from '@measured/puck';
import { getSaadaConfig } from '@/lib/puck/PuckConfig';
import "@measured/puck/puck.css";
import { toast } from 'sonner';
import ProductCard from './ProductCard';

const CURRENCY = { symbol: 'د.ج', code: 'DZD' };

// Fallback only — actual values are stored in DB setting `homepage_trending_searches` and managed from admin panel
const DEFAULT_TRENDING_SEARCHES_AR = [
  "هواتف ذكية", "أجهزة كهرومنزلية", "ملابس", "عطور", "مستحضرات تجميل",
  "أحذية", "ديكور البيت", "إكسسوارات", "أدوات مطبخ"
];
const DEFAULT_TRENDING_SEARCHES_EN = [
  "Smartphones", "Home Appliances", "Clothing", "Perfumes", "Cosmetics",
  "Shoes", "Home Decor", "Accessories", "Kitchenware"
];
const DEFAULT_TRENDING_SEARCHES_FR = [
  "Smartphones", "Électroménager", "Vêtements", "Parfums", "Cosmétiques",
  "Chaussures", "Déco maison", "Accessoires", "Ustensiles de cuisine"
];

function fmt(amount: number) {
  return `${amount.toLocaleString('ar-DZ')} ${CURRENCY.symbol}`;
}

const DEFAULT_HERO_SLIDES = [
  {
    id: '1',
    title: 'تسوق بثقة',
    titleEn: 'Shop with Confidence',
    titleFr: 'Achetez en toute confiance',
    subtitle: 'آلاف المنتجات من تجار موثوقين في الجزائر',
    subtitleEn: 'Thousands of products from verified Algerian sellers',
    subtitleFr: 'Des milliers de produits de vendeurs algériens vérifiés',
    bg: 'from-blue-950 via-indigo-900 to-slate-900',
    badge: '🔥 العروض الحصرية',
    badgeFr: '🔥 Offres exclusives',
    cta: 'تسوق الآن',
    ctaFr: 'Acheter maintenant',
  },
  {
    id: '2',
    title: 'توصيل سريع',
    titleEn: 'Fast Delivery',
    titleFr: 'Livraison rapide',
    subtitle: 'نوصل لجميع ولايات الجزائر خلال 24-72 ساعة',
    subtitleEn: 'Delivery to all wilayas within 24-72 hours',
    subtitleFr: 'Livraison dans toutes les wilayas en 24-72 heures',
    bg: 'from-emerald-950 via-teal-900 to-slate-900',
    badge: '🚀 توصيل سريع',
    badgeFr: '🚀 Livraison rapide',
    cta: 'اكتشف المزيد',
    ctaFr: 'Découvrir plus',
  },
  {
    id: '3',
    title: 'ضمان الجودة',
    titleEn: 'Quality Guarantee',
    titleFr: 'Garantie de qualité',
    subtitle: 'جميع المنتجات مضمونة وقابلة للإرجاع',
    subtitleEn: 'All products are guaranteed with easy returns',
    subtitleFr: 'Tous les produits sont garantis avec retour facile',
    bg: 'from-purple-950 via-violet-900 to-slate-900',
    badge: '✅ ضمان الجودة',
    badgeFr: '✅ Garantie de qualité',
    cta: 'ابدأ التسوق',
    ctaFr: 'Commencer vos achats',
  },
];

const DEFAULT_TESTIMONIALS: any[] = [];

const FEATURES = [
  { 
    icon: Shield, 
    title: 'توثيق كامل', 
    titleEn: 'Full Verification',
    titleFr: 'Vérification complète',
    desc: 'جميع التجار موثقون رسمياً',
    descEn: 'All merchants are officially verified',
    descFr: 'Tous les vendeurs sont officiellement vérifiés'
  },
  { 
    icon: Truck, 
    title: 'توصيل لكل ولاية', 
    titleEn: 'Delivery to All Wilayas',
    titleFr: 'Livraison à toutes les wilayas',
    desc: '58 ولاية مغطاة في الجزائر',
    descEn: '58 wilayas covered in Algeria',
    descFr: '58 wilayas couvertes en Algérie'
  },
  { 
    icon: Award, 
    title: 'ضمان الجودة', 
    titleEn: 'Quality Guarantee',
    titleFr: 'Garantie de qualité',
    desc: 'إرجاع مجاني خلال 14 يوم',
    descEn: 'Free return within 14 days',
    descFr: 'Retour gratuit sous 14 jours'
  },
  { 
    icon: TrendingUp, 
    title: 'أفضل الأسعار', 
    titleEn: 'Best Prices',
    titleFr: 'Meilleurs prix',
    desc: 'مقارنة أسعار فورية بين التجار',
    descEn: 'Instant price comparison between sellers',
    descFr: 'Comparaison instantanée des prix entre vendeurs'
  },
];

interface HomepageData {
  categories: { id: string; name: string; nameEn?: string; icon?: string; image?: string }[];
  featuredProducts: any[];
  bentoRightProducts?: any[];
  bentoLeftProducts?: any[];
  bentoCenterProducts?: any[];
  topSellers: any[];
  topStores: any[];
  advertisements: Record<string, any[]>;
  testimonials: any[];
  layout?: string[];
  heroSlides?: any[];
  globalCouponCampaigns?: any[];
  countdownConfig?: { enabled: boolean; endDate: string; titleAr: string; titleEn: string };
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

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { locale } = useAppStore();
  const isAr = locale === 'ar';

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2 font-mono direction-ltr justify-center select-none" dir="ltr">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <div className="bg-amber-500 text-slate-950 font-black text-sm md:text-base px-2.5 py-1.5 rounded-lg shadow-inner min-w-[34px] text-center">
            {timeLeft.days}
          </div>
          <span className="text-[10px] text-muted-foreground font-bold mt-1">{isAr ? 'يوم' : 'd'}</span>
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="bg-slate-900 text-amber-400 border border-amber-500/20 font-black text-sm md:text-base px-2.5 py-1.5 rounded-lg shadow-inner min-w-[34px] text-center">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <span className="text-[10px] text-muted-foreground font-bold mt-1">{isAr ? 'ساعة' : 'h'}</span>
      </div>
      <span className="text-amber-500 font-bold mb-5">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-slate-900 text-amber-400 border border-amber-500/20 font-black text-sm md:text-base px-2.5 py-1.5 rounded-lg shadow-inner min-w-[34px] text-center">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <span className="text-[10px] text-muted-foreground font-bold mt-1">{isAr ? 'دقيقة' : 'm'}</span>
      </div>
      <span className="text-amber-500 font-bold mb-5">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-slate-900 text-amber-400 border border-amber-500/20 font-black text-sm md:text-base px-2.5 py-1.5 rounded-lg shadow-inner min-w-[34px] text-center animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <span className="text-[10px] text-muted-foreground font-bold mt-1">{isAr ? 'ثانية' : 's'}</span>
      </div>
    </div>
  );
}

function AdBanner({ ads, className = '' }: { ads?: any[]; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ads || ads.length <= 1 || !scrollRef.current) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Scroll logic (RTL aware): if we reach the end, reset.
        if (Math.abs(scrollLeft) + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // A simple workaround for LTR/RTL is to scroll by clientWidth
          // Positive scrollBy left moves right in LTR and left in RTL (sometimes)
          const dir = document.documentElement.dir === 'rtl' ? -1 : 1;
          scrollRef.current.scrollBy({ left: clientWidth * dir, behavior: 'smooth' });
        }
      }
    }, 4500);
    
    return () => clearInterval(interval);
  }, [ads]);

  if (!ads || ads.length === 0) return null;

  return (
    <div className={`relative w-full overflow-hidden rounded-none md:rounded-md bg-stone-900 ${className}`}>
      <div 
        ref={scrollRef}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth"
      >
        {ads.map((ad, idx) => (
          <a 
            key={ad.id || idx}
            href={ad.linkUrl || '#'} 
            className="flex-shrink-0 w-full h-full snap-center block relative" 
            onClick={() => fetch(`/api/admin/advertisements`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ad.id, clicks: 1 }) }).catch(() => {})}
          >
            {ad.imageUrl ? (
              <img src={ad.imageUrl} alt={ad.title || 'Ad'} className="w-full h-full object-cover object-center hover:opacity-95 transition-opacity" />
            ) : (
              <div className="relative w-full h-full min-h-[60px] bg-gradient-to-r from-stone-900 via-stone-850 to-indigo-950 flex items-center justify-center p-2 sm:p-4 md:p-6">
                <div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                <p className="text-amber-400 font-black text-sm md:text-lg tracking-wider text-center px-4">{ad.title}</p>
                <Badge className="absolute top-1 end-1 md:top-3 md:end-3 bg-white/10 text-white border-white/10 text-[8px] md:text-[10px]">إعلان</Badge>
              </div>
            )}
          </a>
        ))}
      </div>
      
      {/* Pagination dots if more than 1 ad */}
      {ads.length > 1 && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 pointer-events-none">
          {ads.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50" />
          ))}
        </div>
      )}
    </div>
  );
}

const LEVEL_BADGE: Record<number, string> = {
  1: '🌱', 2: '⭐', 3: '🌟', 4: '💫', 5: '🔥',
  6: '💎', 7: '👑', 8: '🏆', 9: '🦅', 10: '🌠',
};

// Standalone reusable Product Card matching Noon/Temu visuals
// ProductCard component removed and imported from ./ProductCard.tsx

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

function SectionHeader({ section, isAr, locale, t, children }: SectionHeaderProps) {
  let title = getLocalizedField(section, 'title', locale);
  if (!title && section?.type) {
    const defaultTitles: Record<string, {ar: string, en: string}> = {
      hero: { ar: 'الرئيسية', en: 'Hero' },
      features: { ar: 'ميزات المنصة', en: 'Features' },
      categories: { ar: 'أيقونات التصنيفات', en: 'Categories' },
      bento_offers: { ar: 'عروض حصرية', en: 'Exclusive Offers' },
      featured_products: { ar: 'منتجات مميزة', en: 'Featured Products' },
      top_sellers: { ar: 'أفضل المتاجر', en: 'Top Stores' },
      testimonials: { ar: 'آراء العملاء', en: 'Testimonials' },
      cta: { ar: 'انضم إلينا', en: 'Join Us' },
      category_products: { ar: 'منتجات التصنيف', en: 'Category Products' },
    };
    title = defaultTitles[section.type] ? (isAr ? defaultTitles[section.type].ar : defaultTitles[section.type].en) : section.type;
  }

  const badge = getLocalizedField(section, 'badge', locale);
  const desc = getLocalizedField(section, 'description', locale);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-black text-navy dark:text-white font-cairo">
            {title}
          </h3>
          {badge && (
            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold">
              {badge}
            </Badge>
          )}
        </div>
        {desc && (
          <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

function CategoryProductsRow({
  categoryId,
  section,
  locale,
  layoutStyle = 'carousel',
  storeId,
  sellerId,
  filterType = 'newest',
  newArrivalThresholdDays,
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} newArrivalThresholdDays={newArrivalThresholdDays} />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
          {products.map((p: any) => (
            <div key={p.id} className="w-[180px] md:w-[220px] shrink-0 snap-start">
              <ProductCard product={p} newArrivalThresholdDays={newArrivalThresholdDays} />
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

  const renderCategoryIcon = (iconStr: string) => {
    if (!iconStr) return '📦';
    const textToEmoji: Record<string, string> = {
      'trophy': '🏆', 'sparkles': '✨', 'star': '⭐', 'heart': '❤️',
      'shopping-bag': '🛍️', 'home': '🏠', 'car': '🚗', 'smartphone': '📱',
      'laptop': '💻', 'shirt': '👕', 'coffee': '☕', 'watch': '⌚',
      'camera': '📷', 'headphones': '🎧', 'book': '📚', 'gift': '🎁'
    };
    const normalized = iconStr.trim().toLowerCase();
    if (textToEmoji[normalized]) return textToEmoji[normalized];
    if (iconStr.length > 3) return '📦';
    return iconStr;
  };

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
              className="flex flex-col items-center justify-start gap-3 p-4 rounded-[28px] bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border border-white/40 dark:border-white/10 hover:border-amber-400/50 hover:shadow-[0_15px_35px_-10px_rgba(245,158,11,0.2)] hover:-translate-y-2 hover:bg-white dark:hover:bg-slate-900 transition-all duration-500 shrink-0 snap-start select-none group relative overflow-hidden"
              style={{ minWidth: '100px', maxWidth: '110px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-orange-500/0 group-hover:from-amber-400/10 group-hover:to-orange-500/5 transition-colors duration-500" />
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors duration-500 relative z-10 overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="text-3xl drop-shadow-sm select-none group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    {renderCategoryIcon(cat.icon)}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-black text-center leading-tight line-clamp-2 text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-500 relative z-10">
                {isAr ? cat.name : (cat.nameEn || cat.name)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function CustomBannerBlock({ imageArUrl, imageEnUrl, linkUrl, locale, globalAds = [] }: any) {
  const isAr = locale === 'ar';
  const customImageUrl = isAr ? (imageArUrl || imageEnUrl) : (imageEnUrl || imageArUrl);
  
  // Combine custom image with global ads. Custom image is always first.
  const allAds = [];
  if (customImageUrl) {
    allAds.push({ id: 'custom', imageUrl: customImageUrl, linkUrl });
  }
  if (Array.isArray(globalAds)) {
    globalAds.forEach(ad => {
      // Don't duplicate if same URL, though unlikely
      if (ad.imageUrl !== customImageUrl) {
        allAds.push(ad);
      }
    });
  }

  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (allAds.length <= 1 || !scrollRef.current) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (Math.abs(scrollLeft) + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const dir = document.documentElement.dir === 'rtl' ? -1 : 1;
          scrollRef.current.scrollBy({ left: clientWidth * dir, behavior: 'smooth' });
        }
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [allAds.length]);

  if (allAds.length === 0) return null;

  return (
    <section className="container-platform py-4">
      <div className="relative w-full overflow-hidden rounded-[20px] md:rounded-[24px] shadow-lg border border-slate-100 dark:border-slate-800/80 bg-stone-900 group aspect-[16/6] sm:aspect-[21/9] md:aspect-[4/1] lg:aspect-[5/1]">
        <div 
          ref={scrollRef}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth"
        >
          {allAds.map((ad, idx) => (
            <a 
              key={ad.id || idx}
              href={ad.linkUrl || '#'} 
              className="flex-shrink-0 w-full h-full snap-center block relative" 
              onClick={() => {
                if (ad.id !== 'custom') {
                  fetch(`/api/admin/advertisements`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ad.id, clicks: 1 }) }).catch(() => {});
                }
              }}
            >
              <img src={ad.imageUrl} alt={ad.title || 'Promo Banner'} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700" />
            </a>
          ))}
        </div>
        
        {allAds.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10">
            {allAds.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/50 backdrop-blur-md shadow-sm" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function StorefrontHomepage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t: globalT } = useTranslation();
  const { locale } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const { items: cartItems, addItem } = useCartStore();
  const [data, setData] = useState<any>(null);
  const isAr = locale === 'ar';
  const saadaConfig = useMemo(() => getSaadaConfig(locale, data || {}), [locale, data]);
  
  const t = (ar: string, en: string) => {
    const arKeyMap: Record<string, string> = {
      'تسوق الآن': 'homepage.shopNow',
      'اكتشف المزيد': 'homepage.exploreMore',
      'ابدأ التسوق': 'homepage.startShopping',
      'سجل متجرك': 'homepage.startSelling',
      'تسوق حسب الفئة': 'homepage.shopByCategory',
      'اكتشف آلاف المنتجات مرتبة بعناية': 'homepage.shopByCategoryDesc',
      'إلغاء الفلتر': 'homepage.clearFilter',
      'لا توجد تصنيفات متاحة حالياً': 'homepage.noCategories',
      'منتجات مميزة': 'homepage.featuredProducts',
      'اختيارات حصرية من أفضل التجار': 'homepage.featuredProductsDesc',
      'فلتر': 'homepage.filter',
      'ابحث عن منتج...': 'homepage.searchPlaceholder',
      'الأحدث': 'homepage.newest',
      'السعر: الأقل': 'homepage.priceAsc',
      'السعر: الأعلى': 'homepage.priceDesc',
      'الأعلى تقييماً': 'homepage.topRated',
      'الأكثر مبيعاً': 'homepage.popular',
      'كل الفئات': 'homepage.allCategories',
      'سعر من': 'homepage.minPrice',
      'سعر إلى': 'homepage.maxPrice',
      'مسح': 'homepage.clear',
      'جاري البحث...': 'homepage.searching',
      'نتيجة': 'homepage.results',
      'عرض المزيد': 'homepage.loadMore',
      'تجار شاري داي المميزين': 'homepage.topMerchants',
      'تسوق من الشركاء الموثوقين': 'homepage.topMerchantsTitle',
      'نوفر لك نخبة من كبرى المتاجر الجزائرية والتجار الأحرار الموثقين بشارات الجودة والمستويات الاحترافية.': 'homepage.topMerchantsDesc',
      'المتاجر الكبرى المتميزة': 'homepage.premiumStores',
      'التجار المستقلون الأحرار': 'homepage.independentSellers',
      'لا توجد متاجر نشطة حالياً': 'homepage.noActiveStores',
      'مدير المتجر:': 'homepage.storeManager',
      'منتج': 'homepage.productsCount',
      'لا يوجد تجار مستقلون حالياً': 'homepage.noActiveSellers',
      'تاجر مستقل معتمد': 'homepage.certifiedMerchant',
      'عرض جميع التجار': 'homepage.viewAllMerchants',
      'آراء عملائنا': 'homepage.customerReviews',
      'ماذا قالوا عنا؟': 'homepage.testimonialsTitle',
      'آراء حقيقية من مشترين حقيقيين': 'homepage.testimonialsDesc',
      'ابدأ البيع اليوم!': 'homepage.ctaTitle',
      'انضم لآلاف التجار الناجحين على منصة شاري داي وابدأ رحلتك نحو النجاح التجاري': 'homepage.ctaDesc',
      'أنشئ حساب تاجر': 'homepage.createSellerAccount',
      'تعرف على الباقات': 'homepage.viewPackages',
      'حملة خصم كبرى': 'homepage.discountCampaign',
      'واحصل على خصم': 'homepage.getDiscount',
      'ينتهي في: ': 'homepage.expiresAt',
    };

    const key = arKeyMap[ar.trim()];
    if (key) return globalT(key);
    return isAr ? ar : en;
  };

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
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  // Sync with URL search params (Fix for the search functionality)
  useEffect(() => {
    const view = searchParams.get('view');
    const q = searchParams.get('q');
    const catId = searchParams.get('categoryId');

    if (view === 'search') {
      if (q) setFilterSearch(q);
      if (catId) setFilterCategory(catId);
      setShowFilterPanel(true);
      
      // Auto-scroll to the filter panel to ensure the user sees the results
      setTimeout(() => {
        document.getElementById('search-results-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch(`/api/homepage?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { 
        if (d.success) { 
          setData(d); 
          setFilteredProducts(d.featuredProducts || []); 
        } 
      })
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

  useEffect(() => {
    const timer = setTimeout(fetchFilteredProducts, 500);
    return () => clearTimeout(timer);
  }, [fetchFilteredProducts]);

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
    const interval = setInterval(() => setHeroIndex((i) => (i + 1) % currentHeroSlides.length), 6000);
    return () => clearInterval(interval);
  }, [currentHeroSlides]);

  const slide = currentHeroSlides[heroIndex] || currentHeroSlides[0] || DEFAULT_HERO_SLIDES[0];
  const slideBg = slide?.bg || 'from-slate-900 via-indigo-950 to-slate-900';
  const slideBadge = getLocalizedField(slide, 'badge', locale);
  const slideTitle = getLocalizedField(slide, 'title', locale);
  const slideSubtitle = getLocalizedField(slide, 'subtitle', locale);
  const slideCta = getLocalizedField(slide, 'cta', locale) || (locale === 'ar' ? 'تسوق الآن' : 'Shop Now');



  const renderSection = (section: any) => {
    if (!section || !section.type) return null;
    switch (section.type) {
      case 'hero':
        // Resolve section specific slides
        const sectRawSlides = section.metadata?.slides || [];
        const sectValidSlides = Array.isArray(sectRawSlides) ? sectRawSlides.filter((s: any) => s && typeof s === 'object' && (s.title || s.titleEn || s.titleAr || s.subtitle || s.imageUrl)) : [];
        const resolvedHeroSlides = sectValidSlides.length > 0 ? sectValidSlides : currentHeroSlides;
        const resolvedHeroIndex = heroIndex % Math.max(1, resolvedHeroSlides.length);

        // Retrieve custom settings for Side Card 1
        const card1Badge = getLocalizedField(section, 'card1Badge', locale) || t('أحدث المنتجات', 'Latest Products');
        
        const card1Title = getLocalizedField(section, 'card1Title', locale) || t('تسوق تشكيلة واسعة من أفضل المنتجات', 'Shop a wide selection of top products');
        
        const card1Cta = getLocalizedField(section, 'card1Cta', locale) || t('تسوق الآن', 'Shop Now');
        
        const card1Link = section.metadata?.card1Link || '/search?q=electronics';

        const card1Type = section.metadata?.card1Type || 'text';
        const card1BgImage = getLocalizedField(section, 'card1BgImage', locale);
        let card1AdImage = getLocalizedField(section, 'card1AdImage', locale);
        let card1AdLink = section.metadata?.card1AdLink || '#';
        let card1AdTitle = card1Title;
        if (card1Type === 'advertisement' && section.metadata?.card1AdId) {
          const adsArray = Object.values(data?.advertisements || {}).flat() as any[];
          const ad = adsArray.find(a => a.id === section.metadata.card1AdId);
          if (ad) {
            card1AdImage = ad.imageUrl;
            card1AdLink = ad.linkUrl || '#';
            card1AdTitle = locale === 'en' ? (ad.titleEn || ad.title) : ad.title;
          }
        }

        // Retrieve custom settings for Side Card 2
        const card2Badge = getLocalizedField(section, 'card2Badge', locale) || t('عروض مميزة', 'Special Offers');
        
        const card2Title = getLocalizedField(section, 'card2Title', locale) || t('خصومات حصرية على مجموعة متنوعة من الأصناف', 'Exclusive discounts on a variety of items');
        
        const card2Cta = getLocalizedField(section, 'card2Cta', locale) || t('اكتشف المزيد', 'Explore More');
        
        const card2Link = section.metadata?.card2Link || '/search?q=perfumes';

        const card2Type = section.metadata?.card2Type || 'text';
        const card2BgImage = getLocalizedField(section, 'card2BgImage', locale);
        let card2AdImage = getLocalizedField(section, 'card2AdImage', locale);
        let card2AdLink = section.metadata?.card2AdLink || '#';
        let card2AdTitle = card2Title;
        if (card2Type === 'advertisement' && section.metadata?.card2AdId) {
          const adsArray = Object.values(data?.advertisements || {}).flat() as any[];
          const ad = adsArray.find(a => a.id === section.metadata.card2AdId);
          if (ad) {
            card2AdImage = ad.imageUrl;
            card2AdLink = ad.linkUrl || '#';
            card2AdTitle = locale === 'en' ? (ad.titleEn || ad.title) : ad.title;
          }
        }

        return (
          <section key="hero" className="container-platform py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
              {/* Main Banner Slider (9 Columns on Desktop) */}
              <div className="lg:col-span-9 relative overflow-hidden bg-slate-950 text-white rounded-[28px] shadow-[0_15px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 h-[340px] md:h-[420px] lg:h-[480px] group isolate">
                {/* Modern grid lines overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none z-10" />
                
                {resolvedHeroSlides.map((s: any, idx: number) => {
                  const isSlideActive = idx === resolvedHeroIndex;
                  const sTitle = getLocalizedField(s, 'title', locale) || (locale === 'ar' ? s.titleAr : s.titleEn);
                  const sSubtitle = getLocalizedField(s, 'subtitle', locale) || (locale === 'ar' ? s.subtitleAr : s.subtitleEn);
                  const sBadge = getLocalizedField(s, 'badge', locale);
                  const sCta = getLocalizedField(s, 'cta', locale) || getLocalizedField(s, 'ctaText', locale) || (locale === 'ar' ? (s.ctaTextAr || s.cta) : (s.ctaTextEn || s.ctaEn)) || t('تسوق الآن', 'Shop Now');
                  const sBg = s.bg || s.bgGradient || 'from-blue-950 via-indigo-900 to-slate-900';

                  return (
                    <div
                      key={s.id || idx}
                      className={`absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        isSlideActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 pointer-events-none scale-105'
                      }`}
                    >
                      {s.imageUrl ? (
                        <>
                          <img src={s.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[15000ms] ease-out scale-100 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent mix-blend-multiply" />
                          <div className="absolute inset-0 bg-black/20" />
                        </>
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${sBg} opacity-95`} />
                      )}
                      
                      <div className="h-full flex flex-col justify-center relative z-20 p-8 md:p-12 lg:p-16 text-start">
                        <div className="max-w-2xl bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 blur-3xl rounded-full" />
                          {sBadge && (
                            <Badge className="mb-4 bg-white/10 hover:bg-white/20 text-white border-white/10 text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full select-none backdrop-blur-md shadow-sm transition-colors uppercase tracking-widest">
                              {sBadge}
                            </Badge>
                          )}
                          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70">
                            {sTitle}
                          </h1>
                          <p className="text-sm sm:text-base md:text-lg text-white/80 mb-8 font-medium max-w-lg leading-relaxed drop-shadow-md">
                            {sSubtitle}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 relative z-20">
                            {s.linkUrl ? (
                              <Link href={s.linkUrl} className="inline-block" onClick={(e) => e.stopPropagation()}>
                                <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-black px-8 py-6 rounded-2xl text-sm shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(245,158,11,0.5)] w-full sm:w-auto transition-all duration-300 hover:-translate-y-1">
                                  {sCta}
                                  {isAr ? <ArrowLeft className="ms-2 size-5" /> : <ArrowRight className="ms-2 size-5" />}
                                </Button>
                              </Link>
                            ) : (
                              <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-black px-8 py-6 rounded-2xl text-sm shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(245,158,11,0.5)] w-full sm:w-auto transition-all duration-300 hover:-translate-y-1">
                                {sCta}
                                {isAr ? <ArrowLeft className="ms-2 size-5" /> : <ArrowRight className="ms-2 size-5" />}
                              </Button>
                            )}
                            {!isAuthenticated && (
                              <Link href="/?view=login&role=seller" className="inline-block" onClick={(e) => e.stopPropagation()}>
                                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-2xl text-sm w-full sm:w-auto py-6 px-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
                                  {t('سجل متجرك', 'Start Selling')}
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {resolvedHeroSlides.length > 1 && (
                  <div className="absolute bottom-6 start-1/2 -translate-x-1/2 flex gap-2 z-20 select-none">
                    {resolvedHeroSlides.map((_, i) => (
                      <button key={i} onClick={(e) => { e.stopPropagation(); setHeroIndex(i); }}
                        className={`h-2 rounded-full transition-all duration-300 ${i === resolvedHeroIndex ? 'w-6 bg-amber-500 shadow-md' : 'w-2 bg-white/20'}`} />
                    ))}
                  </div>
                )}
                {resolvedHeroSlides.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setHeroIndex((i) => (i - 1 + resolvedHeroSlides.length) % resolvedHeroSlides.length); }}
                      className="absolute start-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white z-20 hidden md:block">
                      {isAr ? <ChevronRight className="size-4.5" /> : <ChevronLeft className="size-4.5" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setHeroIndex((i) => (i + 1) % resolvedHeroSlides.length); }}
                      className="absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white z-20 hidden md:block">
                      {isAr ? <ChevronLeft className="size-4.5" /> : <ChevronRight className="size-4.5" />}
                    </button>
                  </>
                )}
              </div>

              {/* Side stack banners (3 Columns on Desktop, hidden on Mobile) */}
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-5 h-[340px] md:h-[420px] lg:h-[480px]">
                {/* Banner Side 1: Yellow/Orange accent */}
                <div 
                  className="flex-1 rounded-[28px] bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex flex-col justify-between border border-amber-400/30 shadow-lg relative overflow-hidden group hover:shadow-[0_15px_35px_-10px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all duration-300 cursor-pointer isolate" 
                  onClick={() => router.push(card1Type === 'ad' ? card1AdLink : card1Link)}
                >
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-300/40 rounded-full blur-2xl group-hover:bg-orange-200/50 transition-colors duration-500 -z-10" />
                  {(card1Type === 'ad' || card1Type === 'advertisement') && card1AdImage ? (
                    <>
                      <img src={card1AdImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                      <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-300" />
                      {card1Type === 'advertisement' && (
                        <Badge className="absolute top-4 end-4 bg-white/20 backdrop-blur-md text-white border-white/20 text-[10px] font-bold shadow-lg shadow-black/10 pointer-events-none">
                          {globalT('homepage.advertisementBadge') || 'إعلان'}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <>
                      {card1BgImage ? (
                        <>
                          <img src={card1BgImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/90 to-orange-600/80 group-hover:opacity-90 transition-opacity duration-300 mix-blend-multiply" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-white/5 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none mix-blend-overlay" />
                      )}
                      <div className="z-10 p-5 md:p-6 text-start">
                        <Badge className={`text-[9px] font-bold py-1 px-2.5 mb-2 select-none shadow-sm border-0 ${card1BgImage ? 'bg-white/20 text-white backdrop-blur-md border border-white/20' : 'bg-slate-950 text-white'}`}>{card1Badge}</Badge>
                        <h4 className={`text-base md:text-lg font-black leading-tight tracking-tight drop-shadow-sm ${card1BgImage ? 'text-white' : ''}`}>{card1AdTitle}</h4>
                      </div>
                      <div className="z-10 flex justify-between items-center p-5 md:p-6 mt-2 relative">
                        <span className={`text-[11px] font-black underline transition-colors ${card1BgImage ? 'text-white/90 group-hover:text-white' : 'group-hover:text-slate-700'}`}>{card1Cta}</span>
                        <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform">
                          <ShoppingCart className={`w-4 h-4 md:w-5 md:h-5 ${card1BgImage ? 'text-white' : ''}`} />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Banner Side 2: Dark indigo glassmorphism */}
                <div 
                  className="flex-1 rounded-[28px] bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col justify-between border border-white/10 shadow-[0_10px_30px_-10px_rgba(49,46,129,0.5)] relative overflow-hidden group hover:shadow-[0_15px_40px_-10px_rgba(49,46,129,0.7)] hover:-translate-y-1 transition-all duration-300 cursor-pointer isolate" 
                  onClick={() => router.push(card2Type === 'ad' ? card2AdLink : card2Link)}
                >
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-400/30 transition-colors duration-500 -z-10" />
                  {(card2Type === 'ad' || card2Type === 'advertisement') && card2AdImage ? (
                    <>
                      <img src={card2AdImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                      <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-300" />
                      {card2Type === 'advertisement' && (
                        <Badge className="absolute top-4 end-4 bg-white/20 backdrop-blur-md text-white border-white/20 text-[10px] font-bold shadow-lg shadow-black/10 pointer-events-none">
                          {globalT('homepage.advertisementBadge') || 'إعلان'}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <>
                      {card2BgImage ? (
                        <>
                          <img src={card2BgImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 to-slate-900/80 group-hover:opacity-90 transition-opacity duration-300 mix-blend-multiply" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none -z-10" />
                      )}
                      <div className="z-10 p-5 md:p-6 text-start">
                        <Badge className={`text-[9px] font-bold py-1 px-2.5 mb-2 select-none shadow-sm ${card2BgImage ? 'bg-white/20 text-white border-white/20 backdrop-blur-md' : 'bg-indigo-500/30 text-indigo-100 border-indigo-400/20'}`}>{card2Badge}</Badge>
                        <h4 className="text-base md:text-lg font-black leading-tight tracking-tight drop-shadow-sm text-white">{card2AdTitle}</h4>
                      </div>
                      <div className="z-10 flex justify-between items-center p-5 md:p-6 mt-2 relative">
                        <span className="text-[11px] font-black underline text-amber-400 group-hover:text-amber-300 transition-colors">{card2Cta}</span>
                        <div className="bg-amber-400/10 p-2 rounded-full group-hover:scale-110 transition-transform">
                          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'features': {
        // Icons map: admin stores icon name as a string
        const ICON_MAP: Record<string, React.ComponentType<any>> = {
          Shield, Truck, Award, TrendingUp, Star, CheckCircle2, Sparkles, ShoppingBag,
        };
        // Use DB-driven features if available, else fall back to hardcoded defaults
        const featuresData: any[] = (data?.features && Array.isArray(data.features) && data.features.length > 0)
          ? data.features
          : FEATURES;

        return (
          <section key="features" className="container-platform py-2">
            <div className="bg-white/50 dark:bg-slate-900/50 border border-border/80 rounded-[24px] backdrop-blur-md p-5 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuresData.map((f: any, idx: number) => {
                  // Support both component refs (hardcoded) and string icon names (DB-driven)
                  const IconComp = typeof f.icon === 'string' ? (ICON_MAP[f.icon] || Shield) : f.icon;
                  const title = locale === 'ar' ? (f.titleAr || f.title) : locale === 'fr' ? (f.titleFr || f.titleEn || f.title) : (f.titleEn || f.title);
                  const desc = locale === 'ar' ? (f.descAr || f.desc) : locale === 'fr' ? (f.descFr || f.descEn || f.desc) : (f.descEn || f.desc);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
                        <IconComp className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{title}</p>
                        <p className="hidden md:block text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }


      case 'categories':
        const displayCats = (data?.categories ?? []).filter((c) => c && c.id).slice(0, 30);
        return (
          <section key="categories" className="container-platform py-6">
            <SectionHeader section={section} isAr={isAr} locale={locale} t={t}>
              {filterCategory && (
                <Button variant="ghost" size="sm" className="text-destructive gap-1 text-xs" onClick={() => setFilterCategory('')}>
                  <X className="size-3" />
                  {t('إلغاء الفلتر', 'Clear Filter')}
                </Button>
              )}
            </SectionHeader>
            {isLoading ? (
              <CategoryCirclesSkeleton />
            ) : displayCats.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-[24px] border border-border/60">
                <ShoppingBag className="size-10 mx-auto mb-2 opacity-25" />
                <p className="text-sm">{t('لا توجد تصنيفات متاحة حالياً', 'No categories available yet')}</p>
              </div>
            ) : (
              <div className="relative group/slider">
                <button 
                  onClick={() => { const el = document.getElementById(`scroll-cat-${section.id}`); if (el) el.scrollBy({ left: -300, behavior: 'smooth' }); }}
                  className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] border border-border/50 items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-slate-700 hover:text-amber-500"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => { const el = document.getElementById(`scroll-cat-${section.id}`); if (el) el.scrollBy({ left: 300, behavior: 'smooth' }); }}
                  className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] border border-border/50 items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-slate-700 hover:text-amber-500"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div id={`scroll-cat-${section.id}`} className="flex gap-4 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory px-4 md:px-2 relative z-10 scroll-smooth">
                  {displayCats.map((cat, idx) => {
                    const isActive = filterCategory === cat.id;
                    
                    const renderCategoryIcon = (iconStr: string) => {
                      if (!iconStr) return '📦';
                      const textToEmoji: Record<string, string> = {
                        'trophy': '🏆', 'sparkles': '✨', 'star': '⭐', 'heart': '❤️',
                        'shopping-bag': '🛍️', 'home': '🏠', 'car': '🚗', 'smartphone': '📱',
                        'laptop': '💻', 'shirt': '👕', 'coffee': '☕', 'watch': '⌚',
                        'camera': '📷', 'headphones': '🎧', 'book': '📚', 'gift': '🎁'
                      };
                      const normalized = iconStr.trim().toLowerCase();
                      if (textToEmoji[normalized]) return textToEmoji[normalized];
                      if (iconStr.length > 3) return '📦';
                      return iconStr;
                    };

                    return (
                      <Link
                        key={cat.id}
                        href={`/search?categoryId=${cat.id}`}
                        className={`group relative flex flex-col items-center justify-start gap-3 p-4 rounded-[28px] transition-all duration-500 shrink-0 snap-start select-none overflow-hidden ${
                          isActive
                            ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-white shadow-[0_15px_30px_-10px_rgba(245,158,11,0.5)] scale-105 border-0'
                            : 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-white/60 dark:border-white/10 hover:border-amber-400/50 hover:shadow-[0_15px_35px_-10px_rgba(245,158,11,0.2)] hover:-translate-y-2 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100'
                        }`}
                        style={{ minWidth: '105px', maxWidth: '115px' }}
                      >
                        {!isActive && <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-orange-500/0 group-hover:from-amber-400/10 group-hover:to-orange-500/5 transition-colors duration-500" />}
                        
                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shadow-inner transition-all duration-500 relative z-10 overflow-hidden ${
                          isActive 
                            ? 'bg-white/20 backdrop-blur-sm shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)]' 
                            : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 group-hover:bg-white dark:group-hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50'
                        }`}>
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <span className={`text-3xl drop-shadow-sm select-none transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-6'}`}>
                              {renderCategoryIcon(cat.icon)}
                            </span>
                          )}
                        </div>
                        
                        <span className={`text-[11px] font-black text-center leading-tight line-clamp-2 transition-colors duration-500 relative z-10 ${
                          isActive ? 'text-white' : 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
                        }`}>
                          {isAr ? cat.name : (cat.nameEn || cat.name)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );

      case 'bento_offers':
        // Noon-style Bento Promo grid with countdown timer
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
          || (locale === 'ar' ? (globalT('homepage.noonItMore') || 'نوّنها أكثر ووفّر أكثر على كل اللي تحبّه') : 'Shop more & save on what you love');
          
        const customText2 = getLocalizedField(section, 'customText2', locale)
          || (locale === 'ar' ? (globalT('homepage.onSale') || 'عليها العين') : 'Hot Deals');

        const sectionBadge = getLocalizedField(section, 'badge', locale);

        return (
          <section key={`bento_offers_${section.id}`} className="container-platform py-6 font-cairo">
            {sectionBadge && (
              <div className="flex justify-center mb-4">
                <Badge className="bg-amber-500 text-white text-xs font-bold py-1 px-3 shadow-md border-0">{sectionBadge}</Badge>
              </div>
            )}
            {/* Responsive grid: stack on mobile, 3-column on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5">
              {/* Right Column: 4x4 Promos */}
              <div className="md:col-span-1 lg:col-span-3 min-h-[300px] md:min-h-[380px] lg:min-h-[480px] rounded-[28px] bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600 border border-amber-400/30 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)] p-5 md:p-6 text-slate-950 flex flex-col justify-between hover:shadow-[0_20px_50px_-15px_rgba(245,158,11,0.5)] hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden isolate">
                {/* Modern grid lines overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
                {rightCardType === 'ad' && rightCardAdImage ? (
                  <Link href={rightCardAdLink} className="absolute inset-0 w-full h-full block">
                    <img src={rightCardAdImage} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                    <Badge className="absolute top-3 end-3 bg-white/10 text-white border-white/10 text-[10px]">إعلان</Badge>
                  </Link>
                ) : (
                  <>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-110 -z-10" />
                    <div className="z-10 text-start relative">
                      <Badge className="bg-slate-950 text-white text-[10px] font-bold py-1 px-2.5 mb-3 select-none rounded-lg shadow-sm border-0 tracking-wide uppercase">{globalT('homepage.exclusiveOffers') || 'عروض حصرية'}</Badge>
                      <h3 className="text-base md:text-xl font-black leading-tight tracking-tight text-slate-950 drop-shadow-sm">{customText1}</h3>
                    </div>
                    <div className={`grid gap-2.5 md:gap-3 z-10 grow mt-5 items-start ${
                      rightCardProducts.length === 1 
                        ? "grid-cols-1 justify-items-center max-w-[150px] mx-auto" 
                        : "grid-cols-2"
                    }`}>
                      {rightCardProducts.slice(0, 4).map((p: any, i: number) => {
                        let imgs: string[] = [];
                        try { imgs = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'); } catch {}
                        return (
                          <div key={i} className="bg-white/90 backdrop-blur-md rounded-[16px] p-2 flex flex-col justify-between border border-white/40 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-300 cursor-pointer w-full group/card relative overflow-hidden" onClick={() => router.push(`/products/${p.id}`)}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                            <div className="aspect-square bg-slate-100 rounded-[10px] overflow-hidden mb-2 relative">
                              {imgs[0] ? <img src={imgs[0]} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" alt="" /> : <div className="flex items-center justify-center h-full text-lg opacity-50">📦</div>}
                            </div>
                            <p className="text-[10px] font-bold text-slate-800 line-clamp-1 text-center group-hover/card:text-amber-600 transition-colors">{locale === 'ar' ? p.name : (p.nameEn || p.name)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Center Column: Mega Offers countdown timer — spans full width on mobile */}
              <div className="md:col-span-2 lg:col-span-6 min-h-[340px] md:min-h-[420px] lg:min-h-[480px] rounded-[28px] bg-slate-950 text-white border border-rose-500/20 shadow-[0_10px_40px_-15px_rgba(225,29,72,0.3)] p-5 md:p-6 flex flex-col justify-between hover:shadow-[0_20px_50px_-15px_rgba(225,29,72,0.5)] hover:border-rose-500/40 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden order-first md:order-none group isolate">
                {/* Modern grid lines overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e11d481a_1px,transparent_1px),linear-gradient(to_bottom,#e11d481a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none -z-10" />
                {centerCardType === 'ad' && centerCardAdImage ? (
                  <Link href={centerCardAdLink} className="absolute inset-0 w-full h-full block">
                    <img src={centerCardAdImage} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                    <Badge className="absolute top-3 end-3 bg-white/10 text-white border-white/10 text-[10px]">إعلان</Badge>
                  </Link>
                ) : (
                  <>
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-600/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-rose-500/30 transition-colors duration-700 -z-10" />
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700 -z-10" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 mb-4 z-10 relative">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-[14px] bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/30 text-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
                          <Flame className="w-5 h-5 md:w-6 md:h-6 fill-current animate-[pulse_2s_ease-in-out_infinite]" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-black text-white tracking-tight drop-shadow-md">
                            {getLocalizedField(section, 'customTextCenter', locale) || (locale === 'ar' ? (data?.countdownConfig?.titleAr || 'عروض ميجا') : (data?.countdownConfig?.titleEn || 'Mega Offers'))}
                          </h3>
                          <p className="text-[10px] md:text-xs text-rose-200/60 font-medium">{globalT('homepage.limitedTimeDiscounts') || 'خصومات لفترة محدودة'}</p>
                        </div>
                      </div>
                      {hasCountdown && (section.metadata?.timerEndDate || data?.countdownConfig?.endDate) && (
                        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[14px] p-2 shadow-inner">
                          <CountdownTimer targetDate={section.metadata?.timerEndDate || data?.countdownConfig?.endDate} />
                        </div>
                      )}
                    </div>
                    {isLoading ? (
                      <div className="h-48 md:h-64 bg-white/5 animate-pulse rounded-[20px] w-full border border-white/5" />
                    ) : timerProducts.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm grow flex flex-col items-center justify-center">
                        <Flame className="w-12 h-12 mb-3 opacity-10" />
                        {globalT('homepage.noActiveDeals') || (locale === 'ar' ? 'لا توجد عروض تنازلية نشطة حالياً.' : 'No active discount deals at the moment.')}
                      </div>
                    ) : (
                      <div className={`grid gap-3 md:gap-4 grow h-full max-h-[350px] lg:max-h-none overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent pr-1 items-start relative z-10 ${
                        timerProducts.length === 1 
                          ? "grid-cols-1 justify-items-center max-w-[240px] mx-auto w-full" 
                          : timerProducts.length === 2 
                            ? "grid-cols-2 justify-items-center max-w-[480px] mx-auto w-full" 
                            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
                      }`}>
                        {timerProducts.map((p: any) => <ProductCard key={p.id} product={p} isOfferCard={true} newArrivalThresholdDays={data?.newArrivalThresholdDays} />)}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Left Column: Vertical 2x2 promo */}
              <div className="md:col-span-1 lg:col-span-3 min-h-[300px] md:min-h-[380px] lg:min-h-[480px] rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-indigo-500/20 shadow-[0_10px_40px_-15px_rgba(99,102,241,0.2)] p-5 md:p-6 text-white flex flex-col justify-between hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.4)] hover:border-indigo-400/30 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group isolate">
                {/* Modern grid lines overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f11a_1px,transparent_1px),linear-gradient(to_bottom,#6366f11a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
                {leftCardType === 'ad' && leftCardAdImage ? (
                  <Link href={leftCardAdLink} className="absolute inset-0 w-full h-full block">
                    <img src={leftCardAdImage} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                    <Badge className="absolute top-3 end-3 bg-white/10 text-white border-white/10 text-[10px]">إعلان</Badge>
                  </Link>
                ) : (
                  <>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-125 -z-10" />
                    <div className="z-10 flex justify-between items-center text-start relative">
                      <h3 className="text-base md:text-xl font-black flex items-center gap-2 tracking-tight">
                        <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        {customText2}
                      </h3>
                      <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 cursor-pointer text-[10px] py-1 px-3 rounded-lg border-0 transition-colors" onClick={() => router.push('/search')}>{globalT('homepage.viewAll') || 'عرض الكل'}</Badge>
                    </div>
                    <div className="flex flex-col gap-3 md:gap-4 z-10 grow mt-5 overflow-y-auto h-full max-h-[350px] lg:max-h-[390px] scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent pr-1 relative">
                      {leftCardProducts.map((p: any, i: number) => {
                        let imgs: string[] = [];
                        try { imgs = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'); } catch {}
                        const discount = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
                        return (
                          <div key={i} className="bg-white/5 border border-white/10 hover:border-indigo-400/30 rounded-[20px] p-2.5 flex items-center gap-3.5 cursor-pointer hover:bg-white/10 hover:shadow-lg transition-all duration-300 shrink-0 group/row relative overflow-hidden" onClick={() => router.push(`/products/${p.id}`)}>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-500" />
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-black/20 rounded-[14px] overflow-hidden shrink-0 relative">
                              {imgs[0] ? <img src={imgs[0]} className="w-full h-full object-cover group-hover/row:scale-110 transition-transform duration-500" alt="" /> : <div className="flex items-center justify-center h-full text-lg opacity-50">📦</div>}
                            </div>
                            <div className="min-w-0 grow text-start">
                              <h4 className="text-xs md:text-sm font-bold truncate text-slate-200 group-hover/row:text-white transition-colors">{locale === 'ar' ? p.name : (p.nameEn || p.name)}</h4>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm md:text-base font-black text-amber-400 tracking-tight">{fmt(p.price)}</span>
                                {discount > 0 && <span className="text-[10px] bg-red-600/90 text-white px-1.5 py-0.5 rounded-md font-black shadow-sm">-{discount}%</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        );


      case 'featured_products':
        const productsToShow = filteredProducts.length > 0 ? filteredProducts : (data?.featuredProducts ?? []);
        return (
          <section key="featured_products" className="py-10 my-4 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950 border-y border-slate-200/50 dark:border-slate-800/50">
            <div className="container-platform">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full hidden md:block" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {getLocalizedField(section, 'title', locale) || t('منتجات مميزة', 'Featured Products')}
                      {section.metadata?.badge && (
                        <span className="ms-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 align-middle">
                          {getLocalizedField(section.metadata, 'badge', locale)}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">{t('اختيارات حصرية من أفضل التجار', 'Exclusive picks from top sellers')}</p>
                  </div>
                </div>
                {section.metadata?.enableTimer && section.metadata?.timerEndDate && (
                  <div className="hidden lg:block me-4">
                    <CountdownTimer targetDate={section.metadata.timerEndDate} />
                  </div>
                )}
                <Button
                  variant={showFilterPanel ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2 relative rounded-xl border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setShowFilterPanel(p => !p)}
                >
                  <SlidersHorizontal className="size-4" />
                  <span className="hidden sm:inline">{t('فلتر', 'Filter')}</span>
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-amber-500 shadow shadow-amber-500/40" />
                  )}
                </Button>
              </div>
            <div id="search-results-panel"></div>
            {showFilterPanel && (
              <div className="mb-6 p-5 rounded-[24px] bg-white/70 dark:bg-slate-950/70 border border-border/80 backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                      placeholder={t('ابحث عن منتج...', 'Search products...')}
                      className="ps-9 h-10 text-sm rounded-xl border-border/80"
                    />
                  </div>
                  <select
                    value={filterSort}
                    onChange={e => setFilterSort(e.target.value)}
                    className="h-10 rounded-xl border border-border/80 bg-background px-3 text-sm min-w-[140px]"
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
                    className="h-10 rounded-xl border border-border/80 bg-background px-3 text-sm flex-1"
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
                      className="h-10 rounded-xl text-sm w-28 border-border/80"
                    />
                    <span className="text-muted-foreground text-sm">—</span>
                    <Input
                      type="number"
                      value={filterMaxPrice}
                      onChange={e => setFilterMaxPrice(e.target.value)}
                      placeholder={t('سعر إلى', 'Max price')}
                      className="h-10 rounded-xl text-sm w-28 border-border/80"
                    />
                    <span className="text-xs text-muted-foreground">DZD</span>
                  </div>
                  {hasActiveFilters && (
                    <Button size="sm" variant="ghost" onClick={clearFilters} className="h-10 gap-1 text-muted-foreground hover:text-destructive rounded-xl">
                      <X className="size-3.5" />
                      {t('مسح', 'Clear')}
                    </Button>
                  )}
                </div>
              </div>
            )}
            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground mb-4">
                {isFilterLoading ? t('جاري البحث...', 'Searching...') : `${filteredProducts.length} ${t('نتيجة', 'results')}`}
              </p>
            )}
            
            {isLoading || isFilterLoading ? (
              <ProductSliderSkeleton />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4">
                {productsToShow
                  .filter((product: any) => product && product.id)
                  .slice(0, section.limit ? Math.min(displayCount, section.limit) : displayCount)
                  .map((product: any) => <ProductCard key={product.id} product={product} newArrivalThresholdDays={data?.newArrivalThresholdDays} />)}
              </div>
            )}
            
            {productsToShow.filter(p => p && p.id).length > displayCount && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 min-w-[200px] border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/5 rounded-xl font-bold"
                  onClick={() => setDisplayCount(prev => prev + 20)}
                >
                  <ShoppingBag className="size-4" />
                  {t('عرض المزيد', 'Load More')}
                  <Badge variant="secondary" className="ms-1 bg-amber-500/10 text-amber-500">
                    +{Math.min(20, productsToShow.filter(p => p && p.id).length - displayCount)}
                  </Badge>
                </Button>
              </div>
            )}
            </div>
          </section>
        );

      case 'top_sellers':
        const stores = (data?.topStores || []).slice(0, section.limit || 8);
        const sellers = (data?.topSellers || []).slice(0, section.limit || 8);

        return (
          <section key="top_sellers" className="bg-gradient-to-br from-stone-950 via-slate-900 to-indigo-950 text-white py-4 mt-0 relative overflow-hidden border-y border-white/5">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
              <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
            </div>
            <div className="container-platform relative z-10">
              <div className="text-center mb-2 px-4 max-w-2xl mx-auto">
                <Badge className="mb-2 bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full select-none">
                  ⭐ {getLocalizedField(section, 'badge', locale) || t('homepage.topMerchants')}
                </Badge>
                <h3 className="text-xl md:text-2xl font-black mb-1.5 leading-tight tracking-tight font-cairo">
                  {getLocalizedField(section, 'title', locale) || t('homepage.topMerchantsTitle')}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-300 max-w-xl mx-auto leading-relaxed font-medium whitespace-pre-line">
                  {getLocalizedField(section, 'subtitle', locale) || t('homepage.topMerchantsDesc')}
                </p>
                <div className="inline-flex p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 mt-3 font-cairo select-none mx-auto max-w-fit shadow-inner scale-90 md:scale-100">
                  <button
                    onClick={() => setActiveMerchantTab('stores')}
                    className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                      activeMerchantTab === 'stores' ? 'bg-amber-500 text-slate-950 shadow-md scale-105' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    🏪 <span className={activeMerchantTab === 'stores' ? '' : 'hidden sm:inline'}>{t('المتاجر الكبرى', 'Premium Stores')}</span>
                  </button>
                  <button
                    onClick={() => setActiveMerchantTab('sellers')}
                    className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                      activeMerchantTab === 'sellers' ? 'bg-amber-500 text-slate-950 shadow-md scale-105' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    💼 <span className={activeMerchantTab === 'sellers' ? '' : 'hidden sm:inline'}>{t('التجار المستقلون', 'Independent Sellers')}</span>
                  </button>
                </div>
              </div>
              
              <div className="relative w-full overflow-hidden px-4 md:px-8 mt-4">
                {activeMerchantTab === 'stores' && (
                  <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 pt-2 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="min-w-[100px] md:min-w-[130px] flex flex-col items-center gap-3 snap-start">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 animate-pulse" />
                          <div className="w-20 h-3 bg-white/5 animate-pulse rounded" />
                        </div>
                      ))
                    ) : stores.length === 0 ? (
                      <div className="w-full py-12 text-center text-white/50 text-sm">
                        {t('لا توجد متاجر نشطة حالياً', 'No active stores at the moment.')}
                      </div>
                    ) : (
                      stores.map((store) => (
                        <div
                          key={store.id}
                          className="min-w-[100px] md:min-w-[120px] max-w-[100px] md:max-w-[120px] flex flex-col items-center gap-2 md:gap-3 snap-start group cursor-pointer"
                          onClick={() => router.push(`/store/${store.slug || store.id}`)}
                        >
                          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px] bg-gradient-to-br from-amber-400/30 via-orange-500/30 to-indigo-500/30 group-hover:from-amber-400 group-hover:via-orange-500 group-hover:to-amber-500 transition-all duration-500 shadow-lg group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            <div className="w-full h-full rounded-full bg-slate-900 border-[3px] border-slate-900 overflow-hidden relative">
                              {store.logo ? (
                                <img src={store.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={store.name} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl bg-slate-800">🏪</div>
                              )}
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                            </div>
                            <div className="absolute -bottom-1 -end-1 bg-slate-900 rounded-full p-[2px] border border-white/10 shadow-md z-10 group-hover:scale-110 transition-transform">
                              <span className="text-[10px] md:text-xs flex items-center justify-center min-w-[20px]">{LEVEL_BADGE[store.level] || '⭐'}</span>
                            </div>
                          </div>
                          <div className="text-center w-full px-1">
                            <h4 className="font-bold text-xs md:text-sm text-white/90 group-hover:text-amber-400 truncate transition-colors">
                              {isAr ? store.name : (store.nameEn || store.name)}
                            </h4>
                            <div className="flex items-center justify-center gap-1 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Star className="size-2.5 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] text-white font-medium">{store.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeMerchantTab === 'sellers' && (
                  <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 pt-2 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="min-w-[100px] md:min-w-[130px] flex flex-col items-center gap-3 snap-start">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 animate-pulse" />
                          <div className="w-20 h-3 bg-white/5 animate-pulse rounded" />
                        </div>
                      ))
                    ) : sellers.length === 0 ? (
                      <div className="w-full py-12 text-center text-white/50 text-sm">
                        {t('لا يوجد تجار مستقلون حالياً', 'No active independent sellers at the moment.')}
                      </div>
                    ) : (
                      sellers.map((seller) => (
                        <div
                          key={seller.id}
                          className="min-w-[100px] md:min-w-[120px] max-w-[100px] md:max-w-[120px] flex flex-col items-center gap-2 md:gap-3 snap-start group cursor-pointer"
                          onClick={() => {
                            useAppStore.getState().setSelectedSellerId(seller.id);
                            router.push(`/sellers/${seller.id}`);
                          }}
                        >
                          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px] bg-gradient-to-br from-slate-400/20 to-slate-600/20 group-hover:from-blue-400 group-hover:to-indigo-500 transition-all duration-500 shadow-lg group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                            <div className="w-full h-full rounded-full bg-slate-900 border-[3px] border-slate-900 overflow-hidden relative">
                              {seller.user?.avatar ? (
                                <img src={seller.user.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={seller.user.name} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-slate-800 text-white/50">{seller.user?.name?.charAt(0) || ''}</div>
                              )}
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                            </div>
                            <div className="absolute -bottom-1 -end-1 bg-slate-900 rounded-full p-[2px] border border-white/10 shadow-md z-10 group-hover:scale-110 transition-transform">
                              <span className="text-[10px] md:text-xs flex items-center justify-center min-w-[20px]" title={`Level ${seller.level}`}>{LEVEL_BADGE[seller.level] || '⭐'}</span>
                            </div>
                          </div>
                          <div className="text-center w-full px-1">
                            <h4 className="font-bold text-xs md:text-sm text-white/90 group-hover:text-blue-400 truncate transition-colors">
                              {seller.storeName || seller.user?.name}
                            </h4>
                            <div className="flex items-center justify-center gap-1 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Star className="size-2.5 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] text-white font-medium">{seller.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-1 mb-1 select-none">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                  onClick={() => setActiveMerchantTab(activeMerchantTab === 'stores' ? 'sellers' : 'stores')}
                >
                  {t('عرض جميع التجار', 'View All Merchants')}
                </Button>
              </div>
            </div>
          </section>
        );

      case 'testimonials': {
        const testimonialsList = (data?.testimonials?.length ? data.testimonials : DEFAULT_TESTIMONIALS).filter((t2: any) => t2 && typeof t2 === 'object');
        if (testimonialsList.length === 0) return null;
        return (
          <section key="testimonials" className="container-platform py-14 text-start">
            <SectionHeader section={section} isAr={isAr} locale={locale} t={t} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonialsList.map((t2, i) => (
                <Card key={i} className="border border-border/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md hover:shadow-lg transition-all duration-300 rounded-[22px] hover:-translate-y-1">
                    <CardContent className="p-5 flex flex-col h-full justify-between">
                      <Quote className="size-6 text-amber-500/30 mb-3" />
                      <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 mb-5 leading-relaxed italic">
                        "{locale === 'ar' ? (t2.text || '') : locale === 'fr' ? (t2.textFr || t2.textEn || t2.text || '') : (t2.textEn || t2.text || '')}"
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                        <div>
                          <p className="text-xs font-bold text-navy dark:text-white">
                            {locale === 'ar' ? (t2.name || '') : locale === 'fr' ? (t2.nameFr || t2.nameEn || t2.name || '') : (t2.nameEn || t2.name || '')}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            {locale === 'ar' ? (t2.city || '') : locale === 'fr' ? (t2.cityFr || t2.cityEn || t2.city || '') : (t2.cityEn || t2.city || '')}
                          </p>
                        </div>
                        <StarRating rating={Number(t2.rating) || 5} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        );
      }

      case 'cta': {
        const ctaData = data?.cta || {};
        const title = locale === 'ar' ? (ctaData.titleAr || ctaData.title || 'ابدأ البيع اليوم!') : locale === 'fr' ? (ctaData.titleFr || ctaData.titleEn || 'Start Selling Today!') : (ctaData.titleEn || 'Start Selling Today!');
        const desc = locale === 'ar' ? (ctaData.descAr || ctaData.desc || 'انضم لآلاف التجار الناجحين على منصة شاري داي وابدأ رحلتك نحو النجاح التجاري') : locale === 'fr' ? (ctaData.descFr || ctaData.descEn || 'Join thousands of successful sellers on ChariDay and start your journey to commercial success') : (ctaData.descEn || 'Join thousands of successful sellers on ChariDay and start your journey to commercial success');
        const btn = locale === 'ar' ? (ctaData.btnAr || ctaData.btn || 'أنشئ حساب تاجر') : locale === 'fr' ? (ctaData.btnFr || ctaData.btnEn || 'Create Seller Account') : (ctaData.btnEn || 'Create Seller Account');
        const btnUrl = ctaData.url || '/admin/register';

        return (
          <section key="cta" className="container-platform py-6">
            <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-indigo-950 text-white rounded-[28px] border border-white/5 py-12 px-6 md:px-12 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-black mb-3 text-amber-400">{title}</h3>
                <p className="text-xs md:text-sm text-white/80 mb-8 leading-relaxed font-medium">
                  {desc}
                </p>
                <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                  <Link href={btnUrl}>
                    <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-black px-8 rounded-xl shadow-lg shadow-amber-500/20">
                      {btn}
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 rounded-xl">
                      {t('تعرف على الباقات', 'View Packages')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      }

      case 'category_products':
        return (
          <CategoryProductsRow
            key={section.id}
            categoryId={section.categoryId}
            storeId={section.storeId}
            sellerId={section.sellerId}
            section={section}
            locale={locale}
            layoutStyle={section.layoutStyle}
            filterType={section.filterType || 'newest'}
            newArrivalThresholdDays={data?.newArrivalThresholdDays}
          />
        );

      case 'category_circles':
        return (
          <CategoryCirclesRow
            key={section.id}
            categoryId={section.categoryId}
            section={section}
            locale={locale}
          />
        );

      case 'banner':
        return (
          <CustomBannerBlock
            key={section.id}
            imageArUrl={section.imageArUrl}
            imageEnUrl={section.imageEnUrl}
            linkUrl={section.linkUrl}
            locale={locale}
            globalAds={data?.advertisements?.banner_mid || []}
          />
        );

      case 'ad_zone':
        const zoneKey = section.metadata?.adZone || 'banner_mid';
        const zoneAds = data?.advertisements?.[zoneKey] || [];
        if (zoneAds.length === 0) return null;
        return (
          <section key={`ad_zone_${section.id}`} className="container-platform py-4 animate-in fade-in">
            <AdBanner ads={zoneAds} className="h-32 md:h-36" />
          </section>
        );

      default:
        return null;
    }
  };

  const defaultLayout = ['hero', 'features', 'categories', 'bento_offers', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
  const coreSectionTypes = new Set(defaultLayout);
  
  const activeLayout = (() => {
    if (!Array.isArray(data?.layout) || data.layout.length === 0) {
      return defaultLayout.map(id => ({ id, type: id, visible: true }));
    }
    const mapped = data.layout
      .filter((sect: any) => sect != null)
      .map((sect: any) => {
        if (typeof sect === 'string') {
          const id = sect === 'mega_offers_timer' ? 'bento_offers' : sect;
          return { id, type: id, visible: true };
        }
        return {
          id: sect.id,
          type: sect.type || sect.id,
          titleAr: sect.titleAr,
          titleEn: sect.titleEn,
          categoryId: sect.categoryId || '',
          storeId: sect.storeId || '',
          sellerId: sect.sellerId || '',
          layoutStyle: sect.layoutStyle || 'carousel',
          imageArUrl: sect.imageArUrl || '',
          imageEnUrl: sect.imageEnUrl || '',
          linkUrl: sect.linkUrl || '',
          visible: sect.visible !== false,
          filterType: sect.filterType || 'smart',
          limit: sect.limit || 10,
          metadata: sect.metadata || null,
        };
      });
    // Ensure all core sections exist - append missing ones at the end
    const existingTypes = new Set(mapped.map((s: any) => s.type));
    for (const coreType of defaultLayout) {
      if (!existingTypes.has(coreType)) {
        mapped.push({ id: coreType, type: coreType, visible: true });
      }
    }
    return mapped;
  })();

  
  const renderSectionWithStyles = (section: any) => {
    if (section.visible === false) return null;
    const content = renderSection(section);
    if (!content) return null;

    const isMobileHidden = section.metadata?.isMobileHidden;
    const isDesktopHidden = section.metadata?.isDesktopHidden;
    const paddingTop = section.metadata?.paddingTop;
    const paddingBottom = section.metadata?.paddingBottom;
    const backgroundColor = section.metadata?.backgroundColor;

    let classes: string[] = [];
    if (isMobileHidden) classes.push('hidden md:block');
    if (isDesktopHidden) classes.push('md:hidden');
    
    if (paddingTop) {
      classes.push(paddingTop);
      classes.push('[&>section]:!pt-0 [&>div]:!pt-0');
    }
    if (paddingBottom) {
      classes.push(paddingBottom);
      classes.push('[&>section]:!pb-0 [&>div]:!pb-0');
    }
    if (backgroundColor && backgroundColor !== 'transparent') classes.push(backgroundColor);

    if (classes.length > 0) {
      return (
        <div key={`styled_${section.id}`} className={classes.join(' ')}>
          {content}
        </div>
      );
    }
    return <div key={`wrapper_${section.id}`}>{content}</div>;
  };
return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-slate-950 font-cairo">
      {/* ── TOP AD BANNER ── */}
      {data?.advertisements?.banner_top && (
        <div className="container-platform relative z-10 pt-4">
          <AdBanner ads={data.advertisements.banner_top} className="w-full h-[70px] md:h-[90px] lg:h-[110px] rounded-md shadow-sm" />
        </div>
      )}
 
      {/* ── TRENDING SEARCH SUGGESTIONS ── */}
      <div className="border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/10 w-full mb-4">
        <div className="container-platform flex items-center gap-2 py-3 overflow-x-auto scrollbar-none select-none snap-x snap-mandatory">
        <span className="text-[10px] md:text-xs font-black text-slate-500 shrink-0 flex items-center gap-1.5 snap-start">
          <Search className="w-3.5 h-3.5" />
          {globalT('homepage.searchSuggestions') || 'البحث الشائع:'}
        </span>
        {(() => {
          // Use Automated Trending Categories if available
          const trendingCategories = data?.trendingCategories || [];
          
          if (trendingCategories.length > 0) {
            return trendingCategories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => { setFilterCategory(cat.id); setShowFilterPanel(true); }}
                className="text-[10px] md:text-xs bg-white/80 dark:bg-slate-900/60 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 border border-border/80 hover:border-amber-500/50 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full whitespace-nowrap transition-all duration-300 font-bold shadow-sm snap-start"
              >
                {locale === 'ar' ? cat.name : (cat.nameEn || cat.name)}
              </button>
            ));
          }

          // Fallback to legacy string searches or defaults if no trending categories exist yet
          const dbSearches = data?.trendingSearches;
          let terms: string[] = [];
          if (dbSearches) {
            if (locale === 'ar' && Array.isArray(dbSearches.ar)) terms = dbSearches.ar;
            else if (locale === 'fr' && Array.isArray(dbSearches.fr)) terms = dbSearches.fr;
            else if (Array.isArray(dbSearches.en)) terms = dbSearches.en;
            else if (Array.isArray(dbSearches)) terms = dbSearches;
          }
          if (terms.length === 0) {
            terms = locale === 'fr' ? DEFAULT_TRENDING_SEARCHES_FR : locale === 'ar' ? DEFAULT_TRENDING_SEARCHES_AR : DEFAULT_TRENDING_SEARCHES_EN;
          }
          return terms.map((term: string, idx: number) => (
            <button
              key={idx}
              onClick={() => { setFilterSearch(term); setShowFilterPanel(true); }}
              className="text-[10px] md:text-xs bg-white/80 dark:bg-slate-900/60 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 border border-border/80 hover:border-amber-500/50 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full whitespace-nowrap transition-all duration-300 font-bold shadow-sm snap-start"
            >
              {term}
            </button>
          ));
        })()}
        </div>
      </div>
 
      {/* Render Dynamic Order of Sections */}
      {(() => {
        const isPuckLayout = data?.layout && !Array.isArray(data.layout) && data.layout.content;
        return isLoading ? (
        <div className="container-platform py-6 space-y-10">
          <HeroSliderSkeleton />
          <CategoryCirclesSkeleton />
          <BentoPromoGridSkeleton />
        </div>
      ) : isPuckLayout ? (
        <Render config={saadaConfig as any} data={data.layout as any} />
      ) : (
        <div className="space-y-4 py-4">
          {activeLayout.map(renderSectionWithStyles)}
        </div>
      );
      })()}

      {/* ── BOTTOM AD ── */}
      {data?.advertisements?.banner_bottom && (
        <div className="container-platform mb-10 mt-6">
          <AdBanner ads={data.advertisements.banner_bottom} className="h-28" />
        </div>
      )}
    </div>
  );
}
