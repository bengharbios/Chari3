// ============================================
// DRIVER LICENSE CATEGORIES SYSTEM
// Multi-Country Licensing Engine (Algeria Official, GCC, EU, Egypt & Custom Admin Overrides)
// Article 180 of Executive Decree 04-381 (Algeria) + Global Standards
// ============================================

export interface LicenseCategory {
  code: string;
  nameAr: string;
  nameEn: string;
  nameFr?: string;
  descriptionAr: string;
  descriptionEn: string;
  allowedVehicles: string[]; // 'motorcycle', 'trike', 'quad', 'car', 'van', 'truck_light', 'truck_heavy', 'bus', 'trailer', 'adapted'
  maxWeightTons?: number;
  maxPassengers?: number;
}

export interface CountryLicenseConfig {
  countryCode: string;
  countryNameAr: string;
  countryNameEn: string;
  categories: LicenseCategory[];
}

// 🇩🇿 ALGERIA OFFICIAL LICENSE CATEGORIES (Article 180 - Executive Decree 04-381)
export const ALGERIA_LICENSES: LicenseCategory[] = [
  {
    code: 'A1',
    nameAr: 'أ1 (A1) - دراجات نارية خفيفة وثلاثية/رباعية العجلات',
    nameEn: 'A1 - Light Motorcycles & Trikes/Quads',
    nameFr: 'A1 - Motocyclettes légères et triquadricycles',
    descriptionAr: 'الدراجات النارية من الصنف أ (أسطوانة 50 - 80 سم³) والدراجات الثلاثية والرباعية العجلات (أسطوانة ≤ 125 سم³).',
    descriptionEn: 'Light motorcycles (50-80cc) and motor trikes/quads (engine displacement ≤ 125cc).',
    allowedVehicles: ['motorcycle', 'trike', 'quad', 'scooter'],
    maxWeightTons: 0.5,
  },
  {
    code: 'A2',
    nameAr: 'أ2 (A2) - دراجات نارية متوسطة وثقيلة (ب و ج)',
    nameEn: 'A2 - Medium & Heavy Motorcycles',
    nameFr: 'A2 - Motocyclettes moyennes et lourdes',
    descriptionAr: 'الدراجات النارية من الصنف ب (أسطوانة 80 - 400 سم³) والصنف ج (أكثر من 400 سم³).',
    descriptionEn: 'Medium motorcycles (80-400cc) and heavy motorcycles (> 400cc).',
    allowedVehicles: ['motorcycle', 'trike', 'quad', 'scooter'],
    maxWeightTons: 0.8,
  },
  {
    code: 'B',
    nameAr: 'ب (B) - السيارات ومركبات التوصيل الخفيفة (< 3.5 طن)',
    nameEn: 'B - Passenger Cars & Light Freight (< 3.5 Tons)',
    nameFr: 'B - Véhicules légers et utilitaires (< 3.5 tonnes)',
    descriptionAr: 'السيارات الأقل من 10 مقاعد والمركبات النفعية التي يكون وزنها الإجمالي مع الحمولة أقل من 3.5 طن.',
    descriptionEn: 'Passenger vehicles (< 10 seats) and light delivery vans under 3.5 tons total weight.',
    allowedVehicles: ['car', 'van', 'pickup', 'light_utility'],
    maxWeightTons: 3.5,
    maxPassengers: 9,
  },
  {
    code: 'C1',
    nameAr: 'ج1 (C1) - شاحنات نقل البضائع المتوسطة (3.5 طن - 19 طن)',
    nameEn: 'C1 - Medium Freight Trucks (3.5t - 19t)',
    nameFr: 'C1 - Camions de transport moyens (3.5t à 19t)',
    descriptionAr: 'تسمح بقيادة المركبات المنفردة المخصصة لنقل البضائع التي يكون وزنها الإجمالي بين 3.5 طن و 19 طن.',
    descriptionEn: 'Single transport vehicles for goods between 3.5 tons and 19 tons total gross weight.',
    allowedVehicles: ['truck_light', 'truck_medium', 'box_truck'],
    maxWeightTons: 19,
  },
  {
    code: 'C2',
    nameAr: 'ج2 (C2) - الشاحنات الثقيلة والمقطورات (> 19 طن)',
    nameEn: 'C2 - Heavy Freight Trucks & Articulated (> 19t)',
    nameFr: 'C2 - Poids lourds et véhicules articulés (> 19t)',
    descriptionAr: 'تسمح بقيادة مركبات نقل البضائع التي يتجاوز وزنها 19 طن (منفردة) أو يتجاوز 12.5 طن (مركبة جارة أو متمفصلة).',
    descriptionEn: 'Heavy freight vehicles exceeding 19 tons (single) or exceeding 12.5 tons (articulated/towing).',
    allowedVehicles: ['truck_heavy', 'articulated_truck', 'trailer_truck'],
    maxWeightTons: 40,
  },
  {
    code: 'D',
    nameAr: 'د (D) - مركبات النقل الجماعي والحافلات (> 9 مقاعد)',
    nameEn: 'D - Passenger Buses & Mass Transit (> 9 Seats)',
    nameFr: 'D - Transport en commun et bus (> 9 places)',
    descriptionAr: 'سيارات النقل العام للأشخاص (أكثر من 9 مقاعد) أو التي يتجاوز وزنها الإجمالي مع الحمولة 3.5 طن.',
    descriptionEn: 'Mass passenger transport vehicles (> 9 seats) or gross weight exceeding 3.5 tons.',
    allowedVehicles: ['bus', 'minibus', 'van_passenger'],
    maxPassengers: 50,
  },
  {
    code: 'E',
    nameAr: 'هـ (E) - المقطورات الكبيرة (> 750 كغ) للأصناف (ب - ج - د)',
    nameEn: 'E - Heavy Trailers (> 750kg) for B, C, D',
    nameFr: 'E - Remorques lourdes (> 750kg) pour B, C, D',
    descriptionAr: 'السيارات من الصنف (ب - ج - د) التي تجر مقطورة وزنها أكبر من 750 كلغ.',
    descriptionEn: 'Vehicles of categories B, C, D towing a trailer exceeding 750 kg.',
    allowedVehicles: ['trailer_heavy', 'car_trailer', 'truck_trailer'],
  },
  {
    code: 'F',
    nameAr: 'و (F) - السيارات المهيأة خصيصاً لذوي الإعاقة والمعطوبين',
    nameEn: 'F - Adapted Vehicles for Disabled Drivers',
    nameFr: 'F - Véhicules aménagés pour personnes handicapées',
    descriptionAr: 'السيارات من الصنف أ1 أو أ2 أو ب التي يسوقها المعطوبون والمهيأة خصيصاً لمراعاة إعاقتهم.',
    descriptionEn: 'Specially adapted vehicles of category A1, A2, or B for drivers with physical disabilities.',
    allowedVehicles: ['adapted', 'car_adapted', 'scooter_adapted'],
  },
];

