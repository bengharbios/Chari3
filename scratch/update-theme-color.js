const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const setting = await prisma.systemSetting.findFirst({
    where: { key: 'theme_seller_dashboard' }
  });
  if (setting) {
    console.log('Current value:', setting.value);
    const parsed = JSON.parse(setting.value);
    if (parsed.colors && parsed.colors.sidebarBackground) {
      parsed.colors.sidebarBackground.light = '#1e293b'; // Change from #de173f to #1e293b
      const updatedValue = JSON.stringify(parsed);
      await prisma.systemSetting.update({
        where: { key: 'theme_seller_dashboard' },
        data: { value: updatedValue }
      });
      console.log('Updated theme_seller_dashboard value successfully');
    }
  } else {
    console.log('theme_seller_dashboard setting not found');
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
