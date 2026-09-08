import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const yalidineTermsAr = `
<h2>موضوع الاتفاقية</h2>
<p>تهدف هذه الاتفاقية إلى تحديد الشروط وكيفية تنفيذ خدمات النقل والخدمات الإضافية، وكذلك فتح حساب للعميل (المرسل) يمكّنه من الوصول إلى منصة ياليدين باستخدام اسم مستخدم وكلمة مرور لطباعة قسيمة الإرسال وتتبع نشاطه في الوقت الفعلي.</p>
<h2>مدة الاتفاقية</h2>
<p>تُبرم هذه الاتفاقية بين الزبون (المرسل) وياليدين لمدة سنة (01) واحدة اعتبارًا من تاريخ التوقيع، ويتم تجديدها تلقائيًا ما لم يُبدِ أحد الطرفين رغبته في عدم التجديد، وذلك بإشعار الطرف الآخر قبل ثلاثين (30) يومًا على الأقل من انتهاء الأجل، عبر البريد الإلكتروني.</p>
<h2>الشحنات والطرود</h2>
<p>تشمل الطرود والمغلفات والوثائق والبضائع وفقًا للشروط العامة والقيود المفروضة على النقل، وكذلك قائمة المواد المحظورة المنشورة في جميع الوكالات وعلى موقع ياليدين.</p>
<h2>تنفيذ الخدمات</h2>
<p>تشمل خدمات ياليدين: التسليم إلى المنزل للطرود ذات الوزن الفعلي أو الحجمي الذي لا يتجاوز 20 كغ، التسليم في نقاط الاستلام (وكالات ياليدين والشركاء)، التسليم في نفس اليوم، إعادة التوجيه، الإرجاع، والتحصيل عند التسليم (D.O.C) حتى حد أقصى قدره 150,000 دج لكل طرد.</p>
<h2>فتح الطرد قبل تأكيد التسليم</h2>
<p>إذا سمح المرسل للمستلم بفتح الطرد قبل تأكيد الاستلام، فإن ياليدين تُعفى من أي مسؤولية في حالة الفقدان أو النقص أو التلف أو تلف التغليف.</p>
<h2>تبادل المنتجات</h2>
<p>في حالة تبادل منتج أو أكثر مقبول من طرف الزبون (المرسل)، تُعفى ياليدين من أي مسؤولية عن النقص أو الضرر أو تلف التغليف.</p>
<h2>تجهيز الإرسال من طرف الزبون</h2>
<p>يلتزم الزبون (المرسل) بتجهيز الطرد مسبقًا مرفقًا بقسيمة إرسال مكتملة البيانات ومثبتة بإحكام، تشمل: اسم المرسل والمستلم، اسم الشخص المسؤول عن الاستلام، العنوان، البلدية، الولاية، رقم الهاتف، وصف الطرد، نوع الخدمة (تجارة إلكترونية سريعة، تجارة إلكترونية اقتصادية، عادي، إشعار بالاستلام، دفتر الشروط، المناقصات)، عبارة "قابل للكسر" إن وجدت، الوزن والأبعاد الفعلية. إذا كان محتوى الطرد مخصصًا للبيع، يجب على الزبون إرفاق فاتورة مفصلة ومختومة تتضمن جميع المعلومات اللازمة.</p>
<h2>المواد المحظورة</h2>
<ul>
  <li>المشروبات الكحولية</li>
  <li>الحيوانات الحية</li>
  <li>الأسلحة النارية والأسلحة البيضاء والذخائر</li>
  <li>الألعاب النارية والمواد الحساسة</li>
  <li>الأوراق النقدية والبطاقات البنكية</li>
  <li>الأشياء القابلة للاشتعال والمواد المشعة</li>
</ul>
<p><b>ملاحظة هامة:</b> في حالة التصريح الكاذب أو تقديم معلومات غير دقيقة حول محتوى الطرد، يتحمل الزبون كامل المسؤولية ويعفي ياليدين من أي تبعات.</p>
`;

