import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const termsAr = `
<h2>المقدمة والقبول</h2>
<p>مرحباً بكم في منصة شاري داي (ChariDay). تمثل هذه الشروط والأحكام اتفاقية ملزمة قانوناً بينك كـ (مستخدم أو بائع أو مشترٍ) وبين إدارة منصة شاري داي، وتنظم استخدامك لموقعنا الإلكتروني وتطبيقنا وجميع الخدمات المرتبطة بها.</p>
<p>باستخدامك لمنصتنا بأي شكل من الأشكال، فإنك تقر بقراءتك، وفهمك، وموافقتك الكاملة وغير المشروطة على جميع البنود الواردة أدناه، والتي تتوافق تماماً مع القوانين والتشريعات التجارية المعمول بها في الجمهورية الجزائرية الديمقراطية الشعبية، وتحديداً القانون 18-05 المتعلق بالتجارة الإلكترونية.</p>
<p>في حال عدم موافقتك على أي بند من هذه الشروط والأحكام، يرجى التوقف الفوري عن استخدام المنصة وإغلاق الحساب إن وُجد.</p>

<h2>حقوق الملكية الفكرية والعلامات التجارية</h2>
<p>جميع المحتويات المتوفرة على منصة شاري داي، بما في ذلك على سبيل المثال لا الحصر، النصوص، الرسومات، الشعارات، أيقونات الأزرار، الصور، المقاطع الصوتية، التنزيلات الرقمية، تجميع البيانات والبرمجيات، هي ملكية حصرية لشاري داي أو مزودي المحتوى التابعين لها، وهي محمية بموجب قوانين حقوق الملكية الفكرية وحقوق النشر الجزائرية والدولية.</p>
<ul>
    <li>يُمنع منعاً باتاً استنساخ أو إعادة إنتاج أي جزء من الموقع لأغراض تجارية.</li>
    <li>يُحظر استخدام أي من علاماتنا التجارية أو شعاراتنا في أي منتج أو خدمة غير تابعة لنا بطريقة قد تسبب ارتباكاً للعملاء أو تسيء إلى سمعة المنصة.</li>
    <li>أي استخدام غير مصرح به قد يعرضك للمساءلة القانونية والمطالبة بالتعويض عن الأضرار.</li>
</ul>

<h2>شروط النقل والتوصيل (بالشراكة مع شركات الشحن المعتمدة)</h2>
<p>لضمان وصول طلبياتكم بأمان وفي أسرع وقت ممكن، تعتمد منصة شاري داي في عمليات اللوجستيات على شبكة واسعة من <b>شركات الشحن الرائدة والمعتمدة</b> لتغطية جميع التراب الوطني (58 ولاية). تخضع عمليات النقل للسياسات الصارمة التالية:</p>
<ul>
    <li><b>الالتزام بالمواعيد:</b> تختلف مدة التوصيل بناءً على الموقع الجغرافي. نسعى لضمان التوصيل خلال 24 إلى 48 ساعة للولايات الشمالية والوسطى، بينما قد تستغرق الولايات الجنوبية من 3 إلى 7 أيام عمل.</li>
    <li><b>القيود على الطرود:</b> خدماتنا مخصصة للطرود التي لا يتجاوز وزنها الفعلي أو الحجمي 20 كغ لتوصيلها مباشرة إلى باب المنزل (Home Delivery)، وتُطبق رسوم إضافية للطرود ذات الوزن الزائد.</li>
    <li><b>معاينة الطرد:</b> وفقاً لسياسات شركات النقل المعتمدة لدينا، <b>يُمنع فتح الطرد أو تجربة المنتج قبل تسديد كامل المبلغ المستحق لعامل التوصيل</b>. في الحالات الاستثنائية التي يُسمح فيها بذلك، تخلي المنصة وشركة النقل مسؤوليتهما الكاملة عن أي تلف أو نقص يحدث للمنتج.</li>
    <li><b>الاستلام والإرجاع:</b> في حال رفض استلام الطرد بدون مبرر قانوني مقنع، تحتفظ المنصة بحقها في تعليق حساب العميل أو حظره من ميزة الدفع عند الاستلام في الطلبات المستقبلية.</li>
</ul>

<h2>المواد المحظورة من النقل والبيع</h2>
<p>سعياً منا لضمان بيئة تجارية آمنة وقانونية، يُمنع منعاً باتاً إدراج، بيع، أو محاولة شحن أي من المواد التالية عبر منصتنا:</p>
<ul>
    <li>المشروبات الكحولية، المؤثرات العقلية، المخدرات، والأدوية غير المرخصة.</li>
    <li>الأسلحة النارية، الأسلحة البيضاء، الذخائر، والمعدات العسكرية بأي شكل من الأشكال.</li>
    <li>المواد سريعة الاشتعال، المتفجرات، الألعاب النارية، والمواد الكيميائية والإشعاعية الخطرة.</li>
    <li>الحيوانات الحية بجميع أنواعها، والنباتات المحظورة بموجب القانون الجمركي والبيئي.</li>
    <li>الأوراق النقدية، العملات الأجنبية غير المصرح بها، والوثائق المزورة.</li>
    <li>المواد المقرصنة، المقلدة، وتلك التي تنتهك حقوق النشر والملكية الفكرية لأطراف ثالثة.</li>
    <li>المنتجات التي تحرض على الكراهية أو العنف أو تتنافى مع الآداب العامة وقيم المجتمع.</li>
</ul>

<h2>سياسة الدفع والفوترة والتسعير</h2>
<p>نسعى لتوفير بيئة دفع آمنة ومرنة تلبي احتياجات جميع المستخدمين في الجزائر:</p>
<ul>
    <li><b>الدفع عند الاستلام (C.O.D):</b> نتيح للعملاء ميزة الدفع نقداً عند استلام الطرد من عامل التوصيل. هذا الخيار متاح حصرياً للطلبيات التي لا تتجاوز قيمتها الإجمالية 150,000 دج.</li>
    <li><b>الدفع الإلكتروني (البطاقة الذهبية / CIB):</b> سيتم قريباً توفير خدمة الدفع الإلكتروني عبر بوابة الدفع الوطنية، مع ضمان تشفير جميع بيانات الدفع باستخدام بروتوكولات حماية متطورة.</li>
    <li><b>شفافية الفوترة:</b> الفاتورة المرفقة مع الطلب تمثل القيمة الإجمالية، وتشمل السعر النهائي للمنتج بالإضافة إلى تكاليف الشحن. لا توجد أي رسوم خفية.</li>
</ul>

<h2>إخلاء المسؤولية وتحديد المسؤولية</h2>
<p>إلى أقصى حد يسمح به القانون المعمول به، يتم توفير منصة شاري داي وجميع الخدمات المرتبطة بها "كما هي" وبدون أي ضمانات من أي نوع، سواء صريحة أو ضمنية:</p>
<ul>
    <li>لا تضمن المنصة أن الخدمات ستكون خالية من الأخطاء أو غير منقطعة بشكل دائم.</li>
    <li>المنصة غير مسؤولة عن التأخيرات الخارجة عن إرادتها (القوة القاهرة) كالكوارث الطبيعية، الإضرابات، أو الأعطال في شبكات شركات الشحن.</li>
    <li>لا نتحمل مسؤولية أي أضرار غير مباشرة، تبعية، أو عرضية (بما في ذلك فقدان الأرباح أو البيانات) الناتجة عن سوء استخدام المشتري للمنتجات.</li>
</ul>

<h2>القانون المطبق وحل النزاعات وفض الخلافات</h2>
<p>تخضع هذه الشروط والأحكام بالكامل وتُفسر وفقاً للقوانين السارية في الجمهورية الجزائرية. في حال حدوث أي نزاع ينشأ عن استخدام المنصة أو يتعلق بمنتج تم شراؤه من خلالها، يلتزم الطرفان بمحاولة حل الخلاف ودياً عن طريق التواصل مع خدمة العملاء. وفي حال تعذر الحل الودي، فإن النزاع يخضع للاختصاص الحصري للمحاكم الجزائرية المختصة قانونياً وإقليمياً.</p>
`;

