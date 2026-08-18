const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const menu = await prisma.setting.findUnique({
    where: { key: 'public_menu' }
  });
  console.log(menu ? menu.value : 'null');
}

main().finally(() => prisma.$disconnect());
