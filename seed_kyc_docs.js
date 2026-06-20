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

## المستندات المطلوبة:
- صورة الهوية الوطنية (الوجه الأمامي)
- صورة الهوية الوطنية (الوجه الخلفي)
- السجل التجاري أو رخصة العمل

## أين تحفظ مستنداتي؟
نحن نستخدم **الخزنة الآمنة (Secure Vault)** لحفظ المستندات. لن يتم حفظها في مجلدات عامة، ولا يمكن لأي شخص الوصول إليها بدون صلاحيات مدير النظام عبر خوارزميات تحقق دقيقة.

## سجل التدقيق (Audit Trail)
كافة إجراءات المراجعة (قبول، رفض، ملاحظات) تسجل بدقة لضمان الشفافية، وسيتلقى التاجر إشعاراً بالسبب في حال رفض أحد المستندات (وليس رفض الطلب بالكامل).
      `,
      contentEn: `
# Seller Verification Guide (KYC/KYB)

To ensure platform security, all stores must verify their identities before their accounts are activated. This system is built on high security standards (inspired by Ballerine.io) to protect the platform from fraud.

## Required Documents:
- National ID (Front)
- National ID (Back)
- Commercial Register / Business License

## Where are my documents stored?
We use a **Secure Vault** to store documents. They are not saved in public folders, and no one can access them without system admin permissions via strict authentication algorithms.

## Audit Trail
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
