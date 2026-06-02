'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import {
  ShoppingBag, CreditCard, Truck, MapPin, Check,
  ChevronRight, ChevronLeft, User, Phone, Home,
  AlertCircle, Loader2, CheckCircle2, ArrowRight, ArrowLeft,
  Building, Map, Coins, FileText, Landmark
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CheckoutPage() {
  const router = useRouter();
  const { locale, theme, allowGuestCheckout } = useAppStore();
  const { user, isAuthenticated } = useAuthStore();
  const {
    items,
    itemCount,
    getSubtotal,
    clearCart
  } = useCartStore();

  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const isRTL = isAr;

  // Active step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // States list & payment config
  const [dynamicWilayas, setDynamicWilayas] = useState<any[]>([]);
  const [customCities, setCustomCities] = useState<any[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [storeName, setStoreName] = useState<string>('ChariDay Store');
  const [countryCurrency, setCountryCurrency] = useState<string>('DZD');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedState, setSelectedState] = useState(''); // Wilaya code
  const [selectedCity, setSelectedCity] = useState(''); // City ID
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [note, setNote] = useState('');

  // Shipping & Payment selections
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'baridimob' | 'bank_transfer' | 'satim'>('cod');

  // Order submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  // Pre-fill user information if logged in
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Redirect to home if cart is empty and not checked out
  useEffect(() => {
    if (items.length === 0 && !checkoutSuccess) {
      toast.error(t('سلتك فارغة، الرجاء إضافة منتجات أولاً', 'Your cart is empty, please add products first'));
      router.push('/');
    }
  }, [items, checkoutSuccess]);

  // Load States/Wilayas & payment configs based on first cart item's seller/store
  useEffect(() => {
    if (items.length > 0) {
      const p = items[0].product;
      const storeId = p.store?.id || (p as any).storeId;
      const sellerId = p.seller?.id || (p as any).sellerId;

      setIsLoadingStates(true);
      const targetParam = storeId ? `storeId=${storeId}` : sellerId ? `sellerId=${sellerId}` : '';
      
      // Fetch shipping rates & states
      fetch(`/api/regions/states?countryCode=DZ&${targetParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDynamicWilayas(data.states || []);
            setCountryCurrency(data.country?.currency || 'DZD');
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingStates(false));

      // Fetch payment config
      fetch(`/api/checkout/config?${targetParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPaymentConfig(data.paymentConfig);
            setStoreName(data.storeName);
            // Default to first enabled payment method
            const pc = data.paymentConfig;
            if (pc.codEnabled) setPaymentMethod('cod');
            else if (pc.baridiMobRip) setPaymentMethod('baridimob');
            else if (pc.bankEnabled) setPaymentMethod('bank_transfer');
            else if (pc.satimEnabled) setPaymentMethod('satim');
          }
        })
        .catch(() => {});
    }
  }, [items]);

  // Load cities/communes when selectedState changes
  useEffect(() => {
    if (!selectedState) {
      setCustomCities([]);
      setSelectedCity('');
      return;
    }

    setIsLoadingCities(true);
    const p = items[0]?.product;
    const storeId = p?.store?.id || (p as any)?.storeId;
    const sellerId = p?.seller?.id || (p as any)?.sellerId;
    const storeParam = storeId ? `&storeId=${storeId}` : '';
    const sellerParam = sellerId ? `&sellerId=${sellerId}` : '';

    fetch(`/api/regions/cities?stateCode=${selectedState}${storeParam}${sellerParam}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.cities)) {
          const visible = d.cities.filter((c: any) => !c.isHidden);
          setCustomCities(visible);
          if (visible.length > 0) {
            setSelectedCity(visible[0].id);
          } else {
            setSelectedCity('');
          }
        } else {
          setCustomCities([]);
          setSelectedCity('');
        }
      })
      .catch(() => {
        setCustomCities([]);
        setSelectedCity('');
      })
      .finally(() => setIsLoadingCities(false));
  }, [selectedState]);

  // Calculate shipping cost
  const getShippingCost = () => {
    if (!selectedState) return 0;
    const subtotal = getSubtotal();

    const matchedState = dynamicWilayas.find((w) => w.code === selectedState);
    let basePrice = 500;
    if (matchedState) {
      basePrice = matchedState.price !== undefined ? matchedState.price : matchedState.defaultPrice;
    }

    // Express shipping add-on
    if (shippingMethod === 'express') {
      basePrice += 300;
    }

    return basePrice;
  };

  const getGrandTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!fullName.trim() || !phone.trim() || !address.trim() || !selectedState || !selectedCity) {
        toast.error(t('الرجاء ملء جميع الحقول المطلوبة لبدء الشحن', 'Please fill in all required fields to start shipping'));
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated && !allowGuestCheckout) {
      toast.error(t('الرجاء تسجيل الدخول أولاً لإتمام طلبك', 'Please sign in first to complete your order'));
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

      const shippingCost = getShippingCost();
      const matchedWilaya = dynamicWilayas.find((w) => w.code === selectedState);
      const wilayaName = matchedWilaya ? (isAr ? matchedWilaya.nameAr : matchedWilaya.nameEn) : selectedState;
      const matchedCity = customCities.find((c) => c.id === selectedCity);
      const cityName = matchedCity ? (isAr ? matchedCity.nameAr : matchedCity.nameEn) : '';

      const payload: Record<string, any> = {
        paymentMethod,
        subtotal: getSubtotal(),
        shippingCost,
        tax: 0,
        discount: 0,
        total: getGrandTotal(),
        currency: countryCurrency,
        address: {
          fullName,
          phone,
          street: address,
          wilaya: wilayaName,
          wilayaCode: selectedState,
          city: cityName || wilayaName,
          municipality: cityName,
          neighborhood: selectedNeighborhood,
          country: 'DZ',
        },
        shippingMethod,
        items: orderItems,
      };

      if (isAuthenticated && user?.id) {
        payload.buyerId = user.id;
      }

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
      toast.error(t('فشل إرسال الطلب. الرجاء المحاولة مرة أخرى', 'Failed to place order. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-surface border border-border/80 p-8 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 gradient-brand"></div>
          
          <div className="mx-auto size-24 rounded-full bg-green-500/10 border-4 border-green-500/20 flex items-center justify-center text-green-500">
            <CheckCircle2 className="size-16" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black font-cairo tracking-tight text-foreground">
              {t('شكراً لطلبك!', 'Thank You for Your Order!')}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t(
                `تم إرسال طلبك بنجاح إلى متجر "${storeName}". سوف يتواصل معك التاجر لتأكيد الشحن والتسليم.`,
                `Your order was successfully sent to "${storeName}". The seller will contact you shortly to confirm.`
              )}
            </p>
          </div>

          <div className="p-4 bg-muted/40 border border-border/60 rounded-2xl">
            <span className="text-xs text-muted-foreground block">{t('رقم الطلب المرجعي', 'Order Reference Number')}</span>
            <span className="text-2xl font-mono font-bold text-primary block mt-1">#{checkoutSuccess}</span>
          </div>

          {paymentMethod === 'baridimob' && paymentConfig?.baridiMobRip && (
            <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl text-start space-y-2">
              <span className="text-xs font-bold text-brand block">💳 {t('معلومات الدفع بريدي موب:', 'BaridiMob Payment Info:')}</span>
              <p className="text-sm font-semibold text-foreground select-all">RIP: <span className="font-mono">{paymentConfig.baridiMobRip}</span></p>
              <p className="text-xs text-muted-foreground">{t('يرجى تحويل المبلغ الإجمالي إلى الحساب المذكور أعلاه وإرسال وصل الدفع للتاجر عند التواصل.', 'Please transfer the total amount and send the transaction receipt to the seller.')}</p>
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (paymentConfig?.ccpAccount || paymentConfig?.ccpName) && (
            <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl text-start space-y-2">
              <span className="text-xs font-bold text-brand block">🏛️ {t('معلومات الدفع CCP:', 'CCP Payment Info:')}</span>
              {paymentConfig.ccpAccount && <p className="text-sm font-semibold text-foreground select-all">CCP: <span className="font-mono">{paymentConfig.ccpAccount}</span></p>}
              {paymentConfig.ccpName && <p className="text-sm font-semibold text-foreground">{t('الاسم الكامل: ', 'Beneficiary: ')}<span className="font-semibold">{paymentConfig.ccpName}</span></p>}
              <p className="text-xs text-muted-foreground">{t('يرجى تحويل المبلغ الإجمالي لحساب الجاري CCP وإرسال وصل الدفع للتاجر.', 'Please transfer to the CCP account and share the receipt.')}</p>
            </div>
          )}

          <div className="pt-4 space-y-2">
            <Button
              className="w-full gradient-brand text-navy font-bold h-12 rounded-2xl shadow-lg shadow-brand/20 transition-all hover:scale-[1.01]"
              onClick={() => {
                const { setBuyerMode } = useAuthStore.getState();
                setBuyerMode(true);
                router.push('/?view=buyer');
              }}
            >
              {t('تتبع طلبك في حساب المشتري', 'Track Order in Dashboard')}
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-border/80"
              onClick={() => {
                router.push('/');
              }}
            >
              {t('العودة للتسوق', 'Continue Shopping')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="min-h-screen bg-background pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Upper Navigation Header */}
      <div className="border-b border-border/60 bg-surface/50 backdrop-blur-md sticky top-0 z-[50]">
        <div className="container-platform h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <BackIcon className="size-4" />
            {t('العودة للخلف', 'Go Back')}
          </button>
          
          <span className="text-lg font-black text-foreground">
            {t('الدفع والطلب الآمن', 'Secure Checkout')}
          </span>

          <div className="w-[80px]"></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container-platform mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Stepped Checkout Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step Wizard Progress Header */}
            <div className="bg-surface border border-border/80 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between relative">
                
                {/* Background Connecting Lines */}
                <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-border -translate-y-1/2 z-0"></div>
                <div 
                  className="absolute top-1/2 left-[10%] h-0.5 bg-brand -translate-y-1/2 z-0 transition-all duration-300"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '80%'
                  }}
                ></div>

                {/* Steps Nodes */}
                {[
                  { step: 1, label: t('العنوان', 'Address'), icon: MapPin },
                  { step: 2, label: t('التوصيل', 'Shipping'), icon: Truck },
                  { step: 3, label: t('الدفع', 'Payment'), icon: CreditCard },
                  { step: 4, label: t('المراجعة', 'Review'), icon: FileText }
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;

                  return (
                    <div key={s.step} className="flex flex-col items-center z-10 space-y-2">
                      <div 
                        className={`size-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                          isCurrent 
                            ? 'bg-brand text-navy border-brand scale-110 shadow-lg shadow-brand/20 font-black' 
                            : isActive 
                            ? 'bg-brand text-navy border-brand font-bold' 
                            : 'bg-background text-muted-foreground border-border'
                        }`}
                      >
                        {isActive && currentStep > s.step ? <Check className="size-5" /> : <Icon className="size-4" />}
                      </div>
                      <span className={`text-xs font-bold font-cairo ${isActive ? 'text-foreground font-black' : 'text-muted-foreground'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP CONTENT CARDS */}
            <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                
                {/* ── STEP 1: SHIPPING ADDRESS ── */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-xl font-black font-cairo text-foreground flex items-center gap-2">
                        <MapPin className="text-brand size-5" />
                        {t('تفاصيل التوصيل وعنوان الشحن', 'Shipping Details')}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('يرجى تزويد التاجر بالمعلومات الصحيحة لتفادي أي مشكل في التوصيل.', 'Please fill out your correct details for smooth delivery.')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-start">
                        <label className="text-xs font-bold text-muted-foreground">{t('الاسم الكامل *', 'Full Name *')}</label>
                        <Input 
                          placeholder={t('أحمد محمد', 'Ahmed Mohamed')} 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="h-11 rounded-2xl"
                        />
                      </div>
                      
                      <div className="space-y-1.5 text-start">
                        <label className="text-xs font-bold text-muted-foreground">{t('رقم الهاتف للتواصل *', 'Phone Number *')}</label>
                        <Input 
                          placeholder="05XXXXXXXX / 06XXXXXXXX" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="h-11 rounded-2xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* State (Wilaya) */}
                      <div className="space-y-1.5 text-start">
                        <label className="text-xs font-bold text-muted-foreground">{t('الولاية *', 'Wilaya / Province *')}</label>
                        {isLoadingStates ? (
                          <div className="h-11 border rounded-2xl flex items-center justify-center bg-muted/10">
                            <Loader2 className="size-4 animate-spin text-primary" />
                          </div>
                        ) : (
                          <select 
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            required
                            className="flex h-11 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">{t('-- اختر الولاية --', '-- Select Wilaya --')}</option>
                            {dynamicWilayas.filter(w => !w.isHidden).map((w) => (
                              <option key={w.code} value={w.code}>
                                {w.code} - {isRTL ? w.nameAr : w.nameEn} ({w.price === 0 ? t('شحن مجاني', 'Free Shipping') : `${w.price} د.ج`})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* City (Commune) */}
                      <div className="space-y-1.5 text-start">
                        <label className="text-xs font-bold text-muted-foreground">{t('البلدية / الدائرة *', 'Commune / Municipality *')}</label>
                        {isLoadingCities ? (
                          <div className="h-11 border rounded-2xl flex items-center justify-center bg-muted/10">
                            <Loader2 className="size-4 animate-spin text-primary" />
                          </div>
                        ) : (
                          <select 
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            disabled={!selectedState}
                            required
                            className="flex h-11 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-muted/30"
                          >
                            <option value="">{t('-- اختر البلدية --', '-- Select Commune --')}</option>
                            {customCities.map((c) => (
                              <option key={c.id} value={c.id}>
                                {isRTL ? c.nameAr : c.nameEn}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Neighborhood */}
                      <div className="space-y-1.5 text-start">
                        <label className="text-xs font-bold text-muted-foreground">{t('الحي / القرية (اختياري)', 'Neighborhood / Zone (Optional)')}</label>
                        <Input 
                          placeholder={t('مثال: حي الصنوبر، تجمع 40 مسكن', 'e.g. Pine district, 40 dwellings')}
                          value={selectedNeighborhood}
                          onChange={(e) => setSelectedNeighborhood(e.target.value)}
                          className="h-11 rounded-2xl"
                        />
                      </div>

                      {/* Street address */}
                      <div className="space-y-1.5 text-start">
                        <label className="text-xs font-bold text-muted-foreground">{t('العنوان التفصيلي (الشارع والمنزل) *', 'Street / House Address *')}</label>
                        <Input 
                          placeholder={t('حي 20 مسكن، الطابق الثاني شقة 4', '20 Dwellings, 2nd floor apt 4')} 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          className="h-11 rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: SHIPPING METHOD ── */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-xl font-black font-cairo text-foreground flex items-center gap-2">
                        <Truck className="text-brand size-5" />
                        {t('طريقة التوصيل والشحن', 'Shipping Method')}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('اختر سرعة التوصيل المناسبة لطلبك.', 'Choose the shipping speed that suits you.')}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Standard Option */}
                      <div 
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          shippingMethod === 'standard' 
                            ? 'border-brand bg-brand/5' 
                            : 'border-border/60 hover:border-border'
                        }`}
                        onClick={() => setShippingMethod('standard')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`size-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'standard' ? 'border-brand text-brand' : 'border-muted'}`}>
                            {shippingMethod === 'standard' && <div className="size-2.5 rounded-full bg-brand"></div>}
                          </div>
                          <div className="text-start">
                            <span className="font-bold text-sm block">{t('توصيل قياسي للمنزل', 'Standard Home Delivery')}</span>
                            <span className="text-xs text-muted-foreground">{t('يستغرق من 2 إلى 5 أيام عمل عادة.', 'Usually takes 2-5 business days.')}</span>
                          </div>
                        </div>
                        <span className="font-black text-sm text-primary">
                          {t('حسب سعر الولاية', 'Wilaya Price')}
                        </span>
                      </div>

                      {/* Express Option */}
                      <div 
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          shippingMethod === 'express' 
                            ? 'border-brand bg-brand/5' 
                            : 'border-border/60 hover:border-border'
                        }`}
                        onClick={() => setShippingMethod('express')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`size-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'express' ? 'border-brand text-brand' : 'border-muted'}`}>
                            {shippingMethod === 'express' && <div className="size-2.5 rounded-full bg-brand"></div>}
                          </div>
                          <div className="text-start">
                            <span className="font-bold text-sm block">{t('شحن سريع / إكسبريس (مستعجل)', 'Express Delivery')}</span>
                            <span className="text-xs text-muted-foreground">{t('يصل خلال 24-48 ساعة عمل كأقصى تقدير.', 'Delivery within 24-48 hours.')}</span>
                          </div>
                        </div>
                        <span className="font-black text-sm text-primary">
                          +{t('300 د.ج إضافية', '300 DZD extra')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: PAYMENT METHOD ── */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-xl font-black font-cairo text-foreground flex items-center gap-2">
                        <CreditCard className="text-brand size-5" />
                        {t('خيارات الدفع المتاحة للتاجر', 'Payment Options')}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t(`هذه هي طرق الدفع التي يدعمها متجر "${storeName}". الدفع يتم مباشرة للتاجر.`, `Choose the payment method. Payments go directly to the merchant.`)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* COD */}
                      {(!paymentConfig || paymentConfig.codEnabled) && (
                        <div 
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            paymentMethod === 'cod' ? 'border-brand bg-brand/5' : 'border-border/60 hover:border-border'
                          }`}
                          onClick={() => setPaymentMethod('cod')}
                        >
                          <div className={`size-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${paymentMethod === 'cod' ? 'border-brand text-brand' : 'border-muted'}`}>
                            {paymentMethod === 'cod' && <div className="size-2.5 rounded-full bg-brand"></div>}
                          </div>
                          <div className="text-start">
                            <span className="font-bold text-sm block flex items-center gap-1.5">
                              <Coins className="size-4 text-amber-500" />
                              {t('الدفع عند الاستلام (COD)', 'Cash on Delivery (COD)')}
                            </span>
                            <span className="text-xs text-muted-foreground">{t('ادفع نقداً عند استلام طلبك وباب منزلك.', 'Pay in cash once the order reaches your doorstep.')}</span>
                          </div>
                        </div>
                      )}

                      {/* BaridiMob */}
                      {paymentConfig?.baridiMobRip && (
                        <div 
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            paymentMethod === 'baridimob' ? 'border-brand bg-brand/5' : 'border-border/60 hover:border-border'
                          }`}
                          onClick={() => setPaymentMethod('baridimob')}
                        >
                          <div className={`size-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${paymentMethod === 'baridimob' ? 'border-brand text-brand' : 'border-muted'}`}>
                            {paymentMethod === 'baridimob' && <div className="size-2.5 rounded-full bg-brand"></div>}
                          </div>
                          <div className="text-start space-y-2 flex-1">
                            <span className="font-bold text-sm block flex items-center gap-1.5">
                              <Landmark className="size-4 text-blue-500" />
                              {t('بريدي موب (BaridiMob)', 'BaridiMob Transfer')}
                            </span>
                            <span className="text-xs text-muted-foreground block">{t('حول مباشرة إلى حساب بريدي موب الخاص بالتاجر.', 'Transfer directly to the merchant\'s BaridiMob account.')}</span>
                            
                            {paymentMethod === 'baridimob' && (
                              <div className="p-3 bg-muted/60 border border-border rounded-xl space-y-1 mt-2">
                                <span className="text-[10px] text-muted-foreground block">{t('رقم الحساب الجاري RIP للتاجر:', 'Merchant RIP Account:')}</span>
                                <span className="text-sm font-mono font-bold select-all block text-foreground">{paymentConfig.baridiMobRip}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer / CCP */}
                      {paymentConfig?.bankEnabled && (paymentConfig.ccpAccount || paymentConfig.ccpName) && (
                        <div 
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            paymentMethod === 'bank_transfer' ? 'border-brand bg-brand/5' : 'border-border/60 hover:border-border'
                          }`}
                          onClick={() => setPaymentMethod('bank_transfer')}
                        >
                          <div className={`size-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${paymentMethod === 'bank_transfer' ? 'border-brand text-brand' : 'border-muted'}`}>
                            {paymentMethod === 'bank_transfer' && <div className="size-2.5 rounded-full bg-brand"></div>}
                          </div>
                          <div className="text-start space-y-2 flex-1">
                            <span className="font-bold text-sm block flex items-center gap-1.5">
                              <Building className="size-4 text-purple-500" />
                              {t('حوالة CCP / تحويل بنكي', 'CCP Bank Transfer')}
                            </span>
                            <span className="text-xs text-muted-foreground block">{t('قم بالدفع عبر مكتب البريد CCP أو تحويل لحساب البنكي.', 'Pay via post office CCP or wire transfer.')}</span>
                            
                            {paymentMethod === 'bank_transfer' && (
                              <div className="p-3 bg-muted/60 border border-border rounded-xl space-y-1.5 mt-2">
                                {paymentConfig.ccpAccount && (
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">{t('رقم حساب CCP:', 'CCP Account:')}</span>
                                    <span className="text-sm font-mono font-bold select-all block text-foreground">{paymentConfig.ccpAccount}</span>
                                  </div>
                                )}
                                {paymentConfig.ccpName && (
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">{t('اسم المستفيد:', 'Beneficiary Name:')}</span>
                                    <span className="text-sm font-semibold block text-foreground">{paymentConfig.ccpName}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 4: REVIEW & CONFIRM ── */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fade-in text-start">
                    <div>
                      <h3 className="text-xl font-black font-cairo text-foreground flex items-center gap-2">
                        <FileText className="text-brand size-5" />
                        {t('مراجعة وتأكيد طلبك', 'Review & Confirm Order')}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('يرجى مراجعة كافة التفاصيل قبل إرسال طلبك.', 'Please verify all details before submitting.')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Delivery Info Box */}
                      <div className="p-4 border border-border/80 rounded-2xl bg-muted/20 space-y-2">
                        <span className="text-xs font-bold text-muted-foreground block">📍 {t('عنوان التوصيل:', 'Delivery Address:')}</span>
                        <div className="text-sm space-y-1 text-foreground font-semibold">
                          <p>{fullName}</p>
                          <p>{phone}</p>
                          <p>
                            {address}, {customCities.find(c => c.id === selectedCity)?.nameAr || ''} - {dynamicWilayas.find(w => w.code === selectedState)?.nameAr || ''}
                          </p>
                          {selectedNeighborhood && <p className="text-xs text-muted-foreground">{t('الحي: ', 'Zone: ')}{selectedNeighborhood}</p>}
                        </div>
                      </div>

                      {/* Payment & Shipping Summary Box */}
                      <div className="p-4 border border-border/80 rounded-2xl bg-muted/20 space-y-2">
                        <span className="text-xs font-bold text-muted-foreground block">💳 {t('طريقة الشحن والدفع:', 'Shipping & Payment:')}</span>
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="text-xs text-muted-foreground block">{t('نوع الشحن:', 'Shipping Method:')}</span>
                            <span className="font-bold">{shippingMethod === 'express' ? t('🚀 شحن سريع (24-48 ساعة)', 'Express') : t('📦 توصيل قياسي للمنزل', 'Standard')}</span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">{t('وسيلة الدفع:', 'Payment Method:')}</span>
                            <span className="font-bold">
                              {paymentMethod === 'cod' && t('💵 الدفع عند الاستلام (COD)', 'Cash on Delivery')}
                              {paymentMethod === 'baridimob' && t('💳 بريدي موب (BaridiMob)', 'BaridiMob')}
                              {paymentMethod === 'bank_transfer' && t('🏛️ CCP / تحويل بنكي', 'CCP Bank Transfer')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {note && (
                      <div className="p-4 border border-border/80 rounded-2xl bg-muted/20">
                        <span className="text-xs font-bold text-muted-foreground block">📝 {t('ملاحظات المشتري:', 'Buyer Notes:')}</span>
                        <p className="text-sm font-medium mt-1 italic text-foreground/80">"{note}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTTOM NAVIGATION ACTIONS */}
                <div className="flex items-center justify-between border-t border-border/60 pt-6 mt-8">
                  {currentStep > 1 ? (
                    <Button
                      variant="outline"
                      className="rounded-xl px-5 h-11 border-border/85"
                      onClick={handlePrevStep}
                    >
                      <PrevIcon className="size-4 me-1.5" />
                      {t('السابق', 'Previous')}
                    </Button>
                  ) : (
                    <div className="w-[10px]"></div>
                  )}

                  {currentStep < 4 ? (
                    <Button
                      className="gradient-brand text-navy font-bold rounded-xl px-6 h-11 shadow-md shadow-brand/10 hover:scale-[1.01]"
                      onClick={handleNextStep}
                    >
                      {t('التالي', 'Next')}
                      <NextIcon className="size-4 ms-1.5" />
                    </Button>
                  ) : (
                    <Button
                      disabled={isSubmitting}
                      className="gradient-brand text-navy font-bold rounded-xl px-8 h-11 shadow-lg shadow-brand/20 hover:scale-[1.01]"
                      onClick={handlePlaceOrder}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin me-2" />
                          {t('جاري الطلب...', 'Placing Order...')}
                        </>
                      ) : (
                        <>
                          <Check className="size-4 me-1.5" />
                          {paymentMethod === 'cod' 
                            ? t('تأكيد الطلب والدفع عند الاستلام', 'Confirm Order (COD)')
                            : t('تأكيد الطلب وإرسال الفاتورة', 'Confirm & Send Order')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Cart Summary Panel (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-muted/40 border-b border-border/60 font-black text-sm flex items-center justify-between">
                <span>{t('ملخص طلبك', 'Order Summary')}</span>
                <Badge className="bg-brand text-navy">{itemCount}</Badge>
              </div>
              
              <CardContent className="p-5 space-y-4">
                
                {/* Cart Items List */}
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3 text-start">
                      <img
                        src={item.product.images[0] || '/images/placeholder.jpg'}
                        alt={item.product.name}
                        className="size-12 object-cover rounded-xl border border-border shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-xs font-bold text-foreground truncate leading-tight">
                          {item.product.name}
                        </h4>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {item.quantity} × {item.product.price.toLocaleString()} {countryCurrency}
                        </span>
                      </div>
                      <span className="text-xs font-black text-foreground self-center">
                        {(item.product.price * item.quantity).toLocaleString()} {countryCurrency}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Totals Summary */}
                <div className="border-t border-border/60 pt-4 space-y-2 text-sm text-start">
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>{t('المجموع الفرعي', 'Subtotal')}</span>
                    <span className="font-bold">{getSubtotal().toLocaleString()} {countryCurrency}</span>
                  </div>
                  
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>{t('تكلفة الشحن والتوصيل', 'Shipping Fee')}</span>
                    <span className="font-bold">
                      {!selectedState 
                        ? t('يحدد حسب الولاية', 'Set by Wilaya') 
                        : getShippingCost() === 0 
                        ? t('شحن مجاني 🎉', 'Free 🎉') 
                        : `${getShippingCost().toLocaleString()} ${countryCurrency}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-foreground font-black text-base border-t border-border/60 pt-3 mt-1">
                    <span>{t('المجموع الإجمالي', 'Grand Total')}</span>
                    <span className="text-primary text-lg">
                      {getGrandTotal().toLocaleString()} {countryCurrency}
                    </span>
                  </div>
                </div>

                {/* Guaranteed Secure Badge */}
                <div className="p-3 bg-muted/30 border border-border/40 rounded-2xl flex items-center gap-2 text-[10px] text-muted-foreground text-start">
                  <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-600 font-bold shrink-0">
                    {t('آمن 100%', '100% Secure')}
                  </Badge>
                  <span>{t('جميع بياناتك الشخصية والدفع مشفرة ومحمية.', 'Your data is secured using SSL encryption.')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
