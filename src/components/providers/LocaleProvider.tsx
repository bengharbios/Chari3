'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { usePathname } from 'next/navigation';
import { localeDirections } from '@/lib/i18n/config';

export function LocaleProvider() {
  const { locale } = useAppStore();
  const { adminLocale } = useAdminAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Determine which locale is active based on the path
    const activeLocale = pathname.startsWith('/admin-secure-internal') ? adminLocale : locale;
    
    // Sync to cookie for Server Components
    document.cookie = `NEXT_LOCALE=${activeLocale}; path=/; max-age=31536000`;
    
    // Sync to HTML element for RTL/LTR support globally
    document.documentElement.lang = activeLocale;
    document.documentElement.dir = localeDirections[activeLocale];
  }, [locale, adminLocale, pathname]);

  return null;
}
