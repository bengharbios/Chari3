import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const helpAr = `
<h2>كيف يمكننا مساعدتك اليوم؟</h2>
<p>مرحباً بك في <b>مركز المساعدة والدعم (Help & Support Center)</b> الخاص بمنصة شاري داي. نحن نعلم أن التجارة الإلكترونية قد تتضمن بعض التحديات التقنية أو الاستفسارات، لذا قمنا بتجهيز هذا المركز ليكون دليلك الشامل خطوة بخطوة لكل ما تحتاجه.</p>

<h2>🚀 الدليل السريع للمشترين</h2>
<p>إذا كنت تواجه مشكلة أو تحتاج إلى إرشادات حول كيفية الشراء، تفضل بالاطلاع على الروابط التالية:</p>
<ul>
    <li><b>كيفية التسجيل:</b> لا تحتاج إلى تعقيدات! يمكنك التسجيل بضغطة زر باستخدام حساب جوجل الخاص بك، أو عبر البريد الإلكتروني وكلمة المرور.</li>
    <li><b>كيفية تتبع الطلب:</b> بمجرد دخولك إلى حسابك، توجه إلى "طلباتي"، اضغط على تفاصيل الطلب، وستجد "رقم التتبع" مع رابط مباشر لموقع شركة الشحن.</li>
    <li><b>هل تأخر طلبي؟:</b> إذا تجاوز طلبك المدة المحددة (7 أيام كحد أقصى للجنوب، و 3 أيام للشمال)، يرجى فتح "تذكرة دعم" من لوحة تحكمك وسنقوم بالتدخل فوراً مع شركة الشحن.</li>
</ul>

<h2>💼 مركز دعم البائعين والشركاء</h2>
<p>نجاح متجرك هو نجاح لنا. إذا كنت بائعاً، فهذه بعض الإرشادات لحل المشاكل الشائعة:</p>
<ul>
    <li><b>كيف أرفع منتجاتي؟:</b> من لوحة تحكم البائع، اذهب إلى "المنتجات" ثم "إضافة منتج". تأكد من رفع صور عالية الجودة ووصف دقيق لأنها تزيد المبيعات بنسبة 40%.</li>
    <li><b>تم حظر حسابي، ماذا أفعل؟:</b> يتم حظر الحسابات عادة بسبب انتهاك <a href="/pages/seller-agreement" style="color: #1ABB9C; text-decoration: underline;">اتفاقية البائع</a> (مثل كثرة إلغاء الطلبات أو بيع سلع محظورة). يمكنك تقديم التماس عبر البريد <a href="mailto:partners@chariday.com" style="color: #1ABB9C; text-decoration: underline;">partners@chariday.com</a>.</li>
    <li><b>كيفية طباعة بوليصة الشحن (Waybill):</b> لا تحتاج لبرامج خارجية. اذهب إلى الطلب، اضغط على "طباعة البوليصة"، وسيتم تحميلها بصيغة PDF لتلصقها على الطرد.</li>
</ul>

<h2>🎫 نظام تذاكر الدعم الفني (Ticketing System)</h2>
<p>إذا لم تجد حلاً لمشكلتك في <a href="/pages/faq" style="color: #1ABB9C; text-decoration: underline;">الأسئلة الشائعة</a> أو في هذا الدليل، فإن الطريقة الأسرع والأكثر فاعلية للتواصل معنا هي <b>نظام التذاكر المدمج</b>.</p>
<p>من داخل حسابك (سواء كنت مشترياً أو بائعاً)، اذهب إلى قسم "الدعم" وافتح تذكرة جديدة. قم بشرح مشكلتك بالتفصيل (وإرفاق صور إن أمكن)، وسيقوم الفريق التقني بالرد عليك داخل نفس التذكرة خلال أقل من 12 ساعة!</p>

<h2>🛡️ الإبلاغ عن الاحتيال أو المنتجات المقلدة</h2>
<p>في شاري داي، نطبق سياسة (صفر تسامح) مع المنتجات المقلدة والاحتيال. إذا شككت في بائع معين أو استلمت منتجاً مقلداً، يرجى مراسلتنا فوراً والتبليغ عنه، وسنقوم باتخاذ الإجراءات القانونية اللازمة وحظره من المنصة لحماية باقي المستهلكين.</p>
`;

