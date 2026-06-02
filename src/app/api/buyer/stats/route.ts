import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/buyer/stats?buyerId=xxx
export async function GET(req: NextRequest) {
  try {
    const buyerId = req.nextUrl.searchParams.get('buyerId');
    if (!buyerId) return NextResponse.json({ success: false, error: 'buyerId required' }, { status: 400 });

    const [totalOrders, totalSpent, wallet, wishlistCount] = await Promise.all([
      db.order.count({ where: { buyerId } }),
      db.order.aggregate({
        where: { buyerId, status: { not: 'cancelled' } },
        _sum: { total: true }
      }),
      db.wallet.findUnique({ where: { userId: buyerId } }),
      db.wishlistItem.count({
        where: { buyerProfile: { userId: buyerId } }
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalSpent: totalSpent._sum.total || 0,
        walletBalance: wallet?.balance || 0,
        walletCurrency: wallet?.currency || 'DZD',
        wishlistCount,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