const yalidineTermsEn = `
<h2>Subject of the Agreement</h2>
<p>The purpose of this agreement is to define the conditions and modalities for executing transport and additional services, as well as opening a customer account (sender) allowing access to the Yalidine platform using a username and password to print dispatch slips and track activity in real-time.</p>
<h2>Duration of the Agreement</h2>
<p>This agreement is concluded between the customer (sender) and Yalidine for a period of one (1) year from the date of signature. It is automatically renewed unless one of the parties expresses the desire not to renew, by notifying the other party at least thirty (30) days before expiration via email.</p>
<h2>Shipments and Parcels</h2>
<p>This includes parcels, envelopes, documents, and goods in accordance with the general conditions and restrictions on transport, as well as the list of prohibited items published in all agencies and on the Yalidine website.</p>
<h2>Execution of Services</h2>
<p>Yalidine's services include: Home delivery for parcels with an actual or volumetric weight not exceeding 20 kg, delivery to pickup points (Yalidine agencies and partners), same-day delivery, redirection, returns, and Cash on Delivery (C.O.D) up to a maximum limit of 150,000 DZD per parcel.</p>
<h2>Opening the Parcel Before Delivery Confirmation</h2>
<p>If the sender allows the recipient to open the parcel before confirming receipt, Yalidine is exempt from any liability in case of loss, shortage, damage, or packaging deterioration.</p>
<h2>Product Exchange</h2>
<p>In the event of an exchange of one or more products accepted by the customer (sender), Yalidine is exempt from any liability for shortages, damage, or packaging deterioration.</p>
<h2>Preparation of Dispatch by the Customer</h2>
<p>The customer (sender) is obliged to prepare the parcel in advance, accompanied by a fully completed and securely attached dispatch slip. If the parcel's contents are intended for sale, the customer must attach a detailed and stamped invoice.</p>
<h2>Prohibited Items</h2>
<ul>
  <li>Alcoholic beverages</li>
  <li>Live animals</li>
  <li>Firearms, bladed weapons, and ammunition</li>
  <li>Fireworks and sensitive materials</li>
  <li>Banknotes and bank cards</li>
  <li>Flammable items and radioactive materials</li>
</ul>
<p><b>Important Note:</b> In case of false declaration or inaccurate information regarding the parcel's contents, the customer bears full responsibility and exempts Yalidine from any consequences.</p>
`;

const yalidineTermsFr = `
<h2>Objet de la Convention</h2>
<p>L'objet de cette convention est de définir les conditions et modalités d'exécution des services de transport et des services additionnels, ainsi que l'ouverture d'un compte client (expéditeur) lui permettant d'accéder à la plateforme Yalidine avec un identifiant et un mot de passe pour imprimer les bordereaux d'envoi et suivre son activité en temps réel.</p>
<h2>Durée de la Convention</h2>
<p>Cette convention est conclue entre le client (expéditeur) et Yalidine pour une durée d'un (01) an à compter de la date de signature. Elle est renouvelée par tacite reconduction sauf si l'une des parties exprime son désir de ne pas renouveler, en notifiant l'autre partie au moins trente (30) jours avant l'expiration, par e-mail.</p>
<h2>Envois et Colis</h2>
<p>Cela inclut les colis, enveloppes, documents et marchandises conformément aux conditions générales et aux restrictions de transport, ainsi qu'à la liste des articles interdits publiée dans toutes les agences et sur le site Web de Yalidine.</p>
<h2>Exécution des Services</h2>
<p>Les services de Yalidine comprennent : La livraison à domicile pour les colis dont le poids réel ou volumétrique ne dépasse pas 20 kg, la livraison en points relais (agences Yalidine et partenaires), la livraison le jour même, la redirection, les retours et le paiement à la livraison (C.O.D) jusqu'à une limite maximale de 150 000 DZD par colis.</p>
<h2>Ouverture du Colis Avant Confirmation de Livraison</h2>
<p>Si l'expéditeur autorise le destinataire à ouvrir le colis avant de confirmer la réception, Yalidine est exemptée de toute responsabilité en cas de perte, de manque, de dommage ou de détérioration de l'emballage.</p>
<h2>Échange de Produits</h2>
<p>En cas d'échange d'un ou plusieurs produits accepté par le client (expéditeur), Yalidine est exemptée de toute responsabilité en cas de manques, de dommages ou de détérioration de l'emballage.</p>
<h2>Préparation de l'Envoi par le Client</h2>
<p>Le client (expéditeur) est tenu de préparer le colis à l'avance, accompagné d'un bordereau d'expédition dûment rempli et solidement fixé. Si le contenu du colis est destiné à la vente, le client doit joindre une facture détaillée et tamponnée.</p>
<h2>Articles Interdits</h2>
<ul>
  <li>Boissons alcoolisées</li>
  <li>Animaux vivants</li>
  <li>Armes à feu, armes blanches et munitions</li>
  <li>Feux d'artifice et matériels sensibles</li>
  <li>Billets de banque et cartes bancaires</li>
  <li>Articles inflammables et matières radioactives</li>
</ul>
<p><b>Note Importante :</b> En cas de fausse déclaration ou d'informations inexactes concernant le contenu du colis, le client assume l'entière responsabilité et exempte Yalidine de toute conséquence.</p>
`;

