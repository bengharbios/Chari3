import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const shippingAr = `
<h2>1. مقدمة حول سياسة الشحن والتوصيل</h2>
<p>نحن في منصة شاري داي (ChariDay) نحرص على تقديم تجربة تسوق إلكتروني متكاملة، تبدأ من لحظة تأكيد طلبك وحتى وصوله إلى باب منزلك أو أقرب مكتب شحن إليك. تم إعداد "سياسة الشحن والتوصيل" هذه لتوضيح كافة التفاصيل المتعلقة بعمليات النقل، الجداول الزمنية، والخيارات المتاحة لعملائنا في جميع ولايات الجزائر (58 ولاية).</p>

<h2>2. شركاء الشحن المعتمدون</h2>
<p>لضمان وصول طرودكم بأمان وفي أسرع وقت ممكن، تعقد شاري داي شراكات استراتيجية مع أفضل وأكبر شركات الشحن والتوصيل السريع في الجزائر (مثل ياليدين إكسبريس وغيرها من الشركات الموثوقة). تضمن هذه الشراكات تغطية جغرافية شاملة وخدمات تتبع دقيقة لكل طرد.</p>

<h2>3. خيارات الشحن المتاحة</h2>
<p>توفر منصتنا خيارين مرنين لاستلام طلبياتكم:</p>
<ul>
    <li><b>التوصيل إلى المنزل (Delivery to Door):</b> يتم توصيل الطرد مباشرة إلى العنوان الشخصي أو مقر العمل الذي قمت بإدخاله أثناء الطلب. سيقوم مندوب التوصيل بالاتصال بك هاتفياً قبل وصوله للتنسيق معك.</li>
    <li><b>الاستلام من مكتب الشحن (Stop Desk):</b> يمكنك اختيار استلام طردك من أقرب وكالة أو مكتب لشركة الشحن في ولايتك أو دائرتك. هذا الخيار غالباً ما يكون أسرع وأقل تكلفة من التوصيل المنزلي.</li>
</ul>

<h2>4. مدة تجهيز وتوصيل الطلبات</h2>
<p>تمر عملية التوصيل بمرحلتين أساسيتين:</p>
<ul>
    <li><b>مدة التجهيز من قبل البائع:</b> يلتزم البائع بتجهيز وتغليف طلبك وتسليمه لشركة الشحن خلال مدة تتراوح بين <b>24 إلى 48 ساعة</b> (أيام العمل) من لحظة تأكيد الطلب.</li>
    <li><b>مدة التوصيل:</b> تختلف مدة التوصيل الفعلية حسب الولاية:
        <ul>
            <li><b>ولايات الشمال والوسط:</b> تستغرق عادة من <b>1 إلى 3 أيام عمل</b>.</li>
            <li><b>ولايات الشرق والغرب:</b> تستغرق عادة من <b>2 إلى 4 أيام عمل</b>.</li>
            <li><b>ولايات الجنوب الكبير:</b> قد تستغرق من <b>4 إلى 7 أيام عمل</b> كحد أقصى نظراً للمسافات الطويلة.</li>
        </ul>
    </li>
</ul>

<h2>5. رسوم وتكاليف الشحن</h2>
<p>تُحسب تكاليف الشحن آلياً وبكل شفافية قبل إتمامك لعملية الدفع بناءً على المعايير التالية:</p>
<ul>
    <li>الولاية والمنطقة الجغرافية (التوصيل للمدن الرئيسية أرخص من البلديات النائية).</li>
    <li>الوزن الإجمالي والحجم الفعلي للطرد.</li>
    <li>خيار التوصيل المُحدد (توصيل للمنزل أو استلام من المكتب).</li>
</ul>
<p>ملاحظة: بعض البائعين قد يقدمون عروض <b>"شحن مجاني"</b> عند تجاوز قيمة المشتريات حداً معيناً، وسيظهر ذلك بوضوح في صفحة الدفع.</p>

<h2>6. تتبع الطلبات (Order Tracking)</h2>
<p>لتبقيك على إطلاع دائم بحالة طلبك، نوفر لك ميزة التتبع الفوري. بمجرد تسليم الطرد لشركة الشحن، ستحصل على "رقم التتبع" (Tracking Number). يمكنك إدخال هذا الرقم في صفحة "تتبع الطلبات" على منصتنا أو مباشرة على موقع شركة الشحن لمعرفة مسار طردك خطوة بخطوة.</p>

<h2>7. سياسة الفشل في التسليم (رفض الاستلام أو عدم الرد)</h2>
<p>لضمان حقوق البائعين وتغطية التكاليف اللوجستية، نُطبق السياسات التالية في حال فشل التسليم:</p>
<ul>
    <li>سيقوم مندوب التوصيل بمحاولة الاتصال بك حتى 3 مرات في أيام مختلفة. في حال عدم الرد، سيتم إرجاع الطرد إلى البائع.</li>
    <li>في حال رفض العميل استلام الطرد بدون سبب وجيه بعد تأكيد الطلب، قد يتم تقييد حسابه في المنصة، أو حظر ميزة "الدفع عند الاستلام" (COD) في طلباته المستقبلية، والاعتماد فقط على الدفع المسبق.</li>
    <li>يُرجى التأكد من كتابة العنوان الدقيق ورقم هاتف يعمل لتجنب أي تأخير أو إرجاع للمنتجات.</li>
</ul>

<h2>8. التلف أو فقدان الطرد أثناء الشحن</h2>
<p>في حالة استلام طرد مفتوح أو ممزق، يُرجى <b>رفض الاستلام</b> من المندوب فوراً والتواصل معنا. أما إذا اكتشفت أن المنتج الداخلي تعرض للتلف بسبب الشحن بعد الفتح، يرجى تصوير المنتج والتواصل مع خدمة العملاء في غضون 24 ساعة، وسنتكفل بتعويضك أو استبدال المنتج بالتنسيق مع البائع وشركة الشحن.</p>
`;

