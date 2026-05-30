import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/buyer/orders?buyerId=xxx
export async function GET(req: NextRequest) {
  try {
    const buyerId = req.nextUrl.searchParams.get('buyerId');
    if (!buyerId) return NextResponse.json({ success: false, error: 'buyerId required' }, { status: 400 });

    const orders = await db.order.findMany({
      where: { buyerId },
      include: {
        items: {
          include: {
            product: { select: { name: true, nameEn: true, images: true } }
          }
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
