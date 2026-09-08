import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const aboutAr = `
<h2>من نحن؟ قصة شاري داي</h2>
<p>مرحباً بك في منصة <b>شاري داي (ChariDay)</b>، الوجهة الجزائرية الأولى للتجارة الإلكترونية المتكاملة. تأسست شاري داي برؤية طموحة تهدف إلى إحداث ثورة في عالم التسوق الرقمي في الجزائر، من خلال بناء جسر من الثقة والمصداقية بين المشتري والبائع المحلي.</p>
<p>نحن لسنا مجرد متجر إلكتروني، بل نحن <b>نظام بيئي متكامل (Ecosystem)</b> يتيح للتجار والشركات والمقاولين الذاتيين فتح متاجرهم الخاصة، عرض منتجاتهم، والوصول إلى ملايين الزبائن في كافة ربوع الوطن بضغطة زر.</p>

<h2>رؤيتنا</h2>
<p>أن نصبح المنصة الرائدة والأكثر ثقة للتجارة الإلكترونية في شمال أفريقيا، عبر تمكين رواد الأعمال المحليين وتزويد المستهلكين بتجربة تسوق آمنة، سريعة، وعالية الجودة، تضاهي المعايير العالمية.</p>

<h2>مهمتنا (Mission)</h2>
<ul>
    <li><b>تمكين البائع المحلي:</b> نوفر للتجار أدوات تقنية متطورة (لوحة تحكم ذكية، نظام فواتير، وتقارير أرباح) لرقمنة تجارتهم وتوسيع نطاق مبيعاتهم من مجرد محل في ولاية واحدة إلى الـ 58 ولاية.</li>
    <li><b>حماية المستهلك الجزائري:</b> نطبق معايير صارمة لقبول البائعين وجودة المنتجات، ونتكفل بحفظ أموال المشتري حتى يصله المنتج سليماً ومطابقاً للوصف.</li>
    <li><b>الابتكار اللوجستي:</b> قمنا بالربط التقني المباشر مع كبرى شركات الشحن (مثل ياليدين إكسبريس) لضمان سرعة التوصيل وشفافية التتبع.</li>
</ul>

<h2>لماذا تختار شاري داي؟</h2>
<ul>
    <li><b>تغطية وطنية شاملة:</b> توصيل سريع وموثوق إلى جميع الولايات والبلديات الـ 58.</li>
    <li><b>خيارات دفع مرنة:</b> دعم كامل للدفع عند الاستلام (COD) وللدفع الإلكتروني (البطاقة الذهبية و CIB).</li>
    <li><b>دعم فني لا يتوقف:</b> فريق خدمة عملاء متواجد على مدار الساعة للرد على استفساراتك وحل أي مشكلة فوراً.</li>
    <li><b>حماية صارمة للبيانات:</b> منصة مبرمجة بأحدث تقنيات الويب (Next.js & Prisma) مع تشفير عالي للبيانات.</li>
</ul>

<h2>كلمة المؤسس</h2>
<p><i>"لقد بنينا شاري داي لأننا نؤمن أن التاجر الجزائري يستحق أداة احترافية لعرض سلعته، وأن المستهلك الجزائري يستحق خدمة راقية تحفظ حقوقه وتوفر له وقتًا وجهدًا. شاري داي هي نتاج عمل دؤوب وشغف بالتكنولوجيا، ونهدف لأن تكون قصة نجاح جزائرية بامتياز."</i></p>
`;

const aboutEn = `
<h2>Who Are We? The ChariDay Story</h2>
<p>Welcome to <b>ChariDay</b>, Algeria's premier integrated e-commerce platform. Founded with an ambitious vision, ChariDay aims to revolutionize digital shopping in Algeria by building a bridge of trust between local buyers and sellers.</p>
<p>We are not just an online store; we are a <b>complete ecosystem</b> that allows merchants, companies, and auto-entrepreneurs to open their own stores, showcase their products, and reach millions of customers nationwide with a single click.</p>

<h2>Our Vision</h2>
<p>To become the leading and most trusted e-commerce platform in North Africa by empowering local entrepreneurs and providing consumers with a safe, fast, and high-quality shopping experience that rivals global standards.</p>

<h2>Our Mission</h2>
<ul>
    <li><b>Empowering Local Sellers:</b> Providing advanced technical tools to digitize their businesses and expand their sales to all 58 Wilayas.</li>
    <li><b>Protecting the Algerian Consumer:</b> Applying strict standards for sellers and holding funds until the product is safely delivered and matches the description.</li>
    <li><b>Logistical Innovation:</b> Direct technical integration with major shipping companies to ensure fast delivery and transparent tracking.</li>
</ul>

<h2>Why Choose ChariDay?</h2>
<ul>
    <li><b>Full National Coverage:</b> Fast and reliable delivery to all 58 Wilayas and municipalities.</li>
    <li><b>Flexible Payments:</b> Full support for Cash on Delivery (COD) and electronic payments (Edahabia & CIB).</li>
    <li><b>Non-stop Support:</b> A 24/7 customer service team ready to resolve any issue instantly.</li>
</ul>
`;

