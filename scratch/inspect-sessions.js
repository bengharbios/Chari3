const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: 'hakimuae1313@gmail.com' },
    include: {
      sessions: true,
      accounts: true,
    }
  });
  console.log('User and Sessions Info:', JSON.stringify(users, null, 2));

  const allSessions = await prisma.session.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Recent 10 Sessions:', JSON.stringify(allSessions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
