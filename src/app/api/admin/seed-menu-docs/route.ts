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
# دليل استخدام القائمة الرئيسية المتقدمة (Mega Menu)

لقد تم ترقية نظام القائمة ليصبح نظاماً متطوراً (Mega Menu) ينافس التطبيقات العالمية مثل Temu و Noon! يمكنك الآن التحكم بتصميم القائمة، أنواع الخطوط، وإضافة قوائم ضخمة تعرض جميع التصنيفات أو اللافتات الإعلانية.

## 1. الإعدادات العامة للتصميم (Global Settings)
في أعلى صفحة **الإعدادات > إعدادات القائمة الرئيسية**، ستجد قسم الإعدادات العامة:
- **المحاذاة:** يمكنك اختيار توسيط القائمة (Center)، أو جعلها في البداية (Start) أو في النهاية (End).
- **نوع الخط:** يمكنك تغيير خط القائمة والاختيار بين خطوط عصرية مثل (Cairo, Tajawal, Inter).

## 2. أنواع عناصر القائمة (Item Types)
عند إضافة رابط جديد للقائمة، يمكنك اختيار "نوع العنصر" ليعطيك ميزات مختلفة:
1. **رابط عادي (Standard):**
   - يعمل كرابط عادي أو قائمة منسدلة بسيطة للروابط الفرعية.
2. **شبكة التصنيفات التلقائية (Categories Grid):**
   - هذا هو الخيار الأقوى! عند اختياره، سيقوم النظام **تلقائياً** بجلب جميع تصنيفات متجرك وصورها وعرضها في شبكة ضخمة (Grid) بمجرد تمرير الماوس، تماماً مثل Temu.
   - *ملاحظة: الترجمة تتم تلقائياً من قاعدة البيانات.*
3. **قائمة ضخمة مخصصة (Custom Mega Menu):**
   - يتيح لك بناء قائمة ضخمة متعددة الأعمدة وإضافة روابط فرعية.
   - **اللافتة الإعلانية:** يمكنك إرفاق رابط صورة إعلانية (Banner) لتظهر بجانب الروابط لتعطي مظهراً احترافياً مثل موقع Noon.

## 3. كيفية الترجمة للغات أخرى
نظامنا يعتمد على "الترجمة الذكية". عند كتابة اسم الرابط بالعربية:
1. اذهب إلى قسم **اللغات والترجمة** في لوحة الإدارة.
2. ابحث عن الكلمة التي كتبتها في القائمة.
3. أضف الكلمة الإنجليزية المقابلة لها.
4. بالنسبة لـ "شبكة التصنيفات"، تتم الترجمة بناءً على الكلمات الموجودة في قاعدة البيانات وتمرر للقاموس برمجياً.
  `;

    const englishContent = `
# Advanced Mega Menu Usage Guide

The menu system has been upgraded to an advanced Mega Menu system, competing with global apps like Temu and Noon! You can now control the design, fonts, and add massive grids displaying all categories or promotional banners.

## 1. Global Design Settings
At the top of **Settings > Main Menu Management**, you will find the global settings:
- **Alignment:** You can choose to Center the menu, or align it to the Start or End.
- **Font Family:** Change the menu font by choosing modern fonts like Cairo, Tajawal, or Inter.

## 2. Menu Item Types
When adding a new menu link, you can choose the "Item Type":
1. **Standard Link:**
   - Works as a normal link or a simple dropdown for sub-links.
2. **Auto Categories Grid:**
   - The most powerful option! It **automatically** fetches all your store categories and their images, displaying them in a massive grid on hover (just like Temu).
   - *Note: Translation is handled automatically from the database.*
3. **Custom Mega Menu:**
   - Allows you to build a massive multi-column menu and add sub-links.
   - **Promo Banner:** You can attach an image URL to show a banner next to the links for a professional look like Noon.

## 3. How to Translate to Other Languages
Our system uses "Smart Translation":
1. Go to **Languages & Translation** in the Admin Panel.
2. Search for the exact word you entered in the menu.
3. Add the corresponding English/French word.
4. For the "Categories Grid", translation is done automatically based on the database terms passed to the dictionary.
  `;

    const frenchContent = `
# Guide d'utilisation du Mega Menu Avancé

Le système de menu a été mis à niveau vers un système de Mega Menu avancé (comme Temu et Noon). Vous pouvez désormais contrôler le design, les polices et ajouter des grilles massives affichant toutes les catégories ou des bannières promotionnelles.

## 1. Paramètres de conception globale
Dans **Paramètres > Gestion du Menu Principal**, vous trouverez :
- **Alignement :** Centrer le menu, ou l'aligner au début ou à la fin.
- **Police :** Changer la police du menu (Cairo, Tajawal, Inter).

## 2. Types d'éléments de menu
Lors de l'ajout d'un nouveau lien, vous pouvez choisir le type :
1. **Lien standard :**
   - Fonctionne comme un lien normal ou une simple liste déroulante.
2. **Grille de catégories automatique (Mega Menu) :**
   - Récupère **automatiquement** toutes les catégories de votre boutique et leurs images dans une grande grille.
3. **Mega Menu personnalisé :**
   - Vous permet de créer un grand menu à plusieurs colonnes avec une **bannière promotionnelle** (Image).

## 3. Comment traduire
Notre système utilise la "Traduction Intelligente" :
1. Allez dans **Langues et Traduction**.
2. Recherchez le mot exact.
3. Ajoutez le mot français correspondant.
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
