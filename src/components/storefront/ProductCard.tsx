'use client';

import { Star, ShoppingCart } from 'lucide-react';
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
  const { locale, t, setCurrentPage } = useAppStore();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { addItem } = useCartStore.getState();
    
    addItem(product, 1);
    toast.success(t('تمت الإضافة للسلة', 'Added to cart'));
  };

  return (
    <div 
      className="group bg-surface rounded-2xl border border-border/40 overflow-hidden hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => setCurrentPage(`product:${product.id}` as any)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden">
        {product.mainImage ? (
          <img 
            src={`/api/files/${product.mainImage}`}
            alt={locale === 'ar' ? product.titleAr : product.titleEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground text-xs">
            No Image
          </div>
        )}
        
        {/* Discount Badge */}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-2 start-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
          </div>
        )}
        
        {/* Hover Action */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
          <Button 
            size="sm" 
            className="w-full bg-white/90 text-navy hover:bg-brand hover:text-navy font-bold shadow-lg backdrop-blur-sm"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 me-2" />
            {t('أضف للسلة', 'Add to Cart')}
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
