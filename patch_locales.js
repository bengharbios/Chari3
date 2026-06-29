const fs = require('fs');
const path = require('path');

const locales = ['ar', 'en', 'fr'];
const checkoutKeys = {
  ar: {
    "checkout": {
      "all_data_secured": "جميع البيانات مؤمنة",
      "free_shipping_offer": "شحن مجاني عرض خاص لك",
      "free_return": "إرجاع مجاني",
      "up_to_90_days": "لمدة تصل إلى ٩٠ يومًا",
      "sign_in_to_save": "سجِّل الدخول لحفظ عربة تسوقك في حسابك.",
      "email_or_phone": "البريد الإلكتروني أو رقم الهاتف",
      "password": "كلمة المرور",
      "continue": "المتابعة",
      "or_continue_with": "أو المتابعة بطرق أخرى",
      "login_securely_with_otp": "تسجيل الدخول باستخدام رمز OTP الآمن",
      "register_now": "ليس لديك حساب؟ أنشئ حسابك الآن",
      "terms_agreement": "بالمتابعة، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بـ ChariDay.",
      "logged_in": "تم تسجيل الدخول بنجاح!",
      "invalid_credentials": "بيانات الدخول غير صحيحة",
      "server_error": "حدث خطأ أثناء الاتصال بالخادم",
      "google_redirect": "سيتم توجيهك إلى Google..."
    }
  },
  en: {
    "checkout": {
      "all_data_secured": "All data is secured",
      "free_shipping_offer": "Free shipping special offer for you",
      "free_return": "Free Return",
      "up_to_90_days": "Up to 90 days",
      "sign_in_to_save": "Sign in to save your cart to your account.",
      "email_or_phone": "Email or Phone Number",
      "password": "Password",
      "continue": "Continue",
      "or_continue_with": "Or continue with",
      "login_securely_with_otp": "Login securely with OTP",
      "register_now": "Don't have an account? Register now",
      "terms_agreement": "By continuing, you agree to ChariDay's Terms of Use and Privacy Policy.",
      "logged_in": "Logged in successfully!",
      "invalid_credentials": "Invalid credentials",
      "server_error": "Server connection error",
      "google_redirect": "Redirecting to Google..."
    }
  },
  fr: {
    "checkout": {
      "all_data_secured": "Toutes les données sont sécurisées",
      "free_shipping_offer": "Livraison gratuite, offre spéciale pour vous",
      "free_return": "Retour gratuit",
      "up_to_90_days": "Jusqu'à 90 jours",
      "sign_in_to_save": "Connectez-vous pour enregistrer votre panier sur votre compte.",
      "email_or_phone": "E-mail ou numéro de téléphone",
      "password": "Mot de passe",
      "continue": "Continuer",
      "or_continue_with": "Ou continuer avec",
      "login_securely_with_otp": "Connectez-vous en toute sécurité avec OTP",
      "register_now": "Vous n'avez pas de compte ? Inscrivez-vous maintenant",
      "terms_agreement": "En continuant, vous acceptez les conditions d'utilisation et la politique de confidentialité de ChariDay.",
      "logged_in": "Connexion réussie !",
      "invalid_credentials": "Identifiants invalides",
      "server_error": "Erreur de connexion au serveur",
      "google_redirect": "Redirection vers Google..."
    }
  }
};

locales.forEach(lang => {
  const filePath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.common = { ...data.common, checkout: checkoutKeys[lang].checkout };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang}.json`);
  }
});
