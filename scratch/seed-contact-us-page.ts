import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const contactAr = `
<h2>نبقى على تواصل دائم معك!</h2>
<p>في منصة <b>شاري داي (ChariDay)</b>، نؤمن بأن التواصل الفعال هو أساس النجاح والثقة. سواء كنت مشترياً تبحث عن استفسار حول طلبك، أو بائعاً يواجه تحدياً تقنياً، أو حتى مستثمراً يطمح لعقد شراكة استراتيجية، فإن أبوابنا وقنواتنا مفتوحة لك دائماً.</p>

<h2>معلومات الاتصال المباشر</h2>
<p>يمكنك الوصول إلينا عبر القنوات التالية، وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن:</p>
<ul>
    <li><b>البريد الإلكتروني لدعم العملاء:</b> <a href="mailto:support@chariday.com" style="color: #1ABB9C; text-decoration: underline;">support@chariday.com</a> (نرد خلال 24 ساعة)</li>
    <li><b>البريد الإلكتروني للبائعين والشركاء:</b> <a href="mailto:partners@chariday.com" style="color: #1ABB9C; text-decoration: underline;">partners@chariday.com</a></li>
    <li><b>رقم الهاتف (الخط الساخن):</b> 0000 00 00 05 / 0000 00 00 07 (متاح أثناء أوقات العمل)</li>
</ul>

<h2>أوقات العمل الرسمية</h2>
<p>فريق خدمة العملاء متواجد لخدمتكم طوال أيام الأسبوع باستثناء أيام العطل الرسمية:</p>
<ul>
    <li><b>من الأحد إلى الخميس:</b> 09:00 صباحاً وحتى 05:00 مساءً.</li>
    <li><b>الجمعة والسبت:</b> مغلق (يمكنكم ترك رسالة وسنرد عليها صباح الأحد).</li>
</ul>

<h2>المقر الرئيسي للشركة</h2>
<p>يسعدنا دائماً استقبال مراسلاتكم الرسمية عبر مقرنا الرئيسي:</p>
<p><b>العنوان:</b> المركز التجاري والإداري، الجزائر العاصمة، الجزائر (الرمز البريدي: 16000).</p>

<h2>روابط مفيدة قبل التواصل</h2>
<p>للحصول على إجابة أسرع، نوصي بشدة بالاطلاع على الصفحات التالية التي قد تحتوي بالفعل على إجابة لسؤالك:</p>
<ul>
    <li><a href="/pages/faq" style="color: #1ABB9C; text-decoration: underline;">الأسئلة الشائعة (FAQ)</a> - إجابات فورية لأكثر من 90% من استفسارات العملاء.</li>
    <li><a href="/pages/shipping-policy" style="color: #1ABB9C; text-decoration: underline;">سياسة الشحن والتوصيل</a> - لمعرفة مدة شحن الطرود للولايات.</li>
</ul>
`;

const contactEn = `
<h2>We Stay in Touch With You!</h2>
<p>At <b>ChariDay</b>, we believe that effective communication is the foundation of success and trust. Whether you are a buyer looking for order info, a seller facing a technical challenge, or an investor aiming for a strategic partnership, our doors are always open.</p>

<h2>Direct Contact Information</h2>
<p>You can reach us through the following channels, and our team will get back to you as soon as possible:</p>
<ul>
    <li><b>Customer Support Email:</b> <a href="mailto:support@chariday.com" style="color: #1ABB9C; text-decoration: underline;">support@chariday.com</a> (Response within 24 hours)</li>
    <li><b>Sellers & Partners Email:</b> <a href="mailto:partners@chariday.com" style="color: #1ABB9C; text-decoration: underline;">partners@chariday.com</a></li>
    <li><b>Hotline Phone Number:</b> 05 00 00 00 00 / 07 00 00 00 00 (Available during working hours)</li>
</ul>

<h2>Official Working Hours</h2>
<p>Our customer service team is available to serve you throughout the week except on public holidays:</p>
<ul>
    <li><b>Sunday to Thursday:</b> 09:00 AM to 05:00 PM.</li>
    <li><b>Friday and Saturday:</b> Closed (Leave a message, we'll reply on Sunday).</li>
</ul>

<h2>Headquarters</h2>
<p><b>Address:</b> Commercial & Administrative Center, Algiers, Algeria (Zip Code: 16000).</p>

<h2>Useful Links Before Contacting</h2>
<ul>
    <li><a href="/pages/faq" style="color: #1ABB9C; text-decoration: underline;">Frequently Asked Questions (FAQ)</a></li>
    <li><a href="/pages/shipping-policy" style="color: #1ABB9C; text-decoration: underline;">Shipping & Delivery Policy</a></li>
</ul>
`;

