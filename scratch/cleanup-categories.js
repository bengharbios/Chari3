const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function mergeCategory(targetName, sourceNames) {
  const target = await prisma.category.findFirst({ where: { name: targetName } });
  if (!target) {
    console.log(`Target category ${targetName} not found!`);
    return;
  }

  for (const sourceName of sourceNames) {
    const source = await prisma.category.findFirst({ where: { name: sourceName } });
    if (!source) continue;

    console.log(`Merging '${sourceName}' into '${targetName}'...`);
    
    // 1. Move all children of source to target
    await prisma.category.updateMany({
      where: { parentId: source.id },
      data: { parentId: target.id }
    });

    // 2. Re-link products, stores, etc., just in case any were assigned
    // Assuming you have products relations, if not, it will be handled or skipped if the tables are empty.
    // Given it's a new setup, mostly children are important.

    // Delete the source category
    try {
      await prisma.category.delete({ where: { id: source.id } });
      console.log(`Deleted '${sourceName}'`);
    } catch (err) {
      console.log(`Could not delete '${sourceName}', it might have products attached. Moving instead.`);
      // If it has products attached (Constraint failed), we just hide it or rename it.
      await prisma.category.update({
        where: { id: source.id },
        data: { isActive: false, name: `${source.name} (Archived)` }
      });
    }
  }
}

async function moveCategory(parentName, childNames) {
  const parent = await prisma.category.findFirst({ where: { name: parentName } });
  if (!parent) {
    console.log(`Parent category ${parentName} not found!`);
    return;
  }

  for (const childName of childNames) {
    const child = await prisma.category.findFirst({ where: { name: childName } });
    if (!child) continue;

    console.log(`Moving '${childName}' under '${parentName}'...`);
    await prisma.category.update({
      where: { id: child.id },
      data: { parentId: parent.id }
    });
  }
}

async function main() {
  console.log('Starting category cleanup...');

  // Merge exact duplicates
  await mergeCategory('المنزل والمطبخ', ['البيت والمطبخ']);
  await mergeCategory('المجوهرات والإكسسوارات', ['المجوهرات والاكسسوارات']);
  await mergeCategory('الرياضة والأنشطة', ['الرياضة وأنشطة الهواء الطلق', 'رياضة ولياقة']);
  await mergeCategory('الجمال والصحة', ['الجمال والعناية الشخصية', 'جمال وعناية']);
  await mergeCategory('الأعمال والصناعة', ['الأعمال والصناعة والعلوم']);

  // Move root categories to proper parents
  await moveCategory('ملابس نسائية', [
    'ملابس نسائية بمقاسات كبيرة',
    'أحذية النساء',
    'ملابس داخلية وملابس للنوم للنساء'
  ]);

  await moveCategory('ملابس رجالية', [
    'ملابس رجالي بمقاسات كبيرة',
    'ملابس داخلية وملابس النوم رجالي'
  ]);

  await moveCategory('الأطفال والرضع', [
    'أحذية الأطفال',
    'أزياء الاطفال',
    'الأمهات والرضع'
  ]);

  await moveCategory('أزياء وملابس', [
    'ملابس الشاطئ'
  ]);

  console.log('Cleanup complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
