// ============================================
// DRIVER LICENSE CATEGORIES SYSTEM (International & Algeria Official)
// Article 180 of Executive Decree 04-381 (Algeria) + International Standards
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
// HELPER FUNCTIONS
// ============================================

/**
 * Get available license categories for a given country code (DZ, SA, AE, FR, or fallback GLOBAL)
 */
export function getLicenseCategories(countryCode?: string): LicenseCategory[] {
  const code = (countryCode || 'DZ').toUpperCase();
  if (code === 'DZ' || code === 'DZA' || code === 'ALGERIA') {
    return ALGERIA_LICENSES;
  }
  return GLOBAL_LICENSES;
}

/**
 * Validate if a driver's license category permits driving a specific vehicle type
 */
export function canLicenseDriveVehicle(
  licenseCode: string,
  vehicleType: string,
  countryCode: string = 'DZ'
): boolean {
  const categories = getLicenseCategories(countryCode);
  const matched = categories.find((c) => c.code.toUpperCase() === licenseCode.toUpperCase());
  if (!matched) return true; // Flexible fallback if unlisted

  const normalizedVehicle = vehicleType.toLowerCase();
  
  // Direct match or category group matching
  return matched.allowedVehicles.some(
    (v) => v.toLowerCase() === normalizedVehicle || normalizedVehicle.includes(v)
  );
}