// 🇸🇦 SAUDI ARABIA OFFICIAL LICENSE CATEGORIES
export const SAUDI_LICENSES: LicenseCategory[] = [
  {
    code: 'SA_MOTO',
    nameAr: 'رخصة قيادة دراجة نارية',
    nameEn: 'Motorcycle License',
    descriptionAr: 'قيادة الدراجات النارية العادية والسكوتر لتوصيل الطلبات السريعة.',
    descriptionEn: 'Motorcycles and delivery scooters.',
    allowedVehicles: ['motorcycle', 'scooter', 'trike'],
  },
  {
    code: 'SA_PRIVATE',
    nameAr: 'رخصة قيادة خاصة (سيارات ووانيتات)',
    nameEn: 'Private Driving License',
    descriptionAr: 'قيادة السيارات الخاصة ومركبات النقل الخفيف والوانيت حتى 3.5 طن.',
    descriptionEn: 'Private passenger cars and light commercial pickups under 3.5 tons.',
    allowedVehicles: ['car', 'van', 'pickup'],
    maxWeightTons: 3.5,
  },
  {
    code: 'SA_HEAVY_FREIGHT',
    nameAr: 'رخصة قيادة نقل ثقيل (شاحنات ومعدات)',
    nameEn: 'Heavy Freight Transport License',
    descriptionAr: 'قيادة شاحنات النقل المتوسط والثقيل والتريلات لنقل البضائع.',
    descriptionEn: 'Heavy trucks, trailers, and commercial cargo haulers.',
    allowedVehicles: ['truck_light', 'truck_medium', 'truck_heavy', 'articulated_truck'],
  },
  {
    code: 'SA_PUBLIC_BUS',
    nameAr: 'رخصة قيادة حافلات ونقل عام',
    nameEn: 'Public Bus Driving License',
    descriptionAr: 'قيادة الحافلات ووسائط النقل الجماعي.',
    descriptionEn: 'Buses and mass passenger transit.',
    allowedVehicles: ['bus', 'minibus'],
  },
];

