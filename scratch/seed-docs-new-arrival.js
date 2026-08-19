const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const translations = {
    fr: {
      title: "Badge de Nouvel Arrivage Basé sur le Temps",
      content: "<p>Le badge <b>Nouvel Arrivage</b> est affiché sur les produits récemment ajoutés.</p><h3>Comment ça marche ?</h3><p>Si l'âge d'un produit (en jours) est inférieur ou égal au seuil défini dans les paramètres de la plateforme, le badge s'affichera à la place des étoiles vides.</p><h3>Personnalisation</h3><p>Vous pouvez modifier le texte du badge en modifiant la clé <code>storefront.product.new_arrival</code> dans le gestionnaire de traductions.</p>"
    },
    // Future languages can be added here or via admin panel. The JSON structure supports any language code.
  };

  const articleData = {
    title: "الشارة الزمنية للمنتجات الجديدة (وصل حديثاً)",
    titleEn: "Time-Based New Arrival Badge",
    slug: "time-based-new-arrival-badge",
    content: "<p>شارة <b>وصل حديثاً</b> هي ميزة تسويقية تظهر على المنتجات التي تمت إضافتها مؤخراً للمتجر.</p><h3>كيف تعمل الميزة؟</h3><p>إذا كان عمر المنتج (بالأيام) أقل من أو يساوي الحد الأقصى المحدد في إعدادات المنصة، ستظهر الشارة بدلاً من النجوم الفارغة. بمجرد أن يتخطى المنتج هذا العمر، تختفي الشارة وتظهر التقييمات الفعلية (حتى لو كانت فارغة).</p><h3>تخصيص النص</h3><p>لا يتم تغيير نص الشارة من الإعدادات العامة، بل من <b>نظام الترجمات</b>. ابحث عن المفتاح <code>storefront.product.new_arrival</code> وقم بتغييره لأي نص تريده (مثل 'حصرياً' أو 'جديد المتجر') بجميع اللغات المتاحة.</p>",
    contentEn: "<p>The <b>New Arrival</b> badge is a marketing feature displayed on recently added products.</p><h3>How it works</h3><p>If a product's age (in days) is less than or equal to the threshold set in the platform settings, the badge will appear instead of empty stars. Once the product exceeds this age, the badge disappears and actual ratings (even if empty) are shown.</p><h3>Customizing the Text</h3><p>You can change the badge text via the <b>Translations Manager</b>. Search for the key <code>storefront.product.new_arrival</code> and change it to whatever you want (e.g., 'Exclusive') across all available languages.</p>",
    translations: JSON.stringify(translations),
    category: "general",
    sortOrder: 10,
    isPublished: true,
  };

  const existing = await prisma.docArticle.findUnique({
    where: { slug: articleData.slug }
  });

  if (existing) {
    await prisma.docArticle.update({
      where: { slug: articleData.slug },
      data: articleData,
    });
    console.log('Updated existing article.');
  } else {
    await prisma.docArticle.create({
      data: articleData,
    });
    console.log('Created new article.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