const returnPolicyAr = `
<h2>سياسة الإستبدال</h2>
<p>قبل تقديم طلب إستبدال منتج تأكد من النقاط التالية:</p>
<ul>
  <li>التأكد من بقاء المنتج في حالته الأصلية بما في ذلك التغليف الخاص به وأنه لم يستعمل.</li>
  <li>التأكد من أنه لم يمر أكثر من 3 أيام عن تاريخ إستلامك للسلعة.</li>
  <li>ضرورة إظهار وصل التسليم (الفاتورة) الذي وصلك مع السلعة والذي يحتوى على رقم الطلب الخاص بك.</li>
</ul>

<h2>شروط عامة</h2>
<p>سياسة الإستبدال تشمل جميع منتجات المنصة. نضمن إستبدال المنتجات في حال وصلتك تالفة من جميع الأقسام مع ضرورة الإبلاغ عليها خلال 24 ساعة مع إرسال صور تثبت ذلك.</p>
<p>في حالة خطأ وخلل في المنتوج يكون الإستبدال مجاني، أما في حالة تغيير المنتج بدون سبب يتم دفع رسوم التوصيل.</p>
<p>السلع التي عليها تخفيضات موسمية لا يمكن إستبدالها مع أي سلع أخرى ليس عليها تخفيضات موسمية، فقط يمكن إستبدالها مع نفس السلعة.</p>

<h2>المنتجات التالفة التي يغطيها ضمان الشركة المصنعة</h2>
<p>في حالة تلف أو خلل في أحد المنتجات التي يغطيها ضمان الشركة المصنعة، وتم إستخدامه أو تجاوز مدة 3 أيام من تاريخ إستلامه، سيكون عليك إرساله إلى مقرنا ليتم معاينته وإرساله للشركة المصنعة والتي بدورها ستقوم بإصلاحه أو تغيير الجزء التالف فيه ثم نقوم بإعادة توصيله إليكم.</p>
<p>يرجى ملاحظه أن ممكن تستغرق هذه العملية حتى 25 يوم.</p>
`;

const returnPolicyEn = `
<h2>Exchange Policy</h2>
<p>Before submitting a product exchange request, ensure the following points:</p>
<ul>
  <li>Ensure the product remains in its original condition, including its packaging, and that it has not been used.</li>
  <li>Ensure that no more than 3 days have passed since the date you received the item.</li>
  <li>The delivery receipt (invoice) that arrived with the item, containing your order number, must be shown.</li>
</ul>

<h2>General Conditions</h2>
<p>The exchange policy covers all products on the platform. We guarantee the replacement of products if they reach you damaged from all departments, provided that you report it within 24 hours and send photos proving it.</p>
<p>In case of an error or defect in the product, the exchange is free. However, in case of changing the product without reason, delivery fees must be paid.</p>
<p>Items on seasonal discounts cannot be exchanged with any other items not on seasonal discounts; they can only be exchanged with the same item.</p>

<h2>Damaged Products Covered by Manufacturer's Warranty</h2>
<p>In case of damage or a defect in one of the products covered by the manufacturer's warranty, and it has been used or exceeded 3 days from the date of receipt, you will have to send it to our headquarters to be inspected and sent to the manufacturer, who will repair it or replace the damaged part, and then we will re-deliver it to you.</p>
<p>Please note that this process may take up to 25 days.</p>
`;

