import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const platformSettings = await prisma.platformSettings.findUnique({
    where: { id: 'global' }
  });
  console.log("PlatformSettings:", JSON.stringify(platformSettings, null, 2));

  const systemSettings = await prisma.systemSetting.findMany({
    where: { key: { in: ['headerFooterConfig', 'theme_storefront', 'footer_blocks'] } }
  });
  console.log("SystemSettings:", JSON.stringify(systemSettings, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
