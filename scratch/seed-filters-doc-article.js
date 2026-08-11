const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const article = await prisma.docArticle.upsert({
    where: { slug: 'advanced-sidebar-filters-guide' },
    update: {},
    create: {
      slug: 'advanced-sidebar-filters-guide',
      title: 'كيفية إنشاء وإدارة فلاتر البحث المتقدمة لمتجرك',
      titleEn: 'How to Create and Manage Advanced Search Filters for Your Store',
      content: `
# الفلاتر الجانبية المتقدمة (خصائص المنتجات)

الفلاتر الجانبية هي واحدة من أهم الميزات التي تساعد المتسوقين على العثور على منتجاتك بسرعة ودقة في صفحة البحث الشاملة للمنصة. بفضل هذه الميزة، يمكن لعملائك تصفية المنتجات بناءً على السعر، الماركة، وخصائص أخرى ديناميكية مثل (اللون، المقاس، مساحة التخزين، إلخ).

## كيف تعمل الفلاتر الديناميكية؟
يتم بناء الفلاتر الجانبية في منصتنا باستخدام نظام **الخصائص الذكية (Smart Specifications)**. هذا يعني أن الفلتر لا يظهر للمتسوق إلا إذا كان يتصفح تصنيفاً (Category) يرتبط به هذا الفلتر.

على سبيل المثال:
- فلتر **"مقاس الشاشة"** سيظهر فقط عند الدخول إلى قسم "الإلكترونيات".
- فلتر **"اللون"** أو **"نوع القماش"** سيظهر عند الدخول إلى قسم "الملابس".

## كيف تقوم بإضافة فلتر جديد لمتجرك؟
لإضافة فلتر يظهر للمتسوقين كصناديق اختيار (Checkboxes) في شريط البحث الجانبي، اتبع الخطوات التالية:

1. **انتقل إلى لوحة التحكم الخاصة بك**.
2. **اذهب إلى "إعدادات المنتجات" -> "خصائص المنتجات" (Spec Definitions)**.
3. اضغط على زر **إضافة خاصية جديدة**.
4. **الاسم**: اكتب اسم الخاصية (مثلاً: "سعة التخزين").
5. **النوع (Type)**: يجب أن تختار **"قائمة اختيار" (Select)**. 
   *(تحذير: الحقول النصية العادية Text لا يمكن تحويلها لفلاتر بحث)*.
6. **الخيارات (Options)**: أدخل القيم الممكنة التي يمكن للعميل الفلترة من خلالها (مثلاً: 64GB, 128GB, 256GB).
7. **التصنيف (Category)**:
   - قم بتحديد التصنيف الذي تريد أن تظهر فيه هذه الفلاتر (مثل "الهواتف الذكية").
   - إذا تركت هذا الحقل فارغاً (للكل)، سيظهر هذا الفلتر بشكل دائم في جميع أقسام البحث.
8. اضغط على **حفظ**.

بمجرد الحفظ، سيصبح هذا الفلتر متاحاً للعملاء للاستخدام، وسيُطلب منك (أو من التجار) اختيار القيم المناسبة عند إضافة منتجات جديدة!
      `,
      contentEn: `
# Advanced Sidebar Filters (Product Specifications)

Sidebar filters are one of the most important features that help shoppers find your products quickly and accurately on the global search page. With this feature, your customers can filter products based on price, brand, and other dynamic attributes like (Color, Size, Storage Space, etc.).

## How Do Dynamic Filters Work?
Sidebar filters on our platform are built using a **Smart Specifications** system. This means a filter only appears to the shopper if they are browsing a category associated with that filter.

For example:
- The **"Screen Size"** filter will only appear when entering the "Electronics" section.
- The **"Color"** or **"Fabric Type"** filter will appear when entering the "Clothing" section.

## How Do You Add a New Filter to Your Store?
To add a filter that appears to shoppers as checkboxes in the search sidebar, follow these steps:

1. **Go to your dashboard**.
2. **Navigate to "Product Settings" -> "Product Properties" (Spec Definitions)**.
3. Click the **Add New Specification** button.
4. **Name**: Enter the name of the property (e.g., "Storage Capacity").
5. **Type**: You MUST select **"Select List" (Select)**.
   *(Warning: Normal text fields cannot be converted into search filters)*.
6. **Options**: Enter the possible values that the customer can filter by (e.g., 64GB, 128GB, 256GB).
7. **Category**:
   - Select the category where you want these filters to appear (e.g., "Smartphones").
   - If you leave this field blank (Global), this filter will appear permanently in all search sections.
8. Click **Save**.

Once saved, this filter will become available for customers to use, and you (or merchants) will be prompted to select the appropriate values when adding new products!
      `,
      translations: {
        contentFr: `
# Filtres Avancés de la Barre Latérale (Spécifications des Produits)

Les filtres de la barre latérale sont l'une des fonctionnalités les plus importantes qui aident les acheteurs à trouver vos produits rapidement et avec précision sur la page de recherche globale. Avec cette fonctionnalité, vos clients peuvent filtrer les produits en fonction du prix, de la marque et d'autres attributs dynamiques tels que (Couleur, Taille, Espace de Stockage, etc.).

## Comment Fonctionnent les Filtres Dynamiques ?
Les filtres de la barre latérale sur notre plateforme sont construits en utilisant un système de **Spécifications Intelligentes**. Cela signifie qu'un filtre n'apparaît à l'acheteur que s'il parcourt une catégorie associée à ce filtre.

Par exemple :
- Le filtre **"Taille de l'Écran"** n'apparaîtra qu'en entrant dans la section "Électronique".
- Le filtre **"Couleur"** ou **"Type de Tissu"** apparaîtra en entrant dans la section "Vêtements".

## Comment Ajouter un Nouveau Filtre à Votre Boutique ?
Pour ajouter un filtre qui apparaît aux acheteurs sous forme de cases à cocher dans la barre latérale de recherche, suivez ces étapes :

1. **Allez sur votre tableau de bord**.
2. **Naviguez vers "Paramètres des Produits" -> "Propriétés des Produits" (Spec Definitions)**.
3. Cliquez sur le bouton **Ajouter une Nouvelle Spécification**.
4. **Nom** : Saisissez le nom de la propriété (ex : "Capacité de Stockage").
5. **Type** : Vous DEVEZ sélectionner **"Liste de Sélection" (Select)**.
   *(Avertissement : Les champs de texte normaux ne peuvent pas être convertis en filtres de recherche)*.
6. **Options** : Saisissez les valeurs possibles par lesquelles le client peut filtrer (ex : 64GB, 128GB, 256GB).
7. **Catégorie** :
   - Sélectionnez la catégorie où vous souhaitez que ces filtres apparaissent (ex : "Smartphones").
   - Si vous laissez ce champ vide (Global), ce filtre apparaîtra en permanence dans toutes les sections de recherche.
8. Cliquez sur **Enregistrer**.

Une fois enregistré, ce filtre deviendra disponible pour les clients, et il vous sera demandé (ainsi qu'aux marchands) de sélectionner les valeurs appropriées lors de l'ajout de nouveaux produits !
        `,
        titleFr: 'Comment Créer et Gérer les Filtres de Recherche Avancés pour Votre Boutique'
      },
      category: 'sellers',
      isPublished: true,
      sortOrder: 15,
    }
  });

  console.log('Seeded advanced sidebar filters doc article');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
