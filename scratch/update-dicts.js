const fs = require('fs');
const path = require('path');

const dictPaths = [
  path.join(process.cwd(), 'src', 'lib', 'i18n', 'dictionaries', 'ar.json'),
  path.join(process.cwd(), 'src', 'lib', 'i18n', 'dictionaries', 'en.json'),
  path.join(process.cwd(), 'src', 'lib', 'i18n', 'dictionaries', 'fr.json')
];

const arNotifications = {
  "PRODUCT_APPROVED": {
    "title": "🎉 تمت الموافقة على نشر منتجك ({{productName}})",
    "body": "تمت مراجعة منتجك {{productName}} والموافقة عليه، وهو الآن متاح للجمهور."
  },
  "PRODUCT_REJECTED": {
    "title": "⚠️ مطلوب تعديل على منتجك ({{productName}})",
    "body": "للأسف تم رفض منتجك {{productName}}. السبب: {{reason}}"
  },
  "VERIFICATION_APPROVED": {
    "title": "تم قبول طلب التوثيق",
    "body": "تم قبول طلب التوثيق الخاص بك، حسابك الآن مفعل ويمكنك استخدام كافة الصلاحيات."
  },
  "VERIFICATION_REJECTED": {
    "title": "تم رفض طلب التوثيق",
    "body": "نعتذر، تم رفض طلب التوثيق الخاص بك. يرجى مراجعة التفاصيل لتصحيح الأخطاء."
  },
  "VERIFICATION_EDIT_REQUIRED": {
    "title": "مطلوب تعديل على طلب التوثيق",
    "body": "يرجى تعديل بعض بيانات طلب التوثيق الخاص بك. ملاحظة: {{reason}}"
  },
  "VERIFICATION_EXPIRED_ADMIN_ALERT": {
    "title": "انتهت صلاحية السجل التجاري",
    "body": "انتهت صلاحية السجل التجاري للمتجر {{storeName}}."
  },
  "RECEIPT_AWAITING_APPROVAL": {
    "title": "وصل دفع جديد بانتظار التأكيد 🧾",
    "body": "قام التاجر {{merchantName}} برفع وصل سداد جديد بانتظار المراجعة."
  },
  "RECEIPT_APPROVED": {
    "title": "تم تأكيد وصل الدفع بنجاح! 🎉",
    "body": "لقد تم التحقق من وصل سدادك وتأكيده بنجاح. شكراً لك!"
  },
  "SUBSCRIPTION_ACTIVATED": {
    "title": "تم تفعيل اشتراكك بنجاح! 🎉",
    "body": "تهانينا! تم تفعيل اشتراكك في باقة {{planName}} بنجاح."
  },
  "RECEIPT_REJECTED": {
    "title": "تم رفض وصل الدفع ❌",
    "body": "للأسف، تعذر تأكيد وصل الدفع الخاص بك. يرجى التحقق وإعادة الرفع."
  },
  "SUBSCRIPTION_REQUEST": {
    "title": "طلب اشتراك جديد 📦",
    "body": "طلب اشتراك جديد لباقة {{planName}} بانتظار الموافقة."
  },
  "UPGRADE_REQUEST": {
    "title": "طلب ترقية باقة جديد 📦",
    "body": "طلب ترقية باقة جديد بانتظار الموافقة."
  },
  "ORDER_NEW": {
    "title": "طلب جديد! 🛍️",
    "body": "طلب جديد #{{orderNumber}} بقيمة {{total}} دج"
  },
  "ORDER_STATUS_CHANGED": {
    "title": "{{statusName}} 📦",
    "body": "تم تحديث حالة طلبك #{{orderNumber}} إلى: {{statusName}}"
  },
  "QA_NEW": {
    "title": "سؤال جديد معلق! ❓",
    "titleEn": "New Pending Question! ❓",
    "body": "لديك سؤال جديد معلق حول المنتج \"{{productName}}\" بانتظار إجابتك."
  },
  "PRODUCT_PENDING_APPROVAL": {
    "title": "⏳ منتج جديد بانتظار المراجعة والموافقة ({{productName}})",
    "body": "قام البائع بإضافة منتج جديد وهو بانتظار المراجعة."
  },
  "PRODUCT_UPDATED_PENDING_APPROVAL": {
    "title": "⏳ تعديل منتج بانتظار المراجعة والموافقة ({{productName}})",
    "body": "قام البائع بتحديث منتج وهو بانتظار المراجعة."
  },
  "UPGRADE_REQUEST_PAYMENT": {
    "title": "رفع وصل سداد ترقية متجر",
    "body": "قام التاجر برفع وصل سداد لترقية متجره."
  }
};

