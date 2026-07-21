import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sellerId = req.nextUrl.searchParams.get('sellerId');
    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'sellerId required' }, { status: 400 });
    }

    const manifests = await db.shipmentManifest.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, manifests });
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

    // Generate unique tracking number (e.g. DZ-YAL-8923471)
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

    const manifest = await db.shipmentManifest.upsert({
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
        waybillUrl: `/api/seller/shipping/waybill?tracking=${trackingNumber}`,
      },
    });

    return NextResponse.json({ success: true, manifest });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
