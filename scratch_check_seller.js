const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'seller@charyday.com' },
    include: {
      sellerProfile: true,
      store: true,
      staffOf: {
        include: {
          store: true
        }
      }
    }
  });
  console.log(JSON.stringify(user, null, 2));
  process.exit(0);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