// 🇦🇪 UAE OFFICIAL LICENSE CATEGORIES
export const UAE_LICENSES: LicenseCategory[] = [
  {
    code: 'CAT_1',
    nameAr: 'الفئة 1 - دراجة نارية (Category 1 - Motorcycle)',
    nameEn: 'Category 1 - Motorcycle',
    descriptionAr: 'قيادة الدراجات النارية ومترددات التوصيل.',
    descriptionEn: 'Motorcycles and delivery bikes.',
    allowedVehicles: ['motorcycle', 'scooter'],
  },
  {
    code: 'CAT_3',
    nameAr: 'الفئة 3 - مركبة خفيفة (Category 3 - Light Vehicle)',
    nameEn: 'Category 3 - Light Vehicle',
    descriptionAr: 'السيارات الخاصة والفانات الخفيفة للتوصيل المحلي.',
    descriptionEn: 'Light passenger cars and commercial vans under 2.5 tons.',
    allowedVehicles: ['car', 'van', 'pickup'],
    maxWeightTons: 3.5,
  },
  {
    code: 'CAT_4',
    nameAr: 'الفئة 4 - شاحنة ثقيلة (Category 4 - Heavy Truck)',
    nameEn: 'Category 4 - Heavy Truck',
    descriptionAr: 'الشاحنات والمركبات الثقيلة لنقل البضائع.',
    descriptionEn: 'Heavy trucks and commercial transport vehicles.',
    allowedVehicles: ['truck_medium', 'truck_heavy'],
  },
  {
    code: 'CAT_5',
    nameAr: 'الفئة 5 - حافلة خفيفة (Category 5 - Light Bus)',
    nameEn: 'Category 5 - Light Bus',
    descriptionAr: 'الحافلات الخفيفة المخصصة لنقل الأشخاص حتى 26 ركاب.',
    descriptionEn: 'Light buses up to 26 passengers.',
    allowedVehicles: ['minibus', 'van_passenger'],
  },
];

// 🇫🇷 FRANCE & EU OFFICIAL LICENSE CATEGORIES
export const FRANCE_LICENSES: LicenseCategory[] = [
  {
    code: 'AM',
    nameAr: 'AM - cyclomoteur (< 50 cm³)',
    nameEn: 'AM - Moped & Light Quadricycle',
    nameFr: 'AM - Cyclomoteur et quadricycle léger',
    descriptionAr: 'الدراجات الخفيفة جداً أقل من 50 سم³.',
    descriptionEn: 'Mopeds and light quadricycles under 50cc.',
    allowedVehicles: ['scooter', 'moped'],
  },
  {
    code: 'A1_EU',
    nameAr: 'A1 - Motocyclette légère (≤ 125 cm³)',
    nameEn: 'A1 - Light Motorcycle (≤ 125cc)',
    nameFr: 'A1 - Motocyclette légère (≤ 125 cm³)',
    descriptionAr: 'الدراجات النارية الخفيفة حتى 125 سم³.',
    descriptionEn: 'Light motorcycles up to 125cc.',
    allowedVehicles: ['motorcycle', 'scooter'],
  },
  {
    code: 'B_EU',
    nameAr: 'B - Véhicule léger (< 3.5t)',
    nameEn: 'B - Passenger Cars & Vans (< 3.5t)',
    nameFr: 'B - Véhicules légers et utilitaires (< 3.5t)',
    descriptionAr: 'السيارات والفانات الخفيفة أقل من 3.5 طن.',
    descriptionEn: 'Passenger cars and light utility vans under 3.5t.',
    allowedVehicles: ['car', 'van', 'pickup'],
    maxWeightTons: 3.5,
  },
  {
    code: 'C_EU',
    nameAr: 'C - Poids lourd (> 3.5t)',
    nameEn: 'C - Heavy Freight (> 3.5t)',
    nameFr: 'C - Poids lourd (> 3.5t)',
    descriptionAr: 'الشاحنات لنقل البضائع أكبر من 3.5 طن.',
    descriptionEn: 'Heavy goods transport vehicles exceeding 3.5t.',
    allowedVehicles: ['truck_medium', 'truck_heavy'],
  },
];

