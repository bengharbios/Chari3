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

import NextAuthProvider from '@/providers/NextAuthProvider';
import RadixDirectionProvider from '@/providers/RadixDirectionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'شاري داي - منصة التجارة الإلكترونية | CharyDay E-Commerce Platform',
  description: 'منصة تجارة إلكترونية شاملة متعددة البائعين مع لوحات تحكم متكاملة',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${inter.variable} antialiased`}>
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <RadixDirectionProvider>
              {children}
              <Toaster position="top-center" richColors />
            </RadixDirectionProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
