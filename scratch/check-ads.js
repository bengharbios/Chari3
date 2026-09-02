const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ads = await prisma.advertisement.findMany();
  console.log(ads.map(ad => ({ id: ad.id, title: ad.title, zone: ad.zone })));
}

main().finally(() => prisma.$disconnect());
