const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const title = 'دليل إدارة توثيق المتاجر وسجل التدقيق للشركات (KYC/KYB)';
const titleEn = 'Admin Store Verification & Audit Trail Guide (KYC/KYB)';
const articleSlug = 'admin-verifications-guide';

const content = `# دليل إدارة توثيق المتاجر وسجل التدقيق للشركات (KYC/KYB)

يصف هذا الدليل نظام مراجعة التوثيق والتحقق من الهوية والنشاط التجاري للمتاجر والشركاء والمستقلين من خلال لوحة الإدارة.

## 1. جدول طلبات التفعيل المعلقة
تم تحديث صفحة طلبات التوثيق لتصبح على شكل جدول متكامل وقابل للفلترة لتسهيل مراجعة الحسابات المعلقة:
- **البحث المتقدم:** يمكنك البحث بالاسم، اسم المتجر، البريد الإلكتروني، أو رقم الهاتف.
- **التصفية حسب الدور:** تصفية الطلبات حسب نوع التاجر (متجر، مستقل، مورد، خدمات لوجستية).
- **التصفية حسب الأولوية:** عرض الطلبات المستعجلة (عاجل) أولاً لسرعة المعالجة.
- **ترقيم الصفحات:** يدعم العرض 10، 25، أو 50 طلباً في الصفحة لتجنب بطء التحميل.

## 2. نافذة تفاصيل التوثيق المتقدمة (Detail Modal)
توفر نافذة مراجعة الطلب عرضاً شاملاً لكل البيانات المرفوعة:
- **البيانات المدخلة:** تفاصيل الشركة، نوع الكيان (قانوني/طبيعي)، جهة وتاريخ إصدار السجل التجاري، والعنوان.
- **تنبيهات الصلاحية:** يعرض النظام تنبيهات ملونة ذكية لتواريخ انتهاء السجلات (صلاحية حرجة، منتهية، سارية).
- **البيانات المالية:** عرض اسم المستفيد، البنك، الـ IBAN أو حساب CCP ومفتاحه.
- **معاينة المستندات المرفقة:** تتيح المعاينة الحية للصور وملفات PDF داخل لوحة التحكم مع روابط التحميل المباشر.

## 3. سجل التدقيق المستقل (Audit Trail)
تم نقل سجل التدقيق بالكامل إلى صفحة مستقلة لسهولة الرقابة:
- **تتبع الإجراءات:** يسجل كل إجراء (تفعيل، رفض، طلب تعديل، أو إضافة ملاحظة) بالوقت واسم المسؤول.
- **تنبيهات التعديل:** إظهار الأسباب التفصيلية وتحديد الحقول المطلوبة للتصحيح.`;

const contentEn = `# Admin Store Verification & Audit Trail Guide (KYC/KYB)

This guide describes the verification review and audit system for stores, partners, and freelancers within the admin panel.

## 1. Pending Activation Requests Table
The verification requests queue has been redesigned as a searchable and paginated table:
- **Advanced Search:** Search by merchant name, store name, email, or phone.
- **Role Filtering:** Filter requests by type (Store, Freelancer, Supplier, Logistics).
- **Priority Filtering:** Easily isolate and process urgent activation requests.
- **Pagination:** Supports 10, 25, or 50 records per page for optimal performance.

## 2. Advanced Details Modal
The detail modal offers a comprehensive view of all uploaded applicant details:
- **Application Data:** Company details, entity type, registration number, issue authority, and address.
- **Smart Expiry Alerts:** Colored badges warning of expired or critical document validities.
- **Financial Info:** Beneficiary name, bank, IBAN, or CCP details.
- **Live Document Preview:** Embedded image and PDF document preview panel with direct download actions.

## 3. Standalone Audit Trail
The verification history log is now located on a standalone page for better tracking:
- **Action Timeline:** Tracks approvals, rejections, edit requests, and comments with admin signatures.
- **Detailed Rejections:** Inspect rejection reasons and specific requested document fields.`;

const translations = {
  ar: {
    title: 'دليل إدارة توثيق المتاجر وسجل التدقيق للشركات (KYC/KYB)',
    content: content,
  },
  en: {
    title: 'Admin Store Verification & Audit Trail Guide (KYC/KYB)',
    content: contentEn,
  },
  fr: {
    title: "Guide de vérification des boutiques et journal d'audit (KYC/KYB)",
    content: `# Guide de vérification des boutiques et journal d'audit (KYC/KYB)

Ce guide décrit le système de vérification et d'audit pour les boutiques, partenaires, et indépendants.

## 1. Table des demandes d'activation
La file d'attente des demandes de vérification a été repensée sous forme de tableau paginé :
- **Recherche avancée :** Recherchez par nom, boutique, email ou téléphone.
- **Filtrage par rôle :** Filtrez les demandes par type (Boutique, Indépendant, Fournisseur, Logistique).
- **Filtrage par priorité :** Traitez en priorité les demandes d'activation urgentes.
- **Pagination :** Prend en charge 10, 25 ou 50 enregistrements par page.

## 2. Fenêtre de détails avancée
La fenêtre de détails affiche toutes les informations soumises :
- **Données d'application :** Détails de l'entreprise, type d'entité, numéro d'enregistrement, autorité d'émission, et adresse.
- **Alertes d'expiration :** Badges colorés signalant les validités de documents critiques ou expirés.
- **Info financière :** Nom du bénéficiaire, banque, IBAN ou CCP.
- **Aperçu des documents en direct :** Aperçu intégré des images et fichiers PDF avec téléchargement direct.

## 3. Journal d'audit indépendant
L'historique des actions est maintenant sur une page autonome :
- **Chronologie des actions :** Suit les approbations, rejets, demandes de modification avec signature administrateur.`,
  }
};

async function main() {
  const existing = await db.docArticle.findUnique({
    where: { slug: articleSlug }
  });

  if (!existing) {
    await db.docArticle.create({
      data: {
        title,
        titleEn,
        slug: articleSlug,
        content,
        contentEn,
        translations: translations,
        category: 'sellers',
        sortOrder: 12,
        isPublished: true
      }
    });
    console.log('✅ Created Doc article:', articleSlug);
  } else {
    await db.docArticle.update({
      where: { slug: articleSlug },
      data: {
        title,
        titleEn,
        content,
        contentEn,
        translations: translations,
        isPublished: true
      }
    });
    console.log('✅ Updated Doc article:', articleSlug);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
