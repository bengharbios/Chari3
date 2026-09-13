const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/lib/i18n/dictionaries');

const translations = {
  ar: {
    next: 'التالي',
    previous: 'السابق',
    done: 'إنهاء',
    skip: 'تخطي',
    restart_tour: 'إعادة الجولة التعريفية',
    welcome_title: 'مرحباً بك في لوحة تحكم ChariDay! 🎉',
    welcome_desc: 'نحن سعداء بانضمامك كتاجر. دعنا نأخذك في جولة سريعة للتعرف على أهم أقسام لوحة التحكم لتتمكن من إطلاق متجرك بنجاح.',
    verify_title: 'توثيق الحساب',
    verify_desc: 'هنا يمكنك متابعة حالة توثيق حسابك. التوثيق ضروري لتتمكن من استلام أرباحك وتفعيل متجرك بشكل كامل.',
    products_title: 'إدارة المنتجات',
    products_desc: 'من هذا القسم يمكنك إضافة منتجاتك وتعديلها ومتابعة المخزون بكل سهولة.',
    settings_title: 'إعدادات المتجر',
    settings_desc: 'هنا يمكنك ضبط إعدادات متجرك، خيارات الشحن، وسياسات الإرجاع الخاصة بك.'
  },
  en: {
    next: 'Next',
    previous: 'Previous',
    done: 'Done',
    skip: 'Skip',
    restart_tour: 'Restart Guided Tour',
    welcome_title: 'Welcome to ChariDay Dashboard! 🎉',
    welcome_desc: 'We are thrilled to have you as a seller. Let us take you on a quick tour to familiarize yourself with the dashboard so you can launch your store successfully.',
    verify_title: 'Account Verification',
    verify_desc: 'Here you can track your account verification status. Verification is required to receive payouts and fully activate your store.',
    products_title: 'Product Management',
    products_desc: 'From this section, you can add, edit, and track your products and inventory easily.',
    settings_title: 'Store Settings',
    settings_desc: 'Here you can configure your store settings, shipping options, and return policies.'
  },
  fr: {
    next: 'Suivant',
    previous: 'Précédent',
    done: 'Terminé',
    skip: 'Passer',
    restart_tour: 'Redémarrer la visite guidée',
    welcome_title: 'Bienvenue sur le tableau de bord ChariDay ! 🎉',
    welcome_desc: 'Nous sommes ravis de vous compter parmi nos vendeurs. Faisons un tour rapide pour vous familiariser avec le tableau de bord afin que vous puissiez lancer votre boutique avec succès.',
    verify_title: 'Vérification du compte',
    verify_desc: 'Ici, vous pouvez suivre l\'état de vérification de votre compte. La vérification est nécessaire pour recevoir vos paiements et activer pleinement votre boutique.',
    products_title: 'Gestion des produits',
    products_desc: 'Depuis cette section, vous pouvez facilement ajouter, modifier et suivre vos produits et votre inventaire.',
    settings_title: 'Paramètres de la boutique',
    settings_desc: 'Ici, vous pouvez configurer les paramètres de votre boutique, les options de livraison et les politiques de retour.'
  }
};

['ar', 'en', 'fr'].forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.tour = translations[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang}.json successfully.`);
  }
});
