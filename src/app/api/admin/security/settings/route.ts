import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// Default security settings
const SECURITY_DEFAULTS: Record<string, string | number | boolean> = {
  withdrawal_hold_hours: 48,
  require_2fa_for_withdrawal: false,
  max_sessions_per_user: 5,
  session_lifetime_days: 30,
  login_attempt_limit: 5,
  login_lockout_minutes: 15,
  mfa_grace_period_hours: 0,
  alert_on_new_device: true,
  alert_on_sensitive_change: true,
  require_two_person_approval: true,
};

// GET /api/admin/security/settings
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const keys = Object.keys(SECURITY_DEFAULTS).map(k => `security_${k}`);

    const settings = await db.systemSetting.findMany({
      where: { key: { in: keys } }
    });

    const settingsMap: Record<string, any> = { ...SECURITY_DEFAULTS };
    for (const s of settings) {
      const shortKey = s.key.replace('security_', '');
      settingsMap[shortKey] = s.value;
    }

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error) {
    console.error('[admin/security/settings GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PATCH /api/admin/security/settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const upserts = [];
    for (const [key, value] of Object.entries(body)) {
      if (key in SECURITY_DEFAULTS) {
        upserts.push(
          db.systemSetting.upsert({
            where: { key: `security_${key}` },
            update: { value: value as any, updatedBy: session.user.id },
            create: { key: `security_${key}`, value: value as any, updatedBy: session.user.id }
          })
        );
      }
    }

    await db.$transaction(upserts);

    // Admin audit log
    await db.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_SECURITY_SETTINGS',
        details: body,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    });

    return NextResponse.json({ success: true, message: 'تم حفظ إعدادات الأمان بنجاح.' });
  } catch (error) {
    console.error('[admin/security/settings PATCH]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
