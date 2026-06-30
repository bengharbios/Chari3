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
  },
  {
    slug: 'otp-2fa-system',
    category: 'security',
    isPublished: true,
    sortOrder: 4,
    title: 'نظام التحقق المزدوج (OTP & 2FA)',
    titleEn: 'OTP & Two-Factor Authentication',
    content: `
# نظام التحقق المزدوج و الرمز المؤقت (OTP & 2FA)

لضمان أعلى درجات الأمان وحماية المستخدمين من الاختراق، قمنا بدمج نظام **التحقق عبر الرمز المؤقت (OTP)** مع نظام كلمة المرور:
- **تسجيل الدخول الذكي:** عند محاولة الدخول ببريد أو رقم هاتف لا يحتوي على كلمة مرور (مثل الحسابات الجديدة)، يرسل النظام رمز OTP تلقائياً لتأكيد الهوية.
- **الرمز المؤقت لمرة واحدة:** يتم إرسال رموز OTP بمدة صلاحية قصيرة لمنع استخدامها لاحقاً.
- **دمج مع كلمات المرور:** يتم إجبار المستخدمين الجدد على تعيين كلمة مرور بعد التحقق عبر OTP، مما يعزز الأمان ويقلل تكاليف رسائل الـ SMS.
- **استرداد الحساب:** يمكن استخدام الـ OTP كطريقة آمنة وبديلة في حال نسيان كلمة المرور الأساسية.
`,
    contentEn: `
# OTP & Two-Factor Authentication

To ensure maximum security and protect users from breaches, we have integrated an **OTP system** with the password system:
- **Smart Login:** When attempting to log in with an email or phone that has no password, the system automatically sends an OTP.
- **Time-Limited OTP:** OTP codes are sent with a short validity period.
- **Password Integration:** New users are forced to set a password after OTP verification, enhancing security and reducing SMS costs.
- **Account Recovery:** OTP can be used as a secure alternative in case the primary password is forgotten.
`,
    translations: {
      fr: {
        title: "Authentification à deux facteurs et OTP",
        content: `
# Authentification à deux facteurs et OTP

Pour garantir une sécurité maximale, nous avons intégré un **système OTP** avec le système de mot de passe :
- **Connexion Intelligente :** Un OTP est envoyé automatiquement si aucun mot de passe n'est défini.
- **OTP à durée limitée :** Les codes OTP ont une courte durée de validité.
- **Intégration des mots de passe :** Les nouveaux utilisateurs doivent définir un mot de passe après vérification de l'OTP.
- **Récupération de compte :** L'OTP sert d'alternative sécurisée en cas d'oubli du mot de passe.
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
