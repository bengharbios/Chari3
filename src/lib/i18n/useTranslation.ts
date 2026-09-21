import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslationStore } from '@/lib/store/translation-store';
import { usePathname } from 'next/navigation';
import arDict from './dictionaries/ar.json';
import enDict from './dictionaries/en.json';
import frDict from './dictionaries/fr.json';
import esDict from './dictionaries/es.json';

const staticDictionaries: Record<string, any> = {
  ar: arDict,
  en: enDict,
  fr: frDict,
  es: esDict,
};

import { isAdminPath } from './config';

export function useTranslation() {
  const { locale } = useAppStore();
  const { adminLocale } = useAdminAuthStore();
  const pathname = usePathname();
  const { dictionaries: dynamicDicts, languages } = useTranslationStore();

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
    if (!key || typeof key !== 'string') return '';
    
    // 1. Try to fetch directly from current dictionary (supports literal texts as keys too!)
    if (dict && typeof dict === 'object' && key in dict && dict[key]) {
      return dict[key];
    }
    
const commonLiteralTranslations: Record<string, { fr?: string; es?: string; en?: string }> = {
  'منتج جديد': { fr: 'Nouveau produit', es: 'Nuevo producto', en: 'New Product' },
  'إضافة منتج جديد': { fr: 'Ajouter un nouveau produit', es: 'Añadir nuevo producto', en: 'Add New Product' },
  'New Product': { fr: 'Nouveau produit', es: 'Nuevo producto' },
  'Add New Product': { fr: 'Ajouter un nouveau produit', es: 'Añadir nuevo producto' },
  'نفذت الكمية': { fr: 'Rupture de stock', es: 'Agotado', en: 'Out of Stock' },
  'نافذة الكمية': { fr: 'Rupture de stock', es: 'Agotado', en: 'Out of Stock' },
  'Out of Stock': { fr: 'Rupture de stock', es: 'Agotado' },
  'المنتجات النشطة': { fr: 'Produits actifs', es: 'Productos activos', en: 'Active Products' },
  'Active Products': { fr: 'Produits actifs', es: 'Productos activos' },
  'إجمالي المخزون': { fr: 'Stock total', es: 'Inventario total', en: 'Total Inventory' },
  'Total Inventory': { fr: 'Stock total', es: 'Inventario total' },
  'إجمالي المتغيرات': { fr: 'Variantes totales', es: 'Variantes totales', en: 'Total Variants' },
  'استيراد / تصدير': { fr: 'Importer / Exporter', es: 'Importar / Exportar', en: 'Import / Export' },
  'المنتج': { fr: 'Produit', es: 'Producto', en: 'Product' },
  'التصنيف': { fr: 'Catégorie', es: 'Categoría', en: 'Category' },
  'السعر': { fr: 'Prix', es: 'Precio', en: 'Price' },
  'المخزون': { fr: 'Stock', es: 'Inventario', en: 'Inventory' },
  'الحالة': { fr: 'Statut', es: 'Estado', en: 'Status' },
  'الإجراءات': { fr: 'Actions', es: 'Acciones', en: 'Actions' },
  'Actions': { fr: 'Actions', es: 'Acciones' },
  'الكل': { fr: 'Toutes', es: 'Todos', en: 'All' },
  'All': { fr: 'Toutes', es: 'Todos' },
  'غير مقروء': { fr: 'Non lues', es: 'No leídos', en: 'Unread' },
  'Unread': { fr: 'Non lues', es: 'No leídos' },
  'تحديد الكل كمقروء': { fr: 'Tout marquer comme lu', es: 'Marcar todo como leído', en: 'Mark all as read' },
  'Mark all as read': { fr: 'Tout marquer comme lu', es: 'Marcar todo como leído' },
  'مسح الكل': { fr: 'Tout effacer', es: 'Borrar todo', en: 'Clear all' },
  'Clear all': { fr: 'Tout effacer', es: 'Borrar todo' },
  'الإشعارات': { fr: 'Notifications', es: 'Notificaciones', en: 'Notifications' },
  'Notifications': { fr: 'Notifications', es: 'Notificaciones' },
  'جديد': { fr: 'Nouveau', es: 'Nuevo', en: 'New' },
  'New': { fr: 'Nouveau', es: 'Nuevo' },
  'عرض التفاصيل': { fr: 'Voir les détails', es: 'Ver detalles', en: 'View Details' },
  'View Details': { fr: 'Voir les détails', es: 'Ver detalles' },
  'عرض حالة التوثيق': { fr: 'Voir la vérification', es: 'Ver verificación', en: 'View Verification Status' },
  'View Verification Status': { fr: 'Voir la vérification', es: 'Ver verificación' },
  'تعديل طلب التوثيق': { fr: 'Modifier la vérification', es: 'Editar verificación', en: 'Edit Verification' },
  'Edit Verification': { fr: 'Modifier la vérification', es: 'Editar verificación' },
  'الإجابة على السؤال': { fr: 'Répondre à la question', es: 'Responder pregunta', en: 'Answer Question' },
  'Answer Question': { fr: 'Répondre à la question', es: 'Responder pregunta' },
  'عرض الطلبات': { fr: 'Voir les commandes', es: 'Ver pedidos', en: 'View Orders' },
  'View Orders': { fr: 'Voir les commandes', es: 'Ver pedidos' },
  'عرض المحفظة': { fr: 'Voir le portefeuille', es: 'Ver billetera', en: 'View Wallet' },
  'View Wallet': { fr: 'Voir le portefeuille', es: 'Ver billetera' },
  'لا توجد إشعارات': { fr: 'Aucune notification', es: 'Sin notificaciones', en: 'No notifications' },
  'لا توجد إشعارات غير مقروءة': { fr: 'Aucune notification non lue', es: 'Sin notificaciones no leídas', en: 'No unread notifications' },
  'لقد قرأت كل شيء!': { fr: 'Vous êtes à jour !', es: '¡Estás al día!', en: 'You are all caught up!' },
  'الإشعارات الجديدة ستظهر هنا': { fr: 'Les nouvelles notifications apparaîtront ici', es: 'Las nuevas notificaciones aparecerán aquí', en: 'New notifications will appear here' },
};

    // 2. Fallback to literal translations if key is literal text (contains spaces/Arabic)
    const isLiteralText = /[^a-zA-Z0-9._-]/.test(key);
    if (isLiteralText) {
      let textToReturn = key;

      // Handle notification footer count template
      if (key.includes('إشعارات إجمالاً') || key.includes('total notifications')) {
        if (activeLocale === 'fr') textToReturn = 'Vous avez {{count}} notifications au total, dont {{unread}} non lue(s)';
        else if (activeLocale === 'en') textToReturn = 'You have {{count}} total notifications, {{unread}} unread';
        else if (activeLocale === 'es') textToReturn = 'Tienes {{count}} notificaciones en total, {{unread}} no leídas';
        else textToReturn = 'لديك {{count}} إشعارات إجمالاً، منها {{unread}} غير مقروءة';
      } else if (typeof values === 'string') {
        if (activeLocale === 'en') {
          textToReturn = values;
        } else if (activeLocale === 'fr') {
          textToReturn = arg3 || commonLiteralTranslations[key]?.fr || commonLiteralTranslations[values]?.fr || values || key;
        } else if (activeLocale === 'es') {
          textToReturn = commonLiteralTranslations[key]?.es || commonLiteralTranslations[values]?.es || values || key;
        } else if (activeLocale !== 'ar') {
          textToReturn = values;
        }
      } else if (values && typeof values === 'object' && commonLiteralTranslations[key]) {
        if (activeLocale === 'fr' && commonLiteralTranslations[key].fr) textToReturn = commonLiteralTranslations[key].fr;
        else if (activeLocale === 'es' && commonLiteralTranslations[key].es) textToReturn = commonLiteralTranslations[key].es;
        else if (activeLocale === 'en' && commonLiteralTranslations[key].en) textToReturn = commonLiteralTranslations[key].en;
      }

      // Perform interpolation if values is an object
      if (values && typeof values === 'object') {
        Object.entries(values).forEach(([k, v]) => {
          const valStr = v !== undefined && v !== null ? String(v) : '';
          textToReturn = textToReturn
            .replace(new RegExp(`%${k}%`, 'g'), valStr)
            .replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), valStr)
            .replace(new RegExp(`\\{${k}\\}`, 'g'), valStr);
        });
        textToReturn = textToReturn
          .replace(/\{\{[a-zA-Z0-9_]+\}\}/g, '')
          .replace(/\{[a-zA-Z0-9_]+\}/g, '');
      }
      return textToReturn;
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

    if (values && typeof values === 'object') {
      Object.entries(values).forEach(([k, v]) => {
        const valStr = v !== undefined && v !== null ? String(v) : '';
        text = text
          .replace(new RegExp(`%${k}%`, 'g'), valStr)
          .replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), valStr)
          .replace(new RegExp(`\\{${k}\\}`, 'g'), valStr);
      });
      // Gracefully handle any leftover reason placeholder
      text = text
        .replace(/Remarque:\s*\{\{reason\}\}/gi, '')
        .replace(/Notice:\s*\{\{reason\}\}/gi, '')
        .replace(/ملاحظة:\s*\{\{reason\}\}/gi, '')
        .replace(/\{\{[a-zA-Z0-9_]+\}\}/g, '')
        .replace(/\{[a-zA-Z0-9_]+\}/g, '')
        .trim();
    }

    return text;
  }, [dict, dynamicDicts, activeLocale]);

  const currentLanguage = languages?.find((l: any) => l.code === activeLocale);
  const dir = currentLanguage?.direction || (['ar', 'he', 'fa', 'ur'].includes(activeLocale) ? 'rtl' : 'ltr');
  const isAr = dir === 'rtl';

  return { t, locale: activeLocale, isAr, dir };
}