const enNotifications = {
  "PRODUCT_APPROVED": {
    "title": "🎉 Product Approved & Published ({{productName}})",
    "body": "Your product {{productName}} has been reviewed and approved, it is now available to the public."
  },
  "PRODUCT_REJECTED": {
    "title": "⚠️ Action Required on Product ({{productName}})",
    "body": "Unfortunately, your product {{productName}} has been rejected. Reason: {{reason}}"
  },
  "VERIFICATION_APPROVED": {
    "title": "Verification Approved",
    "body": "Your verification request has been approved. Your account is now active."
  },
  "VERIFICATION_REJECTED": {
    "title": "Verification Rejected",
    "body": "We apologize, your verification request has been rejected. Please check details to correct errors."
  },
  "VERIFICATION_EDIT_REQUIRED": {
    "title": "Verification Edit Required",
    "body": "Please edit some details in your verification request. Note: {{reason}}"
  },
  "VERIFICATION_EXPIRED_ADMIN_ALERT": {
    "title": "Commercial register expired",
    "body": "The commercial register for store {{storeName}} has expired."
  },
  "RECEIPT_AWAITING_APPROVAL": {
    "title": "New Payment Receipt Awaiting Approval 🧾",
    "body": "Merchant {{merchantName}} has submitted a new payment receipt pending review."
  },
  "RECEIPT_APPROVED": {
    "title": "Payment Receipt Approved! 🎉",
    "body": "Your payment receipt has been successfully verified and confirmed. Thank you!"
  },
  "SUBSCRIPTION_ACTIVATED": {
    "title": "Subscription Activated! 🎉",
    "body": "Congratulations! Your subscription to the {{planName}} plan has been successfully activated."
  },
  "RECEIPT_REJECTED": {
    "title": "Payment Receipt Rejected ❌",
    "body": "Unfortunately, your payment receipt could not be verified. Please check and re-upload."
  },
  "SUBSCRIPTION_REQUEST": {
    "title": "New Subscription Request 📦",
    "body": "New subscription request for the {{planName}} plan pending approval."
  },
  "UPGRADE_REQUEST": {
    "title": "New Upgrade Request 📦",
    "body": "New upgrade request pending approval."
  },
  "ORDER_NEW": {
    "title": "New Order! 🛍️",
    "body": "New order #{{orderNumber}} worth {{total}} DZD"
  },
  "ORDER_STATUS_CHANGED": {
    "title": "{{statusName}} 📦",
    "body": "Your order #{{orderNumber}} status has been updated to: {{statusName}}"
  },
  "QA_NEW": {
    "title": "New Pending Question! ❓",
    "body": "You have a new pending question on your product \"{{productName}}\" waiting for your answer."
  },
  "PRODUCT_PENDING_APPROVAL": {
    "title": "⏳ New product pending approval ({{productName}})",
    "body": "A merchant added a new product that is waiting for your review and approval."
  },
  "PRODUCT_UPDATED_PENDING_APPROVAL": {
    "title": "⏳ Updated product pending approval ({{productName}})",
    "body": "A merchant updated a product that is waiting for your review and approval."
  },
  "UPGRADE_REQUEST_PAYMENT": {
    "title": "Store Upgrade Receipt Submitted",
    "body": "A merchant has submitted a payment receipt for their store upgrade."
  }
};

