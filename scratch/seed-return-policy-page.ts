import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const returnAr = `
<h2>مقدمة حول سياسة الاسترجاع والاستبدال</h2>
<p>نحن في منصة شاري داي (ChariDay) نولي رضا عملائنا الأولوية القصوى. ولأننا نتفهم أن بعض المنتجات قد لا تلبي توقعاتك بشكل كامل، قمنا بصياغة سياسة استرجاع واستبدال مرنة، شفافة، وعادلة تتوافق مع القوانين التجارية المعمول بها في الجزائر، وعلى رأسها حقوق المستهلك.</p>
<p>تسري هذه السياسة على جميع المشتريات التي تتم عبر منصتنا، مع مراعاة الاستثناءات والشروط الموضحة أدناه لحماية كل من المشتري والبائع.</p>

<h2>المدة المسموحة للاسترجاع والاستبدال</h2>
<p>يحق للعميل طلب استرجاع أو استبدال المنتج خلال <b>ثلاثة (3) أيام</b> من تاريخ الاستلام الفعلي للطرد من شركة الشحن، شريطة أن تنطبق عليه الشروط الأساسية للاسترجاع. بعد انقضاء هذه المدة، يعتبر الطلب نهائياً ولا يحق للعميل المطالبة بالاسترجاع إلا في حالات الضمان (إن وُجدت).</p>

<h2>شروط وأحكام قبول الاسترجاع</h2>
<p>لكي يتم قبول طلب الاسترجاع، يجب أن يستوفي المنتج الشروط الصارمة التالية:</p>
<ul>
    <li><b>الحالة الأصلية:</b> يجب أن يكون المنتج في حالته الأصلية تماماً، غير مستخدم، غير ملبوس، غير مغسول، وبدون أي خدوش أو علامات تلف.</li>
    <li><b>التغليف الأصلي:</b> يجب إرجاع المنتج في علبته وتغليفه الأصلي، مع جميع الملصقات (Tags)، والبطاقات التعريفية، وأدلة الاستخدام المرفقة معه.</li>
    <li><b>الملحقات والهدايا:</b> في حال كان المنتج مرفقاً بملحقات إضافية أو هدايا ترويجية، يجب إرجاعها جميعاً وبحالتها الأصلية.</li>
    <li><b>إثبات الشراء:</b> يجب تقديم فاتورة الشراء الأصلية أو رقم الطلب كإثبات لعملية الشراء عبر منصة شاري داي.</li>
</ul>

<h2>الحالات التي يُرفض فيها الاسترجاع</h2>
<p>يُرجى العلم أنه لأسباب صحية وقانونية، هناك أصناف محددة وحالات لا يشملها حق الاسترجاع أو الاستبدال، وتتضمن:</p>
<ul>
    <li><b>المنتجات الشخصية:</b> الملابس الداخلية، ملابس السباحة، الجوارب، ومستحضرات التجميل والعناية الشخصية المفتوحة.</li>
    <li><b>المنتجات الاستهلاكية:</b> المواد الغذائية، المشروبات، المكملات الغذائية، والفيتامينات.</li>
    <li><b>المنتجات الرقمية والإلكترونيات:</b> البرمجيات، بطاقات الهدايا الرقمية، والأجهزة الإلكترونية التي تم فتح غلافها الأصلي أو تشغيلها (إلا في حالة وجود عيب مصنعي).</li>
    <li><b>التلف المتعمد:</b> أي منتج تعرض للتلف أو الكسر نتيجة سوء الاستخدام، الإهمال، أو محاولة التركيب الخاطئ من قبل العميل.</li>
</ul>

<h2>آلية وإجراءات الاسترجاع</h2>
<p>لتسهيل عملية الاسترجاع، يرجى اتباع الخطوات البسيطة التالية:</p>
<ol>
    <li><b>تقديم الطلب:</b> قم بالدخول إلى حسابك في شاري داي، وانتقل إلى قسم "طلباتي"، ثم انقر على "طلب استرجاع" بجانب المنتج المعني، أو تواصل مباشرة مع خدمة العملاء عبر القنوات الرسمية.</li>
    <li><b>المعاينة الأولية:</b> سيُطلب منك إرسال صور واضحة للمنتج ومكان الخلل (إن وُجد) لمراجعته من قبل فريق الجودة.</li>
    <li><b>تجهيز الطرد:</b> بعد الموافقة المبدئية، قم بإعادة تغليف المنتج بشكل آمن في كرتونه الأصلي.</li>
    <li><b>تسليم الطرد:</b> سيتم التنسيق مع شركة الشحن لاستلام الطرد من عنوانك، أو سيُطلب منك تسليمه لأقرب فرع لشركة الشحن المعتمدة.</li>
</ol>

<h2>تكاليف الشحن عند الاسترجاع</h2>
<p>تختلف آلية تحمل تكاليف الشحن بناءً على سبب الاسترجاع:</p>
<ul>
    <li><b>في حال كان الخطأ من البائع أو المنصة:</b> (كاستلام منتج خاطئ، أو منتج به عيب مصنعي، أو منتج تالف أثناء النقل)، تتحمل المنصة أو البائع كافة تكاليف الشحن (الذهاب والإياب).</li>
    <li><b>في حال كان السبب يعود للعميل:</b> (كتغيير الرأي، أو طلب مقاس خاطئ بالرغم من وضوح جدول المقاسات)، يتحمل العميل رسوم الشحن الأصلية بالإضافة إلى رسوم شحن الإرجاع. سيتم خصم هذه الرسوم من المبلغ المسترد.</li>
</ul>

<h2>استرداد الأموال (Refunds)</h2>
<p>بمجرد وصول المنتج المرتجع إلى مستودعاتنا أو مستودع البائع، سيخضع لفحص فني للتحقق من استيفائه للشروط المذكورة أعلاه. تستغرق عملية الفحص عادة من 24 إلى 48 ساعة.</p>
<ul>
    <li><b>الموافقة:</b> في حال اجتياز الفحص، سيتم معالجة عملية استرداد الأموال.</li>
    <li><b>طريقة الاسترداد:</b> سيتم إرجاع المبلغ إلى المحفظة الخاصة بك في المنصة (Wallet) لاستخدامه في مشتريات مستقبلية، أو تحويله إلى حسابك البريدي (CCP) أو البنكي (CIB) خلال فترة تتراوح بين 3 إلى 7 أيام عمل.</li>
    <li><b>الرفض:</b> في حال عدم استيفاء المنتج لشروط الاسترجاع (مثال: مستخدم أو تالف)، سيتم رفض الطلب وإعادة إرسال المنتج إليك مجدداً، وقد يُطلب منك تحمل تكاليف إعادة الشحن.</li>
</ul>

<h2>التواصل والدعم الفني</h2>
<p>نحن هنا لمساعدتك! إذا كانت لديك أي استفسارات أو احتجت لتوضيحات إضافية حول سياسة الاسترجاع، لا تتردد في التواصل مع فريق خدمة العملاء المتواجد على مدار الساعة عبر نموذج "تواصل معنا" أو عبر الهاتف أو البريد الإلكتروني الرسمي للمنصة.</p>
`;

