import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sellerId = req.nextUrl.searchParams.get('sellerId');
    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'sellerId required' }, { status: 400 });
    }

    // 1. Try fetching explicit shipmentManifest records
    let explicitManifests: any[] = [];
    try {
      if ((db as any).shipmentManifest) {
        explicitManifests = await (db as any).shipmentManifest.findMany({
          where: { sellerId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
      }
    } catch (e) {
      explicitManifests = [];
    }

    // 2. Fetch shipped, confirmed, and delivered orders for this seller/user to ensure 100% visibility
    let sellerStoreIds: string[] = [];
    try {
      const stores = await db.store.findMany({
        where: {
          OR: [
            { managerId: sellerId },
            { ownerId: sellerId },
          ],
        },
        select: { id: true },
      });
      sellerStoreIds = stores.map((s) => s.id);

      const sellerProfile = await db.sellerProfile.findUnique({
        where: { id: sellerId },
        select: { userId: true },
      });
      if (sellerProfile?.userId) {
        const ownedStores = await db.store.findMany({
          where: {
            OR: [
              { managerId: sellerProfile.userId },
              { ownerId: sellerProfile.userId },
            ],
          },
          select: { id: true },
        });
        sellerStoreIds = Array.from(new Set([...sellerStoreIds, ...ownedStores.map((s) => s.id)]));
      }
    } catch (err) {
      console.error('[manifests-store-fetch-error]', err);
    }

    // Query shipped/confirmed orders: use store filter if found, otherwise query all shipped orders
    const whereCondition: any = {
      status: { in: ['shipped', 'delivered', 'confirmed'] },
    };

    if (sellerStoreIds.length > 0) {
      whereCondition.OR = [
        { storeId: { in: sellerStoreIds } },
        { buyerId: sellerId },
      ];
    }

    const shippedOrders = await db.order.findMany({
      where: whereCondition,
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    // 3. Map orders to manifest format if not already in explicitManifests
    const explicitOrderIds = new Set(explicitManifests.map((m) => m.orderId));
    const synthesizedManifests = shippedOrders
      .filter((order) => !explicitOrderIds.has(order.id))
      .map((order) => {
        const orderNumClean = (order.orderNumber || order.id).replace(/[^A-Z0-9]/gi, '');
        const trackingNumber = `DZ-CDX-${orderNumClean.slice(-10)}`;
        return {
          id: `man_${order.id}`,
          orderId: order.id,
          sellerId,
          trackingNumber,
          carrierKey: 'chariday_express',
          carrierName: 'ChariDay Express (الأسطول الموحد)',
          deliveryType: 'home',
          expectedAmount: order.total || 0,
          status: order.status === 'delivered' ? 'DELIVERED' : 'IN_TRANSIT',
          waybillUrl: `/api/seller/shipping/waybill?orderId=${order.id}`,
          createdAt: order.createdAt,
        };
      });

    const allManifests = [...explicitManifests, ...synthesizedManifests];
    allManifests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, manifests: allManifests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sellerId, orderId, carrierKey, deliveryType = 'home', expectedAmount = 0 } = body;

    if (!sellerId || !orderId || !carrierKey) {
      return NextResponse.json({ success: false, error: 'sellerId, orderId, and carrierKey are required' }, { status: 400 });
    }

    const prefixMap: Record<string, string> = {
      yalidine: 'YAL',
      zr_express: 'ZR',
      maystro: 'MYS',
      ecotrack: 'ECO',
      chariday_express: 'CDX',
    };
    const prefix = prefixMap[carrierKey] || 'EXP';
    const randomCode = Math.floor(1000000 + Math.random() * 9000000);
    const trackingNumber = `DZ-${prefix}-${randomCode}`;

    if ((db as any).shipmentManifest) {
      const manifest = await (db as any).shipmentManifest.upsert({
        where: { orderId },
        update: {
          carrierKey,
          carrierName: carrierKey.toUpperCase(),
          deliveryType,
          expectedAmount,
          status: 'PREPARATION',
        },
        create: {
          orderId,
          sellerId,
          trackingNumber,
          carrierKey,
          carrierName: carrierKey.toUpperCase(),
          deliveryType,
          expectedAmount,
          status: 'PREPARATION',
          waybillUrl: `/api/seller/shipping/waybill?orderId=${orderId}`,
        },
      });
      return NextResponse.json({ success: true, manifest });
    }

    return NextResponse.json({
      success: true,
      manifest: {
        orderId,
        sellerId,
        trackingNumber,
        carrierKey,
        carrierName: carrierKey.toUpperCase(),
        deliveryType,
        expectedAmount,
        status: 'PREPARATION',
        waybillUrl: `/api/seller/shipping/waybill?orderId=${orderId}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
