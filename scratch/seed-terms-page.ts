import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const termsAr = `
<h2>المقدمة والقبول</h2>
<p>مرحباً بكم في شاري داي (ChariDay). تحدد هذه الشروط والأحكام القواعد واللوائح الخاصة باستخدام منصتنا، بما يتوافق مع القوانين التجارية المعمول بها في الجمهورية الجزائرية الديمقراطية الشعبية والتشريعات المتعلقة بالتجارة الإلكترونية (القانون 18-05).</p>
<p>بوصولك إلى هذا الموقع واستخدامه، فإنك توافق على الامتثال لهذه الشروط والأحكام. إذا كنت لا توافق على جميع الشروط والأحكام الواردة في هذه الصفحة، يُرجى عدم استخدام منصة شاري داي.</p>

<h2>حقوق الملكية الفكرية</h2>
<p>ما لم يُنص على خلاف ذلك، تمتلك شاري داي و/أو المرخصون لها حقوق الملكية الفكرية لجميع المواد الموجودة على المنصة. جميع حقوق الملكية الفكرية محفوظة.</p>
<ul>
    <li>يُمنع إعادة نشر المواد من شاري داي.</li>
    <li>يُمنع بيع أو تأجير أو ترخيص المواد من شاري داي.</li>
    <li>يُمنع إعادة إنتاج أو نسخ المواد من شاري داي.</li>
</ul>

<h2>شروط النقل والتوصيل (بالشراكة مع ياليدين)</h2>
<p>نحن نعتمد في توصيل طلبياتنا على شركاء لوجستيين معتمدين مثل "ياليدين إكسبريس" لضمان التوصيل الآمن والسريع عبر 58 ولاية. تخضع خدمات النقل للشروط التالية:</p>
<ul>
    <li><b>مدة التوصيل:</b> تختلف حسب الولاية، وتتراوح عادة بين 24 ساعة للولايات الشمالية والوسطى، و3 إلى 5 أيام لولايات الجنوب.</li>
    <li><b>الطرود والمغلفات:</b> تشمل خدمات التوصيل الطرود التي لا يتجاوز وزنها الفعلي أو الحجمي 20 كغ للتوصيل المنزلي.</li>
    <li><b>فتح الطرد قبل تأكيد التسليم:</b> يُمنع فتح الطرد قبل دفع مستحقاته لعامل التوصيل، وفي حال السماح بذلك بشكل استثنائي، تُعفى شركة النقل والمنصة من أية مسؤولية في حالة التلف أو النقص.</li>
</ul>

<h2>المواد المحظورة من النقل والبيع</h2>
<p>يُحظر تماماً بيع أو شحن المواد التالية عبر منصتنا، وفقاً لقوانين التجارة الجزائرية وشروط شركات النقل:</p>
<ul>
    <li>المشروبات الكحولية والمؤثرات العقلية.</li>
    <li>الأسلحة النارية والأسلحة البيضاء والذخائر.</li>
    <li>المواد سريعة الاشتعال، المتفجرات، والألعاب النارية.</li>
    <li>المواد الإشعاعية أو الكيميائية الخطرة.</li>
    <li>الحيوانات الحية والنباتات الممنوعة.</li>
    <li>الأوراق النقدية والعملات الأجنبية غير المصرح بها.</li>
</ul>

<h2>سياسة الدفع والفوترة</h2>
<p>نوفر خيارات دفع متعددة لتسهيل تجربة الشراء:</p>
<ul>
    <li><b>الدفع عند الاستلام (C.O.D):</b> الدفع نقداً عند استلام الطرد، وهو متاح لجميع الطلبيات التي لا تتجاوز قيمتها 150,000 دج.</li>
    <li><b>الدفع الإلكتروني:</b> سيتم توفيره قريباً عبر البطاقات الذهبية والبنكية CIB.</li>
</ul>
<p>يتوجب على المشتري دفع المبلغ الإجمالي الموضح في الفاتورة، والذي يشمل سعر المنتج وتكلفة التوصيل. تحتفظ المنصة بحق إلغاء الطلبات التي يُشتبه في كونها وهمية أو احتيالية.</p>

<h2>إخلاء المسؤولية وتحديد المسؤولية</h2>
<p>إلى أقصى حد يسمح به القانون المعمول به، نستبعد جميع الإقرارات والضمانات والشروط المتعلقة بموقعنا واستخدام هذا الموقع. لا تتحمل شاري داي أي مسؤولية عن الأضرار المباشرة أو غير المباشرة الناتجة عن تأخير شركات الشحن أو سوء استخدام المنتجات من قبل المشتري.</p>

<h2>القانون المطبق وحل النزاعات</h2>
<p>تخضع هذه الشروط والأحكام وتُفسر وفقاً لقوانين الجمهورية الجزائرية. أي نزاع ينشأ عن استخدام المنصة يخضع للاختصاص الحصري للمحاكم الجزائرية المختصة.</p>
`;

