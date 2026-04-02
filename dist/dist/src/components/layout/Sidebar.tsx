'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { NavItem, PageType, UserRole } from '@/types';
import {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, ChevronLeft, ChevronRight, LogOut,
  TrendingUp, CreditCard, Boxes, ChevronUp, ArrowLeftRight, Layers
} from 'lucide-react';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, LogOut, TrendingUp, CreditCard, Boxes,
  ChevronUp, ArrowLeftRight, Layers,
};

const ADMIN_NAV: NavItem[] = [
  { id: 'admin', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'admin-users', labelAr: 'إدارة المستخدمين', labelEn: 'User Management', icon: 'Users' },
  { id: 'admin-roles', labelAr: 'الأدوار والصلاحيات', labelEn: 'Roles & Permissions', icon: 'ShieldCheck' },
  { id: 'admin-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 23 },
  { id: 'admin-products', labelAr: 'المنتجات', labelEn: 'Products', icon: 'Boxes' },
  { id: 'admin-stores', labelAr: 'المتاجر', labelEn: 'Stores', icon: 'Store' },
  { id: 'admin-sellers', labelAr: 'التجار المستقلين', labelEn: 'Sellers', icon: 'UserCircle' },
  { id: 'admin-shipping', labelAr: 'الشحن والتوصيل', labelEn: 'Shipping', icon: 'Truck' },
  { id: 'admin-analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: 'BarChart3' },
  { id: 'admin-settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: 'Settings' },
];

const STORE_NAV: NavItem[] = [
  { id: 'store', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'store-products', labelAr: 'المنتجات', labelEn: 'Products', icon: 'Boxes', badge: 5 },
  { id: 'store-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 12 },
  { id: 'store-staff', labelAr: 'الفريق', labelEn: 'Team', icon: 'Users' },
  { id: 'store-analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: 'BarChart3' },
  { id: 'store-settings', labelAr: 'إعدادات المتجر', labelEn: 'Store Settings', icon: 'Settings' },
];

const SELLER_NAV: NavItem[] = [
  { id: 'seller', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard' },
  { id: 'seller-products', labelAr: 'منتجاتي', labelEn: 'My Products', icon: 'Boxes' },
  { id: 'seller-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 4 },
  { id: 'seller-upgrade', labelAr: 'ترقية لمتجر', labelEn: 'Upgrade to Store', icon: 'TrendingUp' },
];

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
  admin: ADMIN_NAV,
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
  const { locale, currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const isRTL = locale === 'ar';

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role];
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
        className={cn(
          'fixed top-[var(--header-height-mobile)] bottom-0 z-[var(--z-overlay)] lg:z-auto',
          'w-[var(--sidebar-width)] bg-sidebar text-sidebar-foreground flex flex-col',
          'transition-all duration-300 ease-in-out',
          'lg:sticky lg:top-[var(--header-total-height)] lg:h-[calc(100dvh-var(--header-total-height))]',
          isSidebarOpen ? 'start-0' : '-start-[280px]',
          'lg:start-0',
          className
        )}
      >
        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-brand shrink-0">
              <AvatarFallback className="bg-brand text-navy font-bold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <Badge variant="secondary" className="text-[10px] mt-0.5 bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border">
                {t(locale,
                  { admin: 'مدير النظام', store_manager: 'مدير متجر', seller: 'تاجر مستقل', supplier: 'مورد', logistics: 'مندوب شحن', buyer: 'مشتري' }[user.role],
                  { admin: 'Admin', store_manager: 'Store Manager', seller: 'Seller', supplier: 'Supplier', logistics: 'Courier', buyer: 'Buyer' }[user.role]
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
        <div className="flex-1 py-2 overflow-y-auto">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id + item.labelAr}
                  onClick={() => {
                    setCurrentPage(item.id as PageType);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 truncate text-start">{t(locale, item.labelAr, item.labelEn)}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px] bg-brand text-navy border-0 shrink-0">
                      {item.badge}
                    </Badge>
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
