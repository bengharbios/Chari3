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

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function GentelellaHeader() {
  const { locale, setLocale, toggleDesktopSidebar, setSidebarOpen, isSidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const { isDark, toggleDark: toggle } = useGentelellaTheme();
  const isRTL = locale === 'ar';

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className={cn(
        'h-[50px] flex items-center justify-between px-3 sticky top-0 z-[var(--z-sticky)]',
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
        <nav className="hidden sm:block text-[13px]">
          <span className={cn('font-medium', isDark ? 'text-[#c8d3e0]' : 'text-[#555]')}>
            {t(locale, 'الرئيسية', 'Home')}
          </span>
        </nav>
      </div>

      {/* CENTER: Search box */}
      <div className={cn(
        'flex-1 max-w-[380px] mx-4 hidden md:flex items-center gap-2 px-3 h-[32px] rounded-md border text-[13px] transition-colors',
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
          onClick={toggle}
          className={cn(
            'p-2 rounded-md transition-colors relative',
            isDark ? 'hover:bg-white/10 text-[#8899aa] hover:text-[#f0c040]' : 'hover:bg-gray-100 text-[#666] hover:text-[#555]'
          )}
          title={isDark ? t(locale, 'الوضع النهاري', 'Light Mode') : t(locale, 'الوضع الليلي', 'Dark Mode')}
          aria-label="Toggle theme"
        >
          {isDark ? (
            // Sun icon (switch to light)
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          ) : (
            // Moon icon (switch to dark)
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
              className="ms-1 h-[30px] w-[30px] rounded-full bg-[#1ABB9C] text-white text-[12px] font-bold flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
              aria-label="Account menu"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(
              'w-48 z-[var(--z-modal)] rounded-md border shadow-lg mt-1 text-[13px]',
              isDark
                ? 'bg-[#1e2d40] border-[#344760] text-[#c8d3e0]'
                : 'bg-white border-[#e4e9f0] text-[#555]'
            )}
          >
            <div className="px-3 py-2 border-b border-current/10">
              <div className="font-semibold truncate">{user.name}</div>
              <div className="text-[11px] opacity-60 truncate">{user.email || user.role}</div>
            </div>
            <DropdownMenuItem className={cn('py-2 px-3 cursor-pointer gap-2', isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50')}>
              <User className="h-3.5 w-3.5 opacity-60" />
              {t(locale, 'الملف الشخصي', 'Profile')}
            </DropdownMenuItem>
            <DropdownMenuItem className={cn('py-2 px-3 cursor-pointer gap-2', isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50')}>
              <Settings className="h-3.5 w-3.5 opacity-60" />
              <span className="flex-1">{t(locale, 'الإعدادات', 'Settings')}</span>
              <span className="bg-[#1ABB9C] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">50%</span>
            </DropdownMenuItem>
            <DropdownMenuItem className={cn('py-2 px-3 cursor-pointer gap-2', isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50')}>
              <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>
              {t(locale, 'مركز المساعدة', 'Help Center')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-20" />
            <DropdownMenuItem
              onClick={logout}
              className={cn('py-2 px-3 cursor-pointer gap-2 text-red-500', isDark ? 'hover:bg-white/10' : 'hover:bg-red-50')}
            >
              <LogOut className="h-3.5 w-3.5" />
              {t(locale, 'تسجيل الخروج', 'Log Out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
