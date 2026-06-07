export function t(
  locale: string,
  ar: string,
  en: string,
  values?: Record<string, string | number>
): string {
  let result = locale === 'ar' ? ar : en;
  
  if (values) {
    Object.entries(values).forEach(([key, val]) => {
      // Replace all occurrences of %key% with val
      result = result.replace(new RegExp(`%${key}%`, 'g'), String(val));
    });
  }
  
  return result;
}
