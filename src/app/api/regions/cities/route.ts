import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/regions/cities?stateCode=xxx&storeId=yyy&sellerId=zzz&includeInactive=false
export async function GET(req: NextRequest) {
  try {
    const stateCode = req.nextUrl.searchParams.get('stateCode');
    const storeId = req.nextUrl.searchParams.get('storeId');
    const sellerId = req.nextUrl.searchParams.get('sellerId');
    const includeInactive = req.nextUrl.searchParams.get('includeInactive') === 'true';

    if (!stateCode) {
      return NextResponse.json({ success: false, error: 'stateCode parameter is required' }, { status: 400 });
    }

    // 1. Find the State
    const state = await db.state.findFirst({
      where: { code: stateCode },
    });

    if (!state) {
      return NextResponse.json({ success: false, error: 'State not found' }, { status: 404 });
    }

    // 2. Fetch global cities under this state
    const cities = await db.city.findMany({
      where: {
        stateId: state.id,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: {
        nameAr: 'asc',
      },
    });

    // 3. Load custom merchant overrides
    let customCities: Record<string, number> = {};
    let hiddenCities: string[] = [];
    let storeCities: any[] = [];

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
          if (rates.customCities) customCities = rates.customCities;
          if (rates.hiddenCities) hiddenCities = rates.hiddenCities;
          if (rates.storeCities && Array.isArray(rates.storeCities)) {
            // Filter custom store cities that belong to this state
            storeCities = rates.storeCities.filter((c: any) => c.stateId === state.id || c.stateCode === stateCode);
          }
        }
      } catch (e) {
        console.error('Error parsing merchant shipping rates', e);
      }
    }

    // Map global cities with overrides
    const mappedCities = cities.map((city) => {
      const isCustomized = customCities[city.id] !== undefined;
      const isHidden = hiddenCities.includes(city.id);
      const price = isCustomized ? customCities[city.id] : (state.defaultPrice || 500);

      return {
        id: city.id,
        nameAr: city.nameAr,
        nameEn: city.nameEn,
        isActive: city.isActive,
        defaultPrice: state.defaultPrice || 500,
        price,
        isCustomized,
        isHidden,
      };
    });

    // Append store-specific custom cities if not hidden
    const formattedStoreCities = storeCities.map((sc: any) => ({
      id: sc.id || `custom_${Math.random().toString(36).substring(2, 9)}`,
      nameAr: sc.nameAr,
      nameEn: sc.nameEn || sc.nameAr,
      isActive: true,
      defaultPrice: state.defaultPrice || 500,
      price: sc.price || state.defaultPrice || 500,
      isCustomized: true,
      isHidden: false,
      isStoreCustom: true,
    }));

    return NextResponse.json({
      success: true,
      state: {
        id: state.id,
        code: state.code,
        nameAr: state.nameAr,
        nameEn: state.nameEn,
        defaultPrice: state.defaultPrice,
      },
      cities: [...mappedCities, ...formattedStoreCities],
    });
  } catch (error) {
    console.error('[cities GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/regions/cities (Admin Only - Add a municipality globally)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nameAr, nameEn, stateId } = body;

    if (!nameAr || !nameEn || !stateId) {
      return NextResponse.json({ success: false, error: 'nameAr, nameEn, and stateId are required' }, { status: 400 });
    }

    const newCity = await db.city.create({
      data: {
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        stateId,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, city: newCity });
  } catch (error) {
    console.error('[cities POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT /api/regions/cities (Admin Only - Update a municipality globally)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nameAr, nameEn, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (nameAr !== undefined) updateData.nameAr = nameAr.trim();
    if (nameEn !== undefined) updateData.nameEn = nameEn.trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updatedCity = await db.city.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, city: updatedCity });
  } catch (error) {
    console.error('[cities PUT]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/regions/cities (Admin Only - Deactivate a municipality globally)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    // Soft delete / Toggle active state to inactive
    const deactivatedCity = await db.city.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, city: deactivatedCity });
  } catch (error) {
    console.error('[cities DELETE]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
