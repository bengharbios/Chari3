import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function PUT(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { isUpgradeFreePromo, upgradeFeaturesConfig } = body;

    const oldSettings = await db.platformSettings.findUnique({
      where: { id: 'global' }
    });

    const settings = await db.platformSettings.upsert({
      where: { id: 'global' },
      update: {
        isUpgradeFreePromo,
        upgradeFeaturesConfig: JSON.stringify(upgradeFeaturesConfig),
        updatedBy: session.user.id
      },
      create: {
        id: 'global',
        isUpgradeFreePromo,
        upgradeFeaturesConfig: JSON.stringify(upgradeFeaturesConfig),
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
