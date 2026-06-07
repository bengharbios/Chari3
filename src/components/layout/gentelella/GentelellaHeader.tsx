'use client';

import { useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Globe } from 'lucide-react';
import { useGentelellaTheme } from './theme';

import { useRouter } from 'next/navigation';
import type { PageType } from '@/types';
import { useTheme } from 'next-themes';

const rolePages: Record<string, PageType> = {
  admin: 'admin',
  store_manager: 'store',
  seller: 'seller',
  supplier: 'seller',
  logistics: 'logistics',
  buyer: 'buyer',
};

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function GentelellaHeader() {
  const { locale, setLocale, toggleDesktopSidebar, setSidebarOpen, isSidebarOpen, setCurrentPage, currentPage } = useAppStore();
  const { user, logout, isBuyerMode, setBuyerMode } = useAuthStore();
  const { isDark, toggleDark: toggle } = useGentelellaTheme();
  const { setTheme } = useTheme();
  const router = useRouter();
  const isRTL = locale === 'ar';

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navigateToDashboard = (view: string) => {
    setCurrentPage(view as PageType);
    router.push(`/?view=${view}`);
  };

  const getPageTitle = (page: string) => {
    const titles: Record<string, {ar: string, en: string}> = {
      'home': { ar: 'الرئيسية', en: 'Home' },
      'seller': { ar: 'لوحة التحكم', en: 'Dashboard' },
      'store': { ar: 'لوحة التحكم', en: 'Dashboard' },
      'store-products': { ar: 'المنتجات', en: 'Products' },
      'store-orders': { ar: 'الطلبات', en: 'Orders' },
      'store-settings': { ar: 'إعدادات المتجر', en: 'Settings' },
      'store-staff': { ar: 'فريق العمل', en: 'Staff' },
      'store-coupons': { ar: 'الكوبونات', en: 'Coupons' },
      'store-analytics': { ar: 'التحليلات', en: 'Analytics' },
      'store-billing': { ar: 'الاشتراكات والفواتير', en: 'Billing & Subscriptions' },
      'store-billing-plans': { ar: 'الباقات', en: 'Plans' },
      'store-billing-addons': { ar: 'الإضافات', en: 'Add-ons' },
      'store-billing-pay': { ar: 'الدفع', en: 'Payment' },
      'store-billing-history': { ar: 'سجل الفواتير', en: 'Billing History' },
      'seller-products': { ar: 'المنتجات', en: 'Products' },
      'seller-orders': { ar: 'الطلبات', en: 'Orders' },
      'seller-wallet': { ar: 'المحفظة', en: 'Wallet' },
      'seller-billing': { ar: 'الاشتراكات والفواتير', en: 'Billing & Subscriptions' },
      'seller-billing-plans': { ar: 'الباقات', en: 'Plans' },
      'seller-billing-addons': { ar: 'الإضافات', en: 'Add-ons' },
      'seller-billing-pay': { ar: 'الدفع', en: 'Payment' },
      'seller-billing-history': { ar: 'سجل الفواتير', en: 'Billing History' },
      'seller-debts': { ar: 'الديون والمستحقات', en: 'Debts' },
      'seller-settings': { ar: 'الإعدادات', en: 'Settings' },
      'seller-upgrade': { ar: 'ترقية الحساب', en: 'Upgrade Account' },
      'admin': { ar: 'لوحة التحكم', en: 'Dashboard' },
      'admin-users': { ar: 'المستخدمين', en: 'Users' },
      'admin-roles': { ar: 'الأدوار والصلاحيات', en: 'Roles & Permissions' },
      'admin-stores': { ar: 'المتاجر', en: 'Stores' },
      'admin-sellers': { ar: 'التجار', en: 'Sellers' },
      'admin-orders': { ar: 'الطلبات', en: 'Orders' },
      'admin-products': { ar: 'المنتجات', en: 'Products' },
      'admin-shipping': { ar: 'الشحن', en: 'Shipping' },
      'admin-analytics': { ar: 'التحليلات', en: 'Analytics' },
      'admin-settings': { ar: 'الإعدادات', en: 'Settings' },
      'logistics': { ar: 'لوحة تحكم شركة الشحن', en: 'Logistics Dashboard' },
      'logistics-active': { ar: 'الشحنات النشطة', en: 'Active Shipments' },
      'logistics-deliveries': { ar: 'التوصيلات', en: 'Deliveries' },
      'logistics-history': { ar: 'سجل الشحنات', en: 'Shipment History' },
      'logistics-earnings': { ar: 'الأرباح', en: 'Earnings' },
      'buyer': { ar: 'لوحة تحكم المشتري', en: 'Buyer Dashboard' },
      'buyer-orders': { ar: 'طلباتي', en: 'My Orders' },
      'buyer-wishlist': { ar: 'المفضلة', en: 'Wishlist' },
      'buyer-addresses': { ar: 'عناويني', en: 'My Addresses' },
      'buyer-wallet': { ar: 'محفظتي', en: 'My Wallet' },
      'buyer-reviews': { ar: 'تقييماتي', en: 'My Reviews' },
      'supplier': { ar: 'لوحة تحكم المورد', en: 'Supplier Dashboard' },
      'supplier-products': { ar: 'المنتجات', en: 'Products' },
      'supplier-orders': { ar: 'الطلبات', en: 'Orders' },
      'supplier-inventory': { ar: 'المخزون', en: 'Inventory' },
      'verification': { ar: 'حالة التوثيق', en: 'Verification Status' },
    };
    const mapped = titles[page];
    if (mapped) return isRTL ? mapped.ar : mapped.en;
    if (!page) return isRTL ? 'الرئيسية' : 'Home';
    return page.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <header
      className={cn(
        'h-[72px] flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-[var(--z-sticky)]',
        'border-b transition-colors',
        isDark
          ? 'bg-[#1a2332] border-[#263346] text-[#c8d3e0]'
          : 'bg-white border-[#e4e9f0] text-[#555]'
      )}
      id="gentelella-topbar"
    >
      {/* LEFT: Sidebar toggle + Breadcrumb */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile toggle */}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className={cn(
            'lg:hidden p-1.5 rounded-md transition-colors',
            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          )}
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        {/* Desktop collapse toggle */}
        <button
          onClick={toggleDesktopSidebar}
          className={cn(
            'hidden lg:block p-1.5 rounded-md transition-colors',
            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          )}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-2 text-[13px]">
          <span className={cn('opacity-70 cursor-pointer hover:underline', isDark ? 'text-[#c8d3e0]' : 'text-[#555]')} onClick={() => navigateToDashboard(rolePages[user.role] || 'home')}>
            {t(locale, 'الرئيسية', 'Home')}
          </span>
          <span className="opacity-50 text-[10px]">/</span>
          <span className={cn('font-medium', isDark ? 'text-white' : 'text-[var(--gentelella-heading)]')}>
            {getPageTitle(currentPage)}
          </span>
        </nav>
      </div>

      {/* CENTER: Search box */}
      <div className={cn(
        'flex-1 max-w-[380px] mx-4 hidden md:flex items-center gap-2 px-3 h-[36px] rounded-md border text-[13px] transition-colors',
        isDark
          ? 'bg-[#263346] border-[#344760] text-[#8899aa] focus-within:border-[#1ABB9C]'
          : 'bg-[#f5f7fa] border-[#e4e9f0] text-[#999] focus-within:border-[#1ABB9C]'
      )}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 opacity-60">
          <circle cx="7" cy="7" r="5"/>
          <path d="M11 11l3.5 3.5"/>
        </svg>
        <input
          type="text"
          placeholder={t(locale, 'ابحث أو نفّذ أمراً...', 'Search pages or run a command…')}
          className="bg-transparent border-0 outline-none w-full text-[13px] placeholder:opacity-60"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <kbd className={cn(
          'text-[10px] px-1.5 py-0.5 rounded border font-mono shrink-0 hidden lg:block',
          isDark ? 'border-[#344760] text-[#6a7c90]' : 'border-[#d0d7e2] text-[#999]'
        )}>⌘K</kbd>
      </div>

      {/* RIGHT: Action buttons */}
      <div className="flex items-center gap-0.5 shrink-0">

        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className={cn(
            'p-2 rounded-md transition-colors text-[13px] font-bold',
            isDark ? 'hover:bg-white/10 text-[#8899aa] hover:text-white' : 'hover:bg-gray-100 text-[#666] hover:text-[#333]'
          )}
          title="Toggle Language"
        >
          <Globe className="h-[17px] w-[17px]" />
        </button>

        {/* Dark / Light mode toggle — matches reference exactly */}
        <button
          onClick={() => {
            toggle();
            setTheme(isDark ? 'light' : 'dark');
          }}
          className={cn(
            'p-2 rounded-md transition-colors relative',
            isDark ? 'hover:bg-white/10 text-[#8899aa] hover:text-[#f0c040]' : 'hover:bg-gray-100 text-[#666] hover:text-[#555]'
          )}
          title={isDark ? t(locale, 'الوضع النهاري', 'Light Mode') : t(locale, 'الوضع الليلي', 'Dark Mode')}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div className={cn(isDark ? '[&_button]:text-[#8899aa] [&_button:hover]:text-white' : '')}>
          <NotificationPanel />
        </div>

        {/* Messages */}
        <button
          className={cn(
            'p-2 rounded-md transition-colors relative',
            isDark ? 'hover:bg-white/10 text-[#8899aa] hover:text-white' : 'hover:bg-gray-100 text-[#666] hover:text-[#333]'
          )}
          title={t(locale, 'الرسائل', 'Messages')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="16" rx="3"/>
            <path d="M2 7l10 6 10-6"/>
          </svg>
        </button>

        {/* User avatar dropdown */}
        <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
          <DropdownMenuTrigger asChild>
            <button
              className="ms-1 h-[34px] w-[34px] rounded-full bg-[#1ABB9C] text-white text-[13px] font-bold flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
              aria-label="Account menu"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(
              'w-56 z-[var(--z-modal)] rounded-md border shadow-lg mt-1 text-[13px]',
              isDark
                ? 'bg-[#1e2d40] border-[#344760] text-[#c8d3e0]'
                : 'bg-white border-[#e4e9f0] text-[#555]'
            )}
          >
            <div className="px-3 py-3 border-b border-current/10">
              <div className="font-semibold truncate">{user.name}</div>
              <div className="text-[11px] opacity-60 truncate mt-0.5">{user.email || user.role}</div>
            </div>

            <DropdownMenuItem onClick={() => navigateToDashboard(isBuyerMode ? 'buyer' : (rolePages[user.role] || 'buyer'))} className={cn('py-2.5 px-3 cursor-pointer gap-2', isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50')}>
              <svg className="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              {t(locale, 'لوحة التحكم', 'Dashboard')}
            </DropdownMenuItem>

            {user.role !== 'admin' && user.role !== 'buyer' && (
              <DropdownMenuItem 
                onClick={() => {
                  const newMode = !isBuyerMode;
                  setBuyerMode(newMode);
                  if (newMode) {
                    navigateToDashboard('home');
                  } else {
                    navigateToDashboard(rolePages[user.role] || 'seller');
                  }
                }}
                className={cn('py-2.5 px-3 cursor-pointer gap-2', isBuyerMode ? (isDark ? 'bg-[#1ABB9C]/20 text-[#1ABB9C]' : 'bg-[#1ABB9C]/10 text-[#1ABB9C]') : (isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'))}
              >
                <svg className="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {isBuyerMode ? t(locale, 'العودة لحساب التاجر', 'Return to Dashboard') : t(locale, 'تصفح كـ مشتري', 'Browse as Buyer')}
              </DropdownMenuItem>
            )}

            {user.role !== 'admin' && user.role !== 'buyer' && (
              <DropdownMenuItem onClick={() => navigateToDashboard('verification')} className={cn('py-2.5 px-3 cursor-pointer gap-2', isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50')}>
                <svg className="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>
                {t(locale, 'حالة التوثيق', 'Verification Status')}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="opacity-20 my-1" />

            <DropdownMenuItem className={cn('py-2 px-3 cursor-pointer gap-2', isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50')}>
              <User className="h-4 w-4 opacity-70" />
              {t(locale, 'الملف الشخصي', 'Profile')}
            </DropdownMenuItem>
            <DropdownMenuItem className={cn('py-2 px-3 cursor-pointer gap-2', isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50')}>
              <Settings className="h-4 w-4 opacity-70" />
              <span className="flex-1">{t(locale, 'الإعدادات', 'Settings')}</span>
              <span className="bg-[#1ABB9C] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">50%</span>
            </DropdownMenuItem>
            <DropdownMenuItem className={cn('py-2 px-3 cursor-pointer gap-2', isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50')}>
              <svg className="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>
              {t(locale, 'مركز المساعدة', 'Help Center')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-20 my-1" />
            <DropdownMenuItem
              onClick={logout}
              className={cn('py-2 px-3 cursor-pointer gap-2 text-red-500 font-medium', isDark ? 'hover:bg-white/10' : 'hover:bg-red-50')}
            >
              <LogOut className="h-4 w-4" />
              {t(locale, 'تسجيل الخروج', 'Log Out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
