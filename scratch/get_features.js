const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const features = await prisma.setting.findUnique({
    where: { key: 'homepage_features' }
  });
  console.log(JSON.stringify(features ? JSON.parse(features.value) : [], null, 2));
}

main().finally(() => prisma.$disconnect());
