const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fallbackImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400';

async function main() {
  console.log('Assigning a single generic image to all nulls using bulk update...');
  await prisma.category.updateMany({
    where: { image: null },
    data: { image: fallbackImage }
  });
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
