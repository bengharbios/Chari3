const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkUser() {
  const user = await p.user.findFirst({ where: { email: 'hakimuae1313@gmail.com' } });
  if (!user) {
    console.log('USER NOT FOUND');
    await p.$disconnect();
    return;
  }
  console.log('USER:', JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    accountStatus: user.accountStatus,
    isActive: user.isActive,
  }, null, 2));

  const cred = await p.account.findFirst({
    where: { userId: user.id, providerId: 'credential' },
    select: { password: true }
  });
  console.log('HAS_CREDENTIAL_ACCOUNT:', !!cred);
  console.log('HAS_PASSWORD:', cred ? !!cred.password : false);
  console.log('PASSWORD_SNIPPET:', cred && cred.password ? cred.password.slice(0, 20) + '...' : 'NULL');

  await p.$disconnect();
}

checkUser().catch(e => { console.error(e); p.$disconnect(); });
