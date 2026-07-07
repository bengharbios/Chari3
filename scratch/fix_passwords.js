const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const hash = '$2b$10$A1BdxgaKARMbkiVMosWOkuKRfcpQDqs2uun4dGEbp240YwmBZTxAG';
  await prisma.user.updateMany({ 
    where: { email: { in: ['owner1782920597368@test.com', 'manager1782920597368@test.com'] } }, 
    data: { password: hash } 
  }); 
  await prisma.account.updateMany({ 
    where: { accountId: { in: ['owner1782920597368@test.com', 'manager1782920597368@test.com'] } }, 
    data: { password: hash } 
  }); 
  console.log('Passwords updated successfully!');
}

run().catch(console.error).finally(() => process.exit(0));
