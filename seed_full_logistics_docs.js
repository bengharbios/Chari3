const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFullLogisticsDocs() {
  console.log('Seeding Comprehensive Logistics & Driver Platform Documentation Article...');

  const slug = 'logistics-full-guide';

  const titleAr = 'دليل مركز اللوجستيات الشامل لشركة الشحن والمندوب (الخرائط، البوالص، التوثيقات والتحصيل)';
  const titleEn = 'Comprehensive Logistics & Driver Center Guide (GPS Maps, Waybills, Verification & COD)';
  const titleFr = 'Guide complet du centre logistique et livreurs (Cartes GPS, Bordereaux, Vérification & COD)';

  const contentAr = `
# 🚚 دليل مركز اللوجستيات الشامل لشركة الشحن والمندوب

يوفر مركز اللوجستيات الموحد في منصة **شاري داي (ChariDay)** واجهة متكاملة ومترابطة تحكم عمليات النقل والتوصيل السريع بين التجار والمشتريين والمندوبين وشركات الشحن.

---

## 🗺️ 1. الصفحات والمسارات المترابطة في النظام:

1. **نظرة عامة والخرائط الحية (\`/logistics\`)**:
   - إحصائيات لحظية لأعداد الشحنات النشطة، توصيلات اليوم، وإجمالي المبالغ المحصلة COD.
   - خريطة تفاعلية برادار لتتبع توازن وتوزيع الشحنات على مستوى الولايات والمدن (الجزائر العاصمة، وهران، قسنطينة، سطيف، عنابة...).
   - زر مباشر لإجراء المكالمات مع الزبائن ومعاينة البوالص الحرارية.

2. **الشحنات النشطة وتأكيد الـ PIN (\`/logistics/active\`)**:
   - إدارة الطلبات المسندة للمندوب ومتابعة مراحل التغيير (Picked Up, In Transit, Delivered).
   - نظام تأكيد التسليم بواسطة **رمز الـ Delivery PIN** المكون من 4 أرقام الممنوح للزبون لضمان عدم التلاعب وتحرير الأرباح فورياً للمحفظة.

3. **منافيست الشحن والبوالص الحرارية (\`/logistics/manifests\`)**:
   - طباعة وتصدير منافيست الشحن اليومي وتوزيع طرود التوصيل.
   - طباعة بوالص الشحن القياسية بالحجم الحراري (A6 Thermal Label) المعززة بالـ Barcode والـ QR Code.

4. **سجل التوصيل والتحصيل المالي (\`/logistics/history\`)**:
   - أرشيف كامل لجميع الشحنات المكتملة ومبالغ الدفع عند التسليم (COD) المحصلة لصالح التجار.

5. **وثائق التوثيق والمستندات (\`/logistics/documents\`)**:
   - **للسائق والمندوب (KYC)**: رخصة السياقة البيومترية وفق الأصناف (أ1، أ2، ب، ج1، ج2، د، هـ، و)، البطاقة الرمادية للمركبة (Carte Grise)، وتأمين المركبة.
   - **لمؤسسة وشركة الشحن (KYP/KYB)**: السجل التجاري (R.C)، الرقم الجبائي الإحصائي (NIF/NIS)، واعتماد وزارة النقل.

6. **المحفظة وسحوبات بريدي موب (\`/logistics/earnings\`)**:
   - متابعة رصيد العمولات المستحقة، وإرسال طلبات السحب المباشر نحو حساب **بريدي موب (BaridiMob)** أو **الحساب البريدي الجاري (CCP)**.

---

## ⚙️ 2. التحكم في إعدادات اللوحات من لوحة الأدمن (Super Admin Governance)

يمكن لمدير النظام (Super Admin) التحكم الكامل في اللوجستيات من خلال:
- **/admin-secure-internal/logistics**: تحديد مزودي ومؤسسات الشحن، والتبديل بين النموذج المزدوج (Hybrid)، نموذج المفاتيح المباشرة، أو شركة المنصة الخاصة.
- **/api/admin/shipping/license-categories**: تخصيص وتعديل أصناف رخص السياقة لكل دولة من دول العالم.
- **/admin-secure-internal/settings/maps**: ضبط مزود الخرائط الجغرافية ومفاتيح الـ GPS.
`;

  const contentEn = `
# 🚚 Comprehensive Logistics & Driver Center Guide

The unified Logistics Center on **ChariDay** provides an end-to-end management dashboard connecting merchants, buyers, carriers, and individual delivery drivers.

---

## 🗺️ 1. Inter-connected Dashboard Routes:

1. **Overview & Live Maps (\`/logistics\`)**: Real-time KPIs, active shipments count, wallet balance, and interactive radar GPS tracking across states.
2. **Active Shipments & PIN Verification (\`/logistics/active\`)**: Manage assigned orders and process secure 4-digit Delivery PIN verification.
3. **Manifests & Waybills (\`/logistics/manifests\`)**: Print A6 thermal labels and batch export daily shipment manifests.
4. **Delivery & COD History (\`/logistics/history\`)**: Archived delivery logs and cash-on-delivery collection receipts.
5. **Verification & Documents (\`/logistics/documents\`)**: Driver KYC (Permis & Carte Grise) vs Carrier Company KYB (R.C & NIF).
6. **Wallet & Payouts (\`/logistics/earnings\`)**: Track delivery commissions & process instant BaridiMob/CCP withdrawals.

---

## ⚙️ 2. Admin Panel Governance:
Super Admins have full control via \`/admin-secure-internal/logistics\`, \`/api/admin/shipping/license-categories\`, and \`/admin-secure-internal/settings/maps\`.
`;

  const contentFr = `
# 🚚 Guide complet du centre logistique et livreurs

Le centre logistique unifié sur **ChariDay** offre un tableau de bord complet reliant commerçants, acheteurs, transporteurs et livreurs.

---

## 🗺️ 1. Routes et modules interconnectés :

1. **Aperçu & Cartes GPS (\`/logistics\`)** : Statistiques en direct et suivi radar GPS par wilayas.
2. **Expéditions actives & Code PIN (\`/logistics/active\`)** : Gestion des colis et validation sécurisée par code PIN.
3. **Bordereaux et Étiquettes (\`/logistics/manifests\`)** : Impression d'étiquettes thermiques A6 et export du manifeste.
4. **Historique & COD (\`/logistics/history\`)** : Registre complet des livraisons et montants perçus à la livraison.
5. **Documents & Permis (\`/logistics/documents\`)** : KYC Chauffeur (Permis & Carte Grise) vs KYB Entreprise (Registre du Commerce & NIF).
6. **Portefeuille & Retraits (\`/logistics/earnings\`)** : Suivi des commissions et demande de virement BaridiMob/CCP.
`;

  await prisma.docArticle.upsert({
    where: { slug },
    update: {
      title: titleAr,
      titleEn: titleEn,
      content: contentAr,
      contentEn: contentEn,
      translations: { titleFr, contentFr },
      category: 'logistics',
      isPublished: true,
      sortOrder: 16,
    },
    create: {
      title: titleAr,
      titleEn: titleEn,
      slug,
      content: contentAr,
      contentEn: contentEn,
      translations: { titleFr, contentFr },
      category: 'logistics',
      isPublished: true,
      sortOrder: 16,
    },
  });

  console.log('✅ Comprehensive Logistics DocArticle seeded successfully!');
}

seedFullLogisticsDocs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
