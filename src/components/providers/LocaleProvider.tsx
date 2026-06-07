'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { usePathname } from 'next/navigation';
import { useTranslationStore } from '@/lib/store/translation-store';

import { isAdminPath } from '@/lib/i18n/config';

export function LocaleProvider() {
  const { locale } = useAppStore();
  const { adminLocale } = useAdminAuthStore();
  const pathname = usePathname();
  const { languages, loadTranslations } = useTranslationStore();

  useEffect(() => {
    // Determine which locale is active based on the path
    const activeLocale = isAdminPath(pathname) ? adminLocale : locale;
    
    // Load dynamic translations from DB/API
    loadTranslations(activeLocale);

    // Sync to cookie for Server Components
    document.cookie = `NEXT_LOCALE=${activeLocale}; path=/; max-age=31536000`;
    
    // Sync to HTML element for RTL/LTR support globally
    document.documentElement.lang = activeLocale;
    
    // Determine direction from store metadata (fallback to 'rtl' for 'ar', else 'ltr')
    const activeLangMeta = languages.find(l => l.code === activeLocale);
    const direction = activeLangMeta?.direction || (activeLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.dir = direction;
  }, [locale, adminLocale, pathname, languages, loadTranslations]);

  return null;
}
