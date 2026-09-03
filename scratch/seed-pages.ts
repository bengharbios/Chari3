import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const yalidineTermsAr = `الشروط العامة للنقل ياليدين (نسخة أوت 2026)
لا يجوز تعديل أو حذف هذه الشروط العامة للنقل إلا بموافقة خطية من شركة ياليدين. وتحتفظ ياليدين بحق تعديلها في أي وقت. وفي حال إجراء أي تعديل، تُطبَّق النسخة السارية ابتداءً من تاريخ إرسال الطرد من طرف الزبون.

المادة 1 موضوع الاتفاقية: تهدف هذه الاتفاقية إلى تحديد الشروط وكيفية تنفيذ خدمات النقل والخدمات الإضافية، وكذلك فتح حساب للعميل (المرسل) يمكّنه من الوصول إلى منصة ياليدين باستخدام اسم مستخدم وكلمة مرور لطباعة قسيمة الإرسال وتتبع نشاطه في الوقت الفعلي.

المادة 2 مدة الاتفاقية: تُبرم هذه الاتفاقية بين الزبون (المرسل) وياليدين لمدة سنة (01) واحدة اعتبارًا من تاريخ التوقيع، ويتم تجديدها تلقائيًا ما لم يُبدِ أحد الطرفين رغبته في عدم التجديد، وذلك بإشعار الطرف الآخر قبل ثلاثين (30) يومًا على الأقل من انتهاء الأجل، عبر البريد الإلكتروني.

المادة 3 الشحنات والطرود: تشمل الطرود والمغلفات والوثائق والبضائع وفقًا للشروط العامة والقيود المفروضة على النقل، وكذلك قائمة المواد المحظورة المنشورة في جميع الوكالات وعلى موقع www.yalidine.com.

المادة 4 تنفيذ الخدمات: تشمل خدمات ياليدين: التسليم إلى المنزل للطرود ذات الوزن الفعلي أو الحجمي الذي لا يتجاوز 20 كغ، التسليم في نقاط الاستلام (وكالات ياليدين والشركاء)، التسليم في نفس اليوم، إعادة التوجيه، الإرجاع، والتحصيل عند التسليم (D.O.C) حتى حد أقصى قدره 150,000 دج لكل طرد.

المادة 5 فتح الطرد قبل تأكيد التسليم: إذا سمح المرسل للمستلم بفتح الطرد قبل تأكيد الاستلام، فإن ياليدين تُعفى من أي مسؤولية في حالة الفقدان أو النقص أو التلف أو تلف التغليف.

المادة 6 تبادل المنتجات: في حالة تبادل منتج أو أكثر مقبول من طرف الزبون (المرسل)، تُعفى ياليدين من أي مسؤولية عن النقص أو الضرر أو تلف التغليف.

المادة 7 تجهيز الإرسال من طرف الزبون: يلتزم الزبون (المرسل) بتجهيز الطرد مسبقًا مرفقًا بقسيمة إرسال مكتملة البيانات ومثبتة بإحكام...`;

const yalidineTermsEn = `Yalidine General Transport Conditions (August 2026 Version)
These General Transport Conditions may not be modified or deleted without written consent from Yalidine. Yalidine reserves the right to modify them at any time. In the event of any modification, the applicable version will be the one in effect from the date the parcel is sent by the customer.

Article 1 Subject of the Agreement: The purpose of this agreement is to define the conditions and modalities for the execution of transport and additional services, as well as opening a customer account (sender) that allows them to access the Yalidine platform using a username and password to print the dispatch slip and track their activity in real time.

Article 2 Duration of the Agreement: This agreement is concluded between the customer (sender) and Yalidine for a period of one (01) year from the date of signature, and is automatically renewed unless one of the parties expresses their desire not to renew...`;

const returnPolicyAr = `سياسة إستبدال وإرجاع السلع
تماشياً مع سياسـتنا التي تعطي أولوية لإرضاء للزبون، فإن كافة المشتريات عبر موقعنا قابلة للإستبدال خلال 3 أيام من تاريخ وصولها إليك. ينطبق ذلك أيضاً على كل المشتريات المتضررة أو التي فيها عيوب وكذلك المشتريات الواصلة إليك بالخطأ. أو حتى في حالة غيرت رأيك في المنتج الذي تريده، فرضاكم هو هدفنا

إستبدال السلع
قبل تقديم طلب إستبدال منتج تأكد من النقاط التالية:
التأكد من بقاء المنتح في حالته الأصلية بما في ذلك التغليف الخاص به وأنه لم يستعمل
التأكد من أنه لم يمر أكثر من 3 أيام عن تاريخ إستلامك السلعة.
ضرورة إظهار وصل التسليم (الفاتورة) الذي وصلك مع السلعة والذي يحتوى على رقم الطلب الخاص بك.

سياسة الإستبدال تشمل جميع منتجات المنصة 
نضمن إستبدال المنتجات في حال وصلتك تالفة من جميع الأقسام مع ضرورة الإبلاغ عليها خلال 24 ساعة مع إرسال صور تثبت ذلك.
في حالة خطأ وخلل في المنتوج يكون الإستبدال مجاني، أما في حالة تغيير المنتج بدون سبب يتم دفع رسوم التوصيل.
السلع التي عليها تخفيضات موسمية لا يمكن إستبدالها مع أي سلع أخرى ليس عليها تخفيضات موسمية، فقط يمكن إستبدالها مع نفس السلعة.`;