const returnPolicyFr = `
<h2>Politique d'Échange</h2>
<p>Avant de soumettre une demande d'échange de produit, veuillez vérifier les points suivants :</p>
<ul>
  <li>Assurez-vous que le produit reste dans son état d'origine, y compris son emballage, et qu'il n'a pas été utilisé.</li>
  <li>Assurez-vous qu'il ne s'est pas écoulé plus de 3 jours depuis la date à laquelle vous avez reçu l'article.</li>
  <li>Le reçu de livraison (facture) arrivé avec l'article, contenant votre numéro de commande, doit être présenté.</li>
</ul>

<h2>Conditions Générales</h2>
<p>La politique d'échange couvre tous les produits sur la plateforme. Nous garantissons le remplacement des produits s'ils vous parviennent endommagés de tous les départements, à condition de le signaler dans les 24 heures et d'envoyer des photos le prouvant.</p>
<p>En cas d'erreur ou de défaut du produit, l'échange est gratuit. Cependant, en cas de changement de produit sans raison, les frais de livraison doivent être payés.</p>
<p>Les articles en promotion saisonnière ne peuvent pas être échangés contre d'autres articles qui ne sont pas en promotion saisonnière ; ils ne peuvent être échangés qu'avec le même article.</p>

<h2>Produits Endommagés Couverts par la Garantie du Fabricant</h2>
<p>En cas de dommage ou de défaut de l'un des produits couverts par la garantie du fabricant, et s'il a été utilisé ou a dépassé 3 jours à compter de la date de réception, vous devrez l'envoyer à notre siège pour être inspecté et envoyé au fabricant, qui le réparera ou remplacera la pièce endommagée, puis nous vous le relivrerons.</p>
<p>Veuillez noter que ce processus peut prendre jusqu'à 25 jours.</p>
`;

const privacyPolicyAr = `
<h2>جمع المعلومات</h2>
<p>قد نجمع معلومات شخصية مثل اسمك وعنوان بريدك الإلكتروني وعنوانك البريدي ورقم هاتفك والمعلومات الأخرى التي تزودنا بها عندما تتفاعل مع موقعنا الإلكتروني أو منتجاتنا أو خدماتنا. قد نقوم أيضًا بجمع معلومات غير شخصية مثل عنوان IP الخاص بك ونوع المتصفح ونظام التشغيل ، بالإضافة إلى معلومات حول كيفية استخدامك لموقعنا وخدماتنا.</p>
<h2>كيف نستخدم معلوماتك</h2>
<p>قد نستخدم معلوماتك الشخصية لتقديم منتجاتنا أو خدماتنا لك ، وللتواصل معك بشأن حسابك أو معاملاتك معنا ، وللرد على استفساراتك أو طلباتك ، ولتحسين موقعنا الإلكتروني وخدماتنا. قد نستخدم معلوماتك أيضًا لأغراض تسويقية ، مثل إرسال رسائل بريد إلكتروني ترويجية أو رسائل إخبارية. يمكنك إلغاء الاشتراك في تلقي هذه الاتصالات في أي وقت.</p>
<h2>كيف نشارك المعلومات الخاصة بك</h2>
<p>قد نشارك معلوماتك الشخصية مع مزودي الخدمة من الأطراف الثالثة الذين يساعدوننا في تقديم منتجاتنا وخدماتنا ، مثل معالجات الدفع ومقدمي خدمات الشحن ومقدمي خدمة العملاء. يجوز لنا أيضًا مشاركة معلوماتك إذا كان ذلك مطلوبًا بموجب القانون أو إذا كنا نعتقد بحسن نية أن هذا الإجراء ضروري للامتثال للمتطلبات القانونية.</p>
<h2>حقوقك</h2>
<p>لديك الحق في الوصول إلى معلوماتك الشخصية أو تعديلها أو حذفها في أي وقت. يمكنك القيام بذلك عن طريق تسجيل الدخول إلى حسابك أو عن طريق الاتصال بنا مباشرة.</p>
`;

const privacyPolicyEn = `
<h2>Information Collection</h2>
<p>We may collect personal information such as your name, email address, postal address, phone number, and other information you provide when you interact with our website, products, or services. We may also collect non-personal information such as your IP address, browser type, and operating system, as well as information about how you use our website and services.</p>
<h2>How We Use Your Information</h2>
<p>We may use your personal information to provide our products or services to you, to communicate with you about your account or transactions with us, to respond to your inquiries or requests, and to improve our website and services. We may also use your information for marketing purposes, such as sending promotional emails or newsletters. You can opt-out of receiving these communications at any time.</p>
<h2>How We Share Your Information</h2>
<p>We may share your personal information with third-party service providers who help us provide our products and services, such as payment processors, shipping providers, and customer service providers. We may also share your information if required by law or if we believe in good faith that such action is necessary to comply with legal requirements.</p>
<h2>Your Rights</h2>
<p>You have the right to access, modify, or delete your personal information at any time. You can do this by logging into your account or by contacting us directly.</p>
`;

