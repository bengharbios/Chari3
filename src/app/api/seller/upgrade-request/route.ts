import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/better-auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || (session.user as any).role !== 'seller') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sellerProfile = await db.sellerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!sellerProfile) {
      return NextResponse.json({ success: false, error: 'Seller profile not found' }, { status: 404 });
    }

    if (sellerProfile.wantsUpgrade) {
      return NextResponse.json({ success: false, error: 'Upgrade request already pending' }, { status: 400 });
    }

    await db.sellerProfile.update({
      where: { id: sellerProfile.id },
      data: {
        wantsUpgrade: true,
        upgradeRequestedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/seller/upgrade-request] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
