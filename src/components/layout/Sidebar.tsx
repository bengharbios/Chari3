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
  Receipt, Sparkles
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

// Helper to filter nav items based on payment model
const getSellerNav = (paymentModel: string): NavItem[] => {
  return SELLER_NAV.filter(item => {
    if (item.id === 'seller-wallet' && paymentModel === 'decentralized') return false; // Hide wallet for decentralized
    if (item.id === 'seller-debts' && paymentModel === 'centralized') return false; // Hide debts for centralized
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

  export default function Sidebar({ className }: SidebarProps) {
    const { locale, currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen, isDesktopSidebarCollapsed, toggleDesktopSidebar } = useAppStore();
    const { user, logout, isBuyerMode } = useAuthStore();
    const isRTL = locale === 'ar';
  
    // Automatically collapse sidebar when window is resized below 1024px (tablet/mobile)
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
        // 1. Fetch Global Settings First
        fetch('/api/settings/public')
          .then(res => res.json())
          .then(pub => {
            let model = 'mixed';
            if (pub.success && pub.settings?.platform_payment_model) {
              model = pub.settings.platform_payment_model;
            }
            
            // 2. Fetch Seller Profile Override
            fetch(`/api/seller/settings?userId=${user.id}`)
              .then(res => res.json())
              .then(data => {
                if (data.success && data.settings?.paymentModel && data.settings.paymentModel !== 'default') {
                  setPaymentModel(data.settings.paymentModel);
                } else {
                  setPaymentModel(model); // fallback to global
                }
              })
              .catch(() => setPaymentModel(model)); // fallback to global
          })
          .catch(() => {});
      }
    }, [user, isBuyerMode]);
  
    if (!user) return null;
  
    const navItems = isBuyerMode ? BUYER_NAV : (user.role === 'seller' ? getSellerNav(paymentModel) : NAV_ITEMS[user.role]);
    const CloseIcon = isRTL ? ChevronRight : ChevronLeft;
  
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
            'bg-[#1c2434] text-[#8A99AF] flex flex-col shadow-lg',
            'transition-all duration-300 ease-in-out',
            'lg:sticky lg:h-screen',
            // On mobile: fixed width, slide in/out
            isSidebarOpen ? 'start-0 w-[280px]' : '-start-[280px] w-[280px]',
            // On desktop: width depends on collapse state
            'lg:start-0',
            isDesktopSidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]',
            className
          )}
        >
          {/* Logo Area matches TailAdmin */}
          <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 h-[var(--header-height)]">
            <div className={cn("flex items-center gap-3 transition-all duration-300", isDesktopSidebarCollapsed ? "justify-center w-full" : "justify-start")}>
              <div className="bg-primary text-white rounded p-1.5 shrink-0">
                <Store className="h-6 w-6" />
              </div>
              <div className={cn("flex-1 min-w-0 transition-opacity duration-300", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                <p className="text-xl font-bold text-white tracking-wide uppercase">
                  {t(locale, 'شاري داي', 'ChariDay')}
                </p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#8A99AF] hover:text-white"
              aria-label={isRTL ? 'إغلاق' : 'Close'}
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
  
          {/* User Info (Simplified for TailAdmin look) */}
          <div className={cn("px-6 mb-6 mt-4 transition-all duration-300", isDesktopSidebarCollapsed ? "hidden" : "block")}>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 border border-[#333a48]">
                <AvatarFallback className="bg-[#333a48] text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-[10px] text-[#8A99AF] truncate mt-0.5">
                  {t(locale,
                    isBuyerMode ? 'مشتري' : { admin: 'مدير النظام', store_manager: 'مدير متجر', seller: 'تاجر مستقل', supplier: 'مورد', logistics: 'مندوب شحن', buyer: 'مشتري' }[user.role] || 'مشتري',
                    isBuyerMode ? 'Buyer' : { admin: 'Admin', store_manager: 'Store Manager', seller: 'Seller', supplier: 'Supplier', logistics: 'Courier', buyer: 'Buyer' }[user.role] || 'Buyer'
                  )}
                </p>
              </div>
            </div>
          </div>
  
          {/* Navigation */}
          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
            <nav className="mt-1 py-4 px-4 lg:mt-2 lg:px-6">
              <ul className="mb-6 flex flex-col gap-1.5">
              {navItems.map((item, index) => {
                if (item.isSection) {
                  return (
                    <h3 key={`section-${item.id}-${index}`} className={cn("mb-4 ml-4 mt-4 text-sm font-semibold text-[#8A99AF] uppercase", isDesktopSidebarCollapsed ? "hidden" : "block")}>
                        {t(locale, item.labelAr, item.labelEn)}
                    </h3>
                  );
                }
  
                const Icon = iconMap[item.icon || 'LayoutDashboard'] || LayoutDashboard;
                const isActive = currentPage === item.id;
  
                return (
                  <li key={item.id + item.labelAr}>
                  <button
                    dir={isRTL ? 'rtl' : 'ltr'}
                    onClick={() => {
                      setCurrentPage(item.id as PageType);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-[#DEE4EE] duration-300 ease-in-out hover:bg-[#333a48]',
                      isDesktopSidebarCollapsed ? 'justify-center px-0 py-3' : '',
                      isActive
                        ? 'bg-[#333a48] text-white'
                        : ''
                    )}
                    title={isDesktopSidebarCollapsed ? t(locale, item.labelAr, item.labelEn) : undefined}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "")} />
                    
                    <span className={cn("flex-1 text-start transition-opacity duration-300", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                      {t(locale, item.labelAr, item.labelEn)}
                    </span>
                    
                    {item.badge && item.badge > 0 && (
                      <Badge className={cn("h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px] bg-primary text-white border-0 shrink-0 rounded", isDesktopSidebarCollapsed ? "absolute top-1 end-1" : "")}>
                        {item.badge}
                      </Badge>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isDesktopSidebarCollapsed && (
                      <div className="absolute start-16 opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 transition-all shadow-lg pointer-events-none">
                        {t(locale, item.labelAr, item.labelEn)}
                      </div>
                    )}
                  </button>
                  </li>
                );
              })}
              </ul>
            </nav>
        </div>
      </aside>
    </>
  );
}
