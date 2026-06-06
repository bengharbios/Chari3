'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { Menu, Mail, Bell, ChevronDown, User, LogOut, Settings, Globe } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import NotificationPanel from '@/components/notifications/NotificationPanel';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function GentelellaHeader() {
  const { locale, setLocale, toggleDesktopSidebar, setSidebarOpen, isSidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const isRTL = locale === 'ar';

  if (!user) return null;

  return (
    <header className="h-[50px] bg-gentelella-nav border-b border-[#D9DEE4] flex items-center justify-between px-4 sticky top-0 z-[var(--z-sticky)]">
      {/* Left side: Menu Toggle */}
      <div className="flex items-center">
        {/* Mobile toggle */}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 text-[#5A738E] hover:text-[#23527c] transition-colors"
        >
          <Menu className="h-[22px] w-[22px]" />
        </button>
        {/* Desktop toggle */}
        <button
          onClick={toggleDesktopSidebar}
          className="hidden lg:block p-2 text-[#5A738E] hover:text-[#23527c] transition-colors"
        >
          <Menu className="h-[22px] w-[22px]" />
        </button>
      </div>

      {/* Right side: User Profile & Icons */}
      <div className="flex items-center gap-1 md:gap-3">
        <button
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="p-2 text-[#5A738E] hover:text-[#23527c] transition-colors relative"
          title="Toggle Language"
        >
          <Globe className="h-[18px] w-[18px]" />
        </button>

        <div className="flex items-center">
          <NotificationPanel />
        </div>

        <button className="p-2 text-[#5A738E] hover:text-[#23527c] transition-colors relative">
          <Mail className="h-[18px] w-[18px]" />
          <Badge className="absolute top-1 end-1 h-3.5 min-w-[14px] px-1 bg-[#1ABB9C] text-white border-0 text-[9px] font-bold flex items-center justify-center">
            2
          </Badge>
        </button>

        <div className="ms-2">
          <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 text-[#5A738E] hover:text-[#23527c] transition-colors">
                <Avatar className="h-[29px] w-[29px]">
                  <AvatarFallback className="bg-[#1ABB9C] text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[13px] hidden sm:block">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[var(--z-modal)] rounded-none border border-[#D9DEE4] shadow-md mt-1">
              <DropdownMenuItem className="py-2 px-3 text-[13px] text-[#5A738E] cursor-pointer hover:bg-[#F5F7FA]">
                <User className="h-3.5 w-3.5 me-2 opacity-70" />
                {t(locale, 'الملف الشخصي', 'Profile')}
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2 px-3 text-[13px] text-[#5A738E] cursor-pointer hover:bg-[#F5F7FA]">
                <Settings className="h-3.5 w-3.5 me-2 opacity-70" />
                <span className="flex-1">{t(locale, 'الإعدادات', 'Settings')}</span>
                <Badge className="bg-[#1ABB9C] text-white text-[10px] h-4 border-0 hover:bg-[#1ABB9C]">50%</Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#D9DEE4] my-1" />
              <DropdownMenuItem onClick={logout} className="py-2 px-3 text-[13px] text-[#5A738E] cursor-pointer hover:bg-[#F5F7FA]">
                <LogOut className="h-3.5 w-3.5 me-2 opacity-70" />
                {t(locale, 'تسجيل الخروج', 'Log Out')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
