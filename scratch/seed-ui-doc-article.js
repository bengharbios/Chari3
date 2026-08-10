const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const article = await prisma.docArticle.upsert({
    where: { slug: 'homepage-ui-improvements' },
    update: {
      title: 'تحديثات واجهة الصفحة الرئيسية (أيقونات التصنيفات والمظهر)',
      titleEn: 'Homepage UI Improvements (Category Icons & Styling)',
      content: `
# شرح تحديثات الصفحة الرئيسية الأخيرة

في هذا المقال نوضح الميزات الجديدة التي تمت إضافتها إلى منصة ChariDay بخصوص الصفحة الرئيسية وأقسامها:

## 1. تصميم أيقونات التصنيفات (Pro-Max Design)
تم تغيير التصميم الكلاسيكي للأيقونات إلى تصميم زجاجي عصري (Glassmorphism) مع تأثيرات حركية (Micro-animations) وتدرجات لونية. التصميم يتجاوب بشكل كامل مع الوضع الليلي (Dark Mode).

## 2. نظام التعويض التلقائي للأيقونات (Auto-Fallback)
إذا قام البائع أو الإدارة بإدخال نص عادي مثل \`trophy\` أو \`sparkles\` بدلاً من رمز تعبيري حقيقي، سيقوم النظام الآن تلقائياً بتحويله إلى الرمز المناسب (🏆 أو ✨) لضمان عدم ظهور نصوص غريبة للمستخدم.

## 3. التصفح في الشاشات الكبيرة (Desktop Navigation)
تمت إضافة أزرار تنقل (أسهم يمين ويسار) تظهر عند تمرير الماوس فوق شريط التصنيفات في الشاشات الكبيرة، مما يحل مشكلة عدم القدرة على سحب التصنيفات بالماوس.

## 4. الفلترة المتقدمة عبر صفحة مستقلة (Global Search Routing)
عند النقر على أي تصنيف من الصفحة الرئيسية، يتم الآن توجيه المستخدم مباشرة إلى صفحة البحث المتقدمة (\`/search?categoryId=...\`) بدلاً من الفلترة المحلية فقط. هذا يتيح للمستخدم فلترة المنتجات حسب المقاس، السعر، والخصائص الأخرى كما هو متبع في المتاجر الكبرى.

## 5. توافق مسافات الأقسام (Styling & Visibility)
تم إصلاح مشكلة عدم استجابة خيارات المسافات (Padding). الآن عند اختيار "بدون مسافة (0px)" من لوحة التحكم، سيتم فرض هذا الخيار وإلغاء أي مسافات افتراضية في الكود باستخدام تقنيات Tailwind المتقدمة (\`[&>section]:!pt-0\`).

## 6. الترجمات التلقائية للعناوين (Auto-Translations)
تمت إضافة مفاتيح ترجمة احتياطية للأسماء التقنية. فإذا تُرك حقل عنوان القسم فارغاً، لن يظهر الاسم التقني \`categories\` بل ستظهر الترجمة المناسبة "أيقونات التصنيفات" بفضل المترجم المدمج.
      `,
      contentEn: `
# Explanation of Recent Homepage Updates

In this article, we explain the new features added to the ChariDay platform regarding the homepage and its sections:

## 1. Category Icons Design (Pro-Max Design)
The classic icon design has been changed to a modern glassmorphism design with micro-animations and color gradients. The design fully adapts to Dark Mode.

## 2. Auto-Fallback System for Icons
If a seller or admin enters plain text like \`trophy\` or \`sparkles\` instead of a real emoji, the system will now automatically convert it to the appropriate symbol (🏆 or ✨) to ensure no strange text appears to the user.

## 3. Desktop Navigation
Navigation buttons (left and right arrows) have been added that appear when hovering over the categories bar on large screens, solving the issue of not being able to drag categories with the mouse.

## 4. Advanced Filtering via Global Search Routing
When clicking on any category from the homepage, the user is now redirected directly to the advanced search page (\`/search?categoryId=...\`) instead of just local filtering. This allows the user to filter products by size, price, and other attributes as standard in major stores.

## 5. Section Spacing Compatibility (Styling & Visibility)
The issue with non-responsive padding options has been fixed. Now, when selecting "No Padding (0px)" from the dashboard, this option will be enforced and any default padding in the code will be overridden using advanced Tailwind techniques (\`[&>section]:!pt-0\`).

## 6. Auto-Translations for Titles
Fallback translation keys have been added for technical names. If a section title field is left empty, the technical name \`categories\` will no longer appear; instead, the appropriate translation "Categories Icons" will appear thanks to the built-in translator.
      `,
      category: 'general',
      isPublished: true,
      translations: {
        fr: {
          title: "Améliorations de l'interface d'accueil (Icônes et style)",
          content: "Explication des mises à jour récentes..."
        }
      }
    },
    create: {
      title: 'تحديثات واجهة الصفحة الرئيسية (أيقونات التصنيفات والمظهر)',
      titleEn: 'Homepage UI Improvements (Category Icons & Styling)',
      slug: 'homepage-ui-improvements',
      content: `
# شرح تحديثات الصفحة الرئيسية الأخيرة

في هذا المقال نوضح الميزات الجديدة التي تمت إضافتها إلى منصة ChariDay بخصوص الصفحة الرئيسية وأقسامها:

## 1. تصميم أيقونات التصنيفات (Pro-Max Design)
تم تغيير التصميم الكلاسيكي للأيقونات إلى تصميم زجاجي عصري (Glassmorphism) مع تأثيرات حركية (Micro-animations) وتدرجات لونية. التصميم يتجاوب بشكل كامل مع الوضع الليلي (Dark Mode).

## 2. نظام التعويض التلقائي للأيقونات (Auto-Fallback)
إذا قام البائع أو الإدارة بإدخال نص عادي مثل \`trophy\` أو \`sparkles\` بدلاً من رمز تعبيري حقيقي، سيقوم النظام الآن تلقائياً بتحويله إلى الرمز المناسب (🏆 أو ✨) لضمان عدم ظهور نصوص غريبة للمستخدم.

## 3. التصفح في الشاشات الكبيرة (Desktop Navigation)
تمت إضافة أزرار تنقل (أسهم يمين ويسار) تظهر عند تمرير الماوس فوق شريط التصنيفات في الشاشات الكبيرة، مما يحل مشكلة عدم القدرة على سحب التصنيفات بالماوس.

## 4. الفلترة المتقدمة عبر صفحة مستقلة (Global Search Routing)
عند النقر على أي تصنيف من الصفحة الرئيسية، يتم الآن توجيه المستخدم مباشرة إلى صفحة البحث المتقدمة (\`/search?categoryId=...\`) بدلاً من الفلترة المحلية فقط. هذا يتيح للمستخدم فلترة المنتجات حسب المقاس، السعر، والخصائص الأخرى كما هو متبع في المتاجر الكبرى.

## 5. توافق مسافات الأقسام (Styling & Visibility)
تم إصلاح مشكلة عدم استجابة خيارات المسافات (Padding). الآن عند اختيار "بدون مسافة (0px)" من لوحة التحكم، سيتم فرض هذا الخيار وإلغاء أي مسافات افتراضية في الكود باستخدام تقنيات Tailwind المتقدمة (\`[&>section]:!pt-0\`).

## 6. الترجمات التلقائية للعناوين (Auto-Translations)
تمت إضافة مفاتيح ترجمة احتياطية للأسماء التقنية. فإذا تُرك حقل عنوان القسم فارغاً، لن يظهر الاسم التقني \`categories\` بل ستظهر الترجمة المناسبة "أيقونات التصنيفات" بفضل المترجم المدمج.
      `,
      contentEn: `
# Explanation of Recent Homepage Updates

In this article, we explain the new features added to the ChariDay platform regarding the homepage and its sections:

## 1. Category Icons Design (Pro-Max Design)
The classic icon design has been changed to a modern glassmorphism design with micro-animations and color gradients. The design fully adapts to Dark Mode.

## 2. Auto-Fallback System for Icons
If a seller or admin enters plain text like \`trophy\` or \`sparkles\` instead of a real emoji, the system will now automatically convert it to the appropriate symbol (🏆 or ✨) to ensure no strange text appears to the user.

## 3. Desktop Navigation
Navigation buttons (left and right arrows) have been added that appear when hovering over the categories bar on large screens, solving the issue of not being able to drag categories with the mouse.

## 4. Advanced Filtering via Global Search Routing
When clicking on any category from the homepage, the user is now redirected directly to the advanced search page (\`/search?categoryId=...\`) instead of just local filtering. This allows the user to filter products by size, price, and other attributes as standard in major stores.

## 5. Section Spacing Compatibility (Styling & Visibility)
The issue with non-responsive padding options has been fixed. Now, when selecting "No Padding (0px)" from the dashboard, this option will be enforced and any default padding in the code will be overridden using advanced Tailwind techniques (\`[&>section]:!pt-0\`).

## 6. Auto-Translations for Titles
Fallback translation keys have been added for technical names. If a section title field is left empty, the technical name \`categories\` will no longer appear; instead, the appropriate translation "Categories Icons" will appear thanks to the built-in translator.
      `,
      category: 'general',
      isPublished: true,
      translations: {
        fr: {
          title: "Améliorations de l'interface d'accueil (Icônes et style)",
          content: "Explication des mises à jour récentes..."
        }
      }
    }
  });
  console.log('Successfully seeded article:', article.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
