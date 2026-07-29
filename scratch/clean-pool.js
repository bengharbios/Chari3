const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const oldOrders = await db.order.findMany({
    where: {
      status: { in: ['pending', 'confirmed', 'processing'] },
      assignedDriverId: null
    }
  });

  console.log(`Found ${oldOrders.length} unassigned old test orders in the pool.`);
  
  let cancelledCount = 0;
  for (const order of oldOrders) {
    // Only cancel if it has garbage text in address OR is older than 2 days
    let rawAddr = order.address;
    if (typeof rawAddr === 'string' && rawAddr.startsWith('{')) {
      try { rawAddr = JSON.parse(rawAddr); } catch(e){}
    }
    const street = (typeof rawAddr === 'object' && rawAddr?.street) ? rawAddr.street : (typeof order.address === 'string' ? order.address : '');
    
    // Check for garbage like "تتتت", "HHHH", "سسسس", "يبليب"
    const isGarbage = /([أ-يa-zA-Z])\1{3,}/.test(street) || /يبل/.test(street) || /سيب/.test(street) || /FGH/i.test(street);
    
    if (isGarbage || order.createdAt < new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) {
      await db.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' }
      });
      cancelledCount++;
    }
  }

  console.log(`Cleaned up ${cancelledCount} garbage/old orders from the Open Load Pool!`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
  });
