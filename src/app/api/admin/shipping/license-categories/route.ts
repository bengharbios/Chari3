import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getLicenseCategories, LicenseCategory, COUNTRY_LICENSE_PRESETS } from '@/lib/driver-licenses';

export const dynamic = 'force-dynamic';

// GET /api/admin/shipping/license-categories?countryCode=DZ
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryCode = (searchParams.get('countryCode') || 'DZ').toUpperCase();

    // Check if custom overrides exist in PlatformSettings
    const settings = await db.platformSettings.findUnique({
      where: { id: 'global' },
    });

    let customCategories: LicenseCategory[] | null = null;
    if (settings?.licenseCategoriesConfig) {
      try {
        const allCustoms = JSON.parse(settings.licenseCategoriesConfig);
        if (allCustoms && allCustoms[countryCode]) {
          customCategories = allCustoms[countryCode];
        }
      } catch (err) {}
    }

    const categories = getLicenseCategories(countryCode, customCategories || undefined);

    return NextResponse.json({
      success: true,
      countryCode,
      isCustomized: !!customCategories,
      categories,
      availablePresets: Object.keys(COUNTRY_LICENSE_PRESETS),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch license categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/shipping/license-categories
// Body: { countryCode: "SA", categories: [...] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { countryCode, categories } = body;

    if (!countryCode || !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, error: 'countryCode and categories array are required' },
        { status: 400 }
      );
    }

    const upperCountry = countryCode.toUpperCase();

    // Get current global settings
    const settings = await db.platformSettings.findUnique({
      where: { id: 'global' },
    });

    let allCustoms: Record<string, LicenseCategory[]> = {};
    if (settings?.licenseCategoriesConfig) {
      try {
        allCustoms = JSON.parse(settings.licenseCategoriesConfig);
      } catch (err) {}
    }

    // Save updated categories for the specific country
    allCustoms[upperCountry] = categories;

    await db.platformSettings.upsert({
      where: { id: 'global' },
      update: {
        licenseCategoriesConfig: JSON.stringify(allCustoms),
      },
      create: {
        id: 'global',
        licenseCategoriesConfig: JSON.stringify(allCustoms),
      },
    });

    return NextResponse.json({
      success: true,
      countryCode: upperCountry,
      message: `License categories for ${upperCountry} updated successfully.`,
      categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save license categories' },
      { status: 500 }
    );
  }
}
