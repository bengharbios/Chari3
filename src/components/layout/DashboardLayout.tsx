'use client';

import { type ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import Sidebar from './Sidebar';
import GentelellaSidebar from './gentelella/GentelellaSidebar';
import GentelellaHeader from './gentelella/GentelellaHeader';
import { useGentelellaTheme } from './gentelella/theme';
import Footer from './Footer';
import { ThemeSettings, defaultSellerTheme } from '@/lib/theme-defaults';
import { useTheme } from 'next-themes';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSidebarOpen } = useAppStore();
  const { user, isBuyerMode } = useAuthStore();
  const [dashboardTemplate, setDashboardTemplate] = useState<string>('default');
  const [theme, setTheme] = useState<ThemeSettings>(defaultSellerTheme);
  const { isDark } = useGentelellaTheme();

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.settings) return;
        
        let themeKey = 'theme_seller_dashboard';
        if (isBuyerMode || user?.role === 'buyer') {
          themeKey = 'theme_buyer_dashboard';
        } else if (user?.role === 'admin') {
          themeKey = 'theme_admin_dashboard';
        }

        const isDashboardRole = user?.role && !['admin', 'buyer'].includes(user.role) && !isBuyerMode;
        if (isDashboardRole) {
          if (data.settings.seller_dashboard_template) {
            setDashboardTemplate(data.settings.seller_dashboard_template);
          } else {
            setDashboardTemplate('default');
          }
        } else {
          setDashboardTemplate('default');
        }

        if (data.settings[themeKey]) {
          try {
            setTheme(JSON.parse(data.settings[themeKey]));
          } catch (e) {
            console.error('Failed to parse theme JSON', e);
          }
        }
      })
      .catch(() => setDashboardTemplate('default'));
  }, [user, isBuyerMode]);

  if (!user) return null;

  const { isDark: gentelellaDark } = useGentelellaTheme();
  const { theme: globalTheme } = useTheme();

  const isGentelella = dashboardTemplate === 'gentelella';

  const themeMode = globalTheme === 'dark' || (isGentelella && gentelellaDark) ? 'dark' : 'light';
  
  const themeStyles = {
    '--theme-bg-sidebar': theme.colors.sidebarBackground[themeMode],
    '--theme-text-sidebar': theme.colors.sidebarText[themeMode],
    '--theme-bg-header': theme.colors.headerBackground[themeMode],
    '--theme-text-header': theme.colors.headerText[themeMode],
    '--theme-bg-main': theme.colors.mainBackground[themeMode],
    '--theme-text-main': theme.colors.mainText[themeMode],
    '--theme-primary': theme.colors.primaryColor[themeMode],
    '--theme-bg-footer': theme.colors.footerBackground[themeMode],
    '--theme-text-footer': theme.colors.footerText[themeMode],
    'fontFamily': theme.typography.fontFamily,
  } as React.CSSProperties;

  return (
    <div 
      id={isGentelella ? 'gentelella-root' : undefined} 
      className={`flex-1 flex flex-col overflow-hidden ${isGentelella ? 'min-h-screen max-h-screen' : 'min-h-[calc(100dvh-var(--header-height))] max-h-[calc(100dvh-var(--header-height))]'}`}
      style={themeStyles}
    >
      {theme.customCss && <style>{theme.customCss}</style>}
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
