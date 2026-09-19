const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.sellerPackage.update({ where: { id: 'beginner_plan' }, data: { hasAnalytics: false } });
  await prisma.sellerPackage.update({ where: { id: 'basic_plan' }, data: { hasAnalytics: false } });
  await prisma.sellerPackage.update({ where: { id: 'cmpzbjttw000841pa9u9c9irh' }, data: { hasAnalytics: false } });
  await prisma.sellerPackage.update({ where: { id: 'pro_plan' }, data: { hasAnalytics: true } });
  await prisma.sellerPackage.update({ where: { id: 'premium_plan' }, data: { hasAnalytics: true } });
  console.log('Packages reverted to original state');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
