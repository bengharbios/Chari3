const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fetch all top level categories
  const topCategories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  const items = [
    {
      id: 'home',
      type: 'standard',
      labels: { ar: 'الصفحة الرئيسية', en: 'Home', fr: 'Accueil' },
      url: '/',
      children: []
    },
    {
      id: 'all-categories',
      type: 'categories-grid',
      labels: { ar: 'جميع التصنيفات', en: 'All Categories', fr: 'Toutes les catégories' },
      url: '#',
      children: []
    }
  ];

  for (const cat of topCategories) {
    const labels = { ar: cat.name, en: cat.nameEn || cat.name };
    if (cat.translations && typeof cat.translations === 'object') {
       Object.assign(labels, cat.translations);
    }
    
    items.push({
      id: cat.id,
      type: 'direct-category',
      categoryId: cat.id,
      labels,
      url: '#',
      children: [] // Will be recursively populated by the new API route!
    });
  }

  items.push({
    id: 'deals',
    type: 'standard',
    labels: { ar: 'عروض كبرى 🔥', en: 'Super Deals 🔥', fr: 'Super offres 🔥' },
    url: '/deals',
    children: []
  });

  const newConfig = {
    alignment: 'start',
    fontFamily: 'var(--font-cairo)',
    items
  };

  await prisma.platformSettings.update({
    where: { id: 'global' },
    data: { publicMenuConfig: JSON.stringify(newConfig) }
  });
  console.log(`Menu updated with ${topCategories.length} categories!`);
}

main().finally(() => prisma.$disconnect());
