import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const settings = await db.platformSettings.findUnique({
      where: { id: 'global' }
    });

    if (!settings) {
      return NextResponse.json({ success: true, data: {} });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch platform settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { isUpgradeFreePromo, upgradeFeaturesConfig, headerFooterConfig } = body;

    const oldSettings = await db.platformSettings.findUnique({
      where: { id: 'global' }
    });

    const updateData: any = {
      updatedBy: session.user.id
    };
    if (isUpgradeFreePromo !== undefined) updateData.isUpgradeFreePromo = isUpgradeFreePromo;
    if (upgradeFeaturesConfig !== undefined) updateData.upgradeFeaturesConfig = JSON.stringify(upgradeFeaturesConfig);
    if (headerFooterConfig !== undefined) updateData.headerFooterConfig = JSON.stringify(headerFooterConfig);

    const settings = await db.platformSettings.upsert({
      where: { id: 'global' },
      update: updateData,
      create: {
        id: 'global',
        isUpgradeFreePromo: isUpgradeFreePromo ?? true,
        upgradeFeaturesConfig: upgradeFeaturesConfig ? JSON.stringify(upgradeFeaturesConfig) : '{}',
        headerFooterConfig: headerFooterConfig ? JSON.stringify(headerFooterConfig) : '{}',
        updatedBy: session.user.id
      }
    });

    // Audit log
    await db.settingsAuditLog.create({
      data: {
        entity: 'PlatformSettings',
        field: 'isUpgradeFreePromo / upgradeFeaturesConfig',
        oldValue: oldSettings ? JSON.stringify(oldSettings) : 'null',
        newValue: JSON.stringify(settings),
        changedBy: session.user.id
      }
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update platform settings' },
      { status: 500 }
    );
  }
}
