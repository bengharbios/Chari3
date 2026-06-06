const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subs = await prisma.subscription.findMany({
    where: {
      user: { email: 'bengharbios@gmail.com' }
    },
    include: {
      package: true,
      invoices: true
    },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(subs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
