import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const privacyAr = `
<h2>1. مقدمة والتزامنا بخصوصيتك</h2>
<p>نحن في منصة شاري داي (ChariDay) ندرك تماماً أهمية الخصوصية وأمن البيانات، ونلتزم بشكل قاطع بحماية بياناتك الشخصية والمالية. توضح "سياسة الخصوصية" هذه كيف نقوم بجمع، استخدام، تخزين، وحماية المعلومات التي تقدمها لنا عند استخدامك لمنصتنا أو تطبيقنا أو أي من خدماتنا.</p>
<p>بمجرد وصولك إلى المنصة أو تسجيل حساب فيها، فإنك توافق صراحةً على الممارسات الموضحة في هذه الوثيقة، والتي تتوافق مع القوانين الجزائرية المعمول بها في مجال حماية البيانات الشخصية وحقوق المستهلك الإلكتروني.</p>

<h2>2. المعلومات التي نقوم بجمعها</h2>
<p>لتقديم تجربة تسوق وبيع سلسة ومخصصة، نقوم بجمع أنواع مختلفة من البيانات:</p>
<ul>
    <li><b>المعلومات الشخصية الأساسية:</b> مثل الاسم الكامل، البريد الإلكتروني، رقم الهاتف، وتاريخ الميلاد عند التسجيل.</li>
    <li><b>معلومات الشحن والفواتير:</b> مثل العنوان بالتفصيل (الولاية، الدائرة، البلدية)، الرمز البريدي، وتفاصيل الدفع أو البطاقات البنكية (والتي تتم معالجتها عبر بوابات دفع وطنية آمنة ومُشفرة).</li>
    <li><b>معلومات النشاط والسلوك:</b> نقوم بتتبع المنتجات التي تتصفحها، تضيفها إلى السلة، أو تشتريها، بالإضافة إلى تفاعلاتك مع البائعين وخدمة العملاء.</li>
    <li><b>البيانات التقنية:</b> عنوان بروتوكول الإنترنت (IP)، نوع المتصفح، نظام التشغيل، ومعرّفات الأجهزة المحمولة لضمان أمان حسابك وتحسين أداء الموقع.</li>
    <li><b>بيانات البائعين (الشركاء):</b> بالإضافة لما سبق، نجمع نسخاً من السجل التجاري، بطاقة المقاول الذاتي، والوثائق الضريبية للتحقق من الهوية القانونية.</li>
</ul>

<h2>3. كيف نستخدم معلوماتك؟</h2>
<p>نستخدم البيانات المجمعة للأغراض المشروعة التالية:</p>
<ul>
    <li>معالجة طلباتك وتوصيل المشتريات إلى عنوانك بدقة.</li>
    <li>تسهيل التواصل بينك وبين شركات الشحن والبائعين لضمان نجاح عملية التوصيل.</li>
    <li>تحسين وتخصيص تجربتك (عرض منتجات مشابهة لاهتماماتك).</li>
    <li>إرسال التحديثات الإدارية، وتنبيهات الأمان، والعروض الترويجية (يمكنك إلغاء الاشتراك في العروض الترويجية في أي وقت).</li>
    <li>منع وكشف عمليات الاحتيال والأنشطة غير القانونية لضمان بيئة آمنة للجميع.</li>
</ul>

<h2>4. مشاركة البيانات مع الأطراف الثالثة</h2>
<p>نحن <b>لا نقوم ببيع أو تأجير</b> بياناتك الشخصية لأي جهة كانت. قد نقوم بمشاركة بياناتك فقط في الحالات الضرورية التالية:</p>
<ul>
    <li><b>شركاء الخدمات اللوجستية والشحن:</b> نشارك اسمك، رقم هاتفك، وعنوانك مع شركات الشحن المعتمدة لدينا لتتمكن من إيصال طلبك.</li>
    <li><b>بوابات الدفع الإلكتروني:</b> لمعالجة المدفوعات بشكل آمن.</li>
    <li><b>الامتثال للقانون:</b> قد نضطر للكشف عن معلوماتك استجابة لطلب قانوني رسمي من الجهات الحكومية أو القضائية في الجزائر، بهدف حماية حقوق منصة شاري داي أو حقوق مستخدميها.</li>
</ul>

<h2>5. أمن البيانات وحمايتها</h2>
<p>نحن نستخدم أحدث تقنيات التشفير (SSL/TLS) وبروتوكولات الأمان القياسية في الصناعة لحماية بياناتك من الوصول غير المصرح به، التعديل، أو الإفشاء. يتم تخزين كلمات المرور بشكل مشفر تماماً (Hashed) ولا يمكن لأي موظف في المنصة الاطلاع عليها.</p>
<p>ومع ذلك، يرجى العلم أنه لا توجد وسيلة نقل عبر الإنترنت آمنة بنسبة 100%، لذا فإن حماية كلمة المرور الخاصة بك وعدم مشاركتها مع أي شخص تقع على عاتقك بالدرجة الأولى.</p>

<h2>6. سياسة ملفات تعريف الارتباط (Cookies)</h2>
<p>تستخدم منصة شاري داي ملفات تعريف الارتباط وتقنيات التتبع المشابهة لتحسين أداء الموقع، تذكر تفضيلاتك (مثل اللغة المختارة وعناصر السلة)، وتحليل حركة المرور. يمكنك تعديل إعدادات متصفحك لرفض بعض أو كل ملفات تعريف الارتباط، ولكن هذا قد يؤثر على وظائف معينة في الموقع.</p>

<h2>7. حقوقك المتعلقة ببياناتك</h2>
<p>بصفتك مستخدماً لمنصتنا، يحق لك:</p>
<ul>
    <li>الوصول إلى بياناتك الشخصية وتحديثها أو تصحيحها في أي وقت من خلال لوحة تحكم حسابك.</li>
    <li>طلب حذف حسابك وبياناتك الشخصية نهائياً من أنظمتنا (باستثناء البيانات التي يفرض القانون علينا الاحتفاظ بها لأغراض ضريبية وقانونية).</li>
    <li>الاعتراض على استخدام بياناتك في الحملات التسويقية.</li>
</ul>

<h2>8. تحديث سياسة الخصوصية</h2>
<p>نحتفظ بالحق في مراجعة وتحديث هذه السياسة بشكل دوري لمواكبة التغييرات التشريعية أو التقنية. سيتم نشر النسخة المحدثة على هذه الصفحة مع تعديل "تاريخ آخر تحديث" في الأسفل. نوصيك بمراجعة هذه الصفحة بانتظام لتكون على دراية بكيفية حمايتنا لبياناتك.</p>
`;

