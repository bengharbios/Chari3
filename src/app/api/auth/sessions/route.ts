import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/auth/sessions?userId=xxx  → list all active sessions for user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });

    const sessions = await db.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() }, // only active (non-expired)
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        // additional fields from better-auth schema
        countryCode: true,
        city: true,
        browser: true,
        os: true,
        deviceType: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get the current session token from the cookie to mark it
    const currentToken =
      req.cookies.get('better-auth.session_token')?.value ||
      req.cookies.get('__Secure-better-auth.session_token')?.value;

    // Extract current session id from the token (format: id.hash or just id)
    const currentSessionId = currentToken?.split('.')[0];

    const result = sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));

    return NextResponse.json({ success: true, sessions: result });
  } catch (error) {
    console.error('[sessions GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/auth/sessions  { userId, sessionId }  → revoke a specific session
export async function DELETE(req: NextRequest) {
  try {
    const { userId, sessionId } = await req.json();
    if (!userId || !sessionId) {
      return NextResponse.json({ success: false, error: 'userId and sessionId required' }, { status: 400 });
    }

    // Make sure the session belongs to this user
    const session = await db.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found or does not belong to user' }, { status: 404 });
    }

    await db.session.delete({ where: { id: sessionId } });

    // Audit log
    await db.auditLog.create({
      data: {
        userId,
        action: 'session_revoked',
        targetId: sessionId,
        targetType: 'session',
        details: `Session revoked by user. Device: ${session.userAgent?.substring(0, 100) || 'unknown'}`,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[sessions DELETE]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
