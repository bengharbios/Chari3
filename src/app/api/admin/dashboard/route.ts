import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Basic Stats Counts
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalStores,
      totalSellers,
      wantsUpgradeCount,
      activeCouriers,
      totalCouriers,
    ] = await Promise.all([
      db.order.count(),
      db.product.count(),
      db.user.count(),
      db.store.count(),
      db.sellerProfile.count(),
      db.sellerProfile.count({ where: { wantsUpgrade: true } }),
      db.user.count({ where: { role: 'logistics', isActive: true } }),
      db.user.count({ where: { role: 'logistics' } }),
    ]);

    // 2. Revenue calculation
    const revenueSum = await db.order.aggregate({
      _sum: { total: true },
    });
    const totalRevenue = revenueSum._sum.total || 0;

    // 3. Month-over-month counts (this month vs last month)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      ordersThisMonth,
      ordersLastMonth,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
      usersThisMonth,
      usersLastMonth,
      productsThisMonth,
      productsLastMonth,
    ] = await Promise.all([
      db.order.count({ where: { createdAt: { gte: startOfThisMonth } } }),
      db.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      db.order.aggregate({
        where: { createdAt: { gte: startOfThisMonth } },
        _sum: { total: true },
      }),
      db.order.aggregate({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { total: true },
      }),
      db.user.count({ where: { createdAt: { gte: startOfThisMonth } } }),
      db.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      db.product.count({ where: { createdAt: { gte: startOfThisMonth } } }),
      db.product.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    ]);

    const revenueThisMonth = revenueThisMonthAgg._sum.total || 0;
    const revenueLastMonth = revenueLastMonthAgg._sum.total || 0;

    // Calculate percentage change month-over-month
    const getChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
    };

    const revenueChange = getChange(revenueThisMonth, revenueLastMonth);
    const ordersChange = getChange(ordersThisMonth, ordersLastMonth);
    const productsChange = getChange(productsThisMonth, productsLastMonth);
    const usersChange = getChange(usersThisMonth, usersLastMonth);

    // 4. Monthly Revenue (Past 12 Months)
    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const monthRevAgg = await db.order.aggregate({
        where: { createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { total: true },
      });
      const monthLabel = monthStart.toLocaleDateString('ar-EG', { month: 'short' });
      const monthLabelEn = monthStart.toLocaleDateString('en-US', { month: 'short' });

      revenueByMonth.push({
        month: monthLabel,
        monthEn: monthLabelEn,
        revenue: monthRevAgg._sum.total || 0,
      });
    }

    // 5. Orders by Status
    const statusCounts = await db.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusMap = new Map(statusCounts.map((s) => [s.status, s._count.id]));
    const allStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const ordersByStatus = allStatuses.map((status) => ({
      status,
      count: statusMap.get(status) || 0,
    }));

    // 6. Recent Orders
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
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
    });

    // 7. Top Selling Products
    const dbTopProducts = await db.product.findMany({
      orderBy: { soldCount: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        nameEn: true,
        price: true,
        rating: true,
        images: true,
        soldCount: true,
      },
    });

    const topProducts = dbTopProducts.map((p) => {
      let parsedImages = [];
      try {
        parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      } catch (e) {
        parsedImages = [p.images || ''];
      }
      if (!Array.isArray(parsedImages)) {
        parsedImages = [parsedImages];
      }

      return {
        product: {
          id: p.id,
          name: p.name,
          nameEn: p.nameEn,
          price: p.price,
          rating: p.rating,
          images: parsedImages,
        },
        soldCount: p.soldCount,
        revenue: p.soldCount * p.price,
      };
    });

    // 8. Stores details
    const storesAgg = await db.store.aggregate({
      _sum: { totalSales: true, totalEarnings: true },
      _avg: { rating: true },
    });

    // 9. Users for Management
    const users = await db.user.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        nameEn: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        accountStatus: true,
      },
    });

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        revenueChange,
        ordersChange,
        productsChange,
        usersChange,
        revenueByMonth,
        ordersByStatus,
        topProducts,
        recentOrders,
      },
      stats: {
        totalStores,
        totalSalesSum: storesAgg._sum.totalSales || 0,
        totalSellers,
        wantsUpgradeCount,
        activeCouriers,
        totalCouriers,
        avgStoreRating: storesAgg._avg.rating || 5.0,
      },
      users,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/dashboard]', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
