const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const newConfig = {
    alignment: 'start',
    fontFamily: 'var(--font-cairo)',
    items: [
      {
        id: 'home',
        type: 'standard',
        labels: { ar: 'الصفحة الرئيسية', en: 'Home', fr: 'Accueil' },
        url: '/',
        children: []
      },
      {
        id: 'electronics',
        type: 'direct-category',
        categoryId: '203f0252-3cae-44ca-a5d9-83d144b3ecca',
        labels: { ar: 'الإلكترونيات الذكية', en: 'Smart Electronics' },
        url: '#',
        children: [] // Will be auto-populated
      },
      {
        id: 'fashion',
        type: 'direct-category',
        categoryId: 'cmp9wj2v5000041dj131gc133',
        labels: { ar: 'الأزياء والموضة', en: 'Fashion' },
        url: '#',
        children: [] // Will be auto-populated
      },
      {
        id: 'home-decor',
        type: 'direct-category',
        categoryId: 'cmp9wj2v7000141djh3ktfwzo',
        labels: { ar: 'المنزل والديكور', en: 'Home & Decor' },
        url: '#',
        children: [] // Will be auto-populated
      },
      {
        id: 'health-beauty',
        type: 'direct-category',
        categoryId: 'cmsvsh3ko0029uhwoe5akkoh3',
        labels: { ar: 'الصحة والجمال', en: 'Health & Beauty' },
        url: '#',
        children: [] // Will be auto-populated
      },
      {
        id: 'deals',
        type: 'standard',
        labels: { ar: 'عروض كبرى 🔥', en: 'Super Deals 🔥', fr: 'Super offres 🔥' },
        url: '/deals',
        children: []
      }
    ]
  };

  await prisma.platformSettings.update({
    where: { id: 'global' },
    data: { publicMenuConfig: JSON.stringify(newConfig) }
  });
  console.log('Menu updated!');
}
main().finally(() => prisma.$disconnect());