const helpEn = `
<h2>How Can We Help You Today?</h2>
<p>Welcome to the <b>ChariDay Help & Support Center</b>. We have prepared this center to be your step-by-step guide for everything you need.</p>

<h2>🚀 Quick Guide for Buyers</h2>
<ul>
    <li><b>How to Track an Order:</b> Log into your account, go to "My Orders", click on the order details, and you will find your Tracking Number.</li>
    <li><b>Delayed Order?:</b> If your order exceeds the specified delivery time, please open a "Support Ticket" from your dashboard.</li>
</ul>

<h2>💼 Sellers & Partners Support Center</h2>
<ul>
    <li><b>How to Upload Products:</b> From your seller dashboard, go to "Products" > "Add Product". Ensure high-quality images and accurate descriptions.</li>
    <li><b>Account Suspended?:</b> Suspensions usually happen due to violating the <a href="/pages/seller-agreement" style="color: #1ABB9C; text-decoration: underline;">Seller Agreement</a>. You can appeal via email.</li>
    <li><b>How to Print a Waybill:</b> Go to the order and click "Print Waybill" to download a PDF.</li>
</ul>

<h2>🎫 Technical Ticketing System</h2>
<p>If you couldn't find an answer in the <a href="/pages/faq" style="color: #1ABB9C; text-decoration: underline;">FAQ</a>, the fastest way to reach us is through our built-in ticketing system inside your account.</p>

<h2>🛡️ Report Fraud or Counterfeits</h2>
<p>We have a zero-tolerance policy for counterfeits. If you suspect a seller or received a fake product, report them immediately so we can take action.</p>
`;

const helpFr = `
<h2>Comment Pouvons-nous Vous Aider Aujourd'hui ?</h2>
<p>Bienvenue dans le <b>Centre d'Aide et de Support ChariDay</b>. Nous avons préparé ce centre pour qu'il soit votre guide étape par étape.</p>

<h2>🚀 Guide Rapide pour les Acheteurs</h2>
<ul>
    <li><b>Comment Suivre une Commande :</b> Connectez-vous, allez dans "Mes Commandes", cliquez sur les détails, et vous trouverez votre numéro de suivi.</li>
    <li><b>Commande Retardée ? :</b> Si votre commande dépasse le délai, veuillez ouvrir un "Ticket de Support".</li>
</ul>

<h2>💼 Centre de Support pour Vendeurs</h2>
<ul>
    <li><b>Comment Ajouter des Produits :</b> Depuis votre tableau de bord, allez dans "Produits" > "Ajouter un Produit".</li>
    <li><b>Compte Suspendu ? :</b> Les suspensions sont généralement dues à une violation de l'<a href="/pages/seller-agreement" style="color: #1ABB9C; text-decoration: underline;">Accord du Vendeur</a>.</li>
</ul>

<h2>🎫 Système de Tickets</h2>
<p>Si vous ne trouvez pas de réponse dans la <a href="/pages/faq" style="color: #1ABB9C; text-decoration: underline;">FAQ</a>, la méthode la plus rapide est d'utiliser notre système de tickets intégré dans votre compte.</p>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2000&auto=format&fit=crop",
          content: [
            { locale: "ar", title: "المساعدة والدعم", desc: "هل تواجه مشكلة؟ لا تقلق، فريقنا متواجد لتقديم الدعم الفني وحل كافة المشاكل التقنية والتجارية بأسرع وقت." },
            { locale: "en", title: "Help & Support", desc: "Facing an issue? Don't worry, our team is here to provide technical and commercial support instantly." },
            { locale: "fr", title: "Aide et Support", desc: "Vous rencontrez un problème ? Ne vous inquiétez pas, notre équipe est là pour vous fournir une assistance immédiate." }
          ],
          id: "Hero-Help"
        }
      },
      {
        type: "RichText",
        props: {
          content: [
            { locale: "ar", html: helpAr },
            { locale: "en", html: helpEn },
            { locale: "fr", html: helpFr }
          ],
          id: "RichText-Help"
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const helpPage = {
  slug: 'help-and-support',
  titleAr: 'المساعدة والدعم',
  titleEn: 'Help & Support',
  titleFr: 'Aide et support',
  titleJson: JSON.stringify({
    ar: 'المساعدة والدعم',
    en: 'Help & Support',
    fr: 'Aide et support'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: helpPage.slug },
    update: {
      titleAr: helpPage.titleAr,
      titleEn: helpPage.titleEn,
      titleFr: helpPage.titleFr,
      titleJson: helpPage.titleJson,
      content: helpPage.content
    },
    create: helpPage
  });
  console.log("Updated Help & Support page.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
