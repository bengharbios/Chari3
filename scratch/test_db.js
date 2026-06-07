const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
async function test() {
  try {
    const order = await db.order.findFirst();
    if (!order) return console.log('No order found');
    console.log('Testing with order:', order.id);
    
    // Simulate PATCH logic
    const updateData = { status: 'delivered' };
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: updateData,
    });
    
    await db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'delivered',
        note: 'Order status updated to: delivered',
      },
    });
    console.log('Success');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await db.$disconnect();
  }
}
test();
