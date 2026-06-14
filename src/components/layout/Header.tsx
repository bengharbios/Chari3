'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import {
  Search, ShoppingCart, Moon, Sun,
  Menu, X, ChevronDown, User, LogOut, Settings,
  ClipboardCheck, Trash2, Plus, Minus, Loader2, CheckSquare,
  ArrowLeft, ArrowRight, ShoppingBag, Truck, Tag, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import NotificationPanel from '@/components/notifications/NotificationPanel';
import type { PageType } from '@/types';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import DeliverTo from '@/components/storefront/DeliverTo';
import { localeDirections } from '@/lib/i18n/config';
import { useTranslation } from '@/lib/i18n/useTranslation';


const rolePages: Record<string, PageType> = {
  admin: 'admin',
  store_manager: 'store',
  seller: 'seller',
  supplier: 'seller',
  logistics: 'logistics',
  buyer: 'buyer',
};

const ALGERIAN_WILAYAS = [
  { id: '1', nameAr: 'أدرار', nameEn: 'Adrar', defaultPrice: 1200 },
  { id: '2', nameAr: 'الشلف', nameEn: 'Chlef', defaultPrice: 600 },
  { id: '3', nameAr: 'الأغواط', nameEn: 'Laghouat', defaultPrice: 800 },
  { id: '4', nameAr: 'أم البواقي', nameEn: 'Oum El Bouaghi', defaultPrice: 700 },
  { id: '5', nameAr: 'باتنة', nameEn: 'Batna', defaultPrice: 600 },
  { id: '6', nameAr: 'بجاية', nameEn: 'Bejaia', defaultPrice: 500 },
  { id: '7', nameAr: 'بسكرة', nameEn: 'Biskra', defaultPrice: 800 },
  { id: '8', nameAr: 'بشار', nameEn: 'Bechar', defaultPrice: 1000 },
  { id: '9', nameAr: 'البليدة', nameEn: 'Blida', defaultPrice: 400 },
  { id: '10', nameAr: 'البويرة', nameEn: 'Bouira', defaultPrice: 500 },
  { id: '11', nameAr: 'تمنراست', nameEn: 'Tamanrasset', defaultPrice: 1500 },
  { id: '12', nameAr: 'تبسة', nameEn: 'Tebessa', defaultPrice: 700 },
  { id: '13', nameAr: 'تلمسان', nameEn: 'Tlemcen', defaultPrice: 600 },
  { id: '14', nameAr: 'تيارت', nameEn: 'Tiaret', defaultPrice: 600 },
  { id: '15', nameAr: 'تيزي وزو', nameEn: 'Tizi Ouzou', defaultPrice: 500 },
  { id: '16', nameAr: 'الجزائر العاصمة', nameEn: 'Algiers', defaultPrice: 300 },
  { id: '17', nameAr: 'الجلفة', nameEn: 'Djelfa', defaultPrice: 700 },
  { id: '18', nameAr: 'جيجل', nameEn: 'Jijel', defaultPrice: 600 },
  { id: '19', nameAr: 'سطيف', nameEn: 'Setif', defaultPrice: 500 },
  { id: '20', nameAr: 'سعيدة', nameEn: 'Saida', defaultPrice: 700 },
  { id: '21', nameAr: 'سكيكدة', nameEn: 'Skikda', defaultPrice: 600 },
  { id: '22', nameAr: 'سيدي بلعباس', nameEn: 'Sidi Bel Abbes', defaultPrice: 600 },
  { id: '23', nameAr: 'عنابة', nameEn: 'Annaba', defaultPrice: 500 },
  { id: '24', nameAr: 'قالمة', nameEn: 'Guelma', defaultPrice: 600 },
  { id: '25', nameAr: 'قسنطينة', nameEn: 'Constantine', defaultPrice: 500 },
  { id: '26', nameAr: 'المدية', nameEn: 'Medea', defaultPrice: 500 },
  { id: '27', nameAr: 'مستغانم', nameEn: 'Mostaganem', defaultPrice: 600 },
  { id: '28', nameAr: 'المسيلة', nameEn: 'M\'Sila', defaultPrice: 600 },
  { id: '29', nameAr: 'معسكر', nameEn: 'Mascara', defaultPrice: 600 },
  { id: '30', nameAr: 'ورقلة', nameEn: 'Ouargla', defaultPrice: 900 },
  { id: '31', nameAr: 'وهران', nameEn: 'Oran', defaultPrice: 500 },
  { id: '32', nameAr: 'البيض', nameEn: 'El Bayadh', defaultPrice: 800 },
  { id: '33', nameAr: 'إليزي', nameEn: 'Illizi', defaultPrice: 1500 },
  { id: '34', nameAr: 'برج بوعريريج', nameEn: 'Bordj Bou Arreridj', defaultPrice: 500 },
  { id: '35', nameAr: 'بومرداس', nameEn: 'Boumerdes', defaultPrice: 400 },
  { id: '36', nameAr: 'الطارف', nameEn: 'El Tarf', defaultPrice: 600 },
  { id: '37', nameAr: 'تيندوف', nameEn: 'Tindouf', defaultPrice: 1500 },
  { id: '38', nameAr: 'تيسمسيلت', nameEn: 'Tissemsilt', defaultPrice: 600 },
  { id: '39', nameAr: 'الوادي', nameEn: 'El Oued', defaultPrice: 800 },
  { id: '40', nameAr: 'خنشلة', nameEn: 'Khenchela', defaultPrice: 700 },
  { id: '41', nameAr: 'سوق أهراس', nameEn: 'Souk Ahras', defaultPrice: 700 },
  { id: '42', nameAr: 'تيبازة', nameEn: 'Tipaza', defaultPrice: 400 },
  { id: '43', nameAr: 'ميلة', nameEn: 'Mila', defaultPrice: 500 },
  { id: '44', nameAr: 'عين الدفلى', nameEn: 'Ain Defla', defaultPrice: 500 },
  { id: '45', nameAr: 'النعامة', nameEn: 'Naama', defaultPrice: 900 },
  { id: '46', nameAr: 'عين تموشنت', nameEn: 'Ain Temouchent', defaultPrice: 600 },
  { id: '47', nameAr: 'غرداية', nameEn: 'Ghardaia', defaultPrice: 900 },
  { id: '48', nameAr: 'غليزان', nameEn: 'Relizane', defaultPrice: 600 },
  { id: '49', nameAr: 'تيميمون', nameEn: 'Timimoun', defaultPrice: 1200 },
  { id: '50', nameAr: 'برج باجي مختار', nameEn: 'Bordj Badji Mokhtar', defaultPrice: 1500 },
  { id: '51', nameAr: 'أولاد جلال', nameEn: 'Ouled Djellal', defaultPrice: 800 },
  { id: '52', nameAr: 'بني عباس', nameEn: 'Beni Abbes', defaultPrice: 1200 },
  { id: '53', nameAr: 'عين صالح', nameEn: 'In Salah', defaultPrice: 1500 },
  { id: '54', nameAr: 'عين قزام', nameEn: 'In Guezzam', defaultPrice: 1500 },
  { id: '55', nameAr: 'تقرت', nameEn: 'Touggourt', defaultPrice: 900 },
  { id: '56', nameAr: 'جانت', nameEn: 'Djanet', defaultPrice: 1500 },
  { id: '57', nameAr: 'المغير', nameEn: 'El M\'Ghair', defaultPrice: 800 },
  { id: '58', nameAr: 'المنيعة', nameEn: 'El Meniaa', defaultPrice: 900 }
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, toggleMobileMenu, setSidebarOpen, isSidebarOpen, allowGuestCheckout, setAllowGuestCheckout } = useAppStore();
  const [enableDeliverTo, setEnableDeliverTo] = useState(true);
  const { user, isAuthenticated, logout, isBuyerMode } = useAuthStore();
  const {
    itemCount,
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotal,
    clearCart,
    isCartOpen,
    setCartOpen
  } = useCartStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  // Two-step cart: 'cart' = view items, 'checkout' = shipping form
  const [cartStep, setCartStep] = useState<'cart' | 'checkout'>('cart');
  
  const [dynamicWilayas, setDynamicWilayas] = useState<any[]>(ALGERIAN_WILAYAS);
  const [countryCurrency, setCountryCurrency] = useState<string>('DZD');
  const [sellerSettings, setSellerSettings] = useState<any>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  // Hierarchical address states (Wilaya → Baladiyah → Neighborhood)
  const [selectedState, setSelectedState] = useState(''); // wilaya code e.g. '16'
  const [selectedCity, setSelectedCity] = useState(''); // city id from DB
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [customCities, setCustomCities] = useState<any[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Dynamic Header CMS Blocks
  const [headerBlocks, setHeaderBlocks] = useState<any[]>([]);

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const searchRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keep city in sync with selectedState for backward compat with shipping calc
  const city = selectedState;

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings?.header_blocks) {
          setHeaderBlocks(JSON.parse(data.settings.header_blocks));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length > 0 && cartStep === 'checkout') {
      const p = items[0].product;
      const pStoreId = p.store?.id || (p as any).storeId;
      const pSellerId = p.seller?.id || (p as any).sellerId;
      const targetParam = pStoreId ? `storeId=${pStoreId}` : pSellerId ? `sellerId=${pSellerId}` : '';
      if (targetParam) {
        fetch(`/api/regions/states?countryCode=DZ&${targetParam}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              if (data.states && data.states.length > 0) {
                setDynamicWilayas(data.states);
              }
              if (data.country?.currency) {
                setCountryCurrency(data.country.currency);
              }
              if (data.shipping) {
                setSellerSettings({
                  shippingRates: data.shipping
                });
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [items, cartStep]);

  // Load cities when wilaya changes
  useEffect(() => {
    if (!selectedState) { setCustomCities([]); setSelectedCity(''); return; }
    setIsLoadingCities(true);
    const p = items[0]?.product;
    const pStoreId = p?.store?.id || (p as any)?.storeId;
    const pSellerId = p?.seller?.id || (p as any)?.sellerId;
    const storeParam = pStoreId ? `&storeId=${pStoreId}` : '';
    const sellerParam = pSellerId ? `&sellerId=${pSellerId}` : '';
    fetch(`/api/regions/cities?stateCode=${selectedState}${storeParam}${sellerParam}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.cities)) {
          setCustomCities(d.cities.filter((c: any) => !c.isHidden));
          if (d.cities.length > 0) setSelectedCity(d.cities[0].id);
          else setSelectedCity('');
        } else {
          setCustomCities([]);
          setSelectedCity('');
        }
      })
      .catch(() => { setCustomCities([]); })
      .finally(() => setIsLoadingCities(false));
  }, [selectedState]);

  const getShippingCost = () => {
    if (!city) return 0;
    const subtotal = getSubtotal();
    
    // Check if store/seller has shipping enabled
    const rates = sellerSettings?.shippingRates;
    if (!rates || rates.enabled === false) {
      return 0;
    }

    if (rates.freeThreshold && subtotal >= rates.freeThreshold) {
      return 0;
    }

    const matchedState = dynamicWilayas.find(w => w.id === city);
    if (matchedState) {
      return matchedState.price !== undefined ? matchedState.price : matchedState.defaultPrice;
    }

    return rates.standardPrice !== undefined ? rates.standardPrice : 25;
  };

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    
    // Only calculate subtotal for applicable items if `applicableProductIds` is provided
    let applicableSubtotal = getSubtotal();
    if (appliedCoupon.applicableProductIds && Array.isArray(appliedCoupon.applicableProductIds)) {
      applicableSubtotal = items
        .filter(i => appliedCoupon.applicableProductIds.includes(i.product.id))
        .reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    }

    if (appliedCoupon.type === 'percentage') {
      return (applicableSubtotal * appliedCoupon.value) / 100;
    } else {
      return Math.min(appliedCoupon.value, applicableSubtotal);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || items.length === 0) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const p = items[0].product;
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal: getSubtotal(),
          items: items.map(i => ({ productId: i.product.id })),
          storeId: p.store?.id || (p as any).storeId,
          sellerId: p.seller?.id || (p as any).sellerId
        })
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponCode('');
        toast.success(t('🎉 تم تطبيق كود الخصم بنجاح!', '🎉 Coupon applied successfully!'));
      } else {
        setCouponError(isRTL ? data.errorAr : data.errorEn);
      }
    } catch {
      setCouponError(t('فشل التحقق من الكوبون', 'Failed to validate coupon'));
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  // Guest checkout flag from admin settings

  // Pre-fill form with user data on login
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Fetch guest checkout flag from admin
  useEffect(() => {
    fetch('/api/admin/flags')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.flags) {
          setAllowGuestCheckout(data.flags.flag_allow_guest_checkout ?? true);
          setEnableDeliverTo(data.flags.flag_enable_deliver_to ?? true);
        }
      })
      .catch(() => {});
  }, []);

  // Close cart safely without causing React state boundary crashes
  const closeCart = () => {
    setCartOpen(false);
    setCartStep('cart');
    setCheckoutSuccess(null);
  };

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // If guest checkout is not allowed, require login
    if (!isAuthenticated && !allowGuestCheckout) {
      toast.error(t('الرجاء تسجيل الدخول أولاً للطلب', 'Please sign in first to place an order'));
      return;
    }

    if (!fullName || !phone || !address || !selectedState) {
      toast.error(t('الرجاء ملء جميع الحقول المطلوبة', 'Please fill all required fields'));
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
      const matchedWilaya = dynamicWilayas.find(w => w.id === selectedState);
      const wilayaName = matchedWilaya ? (isRTL ? matchedWilaya.nameAr : matchedWilaya.nameEn) : selectedState;
      const matchedCity = customCities.find(c => c.id === selectedCity);
      const cityName = matchedCity ? (isRTL ? matchedCity.nameAr : matchedCity.nameEn) : '';

      const discount = getDiscountAmount();

      const payload: Record<string, unknown> = {
        paymentMethod: 'cod',
        subtotal: getSubtotal(),
        shippingCost,
        tax: 0,
        discount,
        total: getSubtotal() - discount + shippingCost,
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
        shippingMethod: 'standard',
        couponId: appliedCoupon ? appliedCoupon.id : null,
        items: orderItems,
      };

      // Include buyerId if authenticated
      if (isAuthenticated && user?.id) {
        payload.buyerId = user.id;
      }
      // If guest, no buyerId — the API will auto-create or link the guest

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setCheckoutSuccess(data.orderNumber);
      clearCart();
      toast.success(t('تم تسجيل طلبك بنجاح!', 'Order placed successfully!'));
    } catch (err) {
      toast.error(t('فشل إرسال الطلب. الرجاء المحاولة مرة أخرى', 'Failed to place order. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to dashboard — works from any page (product page, seller page, etc.)
  const navigateToDashboard = (view: string) => {
    setCheckoutSuccess(null);
    setCartOpen(false);
    const isOnSubRoute = pathname !== '/';
    if (isOnSubRoute) {
      router.push(`/?view=${view}`);
    } else {
      useAppStore.getState().setCurrentPage(view as PageType);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { t: globalT } = useTranslation();
  const isRTL = localeDirections[locale] === 'rtl';
  const t = (ar: string, en: string, fr?: string, values?: Record<string, string | number>) => {
    const arKeyMap: Record<string, string> = {
      'أنت الآن تتصفح المنصة كمشتري.': 'header.browseAsBuyerNote',
      'العودة للوحة التحكم': 'header.returnToDashboard',
      'شاري داي': 'header.brandName',
      'ابحث عن منتجات، ماركات، وأكثر...': 'header.searchPlaceholder',
      'مدير النظام': 'header.roleAdmin',
      'مدير متجر': 'header.roleStoreManager',
      'تاجر مستقل': 'header.roleSeller',
      'مندوب شحن': 'header.roleLogistics',
      'مشتري': 'header.roleBuyer',
      'لوحة التحكم': 'header.dashboard',
      'العودة لحساب التاجر': 'header.returnToSellerAccount',
      'تصفح كـ مشتري': 'header.browseAsBuyer',
      'حالة التوثيق': 'header.verificationStatus',
      'الإعدادات': 'header.settings',
      'تسجيل الخروج': 'header.logout',
      'تسجيل الدخول': 'header.signIn',
      'ابحث عن منتجات...': 'header.searchProductsMobile',
      'تم الطلب!': 'header.orderPlaced',
      'تأكيد الطلب': 'header.confirmOrder',
      'سلة التسوق': 'header.shoppingCart',
      'شكراً لطلبك!': 'header.thankYouOrder',
      'تم تسجيل طلبك بنجاح وسوف يقوم التاجر بالتواصل معك لتأكيد الشحن.': 'header.orderSuccessNote',
      'رقم الطلب المرجعي': 'header.orderRefNumber',
      'تتبع طلبك في لوحة التحكم': 'header.trackOrderDashboard',
      'الاستمرار في التسوق': 'header.continueShopping',
      'سلتك فارغة': 'header.emptyCart',
      'تصفح المتجر وأضف بعض المنتجات الرائعة للبدء في التسوق!': 'header.emptyCartNote',
      'تسوق الآن': 'header.shopNow',
      'المنتجات المضافة': 'header.addedProducts',
      'سعر الوحدة: ': 'header.unitPrice',
      'الشحن القياسي - الدفع عند الاستلام (COD)': 'header.codShipping',
      'طلب ضيف — يمكنك تتبع الطلب بعد التسجيل': 'header.guestOrderNote',
      'الرجاء تسجيل الدخول لإتمام عملية الشراء': 'header.loginToCheckoutNote',
      '🎉 تم تطبيق كود الخصم بنجاح!': 'header.couponSuccess',
      'فشل التحقق من الكوبون': 'header.couponError',
      'الرجاء تسجيل الدخول أولاً للطلب': 'header.loginRequired',
      'الرجاء ملء جميع الحقول المطلوبة': 'header.fieldsRequired',
      'تم تسجيل طلبك بنجاح!': 'header.orderSuccessToast',
      'فشل إرسال الطلب. الرجاء المحاولة مرة أخرى': 'header.orderFailedToast',
    };

    const key = arKeyMap[ar.trim()];
    if (key) {
      return globalT(key, values);
    }

    let result = locale === 'ar' ? ar : locale === 'fr' ? (fr || en) : en;
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        result = result.replace(new RegExp(`%${k}%`, 'g'), String(v));
      });
    }
    return result;
  };
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <>
    <header
      className={`sticky top-0 z-[var(--z-sticky)] w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-background border-b border-transparent'
      }`}
    >
      {/* Dynamic Header Blocks (Announcement bars) */}
      {headerBlocks.map((block, idx) => {
        if (!block.isActive) return null;
        return (
          <div key={block.id || idx} className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs font-bold w-full relative">
            <div className="container-platform flex items-center justify-center gap-2">
              {block.link ? (
                <a href={block.link} className="hover:underline flex items-center gap-1">
                  <span>{isRTL ? block.contentAr : block.contentEn}</span>
                  <ArrowLeft className={`h-3 w-3 ${isRTL ? '' : 'rotate-180'}`} />
                </a>
              ) : (
                <span>{isRTL ? block.contentAr : block.contentEn}</span>
              )}
            </div>
          </div>
        );
      })}
      {isBuyerMode && (
        <div className="bg-gradient-to-r from-brand to-amber-300 text-navy py-1.5 px-4 text-center text-xs font-bold flex flex-wrap items-center justify-center gap-2 w-full border-b border-navy/10 shadow-sm relative">
          <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
          <span>
            {t('أنت الآن تتصفح المنصة كمشتري.', 'You are currently browsing the platform as a buyer.')}
          </span>
          <button 
            onClick={() => {
              const { setBuyerMode } = useAuthStore.getState();
              setBuyerMode(false);
              navigateToDashboard(rolePages[user?.role || 'buyer'] || 'seller');
            }}
            className="ms-2 underline decoration-navy/50 hover:decoration-navy transition-colors bg-white/40 px-2 py-0.5 rounded-full whitespace-nowrap"
          >
            {t('العودة للوحة التحكم', 'Return to Dashboard')}
          </button>
        </div>
      )}
      {/* Main Header — Single clean row: Logo | Search | Actions */}
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[var(--header-height)] gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <button
              onClick={() => {
                useAppStore.getState().setCurrentPage('home');
                router.push('/');
              }}
              className="flex items-center gap-2"
            >
              <div className="gradient-brand rounded-lg px-2.5 py-1 font-bold text-navy text-lg">
                {t('شاري داي', 'CharyDay')}
              </div>
            </button>
            {enableDeliverTo && (
              <div className="hidden sm:block ms-2 border-l border-border/50 pl-4 ml-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4 rtl:mr-4">
                <DeliverTo />
              </div>
            )}
          </div>

          {/* Search Bar — Desktop only */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-2xl mx-4 relative z-50">
            <div className="relative w-full">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={t('ابحث عن منتجات، ماركات، وأكثر...', 'Search for products, brands, and more...')}
                className="ps-10 pe-4 h-10 rounded-full border-border bg-surface focus:ring-2 focus:ring-brand w-full focus:bg-background transition-all duration-300 shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setSearchFocused(false);
                    useAppStore.getState().setCurrentPage('search' as PageType);
                    router.push(`/?view=search&q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                  }
                }}
              />
              
              {/* Smart Search Suggestions Dropdown */}
              {searchFocused && (
                <div className="absolute top-full start-0 end-0 mt-2 p-4 rounded-2xl glass-premium z-50 text-start animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchVal.trim() === '' ? (
                    <div>
                      <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2.5 px-1">
                        {t('الأكثر بحثاً الآن', 'Trending Searches')}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_SEARCHES.map((query, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchVal(query);
                              setSearchFocused(false);
                              useAppStore.getState().setCurrentPage('search' as PageType);
                              router.push(`/?view=search&q=${encodeURIComponent(query)}`);
                            }}
                            className="text-xs py-1.5 px-3 rounded-xl bg-muted/40 hover:bg-brand/10 hover:text-brand-foreground border border-border/40 transition-colors"
                          >
                            {query}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2.5 px-1">
                        {t('بحث مقترح عن', 'Suggested Search for')} "{searchVal}"
                      </h4>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setSearchFocused(false);
                            useAppStore.getState().setCurrentPage('search' as PageType);
                            router.push(`/?view=search&q=${encodeURIComponent(searchVal)}`);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/40 text-xs font-bold transition-colors text-start"
                        >
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{t('ابحث عن', 'Search for')} "{searchVal}"</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions — Right side: search(mobile) | theme | lang | cart | user */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* Language Toggle */}
            <LanguageSwitcher />

            {/* Notifications */}
            {isAuthenticated && <NotificationPanel />}

            {/* Cart — visible to everyone */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -end-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-brand text-navy border-2 border-background">
                  {itemCount}
                </Badge>
              )}
            </Button>

            {/* User Menu (authenticated) or Sign In button */}
            {isAuthenticated && user ? (
              <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand text-navy text-sm font-bold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block text-sm font-medium max-w-[120px] truncate text-start">
                      {user.name}
                    </span>
                    <ChevronDown className="h-4 w-4 hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[var(--z-modal)]">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1 text-start">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge variant="secondary" className="w-fit text-xs mt-1">
                        {t(
                          ({ admin: 'مدير النظام', store_manager: 'مدير متجر', seller: 'تاجر مستقل', logistics: 'مندوب شحن', buyer: 'مشتري' } as Record<string, string>)[user.role] || user.role,
                          ({ admin: 'Admin', store_manager: 'Store Manager', seller: 'Seller', logistics: 'Courier', buyer: 'Buyer' } as Record<string, string>)[user.role] || user.role
                        )}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateToDashboard(isBuyerMode ? 'buyer' : (rolePages[user.role] || 'buyer'))}>
                    <User className="h-4 w-4" />
                    {t('لوحة التحكم', 'Dashboard')}
                  </DropdownMenuItem>
                  {user.role !== 'admin' && user.role !== 'buyer' && (
                    <DropdownMenuItem 
                      onClick={() => {
                        const { setBuyerMode, isBuyerMode } = useAuthStore.getState();
                        const newMode = !isBuyerMode;
                        setBuyerMode(newMode);
                        if (newMode) {
                          // Switching to Buyer: Go to Home to shop
                          navigateToDashboard('home');
                        } else {
                          // Switching back: Go to Seller Dashboard
                          navigateToDashboard(rolePages[user.role] || 'seller');
                        }
                      }}
                      className={useAuthStore.getState().isBuyerMode ? "bg-brand/10 text-brand" : ""}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {useAuthStore.getState().isBuyerMode 
                        ? t('العودة لحساب التاجر', 'Return to Dashboard') 
                        : t('تصفح كـ مشتري', 'Browse as Buyer')}
                    </DropdownMenuItem>
                  )}
                  {user.role !== 'admin' && user.role !== 'buyer' && (
                    <DropdownMenuItem onClick={() => navigateToDashboard('verification')}>
                      <ClipboardCheck className="h-4 w-4" />
                      {t('حالة التوثيق', 'Verification Status')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4" />
                    {t('الإعدادات', 'Settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    {t('تسجيل الخروج', 'Logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="gradient-brand text-navy font-bold ms-2"
                onClick={() => useAppStore.getState().setCurrentPage('login')}
              >
                <User className="h-4 w-4 me-1.5" />
                {t('تسجيل الدخول', 'Sign In')}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search (only when toggled) */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3 animate-fade-in relative z-50">
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={t('ابحث عن منتجات...', 'Search for products...')}
                className="ps-10 pe-4 h-10 rounded-full border-border bg-surface w-full focus:bg-background transition-all duration-300 shadow-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setMobileSearchOpen(false);
                    useAppStore.getState().setCurrentPage('search' as PageType);
                    router.push(`/?view=search&q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                  }
                }}
              />
              
              {/* Mobile Search Suggestions Dropdown */}
              <div className="absolute top-full start-0 end-0 mt-1.5 p-3 rounded-2xl glass-premium z-50 text-start shadow-lg border border-border/40">
                {searchVal.trim() === '' ? (
                  <div>
                    <h4 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 px-1">
                      {t('الأكثر بحثاً الآن', 'Trending Searches')}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {TRENDING_SEARCHES.slice(0, 6).map((query, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchVal(query);
                            setMobileSearchOpen(false);
                            useAppStore.getState().setCurrentPage('search' as PageType);
                            router.push(`/?view=search&q=${encodeURIComponent(query)}`);
                          }}
                          className="text-[11px] py-1 px-2.5 rounded-xl bg-muted/40 hover:bg-brand/10 hover:text-brand-foreground border border-border/40 transition-colors"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 px-1">
                      {t('بحث مقترح عن', 'Suggested Search for')} "{searchVal}"
                    </h4>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setMobileSearchOpen(false);
                          useAppStore.getState().setCurrentPage('search' as PageType);
                          router.push(`/?view=search&q=${encodeURIComponent(searchVal)}`);
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted/40 text-[11px] font-bold transition-colors text-start"
                      >
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{t('ابحث عن', 'Search for')} "{searchVal}"</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Shopping Cart Drawer — Overlay */}
    {isCartOpen && (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={closeCart}
      />
    )}
    
    {/* Shopping Cart Drawer — Panel */}
    <div 
      className={`fixed top-0 bottom-0 ${isRTL ? 'left-0 border-r' : 'right-0 border-l'} w-full max-w-md bg-background/95 backdrop-blur-md z-[101] shadow-2xl border-primary/20 flex flex-col transition-transform duration-300 ease-in-out ${
        isCartOpen ? 'translate-x-0' : (isRTL ? '-translate-x-full' : 'translate-x-full')
      }`}
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-black text-lg">
          {cartStep === 'checkout' && !checkoutSuccess && (
            <button
              onClick={() => setCartStep('cart')}
              className="p-1 rounded-lg hover:bg-muted transition-colors me-1"
            >
              <BackIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          <ShoppingCart className="h-5 w-5 text-primary" />
          <span>
            {checkoutSuccess
              ? t('تم الطلب!', 'Order Placed!')
              : cartStep === 'checkout'
              ? t('تأكيد الطلب', 'Confirm Order')
              : t('سلة التسوق', 'Shopping Cart')}
          </span>
          {cartStep === 'cart' && !checkoutSuccess && (
            <Badge variant="secondary" className="ms-2">{itemCount}</Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={closeCart}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {checkoutSuccess ? (
          /* ── SUCCESS SCREEN ── */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
            <div className="size-20 rounded-full bg-green-500/10 border-4 border-green-500/30 flex items-center justify-center text-green-500 text-4xl">
              ✓
            </div>
            <h3 className="text-2xl font-black text-foreground font-cairo">
              {t('شكراً لطلبك!', 'Thank you for your order!')}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t(
                'تم تسجيل طلبك بنجاح وسوف يقوم التاجر بالتواصل معك لتأكيد الشحن.',
                'Your order has been placed successfully. The seller will contact you to confirm shipping.'
              )}
            </p>
            <div className="p-4 bg-muted/50 border border-border rounded-2xl w-full text-center">
              <span className="text-xs text-muted-foreground block">{t('رقم الطلب المرجعي', 'Order Reference Number')}</span>
              <span className="text-xl font-mono font-bold text-primary block mt-1">#{checkoutSuccess}</span>
            </div>
            <div className="w-full pt-4 space-y-2">
              {isAuthenticated && (
                <Button
                  variant="default"
                  className="w-full gradient-brand text-navy font-bold h-11 rounded-xl shadow-md shadow-brand/20 hover:scale-[1.02] transition-all"
                  onClick={() => navigateToDashboard('buyer')}
                >
                  {t('تتبع طلبك في لوحة التحكم', 'Track Order in Dashboard')}
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full"
                onClick={closeCart}
              >
                {t('الاستمرار في التسوق', 'Continue Shopping')}
              </Button>
            </div>
          </div>

        ) : items.length === 0 ? (
          /* ── EMPTY CART ── */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-muted-foreground">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{t('سلتك فارغة', 'Your cart is empty')}</p>
              <p className="text-xs max-w-[240px] mx-auto mt-1">
                {t('تصفح المتجر وأضف بعض المنتجات الرائعة للبدء في التسوق!', 'Browse the store and add some great products to start shopping!')}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2 gap-2"
              onClick={() => {
                closeCart();
                useAppStore.getState().setCurrentPage('home');
                router.push('/');
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              {t('تسوق الآن', 'Shop Now')}
            </Button>
          </div>

        ) : cartStep === 'cart' ? (
          /* ── STEP 1: CART ITEMS ── */
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-1">
              {t('المنتجات المضافة', 'Added Products')} ({itemCount})
            </p>
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-3 p-3 bg-muted/30 border border-border rounded-xl">
                <img 
                  src={item.product.images[0] || '/images/placeholder.jpg'} 
                  alt={item.product.name} 
                  className="size-16 object-cover rounded-lg border border-border shrink-0" 
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold truncate text-foreground leading-tight">
                      {item.product.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      {t('سعر الوحدة: ', 'Unit: ')}{item.product.price} {countryCurrency}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
                      <button 
                        className="p-1 hover:bg-muted transition-colors"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2.5 font-bold text-xs min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        className="p-1 hover:bg-muted transition-colors"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary">
                        {(item.product.price * item.quantity).toLocaleString()} {countryCurrency}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : (
          /* ── STEP 2: CHECKOUT FORM ── */
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-brand/5 border border-brand/20 rounded-xl">
              <Truck className="h-4 w-4 text-brand shrink-0" />
              <span className="text-xs font-semibold text-brand">
                {t('الشحن القياسي - الدفع عند الاستلام (COD)', 'Standard Shipping - Cash on Delivery (COD)')}
              </span>
            </div>

            {/* Guest notice if not authenticated but allowed */}
            {!isAuthenticated && allowGuestCheckout && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-500 font-semibold">
                  {t('طلب ضيف — يمكنك تتبع الطلب بعد التسجيل', 'Guest Order — Sign up to track your order')}
                </p>
              </div>
            )}

            {/* If guest checkout NOT allowed → show login prompt */}
            {!isAuthenticated && !allowGuestCheckout ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
                <p className="text-sm font-semibold text-amber-500 font-cairo">
                  {t('الرجاء تسجيل الدخول لإتمام عملية الشراء', 'Please sign in to complete your purchase')}
                </p>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gradient-brand text-navy font-bold w-full"
                  onClick={() => navigateToDashboard('login')}
                >
                  {t('تسجيل الدخول الآن', 'Sign In Now')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-3 text-start">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">{t('الاسم الكامل *', 'Full Name *')}</label>
                  <Input 
                    placeholder={t('أحمد محمد', 'Ahmed Mohamed')} 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-10 rounded-xl"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">{t('رقم الهاتف *', 'Phone Number *')}</label>
                  <Input 
                    placeholder="05XXXXXXXX" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-10 rounded-xl"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">{t('العنوان التفصيلي (الشارع والمنزل) *', 'Detailed Address (Street & House) *')}</label>
                  <Input 
                    placeholder={t('حي 20 مسكن، الطابق الثاني شقة 4', '20 Dwellings, 2nd floor apt 4')} 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* 1. Country Selection (Read-only DZ) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">{t('البلد', 'Country')}</label>
                  <div className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    <span className="font-bold flex items-center gap-1.5">
                      🇩🇿 {t('الجزائر', 'Algeria')}
                    </span>
                    <span className="text-xs font-mono">{t('رمز الهاتف: +213', 'Phone Prefix: +213')}</span>
                  </div>
                </div>

                {/* 2. State (Wilaya) Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">{t('الولاية *', 'State / Wilaya *')}</label>
                  <select 
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">{t('-- اختر الولاية --', '-- Select Wilaya --')}</option>
                    {dynamicWilayas.filter((w) => !w.isHidden).map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.id} - {isRTL ? w.nameAr : w.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Municipality (Baladiyah) Selection */}
                {selectedState && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-xs font-semibold text-muted-foreground">{t('البلدية / الدائرة *', 'Municipality / Baladiyah *')}</label>
                    {isLoadingCities ? (
                      <div className="flex h-10 items-center justify-center bg-muted/20 border border-input rounded-xl">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      <select 
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        required
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">{t('-- اختر البلدية --', '-- Select Municipality --')}</option>
                        {customCities.map((c) => (
                          <option key={c.id} value={c.id}>
                            🏙️ {isRTL ? c.nameAr : c.nameEn} {c.isStoreCustom ? `(${t('حي مخصص 📍', 'Store Zone 📍')})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* 4. Neighborhood / Custom Zone Selection (Optional) */}
                {selectedState && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-xs font-semibold text-muted-foreground">{t('الحي / الدوار (اختياري)', 'Neighborhood / Custom Zone (Optional)')}</label>
                    <Input 
                      placeholder={t('مثال: حي الكثبان، تجمع أولاد يعيش', 'e.g. Dunes neighborhood, Ouled Yaich')}
                      value={selectedNeighborhood}
                      onChange={(e) => setSelectedNeighborhood(e.target.value)}
                      className="h-10 rounded-xl bg-background"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">{t('ملاحظات إضافية (اختياري)', 'Additional Notes (Optional)')}</label>
                  <textarea 
                    placeholder={t('اتصل بي قبل التوصيل...', 'Call me before delivery...')} 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px]"
                  />
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      {!checkoutSuccess && items.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/10 space-y-3 shrink-0">
          
          {/* Coupon Input Section */}
          {cartStep === 'cart' && (
            <div className="border-t border-border/10 pt-3 pb-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  {t('هل لديك كوبون خصم؟', 'Have a discount coupon?')}
                </span>
                {appliedCoupon && (
                  <button 
                    onClick={() => setAppliedCoupon(null)}
                    className="text-[10px] text-destructive hover:underline font-bold"
                  >
                    {t('حذف الكوبون', 'Remove')}
                  </button>
                )}
              </div>
              
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. EID2026"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    className="h-9 rounded-xl font-mono uppercase tracking-widest text-center text-xs bg-background"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    size="sm"
                    className="rounded-xl px-4 font-bold h-9 bg-primary text-primary-foreground text-xs"
                  >
                    {isApplyingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : t('تطبيق', 'Apply')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-500 font-bold">
                  <span>
                    {t('🎉 الكوبون فعال: ', '🎉 Coupon active: ')}
                    <span className="font-mono">{appliedCoupon.code}</span>
                  </span>
                  <span>
                    -{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `${appliedCoupon.value} ${countryCurrency}`}
                  </span>
                </div>
              )}
              {couponError && (
                <p className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {couponError}
                </p>
              )}
            </div>
          )}

          {/* Price summary — always visible */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{t('المجموع الفرعي', 'Subtotal')}</span>
              <span>{getSubtotal().toLocaleString()} {countryCurrency}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-500 text-xs font-bold">
                <span>{t('قيمة الخصم', 'Discount Value')}</span>
                <span>-{getDiscountAmount().toLocaleString()} {countryCurrency}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{t('تكلفة الشحن', 'Shipping Cost')}</span>
              <span>{getShippingCost() === 0 ? t('مجاني 🎉', 'Free 🎉') : `${getShippingCost().toLocaleString()} ${countryCurrency}`}</span>
            </div>
            <div className="flex justify-between text-foreground font-black border-t border-border/60 pt-1.5">
              <span>{t('المجموع الإجمالي', 'Total')}</span>
              <span className="text-primary">{(getSubtotal() - getDiscountAmount() + getShippingCost()).toLocaleString()} {countryCurrency}</span>
            </div>
          </div>

          {/* CTA button — changes based on step */}
          {cartStep === 'cart' ? (
            <div className="flex flex-col gap-2">
              <Button
                className="w-full gradient-brand text-navy font-bold h-11 rounded-xl shadow-lg shadow-brand/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                onClick={() => {
                  setCartOpen(false);
                  router.push('/checkout');
                }}
              >
                <CheckSquare className="h-4 w-4 shrink-0" />
                <span>{t('الذهاب للدفع', 'Proceed to Checkout')}</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl text-muted-foreground hover:bg-secondary/50 border-border/40 font-semibold"
                onClick={closeCart}
              >
                {t('استكمال التسوق', 'Continue Shopping')}
              </Button>
            </div>
          ) : (
            // Only show confirm button if guest checkout is allowed OR user is authenticated
            (isAuthenticated || allowGuestCheckout) && (
              <Button
                disabled={isSubmitting}
                className="w-full gradient-brand text-navy font-bold h-11 rounded-xl shadow-lg shadow-brand/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                onClick={handleCheckout}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('جاري إرسال الطلب...', 'Submitting Order...')}</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    <span>{t('تأكيد الطلب والدفع عند الاستلام', 'Confirm Order (COD)')}</span>
                  </>
                )}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  </>
);
}