const privacyPolicyFr = `
<h2>Collecte d'Informations</h2>
<p>Nous pouvons collecter des informations personnelles telles que votre nom, adresse e-mail, adresse postale, numéro de téléphone et autres informations que vous fournissez lorsque vous interagissez avec notre site Web, nos produits ou nos services. Nous pouvons également collecter des informations non personnelles telles que votre adresse IP, votre type de navigateur et votre système d'exploitation, ainsi que des informations sur la façon dont vous utilisez notre site Web et nos services.</p>
<h2>Comment Nous Utilisons Vos Informations</h2>
<p>Nous pouvons utiliser vos informations personnelles pour vous fournir nos produits ou services, pour communiquer avec vous au sujet de votre compte ou de vos transactions avec nous, pour répondre à vos demandes de renseignements, et pour améliorer notre site Web et nos services. Nous pouvons également utiliser vos informations à des fins de marketing, comme l'envoi d'e-mails promotionnels ou de newsletters. Vous pouvez vous désinscrire de la réception de ces communications à tout moment.</p>
<h2>Comment Nous Partageons Vos Informations</h2>
<p>Nous pouvons partager vos informations personnelles avec des prestataires de services tiers qui nous aident à fournir nos produits et services, tels que les processeurs de paiement, les prestataires d'expédition et les prestataires de service client. Nous pouvons également partager vos informations si la loi l'exige ou si nous pensons de bonne foi qu'une telle action est nécessaire pour se conformer aux exigences légales.</p>
<h2>Vos Droits</h2>
<p>Vous avez le droit d'accéder à vos informations personnelles, de les modifier ou de les supprimer à tout moment. Vous pouvez le faire en vous connectant à votre compte ou en nous contactant directement.</p>
`;

const autoEntAr = `
<h2>شروط التسجيل في المقاول الذاتي</h2>
<p>قبل التسجيل و طلب بطاقة المقاول الذاتي عليك أولا بمعرفة شروط الحصول على البطاقة و الالتزامات التي تترتب عند استلامها و بداية النشاط.</p>
<ul>
  <li><b>السن القانوني:</b> بلوغ السن القانونية للعمل</li>
  <li><b>الجنسية الجزائرية:</b> أن يكون من جنسـية جزائرية ومقيمــا بالجزائر أو أجنبـيا مقيما وفقا للتشريع والتنظيم المعمول بهما</li>
  <li><b>النشاط:</b> أن يمارس نشاطا مدرجا ضمن قائمة النشاطات المؤهلة للاستفادة</li>
</ul>
<h2>الشروط الخاصة</h2>
<ul>
  <li>لا يحق للوظيف العمومي ممارسة نشاط مربح أخر (أستاذ , اداري , ممرض...)</li>
  <li>مراجعة القانون الذاخلي للشركات الاقتصادية (خاصة أو عامة) اذا كان يسمح بممارسة نشاط أخر</li>
  <li><b>بطاقة حرفي:</b> لا يحق لصاحب بطاقة الحرفي التسجيل في المقاول الذاتي.</li>
  <li>أن لا يكون لديك ديون متراكمة في الضرائب و التأمين من نشاط أخر .</li>
  <li><b>المهن المقننة:</b> طبيب , محامي ...لا يمكنهم ممارسة نشاط في اطار المقاول الذاتي</li>
</ul>
`;

const autoEntEn = `
<h2>Conditions for Registering as an Auto-Entrepreneur</h2>
<p>Before registering and applying for the Auto-Entrepreneur Card, you must first know the conditions for obtaining the card and the obligations that arise upon receiving it and starting the activity.</p>
<ul>
  <li><b>Legal Age:</b> Reaching the legal age for work</li>
  <li><b>Algerian Nationality:</b> Must be of Algerian nationality and resident in Algeria, or a resident foreigner in accordance with the applicable legislation and regulations</li>
  <li><b>Activity:</b> Must practice an activity listed among the activities eligible to benefit</li>
</ul>
<h2>Special Conditions</h2>
<ul>
  <li>Public servants are not entitled to practice another lucrative activity (teacher, administrator, nurse...)</li>
  <li>Review the internal regulations of economic companies (private or public) if they allow practicing another activity</li>
  <li><b>Artisan Card:</b> The holder of an artisan card is not entitled to register as an auto-entrepreneur.</li>
  <li>You must not have accumulated debts in taxes and insurance from another activity.</li>
  <li><b>Regulated Professions:</b> Doctors, lawyers, etc. cannot practice an activity within the framework of an auto-entrepreneur.</li>
</ul>
`;

