import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.platformSettings.findUnique({
      where: { id: 'global' },
    });

    const addon = await db.billingAddon.findUnique({
      where: { key: 'business_upgrade' },
    });

    return NextResponse.json({
      success: true,
      data: {
        price: addon?.price ?? 0,
        isFreePromo: settings?.isUpgradeFreePromo ?? true,
        featuresConfig: settings?.upgradeFeaturesConfig 
          ? JSON.parse(settings.upgradeFeaturesConfig) 
          : [
              { key: 'branches', enabled: true },
              { key: 'team', enabled: true },
              { key: 'taxes', enabled: true },
              { key: 'support', enabled: true }
            ]
      }
    });
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load platform settings' },
      { status: 500 }
    );
  }
}
