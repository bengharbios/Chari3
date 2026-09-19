const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.sellerPackage.updateMany({
    data: {
      hasAnalytics: true,
    },
  });
  console.log('All packages updated to have analytics!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