const shippingEn = `
<h2>1. Introduction to Shipping & Delivery Policy</h2>
<p>At ChariDay, we strive to provide an integrated e-commerce experience from the moment your order is confirmed until it reaches your doorstep or the nearest shipping office. This policy clarifies all details related to transportation, timelines, and options available to our customers across all 58 wilayas of Algeria.</p>

<h2>2. Approved Shipping Partners</h2>
<p>To ensure your packages arrive safely and as quickly as possible, ChariDay has strategic partnerships with the best and largest express shipping companies in Algeria (such as Yalidine Express and other trusted companies).</p>

<h2>3. Available Shipping Options</h2>
<ul>
    <li><b>Delivery to Door:</b> The package is delivered directly to your personal address or workplace. The delivery agent will call you beforehand to coordinate.</li>
    <li><b>Stop Desk (Pickup from Office):</b> You can choose to pick up your package from the nearest agency of the shipping company. This is often faster and cheaper.</li>
</ul>

<h2>4. Processing and Delivery Time</h2>
<ul>
    <li><b>Seller Processing Time:</b> The seller prepares and hands over the package within <b>24 to 48 hours</b>.</li>
    <li><b>Delivery Time:</b>
        <ul>
            <li><b>Northern & Central Wilayas:</b> 1 to 3 business days.</li>
            <li><b>Eastern & Western Wilayas:</b> 2 to 4 business days.</li>
            <li><b>Southern Wilayas:</b> 4 to 7 business days max due to long distances.</li>
        </ul>
    </li>
</ul>

<h2>5. Shipping Fees and Costs</h2>
<p>Shipping costs are calculated automatically and transparently before payment based on the destination wilaya, total weight, and chosen delivery option (Home Delivery vs. Stop Desk).</p>

<h2>6. Order Tracking</h2>
<p>Once the package is handed over to the shipping company, you will receive a Tracking Number. You can use this number on our platform to track your package step by step.</p>

<h2>7. Delivery Failure Policy</h2>
<p>The delivery agent will attempt to call you up to 3 times. If there is no response, the package is returned to the seller. Customers who reject packages without a valid reason may face restrictions on their account, such as losing access to Cash on Delivery (COD).</p>

<h2>8. Damaged or Lost Packages</h2>
<p>If you receive a torn or opened package, please refuse to accept it from the courier. If the product inside is damaged, contact our customer service within 24 hours with photos for compensation.</p>
`;

