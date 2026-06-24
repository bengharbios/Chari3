const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting unified multilingual documentation seeding (Arabic, English, French)...');

  const docs = [
    {
      slug: 'google-maps-setup',
      category: 'settings',
      title: 'إعداد خرائط جوجل وتحديد العناوين',
      titleEn: 'Setting up Google Maps and Address Pinning',
      content: `
# 🗺️ الدليل الشامل لخرائط جوجل ونظام تحديد المواقع

تم بناء نظام خرائط احترافي داخل منصة **ChariDay** ليتيح للمشترين تحديد مواقع التوصيل بدقة متناهية، سواء في صفحة الدفع (Checkout) أو إدارة العناوين.

## 🌟 الميزات الحديثة:
1. **البحث المباشر (Geocoding Search):** 
   يمكن للمشتري كتابة اسم المنطقة والضغط على Enter لينتقل الدبوس فوراً للمكان المحدد بدقة.
2. **التنقيح الذكي للعناوين (Plus Codes Filtering):** 
   الخريطة مبرمجة برمجياً لتتجاهل الرموز الغريبة التي تولدها جوجل (مثل M7G3+83W) وتبحث عن أقرب عنوان شارع حقيقي واسم مؤسسة مقروء لضمان وضوح فاتورة التوصيل.
3. **تحديد موقعي (GPS Auto-Locate):** 
   زر يحدد موقع المستخدم تلقائياً باستخدام دقة عالية (\`enableHighAccuracy\`).

---

## ⚙️ متطلبات التفعيل (خطوات أساسية للإدارة)

لكي تعمل الخريطة بدون أخطاء، يجب عليك كمدير منصة اتباع الخطوات التالية في **Google Cloud Console**:

### 1. ربط الفوترة (Billing Account)
جوجل **تمنع** عمل خدمات العناوين بدون وجود بطاقة بنكية مسجلة، حتى لو كان الاستخدام مجانياً.
* **الأسعار:** جوجل تمنحك **200 دولار مجانية كل شهر**. تكلفة خدمة العناوين هي 5 دولارات لكل 1000 طلب، مما يعني أن لديك **40,000 عملية بحث ونقر مجانية شهرياً**. لن تدفع سنتاً واحداً قبل تجاوز هذا الرقم الضخم.

### 2. تفعيل واجهات برمجة التطبيقات (APIs)
يجب التأكد من البحث عن الخدمات التالية في Google Cloud والضغط على زر **Enable**:
* **Maps JavaScript API:** لعرض الخريطة التفاعلية في الموقع.
* **Geocoding API:** لتحويل الإحداثيات عند النقر على الخريطة إلى اسم شارع حقيقي، ولتشغيل شريط البحث.

### 3. إعداد قيود الأمان للمفتاح (API Restrictions)
في قسم (Credentials)، عند تعديل إعدادات مفتاحك (API Key)، تأكد أنك تسمح له باستخدام الخدمات المطلوبة. إذا اخترت (Restrict key)، ضع علامة ✅ على \`Geocoding API\` و \`Maps JavaScript API\`.
      `,
      contentEn: `
# 🗺️ Comprehensive Guide to Google Maps Integration

**ChariDay** includes a professional mapping system allowing buyers to pinpoint precise delivery locations during checkout and address management.

## 🌟 Modern Features:
1. **Direct Geocoding Search:** Users can type a specific place and press Enter to instantly pin the location.
2. **Smart Address Parsing (Plus Codes Filtering):** The system automatically ignores unreadable Google Plus Codes (e.g., M7G3+83W) and fetches the nearest human-readable street address or Point of Interest (POI).
3. **GPS Auto-Locate:** A high-accuracy location button (pinpoint accuracy is achieved on mobile devices with GPS hardware, whereas desktops rely on IP addresses).

---

## ⚙️ Setup Requirements (For Admins)

To prevent gray error screens, you MUST configure the following in **Google Cloud Console**:

### 1. Enable Billing Account
Google Maps APIs for Geocoding **will not work** without a linked credit card, even for the free tier.
* **Pricing:** Google provides **$200 FREE credit every month**. At $5 per 1,000 requests, this covers **40,000 free map searches/clicks per month**.

### 2. Enable Required APIs
Ensure you search for and click **Enable** on the following APIs:
* **Maps JavaScript API:** Renders the visual interactive map.
* **Geocoding API:** Converts map clicks into text addresses and powers the map's search bar.

### 3. Configure API Key Restrictions
In the Credentials section, if your API Key uses "API Restrictions", you MUST check the boxes for \`Geocoding API\` and \`Maps JavaScript API\` to prevent 'ApiTargetBlockedMapError' crashes.
      `,
      translations: {
        fr: {
          title: "Configuration de Google Maps et de la Géolocalisation",
          content: `
# 🗺️ Guide complet sur l'intégration de Google Maps

**ChariDay** comprend un système de cartographie professionnel permettant aux acheteurs de cibler avec précision leurs lieux de livraison lors du paiement et de la gestion des adresses.

## 🌟 Fonctionnalités modernes :
1. **Recherche de géocodage directe :** Les utilisateurs peuvent saisir un lieu spécifique et appuyer sur Entrée pour localiser instantanément l'épingle.
2. **Analyse intelligente des adresses :** Le système ignore automatiquement les codes de localisation Google Plus illisibles (ex: M7G3+83W) et récupère l'adresse postale réelle la plus proche ou le point d'intérêt.
3. **Auto-localisation GPS :** Un bouton de localisation haute précision (la précision dépend du GPS de l'appareil mobile, les ordinateurs de bureau se basant sur l'adresse IP).

---

## ⚙️ Configuration requise (Pour les administrateurs)

Pour éviter les écrans d'erreur gris, vous devez configurer les éléments suivants dans la console **Google Cloud** :

### 1. Activer le compte de facturation
Les API Google Maps pour le géocodage **ne fonctionneront pas** sans carte de crédit associée, même pour le niveau gratuit.
* **Tarification :** Google fournit **200 $ de crédit GRATUIT chaque mois**. À 5 $ pour 1 000 requêtes, cela couvre **40 000 recherches/clics de cartes gratuits par mois**.

### 2. Activer les API requises
Recherchez et cliquez sur **Activer** pour les API suivantes :
* **Maps JavaScript API :** Affiche la carte interactive visuelle.
* **Geocoding API :** Convertit les clics sur la carte en adresses textuelles et alimente la barre de recherche.

### 3. Configurer les restrictions de clé API
Dans la section Credentials, si votre clé API utilise des restrictions, vous devez cocher les cases pour \`Geocoding API\` et \`Maps JavaScript API\` afin d'éviter les pannes.
          `
        }
      },
      sortOrder: 1,
      isPublished: true
    },
    {
      slug: 'otp-whatsapp-setup',
      category: 'settings',
      title: 'دليل إعداد التوثيق (OTP) وبوابات SMS و WhatsApp',
      titleEn: 'OTP Authentication, SMS & WhatsApp Gateway Guide',
      content: `
# 🔐 الدليل الشامل لنظام التوثيق المتعدد (OTP)

منصة **ChariDay** تعتمد على نظام تسجيل دخول ذكي (Passwordless/OTP) يقلل التكاليف ويزيد الأمان من خلال التسلسل التالي:
**الإيميل ⬅️ كود الإيميل ⬅️ الهاتف ⬅️ كود الهاتف ⬅️ كلمة المرور**

---

## ⚙️ بوابات الاتصال المخصصة (Custom Gateways)

بدلاً من إجبارك على الدفع لشركات باهظة الثمن مثل Twilio، قمنا ببناء نظام **Webhooks** مرن يسمح لك بربط المنصة بأي سيرفر أو تطبيق مجاني:

### 1. بوابة الواتساب المجانية (WhatsApp via n8n)
يمكنك ربط المنصة برقم هاتفك الشخصي لإرسال رسائل WhatsApp مجاناً 100% باستخدام سيرفر **n8n**.
* **الخطوات:** 
  1. قم بتثبيت أتمتة الواتساب عبر n8n أو Evolution API.
  2. ستحصل على رابط Webhook.
  3. ضع الرابط في حقل **(API URL)** في إعدادات الواتساب بلوحة الإدارة.
  4. استخدم المتغير \`{otp}\` في حقل **صيغة الرسالة (Template)**.

### 2. بوابة SMS المجانية (عبر هاتف أندرويد)
يمكنك استخدام تطبيق أندرويد مخصص يحول هاتفك إلى سيرفر يرسل رسائل SMS من باقة خطك غير المحدودة.
* ضع رابط السيرفر المحلي لهاتفك في حقل **Custom SMS Gateway URL**.

### 3. بوابة تليجرام (Telegram Bot)
الطريقة الأكثر أماناً ومجانية تماماً. قم بإنشاء بوت عبر \`BotFather\` في تليجرام، وضع الـ Token واسم البوت في الإعدادات. سيقوم النظام بتوليد روابط ذكية لتوثيق المستخدمين عبر تليجرام بنقرة واحدة.
      `,
      contentEn: `
# 🔐 Comprehensive Guide to Multi-Step OTP Authentication

**ChariDay** utilizes a smart passwordless-hybrid login system that minimizes SMS costs and maximizes security through the following flow:
**Email ⬅️ Email OTP ⬅️ Phone ⬅️ Phone OTP ⬅️ Password Setup**

---

## ⚙️ Custom Delivery Gateways

Instead of forcing expensive providers like Twilio, we've built a flexible **Webhook** system that lets you connect to ANY free API:

### 1. Free WhatsApp Gateway (via n8n)
Connect your personal/business WhatsApp number to send OTPs 100% free using an **n8n** server.
* **Steps:** 
  1. Deploy a WhatsApp automation using n8n.
  2. Obtain your Webhook URL.
  3. Paste it into the **API URL** field in the WhatsApp Settings of the Admin Dashboard.
  4. Use the \`{otp}\` variable in the **WhatsApp Template** field.

### 2. Free Custom SMS Gateway (Android App)
Turn your Android phone into an SMS server to send OTPs using your unlimited cellular plan.
* Paste your phone's local/public server URL into the **Custom SMS Gateway URL** field.

### 3. Telegram Bot Gateway
The safest and completely free method. Create a bot via \`BotFather\` on Telegram, paste the Token and Username. The system will generate deep links for 1-click OTP verification.
      `,
      translations: {
        fr: {
          title: "Guide de l'authentification OTP, SMS et WhatsApp",
          content: `
# 🔐 Guide complet sur l'authentification OTP multi-étapes

**ChariDay** utilise un système de connexion intelligent hybride sans mot de passe qui minimise les coûts de SMS et maximise la sécurité grâce au flux suivant :
**Email ⬅️ OTP Email ⬅️ Téléphone ⬅️ OTP Téléphone ⬅️ Définition du mot de passe**

---

## ⚙️ Passerelles de livraison personnalisées

Au lieu d'imposer des fournisseurs coûteux comme Twilio, nous avons conçu un système de **Webhook** flexible qui vous permet de vous connecter à n'importe quelle API gratuite :

### 1. Passerelle WhatsApp gratuite (via n8n)
Connectez votre numéro WhatsApp personnel/professionnel pour envoyer des OTP 100% gratuitement à l'aide d'un serveur **n8n**.
* **Étapes :** 
  1. Déployez une automatisation WhatsApp via n8n.
  2. Obtenez votre URL Webhook.
  3. Collez-la dans le champ **URL API** des paramètres WhatsApp du tableau de bord administrateur.
  4. Utilisez la variable \`{otp}\` dans le champ du modèle de message.

### 2. Passerelle SMS personnalisée gratuite (Application Android)
Transformez votre téléphone Android en serveur SMS pour envoyer des OTP en utilisant votre forfait mobile illimité.
* Collez l'URL locale ou publique de votre serveur téléphonique dans le champ **Custom SMS Gateway URL**.

### 3. Passerelle de Bot Telegram
La méthode la plus sûre et totalement gratuite. Créez un bot via \`BotFather\` sur Telegram, collez le Token et le nom d'utilisateur. Le système générera des liens profonds pour une vérification OTP en 1 clic.
          `
        }
      },
      sortOrder: 2,
      isPublished: true
    },
    {
      slug: 'deliver-to-feature',
      category: 'general',
      title: 'شرح ميزة "التوصيل إلى" (Deliver To)',
      titleEn: 'Deliver To Feature Guide',
      content: `
# ميزة "التوصيل إلى" (Deliver To / Geolocation) 📍

قمنا بإضافة ميزة جديدة رائعة في الشريط العلوي (Header) للمنصة تشبه ما هو موجود في مواقع التجارة العالمية (مثل Amazon و Noon).

## 🚀 كيف تعمل الميزة؟
- تظهر أيقونة موقع بجوار الشعار في أعلى المتجر.
- يمكن للزائر النقر عليها لتغيير دولة أو مدينة التوصيل.
- سيتم حفظ اختيار الزائر بفضل تقنية \`Zustand Persist\` (عبر الـ LocalStorage) لضمان بقائه مسجلاً في كل زيارة قادمة.

## ⚙️ التحكم من لوحة الإدارة
- يمكن لمدير النظام (Super Admin) إخفاء هذه الميزة أو إظهارها متى شاء من خلال **الإعدادات > مفاتيح الميزات (Kill Switches)** عبر خيار "تفعيل ميزة تحديد الموقع في الهيدر (Deliver To)".
      `,
      contentEn: `
# Deliver To Feature Guide (Geolocation) 📍

We have added a wonderful new feature to the header of the storefront, similar to global marketplace platforms (like Amazon and Noon).

## 🚀 How it works:
- A location icon is displayed next to the logo in the storefront header.
- The visitor can click it to change the delivery country or state.
- The visitor's preference is saved using \`Zustand Persist\` (via LocalStorage) so that it remains active on future visits.

## ⚙️ Admin Control:
- The Super Admin can show or hide this feature at any time from **Settings > Kill Switches** using the "Enable Location Picker in Header (Deliver To)" option.
      `,
      translations: {
        fr: {
          title: "Guide de la fonctionnalité de livraison (Livrer à)",
          content: `
# Guide de la fonctionnalité "Livrer à" (Géolocalisation) 📍

Nous avons ajouté une nouvelle fonctionnalité dans l'en-tête (Header) de la boutique, semblable à ce qui se trouve sur les plateformes de commerce mondiales (comme Amazon et Noon).

## 🚀 Comment ça marche :
- Une icône de localisation s'affiche à côté du logo dans l'en-tête de la boutique.
- Le visiteur peut cliquer dessus pour modifier le pays ou l'état de livraison.
- Le choix du visiteur est enregistré grâce à la technologie \`Zustand Persist\` (via LocalStorage) pour garantir sa persistance lors des visites ultérieures.

## ⚙️ Contrôle administrateur :
- L'administrateur système peut afficher ou masquer cette fonctionnalité à tout moment à partir de **Paramètres > Interrupteurs (Kill Switches)** via l'option "Activer le sélecteur de localisation dans l'en-tête (Deliver To)".
          `
        }
      },
      sortOrder: 3,
      isPublished: true
    },
    {
      slug: 'developer-plugin-sdk',
      category: 'developers',
      title: 'دليل المطورين: بناء الإضافات (Plugin SDK)',
      titleEn: 'Developer Guide: Building Plugins (Plugin SDK)',
      content: `
# بناء إضافات جديدة لمنصة ChariDay (Plugin Architecture)

يعتمد نظام ChariDay على **معمارية الإضافات (Plugin Architecture)** مما يتيح لك كمطور إضافة بوابات دفع، أو شركات شحن، أو خدمات رسائل (SMS) جديدة دون الحاجة لتعديل الكود الأساسي للمنصة (Core).

## 1. الهيكل الأساسي لأي إضافة (Base Plugin)

أي إضافة يجب أن ترث من الواجهة \`BasePlugin\`:

\`\`\`typescript
export interface BasePlugin {
  id: string;          // المُعرّف الفريد للإضافة (مثلاً: 'chargily', 'stripe')
  name: string;        // اسم الإضافة
  version: string;     // رقم الإصدار
  type: PluginType;    // نوع الإضافة ('PAYMENT' | 'SHIPPING' | 'SMS' | 'MARKETING')
  initialize(globalConfig: any): Promise<void>;
}
\`\`\`
      `,
      contentEn: `
# Building New Plugins for ChariDay (Plugin Architecture)

ChariDay uses a **Plugin Architecture** allowing you to add new payment gateways, shipping providers, or SMS services without modifying the core platform code.

## 1. Base Plugin Structure

Every plugin must implement the \`BasePlugin\` interface:

\`\`\`typescript
export interface BasePlugin {
  id: string;          // Unique identifier (e.g., 'chargily', 'stripe')
  name: string;        // Display name
  version: string;     // Version string
  type: PluginType;    // 'PAYMENT' | 'SHIPPING' | 'SMS' | 'MARKETING'
  initialize(globalConfig: any): Promise<void>;
}
\`\`\`
      `,
      translations: {
        fr: {
          title: "Guide du développeur : Construction de plugins (Plugin SDK)",
          content: `
# Développement de nouvelles extensions pour ChariDay (Architecture Plugin)

ChariDay utilise une **architecture de plugins (Plugin Architecture)** qui vous permet d'ajouter de nouvelles passerelles de paiement, transporteurs ou services SMS sans modifier le code de base.

## 1. Structure de base d'un plugin

Chaque plugin doit implémenter l'interface \`BasePlugin\` :

\`\`\`typescript
export interface BasePlugin {
  id: string;          // Identifiant unique (ex: 'chargily', 'stripe')
  name: string;        // Nom d'affichage
  version: string;     // Version
  type: PluginType;    // 'PAYMENT' | 'SHIPPING' | 'SMS' | 'MARKETING'
  initialize(globalConfig: any): Promise<void>;
}
\`\`\`
          `
        }
      },
      sortOrder: 4,
      isPublished: true
    },
    {
      slug: 'security-architecture',
      category: 'developers',
      title: 'بنية الحماية ونظام Better Auth',
      titleEn: 'Security Architecture & Better Auth',
      content: `
# بنية الحماية ونظام Better Auth

تم ترحيل ChariDay إلى نظام حماية موحد ومتوافق مع خوادم الـ Edge باستخدام Better Auth.

## 1. حماية الـ Middleware
تستخدم المنصة Next.js Edge Middleware لحظر أو السماح بالدخول للمسارات المحمية (مثل \`/seller\`, \`/buyer\`, \`/admin-secure-internal\`) بناءً على التحقق من ملفات تعريف الارتباط الآمنة (Cookies) بشكل فوري.

## 2. توافقية كلمات المرور القديمة
يدعم النظام تشفير \`bcryptjs\` للتحقق وتوليد كلمات المرور للمستخدمين لضمان عدم تأثر أي حساب قديم بالتحديثات الجديدة.
      `,
      contentEn: `
# Security Architecture & Better Auth

ChariDay has migrated to a unified, edge-compatible security system using Better Auth.

## 1. Edge Middleware Protection
The platform utilizes Next.js Edge Middleware to intercept requests to protected routes (\`/seller\`, \`/buyer\`, \`/admin-secure-internal\`). It validates HTTP-Only cookies before returning content.

## 2. Password Compatibility
The system explicitly uses \`bcryptjs\` for hashing to maintain absolute compatibility with legacy accounts.
      `,
      translations: {
        fr: {
          title: "Architecture de Sécurité et Better Auth",
          content: `
# Architecture de Sécurité & Better Auth

ChariDay a migré vers un système de sécurité unifié et compatible avec l'Edge grâce à Better Auth.

## 1. Protection par Middleware Edge
La plateforme utilise le middleware Next.js Edge pour intercepter les requêtes vers les routes protégées (\`/seller\`, \`/buyer\`, \`/admin-secure-internal\`). Il valide le cookie HTTP-Only instantanément.

## 2. Compatibilité des mots de passe
Le système utilise explicitement \`bcryptjs\` pour le hachage afin de maintenir une compatibilité parfaite avec les anciens comptes.
          `
        }
      },
      sortOrder: 5,
      isPublished: true
    },
    {
      slug: 'seller-kyc-guide',
      category: 'sellers',
      title: 'دليل توثيق المتاجر (KYC/KYB)',
      titleEn: 'Seller Verification Guide (KYC/KYB)',
      content: `
# دليل توثيق المتاجر (KYC/KYB)

يجب على جميع المتاجر توثيق هوياتهم قبل تفعيل حساباتهم لضمان أمان المنصة.

## 1. التحديثات في نظام التوثيق:
- **دعم كامل للغة العربية والفرنسية والإنجليزية والاتجاه (RTL).**
- **خياران للرفع:** يمكنك إما استخدام الكاميرا للالتقاط الذكي، أو رفع ملفات صور الهوية مباشرة من جهازك.
- **تغيير اللغة:** يمكن للتاجر تغيير لغة الواجهة في أي وقت أثناء خطوات التوثيق.
      `,
      contentEn: `
# Seller Verification Guide (KYC/KYB)

All stores must verify their identities before their accounts are activated to ensure platform safety.

## 1. Features & Updates:
- **Full Multilingual Support (AR, EN, FR) & RTL layout.**
- **Dual Upload Methods:** Capture via camera or upload images directly from your device.
- **Language Switching:** Switch interface languages seamlessly during the onboarding process.
      `,
      translations: {
        fr: {
          title: "Guide de vérification des vendeurs (KYC/KYB)",
          content: `
# Guide de vérification des vendeurs (KYC/KYB)

Toutes les boutiques doivent vérifier leur identité avant l'activation de leur compte pour garantir la sécurité.

## 1. Fonctionnalités et mises à jour :
- **Support multilingue complet (AR, EN, FR) et mise en page RTL.**
- **Double méthode de téléchargement :** Capturez via la caméra ou téléchargez des images directement depuis votre appareil.
- **Changement de langue :** Changez de langue à tout moment pendant le processus de vérification.
          `
        }
      },
      sortOrder: 6,
      isPublished: true
    }
  ];

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
        isPublished: doc.isPublished,
      },
      create: doc,
    });
    console.log(`Upserted doc article: ${doc.slug}`);
  }

  console.log('All multilingual documentation articles successfully seeded!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
