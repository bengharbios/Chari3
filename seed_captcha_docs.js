const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const contentAr = `
# الدليل الشامل لإعداد حماية الكابتشا (Cloudflare Turnstile)

نظام **شاري داي** يعتمد على أحدث تقنيات الحماية لمنع الروبوتات والحسابات الوهمية من التسجيل وإغراق منصتك بالرسائل المزعجة (Spam). نستخدم تقنية **Cloudflare Turnstile** وهي البديل الأسرع والأكثر أماناً والأقل إزعاجاً لتقنية Google reCAPTCHA.

---

## 🌟 مميزات Cloudflare Turnstile
1. **لا تزعج الزوار**: لا تطلب من المستخدمين تحديد صور مملة (مثل إشارات المرور أو ممرات المشاة). تتحقق من الزائر في الخلفية بسلاسة.
2. **سرعة الاستجابة**: سريعة جداً وتتوافق بشكل مثالي مع سرعة منصة شاري داي.
3. **خصوصية عالية**: على عكس جوجل، لا تقوم بجمع بيانات الزوار الشخصية أو تتبع سلوكهم لأغراض إعلانية.
4. **مجانية بالكامل**: خدمة مجانية تمنحك حماية لامحدودة.

---

## ⚙️ كيفية الحصول على المفاتيح السرية

لربط الكابتشا بموقعك، يجب عليك الحصول على المفاتيح (Keys) من موقع كلاودفلير باتباع الخطوات التالية:

1. قم بزيارة موقع كلاودفلير وإنشاء حساب مجاني أو تسجيل الدخول: [dash.cloudflare.com](https://dash.cloudflare.com)
2. من القائمة الجانبية (في الجهة اليسرى)، ابحث عن قسم **Turnstile** واضغط عليه.
3. اضغط على زر **إضافة موقع (Add Site)**.
4. في خانة اسم الموقع (Site Name)، اكتب اسماً مميزاً (مثلاً: ChariDay Registration).
5. في خانة النطاق (Domain)، قم بإضافة رابط موقعك (مثال: \`chariday.com\`).
6. في خيارات نوع الحماية (Widget Type)، يُفضل أن تختار **Managed** (يتحقق تلقائياً ويتدخل فقط إذا لزم الأمر).
7. اضغط على زر **إنشاء (Create)**.

---

## 🔗 ربط الكابتشا بلوحة تحكم شاري داي

بعد إنشاء الموقع في كلاودفلير، ستظهر لك صفحة تحتوي على مفتاحين مهمين. قم بنسخهما واتبع الخطوات:

1. من القائمة الجانبية في **لوحة تحكم شاري داي** (الإدمن)، اذهب إلى: **الإعدادات > إعدادات المصادقة (OTP Settings)**.
2. قم بتفعيل زر **"تمكين الكابتشا (Enable Captcha)"**.
3. قم بنسخ **مفتاح الموقع (Site Key)** من كلاودفلير والصقه في الخانة المخصصة له في شاري داي.
4. قم بنسخ **المفتاح السري (Secret Key)** من كلاودفلير والصقه في الخانة المخصصة له في شاري داي (إن كانت ظاهرة ضمن الإعدادات).
5. اضغط على **"حفظ التغييرات"**.

بمجرد الحفظ، ستظهر الكابتشا في صفحة الدخول والتسجيل وستبدأ بحماية متجرك تلقائياً من الروبوتات!
`;

  const contentEn = `
# Comprehensive Guide to Captcha Setup (Cloudflare Turnstile)

**ChariDay** utilizes state-of-the-art protection technologies to prevent bots and fake accounts from registering and spamming your platform. We use **Cloudflare Turnstile**, which is a faster, more secure, and less intrusive alternative to Google reCAPTCHA.

---

## 🌟 Features of Cloudflare Turnstile
1. **User-Friendly**: It doesn't ask your users to solve annoying image puzzles (like traffic lights or crosswalks). It verifies visitors in the background smoothly.
2. **Lightning Fast**: Extremely fast and perfectly matches the high performance of the ChariDay platform.
3. **High Privacy**: Unlike Google, it doesn't collect personal visitor data or track behavior for advertising purposes.
4. **100% Free**: A free service that gives you unlimited protection.

---

## ⚙️ How to Get Your Secret Keys

To link the Captcha to your website, you must obtain the keys from the Cloudflare website by following these steps:

1. Visit Cloudflare and create a free account or log in: [dash.cloudflare.com](https://dash.cloudflare.com)
2. From the sidebar (on the left), look for the **Turnstile** section and click on it.
3. Click on the **Add Site** button.
4. In the Site Name field, type a distinct name (e.g., ChariDay Registration).
5. In the Domain field, add your website's URL (e.g., \`chariday.com\`).
6. For the Widget Type, it is recommended to select **Managed** (automatically verifies and intervenes only if necessary).
7. Click the **Create** button.

---

## 🔗 Linking Captcha to the ChariDay Dashboard

After creating the site in Cloudflare, a page will appear containing two important keys. Copy them and follow these steps:

1. From the sidebar in the **ChariDay Admin Dashboard**, go to: **Settings > Auth & OTP Settings**.
2. Enable the **Enable Captcha** toggle.
3. Copy the **Site Key** from Cloudflare and paste it into the designated field in ChariDay.
4. Copy the **Secret Key** from Cloudflare and paste it into its field (if displayed in your specific ChariDay version).
5. Click **Save Changes**.

Once saved, the Captcha will appear on the login and registration page and will automatically start protecting your store from bots!
`;

  const article = await prisma.docArticle.upsert({
    where: { slug: 'cloudflare-turnstile-captcha' },
    update: {
      title: 'إعداد حماية الكابتشا (Turnstile)',
      titleEn: 'Captcha Setup (Turnstile)',
      content: contentAr,
      contentEn: contentEn,
      category: 'general',
    },
    create: {
      slug: 'cloudflare-turnstile-captcha',
      title: 'إعداد حماية الكابتشا (Turnstile)',
      titleEn: 'Captcha Setup (Turnstile)',
      content: contentAr,
      contentEn: contentEn,
      category: 'general',
      isPublished: true,
      sortOrder: 2,
    }
  });

  console.log('Successfully seeded Captcha documentation:', article.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
