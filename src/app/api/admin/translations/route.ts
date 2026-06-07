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

// Built-in language metadata (fallback)
const builtinLanguages = [
  { code: 'ar', name: 'العربية',  nameEn: 'Arabic',   flag: '🇩🇿', direction: 'rtl', isBuiltin: true },
  { code: 'en', name: 'English',  nameEn: 'English',  flag: '🇬🇧', direction: 'ltr', isBuiltin: true },
  { code: 'fr', name: 'Français', nameEn: 'French',   flag: '🇫🇷', direction: 'ltr', isBuiltin: true },
];

// ============================================
// GET — fetch all languages + translations
// ============================================
export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();

    const locale = req.nextUrl.searchParams.get('locale'); // ?locale=ar → get one dict
    const action = req.nextUrl.searchParams.get('action'); // ?action=languages

    // --- Get active language list ---
    const langSetting = await db.systemSetting.findUnique({
      where: { key: 'i18n_languages' },
    });

    const languages: any[] = langSetting?.value
      ? (langSetting.value as any)
      : builtinLanguages;

    if (action === 'languages') {
      return NextResponse.json({ success: true, languages });
    }

    // --- Get single locale dictionary ---
    if (locale) {
      const dictSetting = await db.systemSetting.findUnique({
        where: { key: `i18n_dict_${locale}` },
      });

      const dict = dictSetting?.value
        ? (dictSetting.value as any)
        : (builtinDictionaries[locale] || {});

      return NextResponse.json({ success: true, locale, dict });
    }

    // --- Get ALL dictionaries ---
    const allDicts: Record<string, any> = {};
    for (const lang of languages) {
      const dictSetting = await db.systemSetting.findUnique({
        where: { key: `i18n_dict_${lang.code}` },
      });
      allDicts[lang.code] = dictSetting?.value
        ? (dictSetting.value as any)
        : (builtinDictionaries[lang.code] || {});
    }

    return NextResponse.json({ success: true, languages, dicts: allDicts });
  } catch (error) {
    console.error('[translations GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// ============================================
// POST — save languages list OR a dictionary
// ============================================
export async function POST(req: NextRequest) {
  try {
    await ensureDbConnection();
    const body = await req.json();
    const { action, adminId = 'admin', languages, locale, dict } = body;

    // --- Save language list ---
    if (action === 'save_languages' && languages) {
      await db.systemSetting.upsert({
        where: { key: 'i18n_languages' },
        update: { value: languages, updatedBy: adminId },
        create: { key: 'i18n_languages', value: languages, updatedBy: adminId },
      });
      return NextResponse.json({ success: true, message: 'Languages saved' });
    }

    // --- Save a single dictionary ---
    if (action === 'save_dict' && locale && dict) {
      await db.systemSetting.upsert({
        where: { key: `i18n_dict_${locale}` },
        update: { value: dict, updatedBy: adminId },
        create: { key: `i18n_dict_${locale}`, value: dict, updatedBy: adminId },
      });
      await db.adminAuditLog.create({
        data: {
          adminId,
          action: 'UPDATE_TRANSLATIONS',
          targetId: locale,
          details: { locale, keysCount: Object.keys(dict).length },
        },
      });
      return NextResponse.json({ success: true, message: `Dictionary for '${locale}' saved` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[translations POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// ============================================
// DELETE — remove a language
// ============================================
export async function DELETE(req: NextRequest) {
  try {
    await ensureDbConnection();
    const { locale, adminId = 'admin' } = await req.json();

    if (!locale) {
      return NextResponse.json({ success: false, error: 'locale required' }, { status: 400 });
    }

    // Cannot delete builtins
    if (['ar', 'en', 'fr'].includes(locale)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete built-in languages (ar, en, fr)' },
        { status: 400 }
      );
    }

    // Remove dictionary
    await db.systemSetting.deleteMany({ where: { key: `i18n_dict_${locale}` } });

    // Remove from languages list
    const langSetting = await db.systemSetting.findUnique({
      where: { key: 'i18n_languages' },
    });
    if (langSetting?.value) {
      const langs = (langSetting.value as any[]).filter((l: any) => l.code !== locale);
      await db.systemSetting.update({
        where: { key: 'i18n_languages' },
        data: { value: langs, updatedBy: adminId },
      });
    }

    return NextResponse.json({ success: true, message: `Language '${locale}' deleted` });
  } catch (error) {
    console.error('[translations DELETE]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
