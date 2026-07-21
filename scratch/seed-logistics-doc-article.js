const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'logistics-hub-guide';
  const title = 'دليل ربط وتفعيل شركات التوصيل والشحن الموحد وطباعة البوالص وتتبع الطرود';
  const titleEn = 'Unified Shipping & Logistics Carrier Integration, Waybill Labels & Live Tracking Guide';

  const content = `
# دليل استخدام محرك الشحن واللوجستيات الموحد في ChariDay

يوفر نظام ChariDay تجربة لوجستية سيادية فائقة للتاجر والسوبر أدمن.

---

## 1. نماذج تشغيل نظام الشحن الأربعة (Logistics Operational Modes)
يتيح النظام للسوبر أدمن اختيار نموذج السيطرة المالية المناسب:
1. **النموذج المزدوج المرن (Hybrid Mode):** حرية التاجر في إدخال مفتاحه الخاص أو الشحن عبر حساب المنصة الموحد.
2. **إلزام المفاتيح المباشرة فقط (Direct Keys Only):** كل تاجر يشحن بعقده ومفتاحه الخاص المباشر دون مخاطر مالية على المنصة.
3. **إلزام حساب المنصة الموحد (Platform Account Only):** جميع الشحنات تمر عبر حساب المنصة الموحد وتسوى في المحفظة.
4. **شركة المنصة الخاصة (ChariDay Express):** الاعتماد الحصري على أسطول التوصيل الخاص بالمنصة.

---

## 2. طباعة البوالص الحرارية الموحدة (10x15cm Thermal Labels)
- إمكانية طباعة البوالص الفردية والجماعية بنقرة زر من لوحة التاجر.
- تضمن البوليصة رمز الباركود الحري وقيمة الدفع عند الاستلام (COD) وعنوان الزبون بدقة.

---

## 3. التتبع اللحظي والتحرير الآلي للمحفظة (Automated Escrow Clearance)
- يتم التحديث الآلي لحالة الطرد (\`قيد التجهيز\` ➔ \`في الطريق\` ➔ \`تم التسليم\` / \`مرتجع\`).
- عند تأكيد التسليم، يطبق النظام مهلة أمان مخصصة (مثلاً 24 ساعة) قبل تحرير الأموال نهائياً في محفظة التاجر.
`;

  const contentEn = `
# ChariDay Unified Shipping & Logistics Carrier Integration Guide

ChariDay provides a sovereign e-commerce shipping engine connecting multiple logistics providers.

---

## 1. Four Governance Operational Modes
1. **Hybrid Flex Mode:** Merchant can use direct API keys or platform shared carrier accounts.
2. **Direct Keys Only:** Merchants must use their own direct carrier contracts.
3. **Platform Account Only:** Parcels routed through shared platform account with automated escrow payouts.
4. **ChariDay Express Private Fleet:** Exclusive usage of internal delivery network.

---

## 2. Standardized Thermal Shipping Labels (10x15cm)
Print individual or bulk waybill barcode labels compatible with Zebra and Xprinter thermal printers.
`;

  const article = await prisma.docArticle.upsert({
    where: { slug },
    update: {
      title,
      titleEn,
      content,
      contentEn,
      category: 'sellers',
      isPublished: true,
    },
    create: {
      slug,
      title,
      titleEn,
      content,
      contentEn,
      category: 'sellers',
      isPublished: true,
      sortOrder: 3,
    },
  });

  console.log('Successfully seeded logistics doc article:', article.id, article.slug);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
