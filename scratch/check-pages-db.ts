import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.customPage.findMany({
    select: { slug: true, titleAr: true }
  });
  console.log("Pages in DB:", JSON.stringify(pages, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
