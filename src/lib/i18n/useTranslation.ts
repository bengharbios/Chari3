import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslationStore } from '@/lib/store/translation-store';
import { usePathname } from 'next/navigation';
import arDict from './dictionaries/ar.json';
import enDict from './dictionaries/en.json';
import frDict from './dictionaries/fr.json';

const staticDictionaries: Record<string, any> = {
  ar: arDict,
  en: enDict,
  fr: frDict,
};

import { isAdminPath } from './config';

export function useTranslation() {
  const { locale } = useAppStore();
  const { adminLocale } = useAdminAuthStore();
  const pathname = usePathname();
  const { dictionaries: dynamicDicts } = useTranslationStore();

  const activeLocale = useMemo(() => {
    // Decouple: use adminLocale when inside admin dashboard, else storefront locale
    if (isAdminPath(pathname)) {
      return adminLocale;
    }
    return locale;
  }, [locale, adminLocale, pathname]);

  const dict = useMemo(() => {
    // 1. Look up in dynamically loaded dictionaries from DB
    if (dynamicDicts[activeLocale]) {
      return dynamicDicts[activeLocale];
    }
    // 2. Fallback to static dictionaries
    return staticDictionaries[activeLocale] || staticDictionaries.ar;
  }, [activeLocale, dynamicDicts]);

  const t = useCallback((key: string, values?: Record<string, string | number>) => {
    const keys = key.split('.');
    let result: any = dict;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (result === undefined) {
      const fallbackLocales = ['en', 'ar'];
      for (const fallback of fallbackLocales) {
        let fallbackDict = dynamicDicts[fallback] || staticDictionaries[fallback];
        let fallbackResult: any = fallbackDict;
        for (const k of keys) {
          if (fallbackResult && typeof fallbackResult === 'object' && k in fallbackResult) {
            fallbackResult = fallbackResult[k];
          } else {
            fallbackResult = undefined;
            break;
          }
        }
        if (fallbackResult !== undefined) {
          result = fallbackResult;
          break;
        }
      }
    }

    if (result === undefined) {
      console.warn(`[i18n] Missing translation for key: ${key}`);
      return key; // Fallback to key itself
    }

    let text = String(result);

    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        text = text.replace(new RegExp(`%${k}%`, 'g'), String(v));
      });
    }

    return text;
  }, [dict, dynamicDicts]);

  return { t, locale: activeLocale };
}
