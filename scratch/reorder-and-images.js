const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fallbackImages = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'
];

async function main() {
  console.log('1. Nesting fashion categories under أزياء وملابس...');
  const fashionParent = await prisma.category.findFirst({ where: { name: 'أزياء وملابس' } });
  
  if (fashionParent) {
    const toNest = ['ملابس نسائية', 'ملابس رجالية', 'الأطفال والرضع', 'الأحذية'];
    for (const name of toNest) {
      const child = await prisma.category.findFirst({ where: { name } });
      if (child) {
        await prisma.category.update({
          where: { id: child.id },
          data: { parentId: fashionParent.id }
        });
        console.log(`Nested ${name} under Fashion.`);
      }
    }
  }

  console.log('\n2. Reordering Root Categories logically...');
  const order = [
    'أزياء وملابس',
    'الإلكترونيات',
    'المنزل والمطبخ',
    'المجوهرات والإكسسوارات',
    'الجمال والصحة',
    'الرياضة والأنشطة',
    'الأجهزة المنزلية',
    'السيارات',
    'الدمى والألعاب',
    'الحقائب وأمتعة السفر',
    'الأعمال والصناعة',
    'المتميز'
  ];

  for (let i = 0; i < order.length; i++) {
    const cat = await prisma.category.findFirst({ where: { name: order[i] } });
    if (cat) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { sortOrder: i * 10 }
      });
      console.log(`Reordered ${order[i]} to index ${i}`);
    }
  }

  // Set all other root categories to a higher sort order so they appear at the bottom
  const otherRoots = await prisma.category.findMany({ 
    where: { parentId: null, name: { notIn: order } } 
  });
  let sortIndex = order.length * 10 + 10;
  for (const cat of otherRoots) {
    await prisma.category.update({
      where: { id: cat.id },
      data: { sortOrder: sortIndex }
    });
    sortIndex += 10;
  }

  console.log('\n3. Assigning placeholder images to categories without images...');
  const noImageCats = await prisma.category.findMany({ where: { image: null } });
  console.log(`Found ${noImageCats.length} categories without images.`);
  
  for (let i = 0; i < noImageCats.length; i++) {
    const randomImage = fallbackImages[i % fallbackImages.length];
    await prisma.category.update({
      where: { id: noImageCats[i].id },
      data: { image: randomImage }
    });
  }
  console.log(`Assigned generic placeholder images to ${noImageCats.length} categories.`);
  
  console.log('\nDone!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
