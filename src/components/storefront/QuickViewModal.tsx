'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore, useCartStore } from '@/lib/store';
import { Minus, Plus, ShoppingCart, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface QuickViewModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { locale } = useAppStore();
  const { addItem } = useCartStore();
  const isRTL = locale === 'ar';
  
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const t = (ar: string, en: string) => (isRTL ? ar : en);

  if (!product) return null;

  // Mock variants if none exist, just to show the UI
  const variants = product.variants?.length > 0 ? product.variants : [
    { id: '1', name: 'اللون', value: 'أسود' },
    { id: '2', name: 'اللون', value: 'رمادي' },
  ];

  const handleAddToCart = () => {
    addItem({
      product: product,
      quantity: quantity,
      variantId: selectedVariant?.id || null,
      price: product.price
    });
    toast.success(t('تمت الإضافة بنجاح', 'Added to cart'));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 rounded-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="p-4 bg-surface">
          <div className="flex gap-4">
            <div className="w-1/3 aspect-square rounded-xl overflow-hidden bg-muted relative">
              {product.images[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-sm leading-tight">{isRTL ? product.name : (product.nameEn || product.name)}</h3>
              <div className="flex items-center gap-2">
                <span className="text-brand font-black text-lg">{product.price} د.إ</span>
                {product.comparePrice && (
                  <span className="text-xs text-muted-foreground line-through">{product.comparePrice}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{t(`تم بيع ${product.soldCount}`, `${product.soldCount} sold`)}</div>
            </div>
          </div>

          <div className="mt-4 bg-muted/30 p-2 rounded-lg flex items-center gap-2 text-xs font-bold text-green-600">
            <Truck className="h-4 w-4" />
            {t('تصل في AE في أقل من ٢ أيام عمل', 'Arrives in AE in less than 2 days')}
          </div>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-bold">{t('اللون:', 'Color:')}</label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 border text-xs font-medium rounded-lg transition-all ${
                      selectedVariant?.id === v.id ? 'border-brand bg-brand/10 text-brand' : 'border-border hover:border-foreground/30'
                    }`}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="text-xs font-bold">{t('الكمية', 'Quantity')}</label>
              <div className="flex items-center border border-border rounded-lg overflow-hidden h-9">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 hover:bg-muted transition-colors text-muted-foreground"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <div className="w-10 text-center text-xs font-bold">{quantity}</div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 hover:bg-muted transition-colors text-muted-foreground"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <Button 
            className="w-full mt-6 h-12 rounded-xl gradient-brand text-navy font-black text-base shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all"
            onClick={handleAddToCart}
          >
            {t('تأكيد الإضافة', 'Confirm Add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
