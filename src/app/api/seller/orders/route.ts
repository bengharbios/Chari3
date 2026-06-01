import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search') || '';

    if (!userId) return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });

    // Determine if the user is an independent seller or store manager
    let storeId: string | null = null;
    let sellerId: string | null = null;

    const seller = await db.sellerProfile.findUnique({ where: { userId } });
    if (seller) {
      sellerId = seller.id;
    } else {
      const store = await db.store.findFirst({ where: { managerId: userId } });
      if (store) storeId = store.id;
      else return NextResponse.json({ success: false, error: 'Seller/Store not found' }, { status: 404 });
    }

    // Get product IDs owned by this seller
    const products = await db.product.findMany({
      where: storeId ? { storeId: { in: [storeId, userId] } } : { sellerId: { in: [sellerId as string, userId] } },
      select: { id: true },
    });
    const productIds = products.map(p => p.id);

    // Build Prisma query conditions for the order
    const whereCondition: any = {};
    if (status !== 'all') {
      whereCondition.status = status;
    }
    
    if (startDate && endDate) {
      whereCondition.createdAt = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) // End of the day
      };
    } else if (startDate) {
      whereCondition.createdAt = { gte: new Date(startDate) };
    } else if (endDate) {
      whereCondition.createdAt = { lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }

    if (search) {
      whereCondition.OR = [
        { orderNumber: { contains: search } },
        { address: { contains: search } }
      ];
    }

    // Get the total count for pagination
    // Because we fetch orders by matching productIds in OrderItems, we must query OrderItem first, OR query Order where items SOME productId in productIds
    const orderWhere = {
      ...whereCondition,
      items: {
        some: {
          productId: { in: productIds }
        }
      }
    };

    const totalOrders = await db.order.count({ where: orderWhere });

    // Fetch the paginated orders
    const orders = await db.order.findMany({
      where: orderWhere,
      include: {
        buyer: { select: { id: true, name: true, nameEn: true, phone: true, email: true } },
        items: {
          where: { productId: { in: productIds } },
          include: { product: { select: { name: true, price: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit)
      }
    });

  } catch (error) {
    console.error('[seller/orders GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
