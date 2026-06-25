'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import AdminSidebar from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Globe, LogOut, Menu, LayoutDashboard, Settings, Sliders, ToggleRight, TrendingUp, ShoppingCart, Users, Store, Wallet, Tag, FolderTree, Boxes, Moon, Sun } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { ThemeSettings, defaultPlatformTheme } from '@/lib/theme-defaults';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { localeDirections } from '@/lib/i18n/config';
import NotificationPanel from '@/components/notifications/NotificationPanel';

function AdminBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme: globalTheme } = useTheme();
  const { t, locale } = useTranslation();
  const isRTL = localeDirections[locale] === 'rtl';
  const currentTab = searchParams.get('tab') || 'overview';
  const themeMode = globalTheme === 'dark' ? 'dark' : 'light';

  const getPageTitle = () => {
    const path = pathname.split('/').pop() || '';
    
    let key = currentTab;
    if (!pathname.endsWith('/admin-secure-internal') && path !== 'admin-secure-internal') {
       key = path;
    }

    // Map path/tab keys to translation keys
    const keyMap: Record<string, string> = {
      'overview': 'admin.dashboardOverview',
      'products': 'admin.topProducts',
      'orders': 'admin.fulfilledOrders',
      'order-statuses': 'admin.orderStatuses',
      'users': 'admin.userAccounts',
      'stores-sellers': 'admin.storesSellers',
      'settings': 'admin.generalSettings',
      'theme': 'admin.themeDesign',
      'packages': 'admin.subscriptionPackages',
      'merchants': 'admin.merchantsSubscriptions',
      'wallets': 'admin.walletsDebts',
      'withdrawals': 'admin.payoutRequests',
      'receipts': 'admin.reviewReceipts',
      'revenue': 'admin.revenueReports',
      'coupons': 'admin.globalCoupons',
      'categories': 'admin.manageCategories',
      'brands': 'admin.manageBrands',
      'cms': 'admin.storefrontCMS',
      'advertisements': 'admin.manageAdvertisements',
      'flags': 'admin.featureFlags',
    };

    const translationKey = keyMap[key];
    if (translationKey) return t(translationKey);
    
    return t('admin.title');
  };

  const getAdminPath = (subPath: string) => {
    if (typeof window === 'undefined') return '';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  return (
    <nav className="hidden sm:flex items-center gap-2 text-[13px]">
      <span className={cn('opacity-70 cursor-pointer hover:underline', themeMode === 'dark' ? 'text-[#c8d3e0]' : 'text-[#555]')} onClick={() => window.location.href = getAdminPath('')}>
        {t('common.home')}
      </span>
      <span className="opacity-50 text-[10px]">/</span>
      <span className={cn('font-medium', themeMode === 'dark' ? 'text-white' : 'text-[#73879C]')}>
        {getPageTitle()}
      </span>
    </nav>
  );
}

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const { adminLocale, setAdminLocale } = useAdminAuthStore();
  const isAdminAuthenticated = !isPending && !!session && ((session.user as any)?.role === 'admin' || (session.user as any)?.role === 'SUPER_ADMIN');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
  const { t, locale } = useTranslation();
  
  const [theme, setTheme] = useState<ThemeSettings>(defaultPlatformTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load theme from API
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    try {
      const cachedTheme = localStorage.getItem('chari_admin_theme');
      if (cachedTheme) setTheme(JSON.parse(cachedTheme));
    } catch (e) {}

    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings && data.settings.theme_admin_dashboard) {
          try {
            const newTheme = JSON.parse(data.settings.theme_admin_dashboard);
            setTheme(newTheme);
            localStorage.setItem('chari_admin_theme', data.settings.theme_admin_dashboard);
          } catch (e) {
            console.error('Failed to parse admin theme JSON', e);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsThemeLoaded(true));
  }, [isAdminAuthenticated]);

  const toggleTheme = () => {
    setGlobalTheme(globalTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = getAdminPath('login');
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-background" />;
  }

  const isRTL = localeDirections[locale] === 'rtl';
  const isLoginPage = pathname.includes('/login');

  const getAdminPath = (subPath: string) => {
    if (typeof window === 'undefined') return '';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  if (isPending) {
    return <div className="min-h-screen bg-background flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!isAdminAuthenticated) {
    if (isLoginPage) {
      return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-background">
          {children}
        </div>
      );
    }
    // Security Fix: Redirect immediately if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = getAdminPath('login');
    }
    return <div className="min-h-screen bg-background flex items-center justify-center">جاري التحويل للوحة الدخول...</div>;
  }

  // If authenticated but somehow still on the login page, hide the sidebar and let the login page's useEffect redirect them.
  if (isLoginPage) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  const themeMode = globalTheme === 'dark' ? 'dark' : 'light';
  const themeStyles = {
    '--theme-bg-sidebar': theme.colors.sidebarBackground[themeMode],
    '--theme-text-sidebar': theme.colors.sidebarText[themeMode],
    '--theme-bg-header': theme.colors.headerBackground[themeMode],
    '--theme-text-header': theme.colors.headerText[themeMode],
    '--theme-bg-main': theme.colors.mainBackground[themeMode],
    '--theme-text-main': theme.colors.mainText[themeMode],
    '--theme-primary': theme.colors.primaryColor[themeMode],
    'fontFamily': theme.typography.fontFamily,
    '--sidebar': theme.colors.sidebarBackground[themeMode],
    '--sidebar-foreground': theme.colors.sidebarText[themeMode],
    '--background': theme.colors.mainBackground[themeMode],
    '--foreground': theme.colors.mainText[themeMode],
  } as React.CSSProperties;

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className={cn("min-h-screen w-full flex bg-[#F7F7F7] font-sans text-[#73879C]", themeMode === 'dark' ? 'bg-[#0f172a] text-[#94a3b8]' : '')}
    >
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header (Gentelella Style) */}
        <header
          className={cn(
            'h-[72px] shrink-0 flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-30',
            'border-b transition-colors',
            themeMode === 'dark'
              ? 'bg-[#1a2332] border-[#263346] text-[#c8d3e0]'
              : 'bg-white border-[#e4e9f0] text-[#555]'
          )}
        >
          {/* LEFT: Mobile Menu Button + Breadcrumb */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile toggle */}
            <button
              onClick={() => useAppStore.getState().setSidebarOpen(true)}
              className={cn(
                'lg:hidden p-1.5 rounded-md transition-colors',
                themeMode === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              )}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => window.dispatchEvent(new Event('toggleAdminSidebar'))}
              className={cn(
                'hidden lg:block p-1.5 rounded-md transition-colors',
                themeMode === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              )}
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            
            {/* Breadcrumb */}
            <Suspense fallback={<div className="hidden sm:flex items-center gap-2 text-[13px] opacity-70">...</div>}>
              <AdminBreadcrumb />
            </Suspense>
          </div>

          {/* CENTER: Search box */}
          <div className={cn(
            'flex-1 max-w-[380px] mx-4 hidden md:flex items-center gap-2 px-3 h-[36px] rounded-md border text-[13px] transition-colors',
            themeMode === 'dark'
              ? 'bg-[#263346] border-[#344760] text-[#8899aa] focus-within:border-[#1ABB9C]'
              : 'bg-[#f5f7fa] border-[#e4e9f0] text-[#999] focus-within:border-[#1ABB9C]'
          )}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 opacity-60">
              <circle cx="7" cy="7" r="5"/>
              <path d="M11 11l3.5 3.5"/>
            </svg>
            <label htmlFor="admin-search-input" className="sr-only">Search</label>
            <input
              id="admin-search-input"
              name="admin-search-input"
              type="text"
              placeholder={t('common.searchPages')}
              className="bg-transparent border-0 outline-none w-full text-[13px] placeholder:opacity-60"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <kbd className={cn(
              'text-[10px] px-1.5 py-0.5 rounded border font-mono shrink-0 hidden lg:block',
              themeMode === 'dark' ? 'border-[#344760] text-[#6a7c90]' : 'border-[#d0d7e2] text-[#999]'
            )}>⌘K</kbd>
          </div>

          {/* RIGHT: Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Language toggle */}
            <LanguageSwitcher />

            {/* Dark / Light mode toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-md transition-colors relative',
                themeMode === 'dark' ? 'hover:bg-white/10 text-[#8899aa] hover:text-[#f0c040]' : 'hover:bg-gray-100 text-[#666] hover:text-[#555]'
              )}
              title={themeMode === 'dark' ? t('common.themeLight') : t('common.themeDark')}
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? (
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
            <div className={cn(themeMode === 'dark' ? '[&_button]:text-[#8899aa] [&_button:hover]:text-white' : '')}>
              <NotificationPanel />
            </div>

            {/* Messages */}
            <button
              className={cn(
                'p-2 rounded-md transition-colors relative hidden sm:block',
                themeMode === 'dark' ? 'hover:bg-white/10 text-[#8899aa] hover:text-white' : 'hover:bg-gray-100 text-[#666] hover:text-[#333]'
              )}
              title={t('common.messages')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="3"/>
                <path d="M2 7l10 6 10-6"/>
              </svg>
            </button>

            {/* Logout icon */}
            <button
              onClick={handleLogout}
              className={cn(
                'p-2 rounded-md transition-colors relative',
                themeMode === 'dark' ? 'hover:bg-white/10 text-red-400 hover:text-red-300' : 'hover:bg-red-50 text-red-500 hover:text-red-600'
              )}
              title={t('common.logout')}
            >
              <LogOut className="h-[17px] w-[17px]" />
            </button>
          </div>
        </header>

        {/* Dynamic Children Content (Gentelella Style) */}
        <main className={cn(
          "flex-1 min-w-0 overflow-y-auto overflow-x-hidden transition-all duration-300 flex flex-col",
          themeMode === 'dark'
            ? 'bg-[#0f172a] text-[#cbd5e1]'
            : 'bg-[#F7F7F7] text-[#73879C]'
        )}>
          <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 w-full flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
