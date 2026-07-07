const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'manager1782920597368@test.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      store: true,
      sellerProfile: true,
      staffOf: {
        include: {
          store: true
        }
      }
    }
  });
  console.log('USER:', JSON.stringify(user, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