// 🌐 INTERNATIONAL / GLOBAL DEFAULT CATEGORIES (Fallback for any country)
export const GLOBAL_LICENSES: LicenseCategory[] = [
  {
    code: 'A',
    nameAr: 'أ (A) - جميع أصناف الدراجات النارية',
    nameEn: 'A - All Motorcycle Types',
    descriptionAr: 'دراجات نارية للتوصيل السريع (خفيفة ومتوسطة وثقيلة).',
    descriptionEn: 'Motorcycles for courier and express delivery.',
    allowedVehicles: ['motorcycle', 'scooter', 'trike', 'quad'],
  },
  {
    code: 'B',
    nameAr: 'ب (B) - السيارات والمركبات النفعية الخفيفة',
    nameEn: 'B - Private Cars & Light Delivery Vans',
    descriptionAr: 'سيارات وسيارة الفان لنقل البضائع الخفيفة والتوصيل المحلي.',
    descriptionEn: 'Private passenger cars and light commercial delivery vans.',
    allowedVehicles: ['car', 'van', 'pickup'],
    maxWeightTons: 3.5,
  },
  {
    code: 'C',
    nameAr: 'ج (C) - الشاحنات ونقل البضائع الثقيلة',
    nameEn: 'C - Commercial Trucks & Heavy Freight',
    descriptionAr: 'شاحنات النقل المتوسط والثقيل للبضائع والطرود الكبيرة.',
    descriptionEn: 'Commercial trucks and heavy freight transport.',
    allowedVehicles: ['truck_light', 'truck_medium', 'truck_heavy'],
  },
  {
    code: 'D',
    nameAr: 'د (D) - الحافلات ونقل الأشخاص',
    nameEn: 'D - Buses & Passenger Transit',
    descriptionAr: 'حافلات ومركبات النقل الجماعي.',
    descriptionEn: 'Buses and passenger transit vehicles.',
    allowedVehicles: ['bus', 'minibus'],
  },
  {
    code: 'E',
    nameAr: 'هـ (E) - الشاحنات المتمفصلة والمقطورات',
    nameEn: 'E - Articulated Vehicles & Heavy Trailers',
    descriptionAr: 'شاحنات النقل الدولي والمقطورات الكبيرة.',
    descriptionEn: 'Heavy international freight and trailers.',
    allowedVehicles: ['articulated_truck', 'trailer_truck'],
  },
];

// ============================================
// COUNTRY MAP
// ============================================

export const COUNTRY_LICENSE_PRESETS: Record<string, LicenseCategory[]> = {
  DZ: ALGERIA_LICENSES,
  DZA: ALGERIA_LICENSES,
  SA: SAUDI_LICENSES,
  SAU: SAUDI_LICENSES,
  AE: UAE_LICENSES,
  ARE: UAE_LICENSES,
  FR: FRANCE_LICENSES,
  FRA: FRANCE_LICENSES,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get available license categories for a given country code (DZ, SA, AE, FR, or fallback GLOBAL)
 * Also supports runtime Admin overrides provided via parameter.
 */
export function getLicenseCategories(countryCode?: string, customAdminCategories?: LicenseCategory[]): LicenseCategory[] {
  if (customAdminCategories && Array.isArray(customAdminCategories) && customAdminCategories.length > 0) {
    return customAdminCategories;
  }
  const code = (countryCode || 'DZ').toUpperCase();
  return COUNTRY_LICENSE_PRESETS[code] || GLOBAL_LICENSES;
}

/**
 * Validate if a driver's license category permits driving a specific vehicle type
 */
export function canLicenseDriveVehicle(
  licenseCode: string,
  vehicleType: string,
  countryCode: string = 'DZ',
  customAdminCategories?: LicenseCategory[]
): boolean {
  const categories = getLicenseCategories(countryCode, customAdminCategories);
  const matched = categories.find((c) => c.code.toUpperCase() === licenseCode.toUpperCase());
  if (!matched) return true; // Flexible fallback if unlisted

  const normalizedVehicle = vehicleType.toLowerCase();
  
  return matched.allowedVehicles.some(
    (v) => v.toLowerCase() === normalizedVehicle || normalizedVehicle.includes(v)
  );
}
