const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const articles = [
    {
      slug: 'driver-logistics-gps-and-pin-guide',
      category: 'drivers',
      sortOrder: 1,
      title: 'دليل المندوب: استخدام خريطة التتبع اللحظي (GPS) وتأكيد التسليم برمز PIN',
      titleEn: 'Driver Guide: Using Live GPS Tracking & PIN Verification',
      content: `
# الدليل الشامل لمندوب التوصيل: التتبع اللحظي وتسليم الشحنات

أهلاً بك في منصة عمليات التوصيل اللوجستية لمنصة ChariDay. يوفر هذا الدليل شرحاً تفصيلياً لجميع الأدوات المتاحة لك كمندوب:

## 1. سوق الشحنات المفتوح (Open Load Pool)
- **كيف يعمل؟** جميع الطلبات الجديدة التي تم تجهيزها من قبل التجار تظهر فوراً في لوحة "سوق الشحن المفتوح" بالصفحة الرئيسية للوجستيات (/logistics).
- **اقتناص الشحنة:** يمكنك الضغط على زر (قبول واقتناص Claim) لحجز الشحنة باسمك فوراً (حجز ذري). بمجرد الاقتناص، تنتقل الشحنة إلى قائمة "الشحنات النشطة" الخاصة بك.

## 2. خريطة التتبع اللحظي التفاعلية (Live GPS Tracking)
- بعد اقتناص الشحنات، انتقل إلى صفحة **الشحنات النشطة** (/logistics/active).
- تعرض الخريطة جميع نقاط التوصيل الخاصة بشحناتك الحالية مع إمكانية التفاعل مع كل نقطة (Pin) لاستخراج تفاصيل العميل والاتصال به بضغطة زر.

## 3. إثبات التسليم بواسطة رمز الـ PIN (Delivery POD)
- لحماية مستحقاتك ومستحقات التاجر، لا يمكن إغلاق حالة الطلب إلى (تم التسليم) إلا من خلال إدخال رمز **Delivery PIN**.
- يتلقى الزبون هذا الرمز في لوحة التحكم الخاصة به. عند الوصول إليه وتسليمه البضاعة وتحصيل مبلغ الـ COD، اطلب منه الرمز المكون من 4 أرقام لتأكيد التسليم وتوثيق البصمة الجغرافية (GPS Stamp) تلقائياً.
      `,
      contentEn: `
# Ultimate Driver Guide: Live Tracking & Parcel Delivery

Welcome to the ChariDay Logistics Engine. This guide explains the core features available to carriers:

## 1. Open Load Pool (Atomic Claim)
- **How it works:** Newly prepared merchant orders immediately appear in the Open Load Pool on the Overview dashboard (/logistics).
- **Claiming:** Click "Claim Load" to instantly reserve the parcel. It moves directly into your Active Shipments.

## 2. Live GPS Interactive Tracking
- Access the **Active Shipments** page (/logistics/active) to see your real-time delivery map.
- The map plots all your assigned tasks. Tap any map pin to pull up recipient contact info and quick-call actions.

## 3. PIN Verification (Proof of Delivery)
- To secure COD funds, you must ask the customer for their 4-digit **Delivery PIN** upon handover.
- Entering the correct PIN automatically marks the order as Delivered and logs your current GPS stamp for proof.
      `,
      translations: {
        ar: { title: 'دليل المندوب: استخدام خريطة التتبع اللحظي (GPS) وتأكيد التسليم برمز PIN' },
        en: { title: 'Driver Guide: Using Live GPS Tracking & PIN Verification' },
        fr: {
          title: 'Guide du Livreur: Suivi GPS en Direct et Validation par Code PIN',
          content: 'Bienvenue dans le moteur logistique ChariDay.\n\n## 1. Marché des Colis (Open Load Pool)\nLes nouvelles commandes apparaissent ici. Cliquez sur "Accepter" pour les réserver.\n\n## 2. Carte GPS en Direct\nConsultez vos livraisons actives sur la carte avec des marqueurs interactifs.\n\n## 3. Preuve de Livraison (Code PIN)\nDemandez le code PIN à 4 chiffres au client pour valider la livraison et enregistrer la position GPS.'
        }
      }
    },
    {
      slug: 'admin-logistics-monitoring-guide',
      category: 'admin',
      sortOrder: 2,
      title: 'دليل الأدمن: المراقبة الشاملة للوجستيات والمقاصة المالية',
      titleEn: 'Super Admin Guide: Global Logistics & Financial Clearing',
      content: `
# الدليل الشامل للأدمن: إدارة اللوجستيات 

يوفر هذا الدليل كيفية مراقبة أداء المناديب وتدفق الشحنات:

## 1. مراقبة العمليات اللوجستية (/admin-secure-internal/logistics)
- تتبع حالة جميع الشحنات، المناديب النشطين، وسوق الشحنات المفتوح.
- إمكانية الإلغاء القسري لأي شحنة معلقة أو إعادة تعيين مندوب.

## 2. المقاصة المالية للـ COD
- تتبع كافة المبالغ المحصلة عند الاستلام (Cash On Delivery) والتي تضاف لمحفظة المندوب الافتراضية بمجرد تأكيد التسليم بنجاح (برمز PIN).
- تصفية الحسابات دورياً وتحويل أرباح المتاجر.
      `,
      contentEn: `
# Super Admin Guide: Global Logistics Management

This guide explains how to monitor the platform's delivery performance:

## 1. Logistics Monitoring (/admin-secure-internal/logistics)
- Track all shipments, active drivers, and the Open Load Pool status globally.
- Force-cancel orders or reassign drivers if needed.

## 2. COD Financial Clearing
- Monitor COD funds automatically added to driver wallets after PIN verification.
- Perform periodic settlements with merchants.
      `,
      translations: {
        ar: { title: 'دليل الأدمن: المراقبة الشاملة للوجستيات والمقاصة المالية' },
        en: { title: 'Super Admin Guide: Global Logistics & Financial Clearing' },
        fr: {
          title: 'Guide Admin: Surveillance Logistique et Compensation Financière',
          content: 'Surveillez l\'ensemble des livraisons, les livreurs actifs et effectuez la compensation financière COD (Paiement à la livraison) depuis votre panneau de contrôle sécurisé.'
        }
      }
    }
  ];

  for (const art of articles) {
    await db.docArticle.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        titleEn: art.titleEn,
        content: art.content,
        contentEn: art.contentEn,
        translations: JSON.stringify(art.translations),
        isPublished: true,
      },
      create: {
        title: art.title,
        titleEn: art.titleEn,
        slug: art.slug,
        content: art.content,
        contentEn: art.contentEn,
        translations: JSON.stringify(art.translations),
        category: art.category,
        sortOrder: art.sortOrder,
        isPublished: true,
      },
    });
    console.log(`Seeded logistics article: ${art.slug}`);
  }
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
  });