const contactFr = `
<h2>Restons en Contact !</h2>
<p>Chez <b>ChariDay</b>, nous pensons qu'une communication efficace est la base du succès et de la confiance. Que vous soyez un acheteur ou un vendeur, nos portes vous sont toujours ouvertes.</p>

<h2>Coordonnées Directes</h2>
<p>Vous pouvez nous joindre via les canaux suivants :</p>
<ul>
    <li><b>E-mail du support client :</b> <a href="mailto:support@chariday.com" style="color: #1ABB9C; text-decoration: underline;">support@chariday.com</a> (Réponse sous 24h)</li>
    <li><b>E-mail des vendeurs et partenaires :</b> <a href="mailto:partners@chariday.com" style="color: #1ABB9C; text-decoration: underline;">partners@chariday.com</a></li>
    <li><b>Numéro de téléphone :</b> 05 00 00 00 00 / 07 00 00 00 00 (Disponible pendant les heures de travail)</li>
</ul>

<h2>Heures de Travail Officielles</h2>
<ul>
    <li><b>Du Dimanche au Jeudi :</b> 09:00 à 17:00.</li>
    <li><b>Vendredi et Samedi :</b> Fermé (Laissez un message, nous répondrons dimanche).</li>
</ul>

<h2>Siège Social</h2>
<p><b>Adresse :</b> Centre Commercial et Administratif, Alger, Algérie (Code postal : 16000).</p>

<h2>Liens Utiles</h2>
<ul>
    <li><a href="/pages/faq" style="color: #1ABB9C; text-decoration: underline;">Foire Aux Questions (FAQ)</a></li>
    <li><a href="/pages/shipping-policy" style="color: #1ABB9C; text-decoration: underline;">Politique d'Expédition</a></li>
</ul>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2000&auto=format&fit=crop",
          content: [
            { locale: "ar", title: "تواصل معنا", desc: "نحن هنا من أجلك. يسعدنا سماع استفساراتك، مقترحاتك، أو الإجابة على أي تساؤل يدور في ذهنك." },
            { locale: "en", title: "Contact Us", desc: "We are here for you. We'd love to hear your inquiries, suggestions, or answer any questions you might have." },
            { locale: "fr", title: "Contactez-nous", desc: "Nous sommes là pour vous. Nous serions ravis d'entendre vos demandes, suggestions ou de répondre à toutes vos questions." }
          ],
          id: "Hero-Contact"
        }
      },
      {
        type: "RichText",
        props: {
          content: [
            { locale: "ar", html: contactAr },
            { locale: "en", html: contactEn },
            { locale: "fr", html: contactFr }
          ],
          id: "RichText-Contact"
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const contactPage = {
  slug: 'contact-us',
  titleAr: 'تواصل معنا',
  titleEn: 'Contact Us',
  titleFr: 'Contactez-nous',
  titleJson: JSON.stringify({
    ar: 'تواصل معنا',
    en: 'Contact Us',
    fr: 'Contactez-nous'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: contactPage.slug },
    update: {
      titleAr: contactPage.titleAr,
      titleEn: contactPage.titleEn,
      titleFr: contactPage.titleFr,
      titleJson: contactPage.titleJson,
      content: contactPage.content
    },
    create: contactPage
  });
  console.log("Updated Contact Us page.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
