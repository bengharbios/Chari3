'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import {
  ShoppingBag, CreditCard, Truck, MapPin, Check,
  ChevronRight, ChevronLeft, User, Phone, Home,
  AlertCircle, Loader2, CheckCircle2, ArrowRight, ArrowLeft,
  Building, Map, Coins, FileText, Landmark, ShieldCheck, Banknote, Smartphone, Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n/useTranslation';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';

const AddressMap = dynamic(() => import('@/components/maps/AddressMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
});

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard className="h-5 w-5" />,
  Banknote: <Banknote className="h-5 w-5" />,
  Landmark: <Landmark className="h-5 w-5" />,
  Smartphone: <Smartphone className="h-5 w-5" />,
};

export default function SinglePageCheckout() {
  const router = useRouter();
  const { locale, allowGuestCheckout } = useAppStore();
  const { user, isAuthenticated } = useAuthStore();
  const { items, itemCount, getSubtotal, clearCart } = useCartStore();

  const isRTL = locale === 'ar';
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  // States list & dynamic payment methods
  const [dynamicWilayas, setDynamicWilayas] = useState<any[]>([]);
  const [customCities, setCustomCities] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [countryCurrency, setCountryCurrency] = useState<string>('DZD');
  const [storeName, setStoreName] = useState<string>('ChariDay Store');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [mapLat, setMapLat] = useState<number | undefined>();
  const [mapLng, setMapLng] = useState<number | undefined>();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>('');
  
  // Selections
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [isEditingAddress, setIsEditingAddress] = useState(true);
  
  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Order submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  // Mock Credit Card form state
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');

  // Pre-fill user information and fetch saved addresses
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      
      fetch('/api/buyer/addresses')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            setIsEditingAddress(true);
            setIsAddingNewAddress(false);
            
            // Auto-select the default or first address
            const defAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
            setSelectedSavedAddressId(defAddr.id);
            setFullName(defAddr.fullName);
            setPhone(defAddr.phone);
            setSelectedState(defAddr.wilayaCode || defAddr.state || '');
            setSelectedCity(defAddr.city || '');
            setAddress(defAddr.street || '');
            if (defAddr.lat && defAddr.lng) {
               setMapLat(defAddr.lat);
               setMapLng(defAddr.lng);
            }
          } else {
            setIsAddingNewAddress(true);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && !checkoutSuccess) {
      toast.error(t('سلتك فارغة', 'Your cart is empty'));
      router.push('/');
    }
  }, [items, checkoutSuccess]);

  // Load States/Wilayas & payment configs
  useEffect(() => {
    if (items.length > 0) {
      const p = items[0].product;
      const storeId = p.store?.id || (p as any).storeId;
      const sellerId = p.seller?.id || (p as any).sellerId;

      setIsLoadingStates(true);
      const targetParam = storeId ? `storeId=${storeId}` : sellerId ? `sellerId=${sellerId}` : '';
      
      // Fetch states
      fetch(`/api/regions/states?countryCode=DZ&${targetParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDynamicWilayas(data.states || []);
            setCountryCurrency(data.country?.currency || 'DZD');
          }
        })
        .finally(() => setIsLoadingStates(false));

      // Fetch dynamic global payment methods
      fetch(`/api/payment-methods/public`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.methods.length > 0) {
            setPaymentMethods(data.methods);
            setSelectedPaymentMethodId(data.methods[0].id);
          }
        });
    }
  }, [items]);

  // Load cities
  useEffect(() => {
    if (!selectedState) {
      setCustomCities([]);
      setSelectedCity('');
      return;
    }

    setIsLoadingCities(true);
    fetch(`/api/regions/cities?stateCode=${selectedState}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.cities)) {
          const visible = d.cities.filter((c: any) => !c.isHidden);
          setCustomCities(visible);
          if (visible.length > 0) setSelectedCity(visible[0].id);
        } else {
          setCustomCities([]);
        }
      })
      .finally(() => setIsLoadingCities(false));
  }, [selectedState]);

  const getShippingCost = () => {
    if (!selectedState) return 0;
    const matchedState = dynamicWilayas.find((w) => w.code === selectedState);
    return matchedState ? (matchedState.price !== undefined ? matchedState.price : matchedState.defaultPrice) : 500;
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(m => m.id === selectedPaymentMethodId);
  };

  const getPaymentFee = () => {
    const method = getSelectedPaymentMethod();
    return method ? Number(method.fee) || 0 : 0;
  };

  const getGrandTotal = () => {
    return Math.max(0, getSubtotal() + getShippingCost() + getPaymentFee() - discountAmount);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal: getSubtotal() }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscountAmount(data.discountAmount);
        toast.success(t('تم تفعيل الكوبون بنجاح!', 'Coupon applied successfully!'));
      } else {
        toast.error(data.error || t('الكوبون غير صالح', 'Invalid coupon'));
        setDiscountAmount(0);
      }
    } catch (error) {
      toast.error(t('حدث خطأ أثناء التحقق من الكوبون', 'Error validating coupon'));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated && !allowGuestCheckout) {
      toast.error(t('الرجاء تسجيل الدخول أولاً', 'Please sign in first'));
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim() || !selectedState) {
      toast.error(t('الرجاء ملء بيانات التوصيل', 'Please fill shipping details'));
      setIsEditingAddress(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const pm = getSelectedPaymentMethod();
    if (pm?.type === 'credit_card' && (!ccNumber || !ccExpiry || !ccCvv)) {
      toast.error(t('الرجاء تعبئة بيانات البطاقة', 'Please fill card details'));
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0] || '',
        price: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
      }));

      const payload: Record<string, any> = {
        paymentMethod: pm?.type || 'cod',
        subtotal: getSubtotal(),
        shippingCost: getShippingCost(),
        tax: 0,
        discount: discountAmount,
        total: getGrandTotal(),
        currency: countryCurrency,
        address: { fullName, phone, street: address, wilayaCode: selectedState, city: selectedCity, country: 'DZ', lat: mapLat, lng: mapLng },
        shippingMethod: 'standard',
        items: orderItems,
      };

      if (isAuthenticated && user?.id) payload.buyerId = user.id;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setCheckoutSuccess(data.orderNumber);
      clearCart();
      toast.success(t('🎉 تم تسجيل طلبك بنجاح!', '🎉 Order placed successfully!'));
    } catch (err) {
      toast.error(t('فشل إرسال الطلب', 'Failed to place order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border p-8 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="mx-auto size-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 className="size-16" />
          </div>
          <h1 className="text-3xl font-black">{t('شكراً لطلبك!', 'Thank You!')}</h1>
          <div className="p-4 bg-muted/40 rounded-2xl">
            <span className="text-xs text-muted-foreground block">{t('رقم الطلب', 'Order No.')}</span>
            <span className="text-2xl font-mono font-bold text-primary block mt-1">#{checkoutSuccess}</span>
          </div>
          <Button className="w-full h-12" onClick={() => router.push('/')}>{t('العودة للتسوق', 'Continue Shopping')}</Button>
        </div>
      </div>
    );
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Upper Navigation Header */}
      <div className="bg-white border-b sticky top-0 z-[50]">
        <div className="max-w-5xl mx-auto h-14 flex items-center justify-between px-4">
          <button onClick={() => router.back()} className="flex items-center gap-1 font-bold text-muted-foreground">
            <BackIcon className="size-5" />
          </button>
          <span className="text-xl font-black tracking-tight">{t('الدفع المتصل والآمن', 'Secure Checkout')}</span>
          <ShieldCheck className="size-5 text-green-600" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-4 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Forms */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Trust Banner */}
          <div className="bg-white p-3 rounded-xl border flex items-center justify-center gap-2 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm font-bold">{t('جميع البيانات مؤمنة ومشفرة تماماً', 'All transactions are secure and encrypted')}</span>
          </div>

          {/* Shipping Address Section */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-black flex items-center gap-2 text-lg">
                <MapPin className="text-brand size-5" />
                {t('عنوان الشحن', 'Shipping Address')}
              </h3>
              {!isEditingAddress && (
                <Button variant="link" onClick={() => setIsEditingAddress(true)} className="text-brand font-bold">
                  {t('تغيير العنوان', 'Change Address')}
                </Button>
              )}
            </div>

            {isEditingAddress ? (
              <div className="p-5 space-y-4">
                {savedAddresses.length > 0 && !isAddingNewAddress && (
                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-bold text-muted-foreground">{t('اختر عنوان توصيل', 'Select a shipping address')}</p>
                    {savedAddresses.map(addr => (
                      <div 
                        key={addr.id} 
                        onClick={() => {
                          setSelectedSavedAddressId(addr.id);
                          setFullName(addr.fullName || '');
                          setPhone(addr.phone || '');
                          setSelectedState(addr.wilayaCode || addr.state || '');
                          setSelectedCity(addr.city || '');
                          setAddress(addr.street || '');
                          if (addr.lat && addr.lng) { setMapLat(addr.lat); setMapLng(addr.lng); }
                        }}
                        className={`p-3 border rounded-xl cursor-pointer transition-colors ${selectedSavedAddressId === addr.id ? 'border-brand bg-brand/5' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm">{addr.fullName} <span className="text-xs text-muted-foreground ml-2">{addr.phone}</span></p>
                          {selectedSavedAddressId === addr.id && <CheckCircle2 className="size-4 text-brand" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{addr.street}, {addr.wilayaCode || addr.state}</p>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2 border-dashed" onClick={() => { setIsAddingNewAddress(true); setSelectedSavedAddressId(''); setAddress(''); }}>
                      <Plus className="size-4 mr-2" /> {t('إضافة عنوان جديد', 'Add new address')}
                    </Button>
                    <Button className="w-full mt-4 font-bold h-12" onClick={() => setIsEditingAddress(false)} disabled={!selectedSavedAddressId}>
                      {t('المتابعة بهذا العنوان', 'Continue with this address')}
                    </Button>
                  </div>
                )}

                {(isAddingNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <Button variant="ghost" onClick={() => setIsAddingNewAddress(false)} className="mb-2 text-xs h-8 text-muted-foreground hover:text-foreground">
                        {isRTL ? '← العودة للعناوين المحفوظة' : '← Back to saved addresses'}
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">{t('الاسم الكامل *', 'Full Name *')}</label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">{t('رقم الهاتف *', 'Phone Number *')}</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">{t('الولاية *', 'State *')}</label>
                    <select 
                      value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="">{t('-- اختر الولاية --', '-- Select State --')}</option>
                      {dynamicWilayas.filter(w => !w.isHidden).map((w) => (
                        <option key={w.code} value={w.code}>{w.code} - {isRTL ? w.nameAr : w.nameEn}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">{t('المدينة *', 'City *')}</label>
                    <select 
                      value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="">{t('-- اختر المدينة --', '-- Select City --')}</option>
                      {customCities.map((c) => (
                        <option key={c.id} value={c.id}>{isRTL ? c.nameAr : c.nameEn}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Dynamic Map Component */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand block mb-1">
                    {t('حدد موقعك على الخريطة (اختياري لجلب اسم الشارع)', 'Pin your location on the map (optional)')}
                  </label>
                  <AddressMap 
                    onLocationSelect={(lat, lng, streetName) => {
                      setMapLat(lat);
                      setMapLng(lng);
                      if (streetName && !address) {
                        setAddress(streetName);
                      }
                    }} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('العنوان التفصيلي (الشارع والمنزل) *', 'Street Address *')}</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <Button className="w-full mt-2 font-bold h-12" onClick={() => setIsEditingAddress(false)} disabled={!fullName || !phone || !selectedState || !address}>
                  {t('حفظ والمتابعة', 'Save & Continue')}
                </Button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <p className="font-bold text-base">{fullName} <span className="text-muted-foreground font-normal ml-2">{phone}</span></p>
                <p className="text-sm text-muted-foreground mt-1">{address}, {customCities.find(c => c.id === selectedCity)?.nameAr} - {selectedState}</p>
              </div>
            )}
          </div>

          {/* Dynamic Payment Methods Section */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-black text-lg">{t('طُرق الدفع', 'Payment Methods')}</h3>
            </div>
            
            <div className="p-4 space-y-3">
              {paymentMethods.map(method => {
                const isSelected = selectedPaymentMethodId === method.id;
                
                return (
                  <div key={method.id} className={`border-2 rounded-xl overflow-hidden transition-all ${isSelected ? 'border-brand' : 'border-border/50'}`}>
                    <div 
                      className={`p-4 flex items-center gap-3 cursor-pointer ${isSelected ? 'bg-brand/5' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedPaymentMethodId(method.id)}
                    >
                      <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-brand' : 'border-muted-foreground'}`}>
                        {isSelected && <div className="size-2.5 bg-brand rounded-full"></div>}
                      </div>
                      <div className="p-2 bg-white rounded-md border shadow-sm shrink-0">
                        {ICON_MAP[method.icon] || <CreditCard className="size-5" />}
                      </div>
                      <div className="flex-1 font-bold text-sm">
                        {isRTL ? method.name : (method.nameEn || method.name)}
                      </div>
                    </div>

                    {/* Expandable UI based on method TYPE */}
                    {isSelected && (
                      <div className="p-4 pt-0 bg-brand/5 border-t border-brand/10">
                        
                        {/* Type: Credit Card Form */}
                        {method.type === 'credit_card' && (
                          <div className="space-y-3 mt-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-green-600 mb-2">
                              <ShieldCheck className="size-4" /> {t('جميع المعاملات آمنة ومشفرة', 'All transactions are secure and encrypted')}
                            </div>
                            <Input placeholder={t('* رقم البطاقة', '* Card Number')} value={ccNumber} onChange={e => setCcNumber(e.target.value)} className="bg-white" />
                            <div className="grid grid-cols-2 gap-3">
                              <Input placeholder={t('* شهر / سنة', '* MM / YY')} value={ccExpiry} onChange={e => setCcExpiry(e.target.value)} className="bg-white" />
                              <Input placeholder={t('* CVV رمز مكون من 3 أرقام', '* CVV 3-digit code')} value={ccCvv} onChange={e => setCcCvv(e.target.value)} className="bg-white" type="password" maxLength={3} />
                            </div>
                          </div>
                        )}

                        {/* Type: Installments (Tabby style) */}
                        {method.type === 'installments' && (
                          <div className="mt-3 bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm font-bold mb-3">{t('قسمها حتى 4 دفعات بدون فوائد', 'Split into 4 interest-free payments')}</p>
                            <div className="flex justify-between text-center relative">
                              <div className="absolute top-3 left-6 right-6 h-0.5 bg-gray-200 z-0"></div>
                              {[t('اليوم', 'Today'), t('خلال شهر', '1 Month'), t('خلال شهرين', '2 Months'), t('خلال 3 أشهر', '3 Months')].map((label, i) => (
                                <div key={i} className="z-10 flex flex-col items-center">
                                  <div className="size-6 rounded-full bg-[#3eefaa] text-black font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm">
                                    {i === 0 ? '✓' : i+1}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground mt-2">{label}</span>
                                  <span className="font-bold text-xs">{(getGrandTotal() / 4).toFixed(2)} د.إ</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Type: COD Warning */}
                        {method.type === 'cod' && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs leading-relaxed">
                            {method.fee > 0 ? (
                              <p>{t(`يتم تطبيق رسوم الدفع عند الاستلام بقيمة ${method.fee} د.إ. وهي غير قابلة للاسترداد. في حالات إرجاع المنتجات، سيتم إصدار الاسترداد إلى رصيدك.`, `A COD fee of ${method.fee} AED applies and is non-refundable.`)}</p>
                            ) : (
                              <p>{t('ادفع نقداً عند استلام طلبك وباب منزلك بكل راحة.', 'Pay in cash upon delivery at your doorstep.')}</p>
                            )}
                          </div>
                        )}

                        {/* Type: Bank/Wallet Note */}
                        {['bank_transfer', 'wallet'].includes(method.type) && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            {t('سيتم تزويدك بتفاصيل الحساب أو التحويل بعد تأكيد الطلب مباشرة لإتمام العملية.', 'Account details for transfer will be provided immediately after order confirmation.')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-4 space-y-4 relative">
          <div className="sticky top-20 space-y-4">
            
            {/* Order Summary Box */}
            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-black text-lg mb-4">{t('إجمالي الطلب', 'Order Summary')}</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('إجمالي المنتجات', 'Subtotal')} ({itemCount})</span>
                  <span>{getSubtotal().toFixed(2)} {countryCurrency}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('الشحن', 'Shipping')}</span>
                  {getShippingCost() === 0 ? (
                    <span className="text-green-600 font-bold">{t('مجانًا', 'Free')}</span>
                  ) : (
                    <span>{getShippingCost().toFixed(2)} {countryCurrency}</span>
                  )}
                </div>
                {getPaymentFee() > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>{t('رسوم الدفع', 'Payment Fee')}</span>
                    <span>+{getPaymentFee().toFixed(2)} {countryCurrency}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>{t('الخصم (كوبون)', 'Discount (Coupon)')}</span>
                    <span>-{discountAmount.toFixed(2)} {countryCurrency}</span>
                  </div>
                )}
              </div>
              
              <div className="my-4 h-px bg-border"></div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-lg">{t('الإجمالي', 'Total')}</span>
                <span className="font-black text-2xl text-brand">{getGrandTotal().toFixed(2)} {countryCurrency}</span>
              </div>

              <Button 
                onClick={handlePlaceOrder}
                disabled={isSubmitting || isEditingAddress}
                className="w-full h-14 rounded-full gradient-brand text-navy font-black text-lg shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : t('إتمام الطلب الآن', 'Place Order Now')}
              </Button>
              <div className="text-center mt-3 text-[10px] text-muted-foreground">
                {t('بالمتابعة، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بـ ChariDay.', 'By placing order, you agree to ChariDay Privacy & Terms.')}
              </div>
            </div>
            {/* Coupon Block */}
            <div className="bg-white p-4 rounded-xl border flex gap-2">
              <Input 
                placeholder={t('أدخل رمز الكوبون', 'Enter coupon code')} 
                value={couponCode} 
                onChange={e => setCouponCode(e.target.value)} 
                className="bg-gray-50"
                disabled={discountAmount > 0}
              />
              <Button 
                variant="secondary" 
                onClick={handleApplyCoupon} 
                disabled={!couponCode || isApplyingCoupon || discountAmount > 0}
              >
                {isApplyingCoupon ? <Loader2 className="animate-spin size-4" /> : (discountAmount > 0 ? t('مُفعل', 'Applied') : t('تطبيق', 'Apply'))}
              </Button>
            </div>

            {/* Product Summary Collapse */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b text-sm font-bold">
                {t('المنتجات في طلبك', 'Items in your order')}
              </div>
              <div className="max-h-64 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="size-12 rounded-md bg-muted overflow-hidden shrink-0">
                      {item.product.images[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium line-clamp-1">{isRTL ? item.product.name : (item.product.nameEn || item.product.name)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold">{item.product.price} {countryCurrency}</span>
                        <span className="text-[10px] text-muted-foreground">x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
