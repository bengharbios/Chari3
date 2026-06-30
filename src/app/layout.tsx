import React from 'react';
import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

import RadixDirectionProvider from '@/providers/RadixDirectionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { LocaleProvider } from '@/components/providers/LocaleProvider';

export const metadata: Metadata = {
  title: 'شاري داي - منصة التجارة الإلكترونية | CharyDay E-Commerce Platform',
  description: 'منصة تجارة إلكترونية شاملة متعددة البائعين مع لوحات تحكم متكاملة',
};

import DebugState from './debug-state';

import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${inter.variable} antialiased`}>
        <LocaleProvider />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <RadixDirectionProvider>
              <DebugState />
              <GlobalErrorBoundary>
                {children}
              </GlobalErrorBoundary>
              <Toaster position="top-center" richColors visibleToasts={1} duration={3000} />
            </RadixDirectionProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
