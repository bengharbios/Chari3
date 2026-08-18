const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allCategories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, parentId: true, name: true, nameEn: true, slug: true, image: true, icon: true, translations: true },
    orderBy: { sortOrder: 'asc' }
  });

  const buildCategoryTree = (parentId) => {
    const subs = allCategories.filter(s => s.parentId === parentId);
    return subs.map(sub => {
      const labels = { ar: sub.name, en: sub.nameEn || sub.name };
      if (sub.translations && typeof sub.translations === 'object') {
        Object.assign(labels, sub.translations);
      }
      return {
        id: sub.id,
        type: 'standard',
        labels,
        children: buildCategoryTree(sub.id)
      };
    });
  };

  const fashionId = 'cmp9wj2v5000041dj131gc133';
  const tree = buildCategoryTree(fashionId);
  console.log(JSON.stringify(tree, null, 2));
}

main().finally(() => prisma.$disconnect());
