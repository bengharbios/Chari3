const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const setting = await prisma.systemSetting.findFirst({
    where: { key: 'seller_dashboard_template' }
  });
  console.log('seller_dashboard_template setting:', setting);
  
  const allSettings = await prisma.systemSetting.findMany({
    where: { key: { in: ['seller_dashboard_template', 'theme_seller_dashboard'] } }
  });
  console.log('All settings:', allSettings);
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