const returnPolicyEn = `Return and Exchange Policy
In line with our policy that prioritizes customer satisfaction, all purchases through our website can be exchanged within 3 days from the date they arrive to you. This also applies to all damaged or defective purchases, as well as purchases delivered to you by mistake. Or even if you change your mind about the product you want, your satisfaction is our goal.

Exchange of Goods
Before submitting a product exchange request, ensure the following points:
Ensure the product remains in its original condition, including its packaging, and that it has not been used.
Ensure that no more than 3 days have passed since the date you received the item.
The delivery receipt (invoice) that arrived with the item, which contains your order number, must be shown.`;

const privacyPolicyAr = `سياسة الخصوصية
نحن نأخذ خصوصيتك على محمل الجد ونلتزم بحماية معلوماتك الشخصية. تشرح سياسة الخصوصية هذه المعلومات الشخصية التي نجمعها ، ولماذا نجمعها ، وكيف نستخدمها وكيف نحميها.

جمع المعلومات
قد نجمع معلومات شخصية مثل اسمك وعنوان بريدك الإلكتروني وعنوانك البريدي ورقم هاتفك والمعلومات الأخرى التي تزودنا بها عندما تتفاعل مع موقعنا الإلكتروني أو منتجاتنا أو خدماتنا.
قد نقوم أيضًا بجمع معلومات غير شخصية مثل عنوان IP الخاص بك ونوع المتصفح ونظام التشغيل ، بالإضافة إلى معلومات حول كيفية استخدامك لموقعنا وخدماتنا.

كيف نستخدم معلوماتك
قد نستخدم معلوماتك الشخصية لتقديم منتجاتنا أو خدماتنا لك ، وللتواصل معك بشأن حسابك أو معاملاتك معنا ، وللرد على استفساراتك أو طلباتك ، ولتحسين موقعنا الإلكتروني وخدماتنا.`;

const privacyPolicyEn = `Privacy Policy
We take your privacy seriously and are committed to protecting your personal information. This Privacy Policy explains what personal information we collect, why we collect it, how we use it, and how we protect it.

Information Collection
We may collect personal information such as your name, email address, postal address, phone number, and other information you provide when you interact with our website, products, or services.
We may also collect non-personal information such as your IP address, browser type, and operating system, as well as information about how you use our website and services.`;

const entrepreneurAr = `التسجيل في منصة المقاول الذاتي :
الاجابة على جميع تساؤلاتكم الشائعة حول التسجيل في بطاقة المقاول الذاتي

ما هي أنشطة المقاول الذاتي في الجزائر؟
تُصنّف نشاطات المقاول الذاتي في ثمانية مجالات أساسية: 
الاستشارة، الخبرة والتكوين.
الخدمات الرقمية والأنشطة ذات الصلة. 
الخدمات المنزلية. 
الخدمات الموجهة للأشخاص. 
خدمات الترفيه والتسلية.
الخدمات الموجهة للمؤسسات.
الخدمات الثقافية، الاتصال والسمعي البصري.
الاستيراد المصغر

ما هي شروط التسجيل في المقاول الذاتي
قبل التسجيل و طلب بطاقة المقاول الذاتي عليك أولا بمعرفة شروط الحصول على البطاقة و الالتزامات التي تترتب عند استلامها و بداية النشاط.
الشروط العامة:
السن القانوني : بلوغ السن القانونية للعمل 
الجنسية الجزائرية : أن يكون من جنسـية جزائرية ومقيمــا بالجزائر أو أجنبـيا مقيما وفقا للتشريع والتنظيم المعمول بهما
النشاط : أن يمارس نشاطا مدرجا ضمن قائمة النشاطات المؤهلة للاستفادة`;

const entrepreneurEn = `Registration in the Auto-Entrepreneur Platform:
Answering all your common questions about registering for the Auto-Entrepreneur Card.

What are the auto-entrepreneur activities in Algeria?
Auto-entrepreneur activities are classified into eight main areas:
Consulting, expertise, and training.
Digital services and related activities.
Home services.
Personal services.
Entertainment and leisure services.
Business services.
Cultural, communication, and audiovisual services.
Micro-import.

What are the conditions for registering as an auto-entrepreneur?
Before registering and applying for the auto-entrepreneur card, you must first know the conditions for obtaining the card and the obligations that entail upon receiving it and starting the activity.`;

function createPuckData(ar, en) {
  return JSON.stringify({
    content: [
      {
        type: "Text",
        props: {
          textAr: ar,
          textEn: en,
          textFr: en,
          align: "right",
          id: "Text-" + Math.random().toString(36).substr(2, 9)
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const pages = [
  {
    slug: 'terms',
    titleAr: 'الشروط والأحكام',
    titleEn: 'Terms and Conditions',
    titleFr: 'Termes et conditions',
    content: createPuckData(yalidineTermsAr, yalidineTermsEn),
    isPublished: true
  },
  {
    slug: 'return-policy',
    titleAr: 'سياسة الاسترجاع',
    titleEn: 'Return Policy',
    titleFr: 'Politique de retour',
    content: createPuckData(returnPolicyAr, returnPolicyEn),
    isPublished: true
  },
  {
    slug: 'privacy-policy',
    titleAr: 'سياسة الخصوصية',
    titleEn: 'Privacy Policy',
    titleFr: 'Politique de confidentialité',
    content: createPuckData(privacyPolicyAr, privacyPolicyEn),
    isPublished: true
  },
  {
    slug: 'auto-entrepreneur',
    titleAr: 'المقاول الذاتي',
    titleEn: 'Auto Entrepreneur',
    titleFr: 'Auto-entrepreneur',
    content: createPuckData(entrepreneurAr, entrepreneurEn),
    isPublished: true
  }
];

async function main() {
  for (const p of pages) {
    await prisma.customPage.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
    console.log("Created page: " + p.slug);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
