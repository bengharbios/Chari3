'use client';

import { useState, useEffect } from 'react';
import {
  Star, ShoppingCart, Heart, Share2, Shield, Truck, RefreshCw,
  ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Package,
  MessageCircle, ThumbsUp, Award
} from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const CURRENCY = { symbol: 'د.ج' };
const fmt = (n: number) => `${n.toLocaleString('ar-DZ')} ${CURRENCY.symbol}`;

const LEVEL_BADGE: Record<number, string> = {
  1: '🌱', 2: '⭐', 3: '🌟', 4: '💫', 5: '🔥',
  6: '💎', 7: '👑', 8: '🏆', 9: '🦅', 10: '🌠',
};

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

  useEffect(() => {
    if (!selectedProductId) { setCurrentPage('home'); return; }
    setIsLoading(true);
    fetch(`/api/products/${selectedProductId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProduct(d.product);
          setRelated(d.related || []);
        } else setCurrentPage('home');
      })
      .catch(() => setCurrentPage('home'))
      .finally(() => setIsLoading(false));
  }, [selectedProductId]);

  const handleAddToCart = () => {
    if (!isAuthenticated) { setCurrentPage('login'); return; }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const goToSeller = () => {
    if (product?.seller?.id) {
      useAppStore.getState().setSelectedSellerId(product.seller.id);
      setCurrentPage('seller-profile');
    }
  };

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

  let images: string[] = [];
  try { images = JSON.parse(product.images); } catch {}
  if (images.length === 0) images = [];

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container-platform py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => setCurrentPage('home')} className="hover:text-primary transition-colors">
              {t('الرئيسية', 'Home')}
            </button>
            {isAr ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            <span className="text-xs">{product.category.name}</span>
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
              <p className="text-sm text-muted-foreground mb-1">{product.category.name}</p>
              <h1 className="text-2xl md:text-3xl font-black leading-tight">{isAr ? product.name : (product.nameEn || product.name)}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 flex-wrap">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount} {t('تقييم', 'reviews')})</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{product.soldCount.toLocaleString()} {t('مبيعة', 'sold')}</span>
            </div>

            {/* Price */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-end gap-3 flex-wrap">
                <p className="text-3xl md:text-4xl font-black text-primary">{fmt(product.price)}</p>
                {product.comparePrice && (
                  <div className="mb-1">
                    <p className="text-lg text-muted-foreground line-through">{fmt(product.comparePrice)}</p>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                      {t(`وفر ${fmt(product.comparePrice - product.price)}`, `Save ${fmt(product.comparePrice - product.price)}`)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className={`size-2.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {product.stock > 10 ? t('متوفر في المخزن', 'In Stock') :
                  product.stock > 0 ? t(`متبقي ${product.stock} فقط!`, `Only ${product.stock} left!`) :
                    t('غير متوفر', 'Out of Stock')}
              </span>
            </div>

            {/* Quantity + Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{t('الكمية:', 'Qty:')}</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-2.5 hover:bg-muted text-lg font-bold transition-colors">−</button>
                  <span className="px-5 py-2.5 font-bold min-w-[50px] text-center border-x border-border">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-2.5 hover:bg-muted text-lg font-bold transition-colors">+</button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 gap-2 text-base font-bold h-13"
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="size-5" />
                  {addedToCart ? t('✓ تم الإضافة!', '✓ Added!') : t('أضف للسلة', 'Add to Cart')}
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

        {/* ── SELLER CARD ── */}
        {product.seller && (
          <Card className="mt-10 overflow-hidden border-border hover:border-primary/30 transition-all">
            {product.seller.coverImage && (
              <div className="h-24 overflow-hidden">
                <img src={product.seller.coverImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="relative shrink-0">
                  {product.seller.logo ? (
                    <img src={product.seller.logo} alt={product.seller.storeName || ''} className="size-16 rounded-xl object-cover border-2 border-border" />
                  ) : (
                    <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">🏪</div>
                  )}
                  {product.seller.isVerified && (
                    <div className="absolute -bottom-1 -end-1 size-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">{isAr ? product.seller.storeName : (product.seller.storeNameEn || product.seller.storeName)}</h3>
                    <span className="text-xl">{LEVEL_BADGE[product.seller.level] || '🌱'}</span>
                    {product.seller.isVerified && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">✓ {t('موثق', 'Verified')}</Badge>}
                  </div>
                  {product.seller.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.seller.bio}</p>}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <StarRating rating={product.seller.rating} size="sm" />
                      <span className="text-sm font-semibold">{product.seller.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{product.seller.totalSales.toLocaleString()} {t('مبيعة', 'sales')}</span>
                    {product.seller._count && <span className="text-xs text-muted-foreground">{product.seller._count.products} {t('منتج', 'products')}</span>}
                  </div>
                </div>
                <Button onClick={goToSeller} variant="outline" className="shrink-0 gap-2">
                  {t('زيارة المتجر', 'Visit Store')}
                  {isAr ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── DESCRIPTION ── */}
        {product.description && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">{t('وصف المنتج', 'Product Description')}</h2>
            <div className="prose dark:prose-invert max-w-none p-5 bg-muted/30 rounded-2xl border border-border">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          </div>
        )}

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">{t('منتجات مشابهة', 'Related Products')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {related.map((p) => {
                let imgs: string[] = [];
                try { imgs = JSON.parse(p.images); } catch {}
                const disc = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
                return (
                  <Card
                    key={p.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
                    onClick={() => { useAppStore.getState().setSelectedProductId(p.id); setCurrentPage('product-detail'); }}
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {imgs[0] ? (
                        <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <Package className="size-10 text-muted-foreground/30 m-auto mt-8" />
                      )}
                      {disc > 0 && <Badge className="absolute top-2 start-2 bg-red-500 text-white text-xs">-{disc}%</Badge>}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs font-semibold line-clamp-2 mb-1">{p.name}</p>
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
