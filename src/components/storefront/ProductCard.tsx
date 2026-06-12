'use client';

import { useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useAppStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function fmt(amount: number) {
  return new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' }).format(amount);
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${
            size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
          } ${
            star <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
      <span className={`ms-1 text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

export default function ProductCard({ product }: { product: any }) {
  const { locale, setCurrentPage } = useAppStore();
  const isInCart = useCartStore((s) => s.items.some((i) => i.product.id === product?.id));
  const [isFavorite, setIsFavorite] = useState(false);
  
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { addItem } = useCartStore.getState();
    
    addItem(product, 1);
    toast.success(t('تمت الإضافة للسلة', 'Added to cart'));
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      toast.success(t('تمت الإضافة للمفضلة', 'Added to wishlist'));
    } else {
      toast.success(t('تمت الإزالة من المفضلة', 'Removed from wishlist'));
    }
  };

  return (
    <div 
      className="group bg-surface rounded-[24px] border border-border/60 overflow-hidden hover:shadow-2xl hover:shadow-brand/5 hover:border-brand/30 transition-all duration-500 cursor-pointer flex flex-col h-full relative"
      onClick={() => setCurrentPage(`product:${product.id}` as any)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted/10 overflow-hidden">
        {product.mainImage ? (
          <img 
            src={`/api/files/${product.mainImage}`}
            alt={locale === 'ar' ? product.titleAr : product.titleEn}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground text-xs">
            No Image
          </div>
        )}
        
        {/* Favorite/Wishlist Button */}
        <button 
          onClick={handleToggleFavorite}
          className={`absolute top-3 end-3 p-2 rounded-full border shadow-md backdrop-blur-md z-20 transition-all duration-300 ${
            isFavorite 
              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-500 border-rose-200 dark:border-rose-900 fill-rose-500 scale-110' 
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-500 border-white/20 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/80 hover:scale-110'
          }`}
          aria-label="Toggle favorite"
        >
          <Heart className="w-4 h-4 transition-transform active:scale-90" />
        </button>
        
        {/* Discount Badge */}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-2 start-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
          </div>
        )}
        
        {/* Hover Action */}
        <div className={`absolute inset-x-0 bottom-0 p-3 transition-all duration-500 bg-gradient-to-t from-black/60 via-black/25 to-transparent ${
          isInCart 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
        }`}>
          <Button 
            size="sm" 
            className={`w-full font-bold shadow-lg backdrop-blur-sm transition-colors ${
              isInCart 
                ? 'bg-green-500 text-white hover:bg-green-600 border-none' 
                : 'bg-white/90 text-navy hover:bg-brand hover:text-navy'
            }`}
            onClick={handleAddToCart}
          >
            {isInCart ? (
              <>
                <ShoppingCart className="w-4 h-4 me-2 fill-current" />
                {t('في السلة', 'In Cart')}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 me-2" />
                {t('أضف للسلة', 'Add to Cart')}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs font-semibold text-brand mb-1 line-clamp-1">
          {product.brand || product.store?.name || t('ماركة', 'Brand')}
        </div>
        <h3 className="font-bold text-navy text-sm mb-2 line-clamp-2 leading-snug flex-1 group-hover:text-brand transition-colors">
          {locale === 'ar' ? product.titleAr : product.titleEn}
        </h3>
        
        <div className="mb-3">
          <StarRating rating={product.rating || 5} />
        </div>
        
        <div className="flex items-end gap-2 mt-auto">
          <span className="font-black text-lg text-brand">
            {fmt(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through mb-1">
              {fmt(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