const privacyEn = `
<h2>1. Introduction and Commitment to Privacy</h2>
<p>At ChariDay, we fully understand the importance of privacy and data security. We are strictly committed to protecting your personal and financial data. This "Privacy Policy" outlines how we collect, use, store, and protect the information you provide when using our platform.</p>
<p>By accessing the platform or registering an account, you explicitly agree to the practices described in this document.</p>

<h2>2. Information We Collect</h2>
<ul>
    <li><b>Basic Personal Information:</b> Full name, email, phone number, and date of birth.</li>
    <li><b>Shipping & Billing Information:</b> Detailed address, postal code, and secure payment details.</li>
    <li><b>Activity Data:</b> Products you browse, add to cart, or purchase.</li>
    <li><b>Technical Data:</b> IP address, browser type, operating system, and mobile device identifiers.</li>
    <li><b>Seller (Partner) Data:</b> Copies of commercial registers, tax documents, and legal identity proofs.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<ul>
    <li>To process your orders and accurately deliver purchases to your address.</li>
    <li>To facilitate communication between you, sellers, and shipping companies.</li>
    <li>To improve and personalize your shopping experience.</li>
    <li>To prevent and detect fraud and illegal activities.</li>
</ul>

<h2>4. Sharing Data with Third Parties</h2>
<p>We <b>do not sell or rent</b> your personal data. We only share it in the following necessary cases:</p>
<ul>
    <li><b>Logistics & Shipping Partners:</b> We share your name, phone, and address with approved shipping companies.</li>
    <li><b>Payment Gateways:</b> To securely process online transactions.</li>
    <li><b>Legal Compliance:</b> If required by official governmental or judicial authorities in Algeria.</li>
</ul>

<h2>5. Data Security</h2>
<p>We use industry-standard encryption technologies (SSL/TLS) to protect your data. Passwords are fully hashed and invisible to our staff. However, you are responsible for keeping your password secure and confidential.</p>

<h2>6. Cookies Policy</h2>
<p>ChariDay uses cookies and similar tracking technologies to improve site performance, remember your preferences (like language and cart items), and analyze traffic. You can modify your browser settings to reject cookies.</p>

<h2>7. Your Rights</h2>
<p>As a user, you have the right to access, update, or correct your personal data at any time. You may also request the deletion of your account and personal data (except for data we are legally required to retain).</p>
`;

