const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = [
    {
      title: 'إعداد خرائط جوجل وتحديد العناوين',
      titleEn: 'Setting up Google Maps and Address Pinning',
      slug: 'google-maps-setup',
      category: 'settings',
      content: `
# 🗺️ نظام تحديد المواقع وخرائط جوجل

لقد تم إضافة نظام حديث لتحديد المواقع في منصة **ChariDay** لمساعدة المشترين على تحديد موقعهم بدقة.

## الميزات الجديدة:
1. **زر "التوصيل إلى" (Deliver To):**
   - موجود في الشريط العلوي (Navbar).
   - يسمح للزوار بتحديد دولتهم ومدينتهم لتخصيص المنتجات المعروضة، أو فتح خريطة جوجل لاختيار الموقع الدقيق.

2. **عناوين المشتري (Buyer Addresses):**
   - صفحة كاملة في لوحة تحكم المشتري (\`/buyer\`) تتيح للمستخدم إدارة العناوين (إضافة/تعديل/حذف).
   - دمج كامل مع خريطة تفاعلية لتحديد نقطة التوصيل (Pin) بشكل مرئي.
   - حفظ إحداثيات (خطوط الطول والعرض) لضمان وصول المندوب بدقة.

## كيف تقوم بتفعيل الميزة؟
1. توجه إلى لوحة تحكم الإدارة.
2. افتح قائمة **الإعدادات العامة** (\`/admin-secure-internal/settings\`).
3. ستجد حقلاً جديداً باسم **مفتاح خرائط جوجل (Google Maps API Key)**، قم بوضع المفتاح الخاص بك هناك.
4. قم بتشغيل الزر الجانبي **"تفعيل خرائط جوجل"**.

> **ملاحظة:** في حالة إيقاف التفعيل أو عدم وجود مفتاح، سيعمل النظام بطريقة الإدخال اليدوي لتجنب توقف الموقع.

## وسائل التواصل في صفحة الدخول
تم إضافة مساحات مخصصة (Placeholders) في صفحة تسجيل الدخول (\`/admin-secure-internal/login\` وغيرها) تتيح لاحقاً ربط الدخول بحسابات **Google** و **Apple** مباشرة.
      `,
      contentEn: `
# 🗺️ Google Maps and Location System

A modern location pinning system has been added to **ChariDay** to help buyers pinpoint their exact delivery locations.

## New Features:
1. **"Deliver To" Button:**
   - Located in the top Navbar.
   - Allows visitors to select their country/city to customize product visibility, or open Google Maps for exact location pinning.

2. **Buyer Addresses:**
   - A complete page in the Buyer Dashboard (\`/buyer\`) allowing users to manage addresses (add/edit/delete).
   - Full integration with an interactive map to visually drop a delivery pin.
   - Saves coordinates (Latitude/Longitude) to ensure accurate delivery.

## How to enable it?
1. Go to the Admin Dashboard.
2. Open **General Settings** (\`/admin-secure-internal/settings\`).
3. You will find a new field called **Google Maps API Key**. Enter your key here.
4. Toggle the **"Enable Google Maps"** switch.

> **Note:** If disabled or if the key is missing, the system gracefully falls back to a manual input mode to prevent breaking the platform.

## Social Login in Auth Page
Placeholders for **Google** and **Apple** single-sign-on have been added to the authentication page, ready for future backend integration.
      `,
      sortOrder: 1,
      isPublished: true
    }
  ];

  for (const doc of docs) {
    const existing = await prisma.docArticle.findUnique({ where: { slug: doc.slug } });
    if (!existing) {
      await prisma.docArticle.create({ data: doc });
      console.log('Created doc: ' + doc.slug);
    } else {
      await prisma.docArticle.update({
        where: { slug: doc.slug },
        data: doc
      });
      console.log('Updated doc: ' + doc.slug);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
