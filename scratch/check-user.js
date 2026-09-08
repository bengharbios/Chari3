const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'basmatlmdz@gmail.com' },
    include: { sellerProfile: true, sessions: true }
  });
  console.log(JSON.stringify(user, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
