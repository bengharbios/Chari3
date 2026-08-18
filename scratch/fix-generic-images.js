const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const images = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
  ];
  const cats = await p.category.findMany();
  let updatedCount = 0;
  for(let i=0; i<cats.length; i++) {
    if(cats[i].image && cats[i].image.includes('unsplash.com')) {
      await p.category.update({
        where: { id: cats[i].id },
        data: { image: images[i % images.length] }
      });
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} generic images to be varied.`);
}
main().finally(() => p.$disconnect());
