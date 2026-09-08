import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const sellerAr = `
<h2>1. مقدمة حول الشراكة مع شاري داي</h2>
<p>مرحباً بك كشريك استراتيجي في منصة شاري داي (ChariDay). تمثل هذه الاتفاقية ("اتفاقية البائع") عقداً قانونياً ملزماً بينك كـ (تاجر، شركة، أو مقاول ذاتي) وبين إدارة منصة شاري داي. تهدف هذه الوثيقة إلى تنظيم العلاقة التجارية بين الطرفين، وتوضيح الحقوق والواجبات لضمان بيئة تجارية إلكترونية آمنة، عادلة، وموثوقة لعملائنا في جميع أنحاء الجزائر.</p>
<p>بمجرد تسجيلك كبائع وإنشاء متجرك على المنصة، فإنك تقر بقراءتك وفهمك وموافقتك المطلقة على جميع بنود هذه الاتفاقية، بالإضافة إلى القوانين التجارية الجزائرية (وعلى رأسها القانون 18-05 المتعلق بالتجارة الإلكترونية).</p>

<h2>2. شروط وأهلية التسجيل كبائع</h2>
<p>لضمان الموثوقية والمصداقية، يجب على البائع استيفاء المتطلبات القانونية التالية لفتح متجر على شاري داي:</p>
<ul>
    <li><b>الصفة القانونية:</b> يجب أن يكون البائع فرداً بالغاً (فوق 19 عاماً) أو كياناً تجارياً مسجلاً قانونياً في الجزائر.</li>
    <li><b>السجل التجاري أو بطاقة المقاول الذاتي:</b> يُشترط تزويد المنصة بنسخة سارية المفعول من السجل التجاري (Registre de Commerce) أو بطاقة المقاول الذاتي (Carte de l'Auto-Entrepreneur)، بالإضافة إلى البطاقة الضريبية (NIF).</li>
    <li><b>النشاط المسموح:</b> يجب أن يكون النشاط الفعلي للبائع متطابقاً مع رمز النشاط المذكور في السجل التجاري أو بطاقة المقاول الذاتي. سيتم رفض أي حساب يمارس نشاطاً غير مصرح به.</li>
    <li><b>البيانات البنكية:</b> توفير حساب بنكي (CIB) أو بريدي (RIP/CCP) مسجل باسم التاجر أو الشركة لتحويل المستحقات المالية.</li>
</ul>

<h2>3. المنتجات والأنشطة المسموحة والمحظورة</h2>
<p>يلتزم البائع بعرض المنتجات التي تتوافق مع القوانين الجزائرية ومعايير الجودة الخاصة بالمنصة:</p>
<ul>
    <li><b>المنتجات المسموحة:</b> الإلكترونيات، الملابس، مستحضرات التجميل المرخصة، الأدوات المنزلية، الأجهزة الكهرومنزلية، ومواد التغليف. (يُشترط ضمان جودة المنتجات ومطابقتها للمواصفات المعروضة).</li>
    <li><b>المنتجات المحظورة تماماً:</b> يُمنع منعاً باتاً بيع أو الترويج لـ:
        <ul>
            <li>الأسلحة، الذخائر، والمعدات العسكرية أو الشبيهة بها.</li>
            <li>المؤثرات العقلية، الأدوية، والتبغ.</li>
            <li>المنتجات المقلدة أو التي تنتهك حقوق الملكية الفكرية لعلامات تجارية أخرى.</li>
            <li>العملات، السندات، والمواد الإباحية أو المخلة بالآداب العامة.</li>
            <li>المواد الكيميائية الخطرة وسريعة الاشتعال.</li>
        </ul>
    </li>
</ul>

<h2>4. التزامات البائع (معالجة الطلبات والتغليف)</h2>
<p>يتحمل البائع المسؤولية الكاملة عن إدارة متجره ومعالجة طلبات العملاء باحترافية عالية:</p>
<ul>
    <li><b>إدارة المخزون:</b> يجب على البائع تحديث كميات المخزون بشكل دوري ودقيق لتجنب إلغاء الطلبات بسبب نفاد الكمية.</li>
    <li><b>سرعة المعالجة:</b> يلتزم البائع بتجهيز وتغليف الطلبات في مدة لا تتجاوز <b>24 إلى 48 ساعة</b> من وقت تأكيد الطلب.</li>
    <li><b>معايير التغليف:</b> يجب استخدام مواد تغليف عالية الجودة تحمي المنتج من التلف أثناء النقل (Bubble Wrap، كراتين مقواة). البائع هو المسؤول الوحيد عن أي تلف ناتج عن سوء التغليف.</li>
    <li><b>التسعير الشفاف:</b> يجب أن تكون أسعار المنتجات نهائية وتشمل جميع الضرائب المعمول بها. يُمنع التلاعب بالأسعار أو عرض تخفيضات وهمية.</li>
</ul>

<h2>5. العمولات والرسوم المالية</h2>
<p>مقابل استخدام البنية التحتية لمنصة شاري داي والتسويق والدعم، يوافق البائع على نظام الرسوم التالي:</p>
<ul>
    <li><b>رسوم الاشتراك:</b> يخضع البائع لرسوم اشتراك (باقة شهرية أو سنوية) بناءً على حجم المتجر والمميزات الإضافية التي يختارها.</li>
    <li><b>عمولة المبيعات:</b> تقتطع المنصة نسبة مئوية متفق عليها مسبقاً من إجمالي قيمة كل عملية بيع ناجحة. تختلف النسبة حسب فئة المنتج.</li>
    <li><b>تكاليف الشحن والمرتجعات:</b> يتحمل البائع تكلفة شحن المنتج المرتجع في حال كان سبب الإرجاع هو خطأ البائع (منتج خاطئ، تلف، عدم مطابقة الوصف).</li>
</ul>

<h2>6. تحويل المستحقات المالية (Payouts)</h2>
<p>نضمن في شاري داي تحويل أموال البائعين بشفافية وسرعة:</p>
<ul>
    <li><b>دورة الدفع:</b> تتم تصفية الحسابات وتحويل المستحقات المالية للبائع بشكل دوري (أسبوعياً أو نصف شهرياً) حسب باقة الاشتراك.</li>
    <li><b>الأموال المعلقة:</b> يتم حجز قيمة الطلبات قيد التوصيل أو في فترة السماح بالاسترجاع (3 أيام) كضمان لحقوق المشتري، ليتم تحريرها فور انقضاء المدة بسلام.</li>
</ul>

<h2>7. المخالفات، الغرامات، وإنهاء الحساب</h2>
<p>تحتفظ منصة شاري داي بالحق الكامل في مراقبة أداء البائعين وتطبيق الإجراءات الصارمة في حال الإخلال بالاتفاقية:</p>
<ul>
    <li><b>الإنذارات والغرامات:</b> سيتم توجيه إنذار أو تطبيق غرامة مالية تُخصم من مستحقات البائع في حالات: كثرة إلغاء الطلبات (Out of Stock)، التأخر المستمر في تجهيز الطلبات، التغليف السيء، أو تلقي شكاوى متكررة من العملاء.</li>
    <li><b>تجميد أو إغلاق الحساب:</b> يحق للمنصة الإغلاق الفوري والنهائي لمتجر البائع ومصادرة المستحقات المعلقة في حال:
        <ul>
            <li>بيع منتجات مقلدة أو محظورة.</li>
            <li>الاحتيال أو محاولة تحويل العملاء لإتمام الصفقات خارج المنصة (لتجنب العمولة).</li>
            <li>تقديم وثائق هوية أو سجلات تجارية مزورة.</li>
            <li>الإساءة اللفظية لموظفي شاري داي أو لعملاء المنصة.</li>
        </ul>
    </li>
</ul>

<h2>8. التعديلات القانونية</h2>
<p>تحتفظ شاري داي بالحق في تعديل أو تحديث بنود هذه الاتفاقية في أي وقت لضمان توافقها مع تطورات السوق والتشريعات الحكومية. سيتم إشعار البائعين بأي تعديل جوهري عبر البريد الإلكتروني أو من خلال إشعارات لوحة تحكم البائع.</p>
`;

