'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import {
  Search, ShoppingCart, Moon, Sun, Globe,
  Menu, X, ChevronDown, User, LogOut, Settings,
  ClipboardCheck
} from 'lucide-react';
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
  const { locale, setLocale, theme, setTheme, toggleMobileMenu } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isRTL = locale === 'ar';
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  return (
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
                onClick={toggleMobileMenu}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <button
              onClick={() => useAppStore.getState().setCurrentPage(isAuthenticated ? rolePages[user?.role || 'buyer'] : 'login')}
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

            {/* Cart */}
            {user?.role === 'buyer' && (
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -end-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-brand text-navy border-2 border-background">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu (authenticated) or empty space (not authenticated) */}
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
                          { admin: 'مدير النظام', store_manager: 'مدير متجر', seller: 'تاجر مستقل', logistics: 'مندوب شحن', buyer: 'مشتري' }[user.role],
                          { admin: 'Admin', store_manager: 'Store Manager', seller: 'Seller', logistics: 'Courier', buyer: 'Buyer' }[user.role]
                        )}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => useAppStore.getState().setCurrentPage(rolePages[user.role])}>
                    <User className="h-4 w-4" />
                    {t('لوحة التحكم', 'Dashboard')}
                  </DropdownMenuItem>
                  {user.role !== 'admin' && user.role !== 'buyer' && (
                    <DropdownMenuItem onClick={() => useAppStore.getState().setCurrentPage('verification')}>
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
            ) : null}
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
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}