const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const layout = await prisma.setting.findUnique({
      where: { key: 'homepage_layout' }
    });
    console.log('--- HOMEPAGE LAYOUT ---');
    console.log(layout ? JSON.parse(layout.value) : 'No layout setting found');
    
    const count = await prisma.product.count({ where: { status: 'active' } });
    console.log('--- ACTIVE PRODUCT COUNT ---', count);
  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
