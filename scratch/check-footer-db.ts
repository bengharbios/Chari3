import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.platformSetting.findMany({
    where: {
      key: {
        in: ['headerFooterConfig', 'theme_storefront', 'footer_blocks']
      }
    }
  });
  
  console.log(JSON.stringify(settings, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
