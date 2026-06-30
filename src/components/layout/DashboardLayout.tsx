'use client';
import React from 'react';

import { type ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import Sidebar from './Sidebar';
import Header from './Header';
import GentelellaSidebar from './gentelella/GentelellaSidebar';
import GentelellaHeader from './gentelella/GentelellaHeader';
import { useGentelellaTheme } from './gentelella/theme';
import Footer from './Footer';
import { ThemeSettings, defaultSellerTheme, defaultPlatformTheme } from '@/lib/theme-defaults';
import { useTheme } from 'next-themes';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSidebarOpen } = useAppStore();
  const { user, isBuyerMode } = useAuthStore();
  const [dashboardTemplate, setDashboardTemplate] = useState<string>('default');
  
  // Use correct default theme based on role
  const getInitialTheme = () => {
    if (!user) return defaultSellerTheme;
    if (user.role === 'admin' || user.role === 'buyer' || isBuyerMode) return defaultPlatformTheme;
    return defaultSellerTheme;
  };
  
  const getThemeKey = () => {
    if (!user) return 'theme_seller_dashboard';
    if (isBuyerMode || user?.role === 'buyer') return 'theme_buyer_dashboard';
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
  }, [user, isBuyerMode]);

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

        const isDashboardRole = user?.role && !['admin', 'buyer'].includes(user.role) && !isBuyerMode;
        if (isDashboardRole) {
          if (data.settings.seller_dashboard_template) {
            setDashboardTemplate(data.settings.seller_dashboard_template);
            localStorage.setItem('chari_dashboard_template', data.settings.seller_dashboard_template);
          } else {
            setDashboardTemplate('default');
            localStorage.removeItem('chari_dashboard_template');
          }
        } else {
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
  }, [user, isBuyerMode]);

  useEffect(() => {
    if (dashboardTemplate === 'gentelella') {
      document.documentElement.setAttribute('data-template', 'gentelella');
    } else {
      document.documentElement.removeAttribute('data-template');
    }
  }, [dashboardTemplate]);


  const { isDark: gentelellaDark } = useGentelellaTheme();
  const { theme: globalTheme } = useTheme();

  if (!user) return null;
  
  // Prevent flash by waiting for theme load or at least showing cached theme
  if (!isThemeLoaded && !theme.colors) {
     return <div className="min-h-screen bg-background flex items-center justify-center">...</div>;
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
