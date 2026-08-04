const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.docArticle.upsert({
    where: { slug: 'homepage-manager-guide' },
    update: {},
    create: {
      title: 'دليل شامل: كيفية تصميم وإدارة الصفحة الرئيسية',
      titleEn: 'Comprehensive Guide: Designing & Managing the Homepage',
      slug: 'homepage-manager-guide',
      content: `
# دليل شامل: كيفية تصميم وإدارة الصفحة الرئيسية

تم تحديث أداة إدارة الصفحة الرئيسية في منصتنا لتمنحك تحكماً كاملاً في مظهر ومحتوى واجهة متجرك بلمسات عصرية واحترافية. يمكنك الوصول إلى هذه الميزة من خلال التوجه إلى مسار: **الإعدادات > إعدادات الصفحة الرئيسية** في لوحة تحكم الإدارة.

## المميزات الجديدة التي تم إضافتها:

1. **التحكم في الألوان والخلفيات (bg vs bgGradient):**
   - أصبح بإمكانك الآن اختيار لون ثابت (Solid Color) أو تدرج لوني (Gradient) لخلفيات السلايدر الرئيسي.
   - يعطي النظام أولوية تلقائية لاختيارك دون تعارض، مما يضمن ظهور التصميم كما حددته تماماً.

2. **شبكة الميجا (Bento Grid) المحدثة:**
   - تم تطوير شكل شبكة "عروض ميجا" لتتوافق مع أحدث معايير التصميم العالمي (Bento UI).
   - تشمل تأثيرات مرور الماوس (Hover States)، إبراز الخصومات، والعدادات التنازلية (Countdown Timers).

3. **الترجمة الشاملة (i18n):**
   - جميع النصوص في الصفحة الرئيسية، مثل "عروض حصرية"، "عرض الكل"، و"خصومات لفترة محدودة"، أصبحت الآن مرتبطة بنظام الترجمة الشامل.
   - يتغير النص تلقائياً ليتوافق مع لغة المستخدم (العربية، الإنجليزية، أو الفرنسية).

4. **ترتيب الأقسام:**
   - يمكنك تغيير ترتيب الأقسام، إخفائها، أو إظهارها من خلال لوحة تحكم واحدة بسيطة.

## كيفية استخدام الأداة؟
ببساطة، انتقل إلى واجهة **إدارة الصفحة الرئيسية**، وقم بتفعيل الأقسام التي ترغب بعرضها، وعدّل محتواها من خلال النقر على أيقونة الإعدادات (الترس) بجانب كل قسم. عند الانتهاء، اضغط على حفظ أسفل الصفحة وستظهر التحديثات فوراً على المتجر.
      `,
      contentEn: `
# Comprehensive Guide: Designing & Managing the Homepage

Our homepage management tool has been completely revamped to give you full control over your storefront's appearance and content, featuring modern and professional touches. You can access this feature by navigating to: **Settings > Homepage Settings** in the admin dashboard.

## Newly Added Features:

1. **Backgrounds & Colors Control (bg vs bgGradient):**
   - You can now seamlessly choose between a solid color or a gradient background for the Hero Slider.
   - The system automatically resolves priorities, ensuring your design is displayed exactly as intended.

2. **Updated Bento Grid:**
   - The "Mega Offers" section has been redesigned to align with global design standards (Bento UI aesthetics).
   - It includes sophisticated hover states, highlighted discounts, and countdown timers.

3. **Comprehensive Translation (i18n):**
   - All texts on the homepage, such as "Exclusive Offers", "View All", and "Limited time discounts", are now integrated into the global translation system.
   - Content adapts automatically to the user's selected language (Arabic, English, or French).

4. **Section Reordering:**
   - You can reorder, hide, or show sections via a single, intuitive control panel.

## How to use it?
Simply navigate to the **Homepage Settings** interface, toggle the sections you want to display, and configure their content by clicking the settings gear icon next to each section. Once finished, click Save at the bottom of the page, and your updates will be live instantly.
      `,
      translations: {
        fr: {
          title: "Guide Complet : Conception et Gestion de la Page d'Accueil",
          content: "Notre outil de gestion de la page d'accueil a été mis à jour pour vous donner un contrôle total sur l'apparence et le contenu de votre vitrine. \n\nFonctionnalités : \n- Contrôle des arrière-plans (couleur unie ou dégradé).\n- Grille Bento mise à jour avec des effets de survol et des offres exclusives.\n- Traduction complète en français, anglais et arabe.\n- Réorganisation facile des sections.\n\nAllez dans Paramètres > Paramètres de la page d'accueil pour commencer."
        }
      },
      category: 'general',
      sortOrder: 1,
      isPublished: true,
    }
  });
  console.log('Document created!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
