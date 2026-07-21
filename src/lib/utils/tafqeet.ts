/**
 * ChariDay Tafqeet & Currency Verbalization Engine
 * Based on Arabic grammar rules for currency verbalization (تفقيط المبالغ بالكلمات العربية).
 */

interface CurrencyRules {
  singular: string;    // 1 (دينار)
  dual: string;        // 2 (ديناران)
  plural: string;      // 3-10 (دنانير)
  accusative: string;  // 11-99 (ديناراً)
  fractionSingular: string; // 1 سنت / سنتيم
  fractionPlural: string;   // سنتات
}

const CURRENCY_DICTIONARY: Record<string, { nameAr: string; rules: CurrencyRules }> = {
  DZD: {
    nameAr: 'دينار جزائري',
    rules: {
      singular: 'دينار جزائري',
      dual: 'ديناران جزائريان',
      plural: 'دنانير الجزائرية',
      accusative: 'ديناراً جزائرياً',
      fractionSingular: 'سنتيم',
      fractionPlural: 'سنتيمات'
    }
  },
  SAR: {
    nameAr: 'ريال سعودي',
    rules: {
      singular: 'ريال سعودي',
      dual: 'ريالان سعوديان',
      plural: 'ريالات سعودية',
      accusative: 'ريالاً سعودياً',
      fractionSingular: 'هللة',
      fractionPlural: 'هللات'
    }
  },
  AED: {
    nameAr: 'درهم إماراتي',
    rules: {
      singular: 'درهم إماراتي',
      dual: 'درهمان إماراتيان',
      plural: 'دراهم إماراتية',
      accusative: 'درهماً إماراتياً',
      fractionSingular: 'فلس',
      fractionPlural: 'فلوس'
    }
  },
  MAD: {
    nameAr: 'درهم مغربي',
    rules: {
      singular: 'درهم مغربي',
      dual: 'درهمان مغربيان',
      plural: 'دراهم مغربية',
      accusative: 'درهماً مغربياً',
      fractionSingular: 'سنتيم',
      fractionPlural: 'سنتيمات'
    }
  },
  EGP: {
    nameAr: 'جنيه مصري',
    rules: {
      singular: 'جنيه مصري',
      dual: 'جنيعان مصريان',
      plural: 'جنيهات مصرية',
      accusative: 'جنيهًا مصريًا',
      fractionSingular: 'قرش',
      fractionPlural: 'قروش'
    }
  },
  TND: {
    nameAr: 'دينار تونسي',
    rules: {
      singular: 'دينار تونسي',
      dual: 'ديناران تونسيبان',
      plural: 'دنانير تونسية',
      accusative: 'ديناراً تونسياً',
      fractionSingular: 'ميليم',
      fractionPlural: 'ميليمات'
    }
  },
  USD: {
    nameAr: 'دولار أمريكي',
    rules: {
      singular: 'دولار أمريكي',
      dual: 'دولاران أمريكيان',
      plural: 'دولارات أمريكية',
      accusative: 'دولاراً أمريكياً',
      fractionSingular: 'سنت',
      fractionPlural: 'سنتات'
    }
  },
  EUR: {
    nameAr: 'يورو',
    rules: {
      singular: 'يورو',
      dual: 'يوروان',
      plural: 'يوروهات',
      accusative: 'يورو',
      fractionSingular: 'سنت',
      fractionPlural: 'سنتات'
    }
  },
  QAR: {
    nameAr: 'ريال قطري',
    rules: {
      singular: 'ريال قطري',
      dual: 'ريالان قطريان',
      plural: 'ريالات قطرية',
      accusative: 'ريالاً قطرياً',
      fractionSingular: 'درهم',
      fractionPlural: 'دراهم'
    }
  },
  KWD: {
    nameAr: 'دينار كويتي',
    rules: {
      singular: 'دينار كويتي',
      dual: 'ديناران كويتيان',
      plural: 'دنانير كويتية',
      accusative: 'ديناراً كويتياً',
      fractionSingular: 'فلس',
      fractionPlural: 'فلوس'
    }
  },
  LYD: {
    nameAr: 'دينار ليبي',
    rules: {
      singular: 'دينار ليبي',
      dual: 'ديناران ليبيان',
      plural: 'دنانير ليبية',
      accusative: 'ديناراً ليبياً',
      fractionSingular: 'درهم',
      fractionPlural: 'دراهم'
    }
  },
  JOD: {
    nameAr: 'دينار أردني',
    rules: {
      singular: 'دينار أردني',
      dual: 'ديناران أردنيان',
      plural: 'دنانير أردنية',
      accusative: 'ديناراً أردنياً',
      fractionSingular: 'قرش',
      fractionPlural: 'قروش'
    }
  },
  IQD: {
    nameAr: 'دينار عراقي',
    rules: {
      singular: 'دينار عراقي',
      dual: 'ديناران عراقيان',
      plural: 'دنانير عراقية',
      accusative: 'ديناراً عراقياً',
      fractionSingular: 'فلس',
      fractionPlural: 'فلوس'
    }
  },
  OMR: {
    nameAr: 'ريال عماني',
    rules: {
      singular: 'ريال عماني',
      dual: 'ريالان عمانيان',
      plural: 'ريالات عمانية',
      accusative: 'ريالاً عمانياً',
      fractionSingular: 'بيسة',
      fractionPlural: 'بيسات'
    }
  },
  BHD: {
    nameAr: 'دينار بحريني',
    rules: {
      singular: 'دينار بحريني',
      dual: 'ديناران بحرينيان',
      plural: 'دنانير بحرينية',
      accusative: 'ديناراً بحرينياً',
      fractionSingular: 'فلس',
      fractionPlural: 'فلوس'
    }
  },
  TRY: {
    nameAr: 'ليرة تركية',
    rules: {
      singular: 'ليرة تركية',
      dual: 'ليرتان تركيتان',
      plural: 'ليرات تركية',
      accusative: 'ليرة تركية',
      fractionSingular: 'قرش',
      fractionPlural: 'قروش'
    }
  },
  GBP: {
    nameAr: 'جنيه استرليني',
    rules: {
      singular: 'جنيه استرليني',
      dual: 'جنيعان استرلينيان',
      plural: 'جنيهات استرلينية',
      accusative: 'جنيهًا استرلينيًا',
      fractionSingular: 'بنس',
      fractionPlural: 'بنسات'
    }
  }
};

