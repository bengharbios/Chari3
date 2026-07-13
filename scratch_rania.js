const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function checkRania() {
  const user = await db.user.findUnique({
    where: { email: 'hakimuae1313@gmail.com' },
    include: {
      sellerProfile: true,
      store: true,
      ownedStores: true,
      staffOf: true
    }
  });

  console.log('Rania User Profile in DB:', JSON.stringify(user, null, 2));
  await db.$disconnect();
}

checkRania();
