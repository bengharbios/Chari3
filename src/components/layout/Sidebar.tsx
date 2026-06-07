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
      
      // Check immediately on mount
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && isSidebarOpen) {
        setSidebarOpen(false);
      }

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
            className="fixed inset-0 bg-black/50 z-[var(--z-overlay)] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
  
        <aside
          dir={isRTL ? 'rtl' : 'ltr'}
          className={cn(
          'fixed top-[var(--header-height)] bottom-0 z-[var(--z-overlay)] lg:z-auto',
            'bg-sidebar text-sidebar-foreground flex flex-col',
            'transition-all duration-300 ease-in-out',
            'lg:sticky lg:top-[var(--header-height)] lg:h-[calc(100dvh-var(--header-height))]',
            // On mobile: fixed width, slide in/out
            isSidebarOpen ? 'start-0 w-[var(--sidebar-width)]' : '-start-[280px] w-[var(--sidebar-width)]',
            // On desktop: width depends on collapse state
            'lg:start-0',
            isDesktopSidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[var(--sidebar-width)]',
            className
          )}
        >
          {/* Collapse Toggle (Desktop Only) */}
          <button
            onClick={toggleDesktopSidebar}
            className="hidden lg:flex absolute top-4 -end-3 bg-brand text-navy rounded-full p-1 shadow-md hover:scale-110 transition-transform z-10 border border-border"
          >
            {isDesktopSidebarCollapsed ? (
              isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border relative">
            <div className={cn("flex items-center gap-3 transition-all duration-300", isDesktopSidebarCollapsed ? "justify-center" : "justify-start")}>
              <Avatar className="h-10 w-10 border-2 border-brand shrink-0">
                <AvatarFallback className="bg-brand text-navy font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={cn("flex-1 min-w-0 transition-opacity duration-300", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <Badge variant="secondary" className="text-[10px] mt-0.5 bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border">
                  {t(locale,
                    isBuyerMode ? 'مشتري' : { admin: 'مدير النظام', store_manager: 'مدير متجر', seller: 'تاجر مستقل', supplier: 'مورد', logistics: 'مندوب شحن', buyer: 'مشتري' }[user.role] || 'مشتري',
                    isBuyerMode ? 'Buyer' : { admin: 'Admin', store_manager: 'Store Manager', seller: 'Seller', supplier: 'Supplier', logistics: 'Courier', buyer: 'Buyer' }[user.role] || 'Buyer'
                  )}
                </Badge>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded hover:bg-sidebar-accent/20 shrink-0"
                aria-label={isRTL ? 'إغلاق' : 'Close'}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
  
          {/* Navigation */}
          <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
            <div className={cn("space-y-1.5", isDesktopSidebarCollapsed ? "px-2" : "px-3")}>
              {navItems.map((item, index) => {
                if (item.isSection) {
                  return (
                    <div key={`section-${item.id}-${index}`} className={cn("px-4 py-2 mt-4 first:mt-0 transition-opacity duration-300", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                      <p className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-wider">
                        {t(locale, item.labelAr, item.labelEn)}
                      </p>
                    </div>
                  );
                }
  
                const Icon = iconMap[item.icon || 'LayoutDashboard'] || LayoutDashboard;
                const isActive = currentPage === item.id;
  
                return (
                  <button
                    key={item.id + item.labelAr}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    onClick={() => {
                      setCurrentPage(item.id as PageType);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative',
                      isDesktopSidebarCollapsed ? 'justify-center px-0' : 'px-3',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
                    )}
                    title={isDesktopSidebarCollapsed ? t(locale, item.labelAr, item.labelEn) : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    
                    <span className={cn("flex-1 truncate text-start transition-opacity duration-300", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                      {t(locale, item.labelAr, item.labelEn)}
                    </span>
                    
                    {item.badge && item.badge > 0 && (
                      <Badge className={cn("h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px] bg-brand text-navy border-0 shrink-0", isDesktopSidebarCollapsed ? "absolute -top-1 -end-1 shadow-sm border border-white" : "")}>
                        {item.badge}
                      </Badge>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isDesktopSidebarCollapsed && (
                      <div className="absolute start-14 opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 transition-all shadow-lg pointer-events-none">
                        {t(locale, item.labelAr, item.labelEn)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={logout}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="flex-1 truncate text-start">{t(locale, 'تسجيل الخروج', 'Logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
