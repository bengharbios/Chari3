'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import {
  Search, ShoppingCart, Moon, Sun, Globe,
  Menu, X, ChevronDown, User, LogOut, Settings,
  ClipboardCheck, Trash2, Plus, Minus, Loader2, CheckSquare,
  ArrowLeft, ArrowRight, ShoppingBag, Truck
} from 'lucide-react';
import { toast } from 'sonner';
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


const rolePages: Record<string, PageType> = {
  admin: 'admin',
  store_manager: 'store',
  seller: 'seller',
  supplier: 'seller',
  logistics: 'logistics',
  buyer: 'buyer',
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale, theme, setTheme, toggleMobileMenu, setSidebarOpen, isSidebarOpen, allowGuestCheckout, setAllowGuestCheckout } = useAppStore();
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
  // Guest checkout flag from admin settings
  

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');

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

    if (!fullName || !phone || !address || !city) {
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

      const shippingCost = getSubtotal() > 200 ? 0 : 25;

      const payload: Record<string, unknown> = {
        paymentMethod: 'cod',
        subtotal: getSubtotal(),
        shippingCost,
        tax: 0,
        discount: 0,
        total: getTotal(),
        address: {
          fullName,
          phone,
          street: address,
          city,
          country: 'DZ',
        },
        shippingMethod: 'standard',
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

  const isRTL = locale === 'ar';
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
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
      {/* Main Header — Single clean row: Logo | Search | Actions */}
      <div className="container-platform">
        <div className="flex items-center justify-between h-[var(--header-height)] gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
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
          </div>

          {/* Search Bar — Desktop only */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('ابحث عن منتجات، ماركات، وأكثر...', 'Search for products, brands, and more...')}
                className="ps-10 pe-4 h-10 rounded-full border-border bg-surface focus:ring-2 focus:ring-brand"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    useAppStore.getState().setCurrentPage('search' as PageType);
                    router.push(`/?view=search&q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                  }
                }}
              />
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

            {/* Language Toggle — ONE button only */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            >
              <Globe className="h-5 w-5" />
            </Button>

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
                  <DropdownMenuItem onClick={() => navigateToDashboard(rolePages[user.role] || 'buyer')}>
                    <User className="h-4 w-4" />
                    {t('لوحة التحكم', 'Dashboard')}
                  </DropdownMenuItem>
                  {user.role !== 'admin' && user.role !== 'buyer' && (
                    <DropdownMenuItem 
                      onClick={() => {
                        const { setBuyerMode, isBuyerMode } = useAuthStore.getState();
                        setBuyerMode(!isBuyerMode);
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
          <div className="md:hidden pb-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('ابحث عن منتجات...', 'Search for products...')}
                className="ps-10 pe-4 h-10 rounded-full border-border bg-surface"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setMobileSearchOpen(false);
                    useAppStore.getState().setCurrentPage('search' as PageType);
                    router.push(`/?view=search&q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                  }
                }}
              />
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
                      {t('سعر الوحدة: ', 'Unit: ')}{item.product.price} DZD
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
                        {(item.product.price * item.quantity).toLocaleString()} DZD
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
              /* Checkout form — shown to authenticated users AND guests (if flag enabled) */
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
                  <label className="text-xs font-semibold text-muted-foreground">{t('العنوان الكامل بالتفصيل *', 'Detailed Shipping Address *')}</label>
                  <Input 
                    placeholder={t('حي 20 مسكن، الطابق الثاني شقة 4', '20 Dwellings, 2nd floor apt 4')} 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="h-10 rounded-xl"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">{t('المدينة / الولاية *', 'City / Province *')}</label>
                  <Input 
                    placeholder={t('الجزائر العاصمة', 'Algiers')} 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="h-10 rounded-xl"
                  />
                </div>

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
          {/* Price summary — always visible */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{t('المجموع الفرعي', 'Subtotal')}</span>
              <span>{getSubtotal().toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{t('تكلفة الشحن', 'Shipping Cost')}</span>
              <span>{getSubtotal() > 200 ? t('مجاني 🎉', 'Free 🎉') : '25 DZD'}</span>
            </div>
            <div className="flex justify-between text-foreground font-black border-t border-border/60 pt-1.5">
              <span>{t('المجموع الإجمالي', 'Total')}</span>
              <span className="text-primary">{getTotal().toLocaleString()} DZD</span>
            </div>
          </div>

          {/* CTA button — changes based on step */}
          {cartStep === 'cart' ? (
            <div className="flex flex-col gap-2">
              <Button
                className="w-full gradient-brand text-navy font-bold h-11 rounded-xl shadow-lg shadow-brand/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                onClick={() => setCartStep('checkout')}
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
