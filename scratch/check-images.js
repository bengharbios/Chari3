const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({ where: { image: null } });
  console.log('Count:', cats.length);
  console.log(cats.map(c => c.name).join(', '));
}

main().finally(() => prisma.$disconnect());
