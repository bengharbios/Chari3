import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDbConnection();
    const settings = await db.platformSettings.findUnique({
      where: { id: 'global' },
      select: { publicMenuConfig: true }
    });

    return NextResponse.json({
      success: true,
      menuConfig: settings?.publicMenuConfig ? JSON.parse(settings.publicMenuConfig) : []
    });
  } catch (error) {
    console.error('Failed to get menu config:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { menuConfig } = body;

    if (!Array.isArray(menuConfig)) {
      return NextResponse.json({ success: false, error: 'Invalid menu configuration' }, { status: 400 });
    }

    await ensureDbConnection();
    await db.platformSettings.upsert({
      where: { id: 'global' },
      update: { 
        publicMenuConfig: JSON.stringify(menuConfig),
        updatedBy: session.user.id
      },
      create: {
        id: 'global',
        publicMenuConfig: JSON.stringify(menuConfig),
        upgradeFeaturesConfig: '{}', // Required by schema
        updatedBy: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save menu config:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
