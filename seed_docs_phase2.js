const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.docArticle.findUnique({
    where: { slug: 'deliver-to-feature' }
  });

  if (!existing) {
    await prisma.docArticle.create({
      data: {
        title: 'شرح ميزة "التوصيل إلى" (Deliver To)',
        titleEn: 'Deliver To Feature Guide',
        slug: 'deliver-to-feature',
        category: 'general',
        isPublished: true,
        sortOrder: 2,
        content: `
# ميزة "التوصيل إلى" (Deliver To / Geolocation) 📍

قمنا بإضافة ميزة جديدة رائعة في الشريط العلوي (Header) للمنصة تشبه ما هو موجود في مواقع التجارة العالمية (مثل Amazon و Noon).

## 🚀 كيف تعمل الميزة؟
- تظهر أيقونة موقع بجوار الشعار في أعلى المتجر.
- يمكن للزائر النقر عليها لتغيير دولة أو مدينة التوصيل.
- سيتم حفظ اختيار الزائر بفضل تقنية \`Zustand Persist\` (عبر الـ LocalStorage) لضمان بقائه مسجلاً في كل زيارة قادمة.

## ⚙️ التحكم من لوحة الإدارة
- يمكن لمدير النظام (Super Admin) إخفاء هذه الميزة أو إظهارها متى شاء من خلال **الإعدادات > مفاتيح الميزات (Kill Switches)** عبر خيار "تفعيل ميزة تحديد الموقع في الهيدر (Deliver To)".

> **تنبيه:** تعتمد هذه الميزة على واجهة برمجة التطبيقات الديناميكية، مما يضمن عرض المنتجات المتاحة فقط في الموقع المحدد مستقبلاً.
        `,
        contentEn: 'Guide on how the Deliver To feature works.'
      }
    });
    console.log("Seeded Deliver-To documentation article successfully.");
  } else {
    console.log("Article already exists.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
