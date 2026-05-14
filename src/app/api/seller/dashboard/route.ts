import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/seller/dashboard?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });

    const seller = await db.sellerProfile.findUnique({
      where: { userId },
      include: {
        package: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });
    if (!seller) return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });

    // Get seller's products
    const products = await db.product.findMany({
      where: { sellerId: seller.id },
      select: { id: true, name: true, price: true, stock: true, status: true, soldCount: true, rating: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Current month's orders
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthOrders = await db.orderItem.findMany({
      where: {
        productId: { in: products.map((p) => p.id) },
        order: { createdAt: { gte: startOfMonth } },
      },
      include: {
        order: { select: { status: true, createdAt: true, total: true, orderNumber: true } },
        product: { select: { name: true, price: true } },
      },
    });

    // Wallet balance
    const wallet = await db.wallet.findUnique({ where: { userId } });

    // Pending withdrawals
    const pendingWithdrawals = await db.withdrawalRequest.findMany({
      where: { sellerId: seller.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Recent seller reviews
    const reviews = await db.sellerReview.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Active challenges
    const challenges = await db.challenge.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
    });

    // Level info
    const sellerLevel = await db.sellerLevel.findFirst({
      where: { level: seller.level },
    });
    const nextLevel = await db.sellerLevel.findFirst({
      where: { level: seller.level + 1 },
    });

    // KPIs
    const monthRevenue = monthOrders.reduce((s, i) => s + i.total, 0);
    const monthCommission = monthRevenue * ((seller.package?.commissionRate ?? 10) / 100);
    const monthNetEarnings = monthRevenue - monthCommission;

    return NextResponse.json({
      success: true,
      seller,
      kpis: {
        monthRevenue,
        monthCommission,
        monthNetEarnings,
        monthOrderCount: monthOrders.length,
        totalSales: seller.totalSales,
        totalEarnings: seller.totalEarnings,
        rating: seller.rating,
        level: seller.level,
        completionRate: seller.completionRate,
        responseRate: seller.responseRate,
        walletBalance: wallet?.balance ?? 0,
      },
      products,
      recentOrders: monthOrders.slice(0, 10),
      reviews,
      challenges,
      sellerLevel,
      nextLevel,
      pendingWithdrawals,
    });
  } catch (error) {
    console.error('[seller/dashboard]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
