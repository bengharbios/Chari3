export type AppLocale = string;

export const locales: AppLocale[] = ['ar', 'en', 'fr'];

export const localeDirections: Record<string, 'rtl' | 'ltr'> = new Proxy(
  {
    ar: 'rtl',
    en: 'ltr',
    fr: 'ltr',
  } as Record<string, 'rtl' | 'ltr'>,
  {
    get(target, prop: string) {
      if (typeof prop !== 'string') return 'ltr';
      if (prop in target) return target[prop];
      
      const rtlCodes = ['ar', 'fa', 'ur', 'he', 'yi', 'syr'];
      if (rtlCodes.includes(prop)) {
        return 'rtl';
      }
      
      try {
        const { useTranslationStore } = require('@/lib/store/translation-store');
        const languages = useTranslationStore.getState().languages;
        const found = languages.find((l: any) => l.code === prop);
        if (found) return found.direction;
      } catch {}

      return 'ltr';
    }
  }
);

export const localeNames: Record<string, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
};

export function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return false;
  
  const firstSegment = segments[0];
  
  // Explicitly check known admin paths
  if (firstSegment === 'admin-secure-internal' || firstSegment === 'super-admin') {
    return true;
  }
  
  // Check if it's NOT a storefront/seller/buyer/etc. path
  const nonAdminSegments = [
    'seller', 'buyer', 'store', 'supplier', 'logistics', 
    'verification', 'search', 'login', 'api', '_next'
  ];
  
  return !nonAdminSegments.includes(firstSegment);
}
