'use client';

import { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { NavItem, PageType, UserRole } from '@/types';
import { useGentelellaTheme } from './theme';
import {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, ChevronLeft, ChevronRight, LogOut,
  TrendingUp, CreditCard, Boxes, ChevronUp, ArrowLeftRight, Layers,
  Receipt, Sparkles, ChevronDown, Monitor, KeyRound, MoreHorizontal
} from 'lucide-react';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, LogOut, TrendingUp, CreditCard, Boxes,
  ChevronUp, ArrowLeftRight, Layers, Receipt, Sparkles,
};

// ... Same nav items as before
const STORE_NAV: NavItem[] = [
  { id: 'section-store', labelAr: 'عام', labelEn: 'GENERAL', isSection: true },
  { id: 'store', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'store-products', labelAr: 'المنتجات', labelEn: 'Products', icon: 'Boxes', badge: 5 },
  { id: 'store-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 12 },
  { id: 'store-coupons', labelAr: 'الكوبونات والخصومات', labelEn: 'Coupons', icon: 'CreditCard' },
  { id: 'store-staff', labelAr: 'الفريق', labelEn: 'Team', icon: 'Users' },
  { id: 'store-analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: 'BarChart3' },
  { id: 'section-billing', labelAr: 'المالية', labelEn: 'BILLING', isSection: true },
  { id: 'store-billing', labelAr: 'فاتورتي الحالية', labelEn: 'Current Invoice', icon: 'Receipt' },
  { id: 'store-billing-plans', labelAr: 'اختر باقة', labelEn: 'Choose Plan', icon: 'Package' },
  { id: 'store-billing-addons', labelAr: 'الميزات الإضافية', labelEn: 'Add-ons', icon: 'Sparkles' },
  { id: 'store-billing-pay', labelAr: 'الدفع والتسديد', labelEn: 'Payment', icon: 'CreditCard' },
  { id: 'store-billing-history', labelAr: 'سجل الفواتير', labelEn: 'Invoice History', icon: 'FileText' },
  { id: 'section-settings', labelAr: 'إعدادات', labelEn: 'SETTINGS', isSection: true },
  { id: 'store-settings', labelAr: 'إعدادات المتجر', labelEn: 'Store Settings', icon: 'Settings' },
];

const SELLER_NAV: NavItem[] = [
  { id: 'section-seller', labelAr: 'عام', labelEn: 'GENERAL', isSection: true },
  { id: 'seller', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'seller-products', labelAr: 'منتجاتي', labelEn: 'My Products', icon: 'Boxes' },
  { id: 'seller-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 4 },
  { id: 'section-billing', labelAr: 'المالية', labelEn: 'BILLING', isSection: true },
  { id: 'seller-wallet', labelAr: 'محفظتي والأرباح', labelEn: 'Wallet & Payouts', icon: 'Wallet' },
  { id: 'seller-debts', labelAr: 'سداد المديونية', labelEn: 'Pay Debts', icon: 'Receipt' },
  { id: 'seller-billing', labelAr: 'فاتورتي الحالية', labelEn: 'Current Invoice', icon: 'Receipt' },
  { id: 'seller-billing-plans', labelAr: 'اختر باقة', labelEn: 'Choose Plan', icon: 'Package' },
  { id: 'seller-billing-addons', labelAr: 'الميزات الإضافية', labelEn: 'Add-ons', icon: 'Sparkles' },
  { id: 'seller-billing-pay', labelAr: 'الدفع والتسديد', labelEn: 'Payment', icon: 'CreditCard' },
  { id: 'seller-billing-history', labelAr: 'سجل الفواتير', labelEn: 'Invoice History', icon: 'FileText' },
  { id: 'section-settings', labelAr: 'إعدادات', labelEn: 'SETTINGS', isSection: true },
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
  const { isDark } = useGentelellaTheme();
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

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Styling maps based on theme
  const sidebarBg = isDark ? 'bg-[#1a2332]' : 'bg-[#1e293b]'; // v4 sidebar is always dark even in light mode, but slightly different shade? Wait, reference has always dark sidebar in v4!
  // Actually, the new v4 has a dark sidebar in light mode too, typically #1a2332. Let's stick to a very dark rich blue-gray.
  const themeBg = '#1a2332';
  
  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed top-0 bottom-0 z-[9999] lg:z-auto flex flex-col font-sans',
          'transition-all duration-300 ease-in-out',
          'lg:sticky lg:h-screen text-[#94a3b8]', // Default text color
          isSidebarOpen ? 'start-0 w-[260px]' : '-start-[260px] w-[260px]',
          'lg:start-0',
          isDesktopSidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px]',
          className
        )}
        style={{ backgroundColor: themeBg }}
      >
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 h-[72px] shrink-0 border-b border-white/5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1ABB9C] text-white font-bold text-lg shrink-0 shadow-[0_0_15px_rgba(26,187,156,0.3)]">
              G
            </div>
            <div className={cn("flex flex-col transition-opacity duration-300", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
              <span className="text-white text-lg font-bold tracking-wide">
                Gentelella <span className="text-[11px] text-[#1ABB9C] align-top ml-1">v4</span>
              </span>
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="flex-1 py-6 px-4">
            <ul className="flex flex-col w-full gap-1">
              {navItems.map((item, index) => {
                if (item.isSection) {
                  return (
                    <li key={`section-${item.id}-${index}`} className={cn("px-2 pt-5 pb-2 transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                      <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest">
                        {t(locale, item.labelAr, item.labelEn)}
                      </span>
                    </li>
                  );
                }

                const Icon = iconMap[item.icon || 'LayoutDashboard'] || LayoutDashboard;
                const isActive = currentPage === item.id;

                return (
                  <li key={item.id + item.labelAr} className="relative group">
                    <button
                      dir={isRTL ? 'rtl' : 'ltr'}
                      onClick={() => {
                        setCurrentPage(item.id as PageType);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200',
                        isActive 
                          ? 'bg-white/10 text-white shadow-sm' 
                          : 'text-[#94a3b8] hover:bg-white/5 hover:text-white',
                        isDesktopSidebarCollapsed && 'justify-center px-0'
                      )}
                      title={isDesktopSidebarCollapsed ? t(locale, item.labelAr, item.labelEn) : undefined}
                    >
                      {/* Active Left Indicator */}
                      {isActive && !isDesktopSidebarCollapsed && (
                        <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1ABB9C] rounded-e-md" />
                      )}

                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-[20px] w-[20px] shrink-0 transition-colors", 
                          isActive ? "text-[#1ABB9C]" : "group-hover:text-[#1ABB9C]"
                        )} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={cn("text-start transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                          {t(locale, item.labelAr, item.labelEn)}
                        </span>
                      </div>
                      
                      {!isDesktopSidebarCollapsed && (
                        <div className="flex items-center gap-2">
                          {item.badge && item.badge > 0 && (
                            <Badge className="h-[20px] px-2 text-[11px] font-bold bg-[#1ABB9C] hover:bg-[#1ABB9C] text-white border-0 shrink-0">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                    
                    {/* Hover tooltip for collapsed state */}
                    {isDesktopSidebarCollapsed && (
                      <div className="absolute start-[110%] top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-[100] translate-x-2 group-hover:translate-x-0">
                        <div className="bg-white text-[#1e293b] text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap shadow-xl">
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

        {/* User Profile Footer (Matching v4 design) */}
        <div className={cn(
          "shrink-0 border-t border-white/5 p-4 flex items-center gap-3", 
          isDesktopSidebarCollapsed ? "justify-center flex-col p-4" : ""
        )}>
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1ABB9C] to-[#0f7a65] flex items-center justify-center text-white font-bold shadow-md">
              {initials}
            </div>
            <span className="absolute bottom-0 end-0 w-3 h-3 bg-green-500 border-2 border-[#1a2332] rounded-full"></span>
          </div>
          
          <div className={cn("flex flex-col flex-1 min-w-0 transition-opacity", isDesktopSidebarCollapsed ? "hidden opacity-0" : "opacity-100")}>
            <span className="text-sm font-semibold text-white truncate">{user.name}</span>
            <span className="text-xs text-[#64748b] truncate capitalize">{user.role.replace('_', ' ')}</span>
          </div>

          <button 
            onClick={logout}
            className={cn("text-[#64748b] hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10", isDesktopSidebarCollapsed ? "hidden" : "block")}
            title={t(locale, 'تسجيل الخروج', 'Logout')}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
