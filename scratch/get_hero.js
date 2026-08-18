const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const layout = await prisma.systemSetting.findUnique({
    where: { key: 'homepage_hero_slides' }
  });
  console.log(JSON.stringify(layout ? JSON.parse(layout.value) : [], null, 2));
}

main().finally(() => prisma.$disconnect());