const autoEntFr = `
<h2>Conditions d'Inscription en tant qu'Auto-Entrepreneur</h2>
<p>Avant de vous inscrire et de demander la Carte d'Auto-Entrepreneur, vous devez d'abord connaître les conditions d'obtention de la carte et les obligations qui découlent de sa réception et du début de l'activité.</p>
<ul>
  <li><b>Âge Légal :</b> Atteindre l'âge légal pour travailler</li>
  <li><b>Nationalité Algérienne :</b> Doit être de nationalité algérienne et résident en Algérie, ou étranger résident conformément à la législation et aux règlements en vigueur</li>
  <li><b>Activité :</b> Doit exercer une activité figurant parmi la liste des activités éligibles</li>
</ul>
<h2>Conditions Spéciales</h2>
<ul>
  <li>Les fonctionnaires publics ne sont pas autorisés à exercer une autre activité lucrative (enseignant, administrateur, infirmier...)</li>
  <li>Vérifiez le règlement intérieur des entreprises économiques (privées ou publiques) si elles permettent d'exercer une autre activité</li>
  <li><b>Carte d'Artisan :</b> Le titulaire d'une carte d'artisan n'est pas autorisé à s'inscrire en tant qu'auto-entrepreneur.</li>
  <li>Vous ne devez pas avoir de dettes accumulées en matière d'impôts et d'assurances au titre d'une autre activité.</li>
  <li><b>Professions Réglementées :</b> Médecins, avocats... ne peuvent exercer une activité dans le cadre de l'auto-entrepreneur.</li>
</ul>
`;

function createPagePuckData(arHtml, enHtml, frHtml, heroAr, heroEn, heroFr) {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          titleAr: heroAr,
          titleEn: heroEn,
          titleFr: heroFr,
          descAr: "اقرأ وتعرف على كافة التفاصيل والشروط المتعلقة بخدماتنا لتكون على دراية تامة بحقوقك وواجباتك.",
          descEn: "Read and learn all the details and conditions related to our services to be fully aware of your rights and duties.",
          descFr: "Lisez et découvrez tous les détails et conditions liés à nos services pour être pleinement conscient de vos droits et devoirs.",
          bgImage: "",
          id: "Hero-1"
        }
      },
      {
        type: "RichText",
        props: {
          contentAr: arHtml,
          contentEn: enHtml,
          contentFr: frHtml,
          id: "RichText-1"
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
    content: createPagePuckData(yalidineTermsAr, yalidineTermsEn, yalidineTermsFr, 'الشروط والأحكام الخاصة بالنقل', 'Transport Terms and Conditions', 'Conditions Générales de Transport'),
    isPublished: true
  },
  {
    slug: 'return-policy',
    titleAr: 'سياسة الاسترجاع',
    titleEn: 'Return Policy',
    titleFr: 'Politique de retour',
    content: createPagePuckData(returnPolicyAr, returnPolicyEn, returnPolicyFr, 'سياسة إستبدال وإرجاع السلع', 'Return and Exchange Policy', 'Politique de Retour et d\'Échange'),
    isPublished: true
  },
  {
    slug: 'privacy-policy',
    titleAr: 'سياسة الخصوصية',
    titleEn: 'Privacy Policy',
    titleFr: 'Politique de confidentialité',
    content: createPagePuckData(privacyPolicyAr, privacyPolicyEn, privacyPolicyFr, 'سياسة الخصوصية وحماية البيانات', 'Privacy and Data Protection Policy', 'Politique de Confidentialité et Protection des Données'),
    isPublished: true
  },
  {
    slug: 'auto-entrepreneur',
    titleAr: 'المقاول الذاتي',
    titleEn: 'Auto Entrepreneur',
    titleFr: 'Auto-entrepreneur',
    content: createPagePuckData(autoEntAr, autoEntEn, autoEntFr, 'منصة المقاول الذاتي', 'Auto Entrepreneur Platform', 'Plateforme Auto-Entrepreneur'),
    isPublished: true
  }
];

async function main() {
  for (const p of pages) {
    await prisma.customPage.upsert({
      where: { slug: p.slug },
      update: {
        titleAr: p.titleAr, titleEn: p.titleEn, titleFr: p.titleFr, content: p.content
      },
      create: p
    });
    console.log("Updated page: " + p.slug);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