const sellerEn = `
<h2>1. Introduction to the Partnership with ChariDay</h2>
<p>Welcome as a strategic partner on the ChariDay platform. This "Seller Agreement" represents a legally binding contract between you (merchant, company, or auto-entrepreneur) and ChariDay management.</p>
<p>By registering as a seller and creating your store, you acknowledge reading, understanding, and unconditionally agreeing to all terms of this agreement, in addition to Algerian commercial laws (specifically Law 18-05 on e-commerce).</p>

<h2>2. Registration Conditions and Eligibility</h2>
<p>To ensure reliability, the seller must meet the following legal requirements:</p>
<ul>
    <li><b>Legal Status:</b> An adult individual (over 19) or a legally registered commercial entity in Algeria.</li>
    <li><b>Commercial Register / Auto-Entrepreneur Card:</b> Must provide a valid copy of the Commercial Register (Registre de Commerce) or Auto-Entrepreneur Card, plus the Tax ID (NIF).</li>
    <li><b>Permitted Activity:</b> The actual activity must match the activity code in your registration.</li>
    <li><b>Bank Details:</b> Provide a valid bank (CIB) or postal (RIP/CCP) account registered in your name or your company's name.</li>
</ul>

<h2>3. Permitted and Prohibited Products</h2>
<ul>
    <li><b>Permitted Products:</b> Electronics, clothing, licensed cosmetics, home appliances, etc. (Quality and conformity to descriptions are mandatory).</li>
    <li><b>Strictly Prohibited Products:</b>
        <ul>
            <li>Weapons, ammunition, and military equipment.</li>
            <li>Psychotropic substances, unprescribed medicines, and tobacco.</li>
            <li>Counterfeit products or those violating intellectual property rights.</li>
            <li>Hazardous and highly flammable chemicals.</li>
        </ul>
    </li>
</ul>

<h2>4. Seller Obligations (Order Processing and Packaging)</h2>
<ul>
    <li><b>Inventory Management:</b> Update inventory regularly to avoid order cancellations due to stockouts.</li>
    <li><b>Processing Speed:</b> Commit to preparing and packaging orders within <b>24 to 48 hours</b>.</li>
    <li><b>Packaging Standards:</b> Use high-quality packaging to protect products during transit. The seller is solely responsible for damage caused by poor packaging.</li>
    <li><b>Transparent Pricing:</b> Prices must be final and include all applicable taxes. Fake discounts are prohibited.</li>
</ul>

<h2>5. Commissions and Financial Fees</h2>
<ul>
    <li><b>Subscription Fees:</b> Monthly or annual plans based on store size and features.</li>
    <li><b>Sales Commission:</b> A pre-agreed percentage deducted from each successful sale.</li>
    <li><b>Return Costs:</b> The seller bears return shipping costs if the return is due to their error (wrong item, defective, mismatched description).</li>
</ul>

<h2>6. Payouts and Fund Transfers</h2>
<ul>
    <li><b>Payment Cycle:</b> Payouts are transferred periodically (weekly or bi-weekly) depending on the subscription plan.</li>
    <li><b>Pending Funds:</b> Funds for orders in transit or within the return grace period (3 days) are held as a guarantee for the buyer, then released immediately after the period ends safely.</li>
</ul>

<h2>7. Violations, Penalties, and Account Termination</h2>
<ul>
    <li><b>Warnings and Fines:</b> Applied in cases of excessive cancellations, continuous delays, poor packaging, or repeated customer complaints.</li>
    <li><b>Account Suspension:</b> Immediate and permanent closure of the store and confiscation of pending funds in cases of selling counterfeit/prohibited goods, fraud, attempting to redirect customers off-platform, or submitting forged documents.</li>
</ul>
`;

