'use client';
import React from 'react';

import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Home, ShoppingBag, Heart, Wallet, UserCircle,
  Users, ShieldCheck, Settings, Boxes, Package,
  TrendingUp, Layers, Navigation, MapPin, Tag,
  ShoppingCart, Search
} from 'lucide-react';
import type { PageType } from '@/types';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

interface BottomNavItem {
  id: PageType;
  labelAr: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  showBadge?: boolean;
}

// Role-specific bottom navigation item lists
const BUYER_BOTTOM_NAV: BottomNavItem[] = [
  { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home', icon: Home },
  { id: 'buyer-orders', labelAr: 'طلباتي', labelEn: 'Orders', icon: ShoppingBag },
  { id: 'buyer-wishlist', labelAr: 'المفضلة', labelEn: 'Wishlist', icon: Heart },
  { id: 'buyer-wallet', labelAr: 'المحفظة', labelEn: 'Wallet', icon: Wallet },
  { id: 'buyer', labelAr: 'حسابي', labelEn: 'Account', icon: UserCircle },
];

const SELLER_BOTTOM_NAV: BottomNavItem[] = [
  { id: 'home', labelAr: 'المتجر', labelEn: 'Store', icon: Home },
  { id: 'seller-products', labelAr: 'منتجاتي', labelEn: 'Products', icon: Boxes },
  { id: 'seller-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: Package },
  { id: 'seller', labelAr: 'الرئيسية', labelEn: 'Dashboard', icon: UserCircle },
];

const STORE_BOTTOM_NAV: BottomNavItem[] = [
  { id: 'home', labelAr: 'المتجر', labelEn: 'Store', icon: Home },
  { id: 'store-products', labelAr: 'المنتجات', labelEn: 'Products', icon: Boxes },
  { id: 'store-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: Package },
  { id: 'store', labelAr: 'الرئيسية', labelEn: 'Dashboard', icon: UserCircle },
];


const SUPPLIER_BOTTOM_NAV: BottomNavItem[] = [
  { id: 'home', labelAr: 'المتجر', labelEn: 'Store', icon: Home },
  { id: 'supplier-products', labelAr: 'المنتجات', labelEn: 'Products', icon: Boxes },
  { id: 'supplier-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: Package },
  { id: 'supplier', labelAr: 'الرئيسية', labelEn: 'Dashboard', icon: UserCircle },
];

const LOGISTICS_BOTTOM_NAV: BottomNavItem[] = [
  { id: 'home', labelAr: 'المتجر', labelEn: 'Store', icon: Home },
  { id: 'logistics-active', labelAr: 'النشطة', labelEn: 'Active', icon: Navigation },
  { id: 'logistics-deliveries', labelAr: 'التوصيل', labelEn: 'Deliveries', icon: MapPin },
  { id: 'logistics', labelAr: 'الرئيسية', labelEn: 'Dashboard', icon: UserCircle },
];

const GUEST_BOTTOM_NAV: BottomNavItem[] = [
  { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home', icon: Home },
  { id: 'search', labelAr: 'بحث', labelEn: 'Search', icon: Search },
  { id: 'cart', labelAr: 'السلة', labelEn: 'Cart', icon: ShoppingCart, showBadge: true },
  { id: 'login', labelAr: 'دخول', labelEn: 'Login', icon: UserCircle },
];

export default function BottomNav() {
  const { locale, currentPage, setCurrentPage } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  const { itemCount, setCartOpen } = useCartStore();

  // Determine items based on user role
  let navItems = GUEST_BOTTOM_NAV;
  
  if (isAuthenticated && user) {
    if (user.role === 'store_manager') navItems = STORE_BOTTOM_NAV;
    else if (user.role === 'seller' || user.role === 'store' || user.role === 'freelancer') navItems = SELLER_BOTTOM_NAV;
    else if (user.role === 'supplier') navItems = SUPPLIER_BOTTOM_NAV;
    else if (user.role === 'logistics') navItems = LOGISTICS_BOTTOM_NAV;
    else navItems = BUYER_BOTTOM_NAV;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] md:hidden bg-background/95 backdrop-blur-md border-t border-border/80 safe-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.06)]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-around h-[var(--bottom-nav-height)] px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id + item.labelAr}
              onClick={() => {
                if (item.id === 'cart') {
                  setCartOpen(true);
                } else {
                  setCurrentPage(item.id);
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative transition-all duration-200 hover:text-amber-500 active:scale-95',
                isActive ? 'text-amber-500' : 'text-muted-foreground'
              )}
            >
              <div className="relative flex items-center justify-center p-1 rounded-full transition-colors">
                <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive && 'scale-110 stroke-[2.5]')} />
                {item.showBadge && itemCount > 0 && (
                  <span className="absolute -top-0.5 -end-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border border-background shadow-sm animate-pulse">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-tight">{t(locale, item.labelAr, item.labelEn)}</span>
              {isActive && (
                <div className="absolute top-0 inset-x-1/4 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
