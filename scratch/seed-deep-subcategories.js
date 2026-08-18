const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateSlug = (text, prefix) => {
  // basic ascii slug
  const slug = text.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]/g, '');
  return `${prefix}-${slug || crypto.randomBytes(4).toString('hex')}`;
};

const homeSubcats = [
  "منتجات مخصصة", "منتجات الديكور المنزلي", "تخزين وتنظيم المطبخ", "أدوات ومستلزمات المطبخ",
  "الفراش", "التخزين والتنظيم المنزلي", "ملحقات تخزين الملابس والغسيل", "الحمام",
  "أواني الطعام والتسالي", "مستلزمات الاحتفالات", "السجاد والفرش", "ديكور للأريكة",
  "الديكور الموسمي", "المناشف وستائر الحمام", "معدات التنظيف", "الستائر وملحقاتها",
  "أواني الطهي", "الإضاءة وملحقاتها", "أواني الخبز", "الأواني الزجاجية وأدوات الشرب",
  "مفروشات المطبخ والمائدة", "الأجهزة الصغيرة والإكسسوارات", "لوحات فنية جدارية",
  "البطانيات والمفارش", "أدوات شرب للسفر والتنقل", "المراوح والمكيفات والدفايات",
  "القهوة والشاي والإسبريسو", "المكنسات والعناية بالأرضيات", "معدات ولوازم تقديم الطعام",
  "جودة الهواء", "منتجات تخزين منزلية للأطفال", "أدوات الكي وكوايات البخار", "صناعة النبيذ ومستلزماته"
];

const womenSubcats = [
  "فساتين للنساء", "تيشيرتات للنساء", "أطقم نسائية من قطعتين", "بلوزات وقمصان للنساء",
  "بناطيل للنساء", "معاطف وسترات نسائية", "سترات للنساء", "ملابس جينز للنساء",
  "ملابس رياضية للنساء", "بلوزات بدون أكمام وقمصان بحمالات للنساء", "تنورات للنساء",
  "سترات سويت شيرت للنساء", "بليزرات نسائية", "ملابس نسائية لحفلات الزفاف",
  "جمبسوت للنساء", "سراويل قصيرة للنساء", "ملابس الأمومة", "ملابس العمل والسلامة للنساء",
  "أحذية جينز للنساء", "ملابس تقليدية وذات طابع ثقافي للنساء", "ملابس داخلية للنساء",
  "بناطيل بقصة ضيقة للنساء", "سترات رياضية", "جاكيتات ومعاطف جينز نسائية",
  "تنانير من الجينز النساء", "أزياء تنكرية نسائية"
];

async function addSubcategories(parentSlug, prefix, names) {
  const parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
  if (!parent) {
    console.log(`Parent ${parentSlug} not found`);
    return;
  }

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    // Create a safe unique slug using the prefix and index
    const slug = `${prefix}-${i + 1}`;
    
    await prisma.category.upsert({
      where: { slug },
      update: {
        name,
        nameEn: name, // you can translate this later if needed
        sortOrder: i * 10
      },
      create: {
        name,
        nameEn: name,
        slug,
        parentId: parent.id,
        sortOrder: i * 10
      }
    });
    console.log(`Upserted: ${name} under ${parent.name}`);
  }
}

async function main() {
  await addSubcategories('home-kitchen', 'hk', homeSubcats);
  await addSubcategories('womens-clothing', 'wc', womenSubcats);
  console.log('Subcategories added successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
