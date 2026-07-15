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

  const t = useCallback((key: string, values?: any, arg3?: any) => {
    const isLiteralText = /[^a-zA-Z0-9._-]/.test(key);
    if (isLiteralText) {
      if (typeof values === 'string') {
        if (activeLocale === 'ar') return key;
        if (activeLocale === 'en') return values;
        if (activeLocale === 'fr') return arg3 || values || key;
        return values;
      }
      return key;
    }

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

    // Fallback 1: Look in static dictionary of the current active locale
    if (result === undefined && dynamicDicts[activeLocale]) {
      let staticDict = staticDictionaries[activeLocale];
      let staticResult: any = staticDict;
      for (const k of keys) {
        if (staticResult && typeof staticResult === 'object' && k in staticResult) {
          staticResult = staticResult[k];
        } else {
          staticResult = undefined;
          break;
        }
      }
      if (staticResult !== undefined) {
        result = staticResult;
      }
    }

    // Fallback 2: Look in English/Arabic dynamic and static fallback dictionaries
    if (result === undefined) {
      const fallbackLocales = ['en', 'ar'];
      for (const fallback of fallbackLocales) {
        // Search dynamic
        let fallbackDict = dynamicDicts[fallback];
        let fallbackResult: any = fallbackDict;
        if (fallbackDict) {
          for (const k of keys) {
            if (fallbackResult && typeof fallbackResult === 'object' && k in fallbackResult) {
              fallbackResult = fallbackResult[k];
            } else {
              fallbackResult = undefined;
              break;
            }
          }
        }
        
        // Search static if not found in dynamic fallback
        if (fallbackResult === undefined) {
          let staticFallbackDict = staticDictionaries[fallback];
          let staticFallbackResult: any = staticFallbackDict;
          for (const k of keys) {
            if (staticFallbackResult && typeof staticFallbackResult === 'object' && k in staticFallbackResult) {
              staticFallbackResult = staticFallbackResult[k];
            } else {
              staticFallbackResult = undefined;
              break;
            }
          }
          if (staticFallbackResult !== undefined) {
            fallbackResult = staticFallbackResult;
          }
        }

        if (fallbackResult !== undefined) {
          result = fallbackResult;
          break;
        }
      }
    }

    if (result === undefined) {
      // Fallback: Check if key exists inside security namespace (useful for raw API errors)
      const secDict = dict?.security || (staticDictionaries[activeLocale] as any)?.security;
      if (secDict && typeof secDict === 'object' && key in secDict) {
        result = secDict[key];
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
  }, [dict, dynamicDicts, activeLocale]);

  return { t, locale: activeLocale };
}
