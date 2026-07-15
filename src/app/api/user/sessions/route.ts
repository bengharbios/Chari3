import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';

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

// GET /api/user/sessions - Get all active sessions for current user
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("better-auth.session_token")?.value || req.cookies.get("__Secure-better-auth.session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: true }
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const activeSessions = await db.session.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const currentToken = sessionToken;

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
        isCurrent: s.token === currentToken
      };
    });

    return NextResponse.json({
      success: true,
      sessions: formattedSessions
    });
  } catch (error) {
    console.error('[sessions GET] Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/user/sessions - Revoke / terminate a session
export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("better-auth.session_token")?.value || req.cookies.get("__Secure-better-auth.session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: true }
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const sessionToRevoke = await db.session.findUnique({
      where: { id: sessionId }
    });

    if (!sessionToRevoke || sessionToRevoke.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Session not found or access denied' }, { status: 404 });
    }

    await db.session.delete({
      where: { id: sessionId }
    });

    // Log AuditLog
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'session_revoked',
        details: JSON.stringify({ sessionId, ip: req.headers.get('x-forwarded-for') || '127.0.0.1' })
      }
    });

    return NextResponse.json({ success: true, message: 'تم إنهاء الجلسة بنجاح.' });
  } catch (error) {
    console.error('[sessions DELETE] Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
