import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function createAccordion(arQ: string, arA: string, enQ: string, enA: string, frQ: string, frA: string) {
  return {
    type: "Accordion",
    props: {
      content: [
        { locale: "ar", title: arQ, html: `<p>${arA}</p>` },
        { locale: "en", title: enQ, html: `<p>${enA}</p>` },
        { locale: "fr", title: frQ, html: `<p>${frA}</p>` }
      ],
      id: "Accordion-" + Math.random().toString(36).substr(2, 9)
    }
  };
}

function createTitle(arT: string, enT: string, frT: string) {
  return {
    type: "RichText",
    props: {
      content: [
        { locale: "ar", html: `<h2 style="color: #0f172a; margin-top: 2rem;">${arT}</h2>` },
        { locale: "en", html: `<h2 style="color: #0f172a; margin-top: 2rem;">${enT}</h2>` },
        { locale: "fr", html: `<h2 style="color: #0f172a; margin-top: 2rem;">${frT}</h2>` }
      ],
      id: "Title-" + Math.random().toString(36).substr(2, 9)
    }
  };
}

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop",
          content: [
            { locale: "ar", title: "الأسئلة الشائعة (FAQ)", desc: "جمعنا لك هنا إجابات مفصلة عن أكثر الأسئلة شيوعاً لتوفير وقتك وتسهيل تجربتك في منصتنا." },
            { locale: "en", title: "Frequently Asked Questions (FAQ)", desc: "We've compiled detailed answers to the most common questions to save your time and facilitate your experience." },
            { locale: "fr", title: "Foire Aux Questions (FAQ)", desc: "Nous avons rassemblé ici des réponses détaillées aux questions les plus fréquentes pour faciliter votre expérience." }
          ],
          id: "Hero-FAQ"
        }
      },
      createTitle("🛒 للمشترين: الطلب والدفع", "🛒 For Buyers: Ordering & Payment", "🛒 Pour les acheteurs : Commande et paiement"),
      createAccordion(
        "كيف أقوم بطلب منتج من المنصة؟", "الأمر بسيط جداً! قم بتصفح المنتجات، اختر المنتج والمقاس/اللون المناسب، اضغط على 'إضافة إلى السلة'، ثم اذهب إلى سلة المشتريات واضغط على 'إتمام الطلب'. أدخل عنوانك التفصيلي واختر طريقة الدفع المناسبة لك.",
        "How do I order a product?", "It's very simple! Browse products, select your item, click 'Add to Cart', then proceed to checkout. Enter your detailed address and choose your preferred payment method.",
        "Comment puis-je commander un produit ?", "C'est très simple ! Parcourez les produits, sélectionnez votre article, cliquez sur 'Ajouter au panier', puis passez à la caisse."
      ),
      createAccordion(
        "هل الدفع عند الاستلام (COD) متوفر؟", "نعم، الدفع عند الاستلام متوفر في جميع ولايات الجزائر الـ 58. يمكنك الدفع نقداً لمندوب التوصيل عند استلام طردك يداً بيد.",
        "Is Cash on Delivery (COD) available?", "Yes, COD is available across all 58 Wilayas of Algeria. You can pay cash to the delivery agent upon receiving your package.",
        "Le paiement à la livraison (COD) est-il disponible ?", "Oui, le paiement à la livraison est disponible dans les 58 wilayas d'Algérie."
      ),
      createAccordion(
        "كيف يمكنني تتبع طلبي؟", "بمجرد تأكيد طلبك وشحنه، ستجد في حسابك ضمن قسم 'طلباتي' رقم التتبع الخاص بك. يمكنك استخدامه لمعرفة مكان الطرد بالضبط.",
        "How can I track my order?", "Once your order is shipped, you will find a tracking number in the 'My Orders' section of your account.",
        "Comment puis-je suivre ma commande ?", "Une fois votre commande expédiée, vous trouverez un numéro de suivi dans la section 'Mes Commandes'."
      ),
      createTitle("🚚 الشحن والاسترجاع", "🚚 Shipping & Returns", "🚚 Expédition et retours"),
      createAccordion(
        "كم يستغرق التوصيل عادةً؟", "تختلف المدة حسب الولاية. في الشمال تستغرق من 1-3 أيام عمل، وفي الشرق والغرب من 2-4 أيام، بينما في الجنوب قد تصل إلى 7 أيام.",
        "How long does delivery usually take?", "Delivery takes 1-3 days in the North, 2-4 days in the East and West, and up to 7 days in the South.",
        "Combien de temps prend généralement la livraison ?", "La livraison prend 1-3 jours au Nord, 2-4 jours à l'Est et à l'Ouest, et jusqu'à 7 jours au Sud."
      ),
      createAccordion(
        "هل يمكنني إرجاع منتج لم يعجبني؟", "نعم بالتأكيد! لديك الحق في إرجاع المنتج خلال 3 أيام من استلامه، بشرط أن يكون في حالته الأصلية وبغلافه الأصلي. يُرجى مراجعة 'سياسة الاسترجاع' لمزيد من التفاصيل.",
        "Can I return a product I don't like?", "Yes! You can return a product within 3 days of receiving it, provided it is in its original condition. Check our 'Return Policy' for details.",
        "Puis-je retourner un produit qui ne me plaît pas ?", "Oui ! Vous pouvez retourner un produit dans les 3 jours suivant sa réception, à condition qu'il soit dans son état d'origine."
      ),
      createTitle("💼 للبائعين والتجار", "💼 For Sellers & Merchants", "💼 Pour les vendeurs et commerçants"),
      createAccordion(
        "ما هي الشروط لفتح متجر على شاري داي؟", "لفتح متجر، يجب أن تمتلك سجلاً تجارياً (Registre de Commerce) أو بطاقة المقاول الذاتي، بالإضافة إلى رقم التعريف الجبائي (NIF) وحساب بنكي أو بريدي لاستلام أرباحك.",
        "What are the requirements to open a store?", "You must have a Commercial Register or Auto-Entrepreneur Card, a Tax ID (NIF), and a bank/postal account to receive your payouts.",
        "Quelles sont les conditions pour ouvrir une boutique ?", "Vous devez avoir un registre du commerce ou une carte d'auto-entrepreneur, un NIF et un compte bancaire/postal."
      ),
      createAccordion(
        "متى وكيف أستلم أرباح مبيعاتي؟", "نقوم بتحويل الأرباح إلى حسابك البنكي أو البريدي بشكل دوري ومنتظم (أسبوعياً أو نصف شهرياً) بعد انتهاء فترة الضمان والاسترجاع (3 أيام) لضمان حقوق المشتري.",
        "When and how do I receive my payouts?", "Payouts are transferred to your bank/postal account periodically after the 3-day return grace period ends safely.",
        "Quand et comment reçois-je mes paiements ?", "Les paiements sont transférés sur votre compte périodiquement après la période de grâce de 3 jours pour les retours."
      ),
      createAccordion(
        "من يتكفل بعملية الشحن؟", "المنصة متعاقدة مع شركات شحن كبرى. بمجرد أن يأتيك طلب، ما عليك سوى تغليفه وطباعة بوليصة الشحن من المنصة، وسيقوم مندوب الشحن بالمرور لاستلامه من مقرك.",
        "Who handles the shipping process?", "The platform has contracts with major shipping companies. Just pack the order, print the waybill, and the shipping agent will pick it up from you.",
        "Qui gère le processus d'expédition ?", "La plateforme collabore avec de grandes entreprises d'expédition. Emballez la commande et l'agent viendra la récupérer."
      )
    ],
    root: {},
    zones: {}
  });
}

const faqPage = {
  slug: 'faq',
  titleAr: 'الأسئلة الشائعة',
  titleEn: 'FAQ',
  titleFr: 'FAQ',
  titleJson: JSON.stringify({
    ar: 'الأسئلة الشائعة',
    en: 'FAQ',
    fr: 'FAQ'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: faqPage.slug },
    update: {
      titleAr: faqPage.titleAr,
      titleEn: faqPage.titleEn,
      titleFr: faqPage.titleFr,
      titleJson: faqPage.titleJson,
      content: faqPage.content
    },
    create: faqPage
  });
  console.log("Updated FAQ page with Accordions.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
