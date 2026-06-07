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