const sellerFr = `
<h2>1. Introduction au Partenariat avec ChariDay</h2>
<p>Bienvenue en tant que partenaire stratégique sur la plateforme ChariDay. Le présent "Accord du Vendeur" représente un contrat juridiquement contraignant entre vous (commerçant, société ou auto-entrepreneur) et la direction de ChariDay.</p>
<p>En vous inscrivant et en créant votre boutique, vous reconnaissez avoir lu, compris et accepté inconditionnellement toutes les clauses de cet accord, ainsi que les lois commerciales algériennes (notamment la Loi 18-05 sur le commerce électronique).</p>

<h2>2. Conditions d'Inscription et Éligibilité</h2>
<ul>
    <li><b>Statut Légal :</b> Être un adulte (plus de 19 ans) ou une entité commerciale légalement enregistrée en Algérie.</li>
    <li><b>Registre du Commerce / Carte de l'Auto-Entrepreneur :</b> Fournir une copie valide du Registre de Commerce ou de la Carte de l'Auto-Entrepreneur, plus le NIF.</li>
    <li><b>Activité Autorisée :</b> L'activité réelle doit correspondre au code d'activité de votre enregistrement.</li>
    <li><b>Coordonnées Bancaires :</b> Fournir un compte bancaire (CIB) ou postal (RIP/CCP) valide.</li>
</ul>

<h2>3. Produits Autorisés et Interdits</h2>
<ul>
    <li><b>Produits Autorisés :</b> Électronique, vêtements, cosmétiques sous licence, électroménager, etc. (La qualité est obligatoire).</li>
    <li><b>Produits Strictement Interdits :</b>
        <ul>
            <li>Armes, munitions et équipements militaires.</li>
            <li>Substances psychotropes, médicaments et tabac.</li>
            <li>Produits contrefaits ou violant les droits de propriété intellectuelle.</li>
            <li>Produits chimiques dangereux et hautement inflammables.</li>
        </ul>
    </li>
</ul>

<h2>4. Obligations du Vendeur (Traitement et Emballage)</h2>
<ul>
    <li><b>Gestion des Stocks :</b> Mettre à jour régulièrement l'inventaire pour éviter les annulations de commandes.</li>
    <li><b>Vitesse de Traitement :</b> S'engager à préparer les commandes dans un délai de <b>24 à 48 heures</b>.</li>
    <li><b>Normes d'Emballage :</b> Utiliser un emballage de haute qualité. Le vendeur est seul responsable des dommages causés par un mauvais emballage.</li>
</ul>

<h2>5. Commissions et Frais Financiers</h2>
<ul>
    <li><b>Frais d'Abonnement :</b> Plans mensuels ou annuels selon la taille de la boutique.</li>
    <li><b>Commission de Vente :</b> Un pourcentage pré-convenu déduit de chaque vente réussie.</li>
    <li><b>Frais de Retour :</b> Le vendeur supporte les frais de retour si celui-ci est dû à son erreur (mauvais article, défectueux).</li>
</ul>

<h2>6. Paiements et Transferts de Fonds</h2>
<ul>
    <li><b>Cycle de Paiement :</b> Les paiements sont transférés périodiquement (hebdomadaire ou bi-hebdomadaire).</li>
    <li><b>Fonds en Attente :</b> Les fonds des commandes en transit ou dans le délai de grâce de retour (3 jours) sont conservés à titre de garantie pour l'acheteur.</li>
</ul>

<h2>7. Violations, Pénalités et Clôture de Compte</h2>
<ul>
    <li><b>Avertissements et Amendes :</b> Appliqués en cas d'annulations excessives, retards continus, mauvais emballage ou plaintes répétées des clients.</li>
    <li><b>Suspension de Compte :</b> Fermeture immédiate en cas de vente de produits contrefaits, de fraude, de tentative de détournement de clients hors de la plateforme, ou de soumission de faux documents.</li>
</ul>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2000&auto=format&fit=crop",
          content: [
            { locale: "ar", title: "اتفاقية البائع وشروط الشراكة", desc: "اقرأ بتمعن كافة حقوقك وواجباتك كبائع وشريك استراتيجي في منصة شاري داي لتضمن نجاح واستمرارية تجارتك." },
            { locale: "en", title: "Seller Agreement & Partnership Terms", desc: "Carefully read all your rights and duties as a seller and strategic partner on ChariDay to ensure the success of your business." },
            { locale: "fr", title: "Accord du Vendeur et Conditions de Partenariat", desc: "Lisez attentivement tous vos droits et devoirs en tant que vendeur et partenaire stratégique sur ChariDay." }
          ],
          id: "Hero-Seller"
        }
      },
      {
        type: "RichText",
        props: {
          content: [
            { locale: "ar", html: sellerAr },
            { locale: "en", html: sellerEn },
            { locale: "fr", html: sellerFr }
          ],
          id: "RichText-Seller"
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const sellerPage = {
  slug: 'seller-agreement',
  titleAr: 'اتفاقية البائع',
  titleEn: 'Seller Agreement',
  titleFr: 'Accord du vendeur',
  titleJson: JSON.stringify({
    ar: 'اتفاقية البائع',
    en: 'Seller Agreement',
    fr: 'Accord du vendeur'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: sellerPage.slug },
    update: {
      titleAr: sellerPage.titleAr,
      titleEn: sellerPage.titleEn,
      titleFr: sellerPage.titleFr,
      titleJson: sellerPage.titleJson,
      content: sellerPage.content
    },
    create: sellerPage
  });
  console.log("Updated seller agreement page with highly professional content.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
