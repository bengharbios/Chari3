const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const setting = await prisma.systemSetting.upsert({
    where: { key: 'currency' },
    update: { value: 'DZD', updatedBy: 'test' },
    create: { key: 'currency', value: 'DZD', updatedBy: 'test' }
  });
  console.log('Saved setting:', setting);
  const fetched = await prisma.systemSetting.findUnique({ where: { key: 'currency' } });
  console.log('Fetched setting value:', fetched.value, 'Type:', typeof fetched.value);
} 
main().catch(console.error).finally(() => prisma.$disconnect());



