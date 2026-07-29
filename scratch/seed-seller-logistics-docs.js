const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const articles = [
    {
      slug: 'merchant-automated-logistics-guide',
      category: 'sellers',
      sortOrder: 17,
      title: 'دليل التاجر: الشحن الآلي وترحيل الطلبات لسوق المناديب',
      titleEn: 'Merchant Guide: Automated Shipping & Load Pool Dispatch',
      content: `
# الترحيل الآلي للشحنات: كيف يصل طلبك للمندوب؟

تهدف منصة ChariDay إلى جعل تجربة التاجر أسهل ما يمكن، ولذلك قمنا بأتمتة (Automate) عملية الشحن بالكامل دون الحاجة لأي خطوات معقدة.

## 1. كيف يتم إرسال الطلب للمندوب؟
- **لا تحتاج لأي زر إضافي!** بمجرد أن يقوم الزبون بإتمام الطلب، سيظهر لك في لوحة الطلبات الخاصة بك بحالة **(قيد الانتظار - Pending)**.
- كل ما عليك فعله هو الضغط على **(تأكيد الطلب - Confirm)** أو **(تجهيز الطلب - Processing)**.
- في تلك اللحظة بالذات، يقوم النظام تلقائياً برفع طلبك إلى **سوق الشحنات المفتوح (Open Load Pool)** ليراه كافة المناديب المتواجدين في الميدان.

## 2. تتبع حالة الشحنة
- عندما يرى المندوب طلبك في السوق المفتوح ويضغط على (قبول واقتناص)، ستتغير حالة الطلب لديك تلقائياً إلى **(تم الشحن / مع المندوب - Shipped / Picked Up)**.
- هذا يعني أن المندوب في طريقه لاستلام الشحنة منك وتوصيلها للزبون.

## 3. تأكيد التسليم وأموال الـ COD
- بمجرد أن يوصل المندوب الشحنة للزبون، سيطلب من الزبون كود التوصيل (Delivery PIN).
- عند إدخال الكود، تتحول حالة الطلب لديك إلى **(تم التسليم - Delivered)**، ويتم إيداع مبلغ الـ COD تلقائياً في دورة المقاصة المالية.
      `,
      contentEn: `
# Automated Shipping: How Your Orders Reach Drivers

ChariDay automates the entire shipping process for merchants. You don't need to manually contact or dispatch drivers.

## 1. How to Dispatch an Order?
- **No extra buttons needed!** When a customer buys from your store, the order appears as **Pending**.
- Simply click **Confirm Order** or change its status to **Processing**.
- Instantly, our Logistics Engine pushes your order into the **Open Load Pool**, visible to all active carriers.

## 2. Tracking the Shipment
- Once a driver clicks "Claim" on your order, your dashboard automatically updates the order status to **Shipped / Picked Up**.

## 3. Delivery & COD Settlement
- When the driver delivers the package, they verify it using a customer **Delivery PIN**.
- The order status instantly becomes **Delivered**, and the collected COD (Cash on Delivery) enters the financial clearing cycle.
      `,
      translations: {
        ar: { title: 'دليل التاجر: الشحن الآلي وترحيل الطلبات لسوق المناديب' },
        en: { title: 'Merchant Guide: Automated Shipping & Load Pool Dispatch' },
        fr: {
          title: 'Guide Marchand: Expédition Automatisée',
          content: 'L\'expédition est 100% automatisée sur ChariDay.\n\n## 1. Comment expédier ?\nDès que vous marquez une commande comme "Confirmée" ou "En préparation", elle est automatiquement envoyée sur le marché des livreurs (Open Load Pool).\n\n## 2. Suivi\nLorsqu\'un livreur accepte votre colis, le statut passe automatiquement à "Expédié".\n\n## 3. Livraison (Code PIN)\nLa livraison est confirmée via un code PIN, sécurisant ainsi vos fonds COD.'
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
    console.log(`Seeded seller logistics article: ${art.slug}`);
  }
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
  });