const returnEn = `
<h2>Introduction to Return & Exchange Policy</h2>
<p>At ChariDay, customer satisfaction is our highest priority. Understanding that some products may not fully meet your expectations, we have crafted a flexible, transparent, and fair return and exchange policy that complies with the commercial laws in Algeria.</p>

<h2>Allowed Duration for Returns</h2>
<p>Customers have the right to request a return or exchange within <b>three (3) days</b> of actually receiving the package from the shipping company, provided the basic return conditions are met. After this period, the order is considered final.</p>

<h2>Conditions for Accepting Returns</h2>
<p>For a return request to be accepted, the product must strictly meet the following conditions:</p>
<ul>
    <li><b>Original Condition:</b> The product must be completely in its original condition, unused, unworn, unwashed, and without any scratches or signs of damage.</li>
    <li><b>Original Packaging:</b> The product must be returned in its original box and packaging, with all tags and manuals included.</li>
    <li><b>Accessories & Gifts:</b> If the product came with additional accessories or promotional gifts, they must all be returned in their original state.</li>
</ul>

<h2>Non-Returnable Items</h2>
<p>Please note that for health, hygiene, and legal reasons, certain categories are excluded from the right of return or exchange:</p>
<ul>
    <li><b>Personal Items:</b> Underwear, swimwear, socks, and opened cosmetics.</li>
    <li><b>Consumables:</b> Food items, beverages, and nutritional supplements.</li>
    <li><b>Digital & Electronics:</b> Software, digital gift cards, and electronic devices whose original seal has been broken (unless there is a manufacturing defect).</li>
</ul>

<h2>Return Procedure</h2>
<p>To facilitate the return process, please follow these simple steps:</p>
<ol>
    <li><b>Submit Request:</b> Log into your ChariDay account, go to "My Orders", and click "Request Return" next to the relevant product.</li>
    <li><b>Initial Inspection:</b> You will be asked to send clear photos of the product and the defect (if any).</li>
    <li><b>Prepare Package:</b> Repackage the product securely in its original box.</li>
    <li><b>Handover:</b> We will coordinate with the shipping company to pick up the package, or ask you to drop it at the nearest branch.</li>
</ol>

<h2>Shipping Costs for Returns</h2>
<ul>
    <li><b>Seller/Platform Error:</b> If you receive a wrong, defective, or damaged item, the platform or seller bears all shipping costs.</li>
    <li><b>Customer Reason:</b> If you changed your mind or ordered the wrong size, you will bear the original and return shipping fees, which will be deducted from your refund.</li>
</ul>

<h2>Refund Process</h2>
<p>Once the returned item reaches the warehouse, it undergoes a technical inspection (24-48 hours).</p>
<ul>
    <li><b>Approval:</b> If it passes inspection, the refund is processed.</li>
    <li><b>Method:</b> Funds will be added to your ChariDay Wallet or transferred to your bank/postal account (CCP) within 3 to 7 business days.</li>
</ul>
`;

