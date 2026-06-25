import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/chat-settings
// Fetches the global chat configuration (accessible to authenticated users to check state)
export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();

    const chatEnabledSetting = await db.systemSetting.findUnique({
      where: { key: 'chat_enabled' },
    });
    const chatBlacklistSetting = await db.systemSetting.findUnique({
      where: { key: 'chat_blacklist' },
    });

    const chatEnabled = chatEnabledSetting ? chatEnabledSetting.value === 'true' : true;
    const blacklistRaw = chatBlacklistSetting ? chatBlacklistSetting.value : '';
    const blacklist = blacklistRaw ? blacklistRaw.split(',').map((w) => w.trim()).filter(Boolean) : [];

    return NextResponse.json({
      success: true,
      chatEnabled,
      blacklist,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/admin/chat-settings
// Updates global chat settings (Admin only)
export async function POST(req: NextRequest) {
  try {
    await ensureDbConnection();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { chatEnabled, blacklist } = body;

    const chatEnabledStr = chatEnabled === false ? 'false' : 'true';
    const blacklistStr = Array.isArray(blacklist) ? blacklist.join(',') : String(blacklist || '');

    // Upsert chat_enabled
    await db.systemSetting.upsert({
      where: { key: 'chat_enabled' },
      update: {
        value: chatEnabledStr,
        updatedBy: session.user.id,
      },
      create: {
        key: 'chat_enabled',
        value: chatEnabledStr,
        updatedBy: session.user.id,
      },
    });

    // Upsert chat_blacklist
    await db.systemSetting.upsert({
      where: { key: 'chat_blacklist' },
      update: {
        value: blacklistStr,
        updatedBy: session.user.id,
      },
      create: {
        key: 'chat_blacklist',
        value: blacklistStr,
        updatedBy: session.user.id,
      },
    });

    // Log the action in AdminAuditLog
    try {
      await (db as any).adminAuditLog.create({
        data: {
          adminId: session.user.id,
          action: 'UPDATE_CHAT_SETTINGS',
          targetId: 'chat_settings',
          details: JSON.stringify({ chatEnabled, blacklist }),
        },
      });
    } catch (logErr) {
      console.warn('Could not write to adminAuditLog:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Chat settings updated successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
