const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mappings = [
  { child: "نظارات رجالية", parent: "ملابس رجالية" },
  { child: "ملابس نوم للنساء", parent: "ملابس نسائية" },
  { child: "سلاسل المفاتيح والتعليقات النسائية", parent: "المجوهرات والاكسسوارات" },
  { child: "مجوهرات للنساء", parent: "المجوهرات والاكسسوارات" },
  { child: "الحقائب والجرابات والحافظات", parent: "الحقائب وأمتعة السفر" },
  { child: "ملابس أنشطة رياضية للرجال", parent: "ملابس رجالية" },
  { child: "سماعات رأس وسماعات أذن وملحقات", parent: "الإلكترونيات" },
  { child: "التابلت واللابتوب وإكسسواراتها", parent: "الإلكترونيات" },
  { child: "أحذية رياضية وأحذية خروج رجالي", parent: "أحذية رجالية" },
  { child: "تيشيرتات رجالي", parent: "ملابس رجالية" },
  { child: "أطقم بناتي", parent: "أزياء الاطفال" },
  { child: "أحذية كاجوال رجالي", parent: "أحذية رجالية" },
  { child: "ساعات رجالي", parent: "المجوهرات والاكسسوارات" },
  { child: "أحذية رياضية عصرية للنساء", parent: "أحذية النساء" },
  { child: "حمالات صدر للنساء", parent: "ملابس داخلية وملابس للنوم للنساء" },
  { child: "أطقم أولادي", parent: "أزياء الاطفال" }
];

async function main() {
  for (const map of mappings) {
    const parentCat = await prisma.category.findFirst({ where: { name: map.parent } });
    if (!parentCat) {
      console.log(`Parent not found: ${map.parent}`);
      continue;
    }
    
    const childCat = await prisma.category.findFirst({ where: { name: map.child } });
    if (!childCat) {
      console.log(`Child not found: ${map.child}`);
      continue;
    }
    
    await prisma.category.update({
      where: { id: childCat.id },
      data: { parentId: parentCat.id }
    });
    console.log(`Moved '${map.child}' under '${map.parent}'`);
  }
  
  // What about the "المتميز" and others? The user might just want the specific subcategories moved.
  console.log('Done mapping!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
