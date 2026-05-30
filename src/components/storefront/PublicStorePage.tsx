'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useCartStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Store, Package, Search, ArrowRight, CheckCircle2, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface StoreProduct {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  comparePrice?: number;
  images: string;
  rating: number;
  soldCount: number;
  stock: number;
  status: string;
  category?: { name: string; nameEn?: string };
}

interface StoreInfo {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  rating?: number;
  totalSales?: number;
  themeColor?: string;
  ownerName?: string;
}

interface Props {
  slug: string;
}

export default function PublicStorePage({ slug }: Props) {
  const { locale } = useAppStore();
  const addItem = useCartStore((s) => s.addItem);
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isRTL = locale === 'ar';

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [filtered, setFiltered] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const themeColor = store?.themeColor || '#fbbf24';

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/stores/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStore(data.store);
          setProducts(data.products || []);
          setFiltered(data.products || []);
        }
      })
      .catch(() => toast.error(t('خطأ في تحميل المتجر', 'Failed to load store')))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // Filter and sort
  useEffect(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.nameEn || '').toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }
    setFiltered(result);
  }, [search, sortBy, products]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getImages = (imagesStr: string): string[] => {
    try { return JSON.parse(imagesStr) || []; } catch { return []; }
  };

  const handleAddToCart = (product: StoreProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      stock: product.stock,
      status: product.status,
      rating: product.rating,
      soldCount: product.soldCount,
    } as any);
    toast.success(t(`✅ تمت إضافة "${product.name}" للسلة`, `✅ "${product.nameEn || product.name}" added to cart`));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t('جاري تحميل المتجر...', 'Loading store...')}</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <Store className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">{t('المتجر غير موجود', 'Store Not Found')}</h1>
          <p className="text-muted-foreground">{t('تحقق من الرابط وحاول مجدداً', 'Check the URL and try again')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* HERO BANNER */}
      <div
        className="relative h-52 md:h-72 overflow-hidden"
        style={{
          background: store.coverImage
            ? `url(${store.coverImage}) center/cover no-repeat`
            : `linear-gradient(135deg, ${themeColor}33, ${themeColor}88)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Store Logo */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex items-end gap-5">
          <div
            className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border-4 border-white/30 overflow-hidden flex items-center justify-center shadow-2xl flex-shrink-0"
            style={{ background: `${themeColor}22`, backdropFilter: 'blur(10px)' }}
          >
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="h-10 w-10 text-white" />
            )}
          </div>
          <div className="text-white flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-black truncate">
              {locale === 'ar' ? store.name : (store.nameEn || store.name)}
            </h1>
            {store.description && (
              <p className="text-sm text-white/75 mt-1 line-clamp-1">{store.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {store.rating && store.rating > 0 ? (
                <span className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {store.rating.toFixed(1)}
                </span>
              ) : null}
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <Package className="h-3.5 w-3.5" />
                {products.length} {t('منتج', 'products')}
              </span>
              {store.totalSales && store.totalSales > 0 ? (
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {store.totalSales.toLocaleString()} {t('مبيعة', 'sold')}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('ابحث في المتجر...', 'Search store...')}
              className="ps-9 h-9 text-sm rounded-xl bg-muted/30 border-white/10"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'newest', ar: 'الأحدث', en: 'Newest' },
              { key: 'price_asc', ar: 'سعر ↑', en: 'Price ↑' },
              { key: 'price_desc', ar: 'سعر ↓', en: 'Price ↓' },
              { key: 'rating', ar: 'الأعلى تقييماً', en: 'Top Rated' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key as typeof sortBy)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  sortBy === s.key
                    ? 'text-black border-transparent'
                    : 'bg-muted/30 border-white/10 text-muted-foreground hover:text-foreground'
                }`}
                style={sortBy === s.key ? { backgroundColor: themeColor } : {}}
              >
                {t(s.ar, s.en)}
              </button>
            ))}
          </div>

          {/* Result count */}
          <span className="text-xs text-muted-foreground ms-auto hidden sm:block">
            {filtered.length} {t('منتج', 'products')}
          </span>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Package className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{t('لا توجد منتجات', 'No products found')}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
          >
            <AnimatePresence>
              {filtered.map((product, i) => {
                const images = getImages(product.images);
                const img = images[0];
                const discountPct = product.comparePrice && product.comparePrice > product.price
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : 0;
                const productName = locale === 'ar' ? product.name : (product.nameEn || product.name);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card border border-white/5 rounded-2xl overflow-hidden group hover:border-white/20 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-muted/30 overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      {discountPct > 0 && (
                        <Badge className="absolute top-2 start-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                          -{discountPct}%
                        </Badge>
                      )}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2 end-2 h-7 w-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart
                          className={`h-3.5 w-3.5 transition-colors ${wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <p className="text-xs font-semibold leading-tight line-clamp-2 text-foreground">
                        {productName}
                      </p>

                      {product.category && (
                        <p className="text-[10px] text-muted-foreground">
                          {locale === 'ar' ? product.category.name : (product.category.nameEn || product.category.name)}
                        </p>
                      )}

                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] text-muted-foreground">{product.rating.toFixed(1)}</span>
                        </div>
                      )}

                      <div className="flex items-end justify-between gap-1">
                        <div>
                          <p className="text-sm font-black text-foreground">
                            {product.price.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">DZD</span>
                          </p>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <p className="text-[10px] line-through text-muted-foreground">
                              {product.comparePrice.toLocaleString()}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="h-7 w-7 p-0 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: themeColor, color: '#000' }}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {product.stock === 0 && (
                        <p className="text-[10px] text-red-500 font-semibold">{t('نفد المخزون', 'Out of stock')}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* FOOTER */}
      <div className="text-center py-8 border-t border-white/5 text-xs text-muted-foreground">
        {t('مدعوم من', 'Powered by')} <span className="font-bold text-primary">ChariDay</span>
        {' '}<ArrowRight className="inline h-3 w-3" />
      </div>
    </div>
  );
}
