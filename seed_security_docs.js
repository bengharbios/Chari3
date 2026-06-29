const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const docs = [
  {
    slug: 'advanced-session-management',
    category: 'security',
    isPublished: true,
    sortOrder: 1,
    title: 'نظام الجلسات المتقدم (Session Management)',
    titleEn: 'Advanced Session Management',
    content: `
# إدارة الجلسات المتقدمة

يحتوي النظام الآن على إدارة متقدمة للجلسات توفر أقصى درجات الأمان للمستخدمين:
- **تسجيل الأجهزة:** يتم تسجيل الجهاز، المتصفح، وعنوان IP لكل جلسة نشطة.
- **تحديد الموقع:** معرفة المدينة والدولة التي تم تسجيل الدخول منها تلقائياً.
- **إدارة الأجهزة:** يمكن للمستخدمين إنهاء الجلسات عن بعد من أي جهاز غير مألوف عبر لوحة التحكم.
- **مدة الجلسة:** تنتهي صلاحية الجلسات تلقائياً في حال الخمول.
`,
    contentEn: `
# Advanced Session Management

The platform now features an advanced session management system providing maximum security:
- **Device Fingerprinting:** Devices, browsers, and IP addresses are recorded for each active session.
- **Geo-Location:** The city and country of the login are automatically identified.
- **Remote Logout:** Users can terminate sessions remotely for any unrecognized devices via their dashboard.
- **Session Expiry:** Sessions automatically expire after periods of inactivity.
`,
    translations: {
      fr: {
        title: "Gestion avancée des sessions",
        content: `
# Gestion avancée des sessions

La plateforme intègre désormais un système avancé de gestion des sessions :
- **Empreinte de l'appareil :** Les appareils, les navigateurs et les adresses IP sont enregistrés.
- **Géolocalisation :** La ville et le pays de connexion sont identifiés automatiquement.
- **Déconnexion à distance :** Les utilisateurs peuvent terminer des sessions à distance.
- **Expiration de session :** Les sessions expirent automatiquement après une période d'inactivité.
`
      }
    }
  },
  {
    slug: 'authentication-logs',
    category: 'security',
    isPublished: true,
    sortOrder: 2,
    title: 'سجلات المصادقة الدقيقة (Auth Logs)',
    titleEn: 'Detailed Authentication Logs',
    content: `
# سجلات المصادقة (Auth Logs)

للحفاظ على الشفافية والأمان، يوفر النظام سجلات مصادقة شاملة:
- **تتبع المحاولات:** يتم تسجيل كافة محاولات الدخول (الناجحة والفاشلة).
- **تفاصيل الجهاز:** تحليل دقيق لمعلومات الـ User-Agent لمعرفة نوع الجهاز (موبايل، ديسكتوب، تابلت) والمتصفح المستخدم (Chrome, Firefox, Safari).
- **التكامل مع Cloudflare:** يتم التقاط الـ IP الحقيقي للمستخدم حتى خلف شبكات التوصيل (CDN).
- **تنبيهات الأمان:** يمكن للمسؤولين مراقبة السجلات لاكتشاف أي نشاط مشبوه.
`,
    contentEn: `
# Authentication Logs

To maintain transparency and security, the system provides comprehensive auth logs:
- **Attempt Tracking:** All login attempts (successful and failed) are logged.
- **Device Details:** Accurate parsing of User-Agent to determine device type (Mobile, Desktop, Tablet) and browser.
- **Cloudflare Integration:** Real IPs are captured even behind Content Delivery Networks (CDN).
- **Security Monitoring:** Admins can monitor logs to detect suspicious activities.
`,
    translations: {
      fr: {
        title: "Journaux d'authentification détaillés",
        content: `
# Journaux d'authentification

Pour maintenir la transparence et la sécurité, le système fournit des journaux complets :
- **Suivi des tentatives :** Toutes les tentatives de connexion sont enregistrées.
- **Détails de l'appareil :** Analyse précise du User-Agent (Mobile, Bureau, Tablette) et du navigateur.
- **Intégration Cloudflare :** Les véritables adresses IP sont capturées.
- **Surveillance de sécurité :** Les administrateurs peuvent détecter toute activité suspecte.
`
      }
    }
  },
  {
    slug: 'bot-protection-captcha',
    category: 'security',
    isPublished: true,
    sortOrder: 3,
    title: 'الحماية من البوتات والكابتشا (Captcha & Bot Protection)',
    titleEn: 'Captcha & Bot Protection',
    content: `
# الحماية من الاختراقات والبوتات

تم تزويد المنصة بأحدث أنظمة الحماية الذكية:
- **Cloudflare Turnstile:** بديل ذكي لـ Google reCAPTCHA يعمل في الخلفية للتحقق من أن الزائر هو إنسان حقيقي دون إزعاج المستخدم باختبارات الصور المعقدة.
- **نظام Rate Limiting:** تحديد عدد محاولات إرسال الرمز المؤقت (OTP) للوقاية من هجمات التخمين المفرطة.
- **تشفير كلمات المرور:** يتم استخدام تقنية bcrypt لتشفير كافة بيانات الدخول للمستخدمين.
`,
    contentEn: `
# Bot Protection & Captcha

The platform is equipped with the latest smart protection systems:
- **Cloudflare Turnstile:** A smart alternative to reCAPTCHA that works in the background to verify human traffic without annoying image puzzles.
- **Rate Limiting:** Restricts the number of OTP requests to prevent brute-force attacks.
- **Password Encryption:** All passwords are mathematically hashed using bcrypt.
`,
    translations: {
      fr: {
        title: "Protection contre les bots et Captcha",
        content: `
# Protection contre les bots

La plateforme est équipée des derniers systèmes de protection intelligents :
- **Cloudflare Turnstile :** Une alternative intelligente à reCAPTCHA.
- **Limitation de débit (Rate Limiting) :** Restreint le nombre de demandes OTP.
- **Cryptage des mots de passe :** Tous les mots de passe sont hachés avec bcrypt.
`
      }
    }
  }
];

async function main() {
  console.log('Seeding security docs...');
  for (const doc of docs) {
    await prisma.docArticle.upsert({
      where: { slug: doc.slug },
      update: {
        title: doc.title,
        titleEn: doc.titleEn,
        content: doc.content,
        contentEn: doc.contentEn,
        translations: doc.translations,
        category: doc.category,
        sortOrder: doc.sortOrder,
        isPublished: doc.isPublished
      },
      create: {
        slug: doc.slug,
        title: doc.title,
        titleEn: doc.titleEn,
        content: doc.content,
        contentEn: doc.contentEn,
        translations: doc.translations,
        category: doc.category,
        sortOrder: doc.sortOrder,
        isPublished: doc.isPublished
      }
    });
    console.log(`Upserted doc: ${doc.slug}`);
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
