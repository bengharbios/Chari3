"use client";

import { DirectionProvider } from '@radix-ui/react-direction';
import { useAppStore } from '@/lib/store';
import { localeDirections } from '@/lib/i18n/config';
import React, { useEffect, useState } from 'react';

export default function RadixDirectionProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const dir = localeDirections[locale] || 'rtl';
      document.documentElement.dir = dir;
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Prevent hydration mismatch: force a default during SSR, then update on client
  const dir = !mounted ? 'rtl' : (localeDirections[locale] || 'rtl');

  return <DirectionProvider dir={dir}>{children}</DirectionProvider>;
}
