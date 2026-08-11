import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
    console.error('Failed to fetch public menu:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
