const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'abdelkader.rapidline@gmail.com' }
  });
  console.log('USER DETAILS:', JSON.stringify(user, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
