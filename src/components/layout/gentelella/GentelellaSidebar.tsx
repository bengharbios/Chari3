'use client';

import { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { NavItem, PageType, UserRole } from '@/types';
import {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, ChevronLeft, ChevronRight, LogOut,
  TrendingUp, CreditCard, Boxes, ChevronUp, ArrowLeftRight, Layers,
  Receipt, Sparkles, ShoppingBag, ClipboardCheck
} from 'lucide-react';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, LogOut, TrendingUp, CreditCard, Boxes,
  ChevronUp, ArrowLeftRight, Layers, Receipt, Sparkles,
};

const STORE_NAV: NavItem[] = [
  { id: 'section-store', labelAr: 'المتجر', labelEn: 'Store', isSection: true },
  { id: 'store', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'store-products', labelAr: 'المنتجات', labelEn: 'Products', icon: 'Boxes', badge: 5 },
  { id: 'store-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 12 },
  { id: 'store-coupons', labelAr: 'الكوبونات والخصومات', labelEn: 'Coupons', icon: 'CreditCard' },
  { id: 'store-staff', labelAr: 'الفريق', labelEn: 'Team', icon: 'Users' },
  { id: 'store-analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: 'BarChart3' },
  { id: 'section-billing', labelAr: 'المالية والاشتراكات', labelEn: 'Billing & Subscriptions', isSection: true },
  { id: 'store-billing', labelAr: 'فاتورتي الحالية', labelEn: 'Current Invoice', icon: 'Receipt' },
  { id: 'store-billing-plans', labelAr: 'اختر باقة', labelEn: 'Choose Plan', icon: 'Package' },
  { id: 'store-billing-addons', labelAr: 'الميزات الإضافية', labelEn: 'Add-ons', icon: 'Sparkles' },
  { id: 'store-billing-pay', labelAr: 'الدفع والتسديد', labelEn: 'Payment', icon: 'CreditCard' },
  { id: 'store-billing-history', labelAr: 'سجل الفواتير', labelEn: 'Invoice History', icon: 'FileText' },
  { id: 'section-settings', labelAr: 'الإعدادات', labelEn: 'Settings', isSection: true },
  { id: 'store-settings', labelAr: 'إعدادات المتجر', labelEn: 'Store Settings', icon: 'Settings' },
];

const SELLER_NAV: NavItem[] = [
  { id: 'section-seller', labelAr: 'التاجر', labelEn: 'Seller', isSection: true },
  { id: 'seller', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'seller-products', labelAr: 'منتجاتي', labelEn: 'My Products', icon: 'Boxes' },
  { id: 'seller-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 4 },
  { id: 'section-billing', labelAr: 'المالية والاشتراكات', labelEn: 'Billing & Subscriptions', isSection: true },
  { id: 'seller-wallet', labelAr: 'محفظتي والأرباح', labelEn: 'Wallet & Payouts', icon: 'Wallet' },
  { id: 'seller-debts', labelAr: 'سداد المديونية', labelEn: 'Pay Debts', icon: 'Receipt' },
  { id: 'seller-billing', labelAr: 'فاتورتي الحالية', labelEn: 'Current Invoice', icon: 'Receipt' },
  { id: 'seller-billing-plans', labelAr: 'اختر باقة', labelEn: 'Choose Plan', icon: 'Package' },
  { id: 'seller-billing-addons', labelAr: 'الميزات الإضافية', labelEn: 'Add-ons', icon: 'Sparkles' },
  { id: 'seller-billing-pay', labelAr: 'الدفع والتسديد', labelEn: 'Payment', icon: 'CreditCard' },
  { id: 'seller-billing-history', labelAr: 'سجل الفواتير', labelEn: 'Invoice History', icon: 'FileText' },
  { id: 'section-settings', labelAr: 'الإعدادات', labelEn: 'Settings', isSection: true },
  { id: 'seller-settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: 'Settings' },
  { id: 'seller-upgrade', labelAr: 'ترقية لمتجر', labelEn: 'Upgrade to Store', icon: 'TrendingUp' },
];

const getSellerNav = (paymentModel: string): NavItem[] => {
  return SELLER_NAV.filter(item => {
    if (item.id === 'seller-wallet' && paymentModel === 'decentralized') return false;
    if (item.id === 'seller-debts' && paymentModel === 'centralized') return false;
    return true;
  });
};

const SUPPLIER_NAV: NavItem[] = [
  { id: 'supplier', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'supplier-products', labelAr: 'المنتجات', labelEn: 'Products', icon: 'Boxes' },
  { id: 'supplier-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 3 },
  { id: 'supplier-inventory', labelAr: 'المخزون', labelEn: 'Inventory', icon: 'Layers' },
];

const LOGISTICS_NAV: NavItem[] = [
  { id: 'logistics', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'logistics-active', labelAr: 'الشحنات النشطة', labelEn: 'Active Shipments', icon: 'Navigation', badge: 7 },
  { id: 'logistics-deliveries', labelAr: 'التوصيلات', labelEn: 'Deliveries', icon: 'MapPin' },
  { id: 'logistics-history', labelAr: 'السجل', labelEn: 'History', icon: 'FileText' },
  { id: 'logistics-earnings', labelAr: 'الأرباح', labelEn: 'Earnings', icon: 'Wallet' },
];

const BUYER_NAV: NavItem[] = [
  { id: 'buyer', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'buyer-orders', labelAr: 'طلباتي', labelEn: 'My Orders', icon: 'Package', badge: 2 },
  { id: 'buyer-wishlist', labelAr: 'المفضلة', labelEn: 'Wishlist', icon: 'Heart' },
  { id: 'buyer-addresses', labelAr: 'العناوين', labelEn: 'Addresses', icon: 'MapPin' },
  { id: 'buyer-wallet', labelAr: 'المحفظة', labelEn: 'Wallet', icon: 'Wallet' },
  { id: 'buyer-reviews', labelAr: 'التقييمات', labelEn: 'Reviews', icon: 'Star' },
];

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: BUYER_NAV,
  store_manager: STORE_NAV,
  seller: SELLER_NAV,
  supplier: SUPPLIER_NAV,
  logistics: LOGISTICS_NAV,
  buyer: BUYER_NAV,
};

interface SidebarProps {
  className?: string;
}

export default function GentelellaSidebar({ className }: SidebarProps) {
  const { locale, currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen, isDesktopSidebarCollapsed } = useAppStore();
  const { user, isBuyerMode } = useAuthStore();
  const isRTL = locale === 'ar';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, setSidebarOpen]);

  const [paymentModel, setPaymentModel] = useState<string>('mixed');

  useEffect(() => {
    if (user?.role === 'seller' && !isBuyerMode) {
      fetch('/api/settings/public')
        .then(res => res.json())
        .then(pub => {
          let model = 'mixed';
          if (pub.success && pub.settings?.platform_payment_model) {
            model = pub.settings.platform_payment_model;
          }
          fetch(`/api/seller/settings?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.settings?.paymentModel && data.settings.paymentModel !== 'default') {
                setPaymentModel(data.settings.paymentModel);
              } else {
                setPaymentModel(model);
              }
            })
            .catch(() => setPaymentModel(model));
        })
        .catch(() => {});
    }
  }, [user, isBuyerMode]);

  if (!user) return null;

  const navItems = isBuyerMode ? BUYER_NAV : (user.role === 'seller' ? getSellerNav(paymentModel) : NAV_ITEMS[user.role]);

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed top-0 bottom-0 z-[9999] lg:z-auto',
          'bg-gentelella-bg text-[#E7E7E7] flex flex-col',
          'transition-all duration-300 ease-in-out',
          'lg:sticky lg:h-screen',
          isSidebarOpen ? 'start-0 w-[230px]' : '-start-[230px] w-[230px]',
          'lg:start-0',
          isDesktopSidebarCollapsed ? 'lg:w-[70px]' : 'lg:w-[230px]',
          className
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 mb-2">
          <div className="text-[#ECF0F1] flex items-center gap-3 w-full">
            <Store className="h-6 w-6 shrink-0" />
            <span className={cn("text-xl font-medium tracking-wide transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
              {t(locale, 'شاري داي', 'ChariDay')}
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div className={cn("px-4 pb-4 mb-4 border-b border-[#3b5976] flex items-center gap-3 transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
          <Avatar className="h-14 w-14 border-2 border-[#1ABB9C] shrink-0 bg-white p-0.5">
            <AvatarFallback className="bg-brand text-navy font-bold text-lg">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[#BAB8B8] text-sm">{t(locale, 'مرحباً،', 'Welcome,')}</span>
            <span className="text-[#ECF0F1] font-semibold text-[15px] truncate max-w-[120px]">{user.name}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-10">
          <ul className="flex flex-col w-full">
            {navItems.map((item, index) => {
              if (item.isSection) {
                return (
                  <li key={`section-${item.id}-${index}`} className={cn("px-4 py-2 mt-2 transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                    <h3 className="text-xs font-bold text-[#E7E7E7] uppercase tracking-wider">
                      {t(locale, item.labelAr, item.labelEn)}
                    </h3>
                  </li>
                );
              }

              const Icon = iconMap[item.icon || 'LayoutDashboard'] || LayoutDashboard;
              const isActive = currentPage === item.id;

              return (
                <li key={item.id + item.labelAr} className="relative">
                  <button
                    dir={isRTL ? 'rtl' : 'ltr'}
                    onClick={() => {
                      setCurrentPage(item.id as PageType);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all group relative',
                      isActive 
                        ? 'bg-gentelella-hover text-white' 
                        : 'text-[#E7E7E7] hover:bg-gentelella-hover hover:text-white',
                      isDesktopSidebarCollapsed && 'justify-center px-0'
                    )}
                    style={{
                      borderInlineStart: isActive && !isDesktopSidebarCollapsed ? '4px solid #1ABB9C' : '4px solid transparent',
                      paddingInlineStart: isActive && !isDesktopSidebarCollapsed ? '12px' : '16px' // adjust padding to keep text aligned
                    }}
                    title={isDesktopSidebarCollapsed ? t(locale, item.labelAr, item.labelEn) : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0 opacity-90" />
                    
                    <span className={cn("flex-1 text-start transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                      {t(locale, item.labelAr, item.labelEn)}
                    </span>
                    
                    {item.badge && item.badge > 0 && !isDesktopSidebarCollapsed && (
                      <Badge className="h-5 flex items-center justify-center px-2 text-[10px] bg-[#1ABB9C] text-white border-0 shrink-0">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
