import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const countryCode = req.nextUrl.searchParams.get('countryCode') || 'DZ';
    const storeId = req.nextUrl.searchParams.get('storeId');
    const sellerId = req.nextUrl.searchParams.get('sellerId');

    // 1. Find the Country
    const country = await db.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      return NextResponse.json({ success: false, error: 'Country not found' }, { status: 404 });
    }

    // 2. Find States for this Country
    const states = await db.state.findMany({
      where: {
        countryId: country.id,
        isActive: true,
      },
      orderBy: {
        code: 'asc',
      },
    });

    // 3. If storeId or sellerId is provided, load the custom overridden rates
    let customRates: Record<string, number> = {};
    let standardPrice = 500;
    let expressPrice = 800;
    let freeThreshold = 15000;
    let shippingEnabled = true;

    let profile: any = null;
    if (storeId) {
      profile = await db.store.findUnique({
        where: { id: storeId },
        select: { shippingRates: true },
      });
    } else if (sellerId) {
      profile = await db.sellerProfile.findUnique({
        where: { id: sellerId },
        select: { shippingRates: true },
      });
    }

    if (profile && profile.shippingRates) {
      try {
        const rates = JSON.parse(profile.shippingRates);
        if (rates) {
          shippingEnabled = rates.enabled !== false;
          if (rates.standardPrice !== undefined) standardPrice = rates.standardPrice;
          if (rates.expressPrice !== undefined) expressPrice = rates.expressPrice;
          if (rates.freeThreshold !== undefined) freeThreshold = rates.freeThreshold;
          if (rates.customWilayas) customRates = rates.customWilayas;
        }
      } catch (e) {
        console.error('Error parsing shipping rates', e);
      }
    }

    // Map states with custom prices
    const statesWithPrices = states.map((state) => {
      // If the store has a custom rate for this state.code, use it. Otherwise use the defaultPrice.
      const hasCustom = customRates[state.code] !== undefined;
      const price = hasCustom ? customRates[state.code] : state.defaultPrice;
      return {
        id: state.code, // Keep "id" matching the old static schema (which uses string codes like '16', '1' etc.)
        code: state.code,
        nameAr: state.nameAr,
        nameEn: state.nameEn,
        defaultPrice: state.defaultPrice,
        price,
        isCustomPrice: hasCustom,
      };
    });

    return NextResponse.json({
      success: true,
      country: {
        code: country.code,
        nameAr: country.nameAr,
        nameEn: country.nameEn,
        currency: country.currency,
        phonePrefix: country.phonePrefix,
      },
      shipping: {
        enabled: shippingEnabled,
        standardPrice,
        expressPrice,
        freeThreshold,
      },
      states: statesWithPrices,
    });
  } catch (error) {
    console.error('[states GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
