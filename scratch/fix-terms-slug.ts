import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existingTerms = await prisma.customPage.findUnique({
    where: { slug: 'terms' }
  });

  if (existingTerms) {
    await prisma.customPage.update({
      where: { slug: 'terms' },
      data: { slug: 'terms-and-conditions' }
    });
    console.log("Renamed slug 'terms' to 'terms-and-conditions'.");
  } else {
    console.log("Page 'terms' not found, it might already be renamed.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