const frNotifications = {
  "PRODUCT_APPROVED": {
    "title": "🎉 Produit approuvé et publié ({{productName}})",
    "body": "Votre produit {{productName}} a été examiné et approuvé, il est maintenant accessible au public."
  },
  "PRODUCT_REJECTED": {
    "title": "⚠️ Action requise sur le produit ({{productName}})",
    "body": "Malheureusement, votre produit {{productName}} a été refusé. Raison: {{reason}}"
  },
  "VERIFICATION_APPROVED": {
    "title": "Vérification approuvée",
    "body": "Votre demande de vérification a été approuvée. Votre compte est maintenant actif."
  },
  "VERIFICATION_REJECTED": {
    "title": "Vérification refusée",
    "body": "Nous sommes désolés, votre demande de vérification a été refusée. Veuillez vérifier les détails pour corriger les erreurs."
  },
  "VERIFICATION_EDIT_REQUIRED": {
    "title": "Modification de vérification requise",
    "body": "Veuillez modifier certains détails dans votre demande de vérification. Remarque: {{reason}}"
  },
  "VERIFICATION_EXPIRED_ADMIN_ALERT": {
    "title": "Registre de commerce expiré",
    "body": "Le registre de commerce du magasin {{storeName}} a expiré."
  },
  "RECEIPT_AWAITING_APPROVAL": {
    "title": "Nouveau reçu de paiement en attente d'approbation 🧾",
    "body": "Le marchand {{merchantName}} a soumis un nouveau reçu de paiement en attente d'examen."
  },
  "RECEIPT_APPROVED": {
    "title": "Reçu de paiement approuvé ! 🎉",
    "body": "Votre reçu de paiement a été vérifié et confirmé avec succès. Merci !"
  },
  "SUBSCRIPTION_ACTIVATED": {
    "title": "Abonnement activé ! 🎉",
    "body": "Félicitations ! Votre abonnement au forfait {{planName}} a été activé avec succès."
  },
  "RECEIPT_REJECTED": {
    "title": "Reçu de paiement refusé ❌",
    "body": "Malheureusement, votre reçu de paiement n'a pas pu être vérifié. Veuillez vérifier et le télécharger à nouveau."
  },
  "SUBSCRIPTION_REQUEST": {
    "title": "Nouvelle demande d'abonnement 📦",
    "body": "Nouvelle demande d'abonnement pour le forfait {{planName}} en attente d'approbation."
  },
  "UPGRADE_REQUEST": {
    "title": "Nouvelle demande de mise à niveau 📦",
    "body": "Nouvelle demande de mise à niveau en attente d'approbation."
  },
  "ORDER_NEW": {
    "title": "Nouvelle commande ! 🛍️",
    "body": "Nouvelle commande #{{orderNumber}} d'une valeur de {{total}} DZD"
  },
  "ORDER_STATUS_CHANGED": {
    "title": "{{statusName}} 📦",
    "body": "Le statut de votre commande #{{orderNumber}} a été mis à jour vers: {{statusName}}"
  },
  "QA_NEW": {
    "title": "Nouvelle question en attente ! ❓",
    "body": "Vous avez une nouvelle question en attente sur votre produit \"{{productName}}\" qui attend votre réponse."
  },
  "PRODUCT_PENDING_APPROVAL": {
    "title": "⏳ Nouveau produit en attente d'approbation ({{productName}})",
    "body": "Un marchand a ajouté un nouveau produit qui attend votre examen et votre approbation."
  },
  "PRODUCT_UPDATED_PENDING_APPROVAL": {
    "title": "⏳ Produit mis à jour en attente d'approbation ({{productName}})",
    "body": "Un marchand a mis à jour un produit qui attend votre examen et votre approbation."
  },
  "UPGRADE_REQUEST_PAYMENT": {
    "title": "Reçu de mise à niveau du magasin soumis",
    "body": "Un marchand a soumis un reçu de paiement pour la mise à niveau de son magasin."
  }
};

const map = {
  ar: arNotifications,
  en: enNotifications,
  fr: frNotifications
};

for (const p of dictPaths) {
  const code = path.basename(p, '.json');
  const dict = JSON.parse(fs.readFileSync(p, 'utf8'));
  dict.notifications = map[code];
  fs.writeFileSync(p, JSON.stringify(dict, null, 2));
}

console.log("Updated dictionaries!");
