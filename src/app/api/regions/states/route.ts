import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCountryByCode } from '@/lib/data/countries';

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
      { code: '59', nameAr: 'أفلو', nameEn: 'Aflou', defaultPrice: 800 },
      { code: '60', nameAr: 'الأبيض سيدي الشيخ', nameEn: 'El Abiodh Sidi Cheikh', defaultPrice: 800 },
      { code: '61', nameAr: 'العريشة', nameEn: 'El Aricha', defaultPrice: 800 },
      { code: '62', nameAr: 'القنطرة', nameEn: 'El Kantara', defaultPrice: 800 },
      { code: '63', nameAr: 'بريكة', nameEn: 'Barika', defaultPrice: 800 },
      { code: '64', nameAr: 'بوسعادة', nameEn: 'Bou Saada', defaultPrice: 800 },
      { code: '65', nameAr: 'بير العاتر', nameEn: 'Bir El Ater', defaultPrice: 800 },
      { code: '66', nameAr: 'قصر البخاري', nameEn: 'Ksar El Boukhari', defaultPrice: 800 },
      { code: '67', nameAr: 'قصر الشلالة', nameEn: 'Ksar Chellala', defaultPrice: 800 },
      { code: '68', nameAr: 'عين وسارة', nameEn: 'Ain Oussera', defaultPrice: 800 },
      { code: '69', nameAr: 'مسعد', nameEn: 'Messaad', defaultPrice: 800 },
    ];

    // Static fallbacks for multiple countries when DB is not seeded
    const STATIC_COUNTRIES: Record<string, { country: any; states: Array<{ code: string; nameAr: string; nameEn: string; defaultPrice: number }> }> = {
      DZ: {
        country: { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', currency: 'DZD', phonePrefix: '+213' },
        states: ALGERIAN_WILAYAS_STATIC,
      },
      SA: {
        country: { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia', currency: 'SAR', phonePrefix: '+966' },
        states: [
          { code: '1', nameAr: 'منطقة الرياض', nameEn: 'Riyadh Region', defaultPrice: 30 },
          { code: '2', nameAr: 'منطقة مكة المكرمة', nameEn: 'Makkah Region', defaultPrice: 30 },
          { code: '3', nameAr: 'منطقة المدينة المنورة', nameEn: 'Madinah Region', defaultPrice: 35 },
          { code: '4', nameAr: 'المنطقة الشرقية', nameEn: 'Eastern Province', defaultPrice: 35 },
          { code: '5', nameAr: 'منطقة القصيم', nameEn: 'Al-Qassim Region', defaultPrice: 35 },
          { code: '6', nameAr: 'منطقة عسير', nameEn: 'Aseer Region', defaultPrice: 40 },
          { code: '7', nameAr: 'منطقة تبوك', nameEn: 'Tabuk Region', defaultPrice: 40 },
          { code: '8', nameAr: 'منطقة حائل', nameEn: 'Hail Region', defaultPrice: 40 },
          { code: '9', nameAr: 'منطقة الحدود الشمالية', nameEn: 'Northern Borders Region', defaultPrice: 45 },
          { code: '10', nameAr: 'منطقة جازان', nameEn: 'Jazan Region', defaultPrice: 45 },
          { code: '11', nameAr: 'منطقة نجران', nameEn: 'Najran Region', defaultPrice: 45 },
          { code: '12', nameAr: 'منطقة الباحة', nameEn: 'Al-Baha Region', defaultPrice: 40 },
          { code: '13', nameAr: 'منطقة الجوف', nameEn: 'Al-Jouf Region', defaultPrice: 45 },
        ],
      },
      MA: {
        country: { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', currency: 'MAD', phonePrefix: '+212' },
        states: [
          { code: '1', nameAr: 'جهة طنجة تطوان الحسيمة', nameEn: 'Tanger-Tetouan-Al Hoceima', defaultPrice: 40 },
          { code: '2', nameAr: 'جهة الشرق', nameEn: 'L\'Oriental', defaultPrice: 45 },
          { code: '3', nameAr: 'جهة فاس مكناس', nameEn: 'Fes-Meknes', defaultPrice: 40 },
          { code: '4', nameAr: 'جهة الرباط سلا القنيطرة', nameEn: 'Rabat-Salé-Kénitra', defaultPrice: 35 },
          { code: '5', nameAr: 'جهة بني ملال خنيفرة', nameEn: 'Béni Mellal-Khénifra', defaultPrice: 45 },
          { code: '6', nameAr: 'جهة الدار البيضاء الكبرى سطات', nameEn: 'Casablanca-Settat', defaultPrice: 30 },
          { code: '7', nameAr: 'جهة مراكش أسفي', nameEn: 'Marrakesh-Safi', defaultPrice: 40 },
          { code: '8', nameAr: 'جهة درعة تافيلالت', nameEn: 'Drâa-Tafilalet', defaultPrice: 50 },
          { code: '9', nameAr: 'جهة سوس ماسة', nameEn: 'Souss-Massa', defaultPrice: 45 },
          { code: '10', nameAr: 'جهة كلميم واد نون', nameEn: 'Guelmim-Oued Noun', defaultPrice: 55 },
          { code: '11', nameAr: 'جهة العيون الساقية الحمراء', nameEn: 'Laâyoune-Sakia El Hamra', defaultPrice: 60 },
          { code: '12', nameAr: 'جهة الداخلة وادي الذهب', nameEn: 'Dakhla-Oued Ed-Dahab', defaultPrice: 70 },
        ],
      },
      AE: {
        country: { code: 'AE', nameAr: 'الإمارات', nameEn: 'UAE', currency: 'AED', phonePrefix: '+971' },
        states: [
          { code: '1', nameAr: 'إمارة أبوظبي', nameEn: 'Abu Dhabi', defaultPrice: 25 },
          { code: '2', nameAr: 'إمارة دبي', nameEn: 'Dubai', defaultPrice: 20 },
          { code: '3', nameAr: 'إمارة الشارقة', nameEn: 'Sharjah', defaultPrice: 25 },
          { code: '4', nameAr: 'إمارة عجمان', nameEn: 'Ajman', defaultPrice: 25 },
          { code: '5', nameAr: 'إمارة أم القيوين', nameEn: 'Umm Al Quwain', defaultPrice: 30 },
          { code: '6', nameAr: 'إمارة رأس الخيمة', nameEn: 'Ras Al Khaimah', defaultPrice: 30 },
          { code: '7', nameAr: 'إمارة الفجيرة', nameEn: 'Fujairah', defaultPrice: 35 },
        ],
      },
      EG: {
        country: { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', currency: 'EGP', phonePrefix: '+20' },
        states: [
          { code: '1', nameAr: 'القاهرة', nameEn: 'Cairo', defaultPrice: 50 },
          { code: '2', nameAr: 'الجيزة', nameEn: 'Giza', defaultPrice: 50 },
          { code: '3', nameAr: 'الإسكندرية', nameEn: 'Alexandria', defaultPrice: 60 },
          { code: '4', nameAr: 'الدقهلية', nameEn: 'Dakahlia', defaultPrice: 65 },
          { code: '5', nameAr: 'البحر الأحمر', nameEn: 'Red Sea', defaultPrice: 90 },
          { code: '6', nameAr: 'البحيرة', nameEn: 'Beheira', defaultPrice: 65 },
          { code: '7', nameAr: 'الفيوم', nameEn: 'Faiyum', defaultPrice: 70 },
          { code: '8', nameAr: 'الغربية', nameEn: 'Gharbia', defaultPrice: 65 },
          { code: '9', nameAr: 'الإسماعيلية', nameEn: 'Ismailia', defaultPrice: 65 },
          { code: '10', nameAr: 'المنوفية', nameEn: 'Monufia', defaultPrice: 65 },
          { code: '11', nameAr: 'المنيا', nameEn: 'Minya', defaultPrice: 75 },
          { code: '12', nameAr: 'القليوبية', nameEn: 'Qalyubia', defaultPrice: 55 },
          { code: '13', nameAr: 'الوادي الجديد', nameEn: 'New Valley', defaultPrice: 100 },
          { code: '14', nameAr: 'السويس', nameEn: 'Suez', defaultPrice: 65 },
          { code: '15', nameAr: 'أسوان', nameEn: 'Aswan', defaultPrice: 90 },
          { code: '16', nameAr: 'أسيوط', nameEn: 'Asyut', defaultPrice: 75 },
          { code: '17', nameAr: 'بني سويف', nameEn: 'Beni Suef', defaultPrice: 70 },
          { code: '18', nameAr: 'بورسعيد', nameEn: 'Port Said', defaultPrice: 65 },
          { code: '19', nameAr: 'دمياط', nameEn: 'Damietta', defaultPrice: 65 },
          { code: '20', nameAr: 'الشرقية', nameEn: 'Sharqia', defaultPrice: 65 },
          { code: '21', nameAr: 'جنوب سيناء', nameEn: 'South Sinai', defaultPrice: 100 },
          { code: '22', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', defaultPrice: 65 },
          { code: '23', nameAr: 'مطروح', nameEn: 'Matrouh', defaultPrice: 90 },
          { code: '24', nameAr: 'قنا', nameEn: 'Qena', defaultPrice: 85 },
          { code: '25', nameAr: 'الأقصر', nameEn: 'Luxor', defaultPrice: 85 },
          { code: '26', nameAr: 'سوهاج', nameEn: 'Sohag', defaultPrice: 80 },
          { code: '27', nameAr: 'شمال سيناء', nameEn: 'North Sinai', defaultPrice: 100 },
        ],
      },
      TN: {
        country: { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', currency: 'TND', phonePrefix: '+216' },
        states: [
          { code: '1', nameAr: 'تونس', nameEn: 'Tunis', defaultPrice: 8 },
          { code: '2', nameAr: 'أريانة', nameEn: 'Ariana', defaultPrice: 8 },
          { code: '3', nameAr: 'بن عروس', nameEn: 'Ben Arous', defaultPrice: 8 },
          { code: '4', nameAr: 'منوبة', nameEn: 'Manouba', defaultPrice: 8 },
          { code: '5', nameAr: 'نابل', nameEn: 'Nabeul', defaultPrice: 10 },
          { code: '6', nameAr: 'زغوان', nameEn: 'Zaghouan', defaultPrice: 10 },
          { code: '7', nameAr: 'بنزرت', nameEn: 'Bizerte', defaultPrice: 10 },
          { code: '8', nameAr: 'باجة', nameEn: 'Béja', defaultPrice: 11 },
          { code: '9', nameAr: 'جندوبة', nameEn: 'Jendouba', defaultPrice: 12 },
          { code: '10', nameAr: 'الكاف', nameEn: 'Le Kef', defaultPrice: 12 },
          { code: '11', nameAr: 'سليانة', nameEn: 'Siliana', defaultPrice: 11 },
          { code: '12', nameAr: 'سوسة', nameEn: 'Sousse', defaultPrice: 10 },
          { code: '13', nameAr: 'المنستير', nameEn: 'Monastir', defaultPrice: 10 },
          { code: '14', nameAr: 'المهدية', nameEn: 'Mahdia', defaultPrice: 11 },
          { code: '15', nameAr: 'صفاقس', nameEn: 'Sfax', defaultPrice: 11 },
          { code: '16', nameAr: 'القيروان', nameEn: 'Kairouan', defaultPrice: 11 },
          { code: '17', nameAr: 'القصرين', nameEn: 'Kasserine', defaultPrice: 13 },
          { code: '18', nameAr: 'سيدي بوزيد', nameEn: 'Sidi Bouzid', defaultPrice: 12 },
          { code: '19', nameAr: 'قابس', nameEn: 'Gabès', defaultPrice: 13 },
          { code: '20', nameAr: 'مدنين', nameEn: 'Médenine', defaultPrice: 14 },
          { code: '21', nameAr: 'تطاوين', nameEn: 'Tataouine', defaultPrice: 15 },
          { code: '22', nameAr: 'قفصة', nameEn: 'Gafsa', defaultPrice: 13 },
          { code: '23', nameAr: 'توزر', nameEn: 'Tozeur', defaultPrice: 14 },
          { code: '24', nameAr: 'قبلي', nameEn: 'Kebili', defaultPrice: 14 },
        ],
      },
    };

    // 1. Find the Country in DB
    const country = await db.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      // 1. Check if we have explicit static states for this country (e.g. DZ, SA, MA, AE, EG, TN)
      const explicitFallback = STATIC_COUNTRIES[countryCode];
      if (explicitFallback) {
        const fallbackStates = explicitFallback.states.map(w => ({
          id: w.code, code: w.code, nameAr: w.nameAr, nameEn: w.nameEn,
          defaultPrice: w.defaultPrice, price: w.defaultPrice, isCustomPrice: false, isHidden: false,
        }));
        return NextResponse.json({
          success: true,
          country: explicitFallback.country,
          shipping: { enabled: true, standardPrice: 500, expressPrice: 800, freeThreshold: 15000 },
          states: fallbackStates,
        });
      }

      // 2. Dynamic fallback for any world country!
      const countryInfo = getCountryByCode(countryCode);
      return NextResponse.json({
        success: true,
        country: {
          code: countryInfo.code,
          nameAr: countryInfo.nameAr,
          nameEn: countryInfo.nameEn,
          currency: countryInfo.currency,
          phonePrefix: '+1'
        },
        shipping: { enabled: true, standardPrice: 30, expressPrice: 50, freeThreshold: 500 },
        states: [
          { id: '1', code: '1', nameAr: countryInfo.nameAr, nameEn: countryInfo.nameEn, defaultPrice: 30, price: 30, isCustomPrice: false, isHidden: false }
        ],
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

    // Use country-specific fallback if DB has no states seeded yet for this country
    const explicitFallback = STATIC_COUNTRIES[countryCode];
    const countryInfo = getCountryByCode(countryCode);
    const defaultFallbackStates = explicitFallback 
      ? explicitFallback.states.map(w => ({ id: w.code, code: w.code, nameAr: w.nameAr, nameEn: w.nameEn, countryId: country.id, defaultPrice: w.defaultPrice, isActive: true }))
      : [{ id: '1', code: '1', nameAr: countryInfo.nameAr, nameEn: countryInfo.nameEn, countryId: country.id, defaultPrice: 30, isActive: true }];

    const states = statesFromDb.length > 0 ? statesFromDb : defaultFallbackStates;

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

    // Map states with custom prices and sort numerically by code (1 to 58)
    const statesWithPrices = states.map((state) => {
      const hasCustom = customRates[state.code] !== undefined;
      const price = hasCustom ? customRates[state.code] : state.defaultPrice;
      const isHidden = hiddenWilayas.includes(state.code);
      return {
        id: state.code,
        code: state.code,
        nameAr: state.nameAr,
        nameEn: state.nameEn,
        defaultPrice: state.defaultPrice,
        price,
        isCustomPrice: hasCustom,
        isHidden,
      };
    }).sort((a, b) => {
      const numA = parseInt(a.code, 10);
      const numB = parseInt(b.code, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.code.localeCompare(b.code);
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

// POST /api/regions/states (Admin Only - Add or Update a State / Region globally)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, nameAr, nameEn, defaultPrice, countryCode = 'DZ' } = body;

    if (!code || !nameAr) {
      return NextResponse.json({ success: false, error: 'code and nameAr are required' }, { status: 400 });
    }

    let country = await db.country.findUnique({
      where: { code: countryCode }
    });

    if (!country) {
      country = await db.country.create({
        data: {
          code: countryCode,
          nameAr: countryCode === 'DZ' ? 'الجزائر' : countryCode,
          nameEn: countryCode === 'DZ' ? 'Algeria' : countryCode,
          currency: countryCode === 'DZ' ? 'DZD' : 'USD',
          phonePrefix: countryCode === 'DZ' ? '+213' : '+1',
          isActive: true
        }
      });
    }

    // Upsert state by countryId + code
    const existing = await db.state.findFirst({
      where: { code, countryId: country.id }
    });

    let state;
    if (existing) {
      state = await db.state.update({
        where: { id: existing.id },
        data: {
          nameAr,
          nameEn: nameEn || nameAr,
          defaultPrice: defaultPrice !== undefined ? Number(defaultPrice) : 500,
          isActive: true
        }
      });
    } else {
      state = await db.state.create({
        data: {
          code,
          nameAr,
          nameEn: nameEn || nameAr,
          defaultPrice: defaultPrice !== undefined ? Number(defaultPrice) : 500,
          isActive: true,
          countryId: country.id
        }
      });
    }

    return NextResponse.json({ success: true, state });
  } catch (error) {
    console.error('[states POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
