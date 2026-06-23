const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding KYC/KYB Developer & User Documentation...');

  const docs = [
    {
      title: 'دليل توثيق المتاجر (KYC/KYB)',
      titleEn: 'Seller Verification Guide (KYC/KYB)',
      slug: 'seller-kyc-guide',
      category: 'sellers',
      content: `
# دليل توثيق المتاجر (KYC/KYB)

حرصاً على أمان المنصة، يجب على جميع المتاجر توثيق هوياتهم قبل تفعيل حساباتهم. هذا النظام مبني على معايير أمان عالية (مستوحى من Ballerine.io) لحماية المنصة من الاحتيال.

## 1. التحديثات والمميزات الجديدة في نظام التوثيق:
- **دعم كامل للغة والاتجاه (RTL Support):** يدعم معالج التوثيق (Wizard) وشريط التقدم التوجيه الأيمن بالكامل للغة العربية.
- **تسمية مخصصة وعادلة:** تم إعادة تسمية تبويب التوثيق إلى **"هوية المدير أو المالك أو الممثل القانوني للشركة"** لتوضيح صفة الشخص المخول بالرفع.
- **خياران للرفع (ملف أو كاميرا):** لم تعد مقيداً بالكاميرا فقط! يمكنك الآن إما تشغيل الكاميرا لالتقاط بطاقة الهوية الذكي (OCR)، أو رفع ملفات صور الهوية مباشرة من جهازك. وفي كلتا الحالتين، يقوم النظام تلقائياً باستخراج بيانات الاسم والرقم التعريفي (NIN) عبر مكتبة OCR لتسهيل التعبئة.
- **إمكانية تغيير اللغة أثناء التوثيق:** تم إبقاء الهيدر والقائمة الجانبية نشطة ومخفية بشكل ذكي عبر تغليف الصفحة بـ \`DashboardLayout\`، مما يتيح للتاجر تغيير لغة الواجهة (العربية، الإنجليزية، الفرنسية) في أي وقت إذا كان يفضل قراءة شروط التوثيق بلغة أخرى.

## 2. المستندات المطلوبة:
- صورة الهوية الوطنية للممثل القانوني (الوجه الأمامي)
- صورة الهوية الوطنية للممثل القانوني (الوجه الخلفي)
- السجل التجاري أو رخصة العمل
- الرقم الضريبي (NIF) إن وجد
- كشف الحساب البنكي (RIB) لتوثيق الحساب المالي

## 3. أين تحفظ مستنداتي؟
نحن نستخدم **الخزنة الآمنة (Secure Vault)** لحفظ المستندات. لن يتم حفظها في مجلدات عامة، ولا يمكن لأي شخص الوصول إليها بدون صلاحيات مدير النظام عبر خوارزميات تحقق دقيقة.

## 4. سجل التدقيق (Audit Trail)
كافة إجراءات المراجعة (قبول، رفض، ملاحظات) تسجل بدقة لضمان الشفافية، وسيتلقى التاجر إشعاراً بالسبب في حال رفض أحد المستندات (وليس رفض الطلب بالكامل).
      `,
      contentEn: `
# Seller Verification Guide (KYC/KYB)

To ensure platform security, all stores must verify their identities before their accounts are activated. This system is built on high security standards (inspired by Ballerine.io) to protect the platform from fraud.

## 1. Onboarding Features & Updates:
- **Full RTL & Layout Support:** The onboarding wizard and progress bar now fully support Arabic RTL layout.
- **Representative Identity Tab:** The identity step is named **"Identity (Manager/Owner/Representative)"** to make it legally clear.
- **Flexible Verification Formats (File Upload + Camera):** You can now verify your ID either by capturing it directly with the camera (with OpenCV-based edge detection and automatic OCR) OR by uploading a saved ID image from your computer/gallery. In both cases, the system converts the file and runs the automatic OCR text extraction to auto-fill the legal representative's name and NIN.
- **Interface Language Switching:** The onboarding wizard is wrapped in the platform's \`DashboardLayout\`, ensuring the main header (with language switcher for Arabic, English, and French) and sidebar remain visible. This allows users to dynamically toggle the interface language if they prefer to fill out the form in another language.

## 2. Required Documents:
- National ID of the legal representative (Front)
- National ID of the legal representative (Back)
- Commercial Register / Business License
- Tax Registration Number (TRN/NIF)
- Bank Account Proof (RIB/IBAN)

## 3. Where are my documents stored?
We use a **Secure Vault** to store documents. They are not saved in public folders, and no one can access them without system admin permissions via strict authentication algorithms.

## 4. Audit Trail
All review actions (approvals, rejections, notes) are strictly logged to ensure transparency, and the seller will receive a notification with the reason if a specific document is rejected (rather than rejecting the whole application).
      `,
      isPublished: true,
      sortOrder: 1,
      translations: {
        ar: { title: 'دليل توثيق المتاجر (KYC/KYB)' },
        en: { title: 'Seller Verification Guide (KYC/KYB)' }
      }
    }
  ];

  for (const doc of docs) {
    await prisma.docArticle.upsert({
      where: { slug: doc.slug },
      update: doc,
      create: doc,
    });
    console.log(`Upserted doc: ${doc.slug}`);
  }

  console.log('Finished seeding KYC docs.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
