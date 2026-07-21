import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encryptKeys } from '@/lib/utils/encryption';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sellerId = req.nextUrl.searchParams.get('sellerId');
    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'sellerId required' }, { status: 400 });
    }

    const modeSettings = (await db.shippingModeSettings.findFirst()) || {
      activeMode: 'hybrid',
      allowMerchantDirect: true,
      allowPlatformAccount: true,
      allowPrivateFleet: true,
      holdBufferHours: 24,
    };

    const merchantCarriers = await db.carrierIntegration.findMany({
      where: { scope: 'merchant', sellerId },
    });

    const sanitized = merchantCarriers.map(c => ({
      id: c.id,
      carrierKey: c.carrierKey,
      carrierName: c.carrierName,
      isActive: c.isActive,
      isSandbox: c.isSandbox,
      hasKeys: !!c.encryptedKeys,
    }));

    return NextResponse.json({
      success: true,
      modeSettings,
      integrations: sanitized,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sellerId, carrierKey, carrierName, keys, isActive, isSandbox } = body;

    if (!sellerId || !carrierKey) {
      return NextResponse.json({ success: false, error: 'sellerId and carrierKey are required' }, { status: 400 });
    }

    const existing = await db.carrierIntegration.findFirst({
      where: { scope: 'merchant', sellerId, carrierKey },
    });

    const encrypted = keys ? encryptKeys(keys) : undefined;

    if (existing) {
      await db.carrierIntegration.update({
        where: { id: existing.id },
        data: {
          carrierName: carrierName || existing.carrierName,
          ...(encrypted ? { encryptedKeys: encrypted } : {}),
          isActive: isActive !== undefined ? isActive : existing.isActive,
          isSandbox: isSandbox !== undefined ? isSandbox : existing.isSandbox,
        },
      });
    } else {
      await db.carrierIntegration.create({
        data: {
          sellerId,
          carrierKey,
          carrierName: carrierName || carrierKey,
          scope: 'merchant',
          encryptedKeys: encrypted || encryptKeys({}),
          isActive: isActive !== undefined ? isActive : true,
          isSandbox: isSandbox !== undefined ? isSandbox : false,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
