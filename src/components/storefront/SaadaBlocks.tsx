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
