'use client';

import { useEffect, type ReactNode } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Toaster } from 'sonner';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { locale, theme } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <div
      className={`min-h-dvh flex flex-col bg-background text-foreground transition-colors duration-300 ${
        locale === 'ar' ? 'font-[Cairo]' : 'font-[Inter]'
      }`}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {children}
      <Toaster
        position={locale === 'ar' ? 'top-left' : 'top-right'}
        richColors
        closeButton
        toastOptions={{
          className: 'font-[var(--font-platform)]',
        }}
      />
    </div>
  );
}
