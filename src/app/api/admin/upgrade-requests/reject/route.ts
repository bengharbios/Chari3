import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/better-auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true }
    });

    if (!user || user.role !== 'seller' || !user.sellerProfile) {
      return NextResponse.json({ success: false, error: 'Invalid user or not a seller' }, { status: 400 });
    }

    if (!user.sellerProfile.wantsUpgrade) {
      return NextResponse.json({ success: false, error: 'Seller has not requested an upgrade' }, { status: 400 });
    }

    await db.sellerProfile.update({
      where: { id: user.sellerProfile.id },
      data: { wantsUpgrade: false, upgradeRequestedAt: null }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/admin/upgrade-requests/reject] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
