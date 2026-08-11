import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDbConnection();

    // Delete if already exists
    await db.docArticle.deleteMany({
      where: { slug: 'global-navigation-menu-guide' }
    });

    const arabicContent = `
# إدارة القائمة الرئيسية (Global Navigation Menu)

تتيح لك المنصة التحكم الكامل في شريط التنقل الرئيسي (القائمة العلوية) الذي يظهر لجميع الزوار في الواجهة العامة (سواء من الكمبيوتر أو الجوال). 

## 1. كيفية إضافة قوائم وروابط
1. اذهب إلى **الإعدادات > إعدادات القائمة الرئيسية**.
2. اضغط على زر **إضافة قائمة رئيسية جديدة**.
3. أدخل **اسم الرابط** باللغة العربية (مثلاً: "الإلكترونيات") وأدخل **الرابط الموجه إليه** (مثلاً: \`/category/electronics\`).
4. (اختياري) يمكنك إضافة روابط فرعية تحت هذا الرابط بالضغط على **إضافة فرع**. ستظهر القائمة المنسدلة للزوار عند تمرير الماوس عليها.
5. يمكنك ترتيب القوائم عن طريق سحبها وإفلاتها.
6. اضغط على **حفظ التغييرات**.

## 2. كيفية الترجمة للغات أخرى (الإنجليزية، الفرنسية...)
نظامنا يعتمد على "الترجمة الذكية". عند إضافة قائمة باللغة العربية، سيتم عرضها بالعربية لجميع الزوار.
إذا كنت تريد أن تتغير هذه القائمة إلى اللغة الإنجليزية عندما يغير الزائر اللغة:
1. اذهب إلى قسم **اللغات والترجمة** في لوحة الإدارة.
2. ابحث عن الكلمة التي كتبتها بالضبط في القائمة (مثلاً: "الإلكترونيات").
3. أضف الكلمة الإنجليزية المقابلة لها (Electronics).
4. احفظ التغييرات.

الآن سيقوم النظام أوتوماتيكياً بتحويل اسم القائمة حسب لغة الزائر دون الحاجة لبرمجة إضافية!
  `;

    const englishContent = `
# Managing the Global Navigation Menu

The platform allows you full control over the main navigation bar (Header Menu) that appears to all visitors on the public storefront (Desktop and Mobile).

## 1. How to Add Menus and Links
1. Go to **Settings > Main Menu Management**.
2. Click on **Add New Main Menu**.
3. Enter the **Link Name** in Arabic (e.g., "الإلكترونيات") and enter the **Destination URL** (e.g., \`/category/electronics\`).
4. (Optional) You can add sub-links under this link by clicking **Add Child**. A dropdown menu will appear for visitors when they hover over it.
5. You can reorder menus by dragging and dropping them.
6. Click **Save Changes**.

## 2. How to Translate to Other Languages
Our system relies on "Smart Translation". When you add a menu item in Arabic, it is used as the base translation key.
To make this menu change to English when the visitor changes their language:
1. Go to the **Languages & Translation** section in the Admin Panel.
2. Search for the exact Arabic word you entered (e.g., "الإلكترونيات").
3. Add the corresponding English word (Electronics).
4. Save the changes.

Now the system will automatically translate the menu name based on the visitor's language without requiring any extra code!
  `;

    const frenchContent = `
# Gestion du Menu de Navigation Principal

La plateforme vous permet un contrôle total sur la barre de navigation principale (Menu d'en-tête) qui s'affiche pour tous les visiteurs (Ordinateur et Mobile).

## 1. Comment ajouter des menus et des liens
1. Allez dans **Paramètres > Gestion du Menu Principal**.
2. Cliquez sur **Ajouter un Nouveau Menu Principal**.
3. Saisissez le **Nom du lien** en arabe (ex: "الإلكترونيات") et saisissez l'**URL de destination** (ex: \`/category/electronics\`).
4. (Facultatif) Vous pouvez ajouter des sous-liens sous ce lien en cliquant sur **Ajouter un sous-élément**. Un menu déroulant apparaîtra pour les visiteurs lorsqu'ils le survoleront.
5. Vous pouvez réorganiser les menus par glisser-déposer.
6. Cliquez sur **Enregistrer les modifications**.

## 2. Comment traduire dans d'autres langues
Notre système repose sur la "Traduction Intelligente". Lorsque vous ajoutez un élément de menu en arabe, il est utilisé comme clé de traduction de base.
Pour que ce menu passe en anglais ou en français lorsque le visiteur change de langue :
1. Allez dans la section **Langues et Traduction** du panneau d'administration.
2. Recherchez le mot arabe exact que vous avez saisi (ex: "الإلكترونيات").
3. Ajoutez le mot français correspondant (Électronique).
4. Enregistrez les modifications.

Maintenant, le système traduira automatiquement le nom du menu en fonction de la langue du visiteur sans nécessiter de code supplémentaire !
  `;

    await db.docArticle.create({
      data: {
        title: "دليل إدارة القائمة الرئيسية والترجمة",
        slug: "global-navigation-menu-guide",
        content: arabicContent,
        translations: {
          en: {
            title: 'Main Menu & Translation Guide',
            content: englishContent
          },
          fr: {
            title: 'Guide du menu principal et de traduction',
            content: frenchContent
          }
        },
        isPublished: true
      }
    });

    return NextResponse.json({ success: true, message: 'DocArticle seeded successfully on production!' });
  } catch (error) {
    console.error('Failed to seed menu doc article:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
