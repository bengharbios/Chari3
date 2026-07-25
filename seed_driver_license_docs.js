const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDriverLicenseDocs() {
  console.log('Seeding Driver License Categories Documentation Article...');

  const slug = 'driver-licenses-guide';

  const titleAr = 'دليل أصناف رخص السياقة والمعايير الدولية (المرسوم 04-381 والتخصيص الدولي)';
  const titleEn = 'Driver License Categories & International Standards Guide (Decree 04-381 & Multi-Country Config)';
  const titleFr = 'Guide des catégories de permis de conduire et normes internationales (Décret 04-381 & Config multi-pays)';

  const contentAr = `
# 🚗 دليل أصناف رخص السياقة والمعايير الدولية

يقدم هذا الدليل التوثيق الكامل لنظام رخص السياقة وتصنيف المركبات المعتمد في المنصة للمندوبين وسائقي التوصيل وشركات الشحن، وفق التوفق مع القوانين الوطنية والتشريعات الدولية.

---

## 🇩🇿 1. الأصناف الرسمية في الجزائر (المادة 180 من المرسوم التنفيذي 04-381 المعدل والمتمم)

تعتمد المنصة الأصناف الثمانية الرسمية المعتمدة في الجزائر:

1. **الصنف أ1 (A1)**: الدراجات النارية من الصنف أ (سعة الأسطوانة من 50 إلى 80 سم³) والدراجات الثلاثية والرباعية العجلات (سعة الأسطوانة ≤ 125 سم³).
2. **الصنف أ2 (A2)**: الدراجات النارية من الصنف ب (سعة الأسطوانة من 80 إلى 400 سم³) والصنف ج (أكثر من 400 سم³).
3. **الصنف ب (B)**: السيارات الأقل من 10 مقاعد والمركبات النفعية التي يكون وزنها الإجمالي مع الحمولة أقل من 3.5 طن.
4. **الصنف ج1 (C1)**: المركبات المنفردة المخصصة لنقل البضائع التي يكون وزنها الإجمالي بين 3.5 طن و 19 طن.
5. **الصنف ج2 (C2)**: مركبات نقل البضائع التي يتجاوز وزنها الإجمالي 19 طن (منفردة) أو يتجاوز 12.5 طن (مركبة جارة أو متمفصلة).
6. **الصنف د (D)**: سيارات النقل العام للأشخاص (أكثر من 9 مقاعد) أو التي يتجاوز وزنها الإجمالي مع الحمولة 3.5 طن.
7. **الصنف هـ (E)**: السيارات من الصنف (ب - ج - د) التي تجر مقطورة وزنها أكبر من 750 كلغ.
8. **الصنف و (F)**: السيارات من الصنف (أ1 - أ2 - ب) التي يسوقها المعطوبون والمهيأة خصيصاً لمراعاة إعاقتهم.

---

## 🌐 2. التخصيص الدولي ودعم مختلف الدول

يتضمن النظام **مجموعات مسبقة التكوين (Presets)** لمختلف الدول:
- **السعودية (SA)**: رخصة دراجة نارية، رخصة خاصة، نقل ثقيل، وحافلات.
- **الإمارات (AE)**: الفئات من 1 إلى 7 (دراجة، مركبة خفيفة، شاحنة ثقيلة، حافلة).
- **الاتحاد الأوروبي وفرنسا (EU / FR)**: الأصناف AM, A1, A2, B, C1, C, D, E.
- **النظام الدولي العام (GLOBAL)**: للأصناف القياسية العامة لأي دولة أخرى.

---

## 🛠️ 3. الإدارة والتعديل من لوحة الأدمن

يمكن للأدمن التحكم الكامل عبر الواجهة البرمجية \`/api/admin/shipping/license-categories\`:
- اختيار أي دولة في العالم بواسطة الرمز الدولي (ISO Code).
- إضافة، تعديل، أو حذف أصناف رخص السياقة (Code, NameAr, NameEn, NameFr, Description).
- ربط نوع المركبة والوزن الأقصى بالصنف لضمان الفحص الآلي الحازم.
`;

  const contentEn = `
# 🚗 Driver License Categories & International Standards Guide

This guide provides full documentation for the driver licensing and vehicle categorization engine implemented across ChariDay for delivery drivers, couriers, and logistics fleets.

---

## 🇩🇿 1. Algeria Official Categories (Article 180 - Executive Decree 04-381)

The platform natively supports all 8 official Algerian categories:

1. **Category A1**: Light motorcycles (50-80cc) and motor trikes/quads (engine displacement ≤ 125cc).
2. **Category A2**: Medium motorcycles (80-400cc) and heavy motorcycles (> 400cc).
3. **Category B**: Passenger vehicles (< 10 seats) and light delivery utility vans under 3.5 tons gross weight.
4. **Category C1**: Single goods transport vehicles between 3.5 tons and 19 tons gross weight.
5. **Category C2**: Heavy goods transport vehicles exceeding 19 tons (single) or exceeding 12.5 tons (articulated/towing).
6. **Category D**: Mass passenger transport vehicles (> 9 seats) or gross weight exceeding 3.5 tons.
7. **Category E**: Vehicles of categories B, C, D towing a trailer exceeding 750 kg.
8. **Category F**: Specially adapted vehicles of category A1, A2, or B for drivers with physical disabilities.

---

## 🌐 2. Multi-Country Presets & International Flexibility

Built-in support for multiple national licensing standards:
- **Saudi Arabia (SA)**: Motorcycle, Private Car, Heavy Freight, Public Bus.
- **UAE (AE)**: Categories 1 to 7 (Motorcycle, Light Vehicle, Heavy Truck, Bus).
- **European Union & France (FR/EU)**: Categories AM, A1, A2, B, C1, C, D, E.
- **Global Standard (GLOBAL)**: General fallback for all unlisted countries.

---

## 🛠️ 3. Admin Dynamic Customization API

Super Admins can fully manage categories per country via \`/api/admin/shipping/license-categories\`:
- Select any country using ISO codes.
- Add, edit, or delete categories (Code, NameAr, NameEn, NameFr, Description).
- Map allowed vehicle types and max weight limits per category.
`;

  const contentFr = `
# 🚗 Guide des catégories de permis de conduire et normes internationales

Ce guide fournit la documentation complète sur le moteur de permis de conduire et de catégorisation des véhicules pour les livreurs et flottes logistiques.

---

## 🇩🇿 1. Catégories officielles en Algérie (Article 180 - Décret exécutif 04-381)

La plateforme prend en charge nativement les 8 catégories officielles :

1. **Catégorie A1** : Motocyclettes légères (50 à 80 cm³) et triquadricycles (≤ 125 cm³).
2. **Catégorie A2** : Motocyclettes moyennes (80 à 400 cm³) et lourdes (> 400 cm³).
3. **Catégorie B** : Véhicules de tourisme (< 10 places) et utilitaires légers de moins de 3,5 tonnes.
4. **Catégorie C1** : Véhicules isolés de transport de marchandises entre 3,5 tonnes et 19 tonnes.
5. **Catégorie C2** : Véhicules lourds de transport dépassants 19 tonnes (isolés) ou 12,5 tonnes (articulés).
6. **Catégorie D** : Transport en commun de personnes (> 9 places) ou dépassant 3,5 tonnes.
7. **Catégorie E** : Véhicules des catégories B, C, D attelant une remorque de plus de 750 kg.
8. **Catégorie F** : Véhicules aménagés des catégories A1, A2 ou B pour conducteurs handicapés.

---

## 🌐 2. Flexibilité internationale et préconfigurations

- **Arabie Saoudite (SA)** : Moto, Véhicule privé, Poids lourd, Bus.
- **Émirats Arabe Unis (AE)** : Catégories 1 à 7.
- **Union Européenne & France (FR/EU)** : Catégories AM, A1, A2, B, C1, C, D, E.
- **Standard Global (GLOBAL)** : Option par défaut pour tous les autres pays.
`;

  await prisma.docArticle.upsert({
    where: { slug },
    update: {
      title: titleAr,
      titleEn: titleEn,
      content: contentAr,
      contentEn: contentEn,
      translations: {
        titleFr,
        contentFr,
      },
      category: 'logistics',
      isPublished: true,
      sortOrder: 15,
    },
    create: {
      title: titleAr,
      titleEn: titleEn,
      slug,
      content: contentAr,
      contentEn: contentEn,
      translations: {
        titleFr,
        contentFr,
      },
      category: 'logistics',
      isPublished: true,
      sortOrder: 15,
    },
  });

  console.log('✅ Driver License Categories DocArticle seeded successfully!');
}

seedDriverLicenseDocs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
