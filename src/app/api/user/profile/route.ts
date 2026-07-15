import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';

// ── GET /api/user/profile ─────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
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
// Updates name, phone. Email changes require re-verification (future scope).
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = body;

    if (!name || String(name).trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: String(name).trim(),
        ...(phone !== undefined ? { phone: String(phone).trim() || null } : {}),
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    // AuditLog
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'profile_updated',
        details: { changedFields: Object.keys(body) },
      },
    }).catch(() => {}); // non-critical

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
