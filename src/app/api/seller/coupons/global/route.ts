import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const store = await db.store.findFirst({ where: { managerId: userId } });
    const seller = await db.sellerProfile.findUnique({ where: { userId } });

    if (!store && !seller) {
      return NextResponse.json({ success: false, error: 'Store or Seller profile not found' }, { status: 404 });
    }

    const globalCoupons = await db.coupon.findMany({
      where: { 
        isGlobal: true,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      },
      include: {
        _count: {
          select: { optInStores: true, optInSellers: true }
        },
        optInStores: { where: { id: store?.id || 'none' }, select: { id: true } },
        optInSellers: { where: { id: seller?.id || 'none' }, select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, globalCoupons });
  } catch (error) {
    console.error('[seller/coupons/global GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
