const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'shipping-and-regions';
  const title = 'دليل إعدادات الشحن والتوصيل المتطور والربط الجغرافي والدولي';
  const titleEn = 'Advanced Shipping, Regional & Multi-Country Logistics Guide';
  const titleFr = 'Guide de Logistique, Expédition Avancée et Config Multi-Pays';

  const content = `
# دليل إعدادات الشحن والتوصيل المتطور في ChariDay

يرحب بكم نظام ChariDay لتجارة الجملة والتجزئة. يغطي هذا المستند التفاصيل الكاملة لمعمارية الشحن والتوصيل والربط الجغرافي بالدول والولايات والبلديات.

---

## 1. هيكلية اختيار الجغرافيا (الدولة ➔ الولاية ➔ البلدية)

### أ. لماذا تبدأ العملية باختيار الولاية ثم البلدية؟
- **تحسين تجربة المستخدم (UX Performance):** تحتوي البلدان (مثل الجزائر) على أكثر من 1541 بلدية. عرض كافة البلديات في قائمة واحدة يسبب بطئاً وتشتتاً للتاجر والزبون.
- **التدرج اللوجستي (Logistics Hierarchy):** تُحدد أسعار وخدمات شركات الشحن على مستوى الولايات أولاً، ثم تُصنف البلديات التابعة لكل ولاية لتحديد إمكانية التوصيل المنزلي (Home Delivery) أو للتوقف في المكتب (Desk Stop).

### ب. ربط الدولة بتبويب "الهوية والمعلومات"
- **تحديد الدولة آلياً:** يتم تعيين دولة المتجر الرئيسية من تبويب **الهوية والمعلومات** (\`generalSettings.country\`).
- **التحديث الديناميكي:** عند تغيير دولة المتجر (مثلاً من الجزائر \`DZ\` إلى السعودية \`SA\` أو المغرب \`MA\`):
  1. يقوم النظام بجلب قائمة الولايات والمناطق المعتمدة لتلك الدولة فوراً عبر API \`/api/regions/states\`.
  2. تتغير عملة المتجر الافتراضية تلقائياً بحسب عملة الدولة المختارة (د.ج، ر.س، د.م...).
  3. يتم تحديث قائمة الولايات والبلديات في حاسبة التوصيل عند التاجر وفي صفحة الشراء لإنهاء الطلب (\`Checkout\`).

---

## 2. ترتيب الولايات والتقسيم الإداري الرسمي

- **الترتيب الرقمي التراكمي:** جميع الولايات مرتبة وفق **الترقيم الحسابي الرسمي (من 01 إلى 58+)**:
  - \`01 - أدرار\`
  - \`02 - الشلف\`
  - \`03 - الأغواط\`
  - ...
  - \`49 - تيميمون\` إلى \`58 - المنيعة\` (التقسيم الإداري المستحدث كاملاً).
  - \`68 - عين وسارة\` و \`69 - مسعد\` (الدوائر الكبرى المخصصة).

---

## 3. التحكم في التكاليف والتأطير
- **التكلفة الأساسية:** التكلفة الافتراضية للطلب القياسي أو السريع.
- **حد الإعفاء (Free Shipping Threshold):** الحد الأدنى لقيمة السلة التي يحصل الزبون عند تجاوزها على شحن مجاني آلياً.
- **تخصيص التكاليف لكل ولاية:** إمكانية تعديل سعر الشحن لولايات محددة لتجاوز السعر الأساسي أو تعطيل الشحن لولايات معينة.
`;

  const contentEn = `
# Advanced Shipping, Regional & Multi-Country Logistics Guide in ChariDay

Welcome to the ChariDay logistics documentation. This guide explains how shipping, states, municipalities, and multi-country options work across the platform.

---

## 1. Geographical Hierarchy (Country ➔ State/Wilaya ➔ Municipality/Commune)

### A. Why select State first, then Municipality?
- **UX & Performance:** Countries like Algeria have 1,541+ communes. Selecting the Wilaya/State first filters the municipalities, saving memory and providing a seamless user experience.
- **Courier Pricing Structure:** Courier agencies set baseline delivery tariffs at the Wilaya level, followed by commune-specific desk/home delivery options.

### B. Country Binding via "Identity & Info" Tab
- **Automatic Binding:** Changing the store country in **Identity & Info** (\`generalSettings.country\`) dynamically updates all regional settings.
- When changing from Algeria (\`DZ\`) to Saudi Arabia (\`SA\`) or Morocco (\`MA\`), the states API automatically updates the list, country currency, and available delivery regions across Checkout and Merchant Settings.

---

## 2. Numerical State Ordering & Official Divisions
- All states are sorted numerically from **01 to 58+** in exact sequential order.
- Supports all 10 newly created Algerian wilayas (49-Timimoun to 58-El Meniaa) as well as major districts (68-Ain Oussera, 69-Messaad).
`;

  const translations = {
    contentFr: `
# Guide de Logistique, Expédition Avancée et Configuration Multi-Pays sur ChariDay

Bienvenue dans le guide logistique ChariDay. Ce document détaille l'architecture de livraison, les wilayas, communes et la gestion multi-pays.

---

## 1. Hiérarchie Géographique (Pays ➔ Wilaya ➔ Commune)

### A. Pourquoi choisir la Wilaya avant la Commune ?
- **Performance UX :** L'Algérie compte plus de 1541 communes. Le filtrage par Wilaya permet une expérience utilisateur fluide sans surcharge.
- **Tarification des Livreurs :** Les agences de livraison fixent leurs tarifs de base par Wilaya puis par commune.

### B. Liaison avec l'onglet "Identité et Informations"
- En modifiant le pays de la boutique dans **Identité et Informations** (\`generalSettings.country\`), l'API met à jour la liste des régions, la devise et les options de livraison pour le paiement (Checkout).
`
  };

  const article = await prisma.docArticle.upsert({
    where: { slug },
    update: {
      title,
      titleEn,
      content,
      contentEn,
      translations,
      category: 'sellers',
      isPublished: true,
    },
    create: {
      slug,
      title,
      titleEn,
      content,
      contentEn,
      translations,
      category: 'sellers',
      isPublished: true,
      sortOrder: 1,
    },
  });

  console.log('Successfully seeded shipping doc article:', article.id, article.slug);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
