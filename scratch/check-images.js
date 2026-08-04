const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const p = await prisma.product.findMany({
    where: { name: { contains: 'نظارات' } },
    select: { id: true, name: true, images: true }
  });
  console.log(JSON.stringify(p, null, 2));
}
check().finally(() => prisma.$disconnect());
