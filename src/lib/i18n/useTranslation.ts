import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslationStore } from '@/lib/store/translation-store';
import arDict from './dictionaries/ar.json';
import enDict from './dictionaries/en.json';
import frDict from './dictionaries/fr.json';

const staticDictionaries: Record<string, any> = {
  ar: arDict,
  en: enDict,
  fr: frDict,
};

export function useTranslation() {
  const { locale } = useAppStore();
  const { dictionaries: dynamicDicts } = useTranslationStore();

  const dict = useMemo(() => {
    // 1. Look up in dynamically loaded dictionaries from DB
    if (dynamicDicts[locale]) {
      return dynamicDicts[locale];
    }
    // 2. Fallback to static dictionaries
    return staticDictionaries[locale] || staticDictionaries.ar;
  }, [locale, dynamicDicts]);

  const t = useCallback((key: string, values?: Record<string, string | number>) => {
    // Navigate object dot notation like 'sidebar.dashboard'
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

    // If key is not found in the current dictionary (e.g. not translated yet in a new language),
    // try fallback to English, then Arabic static dictionaries to avoid showing raw dot-notation keys.
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
      return key; // Fallback to the key itself
    }

    let text = String(result);

    // Interpolate values if provided (e.g., "Welcome, %name%")
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        text = text.replace(new RegExp(`%${k}%`, 'g'), String(v));
      });
    }

    return text;
  }, [dict, dynamicDicts]);

  return { t, locale };
}
