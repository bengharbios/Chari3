const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.category.findMany();
  console.log(c.map(cat => ({id: cat.id, name: cat.name, nameEn: cat.nameEn})));
}
main().finally(() => prisma.$disconnect());
