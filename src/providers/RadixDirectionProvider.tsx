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

  // During SSR or first render before hydration, default to 'rtl' since Arabic is primary
  const dir = !mounted ? 'rtl' : (locale === 'ar' ? 'rtl' : 'ltr');

  return <DirectionProvider dir={dir}>{children}</DirectionProvider>;
}
