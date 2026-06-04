"use client";

import { DirectionProvider } from '@radix-ui/react-direction';
import { useAppStore } from '@/lib/store';
import React, { useEffect, useState } from 'react';

export default function RadixDirectionProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale === 'ar' ? 'ar' : 'en';
    }
  }, [locale]);

  // Prevent hydration mismatch: force a default during SSR, then update on client
  const dir = !mounted ? 'rtl' : (locale === 'ar' ? 'rtl' : 'ltr');

  return <DirectionProvider dir={dir}>{children}</DirectionProvider>;
}
