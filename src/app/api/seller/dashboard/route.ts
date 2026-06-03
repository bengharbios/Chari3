import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAndUpdateExpiredSubscriptions } from '@/lib/billing';

export const dynamic = 'force-dynamic';

// GET /api/seller/dashboard?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });

    // Run dynamic subscription status check/expiration
    await checkAndUpdateExpiredSubscriptions(userId);


    let seller: any = await db.sellerProfile.findUnique({
      where: { userId },
      include: {
        package: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    let isStoreManager = false;

    if (!seller) {
      // Look up in Store model for StoreManager
      const store = await db.store.findFirst({
        where: { managerId: userId },
        include: {
          package: true,
          manager: { select: { name: true, email: true, phone: true } },
        },
      });

      if (!store) {
        return NextResponse.json({ success: false, error: 'Seller or Store not found' }, { status: 404 });
      }

      isStoreManager = true;

      // Polymorphically map the Store to look exactly like seller profile
      seller = {
        id: store.id,
        userId: store.managerId,
        storeName: store.name,
        storeNameEn: store.nameEn,
        bio: store.description,
        logo: store.logo,
        coverImage: store.coverImage,
        isActive: store.isActive,
        rating: store.rating,
        level: store.level,
        totalSales: store.totalSales,
        totalEarnings: store.totalEarnings,
        completionRate: store.completionRate,
        responseRate: 98, // default fallback
        packageId: store.packageId,
        package: store.package,
        user: store.manager,
      };
    }

    // Get products (polymorphic: store manager queries storeId, independent seller queries sellerId)
    const products = await db.product.findMany({
      where: isStoreManager ? { storeId: { in: [seller.id, userId] } } : { sellerId: { in: [seller.id, userId] } },
      select: { 
        id: true, 
        name: true, 
        price: true, 
        comparePrice: true, 
        stock: true, 
        status: true, 
        soldCount: true, 
        rating: true, 
        images: true,
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Current month's orders
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Month orders for KPIs
    const monthOrders = await db.orderItem.findMany({
      where: {
        productId: { in: products.map((p) => p.id) },
        order: { createdAt: { gte: startOfMonth } },
      },
      include: {
        order: { select: { id: true, total: true } },
      },
    });

    // Recent orders for the table display (last 50 orders overall)
    const recentOrders = await db.orderItem.findMany({
      where: {
        productId: { in: products.map((p) => p.id) },
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            subtotal: true,
            discount: true,
            shippingCost: true,
            total: true,
            orderNumber: true,
            address: true,
            paymentMethod: true,
            paymentStatus: true,
            couponId: true,
            buyer: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                phone: true,
                email: true,
              }
            }
          }
        },
        product: { select: { name: true, price: true } },
      },
      orderBy: { order: { createdAt: 'desc' } },
      take: 50,
    });

    // Wallet balance
    const wallet = await db.wallet.findUnique({ where: { userId } });

    // Pending withdrawals
    const pendingWithdrawals = isStoreManager
      ? []
      : await db.withdrawalRequest.findMany({
          where: { sellerId: seller.id, status: 'pending' },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

    // Recent reviews
    const reviews = isStoreManager
      ? []
      : await db.sellerReview.findMany({
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
    const monthRevenue = monthOrders.reduce((s: number, i: any) => s + (i.order?.total || 0), 0);
    const monthCommission = monthRevenue * ((seller.package?.commissionRate ?? 10) / 100);
    const monthNetEarnings = monthRevenue - monthCommission;

    // Subscription status for suspension banner
    let subscription: any = null;
    try {
      subscription = await db.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          endDate: true,
          trialEndsAt: true,
          cancelReason: true,
          overrideNote: true,
          package: { select: { name: true, nameEn: true } },
        },
      });
    } catch {}

    // Determine suspension reason
    let suspensionReason: string | null = null;
    const isStoreSuspended = seller.isActive === false;
    if (isStoreSuspended) {
      if (subscription?.status === 'SUSPENDED') suspensionReason = 'SUSPENDED';
      else if (subscription?.status === 'EXPIRED') suspensionReason = 'EXPIRED';
      else if (subscription?.status === 'CANCELLED') suspensionReason = 'CANCELLED';
      else suspensionReason = 'ADMIN_DISABLED';
    }

    return NextResponse.json({
      success: true,
      seller,
      currency: wallet?.currency ?? 'DZD',
      storeStatus: {
        isActive: seller.isActive !== false,
        isSuspended: isStoreSuspended,
        suspensionReason,
        subscriptionStatus: subscription?.status || null,
        subscriptionEndDate: subscription?.endDate || null,
        trialEndsAt: subscription?.trialEndsAt || null,
        cancelReason: subscription?.cancelReason || null,
        overrideNote: subscription?.overrideNote || null,
      },
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
        walletCurrency: wallet?.currency ?? 'DZD',
      },
      products,
      recentOrders,
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
