const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const seller = await db.user.findUnique({
    where: { email: 'seller@charyday.com' },
    select: {
      id: true,
      email: true,
      sellerProfile: {
        select: {
          merchantType: true
        }
      }
    }
  });
  console.log('Seller profile merchantType:', seller);
}

main().catch(console.error).finally(() => db.$disconnect());
