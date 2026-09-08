import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const settings = await prisma.platformSettings.findFirst();
  console.log("Settings found:", !!settings);
  if (settings && settings.headerFooterConfig) {
    const config = JSON.parse(settings.headerFooterConfig);
    console.log(JSON.stringify(config.footer.columns, null, 2));
  }
}
check().finally(() => prisma.$disconnect());
