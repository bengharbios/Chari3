import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

function parseUserAgent(ua: string) {
  let deviceType = 'Desktop';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';

  if (!ua) return { deviceType, os, browser };
  const lower = ua.toLowerCase();

  if (/mobile|android|iphone|ipad|phone/i.test(lower)) {
    deviceType = /ipad|tablet/i.test(lower) ? 'Tablet' : 'Mobile';
  }

  if (lower.includes('windows')) os = 'Windows';
  else if (lower.includes('macintosh') || lower.includes('mac os')) os = 'macOS';
  else if (lower.includes('iphone') || lower.includes('ipad')) os = 'iOS';
  else if (lower.includes('android')) os = 'Android';
  else if (lower.includes('linux')) os = 'Linux';

  if (lower.includes('firefox')) browser = 'Firefox';
  else if (lower.includes('opr/') || lower.includes('opera')) browser = 'Opera';
  else if (lower.includes('edg/')) browser = 'Edge';
  else if (lower.includes('chrome') && !lower.includes('chromium')) browser = 'Chrome';
  else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';

  return { deviceType, os, browser };
}

// GET /api/seller/staff/sessions?userId=xxx&staffUserId=yyy
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const staffUserId = searchParams.get('staffUserId');

    if (!userId || !staffUserId) {
      return NextResponse.json({ success: false, error: 'userId and staffUserId required' }, { status: 400 });
    }

    // Verify manager store
    const store = await db.store.findFirst({
      where: { managerId: userId }
    });

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Verify staffUserId belongs to store
    const staffMapping = await db.storeStaff.findUnique({
      where: {
        storeId_userId: { storeId: store.id, userId: staffUserId }
      }
    });

    if (!staffMapping) {
      return NextResponse.json({ success: false, error: 'Staff member not found in this store' }, { status: 403 });
    }

    // Fetch sessions
    const activeSessions = await db.session.findMany({
      where: { userId: staffUserId },
      orderBy: { createdAt: 'desc' }
    });

    const formattedSessions = activeSessions.map(s => {
      const parsedUA = parseUserAgent(s.userAgent || '');
      const rawIp = s.ipAddress || '127.0.0.1';
      const cleanIp = rawIp.split(',')[0].trim();
      return {
        id: s.id,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        ipAddress: cleanIp,
        deviceType: s.deviceType || parsedUA.deviceType,
        os: s.os || parsedUA.os,
        browser: s.browser || parsedUA.browser,
        countryCode: s.countryCode || '',
        city: s.city || '',
        isCurrent: false
      };
    });

    return NextResponse.json({
      success: true,
      sessions: formattedSessions
    });
  } catch (error) {
    console.error('[GET /api/seller/staff/sessions]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/seller/staff/sessions?userId=xxx&staffUserId=yyy&sessionId=zzz
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const staffUserId = searchParams.get('staffUserId');
    const sessionId = searchParams.get('sessionId');

    if (!userId || !staffUserId || !sessionId) {
      return NextResponse.json({ success: false, error: 'userId, staffUserId and sessionId required' }, { status: 400 });
    }

    // Verify manager store
    const store = await db.store.findFirst({
      where: { managerId: userId }
    });

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Verify staffUserId belongs to store
    const staffMapping = await db.storeStaff.findUnique({
      where: {
        storeId_userId: { storeId: store.id, userId: staffUserId }
      },
      include: {
        user: true
      }
    });

    if (!staffMapping) {
      return NextResponse.json({ success: false, error: 'Staff member not found in this store' }, { status: 403 });
    }

    if (sessionId === 'all') {
      // Revoke all sessions for this staff member
      await db.session.deleteMany({
        where: { userId: staffUserId }
      });

      // Log AuditLog
      await db.auditLog.create({
        data: {
          userId,
          action: 'staff_sessions_revoked_all',
          details: `إنهاء جميع الجلسات النشطة للموظف (${staffMapping.user.name})`,
          detailsEn: `Terminated all active sessions for staff member (${staffMapping.user.nameEn || staffMapping.user.name})`
        }
      });

      return NextResponse.json({ success: true, message: 'تم إنهاء جميع جلسات الموظف بنجاح.' });
    }

    // Verify session belongs to staff
    const sessionToRevoke = await db.session.findUnique({
      where: { id: sessionId }
    });

    if (!sessionToRevoke || sessionToRevoke.userId !== staffUserId) {
      return NextResponse.json({ success: false, error: 'Session not found or access denied' }, { status: 404 });
    }

    // Delete session
    await db.session.delete({
      where: { id: sessionId }
    });

    // Log AuditLog
    await db.auditLog.create({
      data: {
        userId,
        action: 'staff_session_revoked',
        details: `إنهاء جلسة نشطة للموظف (${staffMapping.user.name})`,
        detailsEn: `Terminated active session for staff member (${staffMapping.user.nameEn || staffMapping.user.name})`
      }
    });

    return NextResponse.json({ success: true, message: 'تم إنهاء جلسة الموظف بنجاح.' });
  } catch (error) {
    console.error('[DELETE /api/seller/staff/sessions]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
