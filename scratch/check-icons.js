const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.category.findMany({ where: { parentId: null } });
  console.log(c.map(cat => ({name: cat.name, icon: cat.icon})));
}
main().finally(() => prisma.$disconnect());
