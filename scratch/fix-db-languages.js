const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.systemSetting.findUnique({ where: { key: 'i18n_languages' }});
  if (!s) return;
  const langs = s.value;
  for (let l of langs) {
    if (l.code === 'ar') l.nameAr = 'العربية';
    else if (l.code === 'en') l.nameAr = 'الإنجليزية';
    else if (l.code === 'fr') l.nameAr = 'الفرنسية';
    else if (l.code === 'es') l.nameAr = 'الإسبانية';
  }
  await prisma.systemSetting.update({ where: { key: 'i18n_languages'}, data: { value: langs }});
  console.log('Fixed DB');
}

main().finally(() => prisma.$disconnect());
