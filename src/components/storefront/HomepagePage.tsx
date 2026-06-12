'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';

const CURRENCY = { symbol: 'د.ج', code: 'DZD' };

const TRENDING_SEARCHES = [
  "واقيات الشمس", "العطور", "آيفون", "التلفزيونات", "بلايستيشن 5", 
  "بطاقات هدايا", "قلايات هوائية", "أواني السفرة والتقديم", 
  "أطقم القهوة والشاي", "ديكور البيت", "الأحذية"
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

const DEFAULT_TESTIMONIALS = [
  { 
    name: 'فاطمة بن علي', 
    nameEn: 'Fatima Ben Ali', 
    nameFr: 'Fatima Ben Ali',
    text: 'خدمة ممتازة وتوصيل سريع، أنصح الجميع بالتسوق من هنا!', 
    textEn: 'Excellent service and fast delivery, highly recommend shopping here!',
    textFr: 'Excellent service et livraison rapide, je recommande vivement !',
    rating: 5, 
    city: 'الجزائر العاصمة',
    cityEn: 'Algiers',
    cityFr: 'Alger'
  },
  { 
    name: 'محمد الأمين', 
    nameEn: 'Mohamed Lamine',
    nameFr: 'Mohamed Lamine',
    text: 'منصة رائعة، المنتجات أصلية والأسعار معقولة جداً', 
    textEn: 'Great platform, original products and very reasonable prices',
    textFr: 'Excellente plateforme, produits authentiques et prix très raisonnables',
    rating: 5, 
    city: 'وهران',
    cityEn: 'Oran',
    cityFr: 'Oran'
  },
];

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
  if (!ads || ads.length === 0 || !ads[0]) return null;
  const ad = ads[0];
  return (
    <a href={ad.linkUrl || '#'} className={`block overflow-hidden rounded-[24px] ${className}`} onClick={() => fetch(`/api/admin/advertisements`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ad.id, clicks: 1 }) }).catch(() => {})}>
      <div className="relative w-full h-full bg-gradient-to-r from-stone-900 via-stone-850 to-indigo-950 flex items-center justify-center p-6 border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <p className="text-amber-400 font-black text-base md:text-lg tracking-wider text-center">{ad.title}</p>
        <Badge className="absolute top-3 end-3 bg-white/10 text-white border-white/10 text-[10px]">إعلان</Badge>
      </div>
    </a>
  );
}

const LEVEL_BADGE: Record<number, string> = {
  1: '🌱', 2: '⭐', 3: '🌟', 4: '💫', 5: '🔥',
  6: '💎', 7: '👑', 8: '🏆', 9: '🦅', 10: '🌠',
};

