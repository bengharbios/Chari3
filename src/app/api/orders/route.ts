import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const buyerId = searchParams.get('buyerId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (buyerId) where.buyerId = buyerId;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          buyer: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    console.error('[GET /api/orders]', error);
    return NextResponse.json({ orders: [], total: 0, page: 1, limit: 10 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderNumber = `NOON-${Date.now()}`;
    const order = await db.order.create({
      data: {
        orderNumber,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: body.paymentMethod || 'cod',
        subtotal: body.subtotal,
        shippingCost: body.shippingCost || 0,
        tax: body.tax || 0,
        discount: body.discount || 0,
        total: body.total,
        buyerId: body.buyerId,
        address: JSON.stringify(body.address),
        shippingMethod: body.shippingMethod || 'standard',
        items: {
          create: body.items.map((item: { productId: string; productName: string; productImage?: string; price: number; quantity: number; total: number }) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    // Create initial history entry
    await db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        note: 'Order placed successfully by customer via COD.',
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('[POST /api/orders]', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, paymentStatus, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (note) updateData.note = note;

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
    });

    // Create history entry
    if (status) {
      await db.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note: note || `Order status updated to: ${status}`,
        },
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('[PATCH /api/orders]', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
