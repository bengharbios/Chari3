const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.platformSettings.findUnique({ where: { id: 'global' }});
  console.log(s.publicMenuConfig);
}
main().finally(() => prisma.$disconnect());
