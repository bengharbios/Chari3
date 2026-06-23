import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await db.bannedEntity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API_ADMIN_BANS_DELETE]', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { isActive, duration } = body;

    const data: any = {};
    if (typeof isActive === 'boolean') data.isActive = isActive;
    
    if (duration) {
      if (duration === '1h') data.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      else if (duration === '24h') data.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      else if (duration === '1w') data.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      else if (duration === '1m') data.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      else if (duration === 'permanent') data.expiresAt = null;
      else data.expiresAt = new Date(duration);
    }

    const ban = await db.bannedEntity.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json({ success: true, data: ban });
  } catch (error) {
    console.error('[API_ADMIN_BANS_PATCH]', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
