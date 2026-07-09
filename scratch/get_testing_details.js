const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const sellerEmail = 'seller@charyday.com';
  const user = await db.user.findUnique({
    where: { email: sellerEmail },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerProfile: {
        select: {
          storeName: true,
          paymentModel: true
        }
      },
      staffOf: {
        select: {
          id: true,
          role: true,
          status: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    }
  });

  const ownedStores = await db.store.findMany({
    where: { managerId: user?.id },
    select: {
      id: true,
      name: true,
      slug: true
    }
  });

  console.log('--- Test User Info ---');
  console.log(JSON.stringify({ user, ownedStores }, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());