const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const TEENS = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسعمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function convertGroup(n: number): string {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const remainder = n % 100;
  const parts: string[] = [];

  if (h > 0) parts.push(HUNDREDS[h]);

  if (remainder > 0) {
    if (remainder < 10) {
      parts.push(ONES[remainder]);
    } else if (remainder < 20) {
      parts.push(TEENS[remainder - 10]);
    } else {
      const tensDigit = Math.floor(remainder / 10);
      const onesDigit = remainder % 10;
      if (onesDigit > 0) {
        parts.push(`${ONES[onesDigit]} و${TENS[tensDigit]}`);
      } else {
        parts.push(TENS[tensDigit]);
      }
    }
  }
  return parts.join(' و');
}

export function tafqeetNumber(num: number): string {
  if (num === 0) return 'صفر';
  const integerPart = Math.floor(Math.abs(num));
  if (integerPart === 0) return 'صفر';

  const millions = Math.floor(integerPart / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const ones = integerPart % 1000;

  const parts: string[] = [];

  // Millions
  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(`${convertGroup(millions)} ملايين`);
    else parts.push(`${convertGroup(millions)} مليون`);
  }

  // Thousands
  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(`${convertGroup(thousands)} آلاف`);
    else parts.push(`${convertGroup(thousands)} ألف`);
  }

  // Ones
  if (ones > 0) {
    parts.push(convertGroup(ones));
  }

  return parts.join(' و');
}

/**
 * Main Tafqeet Currency Function (تفقيط المبالغ المالية بالعربية)
 */
export function tafqeetCurrency(amount: number, currencyCode: string = 'DZD'): string {
  const currencyInfo = CURRENCY_DICTIONARY[currencyCode] || CURRENCY_DICTIONARY.DZD;
  const rules = currencyInfo.rules;

  const amountNumber = Math.abs(amount);
  const integerPart = Math.floor(amountNumber);
  const fractionPart = Math.round((amountNumber - integerPart) * 100);

  const parts: string[] = [];

  if (integerPart > 0) {
    const textNum = tafqeetNumber(integerPart);
    if (integerPart === 1) {
      parts.push(rules.singular);
    } else if (integerPart === 2) {
      parts.push(rules.dual);
    } else if (integerPart >= 3 && integerPart <= 10) {
      parts.push(`${textNum} ${rules.plural}`);
    } else {
      parts.push(`${textNum} ${rules.accusative}`);
    }
  }

  if (fractionPart > 0) {
    const textFrac = tafqeetNumber(fractionPart);
    const fracSuffix = fractionPart > 2 ? rules.fractionPlural : rules.fractionSingular;
    parts.push(`و${textFrac} ${fracSuffix}`);
  }

  return parts.length > 0 ? parts.join(' ') : `صفر ${rules.singular}`;
}