const termsEn = `
<h2>Introduction and Acceptance</h2>
<p>Welcome to the ChariDay platform. These Terms and Conditions constitute a legally binding agreement between you (as a user, seller, or buyer) and the management of ChariDay, governing your use of our website, application, and all related services.</p>
<p>By using our platform in any way, you acknowledge that you have read, understood, and fully and unconditionally agree to all the clauses listed below, which fully comply with the commercial laws and legislation in force in the People's Democratic Republic of Algeria, specifically Law 18-05 on e-commerce.</p>

<h2>Intellectual Property and Trademarks</h2>
<p>All content available on the ChariDay platform, including but not limited to texts, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the exclusive property of ChariDay or its content suppliers and is protected by Algerian and international intellectual property and copyright laws.</p>
<ul>
    <li>It is strictly prohibited to copy or reproduce any part of the site for commercial purposes.</li>
    <li>The use of any of our trademarks or logos in any product or service not affiliated with us is prohibited.</li>
</ul>

<h2>Transport and Delivery Terms (in partnership with approved shipping companies)</h2>
<p>To ensure your orders arrive safely and as quickly as possible, ChariDay relies on a vast network of <b>leading and approved shipping companies</b> to cover the entire national territory (58 wilayas). Transport operations are subject to strict policies:</p>
<ul>
    <li><b>Punctuality:</b> Delivery times vary based on geographical location (typically 24 to 48 hours for the North, and 3 to 7 business days for the South).</li>
    <li><b>Parcel Restrictions:</b> Our services are intended for parcels whose actual or volumetric weight does not exceed 20 kg for home delivery.</li>
    <li><b>Parcel Inspection:</b> According to the policies of our shipping partners, <b>it is prohibited to open the parcel or try the product before paying the full amount</b> to the delivery agent.</li>
</ul>

<h2>Prohibited Items for Sale and Transport</h2>
<p>In our effort to ensure a safe and legal trading environment, it is strictly forbidden to list, sell, or attempt to ship any of the following items:</p>
<ul>
    <li>Alcoholic beverages, psychotropic substances, drugs, and unlicensed medicines.</li>
    <li>Firearms, bladed weapons, ammunition, and military equipment.</li>
    <li>Flammable materials, explosives, fireworks, and dangerous chemicals.</li>
    <li>Counterfeit materials, pirated goods, and those infringing on intellectual property.</li>
</ul>

<h2>Payment, Billing, and Pricing Policy</h2>
<p>We strive to provide a secure and flexible payment environment:</p>
<ul>
    <li><b>Cash on Delivery (C.O.D):</b> Available exclusively for orders not exceeding 150,000 DZD.</li>
    <li><b>Electronic Payment (Edahabia / CIB):</b> Coming soon via the national payment gateway.</li>
    <li><b>Billing Transparency:</b> The invoice includes the final product price plus shipping costs. There are no hidden fees.</li>
</ul>

<h2>Disclaimer and Limitation of Liability</h2>
<p>To the fullest extent permitted by applicable law, the ChariDay platform is provided "as is" and without any warranties of any kind.</p>
<ul>
    <li>The platform is not responsible for delays beyond its control (force majeure) such as natural disasters or strikes.</li>
    <li>We assume no liability for any indirect, consequential, or incidental damages resulting from the buyer's misuse of products.</li>
</ul>

<h2>Applicable Law and Dispute Resolution</h2>
<p>These terms and conditions are fully governed by and construed in accordance with the laws of the Algerian Republic. In the event of any dispute, parties must attempt to resolve the disagreement amicably. If an amicable resolution is impossible, the dispute is subject to the exclusive jurisdiction of the competent Algerian courts.</p>
`;

