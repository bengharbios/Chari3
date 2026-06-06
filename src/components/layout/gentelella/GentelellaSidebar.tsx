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
  Receipt, Sparkles, ChevronDown, Monitor, KeyRound
} from 'lucide-react';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, LogOut, TrendingUp, CreditCard, Boxes,
  ChevronUp, ArrowLeftRight, Layers, Receipt, Sparkles,
};

const STORE_NAV: NavItem[] = [
  { id: 'section-store', labelAr: 'القائمة العامة', labelEn: 'General', isSection: true },
  { id: 'store', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'store-products', labelAr: 'المنتجات', labelEn: 'Products', icon: 'Boxes', badge: 5 },
  { id: 'store-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 12 },
  { id: 'store-coupons', labelAr: 'الكوبونات والخصومات', labelEn: 'Coupons', icon: 'CreditCard' },
  { id: 'store-staff', labelAr: 'الفريق', labelEn: 'Team', icon: 'Users' },
  { id: 'store-analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: 'BarChart3' },
  { id: 'section-billing', labelAr: 'المالية', labelEn: 'Billing', isSection: true },
  { id: 'store-billing', labelAr: 'فاتورتي الحالية', labelEn: 'Current Invoice', icon: 'Receipt' },
  { id: 'store-billing-plans', labelAr: 'اختر باقة', labelEn: 'Choose Plan', icon: 'Package' },
  { id: 'store-billing-addons', labelAr: 'الميزات الإضافية', labelEn: 'Add-ons', icon: 'Sparkles' },
  { id: 'store-billing-pay', labelAr: 'الدفع والتسديد', labelEn: 'Payment', icon: 'CreditCard' },
  { id: 'store-billing-history', labelAr: 'سجل الفواتير', labelEn: 'Invoice History', icon: 'FileText' },
  { id: 'section-settings', labelAr: 'خيارات إضافية', labelEn: 'Extras', isSection: true },
  { id: 'store-settings', labelAr: 'إعدادات المتجر', labelEn: 'Store Settings', icon: 'Settings' },
];

const SELLER_NAV: NavItem[] = [
  { id: 'section-seller', labelAr: 'القائمة العامة', labelEn: 'General', isSection: true },
  { id: 'seller', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'seller-products', labelAr: 'منتجاتي', labelEn: 'My Products', icon: 'Boxes' },
  { id: 'seller-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 4 },
  { id: 'section-billing', labelAr: 'المالية', labelEn: 'Billing', isSection: true },
  { id: 'seller-wallet', labelAr: 'محفظتي والأرباح', labelEn: 'Wallet & Payouts', icon: 'Wallet' },
  { id: 'seller-debts', labelAr: 'سداد المديونية', labelEn: 'Pay Debts', icon: 'Receipt' },
  { id: 'seller-billing', labelAr: 'فاتورتي الحالية', labelEn: 'Current Invoice', icon: 'Receipt' },
  { id: 'seller-billing-plans', labelAr: 'اختر باقة', labelEn: 'Choose Plan', icon: 'Package' },
  { id: 'seller-billing-addons', labelAr: 'الميزات الإضافية', labelEn: 'Add-ons', icon: 'Sparkles' },
  { id: 'seller-billing-pay', labelAr: 'الدفع والتسديد', labelEn: 'Payment', icon: 'CreditCard' },
  { id: 'seller-billing-history', labelAr: 'سجل الفواتير', labelEn: 'Invoice History', icon: 'FileText' },
  { id: 'section-settings', labelAr: 'خيارات إضافية', labelEn: 'Extras', isSection: true },
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

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [],
  store_manager: STORE_NAV,
  seller: SELLER_NAV,
  supplier: [],
  logistics: [],
  buyer: [],
};

interface SidebarProps {
  className?: string;
}

export default function GentelellaSidebar({ className }: SidebarProps) {
  const { locale, currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen, isDesktopSidebarCollapsed } = useAppStore();
  const { user, isBuyerMode, logout } = useAuthStore();
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

  const navItems = user.role === 'seller' ? getSellerNav(paymentModel) : (NAV_ITEMS[user.role] || []);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <>
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
          'bg-gentelella-bg flex flex-col font-sans',
          'transition-all duration-300 ease-in-out',
          'lg:sticky lg:h-screen text-[#E7E7E7]',
          isSidebarOpen ? 'start-0 w-[230px]' : '-start-[230px] w-[230px]',
          'lg:start-0',
          isDesktopSidebarCollapsed ? 'lg:w-[70px]' : 'lg:w-[230px]',
          className
        )}
      >
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar">
          {/* Logo Section */}
          <div className="flex items-center gap-2 px-3 py-3 mb-2">
            <div className="text-[#ECF0F1] flex items-center gap-3 w-full">
              <Store className="h-8 w-8 shrink-0 text-white border border-[#E7E7E7] rounded-full p-1.5" />
              <span className={cn("text-xl font-normal tracking-wide transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                {t(locale, 'شاري داي', 'ChariDay')}
              </span>
            </div>
          </div>

          {/* Profile Quick Info */}
          <div className={cn("px-4 pb-4 mb-4 flex items-center gap-4 transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
            <Avatar className="h-14 w-14 border border-[#E7E7E7] shrink-0 bg-white/10 p-0.5 rounded-full overflow-hidden">
              <AvatarFallback className="bg-transparent text-[#E7E7E7] font-bold text-lg">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[#BAB8B8] text-[13px]">{t(locale, 'مرحباً،', 'Welcome,')}</span>
              <span className="text-[#ECF0F1] font-semibold text-[14px] truncate max-w-[120px]">{user.name}</span>
            </div>
          </div>

          <div className="px-4 mb-3">
            <div className="border-b border-[#3b5976] w-full" />
          </div>

          {/* Sidebar Menu */}
          <div className="flex-1 pb-10">
            <ul className="flex flex-col w-full">
              {navItems.map((item, index) => {
                if (item.isSection) {
                  return (
                    <li key={`section-${item.id}-${index}`} className={cn("px-4 py-2 mt-2 transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                      <h3 className="text-[13px] font-bold text-[#E7E7E7] uppercase tracking-wider">
                        {t(locale, item.labelAr, item.labelEn)}
                      </h3>
                    </li>
                  );
                }

                const Icon = iconMap[item.icon || 'LayoutDashboard'] || LayoutDashboard;
                const isActive = currentPage === item.id;

                return (
                  <li key={item.id + item.labelAr} className={cn("relative group", isActive ? "bg-gentelella-hover" : "")}>
                    <button
                      dir={isRTL ? 'rtl' : 'ltr'}
                      onClick={() => {
                        setCurrentPage(item.id as PageType);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-3 text-[13px] font-medium transition-colors',
                        isActive 
                          ? 'text-white' 
                          : 'text-[#E7E7E7] hover:text-white',
                        isDesktopSidebarCollapsed && 'justify-center px-0'
                      )}
                      style={{
                        borderInlineStart: isActive && !isDesktopSidebarCollapsed ? '4px solid #1ABB9C' : '4px solid transparent',
                      }}
                      title={isDesktopSidebarCollapsed ? t(locale, item.labelAr, item.labelEn) : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "opacity-100" : "opacity-80")} />
                        <span className={cn("text-start transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                          {t(locale, item.labelAr, item.labelEn)}
                        </span>
                      </div>
                      
                      {!isDesktopSidebarCollapsed && (
                        <div className="flex items-center gap-2">
                          {item.badge && item.badge > 0 && (
                            <Badge className="h-[18px] px-1.5 text-[10px] font-bold bg-[#1ABB9C] hover:bg-[#1ABB9C] text-white border-0 shrink-0">
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronIcon className="h-4 w-4 opacity-50" />
                        </div>
                      )}
                    </button>
                    
                    {/* Hover tooltip for collapsed state */}
                    {isDesktopSidebarCollapsed && (
                      <div className="absolute start-full top-0 h-full flex items-center ms-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100]">
                        <div className="bg-[#2A3F54] text-white text-xs px-3 py-2 rounded-md whitespace-nowrap shadow-lg border border-[#3b5976]">
                          {t(locale, item.labelAr, item.labelEn)}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className={cn("bg-[#172D44] p-2 flex items-center justify-around shrink-0 border-t border-[#3b5976]", isDesktopSidebarCollapsed && "flex-col gap-3 py-4")}>
          <button className="text-[#5A738E] hover:text-[#E7E7E7] p-1.5 transition-colors" title="Settings">
            <Settings className="h-4 w-4" />
          </button>
          <button className="text-[#5A738E] hover:text-[#E7E7E7] p-1.5 transition-colors" title="Fullscreen">
            <Monitor className="h-4 w-4" />
          </button>
          <button className="text-[#5A738E] hover:text-[#E7E7E7] p-1.5 transition-colors" title="Lock">
            <KeyRound className="h-4 w-4" />
          </button>
          <button onClick={logout} className="text-[#5A738E] hover:text-[#E7E7E7] p-1.5 transition-colors" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
