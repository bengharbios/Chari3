import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const bans = await db.bannedEntity.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: bans,
    });
  } catch (error) {
    console.error('[API_ADMIN_BANS_GET]', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { type, value, reason, duration } = body;

    if (!type || !value) {
      return NextResponse.json({ success: false, message: 'Type and value are required' }, { status: 400 });
    }

    let expiresAt: Date | null = null;
    if (duration === '1h') expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    else if (duration === '24h') expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    else if (duration === '1w') expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    else if (duration === '1m') expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    else if (duration && duration !== 'permanent') {
      expiresAt = new Date(duration); // custom date
    }

    const ban = await db.bannedEntity.create({
      data: {
        type,
        value,
        reason,
        expiresAt,
        bannedBy: session.user.id,
      }
    });

    return NextResponse.json({
      success: true,
      data: ban,
    });
  } catch (error) {
    console.error('[API_ADMIN_BANS_POST]', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
