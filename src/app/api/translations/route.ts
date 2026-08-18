import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';
import arDict from '@/lib/i18n/dictionaries/ar.json';
import enDict from '@/lib/i18n/dictionaries/en.json';
import frDict from '@/lib/i18n/dictionaries/fr.json';

export const dynamic = 'force-dynamic';

const builtinDictionaries: Record<string, any> = {
  ar: arDict,
  en: enDict,
  fr: frDict,
};

const builtinLanguages = [
  { code: 'ar', name: 'العربية',  nameEn: 'Arabic',   nameAr: 'العربية',   flag: '🇩🇿', direction: 'rtl', isBuiltin: true },
  { code: 'en', name: 'English',  nameEn: 'English',  nameAr: 'الإنجليزية',  flag: '🇬🇧', direction: 'ltr', isBuiltin: true },
  { code: 'fr', name: 'Français', nameEn: 'French',   nameAr: 'الفرنسية',   flag: '🇫🇷', direction: 'ltr', isBuiltin: true },
];

export async function GET(req: NextRequest) {
  try {
    const locale = req.nextUrl.searchParams.get('locale') || 'ar';

    // --- Get active language list ---
    const langSetting = await db.systemSetting.findUnique({
      where: { key: 'i18n_languages' },
    });

    const rawLanguages: any[] = langSetting?.value
      ? (langSetting.value as any)
      : builtinLanguages;

    const languages = rawLanguages.filter((l: any) => l.isActive !== false);

    // --- Get requested locale dictionary ---
    const dictSetting = await db.systemSetting.findUnique({
      where: { key: `i18n_dict_${locale}` },
    });

    const dict = dictSetting?.value
      ? (dictSetting.value as any)
      : (builtinDictionaries[locale] || {});

    return NextResponse.json({
      success: true,
      languages,
      locale,
      dict,
    });
  } catch (error) {
    console.error('[public translations GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
