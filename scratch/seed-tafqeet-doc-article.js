const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'currency-and-tafqeet-guide';
  const title = 'دليل تفقيط المبالغ المالية وتحديد الدولة والعملة والمنطقة الزمنية';
  const titleEn = 'Currency, Timezone & Arabic Tafqeet Verbalization Guide';

  const content = `
# دليل تفقيط المبالغ المالية ودعم العملات والدول والفروق الزمنية في ChariDay

نظام ChariDay يدعم التجارة الدولية المتعددة مع التزام كامل بالقواعد المحاسبية العربية.

---

## 1. تفقيط المبالغ بالألفاظ العربية (Tafqeet Engine)
- **مفهوم التفقيط:** تحويل المبلغ الرقمي إلى نص عربي فصيح موجه سليم قواعدياً.
- **تغطية الشمولية:** يغطي جميع العملات العربية والعالمية (\`DZD\`, \`SAR\`, \`AED\`, \`QAR\`, \`KWD\`, \`BHD\`, \`OMR\`, \`MAD\`, \`TND\`, \`EGP\`, \`JOD\`, \`IQD\`, \`LYD\`, \`SDG\`, \`MRU\`, \`USD\`, \`EUR\`, \`GBP\`).
- **أين يظهر التفقيط؟**
  1. الفواتير والإيصالات الرسمية للمنصة والمتاجر.
  2. ملخص الحسابات وسحوبات الأرباح للتاجر.
  3. صفحة إنهاء الطلب للتأكيد على المبلغ الإجمالي.

---

## 2. الضبط الآلي للدولة والعملة والمنطقة الزمنية
- بمجرد اختيار التاجر لـ **الدولة** من تبويب الهوية والمعلومات، يقوم النظام آلياً بـ:
  - تعيين **العملة الرسمية** التابعة لها.
  - تحديد **المنطقة الزمنية** الشائعة لضبط تواريخ وأوقات الطلبات.
  - جلب **قائمة الولايات والمناطق الجغرافية** للبلد المختار بدقة.
`;

  const contentEn = `
# Currency, Timezone & Arabic Tafqeet Verbalization Guide in ChariDay

ChariDay supports multi-country e-commerce with full compliance to Arabic accounting standards.

---

## 1. Arabic Currency Verbalization (Tafqeet)
- Converts numeric balances into proper, grammatically correct Arabic words.
- Supports 20+ Arab and international currencies (\`DZD\`, \`SAR\`, \`AED\`, \`QAR\`, \`KWD\`, \`MAD\`, \`EGP\`, \`USD\`, \`EUR\`...).
- Integrated into printable invoices, merchant withdrawal receipts, and order totals.

---

## 2. Automatic Country, Currency & Timezone Binding
- Changing the store's country automatically sets its currency, default timezone, and regional delivery states across Checkout and Merchant Settings.
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
      sortOrder: 2,
    },
  });

  console.log('Successfully seeded tafqeet doc article:', article.id, article.slug);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
