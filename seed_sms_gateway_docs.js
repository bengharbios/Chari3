const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const contentAr = `
# الدليل الشامل لإعداد بوابة SMS للأندرويد (SMS Gateway)

يتيح لك نظام **شاري داي** ربط أي هاتف أندرويد ليعمل كخادم (Server) لإرسال رسائل الـ OTP لعملائك بتكلفة محلية بسيطة جداً عبر شريحة هاتفك الخاصة (SIM). هذا الدليل يشرح لك خطوة بخطوة كيفية إعداد ذلك مجاناً.

---

## 1. تحميل وتثبيت التطبيق على الهاتف
نستخدم تطبيق مفتوح المصدر ومجاني تماماً يسمى **SMS Gateway** (من تطوير capcom6).

1. قم بتحميل أحدث نسخة من التطبيق من مستودع المطور الرسمي:
   [اضغط هنا لتحميل التطبيق (ملف APK)](https://github.com/capcom6/android-sms-gateway/releases/latest/download/smsgateway.apk)
2. عند تحميل الملف، قد يحذرك الهاتف من أن الملفات من مصادر غير معروفة قد تكون ضارة. اختر **"موافق" أو "السماح"** لأن التطبيق آمن ومفتوح المصدر.
3. إذا ظهرت لك رسالة **"التطبيق ليس مثبتاً"**، قم بالدخول إلى **متجر جوجل بلاي > صورتك الشخصية > Play Protect (حماية جوجل بلاي)**، ثم قم بإيقاف الحماية مؤقتاً لحين تثبيت التطبيق.

---

## 2. إعداد التطبيق في هاتفك
بعد التثبيت وفتح التطبيق:
1. في الشاشة الرئيسية للتطبيق، قم بتفعيل **"خادم السحاب" (Cloud Server)**.
2. سيطلب منك التطبيق تسجيل الدخول. استخدم حساب جوجل الخاص بك للتسجيل.
3. بعد التسجيل الناجح، سيظهر لك **رابط (URL)** و**كلمة مرور (Token/Password)** في واجهة التطبيق.

---

## 3. ربط التطبيق بمنصة شاري داي
الآن سنقوم بربط التطبيق بلوحة تحكم متجرك:

1. من القائمة الجانبية في **شاري داي**، اذهب إلى: **الإعدادات > إعدادات المصادقة (OTP Settings)**.
2. قم بتفعيل زر **"البوابة المخصصة (Custom SMS/WhatsApp Gateway)"**.
3. في خانة **رابط الـ Webhook**، ضع الرابط الذي أخذته من التطبيق. 
   *(يجب أن يكون الرابط مشابهاً لـ: \`https://sms.capcom.me/api/3rdparty/v1/message\`)*
4. في خانة **رمز المصادقة (Auth Token)**، ضع الرمز السري الذي أعطاه لك التطبيق مسبوقاً بكلمة \`Basic \`.
   *(مثال: \`Basic U29tZVVzZXI6U29tZVBhc3M=\`)* 
   *ملاحظة: يمكنك استخدام زر "اختبار بوابة SMS" للتأكد من وصول الرسالة.*
5. اضغط على زر **"حفظ التغييرات"**.

---

## 4. حل مشكلة إيقاف التطبيق في الخلفية
معظم هواتف الأندرويد تقوم بإيقاف التطبيقات التي تعمل في الخلفية لتوفير البطارية. إذا لم تقم بإيقاف هذا التقييد، ستتوقف الرسائل عن الوصول إذا لم يكن التطبيق مفتوحاً على الشاشة!

لحل هذه المشكلة نهائياً:
1. اذهب إلى **إعدادات هاتفك (Settings)**.
2. ابحث عن **"التطبيقات" (Apps)** ثم اختر **SMS Gateway**.
3. ابحث عن قسم **"البطارية" (Battery)**.
4. غيّر الإعداد من "محسّن" (Optimized) إلى **"غير مقيد" (Unrestricted) أو "السماح بالعمل في الخلفية" (Allow background activity)**.
5. (اختياري) في بعض الهواتف مثل شاومي وسامسونج، يجب أيضاً تفعيل **"التشغيل التلقائي" (Auto-start)** للتطبيق.

---

## 5. تخطي فلاتر شركات الاتصالات (Spam Filters)
بعض شركات الاتصالات قد تحظر رسائلك إذا شعرت أنها "عشوائية" (Spam)، خاصة إذا كان محتوى الرسالة قصيراً جداً وثابتاً. لتخطي هذا الحظر، يمكنك تغيير **صيغة الرسالة (SMS Template)** من الإعدادات في شاري داي لتكون شخصية ومميزة.

**أمثلة لصيغ مقبولة:**
- \`مرحباً بك في متجرنا! رمز التحقق الخاص بك هو: {otp}. الرمز صالح لمدة 5 دقائق.\`
- \`رمز الدخول السري لمتجر [اسم متجرك] هو {otp}. لا تشارك هذا الرمز مع أحد.\`

*تأكد دائماً من وجود الكلمة \`{otp}\` لأن النظام سيستبدلها بالرمز الفعلي.*
`;

  const contentEn = `
# Comprehensive Guide to Android SMS Gateway Setup

**ChariDay** allows you to connect any Android phone to act as an SMS Server for sending OTPs to your customers at very low local rates using your own SIM card. This guide explains how to set this up step-by-step for free.

---

## 1. Download and Install the App
We use a completely free and open-source application called **SMS Gateway** (by capcom6).

1. Download the latest version from the official repository:
   [Click here to download the APK](https://github.com/capcom6/android-sms-gateway/releases/latest/download/smsgateway.apk)
2. When downloading, your phone may warn you about installing unknown apps. Choose **"Allow" or "OK"** as this app is safe and open-source.
3. If you get an **"App not installed"** error, go to **Google Play Store > Profile > Play Protect**, and temporarily disable it until the installation is complete.

---

## 2. Configure the App on Your Phone
After installing and opening the app:
1. On the main screen, enable the **Cloud Server**.
2. The app will ask you to log in. Use your Google account to sign in.
3. After successful login, you will be provided with a **URL** and a **Password/Token**.

---

## 3. Connect the App to ChariDay
Now, we will link the app to your ChariDay dashboard:

1. In the sidebar, go to: **Settings > Auth & OTP Settings**.
2. Enable the **Custom SMS/WhatsApp Gateway** option.
3. In the **Webhook API URL** field, paste the URL provided by the app.
   *(It should look like: \`https://sms.capcom.me/api/3rdparty/v1/message\`)*
4. In the **Auth Token** field, paste your secret code prefixed with \`Basic \`.
   *(Example: \`Basic U29tZVVzZXI6U29tZVBhc3M=\`)*
5. Click **"Save Changes"**.

---

## 4. Troubleshooting Background Activity (Battery Restrictions)
Most Android phones kill background apps to save battery. If you do not disable this restriction, SMS messages will stop sending when the app is closed!

To fix this permanently:
1. Go to your phone's **Settings**.
2. Go to **Apps** and find **SMS Gateway**.
3. Look for the **Battery** section.
4. Change the setting from "Optimized" to **"Unrestricted" or "Allow background activity"**.
5. (Optional) On phones like Xiaomi or Samsung, make sure to enable **"Auto-start"** for the app.

---

## 5. Bypassing Telecom Spam Filters
Some telecom providers block automated messages if they look like "Spam" (e.g., short, repetitive texts). To bypass this, customize your **SMS Template** in ChariDay to make it look more personal.

**Good Examples:**
- \`Welcome to our store! Your verification code is: {otp}. Valid for 5 minutes.\`
- \`Your secure login code for [Your Store Name] is {otp}. Do not share this.\`

*Always ensure \`{otp}\` is present, as the system will replace it with the actual code.*
`;

  const article = await prisma.docArticle.upsert({
    where: { slug: 'android-sms-gateway-setup' },
    update: {
      title: 'إعداد بوابة SMS للأندرويد',
      titleEn: 'Android SMS Gateway Setup',
      content: contentAr,
      contentEn: contentEn,
      category: 'developers',
    },
    create: {
      slug: 'android-sms-gateway-setup',
      title: 'إعداد بوابة SMS للأندرويد',
      titleEn: 'Android SMS Gateway Setup',
      content: contentAr,
      contentEn: contentEn,
      category: 'developers',
      isPublished: true,
      sortOrder: 1,
    }
  });

  console.log('Successfully seeded Android SMS Gateway documentation:', article.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
