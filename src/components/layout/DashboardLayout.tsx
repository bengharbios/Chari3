'use client';
import React from 'react';

import { type ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useSession } from '@/lib/auth-client';
import Sidebar from './Sidebar';
import Header from './Header';
import GentelellaSidebar from './gentelella/GentelellaSidebar';
import GentelellaHeader from './gentelella/GentelellaHeader';
import { useGentelellaTheme } from './gentelella/theme';
import Footer from './Footer';
import { ThemeSettings, defaultSellerTheme, defaultPlatformTheme } from '@/lib/theme-defaults';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSidebarOpen, locale } = useAppStore();
  const { user, isBuyerMode, setBuyerMode, hasPassword, setHasPassword } = useAuthStore();
  const pathname = usePathname();
  const [dashboardTemplate, setDashboardTemplate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chari_dashboard_template') || 'gentelella';
    }
    return 'gentelella';
  });
  
  const isBuyerRoute = pathname?.startsWith('/buyer') || false;
  const isSellerRoute = pathname?.startsWith('/seller') || false;
  // Instantly override persisted state based on current route to prevent UI flashes
  const effectiveBuyerMode = isSellerRoute ? false : (isBuyerRoute ? true : isBuyerMode);

  // Sync zustand store if URL does not match state
  useEffect(() => {
    if (isBuyerRoute && !isBuyerMode) {
      setBuyerMode(true);
    } else if (isSellerRoute && isBuyerMode) {
      setBuyerMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isBuyerRoute, isSellerRoute, setBuyerMode]);

  // Use correct default theme based on role
  const getInitialTheme = () => {
    if (!user) return defaultSellerTheme;
    if (user.role === 'admin' || user.role === 'buyer' || effectiveBuyerMode) return defaultPlatformTheme;
    return defaultSellerTheme;
  };
  
  const getThemeKey = () => {
    if (!user) return 'theme_seller_dashboard';
    if (effectiveBuyerMode || user?.role === 'buyer') return 'theme_buyer_dashboard';
    if (user?.role === 'admin') return 'theme_admin_dashboard';
    return 'theme_seller_dashboard';
  };
  
  const [theme, setTheme] = useState<ThemeSettings>(defaultSellerTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const { isDark } = useGentelellaTheme();

  // Load from localStorage immediately for instant display
  useEffect(() => {
    try {
      const themeKey = getThemeKey();
      const cachedTheme = localStorage.getItem('chari_dashboard_theme_' + themeKey);
      if (cachedTheme) {
        setTheme(JSON.parse(cachedTheme));
      } else {
        setTheme(getInitialTheme());
      }
      const cachedTemplate = localStorage.getItem('chari_dashboard_template');
      if (cachedTemplate) {
        setDashboardTemplate(cachedTemplate);
      }
    } catch (e) {
      setTheme(getInitialTheme());
    }
  }, [user, effectiveBuyerMode]);

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.settings) {
          setIsThemeLoaded(true);
          return;
        }
        const themeKey = getThemeKey();
        let defaultTh = defaultSellerTheme;
        if (themeKey === 'theme_buyer_dashboard' || themeKey === 'theme_admin_dashboard') {
          defaultTh = defaultPlatformTheme;
        }

        const isDashboardRole = user?.role && !['admin', 'buyer'].includes(user.role) && !effectiveBuyerMode;
        if (isDashboardRole) {
          if (data.settings.seller_dashboard_template) {
            setDashboardTemplate(data.settings.seller_dashboard_template);
            localStorage.setItem('chari_dashboard_template', data.settings.seller_dashboard_template);
          } else {
            setDashboardTemplate('default');
            localStorage.removeItem('chari_dashboard_template');
          }
        } else if (user) {
          setDashboardTemplate('default');
          localStorage.removeItem('chari_dashboard_template');
        }

        if (data.settings[themeKey]) {
          try {
            const newTheme = JSON.parse(data.settings[themeKey]);
            setTheme(newTheme);
            localStorage.setItem('chari_dashboard_theme_' + themeKey, data.settings[themeKey]);
          } catch (e) {
            console.error('Failed to parse theme JSON', e);
            setTheme(defaultTh);
          }
        } else {
          setTheme(defaultTh);
        }
      })
      .catch(() => setDashboardTemplate('default'))
      .finally(() => setIsThemeLoaded(true));
  }, [user, effectiveBuyerMode]);

  useEffect(() => {
    if (dashboardTemplate === 'gentelella') {
      document.documentElement.setAttribute('data-template', 'gentelella');
    } else {
      document.documentElement.removeAttribute('data-template');
    }
  }, [dashboardTemplate]);

  // Load profile to check passwordless status
  useEffect(() => {
    if (user && hasPassword === null) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHasPassword(data.hasPassword);
          }
        })
        .catch(() => {});
    }
  }, [user, hasPassword, setHasPassword]);

  const { isDark: gentelellaDark } = useGentelellaTheme();
  const { theme: globalTheme } = useTheme();
  const { isPending, data, error } = useSession();

  // We only block rendering if the session is still initially loading
  if (isPending) {
    return <div className="min-h-screen bg-background flex items-center justify-center">...</div>;
  }

  // If Zustand has no user AND the server session is missing, they are truly logged out.
  if (!user && !data?.user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  // Prevent flash by waiting for theme load completely
  if (!isThemeLoaded) {
     return <div className="min-h-screen bg-background flex items-center justify-center">...</div>;
  }

  const isSecurityPage = pathname === '/security';
  if (user && hasPassword === false && !isSecurityPage) {
    const isAr = locale === 'ar';
    return (
      <div 
        className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 font-cairo"
        style={{ fontFamily: 'Cairo, sans-serif' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.07)_0,transparent_100%)] pointer-events-none" />
        <div className="relative w-full max-w-md bg-slate-900/80 border border-rose-500/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 text-center space-y-6">
          <div className="mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-rose-400 animate-pulse"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              {isAr ? 'تعيين كلمة المرور مطلوب' : 'Password Setup Required'}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {isAr 
                ? 'لحماية حسابك وتجنب نفاد رصيد رسائل التحقق (OTP)، يجب عليك تعيين كلمة مرور لحسابك قبل متابعة تصفح لوحة التحكم.'
                : 'To protect your account and avoid running out of verification OTP credits, you must set a password for your account before you can proceed.'}
            </p>
          </div>
          <button
            onClick={() => {
              window.location.href = '/security';
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-medium transition duration-200 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
          >
            {isAr ? 'تعيين كلمة المرور الآن' : 'Set Password Now'}
          </button>
        </div>
      </div>
    );
  }


  const isGentelella = dashboardTemplate === 'gentelella';

  const themeMode = globalTheme === 'dark' || (isGentelella && gentelellaDark) ? 'dark' : 'light';
  
  const colors = theme?.colors || getInitialTheme().colors;
  const typography = theme?.typography || getInitialTheme().typography;

  const themeStyles = {
    '--theme-bg-sidebar': colors?.sidebarBackground?.[themeMode] || '#2A3F54',
    '--theme-text-sidebar': colors?.sidebarText?.[themeMode] || '#E7E7E7',
    '--theme-bg-header': colors?.headerBackground?.[themeMode] || '#ffffff',
    '--theme-text-header': colors?.headerText?.[themeMode] || '#555555',
    '--theme-bg-main': colors?.mainBackground?.[themeMode] || '#F7F7F7',
    '--theme-text-main': colors?.mainText?.[themeMode] || '#73879C',
    '--theme-primary': colors?.primaryColor?.[themeMode] || '#1ABB9C',
    '--theme-bg-footer': colors?.footerBackground?.[themeMode] || '#ffffff',
    '--theme-text-footer': colors?.footerText?.[themeMode] || '#555555',
    'fontFamily': typography?.fontFamily || 'Cairo, sans-serif',
    // Override Shadcn UI CSS variables so Tailwind utilities like bg-sidebar and text-sidebar-foreground pick up the custom theme colors
    '--sidebar': colors?.sidebarBackground?.[themeMode] || '#2A3F54',
    '--sidebar-foreground': colors?.sidebarText?.[themeMode] || '#E7E7E7',
    '--background': colors?.mainBackground?.[themeMode] || '#F7F7F7',
    '--foreground': colors?.mainText?.[themeMode] || '#73879C',
  } as React.CSSProperties;

  return (
    <div 
      id={isGentelella ? 'gentelella-root' : undefined} 
      className={`flex-1 flex flex-col overflow-hidden ${isGentelella ? 'min-h-screen max-h-screen' : 'min-h-[calc(100dvh-var(--header-height))] max-h-[calc(100dvh-var(--header-height))]'}`}
      style={themeStyles}
    >
      {theme.customCss && <style>{theme.customCss}</style>}
      {!isGentelella && <Header />}
      <div className="flex flex-1 overflow-hidden">
        {isGentelella ? <GentelellaSidebar /> : <Sidebar />}
        <main
          className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden transition-all duration-300 flex flex-col ${isSidebarOpen ? 'lg:ms-0' : 'lg:ms-0'} ${
            isGentelella
              ? isDark
                ? 'bg-[#0f172a] text-[#cbd5e1]'
                : 'bg-[#F7F7F7] text-[#73879C]'
              : ''
          }`}
        >
          {isGentelella && <GentelellaHeader />}
          <div className={`p-4 md:p-6 lg:p-8 pb-24 md:pb-8 w-full flex-1 ${isGentelella ? '' : 'max-w-[1750px] mx-auto'}`}>
            {children}
          </div>
          {theme.footer.enabled && <Footer theme={theme} />}
        </main>
      </div>
    </div>
  );
}
