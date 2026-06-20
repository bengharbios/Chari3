const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const title = 'نظام الأمان والدخول (Security & Access)';
  const titleEn = 'Security & Access System';
  const slug = 'security-and-access';
  const content = `
# نظام الأمان والدخول

تم إضافة نظام حماية متقدم لمراقبة محاولات تسجيل الدخول والتحقق (OTP) لمنع الهجمات والاختراقات.

## الميزات:
- **سجل المصادقة (Auth Logs):** تتبع جميع محاولات تسجيل الدخول، إنشاء الحساب، والتحقق، مع تفاصيل مثل IP، الدولة، الجهاز، المتصفح، والنتيجة (نجاح/فشل).
- **قائمة الحظر (Ban List):** إمكانية حظر (IP، رقم هاتف، بريد إلكتروني، دولة، أو بصمة جهاز) بشكل مؤقت أو دائم.
- **الحماية التلقائية:** حظر تلقائي للطلبات المشبوهة أو المتكررة بشكل مفرط.
- **التوافق:** النظام يدعم اللغتين العربية والإنجليزية بالكامل.

## طريقة الاستخدام:
يمكن للمدير (Super Admin) الوصول لهذه الميزات من خلال الشريط الجانبي تحت قسم "الأمان والدخول".
`;

  const contentEn = `
# Security & Access System

An advanced security system has been added to monitor login and OTP verification attempts to prevent attacks and abuse.

## Features:
- **Auth Logs:** Track all login, registration, and verification attempts, including details like IP, Country, Device, Browser, and outcome (Success/Failure).
- **Ban List:** Ability to ban (IP, Phone Number, Email, Country, or Device Fingerprint) temporarily or permanently.
- **Automatic Protection:** Automatic blocking of suspicious or overly frequent requests.
- **Compatibility:** The system fully supports both Arabic and English.

## Usage:
The Super Admin can access these features from the sidebar under the "Security & Access" section.
`;

  const existingDoc = await prisma.docArticle.findUnique({ where: { slug } });
  if (existingDoc) {
    await prisma.docArticle.update({
      where: { slug },
      data: {
        title, titleEn, content, contentEn,
        category: 'general', isPublished: true
      }
    });
    console.log('Updated existing DocArticle');
  } else {
    await prisma.docArticle.create({
      data: {
        title, titleEn, slug, content, contentEn,
        category: 'general', isPublished: true,
        sortOrder: 10
      }
    });
    console.log('Created new DocArticle');
  }
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
