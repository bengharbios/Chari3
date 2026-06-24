const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function test() {
  console.log("Starting Admin Dashboard API diagnostic test...");

  // 0. Fetch system currency
  try {
    const currencySetting = await db.systemSetting.findUnique({ where: { key: 'currency' } });
    console.log("✔ 0. System Setting currency:", currencySetting);
  } catch (e) {
    console.error("❌ 0. System Setting currency failed:", e.message);
  }

  // 1. Basic Stats Counts
  try {
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
    console.log("✔ 1. Basic Stats Counts successful:", {
      totalOrders, totalProducts, totalUsers, totalStores, totalSellers, wantsUpgradeCount, activeCouriers, totalCouriers
    });
  } catch (e) {
    console.error("❌ 1. Basic Stats Counts failed:", e.message);
  }

  // 2. Revenue calculation
  try {
    const revenueSum = await db.order.aggregate({
      _sum: { total: true },
    });
    console.log("✔ 2. Revenue calculation successful:", revenueSum);
  } catch (e) {
    console.error("❌ 2. Revenue calculation failed:", e.message);
  }

  // 3. MoM Counts
  try {
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
    console.log("✔ 3. MoM Counts successful");
  } catch (e) {
    console.error("❌ 3. MoM Counts failed:", e.message);
  }

  // 4. Monthly Revenue (Past 12 Months)
  try {
    const now = new Date();
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
    console.log("✔ 4. Monthly Revenue successful");
  } catch (e) {
    console.error("❌ 4. Monthly Revenue failed:", e.message);
  }

  // 5. Orders by Status
  try {
    const statusCounts = await db.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    console.log("✔ 5. Orders by Status successful:", statusCounts);
  } catch (e) {
    console.error("❌ 5. Orders by Status failed:", e.message);
  }

  // 6. Recent Orders
  try {
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
    console.log("✔ 6. Recent Orders successful, count:", recentOrders.length);
  } catch (e) {
    console.error("❌ 6. Recent Orders failed:", e.message);
  }

  // 7. Top Selling Products
  try {
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
    console.log("✔ 7. Top Selling Products successful, count:", dbTopProducts.length);
  } catch (e) {
    console.error("❌ 7. Top Selling Products failed:", e.message);
  }

  // 8. Stores details
  try {
    const storesAgg = await db.store.aggregate({
      _sum: { totalSales: true, totalEarnings: true },
      _avg: { rating: true },
    });
    console.log("✔ 8. Stores details successful:", storesAgg);
  } catch (e) {
    console.error("❌ 8. Stores details failed:", e.message);
  }

  // 9. Users for Management
  try {
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
    console.log("✔ 9. Users for Management successful, count:", users.length);
  } catch (e) {
    console.error("❌ 9. Users for Management failed:", e.message);
  }

  // 10. Fetch all stores
  try {
    const storesList = await db.store.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        manager: { select: { name: true, nameEn: true, email: true } },
        _count: { select: { products: true } },
      },
    });
    console.log("✔ 10. Fetch all stores successful, count:", storesList.length);
  } catch (e) {
    console.error("❌ 10. Fetch all stores failed:", e.message);
  }

  // 11. Fetch all sellers
  try {
    const sellersList = await db.sellerProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, nameEn: true, email: true } },
        _count: { select: { products: true } },
      },
    });
    console.log("✔ 11. Fetch all sellers successful, count:", sellersList.length);
  } catch (e) {
    console.error("❌ 11. Fetch all sellers failed:", e.message);
  }

  await db.$disconnect();
  console.log("Diagnostic complete!");
}

test();
