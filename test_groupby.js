const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing groupBy on orderItem...');
  
  // Try to group by productId with a relation filter
  try {
    const bestProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        product: { storeId: 'some-store-id' },
        order: { createdAt: { gte: new Date('2020-01-01') } }
      },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    });
    console.log('bestProducts:', bestProducts);
  } catch (e) {
    console.error('bestProducts failed:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