const returnFr = `
<h2>Introduction à la Politique de Retour et d'Échange</h2>
<p>Chez ChariDay, la satisfaction du client est notre priorité absolue. Sachant que certains produits peuvent ne pas répondre pleinement à vos attentes, nous avons élaboré une politique de retour et d'échange flexible, transparente et équitable, conforme aux lois commerciales en vigueur en Algérie.</p>

<h2>Délai Autorisé pour les Retours</h2>
<p>Les clients ont le droit de demander un retour ou un échange dans un délai de <b>trois (3) jours</b> à compter de la réception effective du colis, à condition que les conditions de base soient remplies. Passé ce délai, la commande est considérée comme définitive.</p>

<h2>Conditions d'Acceptation des Retours</h2>
<p>Pour qu'une demande de retour soit acceptée, le produit doit strictement remplir les conditions suivantes :</p>
<ul>
    <li><b>État d'origine :</b> Le produit doit être dans son état d'origine, non utilisé, non porté, non lavé, et sans aucune rayure.</li>
    <li><b>Emballage d'origine :</b> Le produit doit être retourné dans sa boîte et son emballage d'origine, avec toutes les étiquettes.</li>
    <li><b>Accessoires et Cadeaux :</b> S'ils sont inclus, ils doivent tous être retournés dans leur état d'origine.</li>
</ul>

<h2>Articles Non Retournables</h2>
<p>Veuillez noter que pour des raisons d'hygiène et légales, certaines catégories sont exclues du droit de retour :</p>
<ul>
    <li><b>Articles Personnels :</b> Sous-vêtements, maillots de bain, chaussettes et cosmétiques ouverts.</li>
    <li><b>Consommables :</b> Produits alimentaires, boissons et suppléments nutritionnels.</li>
    <li><b>Produits Numériques :</b> Logiciels et appareils électroniques dont le sceau d'origine a été brisé.</li>
</ul>

<h2>Procédure de Retour</h2>
<ol>
    <li><b>Soumettre la demande :</b> Connectez-vous à votre compte, allez dans "Mes Commandes" et cliquez sur "Demander un retour".</li>
    <li><b>Inspection Initiale :</b> Il vous sera demandé d'envoyer des photos claires du produit.</li>
    <li><b>Préparer le colis :</b> Remballez le produit en toute sécurité.</li>
    <li><b>Remise :</b> Nous coordonnerons avec la société de transport pour récupérer le colis.</li>
</ol>

<h2>Frais d'Expédition pour les Retours</h2>
<ul>
    <li><b>Erreur du vendeur :</b> Si vous recevez un article erroné ou défectueux, le vendeur prend en charge tous les frais d'expédition.</li>
    <li><b>Raison du client :</b> Si vous changez d'avis, vous supporterez les frais d'expédition (aller et retour), qui seront déduits de votre remboursement.</li>
</ul>

<h2>Processus de Remboursement</h2>
<p>Une fois l'article retourné arrivé à l'entrepôt, il subit une inspection technique (24-48 heures). En cas d'approbation, les fonds seront ajoutés à votre portefeuille ChariDay ou transférés sur votre compte bancaire/postal (CCP) dans un délai de 3 à 7 jours ouvrables.</p>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "https://images.unsplash.com/photo-1580828369019-2238b69db558?q=80&w=2000&auto=format&fit=crop",
          content: [
            { locale: "ar", title: "سياسة الاسترجاع والاستبدال", desc: "نحن في شاري داي نضمن لك حقوقك كاملة. تعرف على شروط وخطوات إرجاع المنتجات بكل شفافية وسهولة." },
            { locale: "en", title: "Return & Exchange Policy", desc: "At ChariDay, we guarantee your rights fully. Learn about the conditions and steps for returning products clearly and easily." },
            { locale: "fr", title: "Politique de Retour et d'Échange", desc: "Chez ChariDay, nous garantissons pleinement vos droits. Découvrez les conditions et les étapes pour retourner les produits en toute transparence." }
          ],
          id: "Hero-Return"
        }
      },
      {
        type: "RichText",
        props: {
          content: [
            { locale: "ar", html: returnAr },
            { locale: "en", html: returnEn },
            { locale: "fr", html: returnFr }
          ],
          id: "RichText-Return"
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const returnPage = {
  slug: 'return-policy',
  titleAr: 'سياسة الاسترجاع',
  titleEn: 'Return Policy',
  titleFr: 'Politique de retour',
  titleJson: JSON.stringify({
    ar: 'سياسة الاسترجاع',
    en: 'Return Policy',
    fr: 'Politique de retour'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: returnPage.slug },
    update: {
      titleAr: returnPage.titleAr,
      titleEn: returnPage.titleEn,
      titleFr: returnPage.titleFr,
      titleJson: returnPage.titleJson,
      content: returnPage.content
    },
    create: returnPage
  });
  console.log("Updated return policy page with highly professional content.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