const privacyFr = `
<h2>1. Introduction et Engagement envers la Confidentialité</h2>
<p>Chez ChariDay, nous comprenons parfaitement l'importance de la confidentialité et de la sécurité des données. Nous nous engageons strictement à protéger vos données personnelles et financières. Cette "Politique de Confidentialité" décrit comment nous collectons, utilisons, stockons et protégeons vos informations.</p>
<p>En accédant à la plateforme, vous acceptez explicitement les pratiques décrites dans ce document.</p>

<h2>2. Les Informations que Nous Collectons</h2>
<ul>
    <li><b>Informations Personnelles :</b> Nom complet, e-mail, numéro de téléphone et date de naissance.</li>
    <li><b>Informations d'Expédition :</b> Adresse détaillée, code postal et détails de paiement sécurisés.</li>
    <li><b>Données d'Activité :</b> Produits consultés, ajoutés au panier ou achetés.</li>
    <li><b>Données Techniques :</b> Adresse IP, type de navigateur et identifiants de l'appareil.</li>
    <li><b>Données des Vendeurs :</b> Copies des registres du commerce et documents fiscaux.</li>
</ul>

<h2>3. Comment Nous Utilisons Vos Informations</h2>
<ul>
    <li>Pour traiter vos commandes et livrer vos achats avec précision.</li>
    <li>Pour faciliter la communication avec les sociétés de transport.</li>
    <li>Pour personnaliser votre expérience d'achat.</li>
    <li>Pour prévenir et détecter la fraude.</li>
</ul>

<h2>4. Partage des Données avec des Tiers</h2>
<p>Nous <b>ne vendons ni ne louons</b> vos données personnelles. Nous les partageons uniquement avec :</p>
<ul>
    <li><b>Partenaires Logistiques :</b> Nom, téléphone et adresse pour la livraison.</li>
    <li><b>Passerelles de Paiement :</b> Pour traiter les paiements en toute sécurité.</li>
    <li><b>Conformité Légale :</b> Si les autorités gouvernementales ou judiciaires l'exigent.</li>
</ul>

<h2>5. Sécurité des Données</h2>
<p>Nous utilisons des technologies de cryptage standard (SSL/TLS). Les mots de passe sont hachés et invisibles pour notre personnel. Vous êtes responsable de la confidentialité de votre mot de passe.</p>

<h2>6. Vos Droits</h2>
<p>Vous avez le droit d'accéder, de mettre à jour ou de corriger vos données personnelles à tout moment. Vous pouvez également demander la suppression de votre compte et de vos données personnelles (sauf obligations légales).</p>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop",
          content: [
            { locale: "ar", title: "سياسة الخصوصية", desc: "بياناتك في أمان تام معنا. تعرف على كيفية حمايتنا لمعلوماتك الشخصية وتأمين تجربة تسوقك." },
            { locale: "en", title: "Privacy Policy", desc: "Your data is completely safe with us. Learn how we protect your personal information and secure your shopping experience." },
            { locale: "fr", title: "Politique de Confidentialité", desc: "Vos données sont en totale sécurité avec nous. Découvrez comment nous protégeons vos informations personnelles." }
          ],
          id: "Hero-Privacy"
        }
      },
      {
        type: "RichText",
        props: {
          content: [
            { locale: "ar", html: privacyAr },
            { locale: "en", html: privacyEn },
            { locale: "fr", html: privacyFr }
          ],
          id: "RichText-Privacy"
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const privacyPage = {
  slug: 'privacy-policy',
  titleAr: 'سياسة الخصوصية',
  titleEn: 'Privacy Policy',
  titleFr: 'Politique de confidentialité',
  titleJson: JSON.stringify({
    ar: 'سياسة الخصوصية',
    en: 'Privacy Policy',
    fr: 'Politique de confidentialité'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: privacyPage.slug },
    update: {
      titleAr: privacyPage.titleAr,
      titleEn: privacyPage.titleEn,
      titleFr: privacyPage.titleFr,
      titleJson: privacyPage.titleJson,
      content: privacyPage.content
    },
    create: privacyPage
  });
  console.log("Updated privacy policy page with highly professional content.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
