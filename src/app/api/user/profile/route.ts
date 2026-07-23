import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/better-auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';

// Helper function to resolve user session with DB fallback
async function getResolvedUserId(req?: NextRequest): Promise<string | null> {
  try {
    const session = await getSession(await headers());
    if (session?.user?.id) return session.user.id;

    // Fallback: Check cookie header manually
    const headerObj = await headers();
    const cookieHeader = headerObj.get('cookie') || req?.headers?.get('cookie') || '';
    const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/) ||
                  cookieHeader.match(/session_token=([^;]+)/) ||
                  cookieHeader.match(/auth_token=([^;]+)/);
    
    if (match && match[1]) {
      const rawToken = decodeURIComponent(match[1]);
      const token = rawToken.split('.')[0];
      const dbSession = await prisma.session.findFirst({
        where: {
          OR: [
            { token: rawToken },
            { token: token },
            { id: token },
          ],
          expiresAt: { gt: new Date() },
        },
        select: { userId: true },
      });
      if (dbSession?.userId) return dbSession.userId;
    }
  } catch (err) {
    console.error('[getResolvedUserId-error]', err);
  }
  return null;
}

// ── GET /api/user/profile ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const userId = await getResolvedUserId(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: 'credential',
      },
      select: { password: true },
    });

    return NextResponse.json({ 
      success: true, 
      user,
      hasPassword: !!account?.password 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// ── PATCH /api/user/profile ───────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getResolvedUserId(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
