export type AppLocale = 'ar' | 'en' | 'fr';

export const locales: AppLocale[] = ['ar', 'en', 'fr'];

export const localeDirections: Record<AppLocale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
  fr: 'ltr',
};

export const localeNames: Record<AppLocale, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
};
