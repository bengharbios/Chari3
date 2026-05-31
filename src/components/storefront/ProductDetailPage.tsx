'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star, ShoppingCart, Heart, Share2, Shield, Truck, RefreshCw,
  ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Package,
  MessageCircle, ThumbsUp, Award
} from 'lucide-react';
import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const CURRENCY = { symbol: 'د.ج' };
const fmt = (n: number) => `${n.toLocaleString('ar-DZ')} ${CURRENCY.symbol}`;

const LEVEL_BADGE: Record<number, string> = {
  1: '🌱', 2: '⭐', 3: '🌟', 4: '💫', 5: '🔥',
  6: '💎', 7: '👑', 8: '🏆', 9: '🦅', 10: '🌠',
};

interface ProductVariantItem {
  id: string;
  name: string;
  value: string;
  sku?: string;
  price?: number | null;
  comparePrice?: number | null;
  stock: number;
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
  swatchType?: string | null;
  swatchValue?: string | null;
}

interface ProductDetail {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  status: string;
  isFeatured: boolean;
  specifications?: string;
  sku?: string | null;
  variants?: ProductVariantItem[];
  volumeDiscounts?: string | null;
  urgencySettings?: string | null;
  category: { name: string; nameEn?: string };
  seller?: {
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
    _count?: { products: number };
  } | null;
  store?: {
    id: string;
    name?: string;
    nameEn?: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    rating: number;
    level: number;
    totalSales: number;
    totalCustomers: number;
    isActive: boolean;
    _count?: { products: number };
  } | null;
  brand?: {
    id: string;
    name: string;
    nameEn?: string | null;
    logo?: string | null;
  } | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string;
  rating: number;
  soldCount: number;
}

const ALGERIAN_PROVINCES = [
  { key: 'algiers', nameAr: 'الجزائر العاصمة', nameEn: 'Algiers', daysMin: 1, daysMax: 2, fee: 400 },
  { key: 'oran', nameAr: 'وهران', nameEn: 'Oran', daysMin: 2, daysMax: 3, fee: 600 },
  { key: 'constantine', nameAr: 'قسنطينة', nameEn: 'Constantine', daysMin: 2, daysMax: 3, fee: 600 },
  { key: 'adrar', nameAr: 'أدرار', nameEn: 'Adrar', daysMin: 5, daysMax: 7, fee: 900 },
];

