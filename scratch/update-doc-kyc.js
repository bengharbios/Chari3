const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const arContent = `# دليل توثيق المتاجر (KYC/KYB)

حرصاً على أمان المنصة، يجب على جميع المتاجر توثيق هوياتهم قبل تفعيل حساباتهم. هذا النظام مبني على معايير أمان عالية (مستوحى من Ballerine.io) لحماية المنصة من الاحتيال.

## 1. التحديثات والمميزات الجديدة في نظام التوثيق:
- **دعم كامل للغة والاتجاه (RTL Support):** يدعم معالج التوثيق (Wizard) وشريط التقدم التوجيه الأيمن بالكامل للغة العربية.
- **تسمية مخصصة وعادلة:** تم إعادة تسمية تبويب التوثيق إلى **"هوية المدير أو المالك أو الممثل القانوني للشركة"** لتوضيح صفة الشخص المخول بالرفع.
- **خياران للرفع (ملف أو كاميرا):** لم تعد مقيداً بالكاميرا فقط! يمكنك الآن إما تشغيل الكاميرا لالتقاط بطاقة الهوية الذكي (OCR)، أو رفع ملفات صور الهوية مباشرة من جهازك. وفي كلتا الحالتين، يقوم النظام تلقائياً باستخراج بيانات الاسم والرقم التعريفي (NIN) عبر مكتبة OCR لتسهيل التعبئة.
- **إمكانية تغيير اللغة أثناء التوثيق:** تم إبقاء الهيدر والقائمة الجانبية نشطة ومخفية بشكل ذكي عبر تغليف الصفحة بـ \`DashboardLayout\`، مما يتيح للتاجر تغيير لغة الواجهة (العربية، الإنجليزية، الفرنسية) في أي وقت إذا كان يفضل قراءة شروط التوثيق بلغة أخرى.

## 2. المستندات المطلوبة:
- صورة الهوية الوطنية للممثل القانوني (الوجه الأمامي)
- صورة الهوية الوطنية للممثل القانوني (الوجه الخلفي)
- السجل التجاري أو رخصة عمل حر / بطاقة مهنية
- الرقم الضريبي / المعرف الضريبي (TIN)
- كشف الحساب البنكي أو البريدي (RIB / IBAN / CCP) لتوثيق الحساب المالي

## 3. أين تحفظ مستنداتي؟
نحن نستخدم **الخزنة الآمنة (Secure Vault)** لحفظ المستندات. لن يتم حفظها في مجلدات عامة، ولا يمكن لأي شخص الوصول إليها بدون صلاحيات مدير النظام عبر خوارزميات تحقق دقيقة.

## 4. سجل التدقيق (Audit Trail)
كافة إجراءات المراجعة (قبول، رفض، ملاحظات) تسجل بدقة لضمان الشفافية، وسيتلقى التاجر إشعاراً بالسبب في حال رفض أحد المستندات (وليس رفض الطلب بالكامل).
`;

const enContent = `# Seller Verification Guide (KYC/KYB)

To ensure platform security, all stores must verify their identities before their accounts are activated. This system is built on high security standards (inspired by Ballerine.io) to protect the platform from fraud.

## 1. Onboarding Features & Updates:
- **Full RTL & Layout Support:** The onboarding wizard and progress bar now fully support Arabic RTL layout.
- **Representative Identity Tab:** The identity step is named **"Identity (Manager/Owner/Representative)"** to make it legally clear.
- **Flexible Verification Formats (File Upload + Camera):** You can now verify your ID either by capturing it directly with the camera (with OpenCV-based edge detection and automatic OCR) OR by uploading a saved ID image from your computer/gallery. In both cases, the system converts the file and runs the automatic OCR text extraction to auto-fill the legal representative's name and NIN.
- **Interface Language Switching:** The onboarding wizard is wrapped in the platform's \`DashboardLayout\`, ensuring the main header (with language switcher for Arabic, English, and French) and sidebar remain visible. This allows users to dynamically toggle the interface language if they prefer to fill out the form in another language.

## 2. Required Documents:
- National ID of the legal representative (Front)
- National ID of the legal representative (Back)
- Commercial Register / Freelance License / Professional Card
- Tax Identification Number (TIN)
- Bank Account or Postal Account Proof (RIB / IBAN / CCP)

## 3. Where are my documents stored?
We use a **Secure Vault** to store documents. They are not saved in public folders, and no one can access them without system admin permissions via strict authentication algorithms.

## 4. Audit Trail
All review actions (approvals, rejections, notes) are strictly logged to ensure transparency, and the seller will receive a notification with the reason if a specific document is rejected (rather than rejecting the whole application).
`;

const frContent = `# Guide de vérification des vendeurs (KYC/KYB)

Afin de garantir la sécurité de la plateforme, tous les magasins doivent vérifier leur identité avant l'activation de leur compte. Ce système repose sur des normes de sécurité élevées (inspirées de Ballerine.io) pour protéger la plateforme contre la fraude.

## 1. Fonctionnalités et mises à jour du système de vérification :
- **Support complet RTL (arabe) :** L'assistant de vérification (Wizard) et la barre de progression prennent entièrement en charge l'alignement de droite à gauche pour la langue arabe.
- **Désignation claire du représentant :** L'étape d'identité a été renommée **« Identité (Directeur/Propriétaire/Représentant légal) »** pour clarifier le statut de la personne autorisée à soumettre les documents.
- **Deux options de téléchargement (Fichier ou Caméra) :** Vous n'êtes plus limité à l'utilisation de la caméra ! Vous pouvez désormais soit utiliser la caméra pour capturer intelligemment la carte d'identité (OCR), soit charger directement des fichiers d'identité depuis votre appareil. Dans les deux cas, le système extrait automatiquement le nom et le numéro d'identification (NIN) via notre service OCR.
- **Changement de langue pendant la vérification :** L'en-tête et la barre latérale restent visibles de manière intelligente, ce qui permet au commerçant de changer la langue de l'interface (arabe, anglais, français) à tout moment.

## 2. Documents requis :
- Pièce d'identité nationale du représentant légal (Recto)
- Pièce d'identité nationale du représentant légal (Verso)
- Registre du commerce ou licence d'activité professionnelle / carte professionnelle
- Numéro d'identification fiscale (NIF / TIN)
- Preuve de compte bancaire ou postal (RIB / IBAN / CCP)

## 3. Où sont stockés mes documents ?
Nous utilisons un **coffre-fort sécurisé (Secure Vault)** pour stocker vos documents. Ils ne sont pas enregistrés dans des dossiers publics et personne ne peut y accéder sans les autorisations d'administrateur système via des algorithmes d'authentification stricts.

## 4. Historique d'audit (Audit Trail)
Toutes les actions d'examen (approbations, rejets, notes) sont enregistrées pour garantir la transparence. Le commerçant recevra une notification détaillée indiquant la raison exacte en cas de rejet d'un document spécifique (plutôt que de rejeter l'ensemble de la demande).
`;

const translations = {
  ar: {
    title: "دليل توثيق المتاجر (KYC/KYB)",
    content: arContent
  },
  en: {
    title: "Seller Verification Guide (KYC/KYB)",
    content: enContent
  },
  fr: {
    title: "Guide de vérification des vendeurs (KYC/KYB)",
    content: frContent
  }
};

async function main() {
  console.log('Updating doc article with slug seller-kyc-guide...');
  const doc = await prisma.docArticle.update({
    where: { slug: 'seller-kyc-guide' },
    data: {
      content: arContent,
      contentEn: enContent,
      translations: translations
    }
  });
  console.log('Successfully updated:', doc.title);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
