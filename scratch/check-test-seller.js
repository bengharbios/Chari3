const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'test-seller2@chari3.com' },
    include: { storeVerification: true }
  });
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
    console.log('Account Status:', user.accountStatus);
    console.log('Store Verification:', JSON.stringify(user.storeVerification, null, 2));
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
