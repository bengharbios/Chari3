const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = [
    {
      title: 'إعداد خرائط جوجل وتحديد العناوين',
      titleEn: 'Setting up Google Maps and Address Pinning',
      slug: 'google-maps-setup',
      category: 'settings',
      content: `
# 🗺️ الدليل الشامل لخرائط جوجل ونظام تحديد المواقع

تم بناء نظام خرائط احترافي داخل منصة **ChariDay** ليتيح للمشترين تحديد مواقع التوصيل بدقة متناهية، سواء في صفحة الدفع (Checkout) أو إدارة العناوين.

## 🌟 الميزات الحديثة:
1. **البحث المباشر (Geocoding Search):** 
   يمكن للمشتري كتابة اسم المنطقة (مثل "زاجل دبي") والضغط على Enter لينتقل الدبوس فوراً للمكان المحدد بدقة.
2. **التنقيح الذكي للعناوين (Plus Codes Filtering):** 
   الخريطة مبرمجة برمجياً لتتجاهل الرموز الغريبة التي تولدها جوجل (مثل M7G3+83W) وتبحث عن أقرب عنوان شارع حقيقي واسم مؤسسة مقروء لضمان وضوح فاتورة التوصيل.
3. **تحديد موقعي (GPS Auto-Locate):** 
   زر يحدد موقع المستخدم تلقائياً باستخدام دقة عالية (\`enableHighAccuracy\`). (ملاحظة: الدقة تكون 100% في الهواتف لاحتوائها على شريحة GPS، بينما تعتمد على مزود الإنترنت في الكمبيوتر).

---

## ⚙️ متطلبات التفعيل (خطوات أساسية للإدارة)

لكي تعمل الخريطة بدون أخطاء أو شاشات رمادية، يجب عليك كمدير منصة اتباع الخطوات التالية في **Google Cloud Console**:

### 1. ربط الفوترة (Billing Account)
جوجل **تمنع** عمل خدمات العناوين بدون وجود بطاقة بنكية مسجلة، حتى لو كان الاستخدام مجانياً.
* **الأسعار:** جوجل تمنحك **200 دولار مجانية كل شهر**. تكلفة خدمة العناوين هي 5 دولارات لكل 1000 طلب، مما يعني أن لديك **40,000 عملية بحث ونقر مجانية شهرياً**. لن تدفع سنتاً واحداً قبل تجاوز هذا الرقم الضخم.

### 2. تفعيل واجهات برمجة التطبيقات (APIs)
يجب التأكد من البحث عن الخدمات التالية في Google Cloud والضغط على زر **Enable**:
* **Maps JavaScript API:** لعرض الخريطة التفاعلية في الموقع.
* **Geocoding API:** (مهم جداً) لتحويل الإحداثيات عند النقر على الخريطة إلى اسم شارع حقيقي، ولتشغيل شريط البحث.

### 3. إعداد قيود الأمان للمفتاح (API Restrictions)
في قسم (Credentials)، عند تعديل إعدادات مفتاحك (API Key)، تأكد أنك تسمح له باستخدام الخدمات المطلوبة. إذا اخترت (Restrict key)، ضع علامة ✅ على \`Geocoding API\` و \`Maps JavaScript API\`.

---

## 🚨 لماذا لا توجد ميزة القائمة المنسدلة للبحث (Autocomplete)؟
سياسة جوجل الجديدة (ابتداءً من مارس 2025) تمنع الحسابات والمشاريع الجديدة من استخدام ميزة الإكمال التلقائي القديمة \`google.maps.places.Autocomplete\`. لذلك تم تعطيلها عمداً في المنصة لأنها تسبب خطأ \`ApiTargetBlockedMapError\` الذي يعطل الخريطة بالكامل.
**البديل المستخدم لدينا:** هو أقوى محرك بحث مباشر (Geocoding) الذي يقرأ الكلمة ويعطيك نتيجتها الدقيقة بمجرد الضغط على Enter، وهو مجاني ومستقر تماماً!
      `,
      contentEn: `
# 🗺️ Comprehensive Guide to Google Maps Integration

**ChariDay** includes a professional mapping system allowing buyers to pinpoint precise delivery locations during checkout and address management.

## 🌟 Modern Features:
1. **Direct Geocoding Search:** Users can type a specific place (e.g., "Zajel Dubai") and press Enter to instantly pin the location.
2. **Smart Address Parsing (Plus Codes Filtering):** The system automatically ignores unreadable Google Plus Codes (e.g., M7G3+83W) and fetches the nearest human-readable street address or Point of Interest (POI).
3. **GPS Auto-Locate:** A high-accuracy location button. (Note: pinpoint accuracy is achieved on mobile devices with GPS hardware, whereas desktops rely on IP addresses).

---

## ⚙️ Setup Requirements (For Admins)

To prevent gray error screens, you MUST configure the following in **Google Cloud Console**:

### 1. Enable Billing Account
Google Maps APIs for Geocoding **will not work** without a linked credit card, even for the free tier.
* **Pricing:** Google provides **$200 FREE credit every month**. At $5 per 1,000 requests, this covers **40,000 free map searches/clicks per month**. You will only be charged if you exceed this massive threshold.

### 2. Enable Required APIs
Ensure you search for and click **Enable** on the following APIs:
* **Maps JavaScript API:** Renders the visual interactive map.
* **Geocoding API:** (CRITICAL) Converts map clicks into text addresses and powers the map's search bar.

### 3. Configure API Key Restrictions
In the Credentials section, if your API Key uses "API Restrictions", you MUST check the boxes for \`Geocoding API\` and \`Maps JavaScript API\` to prevent 'ApiTargetBlockedMapError' crashes.

---

## 🚨 Notice Regarding Predictive Autocomplete
As of March 2025, Google formally restricted new projects from using the legacy \`google.maps.places.Autocomplete\` feature. Using it causes a complete map crash. 
**Our Solution:** The platform deliberately bypasses this and uses robust direct Geocoding search instead. Simply type your query and hit Enter!
      `,
      sortOrder: 1,
      isPublished: true
    },
    {
      title: 'دليل إعداد التوثيق (OTP) وبوابات SMS و WhatsApp',
      titleEn: 'OTP Authentication, SMS & WhatsApp Gateway Guide',
      slug: 'otp-whatsapp-setup',
      category: 'settings',
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
  2. ستحصل على رابط Webhook (مثال: \`https://your-n8n.com/webhook/whatsapp\`).
  3. ضع الرابط في حقل **(API URL)** في إعدادات الواتساب بلوحة الإدارة.
  4. استخدم المتغير \`{otp}\` في حقل **صيغة الرسالة (Template)**.

### 2. بوابة SMS المجانية (عبر هاتف أندرويد)
يمكنك استخدام تطبيق أندرويد مخصص يحول هاتفك إلى سيرفر يرسل رسائل SMS من باقة خطك غير المحدودة.
* ضع رابط السيرفر المحلي لهاتفك في حقل **Custom SMS Gateway URL**.

### 3. بوابة تليجرام (Telegram Bot)
الطريقة الأكثر أماناً ومجانية تماماً. قم بإنشاء بوت عبر \`BotFather\` في تليجرام، وضع الـ Token واسم البوت في الإعدادات. سيقوم النظام بتوليد روابط ذكية لتوثيق المستخدمين عبر تليجرام بنقرة واحدة.

---

## 🛡️ حماية المنصة (Cloudflare Turnstile Captcha)

لمنع هجمات (SMS Bombing) التي قد تستنزف رصيد رسائلك، قمنا بدمج نظام **Cloudflare Turnstile** وهو أفضل بديل لـ Google reCAPTCHA، حيث يعمل في الخلفية دون إزعاج المستخدم باختيار صور إشارات المرور!
* **التفعيل:** احصل على \`Site Key\` و \`Secret Key\` مجاناً من حسابك في Cloudflare وضعها في الإعدادات.

---

## 🏃 تخطي الهاتف (Phone Skip Logic)

في حال تعطلت بوابات الـ SMS أو الواتساب، قمنا بتوفير ميزة **(تخطي مؤقتاً)**. 
إذا قمت بتفعيلها، سيتمكن العميل من تخطي خطوة الهاتف وإنشاء حسابه، ولكن حسابه سيبقى بعلامة (غير موثق برقم هاتف) حتى يوثقه لاحقاً من لوحة تحكمه.
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
  1. Deploy a WhatsApp automation using n8n (e.g., Evolution API or Baileys).
  2. Obtain your Webhook URL (e.g., \`https://your-n8n.com/webhook/whatsapp\`).
  3. Paste it into the **API URL** field in the WhatsApp Settings of the Admin Dashboard.
  4. Use the \`{otp}\` variable in the **WhatsApp Template** field.

### 2. Free Custom SMS Gateway (Android App)
Turn your Android phone into an SMS server to send OTPs using your unlimited cellular plan.
* Paste your phone's local/public server URL into the **Custom SMS Gateway URL** field.

### 3. Telegram Bot Gateway
The safest and completely free method. Create a bot via \`BotFather\` on Telegram, paste the Token and Username. The system will generate deep links for 1-click OTP verification.

---

## 🛡️ Bot Protection (Cloudflare Turnstile Captcha)

To prevent SMS Bombing attacks that drain your balance, we integrated **Cloudflare Turnstile**. It's the best alternative to Google reCAPTCHA, working silently without annoying users with image puzzles!
* **Setup:** Get a free \`Site Key\` and \`Secret Key\` from Cloudflare and paste them into the settings.

---

## 🏃 Phone Verification Skip Logic

If your SMS or WhatsApp gateways experience downtime, we built a **(Skip for now)** feature. 
When enabled by the admin, users can skip phone verification during registration. Their account will be flagged as "Phone Unverified" until they complete it from their dashboard.
      `,
      sortOrder: 2,
      isPublished: true
    },
    {
      title: 'نظام الصلاحيات والأدوار والقيود الذكية للمتاجر والموظفين',
      titleEn: 'Store Roles, Permissions & Smart Security Controls Guide',
      slug: 'roles-permissions-controls',
      category: 'settings',
      content: `
# 🛡️ نظام الصلاحيات والأدوار والقيود الذكية للشركاء والموظفين

صُمم نظام الصلاحيات والأمان في منصة **ChariDay** ليوفر حماية متطورة وفصلاً دقيقاً للمسؤوليات بين التاجر المالك (Seller)، وبين فريق عمله وموظفيه (Store Managers & Staff)، مع قيود آلية ذكية تمنع عمليات الاحتيال وتضمن سلامة العمليات المالية للمنصة.

---

## 👥 مستويات الصلاحيات للأدوار (Roles & Permissions)

يدعم النظام التدرج الهرمي الآتي للتحكم بالوصول:

### 1. التاجر المالك (Store Owner/Seller)
يملك الصلاحية الكاملة والمطلقة على المتجر، المحفظة المالية، الحساب البنكي، والتحكم المطلق بفريق العمل.

### 2. مدير المتجر (Store Manager)
يمثل الذراع التشغيلي الأول للتاجر المالك ويملك وصولاً واسعاً لإدارة المنتجات، الطلبات، والموظفين الآخرين.
* **⚠️ القيود الأمنية المفروضة عليه:** يتم حظر وصوله تماماً عن العمليات المالية الحساسة للمالك لحمايتها من السرقة أو التلاعب، مثل:
  * المحفظة المالية وسجل السحوبات (\`/seller/wallet\`).
  * الفواتير وتفاصيل الباقات والاشتراكات (\`/seller/billing\`).
  * طلبات الترقية والخصومات (\`/seller/upgrade\`).
  * سداد المديونيات وعمولات المنصة (\`/seller/debts\`).

### 3. إدارة المحتوى (Content Editor)
دور مخصص للموظفين المسؤولين عن الكتالوج والمخزون.
* **الوصول المتاح:** إضافة وتعديل المنتجات والعروض، وإعداد كوبونات الخصم.
* **القيود:** لا يمكنهم إدارة الطلبات، أو تغيير إعدادات المتجر الرئيسية، أو الوصول للمراسلات.

### 4. دعم العملاء (Customer Support)
دور مخصص لتشغيل المتجر وخدمة العملاء.
* **الوصول المتاح:** إدارة الطلبات والشحنات، قراءة الرسائل والرد عليها، إدارة التقييمات.
* **القيود:** لا يملكون صلاحية تعديل المنتجات أو الأسعار أو إعدادات المتجر.

### 5. متابعة الأداء (Viewer)
وصول للقراءة فقط للمحللين والمحاسبين.
* **الوصول المتاح:** قراءة التقارير والمبيعات والإحصائيات.
* **القيود:** لا يملكون أي صلاحية تعديل أو تحديث في أي مكان بالمتجر.

---

## 🔒 إدارة الأجهزة والأمان (Device & Session Management)

يوفر النظام للتاجر المالك والمدير أداة أمنية لمراقبة نشاط الفريق وحماية المتجر من الوصول غير المصرح به:
* **مراقبة الجلسات:** يمكن للمالك والمدير عرض قائمة بجميع الأجهزة النشطة الحالية لكل موظف، مع تفاصيل نظام التشغيل، المتصفح، عنوان IP، والموقع التقريبي للجهاز.
* **طرد الأجهزة (Revoke Sessions):** يمكن للمالك بضغطة زر إنهاء أي جلسة فوراً (طرد الجهاز) للموظف، أو طرد جميع جلساته دفعة واحدة في حال الاشتباه باختراق حسابه أو انتهاء فترة عمله.

---

## 🚨 قيود الحماية المالية ومنع الاحتيال

يتضمن النظام آليتين للحماية التلقائية من التلاعب المالي:

### 1. تجميد السحوبات المؤقت (Withdrawal Hold Period)
عندما يقوم التاجر بتعديل معلومات حساسة في حسابه (مثل: البريد الإلكتروني، رقم الهاتف، أو الحساب البنكي / رقم الـ RIB/IBAN)، يقوم النظام فوراً بـ:
* تسجيل نشاط حساس في سجل التدقيق (\`AuditLog\`).
* تجميد إمكانية طلب سحب الرصيد من المحفظة مؤقتاً لمدة **48 ساعة** (أو حسب القيمة المحددة من الإدارة العليا).
* يمنع هذا التجميد أي مخترق نجح في الوصول للحساب من تحويل الأرباح لحسابه الشخصي، مما يمنح المالك والمنصة وقتاً كافياً لاستعادة الحساب والتحقق من الهوية.

### 2. إعادة التحقق من التوثيق (Re-verification System)
في حال قام التاجر بتعديل بيانات الحساب البنكي (CCP أو IBAN)، يتم إرجاع حالة توثيق المتجر تلقائياً إلى **قيد المراجعة (Pending)**، ويتم إخفاء شارة التوثيق من المتجر العام لحين قيام إدارة المنصة بالتحقق اليدوي من تطابق اسم صاحب الحساب البنكي الجديد مع وثيقة الهوية (KYC) المرفوعة مسبقاً.
      `,
      contentEn: `
# 🛡️ Roles, Permissions & Smart Security Controls Guide

The permission and security system in **ChariDay** is designed to provide robust protection and separation of duties between the Store Owner (Seller) and their team members (Store Managers & Staff). Additionally, it implements automated fraud prevention rules to secure financial transactions.

---

## 👥 Role Access Levels & Permissions

The platform supports the following hierarchical roles:

### 1. Store Owner (Seller)
Has complete and unrestricted access over the store, wallet, bank account settings, and staff management.

### 2. Store Manager
Acts as the primary operations manager.
* **⚠️ Security Restriction:** Their access is strictly blocked from sensitive owner-related financial pages, including:
  * Wallet and withdrawals (\`/seller/wallet\`).
  * Invoices, packages, and subscriptions (\`/seller/billing\`).
  * Upgrades and plan discount requests (\`/seller/upgrade\`).
  * Debt settlement (\`/seller/debts\`).

### 3. Content Editor
Responsible for catalog and inventory.
* **Allowed Access:** Add/edit products, promotions, and configure coupons.
* **Restrictions:** Cannot manage orders, modify store settings, or view chat messages.

### 4. Customer Support
Responsible for operations and customer service.
* **Allowed Access:** Manage orders, process shipments, view/reply to chat messages, and manage product reviews.
* **Restrictions:** Cannot edit product details/prices or modify store settings.

### 5. Viewer
Read-only access for analysts and accountants.
* **Allowed Access:** View reports, sales data, and analytics dashboards.
* **Restrictions:** No write permissions anywhere on the platform.

---

## 🔒 Device & Session Management

Allows the store owner and managers to monitor team activity and secure accounts:
* **Session Monitoring:** View a list of all active logged-in devices for each staff member, showing OS, browser, IP address, and approximate location.
* **Revoke Sessions:** Terminate specific active sessions or revoke all sessions at once if an account compromise is suspected.

---

## 🚨 Fraud Prevention & Financial Holds

The platform automatically triggers security safeguards on sensitive events:

### 1. Temporary Withdrawal Hold
If a seller updates sensitive information (e.g., email, phone number, or banking/RIB details):
* The system logs a sensitive action in the \`AuditLog\`.
* Requesting payouts/withdrawals is automatically frozen for **48 hours** (configurable).
* This hold prevents hackers from diverting funds if they gain access to the account, giving the owner time to secure it.

### 2. Mandatory Onboarding Re-verification
If a seller changes their bank details (CCP or IBAN), their verification status reverts to **Pending**. The store's verification badge is hidden until platform admins manually review the new banking document to ensure the account holder's name matches the KYC documents.
      `,
      sortOrder: 3,
      isPublished: true
    }
  ];

  for (const doc of docs) {
    const existing = await prisma.docArticle.findUnique({ where: { slug: doc.slug } });
    if (!existing) {
      await prisma.docArticle.create({ data: doc });
      console.log('Created doc: ' + doc.slug);
    } else {
      await prisma.docArticle.update({
        where: { slug: doc.slug },
        data: doc
      });
      console.log('Updated doc: ' + doc.slug);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
