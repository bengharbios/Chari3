import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = params;
    const body = await request.json();
    const { cancellations } = body; // Array of { itemId, reason }

    if (!cancellations || !Array.isArray(cancellations)) {
      return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
    }

    // Verify order belongs to user and is not already shipped
    const order = await db.order.findUnique({
      where: { id: orderId, buyerId: session.user.id },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return NextResponse.json({ success: false, error: 'Cannot cancel items for this order status' }, { status: 400 });
    }

    // Process cancellations
    let allCancelled = true;
    for (const cancelReq of cancellations) {
      const item = order.items.find((i: any) => i.id === cancelReq.itemId);
      if (item && item.status !== 'cancelled') {
        await db.orderItem.update({
          where: { id: item.id },
          data: {
            status: 'cancelled',
            cancelReason: cancelReq.reason,
            cancelledAt: new Date()
          }
        });
      }
    }

    // Check if ALL items in the order are now cancelled
    const updatedOrder = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    const activeItems = updatedOrder?.items.filter(i => i.status !== 'cancelled') || [];
    
    if (activeItems.length === 0 && order.status !== 'cancelled') {
      // Mark entire order as cancelled
      await db.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' }
      });
      await db.orderStatusHistory.create({
        data: {
          orderId,
          status: 'cancelled',
          note: 'All items were cancelled by the buyer'
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Items cancelled successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
