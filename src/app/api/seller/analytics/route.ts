import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfDay, subDays } from 'date-fns';
import { auth, getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { getUserPackageLimits } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    const storeId = req.nextUrl.searchParams.get('storeId');
    const range = req.nextUrl.searchParams.get('range') || '30days';
    const statusFilter = req.nextUrl.searchParams.get('statusFilter') || 'all';

    // Determine store context and verify authorization
    const store = storeId
      ? await db.store.findFirst({
          where: {
            id: storeId,
            OR: [
              { managerId: userId },
              { staff: { some: { userId } } }
            ]
          },
          include: { package: true }
        })
      : await db.store.findFirst({
          where: {
            OR: [
              { managerId: userId },
              { staff: { some: { userId } } }
            ]
          },
          include: { package: true }
        });

    // Allow SUPER_ADMIN to masquerade if store isn't found by the rules above
    let finalStore = store;
    if (!finalStore && storeId) {
      const userRecord = await db.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      if (userRecord?.role === 'SUPER_ADMIN') {
        finalStore = await db.store.findUnique({
          where: { id: storeId },
          include: { package: true }
        });
      }
    }

    if (!finalStore) {
      return NextResponse.json({ success: false, error: 'Store not found or unauthorized' }, { status: 404 });
    }

    // Feature Toggling: Check if package allows analytics
    const activePackage = await getUserPackageLimits(userId);
    if (!activePackage?.hasAnalytics) {
      return NextResponse.json({ success: false, error: 'Analytics feature not available in your current package.' }, { status: 403 });
    }

    // Sync store package if out of sync with active package
    if (finalStore && activePackage && 'id' in activePackage && finalStore.packageId !== activePackage.id) {
      db.store.update({
        where: { id: finalStore.id },
        data: { packageId: activePackage.id as string }
      }).catch(() => {});
    }

    // Determine date range
    let startDate = new Date(0);
    const endDate = new Date();
    
    if (range === 'today') startDate = startOfDay(new Date());
    else if (range === '7days') startDate = startOfDay(subDays(new Date(), 7));
    else if (range === '30days') startDate = startOfDay(subDays(new Date(), 30));

    // Base filters
    const orderStatusCondition = statusFilter === 'completed' ? { in: ['completed', 'delivered'] } : { notIn: ['cancelled', 'returned'] };
    const productCondition = { storeId: finalStore.id };

    // 1. Top Products (Optimized via GroupBy in DB)
    const topProductsRaw = await db.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: {
        product: productCondition,
        order: {
          createdAt: { gte: startDate, lte: endDate },
          status: orderStatusCondition
        }
      },
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    });

    const topProductIds = topProductsRaw.map(p => p.productId);
    const productDetails = await db.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, nameEn: true }
    });

    const topProducts = topProductsRaw.map(p => {
      const details = productDetails.find(d => d.id === p.productId);
      return {
        id: p.productId,
        name: p.productName,
        nameEn: details?.nameEn || p.productName,
        revenue: Number(p._sum.total || 0),
        sold: Number(p._sum.quantity || 0)
      };
    });

    // 2. Customer Insights (Optimized via GroupBy)
    // First, find buyers who made purchases in this store during the period
    const activeBuyers = await db.order.groupBy({
      by: ['buyerId'],
      where: {
        items: { some: { product: productCondition } },
        createdAt: { gte: startDate, lte: endDate },
        status: orderStatusCondition
      }
    });

    const activeBuyerIds = activeBuyers.map(b => b.buyerId);
    let newCustomers = 0;
    let returningCustomers = 0;

    if (activeBuyerIds.length > 0) {
      // Find out which of these buyers have multiple orders overall for this store
      const buyerHistory = await db.order.groupBy({
        by: ['buyerId'],
        where: {
          buyerId: { in: activeBuyerIds },
          items: { some: { product: productCondition } },
          status: orderStatusCondition
        },
        _count: { id: true }
      });

      buyerHistory.forEach(b => {
        if (b._count.id > 1) returningCustomers++;
        else newCustomers++;
      });
    }

    // 3. Sales By State (Safely parsed from address)
    let ordersByState: { state: string; count: number }[] = [];
    try {
      const recentOrdersForStates = await db.order.findMany({
        where: {
          items: { some: { product: productCondition } },
          createdAt: { gte: startDate, lte: endDate },
          status: orderStatusCondition,
        },
        select: { address: true },
        take: 200,
      });

      const stateCountMap: Record<string, number> = {};
      for (const ord of recentOrdersForStates) {
        let stateName = 'غير محدد';
        if (ord.address) {
          try {
            const parsed = typeof ord.address === 'string' ? JSON.parse(ord.address) : ord.address;
            stateName = parsed?.state || parsed?.wilaya || parsed?.city || (typeof ord.address === 'string' && ord.address.length < 30 ? ord.address : 'الجزائر');
          } catch {
            stateName = (typeof ord.address === 'string' && ord.address.length < 30) ? ord.address : 'الجزائر';
          }
        }
        stateCountMap[stateName] = (stateCountMap[stateName] || 0) + 1;
      }

      ordersByState = Object.entries(stateCountMap)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (err) {
      console.warn('[analytics/ordersByState]', err);
    }

    return NextResponse.json({
      success: true,
      topProducts,
      customerInsights: {
        new: newCustomers,
        returning: returningCustomers
      },
      ordersByState
    });

  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
