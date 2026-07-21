import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encryptKeys, decryptKeys } from '@/lib/utils/encryption';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let modeSettings = await db.shippingModeSettings.findFirst();
    if (!modeSettings) {
      modeSettings = await db.shippingModeSettings.create({
        data: {
          activeMode: 'hybrid',
          allowMerchantDirect: true,
          allowPlatformAccount: true,
          allowPrivateFleet: true,
          holdBufferHours: 24,
        },
      });
    }

    const platformCarriers = await db.carrierIntegration.findMany({
      where: { scope: 'platform' },
    });

    const sanitizedCarriers = platformCarriers.map(c => ({
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
      platformCarriers: sanitizedCarriers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activeMode, holdBufferHours, carrierKey, carrierName, keys, isActive, isSandbox } = body;

    // 1. Update Mode Settings if provided
    let modeSettings = await db.shippingModeSettings.findFirst();
    if (activeMode || holdBufferHours !== undefined) {
      if (modeSettings) {
        modeSettings = await db.shippingModeSettings.update({
          where: { id: modeSettings.id },
          data: {
            activeMode: activeMode || modeSettings.activeMode,
            holdBufferHours: holdBufferHours !== undefined ? holdBufferHours : modeSettings.holdBufferHours,
            allowMerchantDirect: activeMode === 'hybrid' || activeMode === 'direct_keys_only',
            allowPlatformAccount: activeMode === 'hybrid' || activeMode === 'platform_account_only',
            allowPrivateFleet: activeMode === 'hybrid' || activeMode === 'private_fleet_only',
          },
        });
      } else {
        modeSettings = await db.shippingModeSettings.create({
          data: {
            activeMode: activeMode || 'hybrid',
            holdBufferHours: holdBufferHours !== undefined ? holdBufferHours : 24,
            allowMerchantDirect: activeMode === 'hybrid' || activeMode === 'direct_keys_only',
            allowPlatformAccount: activeMode === 'hybrid' || activeMode === 'platform_account_only',
            allowPrivateFleet: activeMode === 'hybrid' || activeMode === 'private_fleet_only',
          },
        });
      }
    }

    // 2. Update Carrier Keys if provided
    if (carrierKey) {
      const existing = await db.carrierIntegration.findFirst({
        where: { scope: 'platform', carrierKey },
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
            carrierKey,
            carrierName: carrierName || carrierKey,
            scope: 'platform',
            encryptedKeys: encrypted || encryptKeys({}),
            isActive: isActive !== undefined ? isActive : true,
            isSandbox: isSandbox !== undefined ? isSandbox : false,
          },
        });
      }
    }

    return NextResponse.json({ success: true, modeSettings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
