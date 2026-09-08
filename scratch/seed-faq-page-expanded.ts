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
            { locale: "ar", title: "الأسئلة الشائعة (FAQ)", desc: "مرجعك الشامل لكل ما يخص منصة شاري داي. إجابات مفصلة ودقيقة لتسهيل تجربتك سواء كنت مشترياً أو بائعاً." },
            { locale: "en", title: "Frequently Asked Questions (FAQ)", desc: "Your comprehensive guide for ChariDay. Detailed and accurate answers to facilitate your experience as a buyer or seller." },
            { locale: "fr", title: "Foire Aux Questions (FAQ)", desc: "Votre guide complet pour ChariDay. Des réponses détaillées et précises pour faciliter votre expérience en tant qu'acheteur ou vendeur." }
          ],
          id: "Hero-FAQ"
        }
      },
      
      // القسم الأول: الحسابات والتسجيل
      createTitle("👤 الحسابات والتسجيل", "👤 Accounts & Registration", "👤 Comptes et inscription"),
      createAccordion(
        "كيف يمكنني إنشاء حساب في منصة شاري داي؟", "يمكنك إنشاء حساب بسهولة عبر النقر على زر 'تسجيل الدخول / إنشاء حساب' في أعلى الصفحة. يمكنك استخدام بريدك الإلكتروني، أو التسجيل مباشرة وبشكل آمن وسريع عبر حسابك في Google. التسجيل مجاني تماماً للمشترين.",
        "How can I create an account on ChariDay?", "You can easily create an account by clicking 'Login / Sign Up' at the top of the page. You can use your email or sign up directly and securely with your Google account. Registration is completely free for buyers.",
        "Comment puis-je créer un compte sur ChariDay ?", "Vous pouvez facilement créer un compte en cliquant sur 'Se connecter / S'inscrire' en haut de la page. Vous pouvez utiliser votre adresse e-mail ou vous inscrire avec votre compte Google. L'inscription est gratuite."
      ),
      createAccordion(
        "ماذا أفعل إذا نسيت كلمة المرور الخاصة بي؟", "لا تقلق! اذهب إلى صفحة تسجيل الدخول، وانقر على 'نسيت كلمة المرور'. أدخل بريدك الإلكتروني المسجل لدينا، وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور خلال دقائق معدودة.",
        "What if I forget my password?", "Don't worry! Go to the login page and click 'Forgot Password'. Enter your registered email, and we'll send you a secure link to reset your password within minutes.",
        "Que faire si j'oublie mon mot de passe ?", "Ne vous inquiétez pas ! Allez sur la page de connexion et cliquez sur 'Mot de passe oublié'. Entrez votre e-mail et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe."
      ),
      createAccordion(
        "هل بياناتي الشخصية والبنكية آمنة؟", "نعم، أمان بياناتك هو أولويتنا. نستخدم أحدث تقنيات التشفير (SSL/TLS) لحماية كافة اتصالاتك ومعلوماتك. كما أننا لا نقوم ببيع أو مشاركة بياناتك مع أي طرف ثالث لأغراض تسويقية دون إذنك (يرجى مراجعة <a href='/pages/privacy-policy' style='color: #1ABB9C; text-decoration: underline;'>سياسة الخصوصية</a>).",
        "Are my personal and bank details safe?", "Yes, your data security is our priority. We use the latest encryption technologies (SSL/TLS) to protect all your information. We do not sell or share your data with third parties for marketing without your permission. Please review our <a href='/pages/privacy-policy' style='color: #1ABB9C; text-decoration: underline;'>Privacy Policy</a>.",
        "Mes données personnelles et bancaires sont-elles en sécurité ?", "Oui, la sécurité de vos données est notre priorité. Nous utilisons les dernières technologies de cryptage (SSL/TLS). Veuillez consulter notre <a href='/pages/privacy-policy' style='color: #1ABB9C; text-decoration: underline;'>Politique de Confidentialité</a>."
      ),

      // القسم الثاني: الطلبات والدفع
      createTitle("🛒 الطلب والدفع", "🛒 Ordering & Payment", "🛒 Commande et paiement"),
      createAccordion(
        "كيف أقوم بطلب منتج من المنصة؟", "الأمر بسيط جداً! قم بتصفح المنتجات، اختر المنتج والمقاس/اللون المناسب، اضغط على 'إضافة إلى السلة'، ثم اذهب إلى سلة المشتريات واضغط على 'إتمام الطلب'. أدخل عنوانك التفصيلي واختر طريقة الدفع المناسبة لك.",
        "How do I order a product?", "It's very simple! Browse products, select your item, click 'Add to Cart', then proceed to checkout. Enter your detailed address and choose your preferred payment method.",
        "Comment puis-je commander un produit ?", "C'est très simple ! Parcourez les produits, sélectionnez votre article, cliquez sur 'Ajouter au panier', puis passez à la caisse."
      ),
      createAccordion(
        "ما هي طرق الدفع المتاحة على المنصة؟", "لتوفير أقصى درجات المرونة، نوفر الدفع عند الاستلام (COD) حيث تدفع نقداً لمندوب التوصيل، بالإضافة إلى خيارات الدفع الإلكتروني عبر البطاقة الذهبية (Edahabia) أو بطاقة CIB.",
        "What payment methods are available?", "To provide maximum flexibility, we offer Cash on Delivery (COD) where you pay cash to the courier, in addition to electronic payment options via Edahabia or CIB cards.",
        "Quels sont les modes de paiement disponibles ?", "Pour offrir une flexibilité maximale, nous proposons le paiement à la livraison (COD) ainsi que le paiement en ligne par carte Edahabia ou CIB."
      ),
      createAccordion(
        "هل يمكنني تعديل أو إلغاء طلبي بعد تأكيده؟", "نعم، يمكنك إلغاء أو تعديل طلبك طالما أنه لا يزال في حالة 'قيد المعالجة' (Pending). بمجرد أن يتم تغيير حالته إلى 'تم الشحن' (Shipped)، لن تتمكن من تعديله عبر النظام وسيتوجب عليك استلامه أو التواصل مع <a href='/pages/help-and-support' style='color: #1ABB9C; text-decoration: underline;'>الدعم الفني</a>.",
        "Can I modify or cancel my order after confirmation?", "Yes, you can cancel or modify your order as long as it is still 'Pending'. Once the status changes to 'Shipped', you cannot modify it through the system. You can contact <a href='/pages/help-and-support' style='color: #1ABB9C; text-decoration: underline;'>Support</a>.",
        "Puis-je modifier ou annuler ma commande après confirmation ?", "Oui, vous pouvez annuler ou modifier votre commande tant qu'elle est 'En attente'. Une fois expédiée, vous ne pouvez plus la modifier via le système. Contactez le <a href='/pages/help-and-support' style='color: #1ABB9C; text-decoration: underline;'>Support</a>."
      ),

      // القسم الثالث: الشحن والتوصيل
      createTitle("🚚 الشحن والتوصيل", "🚚 Shipping & Delivery", "🚚 Expédition et livraison"),
      createAccordion(
        "كم يستغرق التوصيل عادةً؟ وهل يشمل كافة الولايات؟", "نحن نغطي جميع ولايات الجزائر الـ 58. تختلف المدة حسب الولاية: لمعرفة المزيد يرجى مراجعة <a href='/pages/shipping-policy' style='color: #1ABB9C; text-decoration: underline;'>سياسة الشحن</a>.",
        "How long does delivery take? Does it cover all Wilayas?", "We cover all 58 Wilayas. Delivery times vary by region. Please review our <a href='/pages/shipping-policy' style='color: #1ABB9C; text-decoration: underline;'>Shipping Policy</a> for more details.",
        "Combien de temps prend la livraison ? Couvre-t-elle toutes les wilayas ?", "Nous couvrons les 58 wilayas. Les délais varient. Veuillez consulter notre <a href='/pages/shipping-policy' style='color: #1ABB9C; text-decoration: underline;'>Politique d'Expédition</a> pour plus de détails."
      ),
      createAccordion(
        "كيف يمكنني تتبع طلبي خطوة بخطوة؟", "بمجرد تأكيد طلبك وشحنه، ستجد في حسابك ضمن قسم 'طلباتي' رقم التتبع الخاص بك (Tracking Number). يمكنك استخدامه لمعرفة مكان الطرد بالضبط ومتى سيصلك.",
        "How can I track my order step by step?", "Once shipped, you will find a Tracking Number in your 'My Orders' section. You can use it to know exactly where your package is.",
        "Comment puis-je suivre ma commande étape par étape ?", "Une fois expédiée, vous trouverez un numéro de suivi dans la section 'Mes Commandes'. Utilisez-le pour localiser votre colis."
      ),

      // القسم الرابع: الاسترجاع والضمان
      createTitle("🔄 الاسترجاع والضمان", "🔄 Returns & Warranties", "🔄 Retours et garanties"),
      createAccordion(
        "ما هي سياستكم بخصوص الاسترجاع؟", "يحق لك استرجاع المنتج خلال 3 أيام من تاريخ استلامه. يُرجى مراجعة <a href='/pages/return-policy' style='color: #1ABB9C; text-decoration: underline;'>سياسة الاسترجاع</a> لمزيد من التفاصيل حول الشروط والأحكام.",
        "What is your return policy?", "You can return a product within 3 days of receipt. Please review our <a href='/pages/return-policy' style='color: #1ABB9C; text-decoration: underline;'>Return Policy</a> for more details.",
        "Quelle est votre politique de retour ?", "Vous pouvez retourner un produit dans les 3 jours suivant sa réception. Veuillez consulter notre <a href='/pages/return-policy' style='color: #1ABB9C; text-decoration: underline;'>Politique de Retour</a> pour plus de détails."
      ),

      // القسم الخامس: البائعين والتجار
      createTitle("💼 للبائعين (الشركاء)", "💼 For Sellers (Partners)", "💼 Pour les vendeurs (Partenaires)"),
      createAccordion(
        "أنا تاجر / مقاول ذاتي، كيف يمكنني البيع على شاري داي؟", "نرحب بك كشريك! لفتح متجر، يرجى قراءة <a href='/pages/seller-agreement' style='color: #1ABB9C; text-decoration: underline;'>اتفاقية البائع</a> لمعرفة الشروط والمستندات المطلوبة، ثم انقر على 'انضم كبائع'.",
        "I'm a merchant/auto-entrepreneur, how can I sell on ChariDay?", "Welcome as a partner! Please read the <a href='/pages/seller-agreement' style='color: #1ABB9C; text-decoration: underline;'>Seller Agreement</a> to learn the requirements, then click 'Join as Seller'.",
        "Je suis commerçant / auto-entrepreneur, comment vendre sur ChariDay ?", "Bienvenue en tant que partenaire ! Veuillez lire l'<a href='/pages/seller-agreement' style='color: #1ABB9C; text-decoration: underline;'>Accord du vendeur</a>, puis cliquez sur 'Rejoindre en tant que vendeur'."
      ),
      createAccordion(
        "هل يجب علي أن أتعاقد مع شركة شحن بنفسي؟", "لا داعي لذلك! شاري داي متكاملة تقنياً مع كبرى شركات الشحن. اقرأ المزيد في <a href='/pages/terms-and-conditions' style='color: #1ABB9C; text-decoration: underline;'>الشروط والأحكام</a> الخاصة بنا.",
        "Do I need to contract with a shipping company myself?", "No need! ChariDay is integrated with major shipping companies. Read more in our <a href='/pages/terms-and-conditions' style='color: #1ABB9C; text-decoration: underline;'>Terms and Conditions</a>.",
        "Dois-je souscrire moi-même un contrat avec une société de transport ?", "Pas besoin ! ChariDay est intégré aux grandes sociétés de transport. Lisez nos <a href='/pages/terms-and-conditions' style='color: #1ABB9C; text-decoration: underline;'>Conditions Générales</a>."
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
  console.log("Updated FAQ page with LINKS.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
