const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'cmqnzdcvq000141dll4fpcbmg';
  
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId }
  });
  
  const store = await prisma.store.findFirst({
    where: { managerId: userId }
  });
  
  console.log('sellerProfile:', sellerProfile);
  console.log('store:', store);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