const termsEn = `
<h2>Introduction and Acceptance</h2>
<p>Welcome to ChariDay. These terms and conditions outline the rules and regulations for the use of our platform, in accordance with the commercial laws applicable in the People's Democratic Republic of Algeria and legislation relating to e-commerce (Law 18-05).</p>
<p>By accessing and using this website, you agree to comply with these terms and conditions. If you do not agree to all the terms and conditions stated on this page, please do not use the ChariDay platform.</p>

<h2>Intellectual Property Rights</h2>
<p>Unless otherwise stated, ChariDay and/or its licensors own the intellectual property rights for all material on the platform. All intellectual property rights are reserved.</p>
<ul>
    <li>You must not republish material from ChariDay.</li>
    <li>You must not sell, rent, or sub-license material from ChariDay.</li>
    <li>You must not reproduce, duplicate, or copy material from ChariDay.</li>
</ul>

<h2>Transport and Delivery Terms (in partnership with Yalidine)</h2>
<p>We rely on certified logistics partners like "Yalidine Express" to ensure safe and fast delivery across 58 wilayas. Transport services are subject to the following conditions:</p>
<ul>
    <li><b>Delivery Time:</b> Varies by Wilaya, typically ranging between 24 hours for Northern and Central Wilayas, and 3 to 5 days for Southern Wilayas.</li>
    <li><b>Parcels and Envelopes:</b> Delivery services include parcels whose actual or volumetric weight does not exceed 20 kg for home delivery.</li>
    <li><b>Opening the parcel before delivery confirmation:</b> It is prohibited to open the parcel before paying its dues to the delivery agent. If exceptionally allowed, the transport company and the platform are exempt from any liability in case of damage or shortage.</li>
</ul>

<h2>Prohibited Items for Sale and Transport</h2>
<p>It is strictly prohibited to sell or ship the following items via our platform, in accordance with Algerian trade laws and transport company conditions:</p>
<ul>
    <li>Alcoholic beverages and psychotropic substances.</li>
    <li>Firearms, bladed weapons, and ammunition.</li>
    <li>Flammable materials, explosives, and fireworks.</li>
    <li>Radioactive or hazardous chemical materials.</li>
    <li>Live animals and prohibited plants.</li>
    <li>Banknotes and unauthorized foreign currencies.</li>
</ul>

<h2>Payment and Billing Policy</h2>
<p>We provide multiple payment options to facilitate the purchasing experience:</p>
<ul>
    <li><b>Cash on Delivery (C.O.D):</b> Payment in cash upon receipt of the parcel, available for all orders not exceeding 150,000 DZD.</li>
    <li><b>Electronic Payment:</b> Will be available soon via Edahabia and CIB bank cards.</li>
</ul>
<p>The buyer must pay the total amount shown on the invoice, which includes the product price and delivery cost. The platform reserves the right to cancel orders suspected of being fake or fraudulent.</p>

<h2>Disclaimer and Limitation of Liability</h2>
<p>To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website. ChariDay shall not be held liable for any direct or indirect damages resulting from shipping delays or product misuse by the buyer.</p>

<h2>Applicable Law and Dispute Resolution</h2>
<p>These terms and conditions are governed by and construed in accordance with the laws of the Algerian Republic. Any dispute arising from the use of the platform is subject to the exclusive jurisdiction of the competent Algerian courts.</p>
`;