// Standalone reusable Product Card matching Noon/Temu visuals
function ProductCard({ product, isOfferCard = false }: { product: any; isOfferCard?: boolean }) {
  const { locale } = useAppStore();
  const { items: cartItems, addItem } = useCartStore();
  const router = useRouter();
  const isAr = locale === 'ar';
  
  const isInCart = cartItems.some((item) => item.product.id === product.id);

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    toast.success(isAr ? 'تمت إضافة المنتج إلى السلة!' : 'Product added to cart!', {
      icon: <CheckCircle2 className="text-emerald-500 w-5 h-5" />
    });
  };

  const fmt = (amount: number) => {
    return `${amount.toLocaleString(isAr ? 'ar-DZ' : 'en-US')} ${isAr ? 'د.ج' : 'DZD'}`;
  };

  return (
    <Card 
      className="overflow-hidden flex flex-col h-full group transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:-translate-y-1 relative"
      onClick={() => {
        useAppStore.getState().setSelectedProductId(product.id);
        router.push(`/products/${product.id}`);
      }}
    >
      <div className="relative aspect-square bg-slate-50 dark:bg-slate-950 overflow-hidden shrink-0">
        {images[0] ? (
          <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary/10 to-primary/5">
            <ShoppingBag className="size-8 text-primary/30" />
          </div>
        )}
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

function SectionHeader({ section, isAr, locale, t, children }: SectionHeaderProps) {
  const title = getLocalizedField(section, 'title', locale) || section?.type;
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

function CustomBannerBlock({ imageArUrl, imageEnUrl, linkUrl, locale }: any) {
  const isAr = locale === 'ar';
  const imageUrl = isAr ? (imageArUrl || imageEnUrl) : (imageEnUrl || imageArUrl);

  if (!imageUrl) return null;

  const content = (
    <div className="relative w-full overflow-hidden rounded-[24px] shadow-lg border border-slate-100 dark:border-slate-800/80">
      <img src={imageUrl} alt="Banner" className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-500" />
    </div>
  );

  if (linkUrl) {
    return (
      <section className="container-platform py-4">
        <Link href={linkUrl} className="block">
          {content}
        </Link>
      </section>
    );
  }

  return (
    <section className="container-platform py-4">
      {content}
    </section>
  );
}

export default function StorefrontHomepage() {
  const router = useRouter();
  const { t: globalT } = useTranslation();
  const { locale } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const { items: cartItems, addItem } = useCartStore();
  const isAr = locale === 'ar';
  
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
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

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
        // Retrieve custom settings for Side Card 1
        const card1Badge = getLocalizedField(section, 'card1Badge', locale) || t('أحدث الهواتف', 'Latest Mobiles');
        
        const card1Title = getLocalizedField(section, 'card1Title', locale) || t('وفر حتى 50% على أجهزة شاومي وآيفون', 'Save up to 50% on iPhone & Xiaomi');
        
        const card1Cta = getLocalizedField(section, 'card1Cta', locale) || t('تسوق الأجهزة', 'Shop Devices');
        
        const card1Link = section.metadata?.card1Link || '/search?q=electronics';

        const card1Type = section.metadata?.card1Type || 'text';
        const card1AdImage = getLocalizedField(section, 'card1AdImage', locale);
        const card1AdLink = section.metadata?.card1AdLink || '#';

        // Retrieve custom settings for Side Card 2
        const card2Badge = getLocalizedField(section, 'card2Badge', locale) || t('الجمال والعطور', 'Beauty Deals');
        
        const card2Title = getLocalizedField(section, 'card2Title', locale) || t('روائح تسحر الجميع بأسعار لا تقاوم', 'Fragrances that captivate at unbeatable prices');
        
        const card2Cta = getLocalizedField(section, 'card2Cta', locale) || t('اكتشف العطور', 'Explore Now');
        
        const card2Link = section.metadata?.card2Link || '/search?q=perfumes';

        const card2Type = section.metadata?.card2Type || 'text';
        const card2AdImage = getLocalizedField(section, 'card2AdImage', locale);
        const card2AdLink = section.metadata?.card2AdLink || '#';

        return (
          <section key="hero" className="container-platform py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Main Banner Slider (9 Columns on Desktop) */}
              <div className="lg:col-span-9 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[28px] shadow-xl border border-white/5 h-[340px] md:h-[400px] group">
                <div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none z-20" />
                
                {currentHeroSlides.map((s: any, idx: number) => {
                  const isSlideActive = idx === heroIndex;
                  const sTitle = getLocalizedField(s, 'title', locale) || (locale === 'ar' ? s.titleAr : s.titleEn);
                  const sSubtitle = getLocalizedField(s, 'subtitle', locale) || (locale === 'ar' ? s.subtitleAr : s.subtitleEn);
                  const sBadge = getLocalizedField(s, 'badge', locale);
                  const sCta = getLocalizedField(s, 'ctaText', locale) || (locale === 'ar' ? s.ctaTextAr : s.ctaTextEn) || t('تسوق الآن', 'Shop Now');
                  const sBg = s.bgGradient || 'from-indigo-600 to-purple-800';

                  return (
                    <div
                      key={s.id || idx}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        isSlideActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      {s.imageUrl ? (
                        <>
                          <img src={s.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out scale-100 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-slate-950/45 mix-blend-multiply" />
                        </>
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${sBg} opacity-90`} />
                      )}
                      
                      <div className="h-full flex flex-col justify-center relative z-10 p-8 md:p-12 text-start">
                        <div className="max-w-xl">
                          {sBadge && (
                            <Badge className="mb-3.5 bg-white/10 text-white border-white/10 text-[10px] font-bold px-3 py-1 rounded-full select-none">
                              {sBadge}
                            </Badge>
                          )}
                          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight tracking-tight">
                            {sTitle}
                          </h1>
                          <p className="text-xs sm:text-sm md:text-base text-white/80 mb-6 font-medium">
                            {sSubtitle}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            {s.linkUrl ? (
                              <Link href={s.linkUrl} className="inline-block" onClick={(e) => e.stopPropagation()}>
                                <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-black px-6 py-2 rounded-xl text-xs md:text-sm shadow-lg shadow-amber-500/20 w-full sm:w-auto">
                                  {sCta}
                                  {isAr ? <ArrowLeft className="ms-2 size-4" /> : <ArrowRight className="ms-2 size-4" />}
                                </Button>
                              </Link>
                            ) : (
                              <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-black px-6 py-2 rounded-xl text-xs md:text-sm shadow-lg shadow-amber-500/20 w-full sm:w-auto">
                                {sCta}
                                {isAr ? <ArrowLeft className="ms-2 size-4" /> : <ArrowRight className="ms-2 size-4" />}
                              </Button>
                            )}
                            {!isAuthenticated && (
                              <Link href="/auth/register?role=seller" className="inline-block" onClick={(e) => e.stopPropagation()}>
                                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs md:text-sm w-full sm:w-auto">
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

                {currentHeroSlides.length > 1 && (
                  <div className="absolute bottom-6 start-1/2 -translate-x-1/2 flex gap-2 z-20 select-none">
                    {currentHeroSlides.map((_, i) => (
                      <button key={i} onClick={(e) => { e.stopPropagation(); setHeroIndex(i); }}
                        className={`h-2 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-6 bg-amber-500 shadow-md' : 'w-2 bg-white/20'}`} />
                    ))}
                  </div>
                )}
                {currentHeroSlides.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setHeroIndex((i) => (i - 1 + currentHeroSlides.length) % currentHeroSlides.length); }}
                      className="absolute start-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white z-20 hidden md:block">
                      {isAr ? <ChevronRight className="size-4.5" /> : <ChevronLeft className="size-4.5" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setHeroIndex((i) => (i + 1) % currentHeroSlides.length); }}
                      className="absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white z-20 hidden md:block">
                      {isAr ? <ChevronLeft className="size-4.5" /> : <ChevronRight className="size-4.5" />}
                    </button>
                  </>
                )}
              </div>

              {/* Side stack banners (3 Columns on Desktop, hidden on Mobile) */}
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-[340px] md:h-[400px]">
                {/* Banner Side 1: Yellow/Orange accent */}
                <div 
                  className="flex-1 rounded-[24px] bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex flex-col justify-between border border-amber-400/20 shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-all cursor-pointer" 
                  onClick={() => router.push(card1Type === 'ad' ? card1AdLink : card1Link)}
                >
                  {card1Type === 'ad' && card1AdImage ? (
                    <>
                      <img src={card1AdImage} className="absolute inset-0 w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/10 hover:bg-black/25 transition-colors" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                      <div className="z-10 p-5 text-start">
                        <Badge className="bg-slate-950 text-white text-[8px] font-bold py-0.5 px-2 mb-1.5 select-none">{card1Badge}</Badge>
                        <h4 className="text-sm font-black leading-snug">{card1Title}</h4>
                      </div>
                      <div className="z-10 flex justify-between items-center p-5 mt-3">
                        <span className="text-[10px] font-black underline">{card1Cta}</span>
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                    </>
                  )}
                </div>

                {/* Banner Side 2: Dark indigo glassmorphism */}
                <div 
                  className="flex-1 rounded-[24px] bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col justify-between border border-white/5 shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-all cursor-pointer" 
                  onClick={() => router.push(card2Type === 'ad' ? card2AdLink : card2Link)}
                >
                  {card2Type === 'ad' && card2AdImage ? (
                    <>
                      <img src={card2AdImage} className="absolute inset-0 w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/10 hover:bg-black/25 transition-colors" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-white/5 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                      <div className="z-10 p-5 text-start">
                        <Badge className="bg-white/10 text-white border-white/10 text-[8px] font-bold py-0.5 px-2 mb-1.5 select-none">{card2Badge}</Badge>
                        <h4 className="text-sm font-black leading-snug">{card2Title}</h4>
                      </div>
                      <div className="z-10 flex justify-between items-center p-5 mt-3">
                        <span className="text-[10px] font-black underline text-amber-400">{card2Cta}</span>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'features':
        return (
          <section key="features" className="container-platform py-2">
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

      case 'categories':
        const displayCats = (data?.categories ?? []).filter((c) => c && c.id).slice(0, 12);
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
              <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
                {displayCats.map((cat, idx) => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
              {/* Right Column: "نوّنها أكثر ووفر أكثر" 4x4 Promos */}
              <div className="md:col-span-1 lg:col-span-3 min-h-[300px] md:min-h-[380px] lg:min-h-[480px] rounded-[24px] bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-500/20 shadow-xl p-5 text-slate-950 flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all group relative overflow-hidden">
                {rightCardType === 'ad' && rightCardAdImage ? (
                  <Link href={rightCardAdLink} className="absolute inset-0 w-full h-full block">
                    <img src={rightCardAdImage} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                    <Badge className="absolute top-3 end-3 bg-white/10 text-white border-white/10 text-[10px]">إعلان</Badge>
                  </Link>
                ) : (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="z-10 text-start">
                      <Badge className="bg-slate-950 text-white text-[9px] font-bold py-0.5 px-2 mb-2 select-none">عروض حصرية</Badge>
                      <h3 className="text-base md:text-lg font-black leading-snug">{customText1}</h3>
                    </div>
                    <div className={`grid gap-2 md:gap-3 z-10 grow mt-4 items-start ${
                      rightCardProducts.length === 1 
                        ? "grid-cols-1 justify-items-center max-w-[140px] mx-auto" 
                        : "grid-cols-2"
                    }`}>
                      {rightCardProducts.slice(0, 4).map((p: any, i: number) => {
                        let imgs: string[] = [];
                        try { imgs = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'); } catch {}
                        return (
                          <div key={i} className="bg-white/80 backdrop-blur rounded-[12px] md:rounded-[16px] p-1.5 md:p-2 flex flex-col justify-between border border-white/25 shadow-sm hover:scale-[1.04] transition-transform cursor-pointer w-full" onClick={() => router.push(`/products/${p.id}`)}>
                            <div className="aspect-square bg-muted/20 rounded-lg overflow-hidden mb-1">
                              {imgs[0] ? <img src={imgs[0]} className="w-full h-full object-cover" alt="" /> : <div className="flex items-center justify-center h-full text-lg">📦</div>}
                            </div>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-800 line-clamp-1 text-center">{locale === 'ar' ? p.name : (p.nameEn || p.name)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Center Column: Mega Offers countdown timer — spans full width on mobile */}
              <div className="md:col-span-2 lg:col-span-6 min-h-[340px] md:min-h-[420px] lg:min-h-[480px] rounded-[24px] bg-slate-950 text-white border-2 border-rose-600/30 shadow-2xl p-5 flex flex-col justify-between hover:shadow-[0_20px_45px_rgba(244,63,94,0.15)] transition-all relative overflow-hidden order-first md:order-none">
                {centerCardType === 'ad' && centerCardAdImage ? (
                  <Link href={centerCardAdLink} className="absolute inset-0 w-full h-full block">
                    <img src={centerCardAdImage} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                    <Badge className="absolute top-3 end-3 bg-white/10 text-white border-white/10 text-[10px]">إعلان</Badge>
                  </Link>
                ) : (
                  <>
                    <div className="absolute top-0 left-0 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4 mb-3 z-10">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-rose-600/20 text-rose-500 animate-pulse">
                          <Flame className="w-5 h-5 fill-current" />
                        </div>
                        <h3 className="text-base font-black text-white">
                          {getLocalizedField(section, 'customTextCenter', locale) || (locale === 'ar' ? (data?.countdownConfig?.titleAr || 'عروض ميجا') : (data?.countdownConfig?.titleEn || 'Mega Offers'))}
                        </h3>
                      </div>
                      {hasCountdown && (section.metadata?.timerEndDate || data?.countdownConfig?.endDate) && (
                        <CountdownTimer targetDate={section.metadata?.timerEndDate || data?.countdownConfig?.endDate} />
                      )}
                    </div>
                    {isLoading ? (
                      <div className="h-48 md:h-64 bg-muted animate-pulse rounded-xl w-full" />
                    ) : timerProducts.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm grow flex flex-col items-center justify-center">
                        <Flame className="w-10 h-10 mb-2 opacity-20" />
                        {locale === 'ar' ? 'لا توجد عروض تنازلية نشطة حالياً.' : 'No active discount deals at the moment.'}
                      </div>
                    ) : (
                      <div className={`grid gap-3 md:gap-4 grow h-full max-h-[350px] lg:max-h-none overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-1 items-start ${
                        timerProducts.length === 1 
                          ? "grid-cols-1 justify-items-center max-w-[220px] mx-auto w-full" 
                          : timerProducts.length === 2 
                            ? "grid-cols-2 justify-items-center max-w-[440px] mx-auto w-full" 
                            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
                      }`}>
                        {timerProducts.map((p: any) => <ProductCard key={p.id} product={p} isOfferCard={true} />)}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Left Column: "عليها العين" vertical 2x2 promo */}
              <div className="md:col-span-1 lg:col-span-3 min-h-[300px] md:min-h-[380px] lg:min-h-[480px] rounded-[24px] bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/5 shadow-xl p-5 text-white flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all group relative overflow-hidden">
                {leftCardType === 'ad' && leftCardAdImage ? (
                  <Link href={leftCardAdLink} className="absolute inset-0 w-full h-full block">
                    <img src={leftCardAdImage} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                    <Badge className="absolute top-3 end-3 bg-white/10 text-white border-white/10 text-[10px]">إعلان</Badge>
                  </Link>
                ) : (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="z-10 flex justify-between items-center text-start">
                      <h3 className="text-base font-black flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        {customText2}
                      </h3>
                      <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/15 cursor-pointer text-[9px] py-0.5 px-2" onClick={() => router.push('/search')}>{globalT('homepage.viewAll') || 'عرض الكل'}</Badge>
                    </div>
                    <div className="flex flex-col gap-3 z-10 grow mt-4 overflow-y-auto h-full max-h-[350px] lg:max-h-[390px] scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-1">
                      {leftCardProducts.map((p: any, i: number) => {
                        let imgs: string[] = [];
                        try { imgs = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'); } catch {}
                        const discount = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
                        return (
                          <div key={i} className="bg-white/5 border border-white/10 hover:border-white/20 rounded-[18px] p-3 flex items-center gap-3 cursor-pointer hover:scale-[1.03] transition-all shrink-0" onClick={() => router.push(`/products/${p.id}`)}>
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-lg overflow-hidden shrink-0">
                              {imgs[0] ? <img src={imgs[0]} className="w-full h-full object-cover" alt="" /> : <div className="flex items-center justify-center h-full text-lg">📦</div>}
                            </div>
                            <div className="min-w-0 grow text-start">
                              <h4 className="text-xs font-bold truncate">{locale === 'ar' ? p.name : (p.nameEn || p.name)}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black text-amber-400">{fmt(p.price)}</span>
                                {discount > 0 && <span className="text-[9px] bg-red-600 px-1 py-0.5 rounded font-black">-{discount}%</span>}
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
          <section key="featured_products" className="container-platform py-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-black text-navy dark:text-white">
                  {getLocalizedField(section, 'title', locale) || t('منتجات مميزة', 'Featured Products')}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{t('اختيارات حصرية من أفضل التجار', 'Exclusive picks from top sellers')}</p>
              </div>
              <Button
                variant={showFilterPanel ? 'default' : 'outline'}
                size="sm"
                className="gap-2 relative rounded-xl border-border/80"
                onClick={() => setShowFilterPanel(p => !p)}
              >
                <SlidersHorizontal className="size-4" />
                {t('فلتر', 'Filter')}
                {hasActiveFilters && (
                  <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-amber-500 shadow shadow-amber-500/40" />
                )}
              </Button>
            </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {productsToShow
                  .filter((product: any) => product && product.id)
                  .slice(0, section.limit ? Math.min(displayCount, section.limit) : displayCount)
                  .map((product: any) => <ProductCard key={product.id} product={product} />)}
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
          </section>
        );

      case 'top_sellers':
        const stores = (data?.topStores || []).slice(0, section.limit || 8);
        const sellers = (data?.topSellers || []).slice(0, section.limit || 8);

        return (
          <section key="top_sellers" className="bg-gradient-to-br from-stone-950 via-slate-900 to-indigo-950 text-white py-16 mt-12 relative overflow-hidden border-y border-white/5">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
              <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[120px]" />
            </div>
            <div className="container-platform relative z-10">
              <div className="text-center mb-10 px-4 max-w-2xl mx-auto">
                <Badge className="mb-3.5 bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs px-3.5 py-1.5 rounded-full select-none">
                  ⭐ {getLocalizedField(section, 'badge', locale) || t('تجار شاري داي المميزين', 'ChariDay Top Merchants')}
                </Badge>
                <h3 className="text-2xl md:text-4xl font-black mb-3.5 leading-tight tracking-tight font-cairo">
                  {getLocalizedField(section, 'title', locale) || t('تسوق من الشركاء الموثوقين', 'Shop from Our Certified Partners')}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
                  {t('نوفر لك نخبة من كبرى المتاجر الجزائرية والتجار الأحرار الموثقين بشارات الجودة والمستويات الاحترافية.', 'We connect you with premier Algerian stores and verified independent merchants possessing professional badges.')}
                </p>
                <div className="inline-flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mt-8 gap-1.5 font-cairo select-none">
                  <button
                    onClick={() => setActiveMerchantTab('stores')}
                    className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all ${
                      activeMerchantTab === 'stores' ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]' : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    🏪 {t('المتاجر الكبرى المتميزة', 'Premium Stores')}
                  </button>
                  <button
                    onClick={() => setActiveMerchantTab('sellers')}
                    className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all ${
                      activeMerchantTab === 'sellers' ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]' : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    💼 {t('التجار المستقلون الأحرار', 'Independent Sellers')}
                  </button>
                </div>
              </div>
              
              {activeMerchantTab === 'stores' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 font-cairo">
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
                        className="bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all duration-300 cursor-pointer group text-white shadow-xl rounded-[24px] hover:scale-105"
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
                            <h4 className="font-black text-sm md:text-base truncate group-hover:text-amber-400 transition-colors">
                              {isAr ? store.name : (store.nameEn || store.name)}
                            </h4>
                            <p className="text-[10px] text-white/40 mt-1.5 truncate">
                              👤 {t('مدير المتجر:', 'Manager:')} {store.manager?.name || ''}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/5 w-full font-bold">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs">{store.rating.toFixed(1)}</span>
                            <span className="text-white/30 text-[10px]">•</span>
                            <span className="text-white/50 text-[10px]">{store._count?.products || 0} {t('منتج', 'products')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeMerchantTab === 'sellers' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 font-cairo">
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
                        className="bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all duration-300 cursor-pointer group text-white shadow-xl rounded-[24px] hover:scale-105"
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
                            <h4 className="font-black text-sm md:text-base truncate group-hover:text-amber-400 transition-colors">
                              {seller.storeName || seller.user?.name}
                            </h4>
                            <p className="text-[10px] text-white/40 mt-1.5 truncate">
                              💼 {t('تاجر مستقل معتمد', 'Certified Freelance Merchant')}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/5 w-full font-bold">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs">{seller.rating.toFixed(1)}</span>
                            <span className="text-white/30 text-[10px]">•</span>
                            <span className="text-white/50 text-[10px]">{seller._count?.products || 0} {t('منتج', 'products')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
              <div className="flex justify-center mt-10 select-none">
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

      case 'testimonials':
        return (
          <section key="testimonials" className="container-platform py-14 text-start">
            <SectionHeader section={section} isAr={isAr} locale={locale} t={t} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(data?.testimonials?.length ? data.testimonials : DEFAULT_TESTIMONIALS)
                .filter((t2) => t2 && typeof t2 === 'object')
                .map((t2, i) => (
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

      case 'cta':
        return (
          <section key="cta" className="container-platform py-6">
            <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-indigo-950 text-white rounded-[28px] border border-white/5 py-12 px-6 md:px-12 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-black mb-3 text-amber-400">{t('ابدأ البيع اليوم!', 'Start Selling Today!')}</h3>
                <p className="text-xs md:text-sm text-white/80 mb-8 leading-relaxed font-medium">
                  {t('انضم لآلاف التجار الناجحين على منصة شاري داي وابدأ رحلتك نحو النجاح التجاري', 'Join thousands of successful sellers on ChariDay and start your journey to commercial success')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                  <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-black px-8 rounded-xl shadow-lg shadow-amber-500/20">
                    {t('أنشئ حساب تاجر', 'Create Seller Account')}
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 rounded-xl">
                    {t('تعرف على الباقات', 'View Packages')}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );

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
    // Map items to normalized objects
    const mapped = data.layout
      .filter((sect: any) => {
        if (!sect) return false;
        return typeof sect === 'string' ? true : sect.visible !== false;
      })
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

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-slate-950 font-cairo">
      {/* ── TOP AD BANNER ── */}
      {data?.advertisements?.banner_top && (
        <div className="h-14 w-full">
          <AdBanner ads={data.advertisements.banner_top} className="h-full rounded-none" />
        </div>
      )}
 
      {/* ── TRENDING SEARCH SUGGESTIONS ── */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/10 px-4 md:px-8 select-none snap-x snap-mandatory">
        <span className="text-[10px] md:text-xs font-black text-slate-500 shrink-0 flex items-center gap-1.5 snap-start">
          <Search className="w-3.5 h-3.5" />
          {globalT('homepage.searchSuggestions') || 'البحث الشائع:'}
        </span>
        {TRENDING_SEARCHES.map((term, idx) => (
          <button 
            key={idx} 
            onClick={() => {
              setFilterSearch(term);
              setShowFilterPanel(true);
            }} 
            className="text-[10px] md:text-xs bg-white/80 dark:bg-slate-900/60 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 border border-border/80 hover:border-amber-500/50 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full whitespace-nowrap transition-all duration-300 font-bold shadow-sm snap-start"
          >
            {term}
          </button>
        ))}
      </div>
 
      {/* Render Dynamic Order of Sections */}
      {isLoading ? (
        <div className="container-platform py-6 space-y-10">
          <HeroSliderSkeleton />
          <CategoryCirclesSkeleton />
          <BentoPromoGridSkeleton />
        </div>
      ) : (
        <div className="space-y-4 py-4">
          {activeLayout.map((section) => renderSection(section))}
        </div>
      )}

      {/* ── BOTTOM AD ── */}
      {data?.advertisements?.banner_bottom && (
        <div className="container-platform mb-10 mt-6">
          <AdBanner ads={data.advertisements.banner_bottom} className="h-28" />
        </div>
      )}
    </div>
  );
}
