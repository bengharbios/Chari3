'use client';

import { useEffect, type ReactNode } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Toaster } from 'sonner';
import FloatingCart from './FloatingCart';
import AuthSync from '@/components/auth/AuthSync';
import ResizeObserverPatcher from '@/components/layout/ResizeObserverPatcher';

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

  return (
    <div
      className={`min-h-dvh max-w-full overflow-x-hidden flex flex-col bg-background text-foreground transition-colors duration-300 ${
        locale === 'ar' ? 'font-[Cairo]' : 'font-[Inter]'
      }`}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <ResizeObserverPatcher />
      <AuthSync />
      {children}
      <FloatingCart />
    </div>
  );
}
