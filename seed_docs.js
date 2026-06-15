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
# 🗺️ الدليل الشامل لخرائط جوجل ونظام تحديد المواقع

تم بناء نظام خرائط احترافي داخل منصة **ChariDay** ليتيح للمشترين تحديد مواقع التوصيل بدقة متناهية، سواء في صفحة الدفع (Checkout) أو إدارة العناوين.

## 🌟 الميزات الحديثة:
1. **البحث المباشر (Geocoding Search):** 
   يمكن للمشتري كتابة اسم المنطقة (مثل "زاجل دبي") والضغط على Enter لينتقل الدبوس فوراً للمكان المحدد بدقة.
2. **التنقيح الذكي للعناوين (Plus Codes Filtering):** 
   الخريطة مبرمجة برمجياً لتتجاهل الرموز الغريبة التي تولدها جوجل (مثل M7G3+83W) وتبحث عن أقرب عنوان شارع حقيقي واسم مؤسسة مقروء لضمان وضوح فاتورة التوصيل.
3. **تحديد موقعي (GPS Auto-Locate):** 
   زر يحدد موقع المستخدم تلقائياً باستخدام دقة عالية (\`enableHighAccuracy\`). (ملاحظة: الدقة تكون 100% في الهواتف لاحتوائها على شريحة GPS، بينما تعتمد على مزود الإنترنت في الكمبيوتر).

---

## ⚙️ متطلبات التفعيل (خطوات أساسية للإدارة)

لكي تعمل الخريطة بدون أخطاء أو شاشات رمادية، يجب عليك كمدير منصة اتباع الخطوات التالية في **Google Cloud Console**:

### 1. ربط الفوترة (Billing Account)
جوجل **تمنع** عمل خدمات العناوين بدون وجود بطاقة بنكية مسجلة، حتى لو كان الاستخدام مجانياً.
* **الأسعار:** جوجل تمنحك **200 دولار مجانية كل شهر**. تكلفة خدمة العناوين هي 5 دولارات لكل 1000 طلب، مما يعني أن لديك **40,000 عملية بحث ونقر مجانية شهرياً**. لن تدفع سنتاً واحداً قبل تجاوز هذا الرقم الضخم.

### 2. تفعيل واجهات برمجة التطبيقات (APIs)
يجب التأكد من البحث عن الخدمات التالية في Google Cloud والضغط على زر **Enable**:
* **Maps JavaScript API:** لعرض الخريطة التفاعلية في الموقع.
* **Geocoding API:** (مهم جداً) لتحويل الإحداثيات عند النقر على الخريطة إلى اسم شارع حقيقي، ولتشغيل شريط البحث.

### 3. إعداد قيود الأمان للمفتاح (API Restrictions)
في قسم (Credentials)، عند تعديل إعدادات مفتاحك (API Key)، تأكد أنك تسمح له باستخدام الخدمات المطلوبة. إذا اخترت (Restrict key)، ضع علامة ✅ على \`Geocoding API\` و \`Maps JavaScript API\`.

---

## 🚨 لماذا لا توجد ميزة القائمة المنسدلة للبحث (Autocomplete)؟
سياسة جوجل الجديدة (ابتداءً من مارس 2025) تمنع الحسابات والمشاريع الجديدة من استخدام ميزة الإكمال التلقائي القديمة \`google.maps.places.Autocomplete\`. لذلك تم تعطيلها عمداً في المنصة لأنها تسبب خطأ \`ApiTargetBlockedMapError\` الذي يعطل الخريطة بالكامل.
**البديل المستخدم لدينا:** هو أقوى محرك بحث مباشر (Geocoding) الذي يقرأ الكلمة ويعطيك نتيجتها الدقيقة بمجرد الضغط على Enter، وهو مجاني ومستقر تماماً!
      `,
      contentEn: `
# 🗺️ Comprehensive Guide to Google Maps Integration

**ChariDay** includes a professional mapping system allowing buyers to pinpoint precise delivery locations during checkout and address management.

## 🌟 Modern Features:
1. **Direct Geocoding Search:** Users can type a specific place (e.g., "Zajel Dubai") and press Enter to instantly pin the location.
2. **Smart Address Parsing (Plus Codes Filtering):** The system automatically ignores unreadable Google Plus Codes (e.g., M7G3+83W) and fetches the nearest human-readable street address or Point of Interest (POI).
3. **GPS Auto-Locate:** A high-accuracy location button. (Note: pinpoint accuracy is achieved on mobile devices with GPS hardware, whereas desktops rely on IP addresses).

---

## ⚙️ Setup Requirements (For Admins)

To prevent gray error screens, you MUST configure the following in **Google Cloud Console**:

### 1. Enable Billing Account
Google Maps APIs for Geocoding **will not work** without a linked credit card, even for the free tier.
* **Pricing:** Google provides **$200 FREE credit every month**. At $5 per 1,000 requests, this covers **40,000 free map searches/clicks per month**. You will only be charged if you exceed this massive threshold.

### 2. Enable Required APIs
Ensure you search for and click **Enable** on the following APIs:
* **Maps JavaScript API:** Renders the visual interactive map.
* **Geocoding API:** (CRITICAL) Converts map clicks into text addresses and powers the map's search bar.

### 3. Configure API Key Restrictions
In the Credentials section, if your API Key uses "API Restrictions", you MUST check the boxes for \`Geocoding API\` and \`Maps JavaScript API\` to prevent 'ApiTargetBlockedMapError' crashes.

---

## 🚨 Notice Regarding Predictive Autocomplete
As of March 2025, Google formally restricted new projects from using the legacy \`google.maps.places.Autocomplete\` feature. Using it causes a complete map crash. 
**Our Solution:** The platform deliberately bypasses this and uses robust direct Geocoding search instead. Simply type your query and hit Enter!
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
