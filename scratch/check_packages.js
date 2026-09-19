const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const packages = await prisma.sellerPackage.findMany();
  console.log(JSON.stringify(packages, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