const termsFr = `
<h2>Introduction et Acceptation</h2>
<p>Bienvenue sur la plateforme ChariDay. Ces Conditions Générales constituent un accord juridiquement contraignant entre vous et la direction de ChariDay, régissant votre utilisation de notre site Web et de nos services.</p>
<p>En utilisant notre plateforme, vous reconnaissez avoir lu, compris et accepté pleinement et inconditionnellement toutes les clauses énumérées ci-dessous, qui sont conformes aux lois commerciales en vigueur en République Algérienne Démocratique et Populaire, spécifiquement la Loi 18-05 sur le commerce électronique.</p>

<h2>Propriété Intellectuelle et Marques Déposées</h2>
<p>Tout le contenu disponible sur la plateforme, y compris les textes, graphiques, logos, et logiciels, est la propriété exclusive de ChariDay et est protégé par les lois algériennes et internationales sur la propriété intellectuelle.</p>
<ul>
    <li>Il est strictement interdit de copier ou reproduire toute partie du site à des fins commerciales.</li>
    <li>L'utilisation de nos marques dans tout produit ou service non affilié à nous est interdite.</li>
</ul>

<h2>Conditions de Transport et de Livraison (en partenariat avec des sociétés de transport agréées)</h2>
<p>Pour garantir que vos commandes arrivent en toute sécurité et le plus rapidement possible, ChariDay s'appuie sur un vaste réseau de <b>sociétés de transport agréées</b> pour couvrir l'ensemble du territoire (58 wilayas) :</p>
<ul>
    <li><b>Ponctualité :</b> Les délais de livraison varient (24-48h pour le Nord, 3-7 jours pour le Sud).</li>
    <li><b>Restrictions sur les colis :</b> Le poids réel ou volumétrique ne doit pas dépasser 20 kg pour la livraison à domicile.</li>
    <li><b>Inspection du colis :</b> Il est strictement <b>interdit d'ouvrir le colis avant d'avoir payé la totalité du montant</b> au livreur.</li>
</ul>

<h2>Articles Interdits à la Vente et au Transport</h2>
<p>Il est strictement interdit de lister, vendre ou expédier les articles suivants :</p>
<ul>
    <li>Boissons alcoolisées, drogues et médicaments non autorisés.</li>
    <li>Armes à feu, armes blanches et munitions.</li>
    <li>Matières inflammables, explosifs et produits chimiques dangereux.</li>
    <li>Produits contrefaits ou enfreignant la propriété intellectuelle.</li>
</ul>

<h2>Politique de Paiement et de Facturation</h2>
<p>Nous offrons un environnement de paiement sécurisé :</p>
<ul>
    <li><b>Paiement à la livraison (C.O.D) :</b> Disponible pour les commandes ne dépassant pas 150 000 DZD.</li>
    <li><b>Paiement Électronique (Edahabia / CIB) :</b> Bientôt disponible via le portail national.</li>
    <li><b>Transparence :</b> La facture comprend le prix final du produit plus les frais d'expédition. Aucun frais caché.</li>
</ul>

<h2>Limitation de Responsabilité</h2>
<p>Dans toute la mesure permise par la loi, la plateforme est fournie "telle quelle" sans aucune garantie d'aucune sorte.</p>
<ul>
    <li>La plateforme n'est pas responsable des retards indépendants de sa volonté (force majeure).</li>
    <li>Nous n'assumons aucune responsabilité pour les dommages indirects résultant d'une mauvaise utilisation des produits par l'acheteur.</li>
</ul>

<h2>Droit Applicable et Règlement des Litiges</h2>
<p>Ces termes et conditions sont régis par les lois de la République Algérienne. Tout litige est soumis à la compétence exclusive des tribunaux algériens compétents.</p>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "",
          content: [
            { locale: "ar", title: "الشروط والأحكام", desc: "نحن نلتزم بتقديم تجربة تسوق شفافة وعادلة ووفقاً لأعلى المعايير القانونية والتجارية. يرجى قراءة شروطنا وسياساتنا بدقة لضمان حقوقك وواجباتك." },
            { locale: "en", title: "Terms and Conditions", desc: "We are committed to providing a transparent and fair shopping experience according to the highest legal standards. Please read our terms carefully." },
            { locale: "fr", title: "Conditions Générales", desc: "Nous nous engageons à offrir une expérience d'achat transparente et conforme aux normes légales. Veuillez lire nos conditions." }
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
  console.log("Updated terms page with exhaustive, professional content without mentioning specific companies.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
