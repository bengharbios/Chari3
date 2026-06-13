'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore, useCartStore } from '@/lib/store';

// Helper for Star Rating
export function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const stars = [];
  for (let s = 1; s <= 5; s++) {
    stars.push(
      <svg key={s} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300'}`}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

const LEVEL_BADGE: Record<number, string> = {
  1: '🌱', 2: '⭐', 3: '🌟', 4: '💫', 5: '🔥',
  6: '💎', 7: '👑', 8: '🏆', 9: '🦅', 10: '🌠',
};

// Reusable Product Card
export function ProductCard({ product, isOfferCard = false }: { product: any; isOfferCard?: boolean }) {
  const { locale } = useAppStore();
  const { items: cartItems, addItem } = useCartStore();
  const router = useRouter();
  const isAr = locale === 'ar';
  
  const isInCart = cartItems.some((item) => item.product.id === product.id);

  let images: string[] = [];
  if (Array.isArray(product.images)) images = product.images;
  else if (typeof product.images === 'string') {
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
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="relative aspect-square bg-slate-50 dark:bg-slate-950 overflow-hidden shrink-0">
        {images[0] ? (
          <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary/10 to-primary/5">
            <ShoppingBag className="w-8 h-8 text-primary/30" />
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
              className={`rounded-full shrink-0 w-7 h-7 shadow ${isInCart ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-850'}`}
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

// Dynamic Product Grid Block
export function DynamicProductGrid({ title, filterType, categoryId, layoutStyle, limit = 10 }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { locale } = useAppStore();
  const isAr = locale === 'ar';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const params = new URLSearchParams({
      status: 'active',
      limit: String(limit),
      sort: filterType || 'newest'
    });
    if (categoryId && categoryId !== 'all') params.set('categoryId', categoryId);

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
  }, [categoryId, filterType, limit]);

  return (
    <div className="w-full py-4" dir={isAr ? 'rtl' : 'ltr'}>
      <h3 className="text-xl font-black text-navy dark:text-white font-cairo mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">{title}</h3>
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto py-2">
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="w-[180px] h-[250px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[20px] shrink-0" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl">
          {isAr ? 'لا توجد منتجات حالياً' : 'No products available'}
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

export function FeaturesBlock({ features }: any) {
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  
  if (!features || features.length === 0) return null;
  
  return (
    <section className="w-full py-2" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white/50 dark:bg-slate-900/50 border border-border/80 rounded-[24px] backdrop-blur-md p-5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0 text-2xl">
                {f.icon || '✨'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{f.title}</p>
                <p className="hidden md:block text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TopSellersBlock({ title, limit = 5 }: any) {
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { locale } = useAppStore();
  const isAr = locale === 'ar';

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/sellers?sort=sales&limit=${limit}`)
      .then(r => r.json())
      .then(d => {
        if (isMounted) setSellers(d.sellers || []);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [limit]);

  return (
    <div className="w-full py-4" dir={isAr ? 'rtl' : 'ltr'}>
      <h3 className="text-xl font-black text-navy dark:text-white font-cairo mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">{title}</h3>
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto py-2">
          {[1, 2, 3].map(i => <div key={i} className="w-[200px] h-[100px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[16px] shrink-0" />)}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
          {sellers.map(seller => (
            <Link key={seller.id} href={`/store/${seller.slug || seller.id}`} className="bg-white dark:bg-slate-900 border border-border/60 rounded-[16px] p-3 flex items-center gap-3 min-w-[200px] shrink-0 hover:border-amber-500/50 transition-all snap-start shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl overflow-hidden shrink-0">
                {seller.logo ? <img src={seller.logo} className="w-full h-full object-cover" alt=""/> : '🏪'}
              </div>
              <div>
                <p className="font-bold text-sm line-clamp-1 text-slate-800 dark:text-slate-100">{seller.storeName}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                  <StarRating rating={seller.rating || 5} /> <span className="font-bold">({seller.reviewCount || 0})</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function CountdownPromoBlock({ title, subtitle, targetDate, bgOverlay = "bg-rose-600", imageUrl }: any) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { locale } = useAppStore();
  const isAr = locale === 'ar';

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    if (isNaN(target)) return;
    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="w-full py-4 relative rounded-[24px] overflow-hidden my-4 group flex flex-col md:flex-row items-center justify-between p-6 md:p-10 shadow-lg" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-slate-950">
        {imageUrl && <img src={imageUrl} alt="Promo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-50" />}
        <div className={`absolute inset-0 ${bgOverlay} mix-blend-multiply opacity-80`} />
      </div>
      <div className="relative z-10 text-white mb-6 md:mb-0 text-center md:text-start flex-1">
        <h3 className="text-2xl md:text-4xl font-black mb-2 drop-shadow-md font-cairo">{title}</h3>
        <p className="text-white/80 text-sm md:text-base font-bold">{subtitle || 'عروض حصرية تنتهي قريباً، تسوق الآن!'}</p>
      </div>
      <div className="relative z-10 flex items-center gap-2 md:gap-4 font-mono direction-ltr shrink-0" dir="ltr">
        {[
          { label: isAr ? 'يوم' : 'd', value: timeLeft.days },
          { label: isAr ? 'ساعة' : 'h', value: timeLeft.hours },
          { label: isAr ? 'دقيقة' : 'm', value: timeLeft.minutes },
          { label: isAr ? 'ثانية' : 's', value: timeLeft.seconds }
        ].map((t, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-white text-slate-950 font-black text-lg md:text-2xl px-3 py-2 rounded-xl shadow-inner min-w-[50px] text-center">
              {String(t.value).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-white/90 font-bold mt-1">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BentoPromoGridBlock({ badge, title1, link1, image1, title2, link2, image2, title3, link3, image3 }: any) {
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  return (
    <div className="w-full py-4 font-cairo" dir={isAr ? 'rtl' : 'ltr'}>
      {badge && (
        <div className="flex justify-center mb-4">
          <Badge className="bg-amber-500 text-white text-xs font-bold py-1 px-3 shadow-md border-0">{badge}</Badge>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: title1, link: link1, image: image1, bg: "from-amber-500 to-amber-600" },
          { title: title2, link: link2, image: image2, bg: "from-slate-900 to-indigo-950" },
          { title: title3, link: link3, image: image3, bg: "from-emerald-500 to-teal-600" }
        ].filter(c => c.title || c.image).map((card, i) => (
          <Link key={i} href={card.link || '#'} className={`relative min-h-[200px] md:min-h-[250px] rounded-[24px] bg-gradient-to-br ${card.bg} text-white p-5 flex flex-col justify-end overflow-hidden group hover:shadow-xl transition-all`}>
            {card.image && <img src={card.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="relative z-10">
              <h3 className="text-xl font-black drop-shadow-md">{card.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsBlock({ title, testimonials }: any) {
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  if (!testimonials || testimonials.length === 0) return null;
  
  return (
    <div className="w-full py-8" dir={isAr ? 'rtl' : 'ltr'}>
      {title && <h3 className="text-2xl font-black text-center mb-8 font-cairo text-slate-800 dark:text-white">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t: any, i: number) => (
          <div key={i} className="bg-white/80 dark:bg-slate-900/80 border border-border/50 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all text-center">
            <div className="flex justify-center mb-4 text-amber-400">
              {'★'.repeat(t.rating || 5)}{'☆'.repeat(5 - (t.rating || 5))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-4">"{t.content}"</p>
            <div className="font-bold text-xs text-slate-900 dark:text-white">{t.author}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Category Circles Block
export function DynamicCategoryCircles({ title, parentId }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { locale } = useAppStore();
  const isAr = locale === 'ar';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    let url = '/api/categories';
    if (parentId && parentId !== 'main') url += `?parentId=${parentId}`;
    
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d.success) {
          setCategories((d.categories || []).filter((c: any) => parentId === 'main' ? !c.parentId : true));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [parentId]);

  return (
    <div className="w-full py-4" dir={isAr ? 'rtl' : 'ltr'}>
      <h3 className="text-xl font-black text-navy dark:text-white font-cairo mb-4">{title}</h3>
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="w-[92px] h-[92px] rounded-[22px] bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-xs text-muted-foreground">{isAr ? 'لا توجد تصنيفات فرعية' : 'No subcategories available'}</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?categoryId=${cat.id}`}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-[22px] bg-white/70 dark:bg-slate-950/70 border border-border/80 hover:border-amber-500/30 hover:scale-105 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 shrink-0 snap-start select-none min-w-[92px]"
            >
              <span className="text-2xl drop-shadow-sm select-none">{cat.icon || '📦'}</span>
              <span className="text-[10px] font-bold text-center leading-tight line-clamp-1 max-w-[80px]">
                {isAr ? cat.name : (cat.nameEn || cat.name)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
 
 