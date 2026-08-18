const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.category.findMany({ where: { parentId: 'cmp9wj2v5000041dj131gc133' } });
  console.log(c.map(cat => cat.name));
}
main().finally(() => prisma.$disconnect());