const termsFr = `
<h2>Introduction et Acceptation</h2>
<p>Bienvenue sur ChariDay. Ces termes et conditions décrivent les règles et règlements pour l'utilisation de notre plateforme, conformément aux lois commerciales applicables en République Algérienne Démocratique et Populaire et à la législation relative au commerce électronique (Loi 18-05).</p>
<p>En accédant et en utilisant ce site Web, vous acceptez de vous conformer à ces termes et conditions. Si vous n'acceptez pas tous les termes et conditions énoncés sur cette page, veuillez ne pas utiliser la plateforme ChariDay.</p>

<h2>Droits de Propriété Intellectuelle</h2>
<p>Sauf indication contraire, ChariDay et/ou ses concédants de licence détiennent les droits de propriété intellectuelle de tout le matériel sur la plateforme. Tous les droits de propriété intellectuelle sont réservés.</p>
<ul>
    <li>Vous ne devez pas republier le matériel de ChariDay.</li>
    <li>Vous ne devez pas vendre, louer ou sous-licencier le matériel de ChariDay.</li>
    <li>Vous ne devez pas reproduire, dupliquer ou copier le matériel de ChariDay.</li>
</ul>

<h2>Conditions de Transport et de Livraison (en partenariat avec Yalidine)</h2>
<p>Nous nous appuyons sur des partenaires logistiques certifiés comme "Yalidine Express" pour assurer une livraison sûre et rapide à travers les 58 wilayas. Les services de transport sont soumis aux conditions suivantes :</p>
<ul>
    <li><b>Délai de livraison :</b> Varie selon la Wilaya, allant généralement de 24 heures pour les Wilayas du Nord et du Centre, à 3 à 5 jours pour les Wilayas du Sud.</li>
    <li><b>Colis et enveloppes :</b> Les services de livraison incluent les colis dont le poids réel ou volumétrique ne dépasse pas 20 kg pour la livraison à domicile.</li>
    <li><b>Ouverture du colis avant confirmation de livraison :</b> Il est interdit d'ouvrir le colis avant d'avoir payé ses frais à l'agent de livraison. Si exceptionnellement autorisé, la société de transport et la plateforme sont exemptées de toute responsabilité en cas de dommage ou de manque.</li>
</ul>

<h2>Articles Interdits à la Vente et au Transport</h2>
<p>Il est strictement interdit de vendre ou d'expédier les articles suivants via notre plateforme, conformément aux lois commerciales algériennes et aux conditions des sociétés de transport :</p>
<ul>
    <li>Boissons alcoolisées et substances psychotropes.</li>
    <li>Armes à feu, armes blanches et munitions.</li>
    <li>Matières inflammables, explosifs et feux d'artifice.</li>
    <li>Matières radioactives ou chimiques dangereuses.</li>
    <li>Animaux vivants et plantes interdites.</li>
    <li>Billets de banque et devises étrangères non autorisées.</li>
</ul>

<h2>Politique de Paiement et de Facturation</h2>
<p>Nous proposons plusieurs options de paiement pour faciliter l'expérience d'achat :</p>
<ul>
    <li><b>Paiement à la livraison (C.O.D) :</b> Paiement en espèces à la réception du colis, disponible pour toutes les commandes ne dépassant pas 150 000 DZD.</li>
    <li><b>Paiement Électronique :</b> Sera bientôt disponible via les cartes bancaires Edahabia et CIB.</li>
</ul>
<p>L'acheteur doit payer le montant total indiqué sur la facture, qui inclut le prix du produit et les frais de livraison. La plateforme se réserve le droit d'annuler les commandes suspectées d'être fausses ou frauduleuses.</p>

<h2>Clause de Non-responsabilité et Limitation de Responsabilité</h2>
<p>Dans toute la mesure permise par la loi applicable, nous excluons toutes les représentations, garanties et conditions relatives à notre site Web et à l'utilisation de ce site Web. ChariDay ne saurait être tenue responsable des dommages directs ou indirects résultant de retards d'expédition ou d'une mauvaise utilisation des produits par l'acheteur.</p>

<h2>Droit Applicable et Règlement des Litiges</h2>
<p>Ces termes et conditions sont régis et interprétés conformément aux lois de la République Algérienne. Tout litige découlant de l'utilisation de la plateforme est soumis à la compétence exclusive des tribunaux algériens compétents.</p>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "",
          content: [
            { locale: "ar", title: "الشروط والأحكام", desc: "نحن نلتزم بتقديم تجربة تسوق شفافة وعادلة. يرجى قراءة شروطنا وسياساتنا بدقة لضمان حقوقك وواجباتك." },
            { locale: "en", title: "Terms and Conditions", desc: "We are committed to providing a transparent and fair shopping experience. Please read our terms carefully." },
            { locale: "fr", title: "Conditions Générales", desc: "Nous nous engageons à offrir une expérience d'achat transparente. Veuillez lire nos conditions." }
          ],
          id: "Hero-Terms"
        }
      },
      {
        type: "RichText",
        props: {
          content: [
            { locale: "ar", html: termsAr },
            { locale: "en", html: termsEn },
            { locale: "fr", html: termsFr }
          ],
          id: "RichText-Terms"
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const termsPage = {
  slug: 'terms',
  titleAr: 'الشروط والأحكام',
  titleEn: 'Terms and Conditions',
  titleFr: 'Termes et conditions',
  titleJson: JSON.stringify({
    ar: 'الشروط والأحكام',
    en: 'Terms and Conditions',
    fr: 'Termes et conditions'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: termsPage.slug },
    update: {
      titleAr: termsPage.titleAr,
      titleEn: termsPage.titleEn,
      titleFr: termsPage.titleFr,
      titleJson: termsPage.titleJson,
      content: termsPage.content
    },
    create: termsPage
  });
  console.log("Updated terms page with exhaustive content!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
