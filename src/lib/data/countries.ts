/**
 * Comprehensive World Countries, Currencies, and Timezones Dataset for ChariDay
 */

export interface CountryInfo {
  code: string;
  flag: string;
  nameAr: string;
  nameEn: string;
  currency: string;
  timezone: string;
}

export const WORLD_COUNTRIES: CountryInfo[] = [
  // Arab World
  { code: 'DZ', flag: '🇩🇿', nameAr: 'الجزائر', nameEn: 'Algeria', currency: 'DZD', timezone: 'UTC+1' },
  { code: 'SA', flag: '🇸🇦', nameAr: 'السعودية', nameEn: 'Saudi Arabia', currency: 'SAR', timezone: 'UTC+3' },
  { code: 'AE', flag: '🇦🇪', nameAr: 'الإمارات', nameEn: 'United Arab Emirates', currency: 'AED', timezone: 'UTC+4' },
  { code: 'QA', flag: '🇶🇦', nameAr: 'قطر', nameEn: 'Qatar', currency: 'QAR', timezone: 'UTC+3' },
  { code: 'KW', flag: '🇰🇼', nameAr: 'الكويت', nameEn: 'Kuwait', currency: 'KWD', timezone: 'UTC+3' },
  { code: 'BH', flag: '🇧🇭', nameAr: 'البحرين', nameEn: 'Bahrain', currency: 'BHD', timezone: 'UTC+3' },
  { code: 'OM', flag: '🇴🇲', nameAr: 'عُمان', nameEn: 'Oman', currency: 'OMR', timezone: 'UTC+4' },
  { code: 'MA', flag: '🇲🇦', nameAr: 'المغرب', nameEn: 'Morocco', currency: 'MAD', timezone: 'UTC+1' },
  { code: 'TN', flag: '🇹🇳', nameAr: 'تونس', nameEn: 'Tunisia', currency: 'TND', timezone: 'UTC+1' },
  { code: 'EG', flag: '🇪🇬', nameAr: 'مصر', nameEn: 'Egypt', currency: 'EGP', timezone: 'UTC+2' },
  { code: 'LY', flag: '🇱🇾', nameAr: 'ليبيا', nameEn: 'Libya', currency: 'LYD', timezone: 'UTC+2' },
  { code: 'JO', flag: '🇯🇴', nameAr: 'الأردن', nameEn: 'Jordan', currency: 'JOD', timezone: 'UTC+3' },
  { code: 'IQ', flag: '🇮🇶', nameAr: 'العراق', nameEn: 'Iraq', currency: 'IQD', timezone: 'UTC+3' },
  { code: 'SD', flag: '🇸🇩', nameAr: 'السودان', nameEn: 'Sudan', currency: 'SDG', timezone: 'UTC+2' },
  { code: 'MR', flag: '🇲🇷', nameAr: 'موريتانيا', nameEn: 'Mauritania', currency: 'MRU', timezone: 'UTC+0' },
  { code: 'YE', flag: '🇾🇪', nameAr: 'اليمن', nameEn: 'Yemen', currency: 'YER', timezone: 'UTC+3' },
  { code: 'PS', flag: '🇵🇸', nameAr: 'فلسطين', nameEn: 'Palestine', currency: 'ILS', timezone: 'UTC+2' },
  { code: 'LB', flag: '🇱🇧', nameAr: 'لبنان', nameEn: 'Lebanon', currency: 'LBP', timezone: 'UTC+2' },
  { code: 'SY', flag: '🇸🇾', nameAr: 'سوريا', nameEn: 'Syria', currency: 'SYP', timezone: 'UTC+3' },
  { code: 'KM', flag: '🇰🇲', nameAr: 'جزر القمر', nameEn: 'Comoros', currency: 'KMF', timezone: 'UTC+3' },
  { code: 'DJ', flag: '🇩🇯', nameAr: 'جيبوتي', nameEn: 'Djibouti', currency: 'DJF', timezone: 'UTC+3' },
  { code: 'SO', flag: '🇸🇴', nameAr: 'الصومال', nameEn: 'Somalia', currency: 'SOS', timezone: 'UTC+3' },

  // Europe & Mediterranean
  { code: 'TR', flag: '🇹🇷', nameAr: 'تركيا', nameEn: 'Turkey', currency: 'TRY', timezone: 'UTC+3' },
  { code: 'FR', flag: '🇫🇷', nameAr: 'فرنسا', nameEn: 'France', currency: 'EUR', timezone: 'UTC+1' },
  { code: 'DE', flag: '🇩🇪', nameAr: 'ألمانيا', nameEn: 'Germany', currency: 'EUR', timezone: 'UTC+1' },
  { code: 'GB', flag: '🇬🇧', nameAr: 'المملكة المتحدة (بريطانيا)', nameEn: 'United Kingdom', currency: 'GBP', timezone: 'UTC+0' },
  { code: 'IT', flag: '🇮🇹', nameAr: 'إيطاليا', nameEn: 'Italy', currency: 'EUR', timezone: 'UTC+1' },
  { code: 'ES', flag: '🇪🇸', nameAr: 'إسبانيا', nameEn: 'Spain', currency: 'EUR', timezone: 'UTC+1' },
  { code: 'NL', flag: '🇳🇱', nameAr: 'هولندا', nameEn: 'Netherlands', currency: 'EUR', timezone: 'UTC+1' },
  { code: 'BE', flag: '🇧🇪', nameAr: 'بلجيكا', nameEn: 'Belgium', currency: 'EUR', timezone: 'UTC+1' },
  { code: 'CH', flag: '🇨🇭', nameAr: 'سويسرا', nameEn: 'Switzerland', currency: 'CHF', timezone: 'UTC+1' },
  { code: 'AT', flag: '🇦🇹', nameAr: 'النمسا', nameEn: 'Austria', currency: 'EUR', timezone: 'UTC+1' },
  { code: 'SE', flag: '🇸🇪', nameAr: 'السويد', nameEn: 'Sweden', currency: 'SEK', timezone: 'UTC+1' },
  { code: 'NO', flag: '🇳🇴', nameAr: 'النرويج', nameEn: 'Norway', currency: 'NOK', timezone: 'UTC+1' },
  { code: 'DK', flag: '🇩🇰', nameAr: 'الدنمارك', nameEn: 'Denmark', currency: 'DKK', timezone: 'UTC+1' },
  { code: 'FI', flag: '🇫🇮', nameAr: 'فنلندا', nameEn: 'Finland', currency: 'EUR', timezone: 'UTC+2' },
  { code: 'GR', flag: '🇬🇷', nameAr: 'اليونان', nameEn: 'Greece', currency: 'EUR', timezone: 'UTC+2' },
  { code: 'PT', flag: '🇵🇹', nameAr: 'البرتغال', nameEn: 'Portugal', currency: 'EUR', timezone: 'UTC+0' },
  { code: 'IE', flag: '🇮🇪', nameAr: 'أيرلندا', nameEn: 'Ireland', currency: 'EUR', timezone: 'UTC+0' },
  { code: 'PL', flag: '🇵🇱', nameAr: 'بولندا', nameEn: 'Poland', currency: 'PLN', timezone: 'UTC+1' },
  { code: 'RU', flag: '🇷🇺', nameAr: 'روسيا', nameEn: 'Russia', currency: 'RUB', timezone: 'UTC+3' },

  // Americas
  { code: 'US', flag: '🇺🇸', nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States', currency: 'USD', timezone: 'UTC-5' },
  { code: 'CA', flag: '🇨🇦', nameAr: 'كندا', nameEn: 'Canada', currency: 'CAD', timezone: 'UTC-5' },
  { code: 'MX', flag: '🇲🇽', nameAr: 'المكسيك', nameEn: 'Mexico', currency: 'MXN', timezone: 'UTC-6' },
  { code: 'BR', flag: '🇧🇷', nameAr: 'البرازيل', nameEn: 'Brazil', currency: 'BRL', timezone: 'UTC-3' },
  { code: 'AR', flag: '🇦🇷', nameAr: 'الأرجنتين', nameEn: 'Argentina', currency: 'ARS', timezone: 'UTC-3' },
  { code: 'CL', flag: '🇨🇱', nameAr: 'شيلي', nameEn: 'Chile', currency: 'CLP', timezone: 'UTC-4' },
  { code: 'CO', flag: '🇨🇴', nameAr: 'كولومبيا', nameEn: 'Colombia', currency: 'COP', timezone: 'UTC-5' },

  // Asia & Oceania
  { code: 'CN', flag: '🇨🇳', nameAr: 'الصين', nameEn: 'China', currency: 'CNY', timezone: 'UTC+8' },
  { code: 'JP', flag: '🇯🇵', nameAr: 'اليابان', nameEn: 'Japan', currency: 'JPY', timezone: 'UTC+9' },
  { code: 'KR', flag: '🇰🇷', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', currency: 'KRW', timezone: 'UTC+9' },
  { code: 'IN', flag: '🇮🇳', nameAr: 'الهند', nameEn: 'India', currency: 'INR', timezone: 'UTC+5:30' },
  { code: 'PK', flag: '🇵🇰', nameAr: 'باكستان', nameEn: 'Pakistan', currency: 'PKR', timezone: 'UTC+5' },
  { code: 'BD', flag: '🇧🇩', nameAr: 'بنجلاديش', nameEn: 'Bangladesh', currency: 'BDT', timezone: 'UTC+6' },
  { code: 'ID', flag: '🇮🇩', nameAr: 'إندونيسيا', nameEn: 'Indonesia', currency: 'IDR', timezone: 'UTC+7' },
  { code: 'MY', flag: '🇲🇾', nameAr: 'ماليزيا', nameEn: 'Malaysia', currency: 'MYR', timezone: 'UTC+8' },
  { code: 'SG', flag: '🇸🇬', nameAr: 'سنغافورة', nameEn: 'Singapore', currency: 'SGD', timezone: 'UTC+8' },
  { code: 'TH', flag: '🇹🇭', nameAr: 'تايلاند', nameEn: 'Thailand', currency: 'THB', timezone: 'UTC+7' },
  { code: 'VN', flag: '🇻🇳', nameAr: 'فيتنام', nameEn: 'Vietnam', currency: 'VND', timezone: 'UTC+7' },
  { code: 'AU', flag: '🇦🇺', nameAr: 'أستراليا', nameEn: 'Australia', currency: 'AUD', timezone: 'UTC+10' },
  { code: 'NZ', flag: '🇳🇿', nameAr: 'نيوزيلندا', nameEn: 'New Zealand', currency: 'NZD', timezone: 'UTC+12' },

  // Africa
  { code: 'SN', flag: '🇸🇳', nameAr: 'السنغال', nameEn: 'Senegal', currency: 'XOF', timezone: 'UTC+0' },
  { code: 'NG', flag: '🇳🇬', nameAr: 'نيجيريا', nameEn: 'Nigeria', currency: 'NGN', timezone: 'UTC+1' },
  { code: 'ZA', flag: '🇿🇦', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', currency: 'ZAR', timezone: 'UTC+2' },
  { code: 'KE', flag: '🇰🇪', nameAr: 'كينيا', nameEn: 'Kenya', currency: 'KES', timezone: 'UTC+3' },
  { code: 'ET', flag: '🇪🇹', nameAr: 'إثيوبيا', nameEn: 'Ethiopia', currency: 'ETB', timezone: 'UTC+3' },
  { code: 'GH', flag: '🇬🇭', nameAr: 'غانا', nameEn: 'Ghana', currency: 'GHS', timezone: 'UTC+0' },
  { code: 'CI', flag: '🇨🇮', nameAr: 'ساحل العاج', nameEn: 'Ivory Coast', currency: 'XOF', timezone: 'UTC+0' },
  { code: 'CM', flag: '🇨🇲', nameAr: 'الكاميرون', nameEn: 'Cameroon', currency: 'XAF', timezone: 'UTC+1' },
  { code: 'ML', flag: '🇲🇱', nameAr: 'مالي', nameEn: 'Mali', currency: 'XOF', timezone: 'UTC+0' },
  { code: 'NE', flag: '🇳🇪', nameAr: 'النيجر', nameEn: 'Niger', currency: 'XOF', timezone: 'UTC+1' },
  { code: 'TD', flag: '🇹🇩', nameAr: 'تشاد', nameEn: 'Chad', currency: 'XAF', timezone: 'UTC+1' }
];

export function getCountryByCode(code: string): CountryInfo {
  const found = WORLD_COUNTRIES.find(c => c.code === code.toUpperCase());
  return found || WORLD_COUNTRIES[0]; // Default Algeria
}