function StarRating({ rating, interactive = false, size = 'sm' }: { rating: number; interactive?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${sizes[size]} ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:fill-amber-300' : ''}`} />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { locale, selectedProductId, setCurrentPage } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const isInCart = useCartStore((s) => s.items.some((i) => i.product.id === product?.id));

  // Reviews state
  const [reviews, setReviews] = useState<{
    id: string; rating: number; comment?: string; title?: string;
    createdAt: string; user?: { name?: string; nameEn?: string };
  }[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  // Variant States
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Platform and dynamic features states
  const [platformSettings, setPlatformSettings] = useState({
    enable_urgency_triggers: 'true',
    enable_delivery_calculator: 'true',
    enable_volume_discounts: 'true',
    enable_product_qa: 'true',
  });
  const [qas, setQas] = useState<{
    id: string; question: string; answer?: string | null;
    status: string; createdAt: string;
  }[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [qaSuccessMessage, setQaSuccessMessage] = useState('');
  const [qaErrorMessage, setQaErrorMessage] = useState('');
  const [simulatedViews, setSimulatedViews] = useState(15);
  const [simulatedOrders, setSimulatedOrders] = useState(8);
  const [activeTab, setActiveTab] = useState<'reviews' | 'qa'>('reviews');
  const [selectedProvince, setSelectedProvince] = useState('algiers');

  let images: string[] = [];
  if (product) {
    try {
      if (typeof product.images === 'string') {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) images = parsed;
      } else if (Array.isArray(product.images)) {
        images = product.images;
      }
    } catch {}
  }
  if (!Array.isArray(images)) images = [];

  useEffect(() => {
    if (!selectedProductId) { setCurrentPage('home'); return; }
    setIsLoading(true);

    // Fetch platform feature settings toggles
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.settings) {
          setPlatformSettings({
            enable_urgency_triggers: d.settings.enable_urgency_triggers !== undefined ? String(d.settings.enable_urgency_triggers) : 'true',
            enable_delivery_calculator: d.settings.enable_delivery_calculator !== undefined ? String(d.settings.enable_delivery_calculator) : 'true',
            enable_volume_discounts: d.settings.enable_volume_discounts !== undefined ? String(d.settings.enable_volume_discounts) : 'true',
            enable_product_qa: d.settings.enable_product_qa !== undefined ? String(d.settings.enable_product_qa) : 'true',
          });
        }
      })
      .catch(() => {});

    // Fetch approved Q&As
    fetch(`/api/products/qa?productId=${selectedProductId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setQas(d.qas || []);
        }
      })
      .catch(() => {});

    fetch(`/api/products/${selectedProductId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProduct(d.product);
          setRelated(d.related || []);
          
          // Pre-select variants
          if (d.product.variants && d.product.variants.length > 0) {
            const colorVariant = d.product.variants.find((v: any) => v.name === 'اللون' || v.name === 'Color' || v.name === 'color');
            const sizeVariant = d.product.variants.find((v: any) => v.name === 'المقاس' || v.name === 'Size' || v.name === 'size');
            if (colorVariant) setSelectedColor(colorVariant.value);
            if (sizeVariant) setSelectedSize(sizeVariant.value);
          } else {
            let s: any = {};
            try {
              s = typeof d.product.specifications === 'string'
                ? JSON.parse(d.product.specifications)
                : d.product.specifications || {};
            } catch {}
            
            const c1 = s.color1 !== undefined && s.color1 !== null ? String(s.color1).trim() : '';
            if (c1) setSelectedColor(c1);
            else setSelectedColor('');
            
            let firstSize = '';
            if (s.sizes !== undefined && s.sizes !== null) {
              if (Array.isArray(s.sizes)) {
                firstSize = s.sizes[0] !== undefined && s.sizes[0] !== null ? String(s.sizes[0]).trim() : '';
              } else {
                const arr = String(s.sizes).split(',').map((x: string) => x.trim()).filter(Boolean);
                firstSize = arr[0] || '';
              }
            }
            setSelectedSize(firstSize);
          }
          
          // Fetch reviews for this product
          fetch(`/api/reviews?productId=${selectedProductId}`)
            .then(r => r.json())
            .then(rd => {
              if (rd.success) {
                setReviews(rd.reviews || []);
                setAvgRating(rd.avgRating || 0);
                setReviewsTotal(rd.total || 0);
              }
            }).catch(() => {});
        } else setCurrentPage('home');
      })
      .catch(() => setCurrentPage('home'))
      .finally(() => setIsLoading(false));
  }, [selectedProductId]);

  // Dynamic Browser Document Title and Meta Description for SEO
  useEffect(() => {
    if (product) {
      let s: any = {};
      try {
        s = typeof product.specifications === 'string'
          ? JSON.parse(product.specifications)
          : product.specifications || {};
      } catch {}
      const title = s.seoTitle || product.name;
      const desc = s.seoDescription || product.description || '';
      if (title && typeof window !== 'undefined') {
        document.title = `${title} - ChariDay`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', desc);
      }
    }
  }, [product]);

  // Setup Simulated Urgency stats
  useEffect(() => {
    if (product) {
      if (product.urgencySettings) {
        try {
          const u = typeof product.urgencySettings === 'string'
            ? JSON.parse(product.urgencySettings)
            : product.urgencySettings;
          const minV = parseInt(u.minViews || '5');
          const maxV = parseInt(u.maxViews || '25');
          setSimulatedViews(Math.floor(Math.random() * (maxV - minV + 1)) + minV);

          const minO = parseInt(u.minOrders || '2');
          const maxO = parseInt(u.maxOrders || '10');
          setSimulatedOrders(Math.floor(Math.random() * (maxO - minO + 1)) + minO);
        } catch {}
      } else {
        setSimulatedViews(Math.floor(Math.random() * 20) + 10);
        setSimulatedOrders(Math.floor(Math.random() * 8) + 3);
      }
    }
  }, [product]);

  // Dynamic date ranges calculation for Delivery Estimator
  const getDeliveryDateRange = (minDays: number, maxDays: number) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + minDays);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    
    const minStr = minDate.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', options);
    const maxStr = maxDate.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', options);
    
    return { minStr, maxStr };
  };

  // Find current matching variant
  const getSelectedVariant = () => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    
    // Look up matching color
    const colorVar = product.variants.find((v: any) => 
      (v.name === 'اللون' || v.name === 'Color' || v.name === 'color') && v.value === selectedColor
    );
    // Look up matching size
    const sizeVar = product.variants.find((v: any) => 
      (v.name === 'المقاس' || v.name === 'Size' || v.name === 'size') && v.value === selectedSize
    );
    
    if (colorVar && (colorVar.price !== null || colorVar.image !== null)) return colorVar;
    if (sizeVar && (sizeVar.price !== null)) return sizeVar;
    return colorVar || sizeVar || null;
  };

  const activeVariant = getSelectedVariant();
  const displayPrice = activeVariant?.price !== null && activeVariant?.price !== undefined 
    ? activeVariant.price 
    : product?.price || 0;

  const displayComparePrice = activeVariant && activeVariant.comparePrice !== null && activeVariant.comparePrice !== undefined
    ? activeVariant.comparePrice
    : product?.comparePrice || 0;

  const displayStock = activeVariant && activeVariant.stock !== null && activeVariant.stock !== undefined
    ? activeVariant.stock
    : product?.stock || 0;

  const discount = displayComparePrice
    ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    
    // Parse volume discounts
    let discounts: { minQty: number; discountPercent: number }[] = [];
    if (product.volumeDiscounts) {
      try {
        const parsed = typeof product.volumeDiscounts === 'string'
          ? JSON.parse(product.volumeDiscounts)
          : product.volumeDiscounts;
        if (Array.isArray(parsed)) {
          discounts = parsed.sort((a, b) => a.minQty - b.minQty);
        }
      } catch {}
    }

    // Find if active volume discount tier matches qty
    const matchingDiscount = [...discounts]
      .reverse()
      .find(d => qty >= d.minQty);
    
    let finalUnitPrice = displayPrice;
    if (matchingDiscount && platformSettings.enable_volume_discounts === 'true') {
      finalUnitPrice = displayPrice * (1 - matchingDiscount.discountPercent / 100);
    }
    
    const variantName = [selectedColor, selectedSize].filter(Boolean).join(' / ');
    const displayName = isAr ? product.name : (product.nameEn || product.name);
    const cartProduct = {
      ...product,
      price: finalUnitPrice,
      name: variantName ? `${displayName} (${variantName})` : displayName,
      images: images.length > 0 ? images : ['/images/placeholder.jpg'],
    };
    
    useCartStore.getState().addItem(cartProduct as any, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const merchant = product?.seller || (product?.store ? {
    id: product.store.id,
    storeName: product.store.name,
    storeNameEn: product.store.nameEn,
    bio: product.store.description,
    logo: product.store.logo,
    coverImage: product.store.coverImage,
    rating: product.store.rating,
    level: product.store.level,
    totalSales: product.store.totalSales,
    totalCustomers: product.store.totalCustomers,
    isVerified: product.store.isActive,
    _count: product.store._count
  } : null);

  const goToSeller = () => {
    if (merchant?.id) {
      useAppStore.getState().setSelectedSellerId(merchant.id);
      router.push(`/sellers/${merchant.id}`);
    }
  };



  useEffect(() => {
    if (activeVariant && activeVariant.image && images.length > 0) {
      const idx = images.indexOf(activeVariant.image);
      if (idx !== -1) {
        setSelectedImg(idx);
      }
    }
  }, [selectedColor, selectedSize, activeVariant]);

  if (isLoading) {
    return (
      <div className="container-platform py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-12 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Extract custom specifications structure
  let specs: any = {};
  try {
    specs = typeof product.specifications === 'string'
      ? JSON.parse(product.specifications)
      : product.specifications || {};
  } catch {}

  // Safe variants parsing from specifications to prevent crashes
  const color1Str = specs.color1 !== undefined && specs.color1 !== null ? String(specs.color1).trim() : '';
  const color2Str = specs.color2 !== undefined && specs.color2 !== null ? String(specs.color2).trim() : '';
  let sizesArr: string[] = [];
  if (specs.sizes !== undefined && specs.sizes !== null) {
    if (Array.isArray(specs.sizes)) {
      sizesArr = specs.sizes.map((s: any) => String(s).trim()).filter(Boolean);
    } else {
      sizesArr = String(specs.sizes)
        .split(',')
        .map((x: string) => x.trim())
        .filter(Boolean);
    }
  }

  // Generate JSON-LD Rich Snippet for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': isAr ? product.name : (product.nameEn || product.name),
    'description': product.description || '',
    'image': images,
    'sku': product.sku || `sku-${product.id}`,
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'DZD',
      'price': displayPrice,
      'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'availability': displayStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'itemCondition': 'https://schema.org/NewCondition',
      'seller': {
        '@type': 'Organization',
        'name': isAr ? (merchant?.storeName || 'شاري داي') : (merchant?.storeNameEn || 'ChariDay'),
      },
    },
    ...(reviewsTotal > 0 ? {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': avgRating || product.rating || 5,
        'reviewCount': reviewsTotal,
      }
    } : {})
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic SEO Rich Snippet Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container-platform py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <button onClick={() => router.push('/')} className="hover:text-primary transition-colors">
              {t('الرئيسية', 'Home')}
            </button>
            {isAr ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            <span className="text-xs">{product.category?.name || ''}</span>
            {isAr ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-platform py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ── IMAGE GALLERY ── */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border group">
              {images[selectedImg] ? (
                <img
                  src={images[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="size-24 text-muted-foreground/30" />
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-4 start-4 bg-red-500 text-white text-sm font-bold px-3 py-1">
                  -{discount}%
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="absolute top-4 end-4 bg-amber-500 text-white text-xs">
                  ⭐ {t('مميز', 'Featured')}
                </Badge>
              )}
              {/* Nav arrows for gallery */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute start-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100">
                    {isAr ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                  </button>
                  <button onClick={() => setSelectedImg(i => (i + 1) % images.length)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100">
                    {isAr ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImg ? 'border-primary scale-105' : 'border-border hover:border-primary/50'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="space-y-5">
            {/* Category & Title */}
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-sm text-muted-foreground">{isAr ? product.category?.name : (product.category?.nameEn || product.category?.name)}</span>
                {product.brand && (
                  <>
                    <span className="text-xs text-muted-foreground/60">•</span>
                    <span className="text-xs font-bold text-brand bg-brand/10 dark:bg-brand/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      {product.brand.logo && (
                        <img src={product.brand.logo} alt={product.brand.name} className="h-3 w-3 object-cover rounded-full" />
                      )}
                      {isAr ? product.brand.name : (product.brand.nameEn || product.brand.name)}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black leading-tight text-foreground">{isAr ? product.name : (product.nameEn || product.name)}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 flex-wrap">
              <StarRating rating={product.rating ?? 0} size="md" />
              <span className="text-sm font-semibold">{(product.rating ?? 0).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount ?? 0} {t('تقييم', 'reviews')})</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{(product.soldCount ?? 0).toLocaleString()} {t('مبيعة', 'sold')}</span>
            </div>

            {/* Price */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-end gap-3 flex-wrap">
                <p className="text-3xl md:text-4xl font-black text-primary">{fmt(displayPrice)}</p>
                {displayComparePrice && (
                  <div className="mb-1">
                    <p className="text-lg text-muted-foreground line-through">{fmt(displayComparePrice)}</p>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                      {t(`وفر ${fmt(displayComparePrice - displayPrice)}`, `Save ${fmt(displayComparePrice - displayPrice)}`)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Social Proof & Urgency Triggers */}
            {platformSettings.enable_urgency_triggers === 'true' && (
              <div className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </div>
                <p className="text-xs font-black font-cairo">
                  {t(
                    `🔥 يشاهد هذا المنتج الآن ${simulatedViews} عملاء! تم طلبه ${simulatedOrders} مرات اليوم في الساعات الماضية.`,
                    `🔥 ${simulatedViews} customers are viewing this now! Ordered ${simulatedOrders} times today in recent hours.`
                  )}
                </p>
              </div>
            )}

            {/* Amazon-Style Bullet Points / High-Converting Features */}
            {specs.bullets && Array.isArray(specs.bullets) && specs.bullets.filter(Boolean).length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-border space-y-2 font-cairo">
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">{t('مميزات وفوائد المنتج:', 'Product Benefits & Features:')}</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {specs.bullets.filter(Boolean).map((bullet: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0">✓</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className={`size-2.5 rounded-full ${displayStock > 10 ? 'bg-green-500' : displayStock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {displayStock > 10 ? t('متوفر في المخزن', 'In Stock') :
                  displayStock > 0 ? t(`متبقي ${displayStock} فقط!`, `Only ${displayStock} left!`) :
                    t('غير متوفر', 'Out of Stock')}
              </span>
            </div>

            {/* Color Swatch Picker or Specification Fallback */}
            {product.variants && product.variants.some((v: any) => v.name === 'اللون' || v.name === 'Color' || v.name === 'color') ? (
              <div className="space-y-2">
                <span className="text-sm font-medium">
                  {t('اللون:', 'Color:')}{' '}
                  <span className="font-bold text-foreground">
                    {product.variants.find((v: any) => v.value === selectedColor)?.value || selectedColor}
                  </span>
                </span>
                <div className="flex gap-2.5 flex-wrap">
                  {product.variants
                    .filter((v: any) => v.name === 'اللون' || v.name === 'Color' || v.name === 'color')
                    .map((v: any) => {
                      const isHex = v.value.startsWith('#') || (v.swatchType === 'color' && v.swatchValue);
                      const colorVal = (v.swatchType === 'color' && v.swatchValue) ? v.swatchValue : v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedColor(v.value)}
                          className={`relative size-8 rounded-full border-2 transition-all flex items-center justify-center ${
                            selectedColor === v.value
                              ? 'border-primary scale-110 shadow-md'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                          title={v.value}
                        >
                          {isHex ? (
                            <span 
                              className="size-full rounded-full border border-black/10" 
                              style={{ backgroundColor: colorVal }} 
                            />
                          ) : (
                            <span className="text-[10px] font-bold px-2 truncate max-w-full">{v.value}</span>
                          )}
                          {selectedColor === v.value && (
                            <span className="absolute size-2.5 bg-white rounded-full shadow" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : (
              (color1Str || color2Str) && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('اللون:', 'Color:')} <span className="font-bold text-foreground">{selectedColor}</span></span>
                  <div className="flex gap-2">
                    {[color1Str, color2Str].filter(Boolean).map((col: string) => {
                      const isHex = col.startsWith('#');
                      return (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(col)}
                          className={`relative size-8 rounded-full border-2 transition-all flex items-center justify-center ${
                            selectedColor === col
                              ? 'border-primary scale-110 shadow-md'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                          title={col}
                        >
                          {isHex ? (
                            <span 
                              className="size-full rounded-full border border-black/10" 
                              style={{ backgroundColor: col }} 
                            />
                          ) : (
                            <span className="text-xs font-bold px-2 truncate max-w-full">{col}</span>
                          )}
                          {selectedColor === col && (
                            <span className="absolute size-2.5 bg-white rounded-full shadow" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}

            {/* Size Variant Selector */}
            {product.variants && product.variants.some((v: any) => v.name === 'المقاس' || v.name === 'Size' || v.name === 'size') ? (
              <div className="space-y-2">
                <span className="text-sm font-medium">{t('المقاس:', 'Size:')} <span className="font-bold text-foreground">{selectedSize}</span></span>
                <div className="flex gap-2 flex-wrap">
                  {product.variants
                    .filter((v: any) => v.name === 'المقاس' || v.name === 'Size' || v.name === 'size')
                    .map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedSize(v.value)}
                        className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-bold ${
                          selectedSize === v.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                            : 'border-border bg-transparent text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        {v.value}
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              sizesArr.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('المقاس:', 'Size:')} <span className="font-bold text-foreground">{selectedSize}</span></span>
                  <div className="flex gap-2 flex-wrap">
                    {sizesArr.map((sz: string) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-bold ${
                          selectedSize === sz
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                            : 'border-border bg-transparent text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Volume Tier Pricing savings card */}
            {platformSettings.enable_volume_discounts === 'true' && (
              (() => {
                let discounts: { minQty: number; discountPercent: number }[] = [];
                if (product.volumeDiscounts) {
                  try {
                    const parsed = typeof product.volumeDiscounts === 'string'
                      ? JSON.parse(product.volumeDiscounts)
                      : product.volumeDiscounts;
                    if (Array.isArray(parsed)) {
                      discounts = parsed.sort((a, b) => a.minQty - b.minQty);
                    }
                  } catch {}
                }
                
                if (discounts.length === 0) return null;

                return (
                  <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-cairo">
                      <span>🏷️ {t('عروض الشراء بالجملة والتوفير:', 'Volume Tier Pricing & Savings:')}</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2.5 text-center mt-2">
                      <div className="p-2 bg-background rounded-xl border border-border flex flex-col justify-center">
                        <span className="text-xs font-bold text-muted-foreground">{t('قطعة واحدة', '1 Unit')}</span>
                        <span className="text-sm font-black text-foreground mt-1">{fmt(displayPrice)}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{t('السعر الأساسي', 'Base Price')}</span>
                      </div>
                      {discounts.map((d, i) => {
                        const unitPrice = displayPrice * (1 - d.discountPercent / 100);
                        return (
                          <div 
                            key={i} 
                            className={`p-2 rounded-xl border flex flex-col justify-center transition-all ${
                              qty >= d.minQty 
                                ? 'bg-amber-500/10 border-amber-500/30 scale-105 shadow-sm' 
                                : 'bg-background border-border'
                            }`}
                          >
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{d.minQty}+ {t('قطع', 'Units')}</span>
                            <span className="text-sm font-black text-foreground mt-1">{fmt(unitPrice)}</span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {t(`خصم ${d.discountPercent}%`, `Save ${d.discountPercent}%`)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Real-time discount notification state based on qty */}
                    {(() => {
                      const matchingDiscount = [...discounts]
                        .reverse()
                        .find(d => qty >= d.minQty);
                      if (matchingDiscount) {
                        const savedAmount = displayPrice * (matchingDiscount.discountPercent / 100) * qty;
                        return (
                          <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg flex items-center justify-center gap-1">
                            <span>🎉 {t(`تهانينا! تم تطبيق خصم الكميات. وفرت ${fmt(savedAmount)}!`, `Congratulations! Bulk discount applied. You saved ${fmt(savedAmount)}!`)}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                );
              })()
            )}

            {/* Quantity + Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{t('الكمية:', 'Qty:')}</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-2.5 hover:bg-muted text-lg font-bold transition-colors">−</button>
                  <span className="px-5 py-2.5 font-bold min-w-[50px] text-center border-x border-border">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(displayStock, q + 1))}
                    className="px-4 py-2.5 hover:bg-muted text-lg font-bold transition-colors">+</button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className={`flex-1 gap-2 text-base font-bold h-13 transition-colors ${
                    isInCart 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : ''
                  }`}
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className={`size-5 ${isInCart ? 'fill-current' : ''}`} />
                  {addedToCart 
                    ? t('✓ تم الإضافة!', '✓ Added!') 
                    : isInCart 
                      ? t('في السلة (أضف المزيد)', 'In Cart (Add More)') 
                      : t('أضف للسلة', 'Add to Cart')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`px-4 h-13 ${wishlist ? 'text-red-500 border-red-500 bg-red-50 dark:bg-red-950' : ''}`}
                  onClick={() => setWishlist(!wishlist)}
                >
                  <Heart className={`size-5 ${wishlist ? 'fill-red-500' : ''}`} />
                </Button>
                <Button size="lg" variant="outline" className="px-4 h-13">
                  <Share2 className="size-5" />
                </Button>
              </div>

              <Button size="lg" variant="secondary" className="w-full h-13 text-base font-bold gap-2" onClick={handleAddToCart} disabled={product.stock === 0}>
                ⚡ {t('اشتر الآن', 'Buy Now')}
              </Button>
            </div>

            {/* Interactive Estimated Delivery Calculator */}
            {platformSettings.enable_delivery_calculator === 'true' && (
              <Card className="border border-border/80 rounded-2xl shadow-sm overflow-hidden bg-slate-50/50 dark:bg-slate-900/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="size-5 text-primary" />
                      <span className="text-sm font-bold text-foreground font-cairo">{t('حساب موعد وتكلفة التوصيل:', 'Delivery Estimate & Cost:')}</span>
                    </div>
                    {/* Province selector dropdown */}
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="text-xs font-semibold bg-background border border-border rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="algiers">📍 {t('الجزائر العاصمة', 'Algiers')}</option>
                      <option value="oran">📍 {t('وهران', 'Oran')}</option>
                      <option value="constantine">📍 {t('قسنطينة', 'Constantine')}</option>
                      <option value="adrar">📍 {t('أدرار', 'Adrar')}</option>
                    </select>
                  </div>

                  {/* Dynamic delivery dates and fee calculation */}
                  {(() => {
                    const prov = ALGERIAN_PROVINCES.find(p => p.key === selectedProvince) || ALGERIAN_PROVINCES[0];
                    const { minStr, maxStr } = getDeliveryDateRange(prov.daysMin, prov.daysMax);
                    return (
                      <div className="space-y-2 text-start font-cairo">
                        <div className="flex items-start gap-2.5">
                          <div className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-ping" />
                          <div>
                            <p className="text-xs text-muted-foreground">{t('توصيل متوقع خلال:', 'Estimated Delivery Date:')}</p>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {t(`${minStr} - ${maxStr}`, `${minStr} - ${maxStr}`)}
                              <span className="text-xs text-muted-foreground font-normal block md:inline md:ms-2">
                                ({t(`من ${prov.daysMin} إلى ${prov.daysMax} أيام عمل`, `${prov.daysMin}-${prov.daysMax} business days`)})
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs">
                          <span className="text-muted-foreground">{t('تكلفة الشحن لهذه الولاية:', 'Shipping Fee to this province:')}</span>
                          <span className="font-black text-primary">{fmt(prov.fee)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Shield, label: t('دفع آمن', 'Secure Pay') },
                { icon: Truck, label: t('توصيل سريع', 'Fast Ship') },
                { icon: RefreshCw, label: t('إرجاع مجاني', 'Free Return') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-center">
                  <Icon className="size-5 text-primary" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MERCHANT CARD ── */}
        {merchant && (
          <Card className="mt-10 overflow-hidden border-border hover:border-primary/30 transition-all">
            {merchant.coverImage && (
              <div className="h-24 overflow-hidden">
                <img src={merchant.coverImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="relative shrink-0">
                  {merchant.logo ? (
                    <img src={merchant.logo} alt={merchant.storeName || ''} className="size-16 rounded-xl object-cover border-2 border-border" />
                  ) : (
                    <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">🏪</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-foreground">{isAr ? merchant.storeName : (merchant.storeNameEn || merchant.storeName)}</h3>
                    <span className="text-xl" title={`Level ${merchant.level}`}>{LEVEL_BADGE[merchant.level] || '🌱'}</span>
                    {merchant.isVerified && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">✓ {t('موثق', 'Verified')}</Badge>}
                  </div>
                  {merchant.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{merchant.bio}</p>}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <StarRating rating={merchant.rating ?? 0} size="sm" />
                      <span className="text-sm font-semibold">{(merchant.rating ?? 0).toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{(merchant.totalSales ?? 0).toLocaleString()} {t('مبيعة', 'sales')}</span>
                    {merchant._count && <span className="text-xs text-muted-foreground">{merchant._count.products} {t('منتج', 'products')}</span>}
                  </div>
                </div>
                <Button onClick={goToSeller} variant="outline" className="shrink-0 gap-2 font-bold">
                  {t('زيارة المتجر', 'Visit Store')}
                  {isAr ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── DESCRIPTION & SPECIFICATIONS GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          {product.description && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">{t('وصف المنتج التفصيلي', 'Detailed Product Description')}</h2>
              <div className="prose dark:prose-invert max-w-none p-5 bg-muted/30 rounded-2xl border border-border min-h-[220px]">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">{product.description}</p>
              </div>
            </div>
          )}

          {/* Dynamic Technical Specifications Table */}
          {Object.keys(specs).some(k => ['weight', 'dimensions', 'material', 'origin', 'warranty'].includes(k)) && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">{t('المواصفات الفنية المعتمدة', 'Approved Technical Specifications')}</h2>
              <div className="p-5 bg-muted/30 rounded-2xl border border-border min-h-[220px] flex flex-col justify-center">
                <table className="w-full text-sm divide-y divide-border">
                  <tbody>
                    {specs.weight && (
                      <tr className="py-2.5 flex justify-between"><td className="font-semibold text-muted-foreground">{t('الوزن الكلي', 'Total Weight')}</td><td className="font-medium text-foreground">{typeof specs.weight === 'object' ? JSON.stringify(specs.weight) : String(specs.weight)}</td></tr>
                    )}
                    {specs.dimensions && (
                      <tr className="py-2.5 flex justify-between"><td className="font-semibold text-muted-foreground">{t('الأبعاد القياسية', 'Standard Dimensions')}</td><td className="font-medium text-foreground">{typeof specs.dimensions === 'object' ? JSON.stringify(specs.dimensions) : String(specs.dimensions)}</td></tr>
                    )}
                    {specs.material && (
                      <tr className="py-2.5 flex justify-between"><td className="font-semibold text-muted-foreground">{t('الخامات المستخدمة', 'Materials Used')}</td><td className="font-medium text-foreground">{typeof specs.material === 'object' ? JSON.stringify(specs.material) : String(specs.material)}</td></tr>
                    )}
                    {specs.origin && (
                      <tr className="py-2.5 flex justify-between"><td className="font-semibold text-muted-foreground">{t('بلد المنشأ', 'Country of Origin')}</td><td className="font-medium text-foreground">{typeof specs.origin === 'object' ? JSON.stringify(specs.origin) : String(specs.origin)}</td></tr>
                    )}
                    {specs.warranty && (
                      <tr className="py-2.5 flex justify-between"><td className="font-semibold text-muted-foreground">{t('الضمان المعتمد', 'Warranty Details')}</td><td className="font-medium text-foreground">{typeof specs.warranty === 'object' ? JSON.stringify(specs.warranty) : String(specs.warranty)}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── TABS: REVIEWS & CUSTOMER Q&A ── */}
        <div className="mt-12 border-t border-border pt-10">
          <div className="flex gap-4 border-b border-border pb-3 mb-6">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-lg font-black font-cairo transition-all relative ${
                activeTab === 'reviews' 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('⭐️ آراء وتقييمات العملاء', '⭐️ Customer Reviews')}
              {reviewsTotal > 0 && (
                <span className="ms-1.5 text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
                  {reviewsTotal}
                </span>
              )}
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 start-0 end-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>

            {platformSettings.enable_product_qa === 'true' && (
              <button
                onClick={() => setActiveTab('qa')}
                className={`pb-3 text-lg font-black font-cairo transition-all relative ${
                  activeTab === 'qa' 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('❓ الأسئلة والأجوبة', '❓ Questions & Answers')}
                {qas.length > 0 && (
                  <span className="ms-1.5 text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
                    {qas.length}
                  </span>
                )}
                {activeTab === 'qa' && (
                  <div className="absolute bottom-0 start-0 end-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            )}
          </div>

          {/* TAB CONTENT: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      {t('خلاصة آراء المشترين', 'Buyer Review Summary')}
                    </h2>
                    {avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-amber-500">{avgRating.toFixed(1)}</span>
                        <StarRating rating={avgRating} size="md" />
                      </div>
                    )}
                  </div>

                  {/* Star distribution bar */}
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => Math.round(r.rating) === star).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-4">{star}</span>
                          <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-6 text-end">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Individual reviews */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.slice(0, 6).map(review => {
                      const reviewerName = isAr
                        ? (review.user?.name || t('مشتري', 'Buyer'))
                        : (review.user?.nameEn || review.user?.name || t('مشتري', 'Buyer'));
                      const timeAgo = (() => {
                        const diff = Date.now() - new Date(review.createdAt).getTime();
                        const days = Math.floor(diff / 86400000);
                        if (days === 0) return t('اليوم', 'Today');
                        if (days === 1) return t('أمس', 'Yesterday');
                        if (days < 30) return isAr ? `منذ ${days} يوم` : `${days} days ago`;
                        const months = Math.floor(days / 30);
                        return isAr ? `منذ ${months} شهر` : `${months} months ago`;
                      })();

                      return (
                        <div key={review.id} className="p-4 rounded-2xl bg-card border border-border space-y-2 flex flex-col justify-between text-start">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                                  {reviewerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{reviewerName}</p>
                                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                                </div>
                              </div>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                            {review.title && (
                              <p className="text-sm font-semibold text-foreground">{review.title}</p>
                            )}
                            {review.comment && (
                              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                  <p className="text-muted-foreground">{t('لا توجد تقييمات لهذا المنتج بعد.', 'No reviews for this product yet.')}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: Q&A */}
          {activeTab === 'qa' && platformSettings.enable_product_qa === 'true' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground font-cairo">{t('الأسئلة الشائعة من العملاء', 'Frequently Asked Questions')}</h3>
              </div>

              {/* QA List */}
              {qas.length > 0 ? (
                <div className="space-y-4">
                  {qas.map((qa) => (
                    <div key={qa.id} className="p-5 rounded-2xl bg-card border border-border space-y-3 text-start">
                      <div className="flex items-start gap-2.5">
                        <span className="text-sm font-black text-amber-500 bg-amber-500/10 size-6 rounded-lg flex items-center justify-center shrink-0">❓</span>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-relaxed font-cairo">{qa.question}</p>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">
                            {new Date(qa.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      {qa.answer ? (
                        <div className="ps-8 border-s-2 border-primary/20 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md font-cairo">🏪 {t('رد المتجر', 'Seller Reply')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed font-cairo">{qa.answer}</p>
                        </div>
                      ) : (
                        <div className="ps-8 border-s-2 border-dashed border-muted/50">
                          <p className="text-xs italic text-muted-foreground font-cairo">{t('بانتظار رد التاجر قريباً...', 'Pending merchant reply soon...')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                  <p className="text-muted-foreground font-cairo">{t('لا توجد أسئلة سابقة لهذا المنتج. كن أول من يسأل!', 'No previous questions for this product. Be the first to ask!')}</p>
                </div>
              )}

              {/* Submit Question Form */}
              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-border space-y-4 text-start font-cairo">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>💬 {t('لديك سؤال أو استفسار؟ اطرحه الآن وسيجيبك التاجر فوراً:', 'Have a question? Ask now and the merchant will answer you:')}</span>
                </h4>
                
                <div className="space-y-3">
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder={t('اكتب سؤالك هنا بوضوح (مثال: هل يتوفر مقاس أكبر؟)...', 'Type your question here clearly (e.g. Does it have a warranty?)...')}
                    rows={3}
                    className="w-full text-sm p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-muted-foreground/60 text-foreground"
                  />

                  {qaSuccessMessage && (
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg text-center font-cairo">
                      {qaSuccessMessage}
                    </p>
                  )}

                  {qaErrorMessage && (
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-lg text-center font-cairo">
                      {qaErrorMessage}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <Button
                      disabled={isSubmittingQuestion || !newQuestion.trim()}
                      onClick={async () => {
                        setIsSubmittingQuestion(true);
                        setQaSuccessMessage('');
                        setQaErrorMessage('');
                        try {
                          const res = await fetch('/api/products/qa', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              productId: product.id,
                              question: newQuestion,
                              userId: useAuthStore.getState().user?.id || null
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setQaSuccessMessage(t(
                              '🎉 تم إرسال سؤالك للإدارة! سيتم مراجعته والرد عليه من قبل التاجر قريباً.',
                              '🎉 Your question has been submitted! It will be reviewed and answered by the merchant soon.'
                            ));
                            setNewQuestion('');
                          } else {
                            throw new Error(data.error);
                          }
                        } catch (err: any) {
                          setQaErrorMessage(t('❌ فشل إرسال السؤال. يرجى المحاولة لاحقاً.', '❌ Failed to submit question. Please try again.'));
                        } finally {
                          setIsSubmittingQuestion(false);
                        }
                      }}
                      className="font-bold gap-2 text-xs"
                    >
                      {isSubmittingQuestion ? t('جاري الإرسال...', 'Sending...') : t('إرسال السؤال', 'Submit Question')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">{t('منتجات مشابهة', 'Related Products')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {related.map((p) => {
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
                    onClick={() => { useAppStore.getState().setSelectedProductId(p.id); router.push(`/products/${p.id}`); }}
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {imgs[0] ? (
                        <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <Package className="size-10 text-muted-foreground/30 m-auto mt-8" />
                      )}
                      {disc > 0 && <Badge className="absolute top-2 start-2 bg-red-500 text-white text-xs font-bold">-{disc}%</Badge>}
                    </div>
                    <CardContent className="p-3 text-start">
                      <p className="text-xs font-semibold line-clamp-2 mb-1 text-foreground">{p.name}</p>
                      <div className="flex items-center gap-1 mb-1">
                        <StarRating rating={p.rating} size="sm" />
                        <span className="text-xs text-muted-foreground">({p.soldCount})</span>
                      </div>
                      <p className="text-sm font-bold text-primary">{fmt(p.price)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
