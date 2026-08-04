const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = [
    {
      title: "دليل المقاصة المالية والدفع عند الاستلام (COD)",
      titleEn: "Financial Reconciliation & COD Guide",
      content: `
# نظام القيد المزدوج في ChariDay
تم تصميم نظام ChariDay المالي لضمان الشفافية التامة ومنع أي أخطاء حسابية باستخدام نظام **القيد المزدوج (Double-Entry Ledger)**.
كل حركة مالية تُسجل كقيد دائم (مدين/دائن) ولا يمكن مسحها.

## الدفع عند الاستلام (COD) والحد الائتماني
عندما يقوم المندوب بتأكيد تسليم شحنة (COD)، يُسجل المبلغ آلياً كـ **دَين (Debt)** في محفظته لصالح المنصة.
* **الحد الائتماني:** تخضع حسابات المناديب (سواء مستقلين أو موظفين) لحد أقصى للديون.
* **الحظر الآلي:** إذا بلغ ديون المندوب هذا الحد، يتدخل النظام برمجياً ويخفي "سوق الشحنات" عنه، ولن يتمكن من استلام أي طلبات جديدة حتى يقوم بتسديد المبالغ المستحقة للشركة.

## فترة احتجاز الأرباح للتجار (Payout Hold Period)
حمايةً لحقوق الزبائن في حالات الإرجاع أو الشكاوى، فإن الأرباح الناتجة عن مبيعات COD لا تصبح قابلة للسحب فوراً.
تبقى الأرباح في حالة **معلقة (Pending Clearance)** لمدة 3 أيام، وبعدها يقوم النظام الآلي بتحويلها إلى رصيد **متاح للسحب (Available)**.

## تصفير العهدة والتسوية
* لتصفير العهدة، يجب تقديم **رقم مرجعي (Reference Number)** لإيصال الإيداع البنكي أو وصل الخزينة. لا يوجد تصفير يدوي بدون إثبات.
      `,
      contentEn: `
# Double-Entry Ledger System in ChariDay
ChariDay's financial system is designed to ensure complete transparency using a **Double-Entry Ledger**.

## COD and Credit Limits
When a driver delivers a COD order, the amount is automatically recorded as a **Debt** in their wallet.
* **Credit Limit:** Drivers are subject to a maximum debt limit.
* **Automated Blocking:** Once this limit is reached, the system hides the "Load Pool" preventing them from claiming new shipments until they settle their debt.

## Payout Hold Period for Sellers
To protect buyers in case of returns, profits from COD sales are held in a **Pending Clearance** state for 3 days before becoming **Available** for withdrawal.

## Debt Settlement
Clearing a driver's debt requires a **Reference Number** (Bank Deposit Receipt). No manual clearing is allowed without proof.
      `,
      translations: {
        fr: {
          title: "Guide de réconciliation financière et COD",
          content: `
# Système de Grand Livre en Partie Double dans ChariDay
Le système financier de ChariDay assure une transparence totale grâce à un **Grand Livre en Partie Double**.

## COD et Limites de Crédit
Lorsqu'un livreur livre une commande COD, le montant est enregistré comme une **Dette**.
* **Limite de Crédit:** Les livreurs sont soumis à un plafond de dette.
* **Blocage Automatique:** Une fois ce plafond atteint, le livreur ne peut plus réclamer de nouvelles expéditions avant de régler sa dette.

## Période de Retenue des Paiements (Payout Hold)
Pour protéger les acheteurs en cas de retours, les profits COD restent **En Attente** pendant 3 jours avant de devenir **Disponibles**.

## Règlement des Dettes
L'apurement de la dette d'un livreur nécessite un **Numéro de Référence** (Reçu bancaire).
          `
        }
      },
      category: "general",
      slug: "financial-ledger-cod-guide",
      isPublished: true,
    }
  ];

  for (const doc of articles) {
    await prisma.docArticle.upsert({
      where: { slug: doc.slug },
      update: {
        title: doc.title,
        titleEn: doc.titleEn,
        content: doc.content,
        contentEn: doc.contentEn,
        translations: doc.translations,
        isPublished: true
      },
      create: {
        ...doc,
      },
    });
  }
  console.log('Finance docs seeded successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
