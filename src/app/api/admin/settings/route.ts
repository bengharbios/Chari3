import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ============================================
// GET — Fetch all system settings
// ============================================
export async function GET() {
  try {
    await ensureDbConnection();
    const settings = await db.systemSetting.findMany();
    
    // Convert array of {key, value} to a single object { [key]: value }
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      settings: settingsObject,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// ============================================
// POST — Upsert system settings
// ============================================
export async function POST(request: Request) {
  try {
    await ensureDbConnection();
    const body = await request.json();
    const { settings, adminId } = body; // settings is an object { key: value }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    const results = [];

    // Loop through the object keys and upsert each setting
    for (const [key, value] of Object.entries(settings)) {
      const setting = await db.systemSetting.upsert({
        where: { key },
        update: {
          value: value as any,
          updatedBy: adminId || 'unknown_admin',
        },
        create: {
          key,
          value: value as any,
          updatedBy: adminId || 'unknown_admin',
        },
      });
      results.push(setting);

      // Log the action in AdminAuditLog
      await db.adminAuditLog.create({
        data: {
          adminId: adminId || 'unknown_admin',
          action: 'UPDATE_SETTING',
          targetId: key,
          details: JSON.stringify({ newValue: value }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      updatedCount: results.length,
    });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
