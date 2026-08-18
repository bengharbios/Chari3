const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const generateSlug = (text) => {
  return 'cat-' + crypto.randomBytes(4).toString('hex');
};

const noonCategories = [
  "المتميز",
  "البيت والمطبخ",
  "ملابس نسائية",
  "ملابس نسائية بمقاسات كبيرة",
  "أحذية النساء",
  "ملابس داخلية وملابس للنوم للنساء",
  "ملابس رجالية",
  "أحذية رجالية",
  "ملابس رجالي بمقاسات كبيرة",
  "ملابس داخلية وملابس النوم رجالي",
  "الرياضة وأنشطة الهواء الطلق",
  "المجوهرات والاكسسوارات",
  "الجمال والعناية الشخصية",
  "الدمى والألعاب",
  "السيارات",
  "أزياء الاطفال",
  "أحذية الأطفال",
  "الأمهات والرضع",
  "الحقائب وأمتعة السفر",
  "الفناء والحديقة والبستان",
  "الفنون والحرف اليدوية والخياطة",
  "الإلكترونيات",
  "الأعمال والصناعة والعلوم",
  "أدوات وتحسينات المنزل",
  "الأجهزة المنزلية",
  "اللوازم المكتبية والمدرسية",
  "الصحة والأسرة",
  "مستلزمات الحيوانات الأليفة",
  "الإكسسوارات والجوالات",
  "مستلزمات البيت الذكي",
  "الآلات الموسيقية",
  "طعام ومواد غذائية",
  "الكتب ووسائل الإعلام",
  "ملابس الشاطئ",
  "الأثاث",
  "نظارات رجالية",
  "ملابس نوم للنساء",
  "سلاسل المفاتيح والتعليقات النسائية",
  "مجوهرات للنساء",
  "الحقائب والجرابات والحافظات",
  "ملابس أنشطة رياضية للرجال",
  "سماعات رأس وسماعات أذن وملحقات",
  "التابلت واللابتوب وإكسسواراتها",
  "أحذية رياضية وأحذية خروج رجالي",
  "تيشيرتات رجالي",
  "أطقم بناتي",
  "أحذية كاجوال رجالي",
  "ساعات رجالي",
  "أحذية رياضية عصرية للنساء",
  "حمالات صدر للنساء",
  "أطقم أولادي"
];

async function main() {
  for (const name of noonCategories) {
    // Check if it exists to avoid duplication
    const existing = await prisma.category.findFirst({ where: { name } });
    
    if (!existing) {
      const slug = generateSlug(name);
      await prisma.category.create({
        data: {
          name,
          nameEn: name, // Placeholder for english
          slug,
          sortOrder: 100
        }
      });
      console.log(`Created: ${name}`);
    } else {
      console.log(`Skipped (already exists): ${name}`);
    }
  }
  
  console.log('All Noon categories processed!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
