const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'logistics-hub-guide';
  const title = 'دليل ربط وتفعيل شركات التوصيل والشحن الموحد، رمز PIN المجاني، ومسح الباركود الآلي';
  const titleEn = 'Unified Shipping & Logistics Carrier Integration, Delivery PIN & Automated Barcode Scan Guide';

  const content = `
# دليل استخدام محرك الشحن واللوجستيات الموحد ونظام الأمان المالي في ChariDay

يوفر نظام ChariDay تجربة لوجستية سيادية فائقة للتاجر والسوبر أدمن والمندوب.

---

## 1. نماذج تشغيل نظام الشحن الأربعة (Logistics Operational Modes)
يتيح النظام للسوبر أدمن اختيار نموذج السيطرة المالية المناسب:
1. **النموذج المزدوج المرن (Hybrid Mode):** حرية التاجر في إدخال مفتاحه الخاص أو الشحن عبر حساب المنصة الموحد.
2. **إلزام المفاتيح المباشرة فقط (Direct Keys Only):** كل تاجر يشحن بعقده ومفتاحه الخاص المباشر دون مخاطر مالية على المنصة.
3. **إلزام حساب المنصة الموحد (Platform Account Only):** جميع الشحنات تمر عبر حساب المنصة الموحد وتسوى في المحفظة.
4. **شركة المنصة الخاصة (ChariDay Express):** الاعتماد الحصري على أسطول التوصيل الخاص بالمنصة.

---

## 2. طباعة البوالص الحرارية الموحدة (10x15cm A6 Thermal Labels)
- إمكانية طباعة البوالص الفردية والجماعية بنقرة زر من لوحة التاجر بمقاس A6 (100x150mm).
- تضمن البوليصة رمز الباركود Code128 وقيمة الدفع عند الاستلام (COD) وعنوان الزبون وتفقيط المبالغ بالكلمات العربية.

---

## 3. نظام الأمان الصفري والتأكيد المجاني بدون SMS (Zero-Cost Delivery PIN)
- عند شحن الطلب، يولد السيرفر أوتوماتيكياً رمز تأكيد تسليم مجاني (PIN من 4 أرقام) + QR Code في حساب الزبون وتتبع الشحنة.
- يعرض الزبون الكود للمندوب عند استلام الطرد ودفع المبلغ، فيدخله المندوب في لوحته (/logistics) لمطابقته وإغلاق الطلب تلقائياً.

---

## 4. ماذا يحدث تفصيلياً عند مسح الباركود؟ (Barcode Scan Lifecycle)

### 📦 أ) مسح الباركود عند استلام الطرد من التاجر (Pickup Scan):
1. **التحقق والربط الأمني:** يفحص السيرفر شفرة الباركود (\`DZ-CDX-xxxxxx\`) ويتأكد أن الطرد سليم وغير مكرر ومسند للمندوب.
2. **تحديث الحالة أوتوماتيكياً:** تتحول حالة الطلب فوراً إلى \`تم الاستلام وفي الطريق للتوصيل (In Transit)\`.
3. **إشعارات حية:** يصل إشعار للتاجر والزبون بانطلاق المندوب بالشحنة.
4. **تفعيل كود الـ PIN:** يظهر رمز الـ PIN المكون من 4 أرقام في شاشة تتبع الزبون استعداداً للتسليم.

### 🏠 ب) مسح الباركود / إدخال الـ PIN عند تسليم الزبون (Delivery Scan):
1. **المطابقة الثنائية:** يدخل المندوب رمز الـ PIN المكون من 4 أرقام المقدم من الزبون (أو يمسح كود الـ QR).
2. **التحقق المالي (COD Amount Match):** يتأكد السيرفر من تطابق المبلغ المحصل نقداً مع قيمة الطلب.
3. **تغيير حالة الطلب:** تتحول الحالة رسمياً إلى \`تم التسليم بنجاح (Delivered)\`.
4. **تحرير المحفظة الآلي:** يُودع صافي المبلغ أوتوماتيكياً في محفظة التاجر (\`/seller/wallet\`) مع توجيه إشعار فوري.

---

## 5. التتبع اللحظي والتحرير الآلي للمحفظة (Automated Escrow Clearance)
- يتم التحديث الآلي لحالة الطرد وتطبيق مهلة الأمان (مثلاً 24 ساعة) قبل تحرير الأموال نهائياً في محفظة التاجر.
`;

  const contentEn = `
# ChariDay Unified Shipping & Logistics Carrier Integration & Delivery PIN Guide

ChariDay provides a sovereign e-commerce shipping engine connecting merchants, carriers, and drivers.

---

## 1. Four Governance Operational Modes
1. **Hybrid Flex Mode:** Merchant can use direct API keys or platform shared carrier accounts.
2. **Direct Keys Only:** Merchants must use their own direct carrier contracts.
3. **Platform Account Only:** Parcels routed through shared platform account with automated escrow payouts.
4. **ChariDay Express Private Fleet:** Exclusive usage of internal delivery network.

---

## 2. Standardized Thermal Shipping Labels (10x15cm A6)
Print individual or bulk waybill barcode labels with Arabic currency verbalization (Tafqeet).

---

## 3. Zero-Cost Delivery PIN Security Architecture
Automated 4-digit PIN & QR code generated on buyer's tracking page. Customer hands over the PIN to driver upon parcel receipt for instant verification without SMS fees.

---

## 4. Barcode Scan Lifecycle Events

### 📦 A) Pickup Scan at Merchant Store:
1. **Verification & Binding:** Validates Code128 barcode (\`DZ-CDX-xxxxxx\`) against driver profile.
2. **Automated Status Update:** Status changes instantly to \`In Transit\`.
3. **Real-time Notifications:** Merchant and buyer receive dispatch push notifications.

### 🏠 B) Delivery Scan & PIN Entry at Customer Door:
1. **Dual Verification:** Driver enters 4-digit PIN or scans QR code provided by buyer.
2. **COD Financial Match:** Server verifies cash collected matches total order value.
3. **Status Update & Escrow Release:** Status changes to \`Delivered\` and order total is automatically credited to merchant wallet (\`/seller/wallet\`).
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

  console.log('Successfully updated logistics doc article with Barcode Scan Lifecycle:', article.id, article.slug);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