const aboutFr = `
<h2>Qui sommes-nous ? L'histoire de ChariDay</h2>
<p>Bienvenue sur <b>ChariDay</b>, la première plateforme e-commerce intégrée d'Algérie. Fondée avec une vision ambitieuse, ChariDay vise à révolutionner le shopping numérique en Algérie en construisant un pont de confiance entre les acheteurs et les vendeurs locaux.</p>
<p>Nous ne sommes pas seulement une boutique en ligne ; nous sommes un <b>écosystème complet</b> qui permet aux commerçants et aux auto-entrepreneurs d'ouvrir leurs propres boutiques et d'atteindre des millions de clients à l'échelle nationale.</p>

<h2>Notre Vision</h2>
<p>Devenir la plateforme e-commerce leader et la plus fiable en Afrique du Nord en responsabilisant les entrepreneurs locaux et en offrant aux consommateurs une expérience d'achat sûre, rapide et de haute qualité.</p>

<h2>Notre Mission</h2>
<ul>
    <li><b>Responsabiliser le vendeur local :</b> Fournir des outils techniques avancés pour numériser leurs activités et étendre leurs ventes aux 58 wilayas.</li>
    <li><b>Protéger le consommateur algérien :</b> Appliquer des normes strictes pour les vendeurs et conserver les fonds jusqu'à ce que le produit soit livré en toute sécurité.</li>
    <li><b>Innovation Logistique :</b> Intégration technique directe avec les grandes entreprises d'expédition pour assurer une livraison rapide et un suivi transparent.</li>
</ul>

<h2>Pourquoi choisir ChariDay ?</h2>
<ul>
    <li><b>Couverture Nationale Complète :</b> Livraison rapide et fiable dans les 58 wilayas.</li>
    <li><b>Paiements Flexibles :</b> Prise en charge complète du paiement à la livraison (COD) et des paiements électroniques (Edahabia & CIB).</li>
    <li><b>Support en Continu :</b> Une équipe de service client disponible 24/7 pour résoudre tout problème instantanément.</li>
</ul>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop",
          content: [
            { locale: "ar", title: "من نحن؟", desc: "اكتشف قصة منصة شاري داي، ورؤيتنا في إحداث ثورة في عالم التجارة الإلكترونية في الجزائر." },
            { locale: "en", title: "About Us", desc: "Discover the story of ChariDay and our vision to revolutionize e-commerce in Algeria." },
            { locale: "fr", title: "À propos de nous", desc: "Découvrez l'histoire de ChariDay et notre vision pour révolutionner le e-commerce en Algérie." }
          ],
          id: "Hero-About"
        }
      },
      {
        type: "RichText",
        props: {
          content: [
            { locale: "ar", html: aboutAr },
            { locale: "en", html: aboutEn },
            { locale: "fr", html: aboutFr }
          ],
          id: "RichText-About"
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const aboutPage = {
  slug: 'about-us',
  titleAr: 'من نحن',
  titleEn: 'About Us',
  titleFr: 'À propos de nous',
  titleJson: JSON.stringify({
    ar: 'من نحن',
    en: 'About Us',
    fr: 'À propos de nous'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: aboutPage.slug },
    update: {
      titleAr: aboutPage.titleAr,
      titleEn: aboutPage.titleEn,
      titleFr: aboutPage.titleFr,
      titleJson: aboutPage.titleJson,
      content: aboutPage.content
    },
    create: aboutPage
  });
  console.log("Updated about us page.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