const shippingFr = `
<h2>1. Introduction à la Politique d'Expédition</h2>
<p>Chez ChariDay, nous nous efforçons de fournir une expérience e-commerce intégrée, de la confirmation de votre commande jusqu'à son arrivée. Cette politique précise tous les détails concernant le transport, les délais et les options disponibles dans les 58 wilayas d'Algérie.</p>

<h2>2. Partenaires d'Expédition Agréés</h2>
<p>Pour garantir que vos colis arrivent en toute sécurité, ChariDay a conclu des partenariats stratégiques avec les meilleures entreprises de livraison express en Algérie (comme Yalidine Express et d'autres).</p>

<h2>3. Options d'Expédition Disponibles</h2>
<ul>
    <li><b>Livraison à Domicile :</b> Le colis est livré directement à votre adresse. Le livreur vous appellera avant son arrivée.</li>
    <li><b>Stop Desk (Retrait en point relais) :</b> Vous pouvez choisir de retirer votre colis à l'agence la plus proche. C'est souvent plus rapide et moins cher.</li>
</ul>

<h2>4. Délais de Traitement et de Livraison</h2>
<ul>
    <li><b>Temps de préparation :</b> Le vendeur prépare le colis en <b>24 à 48 heures</b>.</li>
    <li><b>Délai de Livraison :</b>
        <ul>
            <li><b>Wilayas du Nord et du Centre :</b> 1 à 3 jours ouvrables.</li>
            <li><b>Wilayas de l'Est et de l'Ouest :</b> 2 à 4 jours ouvrables.</li>
            <li><b>Wilayas du Grand Sud :</b> 4 à 7 jours ouvrables.</li>
        </ul>
    </li>
</ul>

<h2>5. Frais d'Expédition</h2>
<p>Les frais d'expédition sont calculés automatiquement avant le paiement en fonction de la wilaya de destination, du poids total et de l'option de livraison choisie.</p>

<h2>6. Suivi des Commandes</h2>
<p>Une fois le colis remis à l'entreprise d'expédition, vous recevrez un numéro de suivi que vous pourrez utiliser sur notre plateforme.</p>

<h2>7. Échec de Livraison</h2>
<p>Le livreur tentera de vous appeler jusqu'à 3 fois. En cas de non-réponse, le colis est retourné au vendeur. Les clients qui refusent des colis sans raison valable peuvent voir leur compte restreint (perte de l'option Paiement à la Livraison).</p>

<h2>8. Colis Endommagés ou Perdus</h2>
<p>Si vous recevez un colis déchiré ou ouvert, veuillez refuser de l'accepter. Si le produit à l'intérieur est endommagé, contactez notre service client dans les 24 heures avec des photos.</p>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "https://images.unsplash.com/photo-1586528116311-ad8ed7c663c0?q=80&w=2000&auto=format&fit=crop",
          content: [
            { locale: "ar", title: "سياسة الشحن والتوصيل", desc: "نحن نضمن وصول مشترياتك بأمان وسرعة إلى كافة ولايات الجزائر الـ 58. تعرف على خيارات الشحن والجداول الزمنية." },
            { locale: "en", title: "Shipping & Delivery Policy", desc: "We ensure your purchases arrive safely and quickly to all 58 Wilayas. Learn about our shipping options and timelines." },
            { locale: "fr", title: "Politique d'Expédition", desc: "Nous garantissons que vos achats arrivent en toute sécurité et rapidement dans les 58 Wilayas. Découvrez nos options d'expédition." }
          ],
          id: "Hero-Shipping"
        }
      },
      {
        type: "RichText",
        props: {
          content: [
            { locale: "ar", html: shippingAr },
            { locale: "en", html: shippingEn },
            { locale: "fr", html: shippingFr }
          ],
          id: "RichText-Shipping"
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const shippingPage = {
  slug: 'shipping-policy',
  titleAr: 'سياسة الشحن',
  titleEn: 'Shipping Policy',
  titleFr: 'Politique d\'expédition',
  titleJson: JSON.stringify({
    ar: 'سياسة الشحن',
    en: 'Shipping Policy',
    fr: 'Politique d\'expédition'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: shippingPage.slug },
    update: {
      titleAr: shippingPage.titleAr,
      titleEn: shippingPage.titleEn,
      titleFr: shippingPage.titleFr,
      titleJson: shippingPage.titleJson,
      content: shippingPage.content
    },
    create: shippingPage
  });
  console.log("Updated shipping policy page with highly professional content.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
