'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, useCartStore } from '@/lib/store';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowRight, Loader2, Plus, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';
import QuickViewModal from './QuickViewModal';

interface Product {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  soldCount: number;
  storeId?: string;
  sellerId?: string;
}

interface MinimumOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  minimumAmount: number;
  currentSubtotal: number;
}

export default function MinimumOrderModal({ isOpen, onClose, minimumAmount, currentSubtotal }: MinimumOrderModalProps) {
  const { locale } = useAppStore();
  const { addItem } = useCartStore();
  const isRTL = locale === 'ar';
  
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const remaining = Math.max(0, minimumAmount - currentSubtotal);
  const progress = Math.min(100, (currentSubtotal / minimumAmount) * 100);

  const t = (ar: string, en: string) => (isRTL ? ar : en);

  useEffect(() => {
    if (isOpen) {
      // Fetch some products to cross-sell
      fetch('/api/products/search?limit=12&sort=soldCount_desc')
        .then(res => res.json())
        .then(data => {
          if (data.success) setRecommendedProducts(data.products);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen]);

  // If subtotal is reached, close modal automatically
  useEffect(() => {
    if (isOpen && remaining === 0) {
      setTimeout(() => onClose(), 1000);
    }
  }, [remaining, isOpen, onClose]);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-background/95 backdrop-blur-xl" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header - Warning Message */}
        <div className="bg-amber-50 p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 end-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">
                {t(`يبلغ إجمالي المنتجات ${currentSubtotal.toFixed(2)} د.إ..`, `Current subtotal is ${currentSubtotal.toFixed(2)} AED.`)}
              </h3>
              <p className="text-amber-800 font-medium mt-1">
                {t(`أضف ${remaining.toFixed(2)} د.إ. أكثر للإرسال!`, `Add ${remaining.toFixed(2)} AED more to ship!`)}
              </p>
              <p className="text-xs text-amber-700/80 mt-2 leading-relaxed">
                {t(`لدى ChariDay حد أدنى للطلب قيمته ${minimumAmount} د.إ.. لطلبك الأول، نقدم لك طلباً خاصاً بهذا الحد. أضف منتجات أكثر للإرسال.`, `ChariDay has a minimum order amount of ${minimumAmount} AED. Add more items to ship.`)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2.5 bg-amber-200 [&>div]:bg-amber-500" />
            <div className="flex justify-between text-[10px] font-bold text-amber-800 mt-1.5 px-1">
              <span>{currentSubtotal.toFixed(2)} د.إ</span>
              <span>{minimumAmount.toFixed(2)} د.إ</span>
            </div>
          </div>
        </div>

        {/* Recommended Products Grid */}
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-surface">
          <h4 className="text-sm font-black mb-4 flex items-center gap-2 px-2">
            <ShoppingCart className="h-4 w-4 text-brand" />
            {t('المنتجات التي قد ترغب في إضافتها', 'Products you might want to add')}
          </h4>

          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {recommendedProducts.map(product => (
                <div key={product.id} className="border border-border/50 rounded-xl overflow-hidden group hover:border-brand/50 transition-colors bg-background">
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ShoppingCart className="h-6 w-6 opacity-20" /></div>
                    )}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="absolute top-0 start-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%-
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-medium line-clamp-2 leading-tight">
                      {isRTL ? product.name : (product.nameEn || product.name)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-foreground">{product.price} د.إ</span>
                      {product.comparePrice && (
                        <span className="text-[10px] text-muted-foreground line-through">{product.comparePrice}</span>
                      )}
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {t(`تم بيع ${product.soldCount}`, `${product.soldCount} sold`)}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full h-7 text-xs rounded-lg mt-2 bg-black text-white hover:bg-black/80"
                      onClick={() => setQuickViewProduct(product)}
                    >
                      <Plus className="h-3 w-3 me-1" />
                      {t('أضف', 'Add')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <QuickViewModal 
      product={quickViewProduct} 
      isOpen={!!quickViewProduct} 
      onClose={() => setQuickViewProduct(null)} 
    />
    </>
  );
}
