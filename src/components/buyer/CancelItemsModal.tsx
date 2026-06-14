'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CancelItemsModal({ isOpen, onClose, order, onSuccess }: { isOpen: boolean, onClose: () => void, order: any, onSuccess: () => void }) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const router = useRouter();

  const t = (arText: string, enText: string) => (isRTL ? arText : enText);

  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
  const [reasons, setReasons] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);

  const cancelReasons = [
    { value: 'changed_mind', label: t('لقد غيرت رأيي', 'I changed my mind') },
    { value: 'forgot_coupon', label: t('لقد نسيت استخدام الكوبون', 'I forgot to use a coupon') },
    { value: 'no_reason', label: t('لا يوجد سبب', 'No reason') },
    { value: 'not_needed', label: t('لم أعد بحاجة المنتج', 'I no longer need the product') },
    { value: 'not_authentic', label: t('اعتقد أن هذا المنتج ليس أصلياً', 'I think this product is not authentic') },
    { value: 'takes_too_long', label: t('المنتج بياخذ وقت حتى يوصلك', 'The product takes too long to arrive') },
  ];

  const toggleItem = (id: string) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
    if (!selectedItems[id] && !reasons[id]) {
      setReasons(prev => ({ ...prev, [id]: 'changed_mind' })); // default reason
    }
  };

  const handleReasonChange = (id: string, val: string) => {
    setReasons(prev => ({ ...prev, [id]: val }));
    setSelectedItems(prev => ({ ...prev, [id]: true })); // Auto select if reason chosen
  };

  const activeItems = order?.items.filter((i: any) => i.status !== 'cancelled') || [];
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  const handleSubmit = async () => {
    if (selectedCount === 0) {
      toast.error(t('يرجى تحديد منتج واحد على الأقل', 'Please select at least one item'));
      return;
    }

    const cancellations = Object.keys(selectedItems)
      .filter(id => selectedItems[id])
      .map(id => ({
        itemId: id,
        reason: reasons[id] || 'changed_mind'
      }));

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/buyer/orders/${order.id}/cancel-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellations })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsSuccessState(true);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSuccessState) {
      onSuccess();
    }
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-black font-cairo">
            {isSuccessState ? t('إلغاء المنتجات', 'Cancel Items') : t('إلغاء المنتجات', 'Cancel Items')}
          </DialogTitle>
        </DialogHeader>

        {isSuccessState ? (
          <div className="py-6 space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">{t('تم إلغاء جميع المنتجات المحددة بنجاح', 'Item cancelled successfully')}</h3>
              <p className="text-muted-foreground text-sm">{t('Item cancelled successfully', 'Item cancelled successfully')}</p>
            </div>

            <div className="space-y-4 text-start">
              {Object.keys(selectedItems).filter(id => selectedItems[id]).map(id => {
                const item = order.items.find((i: any) => i.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex gap-4 p-4 border rounded-xl bg-gray-50">
                    <div className="size-16 bg-white border rounded-lg overflow-hidden shrink-0">
                      {item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm line-clamp-2">{item.productName}</div>
                      <div className="font-black text-brand mt-1">{item.price.toFixed(2)} د.إ</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={handleClose} className="w-full h-12 rounded-xl font-bold bg-brand text-white hover:bg-brand/90">
                {t('العودة إلى تفاصيل الطلب', 'Back to Order details')}
              </Button>
              <Button onClick={() => router.push('/buyer/orders')} variant="outline" className="w-full h-12 rounded-xl font-bold">
                {t('العودة إلى الطلبات', 'Back to Orders')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <p className="text-sm font-bold text-foreground bg-gray-50 p-3 rounded-lg border">
              {t('يمكنك إلغاء المنتجات التي لم يتم شحنها حتى الآن', 'You can cancel items that have not been shipped yet')}
            </p>

            <div className="space-y-4">
              {activeItems.map((item: any) => (
                <div key={item.id} className={`p-4 border rounded-2xl transition-colors ${selectedItems[item.id] ? 'border-brand bg-brand/5' : 'bg-white'}`}>
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      checked={!!selectedItems[item.id]} 
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex gap-4">
                        <div className="size-16 rounded-xl bg-muted shrink-0 border overflow-hidden">
                          {item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm line-clamp-2">{item.productName}</div>
                          <div className="font-black mt-1 text-foreground">{item.price.toFixed(2)} د.إ</div>
                        </div>
                      </div>

                      {selectedItems[item.id] && (
                        <div className="mt-4 pt-4 border-t">
                          <label className="text-xs font-bold text-muted-foreground block mb-2">{t('سبب الإلغاء', 'Reason for cancellation')}</label>
                          <Select value={reasons[item.id]} onValueChange={(v) => handleReasonChange(item.id, v)}>
                            <SelectTrigger className="w-full bg-white">
                              <SelectValue placeholder={t('اختر سبب الإلغاء', 'Select reason')} />
                            </SelectTrigger>
                            <SelectContent>
                              {cancelReasons.map(r => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-red-50 p-3 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">
                {t('لا يمكن التراجع عن هذا التغيير.', 'This change cannot be undone.')}
              </p>
            </div>

            <Button 
              className="w-full h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedCount === 0}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('Cancel the selected item', 'Cancel the selected item')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
