import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    console.error('[GET /api/orders]', error);
    // Return empty result instead of crashing
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

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
