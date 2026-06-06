'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Menu, Search, Moon, Sun, Globe, ShoppingCart, User, LogOut, Settings, ChevronDown, ShoppingBag, ClipboardCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { PageType } from '@/types';
import { useState } from 'react';

const t = (ar: string, en: string) => {
  return typeof window !== 'undefined' && localStorage.getItem('locale') === 'en' ? en : ar;
};

const rolePages: Record<string, PageType> = {
  admin: 'admin',
  store_manager: 'store',
  seller: 'seller',
  supplier: 'supplier',
  logistics: 'logistics',
  buyer: 'buyer'
};

export default function GentelellaHeader() {
  const { isSidebarOpen, setSidebarOpen, locale, setLocale, itemCount, setCartOpen, scrolled } = useAppStore();
  const { user, logout, isBuyerMode } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isAuthenticated = !!user;
  const isRTL = locale === 'ar';
  
  const navigateToDashboard = (page: PageType) => {
    useAppStore.getState().setCurrentPage(page);
    router.push('/');
  };

  return (
    <header
      className={`sticky top-0 z-[var(--z-sticky)] w-full transition-all duration-300 bg-[#EDEDED] dark:bg-[#1f2937] border-b border-[#D9DEE4] dark:border-gray-700`}
    >
      <div className="flex items-center justify-between h-[var(--header-height)] px-4">
        
        {/* Left Side: Menu Toggle & Optional Search */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#5A738E] hover:bg-black/5 dark:text-gray-300"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Simple Desktop Search */}
          <div className="hidden md:flex items-center bg-white dark:bg-gray-800 rounded-full border border-[#ccc] px-3 py-1.5 h-8">
            <input
              type="text"
              placeholder={t('ابحث...', 'Search...')}
              className="bg-transparent border-none outline-none text-sm w-48 text-[#5A738E] dark:text-gray-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  useAppStore.getState().setCurrentPage('search' as PageType);
                  router.push(`/?view=search&q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                }
              }}
            />
            <Search className="h-4 w-4 text-[#5A738E]" />
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          
          <ul className="flex items-center gap-1 md:gap-2">
            <li>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#5A738E] hover:bg-black/5 dark:text-gray-300"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#5A738E] hover:bg-black/5 dark:text-gray-300"
                onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              >
                <Globe className="h-5 w-5" />
              </Button>
            </li>
            
            {isAuthenticated && (
              <li>
                <div className="text-[#5A738E] hover:bg-black/5 dark:text-gray-300 flex items-center justify-center p-2 rounded-md">
                  <NotificationPanel />
                </div>
              </li>
            )}
            
            <li>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[#5A738E] hover:bg-black/5 dark:text-gray-300"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-[#1ABB9C] text-white border-0">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </li>
          </ul>

          {/* User Profile Dropdown */}
          {isAuthenticated && user ? (
            <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-black/5 p-1.5 rounded-md text-[#5A738E] dark:text-gray-300 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#1ABB9C] text-white text-sm font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 hidden lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 z-[99999]">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1 text-start">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigateToDashboard(isBuyerMode ? 'buyer' : (rolePages[user.role] || 'buyer'))}>
                  <User className="h-4 w-4" />
                  {t('لوحة التحكم', 'Dashboard')}
                </DropdownMenuItem>
                {user.role !== 'admin' && user.role !== 'buyer' && (
                  <DropdownMenuItem 
                    onClick={() => {
                      const { setBuyerMode, isBuyerMode } = useAuthStore.getState();
                      const newMode = !isBuyerMode;
                      setBuyerMode(newMode);
                      if (newMode) navigateToDashboard('home');
                      else navigateToDashboard(rolePages[user.role] || 'seller');
                    }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {useAuthStore.getState().isBuyerMode ? t('العودة لحساب التاجر', 'Return to Dashboard') : t('تصفح كـ مشتري', 'Browse as Buyer')}
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
          ) : (
            <Button
              size="sm"
              className="bg-[#1ABB9C] hover:bg-[#169F85] text-white font-medium"
              onClick={() => useAppStore.getState().setCurrentPage('login')}
            >
              <User className="h-4 w-4 me-1.5" />
              {t('تسجيل الدخول', 'Sign In')}
            </Button>
          )}

        </div>
      </div>
    </header>
  );
}
