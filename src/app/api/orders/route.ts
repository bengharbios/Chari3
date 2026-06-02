import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chargeOrderCommission, reverseOrderCommission } from '@/lib/billing';

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

    let buyerId = body.buyerId;
    if (!buyerId) {
      const phone = body.address?.phone;
      const fullName = body.address?.fullName || 'Guest Customer';
      
      if (!phone) {
        return NextResponse.json({ error: 'Phone number is required for order shipping' }, { status: 400 });
      }

      // Check if a user already exists with this phone number
      const existingUser = await db.user.findFirst({
        where: { phone: String(phone) },
      });

      if (existingUser) {
        buyerId = existingUser.id;
      } else {
        // Dynamically create a guest buyer account
        const randomStr = Math.random().toString(36).substring(2, 8);
        const email = `guest-${phone}-${randomStr}@chariday.com`;
        const newUser = await db.user.create({
          data: {
            name: fullName,
            phone: String(phone),
            email,
            role: 'buyer',
            accountStatus: 'active',
            isVerified: false,
          },
        });
        buyerId = newUser.id;
      }
    }

    const orderNumber = `CHARI-${Date.now()}`;
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
        currency: body.currency || 'DZD',
        buyerId: buyerId,
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

    // Send notification to seller/store manager
    try {
      // Get the first product's seller or store info
      const items = body.items as { productId: string; productName: string; productImage?: string; price: number; quantity: number; total: number }[];
      const firstItem = items[0];
      let notifyUserId: string | null = null;

      const product = await db.product.findUnique({
        where: { id: firstItem.productId },
        select: { sellerId: true, storeId: true }
      });

      if (product?.storeId) {
        const store = await db.store.findUnique({
          where: { id: product.storeId },
          select: { managerId: true }
        });
        notifyUserId = store?.managerId || null;
      } else if (product?.sellerId) {
        const sellerProfile = await db.sellerProfile.findUnique({
          where: { id: product.sellerId },
          select: { userId: true }
        });
        notifyUserId = sellerProfile?.userId || null;
      }

      if (notifyUserId) {
        await db.notification.create({
          data: {
            title: 'طلب جديد! 🛍️',
            titleEn: 'New Order! 🛍️',
            body: `طلب جديد #${order.orderNumber} بقيمة ${order.total.toLocaleString()} دج`,
            bodyEn: `New order #${order.orderNumber} worth ${order.total.toLocaleString()} DZD`,
            type: 'new_order',
            data: JSON.stringify({ orderId: order.id, orderNumber: order.orderNumber, total: order.total }),
            userId: notifyUserId,
          }
        });
      }
    } catch (notifError) {
      console.error('[notification]', notifError); // Don't fail the order
    }

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

      // Trigger billing and commission actions
      if (status === 'delivered') {
        await chargeOrderCommission(id);
      } else if (status === 'cancelled' || status === 'returned') {
        await reverseOrderCommission(id);
      }

      // Notify buyer of status change
      try {
        const orderWithBuyer = await db.order.findUnique({
          where: { id },
          select: { buyerId: true, orderNumber: true, total: true }
        });
        if (orderWithBuyer?.buyerId) {
          const statusLabels: Record<string, { ar: string; en: string }> = {
            confirmed: { ar: 'تم تأكيد طلبك', en: 'Your order has been confirmed' },
            shipped: { ar: 'تم شحن طلبك', en: 'Your order has been shipped' },
            delivered: { ar: 'تم تسليم طلبك', en: 'Your order has been delivered' },
            cancelled: { ar: 'تم إلغاء طلبك', en: 'Your order has been cancelled' },
          };
          const label = statusLabels[status];
          if (label) {
            await db.notification.create({
              data: {
                title: `${label.ar} 📦`,
                titleEn: `${label.en} 📦`,
                body: `طلبك رقم #${orderWithBuyer.orderNumber} - ${label.ar}`,
                bodyEn: `Order #${orderWithBuyer.orderNumber} - ${label.en}`,
                type: 'shipment',
                data: JSON.stringify({ orderId: id, orderNumber: orderWithBuyer.orderNumber }),
                userId: orderWithBuyer.buyerId,
              }
            });
          }
        }
      } catch (notifError) {
        console.error('[buyer-notification]', notifError);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('[PATCH /api/orders]', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
