import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfDay, subDays } from 'date-fns';
import { auth, getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { getUserPackageLimits } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user) {
      // Return 403 instead of 401 to prevent the global AuthSync interceptor from force-logging out the user
      // if the session parsing fails in edge cases or if it's truly a stale session.
      // But actually, if they don't have a session, 401 is correct. We just need to parse headers correctly.
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
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
    if (!finalStore && storeId && session.user.role === 'SUPER_ADMIN') {
      finalStore = await db.store.findUnique({
        where: { id: storeId },
        include: { package: true }
      });
    }

    if (!finalStore) {
      return NextResponse.json({ success: false, error: 'Store not found or unauthorized' }, { status: 404 });
    }

    // Feature Toggling: Check if package allows analytics
    const activePackage = await getUserPackageLimits(userId);
    if (!activePackage?.hasAnalytics) {
      return NextResponse.json({ success: false, error: 'Analytics feature not available in your current package.' }, { status: 403 });
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

    // 3. Sales By State (Optimized via GroupBy)
    const stateGroups = await db.order.groupBy({
      by: ['shippingState'],
      where: {
        items: { some: { product: productCondition } },
        createdAt: { gte: startDate, lte: endDate },
        status: orderStatusCondition,
        shippingState: { not: null }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const ordersByState = stateGroups.map(s => ({
      state: s.shippingState || 'Unknown',
      count: s._count.id
    }));

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
