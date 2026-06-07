import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import arDict from './dictionaries/ar.json';
import enDict from './dictionaries/en.json';
import frDict from './dictionaries/fr.json';

const dictionaries: Record<string, any> = {
  ar: arDict,
  en: enDict,
  fr: frDict,
};

export function useTranslation() {
  const { locale } = useAppStore();

  const dict = useMemo(() => dictionaries[locale] || dictionaries.ar, [locale]);

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
  }, [dict]);

  return { t, locale };
}
