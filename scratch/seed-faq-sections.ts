import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

let currentId = 1;
function genId(prefix: string) {
  return `${prefix}-${currentId++}`;
}

function createAccordion(qAr: string, qEn: string, qFr: string, aAr: string, aEn: string, aFr: string) {
  return {
    type: "Accordion",
    props: {
      content: [
        { locale: "ar", title: qAr, html: `<p>${aAr}</p>` },
        { locale: "en", title: qEn, html: `<p>${aEn}</p>` },
        { locale: "fr", title: qFr, html: `<p>${aFr}</p>` }
      ],
      id: genId("Accordion")
    }
  };
}

function createSection(titleAr: string, titleEn: string, titleFr: string, items: any[]) {
  const sectionId = genId("Section");
  return {
    sectionComponent: {
      type: "Section",
      props: {
        bgColor: "#ffffff",
        content: [
          { locale: "ar", title: titleAr },
          { locale: "en", title: titleEn },
          { locale: "fr", title: titleFr }
        ],
        id: sectionId
      }
    },
    sectionZoneId: `${sectionId}:content`,
    items: items
  };
}

function createPagePuckData() {
  const categories = [
    createSection("👤 الحسابات والتسجيل", "👤 Accounts & Registration", "👤 Comptes et Inscription", [
      createAccordion(
        "كيف يمكنني إنشاء حساب جديد؟",
        "How can I create a new account?",
        "Comment puis-je créer un nouveau compte ?",
        "يمكنك إنشاء حساب جديد بالضغط على زر 'تسجيل الدخول' في أعلى الصفحة، ثم اختيار 'إنشاء حساب جديد'. اتبع التعليمات البسيطة لملء بياناتك.",
        "You can create a new account by clicking the 'Login' button at the top of the page, then selecting 'Create a new account'. Follow the simple instructions to fill in your details.",
        "Vous pouvez créer un nouveau compte en cliquant sur le bouton 'Connexion' en haut de la page, puis en sélectionnant 'Créer un nouveau compte'. Suivez les instructions simples pour remplir vos coordonnées."
      ),
      createAccordion(
        "نسيت كلمة المرور، ماذا أفعل؟",
        "I forgot my password, what should I do?",
        "J'ai oublié mon mot de passe, que dois-je faire ?",
        "لا تقلق! في صفحة تسجيل الدخول، انقر على 'نسيت كلمة المرور'. أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيينها.",
        "Don't worry! On the login page, click 'Forgot Password'. Enter your email and we will send you a link to reset it.",
        "Ne vous inquiétez pas ! Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre e-mail et nous vous enverrons un lien pour le réinitialiser."
      )
    ]),
    createSection("💳 الدفع والفوترة", "💳 Payment & Billing", "💳 Paiement et Facturation", [
      createAccordion(
        "ما هي طرق الدفع المتاحة؟",
        "What payment methods are available?",
        "Quels sont les modes de paiement disponibles ?",
        "لتوفير أقصى مرونة، نوفر الدفع عند الاستلام (COD) حيث تدفع نقداً للمندوب، بالإضافة إلى خيارات الدفع الإلكتروني عبر بطاقات الذهبية أو CIB.",
        "To provide maximum flexibility, we offer Cash on Delivery (COD) where you pay cash to the courier, in addition to electronic payment options via Edahabia or CIB cards.",
        "Pour offrir une flexibilité maximale, nous proposons le paiement à la livraison (COD) ainsi que le paiement en ligne par carte Edahabia ou CIB."
      ),
      createAccordion(
        "هل يمكنني تعديل أو إلغاء طلبي بعد تأكيده؟",
        "Can I modify or cancel my order after confirmation?",
        "Puis-je modifier ou annuler ma commande après confirmation ?",
        "نعم، يمكنك إلغاء أو تعديل طلبك طالما أنه لا يزال في حالة 'قيد الانتظار' (Pending). بمجرد أن يتغير حالته إلى 'تم الشحن' (Shipped) لن تتمكن من تعديله عبر النظام. يرجى التواصل مع <a href='/pages/help-and-support' style='color: #1ABB9C; text-decoration: underline;'>الدعم الفني</a>.",
        "Yes, you can cancel or modify your order as long as it is still 'Pending'. Once the status changes to 'Shipped', you cannot modify it through the system. You can contact <a href='/pages/help-and-support' style='color: #1ABB9C; text-decoration: underline;'>Support</a>.",
        "Oui, vous pouvez annuler ou modifier votre commande tant qu'elle est 'En attente'. Une fois expédiée, vous ne pouvez plus la modifier via le système. Contactez le <a href='/pages/help-and-support' style='color: #1ABB9C; text-decoration: underline;'>Support</a>."
      )
    ]),
    createSection("🚚 الشحن والتوصيل", "🚚 Shipping & Delivery", "🚚 Expédition et livraison", [
      createAccordion(
        "كم يستغرق الشحن والتوصيل؟ وهل يغطي كل الولايات؟",
        "How long does delivery take? Does it cover all Wilayas?",
        "Combien de temps prend la livraison ? Couvre-t-elle toutes les wilayas ?",
        "نحن نغطي جميع ولايات الوطن الـ 58. تختلف المدة حسب الولاية، يرجى مراجعة <a href='/pages/shipping-policy' style='color: #1ABB9C; text-decoration: underline;'>سياسة الشحن</a>.",
        "We cover all 58 Wilayas. Delivery times vary by region. Please review our <a href='/pages/shipping-policy' style='color: #1ABB9C; text-decoration: underline;'>Shipping Policy</a> for more details.",
        "Nous couvrons les 58 wilayas. Les délais varient. Veuillez consulter notre <a href='/pages/shipping-policy' style='color: #1ABB9C; text-decoration: underline;'>Politique d'Expédition</a> pour plus de détails."
      ),
      createAccordion(
        "كيف يمكنني تتبع طلبي خطوة بخطوة؟",
        "How can I track my order step by step?",
        "Comment puis-je suivre ma commande étape par étape ?",
        "بمجرد شحن طلبك، ستجد رقم تتبع (Tracking Number) في قسم 'طلباتي'. يمكنك استخدامه لمعرفة أين طردك بالتفصيل.",
        "Once shipped, you will find a Tracking Number in your 'My Orders' section. You can use it to know exactly where your package is.",
        "Une fois expédiée, vous trouverez un numéro de suivi dans la section 'Mes Commandes'. Utilisez-le pour localiser votre colis."
      )
    ]),
    createSection("🔄 الاسترجاع والضمان", "🔄 Returns & Warranties", "🔄 Retours et garanties", [
      createAccordion(
        "ما هي سياستكم بشأن الاسترجاع؟",
        "What is your return policy?",
        "Quelle est votre politique de retour ?",
        "يحق لك استرجاع المنتج خلال 3 أيام من استلامه. يرجى مراجعة <a href='/pages/return-policy' style='color: #1ABB9C; text-decoration: underline;'>سياسة الاسترجاع</a> لمزيد من التفاصيل.",
        "You can return a product within 3 days of receipt. Please review our <a href='/pages/return-policy' style='color: #1ABB9C; text-decoration: underline;'>Return Policy</a> for more details.",
        "Vous pouvez retourner un produit dans les 3 jours suivant sa réception. Veuillez consulter notre <a href='/pages/return-policy' style='color: #1ABB9C; text-decoration: underline;'>Politique de Retour</a> pour plus de détails."
      )
    ]),
    createSection("🤝 للبائعين (الشركاء)", "🤝 For Sellers (Partners)", "🤝 Pour les vendeurs (Partenaires)", [
      createAccordion(
        "أنا تاجر / مقاول ذاتي، كيف يمكنني البيع على شاري داي؟",
        "I'm a merchant/auto-entrepreneur, how can I sell on ChariDay?",
        "Je suis commerçant / auto-entrepreneur, comment vendre sur ChariDay ?",
        "نرحب بك كشريك! يرجى قراءة <a href='/pages/seller-agreement' style='color: #1ABB9C; text-decoration: underline;'>اتفاقية البائع</a> لمعرفة الشروط والمتطلبات، ثم انقر على 'انضم كبائع'.",
        "Welcome as a partner! Please read the <a href='/pages/seller-agreement' style='color: #1ABB9C; text-decoration: underline;'>Seller Agreement</a> to learn the requirements, then click 'Join as Seller'.",
        "Bienvenue en tant que partenaire ! Veuillez lire l'<a href='/pages/seller-agreement' style='color: #1ABB9C; text-decoration: underline;'>Accord du vendeur</a>, puis cliquez sur 'Rejoindre en tant que vendeur'."
      ),
      createAccordion(
        "هل يجب علي التعاقد مع شركة شحن بنفسي؟",
        "Do I need to contract with a shipping company myself?",
        "Dois-je souscrire moi-même un contrat avec une société de transport ?",
        "لا حاجة لذلك! شاري داي متكاملة كلياً مع شركات الشحن. اقرأ المزيد في <a href='/pages/terms-and-conditions' style='color: #1ABB9C; text-decoration: underline;'>الشروط والأحكام</a> الخاصة بنا.",
        "No need! ChariDay is integrated with major shipping companies. Read more in our <a href='/pages/terms-and-conditions' style='color: #1ABB9C; text-decoration: underline;'>Terms and Conditions</a>.",
        "Pas besoin ! ChariDay est intégré aux grandes sociétés de transport. Lisez nos <a href='/pages/terms-and-conditions' style='color: #1ABB9C; text-decoration: underline;'>Conditions Générales</a>."
      )
    ])
  ];

  const content = [
    {
      type: "Hero",
      props: {
        bgImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop",
        content: [
          { locale: "ar", title: "الأسئلة الشائعة", desc: "إجابات شافية ووافية لكل ما يدور في ذهنك حول المنصة." },
          { locale: "en", title: "Frequently Asked Questions", desc: "Comprehensive answers to everything on your mind about the platform." },
          { locale: "fr", title: "Foire Aux Questions", desc: "Des réponses complètes à toutes vos questions sur la plateforme." }
        ],
        id: "Hero-FAQ"
      }
    },
    ...categories.map(c => c.sectionComponent)
  ];

  const zones: Record<string, any[]> = {};
  categories.forEach(c => {
    zones[c.sectionZoneId] = c.items;
  });

  return JSON.stringify({
    content,
    root: {},
    zones
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
      content: faqPage.content
    },
    create: faqPage
  });
  console.log("Updated FAQ page to use grouped sections.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
