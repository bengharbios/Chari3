import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const countryCode = req.nextUrl.searchParams.get('countryCode') || 'DZ';
    const storeId = req.nextUrl.searchParams.get('storeId');
    const sellerId = req.nextUrl.searchParams.get('sellerId');

    // Fallback static data for Algeria (58 wilayas) used when DB is not seeded
    const ALGERIAN_WILAYAS_STATIC = [
      { code: '1', nameAr: 'أدرار', nameEn: 'Adrar', defaultPrice: 1200 },
      { code: '2', nameAr: 'الشلف', nameEn: 'Chlef', defaultPrice: 600 },
      { code: '3', nameAr: 'الأغواط', nameEn: 'Laghouat', defaultPrice: 800 },
      { code: '4', nameAr: 'أم البواقي', nameEn: 'Oum El Bouaghi', defaultPrice: 700 },
      { code: '5', nameAr: 'باتنة', nameEn: 'Batna', defaultPrice: 600 },
      { code: '6', nameAr: 'بجاية', nameEn: 'Bejaia', defaultPrice: 500 },
      { code: '7', nameAr: 'بسكرة', nameEn: 'Biskra', defaultPrice: 800 },
      { code: '8', nameAr: 'بشار', nameEn: 'Bechar', defaultPrice: 1000 },
      { code: '9', nameAr: 'البليدة', nameEn: 'Blida', defaultPrice: 400 },
      { code: '10', nameAr: 'البويرة', nameEn: 'Bouira', defaultPrice: 500 },
      { code: '11', nameAr: 'تمنراست', nameEn: 'Tamanrasset', defaultPrice: 1500 },
      { code: '12', nameAr: 'تبسة', nameEn: 'Tebessa', defaultPrice: 700 },
      { code: '13', nameAr: 'تلمسان', nameEn: 'Tlemcen', defaultPrice: 600 },
      { code: '14', nameAr: 'تيارت', nameEn: 'Tiaret', defaultPrice: 600 },
      { code: '15', nameAr: 'تيزي وزو', nameEn: 'Tizi Ouzou', defaultPrice: 500 },
      { code: '16', nameAr: 'الجزائر العاصمة', nameEn: 'Algiers', defaultPrice: 300 },
      { code: '17', nameAr: 'الجلفة', nameEn: 'Djelfa', defaultPrice: 700 },
      { code: '18', nameAr: 'جيجل', nameEn: 'Jijel', defaultPrice: 600 },
      { code: '19', nameAr: 'سطيف', nameEn: 'Setif', defaultPrice: 500 },
      { code: '20', nameAr: 'سعيدة', nameEn: 'Saida', defaultPrice: 700 },
      { code: '21', nameAr: 'سكيكدة', nameEn: 'Skikda', defaultPrice: 600 },
      { code: '22', nameAr: 'سيدي بلعباس', nameEn: 'Sidi Bel Abbes', defaultPrice: 600 },
      { code: '23', nameAr: 'عنابة', nameEn: 'Annaba', defaultPrice: 500 },
      { code: '24', nameAr: 'قالمة', nameEn: 'Guelma', defaultPrice: 600 },
      { code: '25', nameAr: 'قسنطينة', nameEn: 'Constantine', defaultPrice: 500 },
      { code: '26', nameAr: 'المدية', nameEn: 'Medea', defaultPrice: 500 },
      { code: '27', nameAr: 'مستغانم', nameEn: 'Mostaganem', defaultPrice: 600 },
      { code: '28', nameAr: 'المسيلة', nameEn: "M'Sila", defaultPrice: 600 },
      { code: '29', nameAr: 'معسكر', nameEn: 'Mascara', defaultPrice: 600 },
      { code: '30', nameAr: 'ورقلة', nameEn: 'Ouargla', defaultPrice: 900 },
      { code: '31', nameAr: 'وهران', nameEn: 'Oran', defaultPrice: 500 },
      { code: '32', nameAr: 'البيض', nameEn: 'El Bayadh', defaultPrice: 800 },
      { code: '33', nameAr: 'إليزي', nameEn: 'Illizi', defaultPrice: 1500 },
      { code: '34', nameAr: 'برج بوعريريج', nameEn: 'Bordj Bou Arreridj', defaultPrice: 500 },
      { code: '35', nameAr: 'بومرداس', nameEn: 'Boumerdes', defaultPrice: 400 },
      { code: '36', nameAr: 'الطارف', nameEn: 'El Tarf', defaultPrice: 600 },
      { code: '37', nameAr: 'تيندوف', nameEn: 'Tindouf', defaultPrice: 1500 },
      { code: '38', nameAr: 'تيسمسيلت', nameEn: 'Tissemsilt', defaultPrice: 600 },
      { code: '39', nameAr: 'الوادي', nameEn: 'El Oued', defaultPrice: 800 },
      { code: '40', nameAr: 'خنشلة', nameEn: 'Khenchela', defaultPrice: 700 },
      { code: '41', nameAr: 'سوق أهراس', nameEn: 'Souk Ahras', defaultPrice: 700 },
      { code: '42', nameAr: 'تيبازة', nameEn: 'Tipaza', defaultPrice: 400 },
      { code: '43', nameAr: 'ميلة', nameEn: 'Mila', defaultPrice: 500 },
      { code: '44', nameAr: 'عين الدفلى', nameEn: 'Ain Defla', defaultPrice: 500 },
      { code: '45', nameAr: 'النعامة', nameEn: 'Naama', defaultPrice: 900 },
      { code: '46', nameAr: 'عين تموشنت', nameEn: 'Ain Temouchent', defaultPrice: 600 },
      { code: '47', nameAr: 'غرداية', nameEn: 'Ghardaia', defaultPrice: 900 },
      { code: '48', nameAr: 'غليزان', nameEn: 'Relizane', defaultPrice: 600 },
      { code: '49', nameAr: 'تيميمون', nameEn: 'Timimoun', defaultPrice: 1200 },
      { code: '50', nameAr: 'برج باجي مختار', nameEn: 'Bordj Badji Mokhtar', defaultPrice: 1500 },
      { code: '51', nameAr: 'أولاد جلال', nameEn: 'Ouled Djellal', defaultPrice: 800 },
      { code: '52', nameAr: 'بني عباس', nameEn: 'Beni Abbes', defaultPrice: 1200 },
      { code: '53', nameAr: 'عين صالح', nameEn: 'In Salah', defaultPrice: 1500 },
      { code: '54', nameAr: 'عين قزام', nameEn: 'In Guezzam', defaultPrice: 1500 },
      { code: '55', nameAr: 'تقرت', nameEn: 'Touggourt', defaultPrice: 900 },
      { code: '56', nameAr: 'جانت', nameEn: 'Djanet', defaultPrice: 1500 },
      { code: '57', nameAr: 'المغير', nameEn: "El M'Ghair", defaultPrice: 800 },
      { code: '58', nameAr: 'المنيعة', nameEn: 'El Meniaa', defaultPrice: 900 },
    ];

    // 1. Find the Country
    const country = await db.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      // Fallback: Return static Algerian wilayas when DB country not found
      const fallbackStates = ALGERIAN_WILAYAS_STATIC.map(w => ({
        id: w.code, code: w.code, nameAr: w.nameAr, nameEn: w.nameEn,
        defaultPrice: w.defaultPrice, price: w.defaultPrice, isCustomPrice: false, isHidden: false,
      }));
      return NextResponse.json({
        success: true,
        country: { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', currency: 'DZD', phonePrefix: '+213' },
        shipping: { enabled: true, standardPrice: 500, expressPrice: 800, freeThreshold: 15000 },
        states: fallbackStates,
      });
    }

    // 2. Find States for this Country
    const statesFromDb = await db.state.findMany({
      where: {
        countryId: country.id,
        isActive: true,
      },
      orderBy: {
        code: 'asc',
      },
    });

    // Use fallback if DB has no states seeded
    const states = statesFromDb.length > 0 ? statesFromDb : ALGERIAN_WILAYAS_STATIC.map(w => ({
      id: w.code, code: w.code, nameAr: w.nameAr, nameEn: w.nameEn,
      countryId: country.id, defaultPrice: w.defaultPrice, isActive: true,
    }));

    // 3. If storeId or sellerId is provided, load the custom overridden rates
    let customRates: Record<string, number> = {};
    let hiddenWilayas: string[] = [];
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
          if (rates.hiddenWilayas) hiddenWilayas = rates.hiddenWilayas;
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
      const isHidden = hiddenWilayas.includes(state.code);
      return {
        id: state.code, // Keep "id" matching the old static schema (which uses string codes like '16', '1' etc.)
        code: state.code,
        nameAr: state.nameAr,
        nameEn: state.nameEn,
        defaultPrice: state.defaultPrice,
        price,
        isCustomPrice: hasCustom,
        isHidden,
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
