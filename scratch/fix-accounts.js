const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

async function fixAccounts() {
  const users = await prisma.user.findMany({
    where: { accounts: { none: {} } }
  });
  
  console.log(`Found ${users.length} users missing accounts.`);
  
  for (const user of users) {
    if (!user.password) continue;
    
    await prisma.account.create({
      data: {
        id: randomUUID(),
        providerId: 'credential',
        accountId: user.email,
        password: user.password,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`Fixed account for ${user.email}`);
  }
}

fixAccounts().catch(console.error).finally(() => prisma.$disconnect());
