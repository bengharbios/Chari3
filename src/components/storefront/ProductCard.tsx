'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ShoppingCart, CheckCircle2, Star } from 'lucide-react';
import { useAppStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/useTranslation';

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
              : 'fill-slate-200 dark:fill-slate-800 text-slate-200 dark:text-slate-800'
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductCard({ 
  product, 
  isOfferCard = false, 
  newArrivalThresholdDays = 7,
}: { 
  product: any; 
  isOfferCard?: boolean; 
  newArrivalThresholdDays?: number;
}) {
  const { locale } = useAppStore();
  const { items: cartItems, addItem } = useCartStore();
  const { t } = useTranslation();
  const router = useRouter();
  const isAr = locale === 'ar';
  
  const isInCart = cartItems.some((item) => item.product.id === product.id);

  // Auto-sliding image carousel state
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const showNewArrival = React.useMemo(() => {
    if (newArrivalThresholdDays > 0 && product.createdAt) {
      const daysOld = (new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 3600 * 24);
      return daysOld <= newArrivalThresholdDays;
    }
    return !product.rating || Number(product.rating) <= 0;
  }, [product.rating, product.createdAt, newArrivalThresholdDays]);

  let images: string[] = [];
  if (Array.isArray(product.images)) {
    images = product.images;
  } else if (typeof product.images === 'string') {
    try { images = JSON.parse(product.images); } catch {}
  }
  if (!Array.isArray(images)) images = [];

  // Auto slide effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isHovered && images.length > 1) {
      // Immediately switch to the second image on hover
      setCurrentImageIndex(1);
      
      // Then continue cycling every 1.5s
      intervalId = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1500);
    } else {
      setCurrentImageIndex(0); // Reset to first image when not hovered
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovered, images.length]);

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
    <div 
      className="overflow-hidden flex flex-col h-full group transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-950 rounded-[24px] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] hover:border-amber-500/30 hover:-translate-y-1.5 relative z-10 hover:z-20"
      onClick={() => {
        useAppStore.getState().setSelectedProductId(product.id);
        router.push(`/products/${product.id}`);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square bg-slate-50 dark:bg-slate-950/50 overflow-hidden shrink-0">
        {images.length > 0 ? (
          images.map((imgSrc, index) => (
            <img 
              key={index}
              src={imgSrc} 
              alt={product.name} 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] 
                ${index === currentImageIndex ? 'opacity-100 group-hover:scale-[1.05]' : 'opacity-0 scale-100'}`} 
            />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary/10 to-primary/5">
            <ShoppingBag className="size-8 text-primary/30" />
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 start-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black py-1 px-2.5 rounded-full shadow-md z-10 select-none">
            {isAr ? `خصم ${discount}%` : `-${discount}%`}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col grow text-start z-10 relative bg-white dark:bg-slate-950 transition-colors">
        <p className="text-[10px] text-muted-foreground/80 mb-1.5 truncate font-medium">{product.category?.name || ''}</p>
        <h4 className="text-sm font-bold line-clamp-2 mb-2 text-slate-800 dark:text-slate-100 leading-snug min-h-[40px] group-hover:text-amber-500 transition-colors">{isAr ? product.name : (product.nameEn || product.name)}</h4>
        <div className="flex items-center gap-1.5 mb-3 min-h-[16px]">
          {!showNewArrival ? (
            <>
              <StarRating rating={Number(product.rating || 0)} />
              {product.soldCount && Number(product.soldCount) > 0 ? (
                <span className="text-[10px] text-slate-400 font-semibold">({product.soldCount})</span>
              ) : null}
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-amber-600 dark:text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                {t('storefront.product.new_arrival', 'وصل حديثاً', 'New Arrival')}
              </span>
              {product.soldCount && Number(product.soldCount) > 0 ? (
                <span className="text-[10px] text-slate-400 font-semibold">({product.soldCount})</span>
              ) : null}
            </div>
          )}
        </div>
        <div className="mt-auto relative">
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                {fmt(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-[11px] text-slate-400 line-through font-semibold leading-none">
                  {fmt(product.comparePrice)}
                </span>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant={isInCart ? "default" : "secondary"} 
              className={`rounded-full shrink-0 h-9 w-9 p-0 shadow transition-all duration-300 ${isInCart ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500'}`}
              onClick={handleAddToCart}
            >
              {isInCart ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
