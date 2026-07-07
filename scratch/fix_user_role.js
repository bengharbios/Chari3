const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Revert manager1782920597368@test.com back to 'store' role
  const r1 = await prisma.user.update({
    where: { email: 'manager1782920597368@test.com' },
    data: { role: 'store' }
  });
  console.log('Fixed manager1782920597368@test.com:', r1.role);

  // 2. Check hakimuae1313@gmail.com details
  const r2 = await prisma.user.findUnique({
    where: { email: 'hakimuae1313@gmail.com' }
  });
  console.log('hakimuae1313@gmail.com user:', JSON.stringify(r2, null, 2));

  // If hakimuae1313@gmail.com has had their role overwritten and has a store, we should revert it to 'store' or 'freelancer' as appropriate
  if (r2) {
    const store = await prisma.store.findFirst({ where: { managerId: r2.id } });
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: r2.id } });
    if (store || profile) {
      const fixed = await prisma.user.update({
        where: { id: r2.id },
        data: { role: 'store' } // restore store owner role
      });
      console.log('Reverted hakimuae1313@gmail.com to owner role:', fixed.role);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
