import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await db.upgradeRequest.findMany({
      where: {
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const userIds = requests.map((r: any) => r.userId);
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      include: { sellerProfile: true }
    });

    const userMap = new Map();
    users.forEach((u: any) => {
      userMap.set(u.id, u);
    });

    const enrichedRequests = requests.map((req: any) => {
      const u = userMap.get(req.userId);
      return {
        ...req,
        user: u ? {
          id: u.id,
          name: u.name,
          email: u.email,
          sellerProfile: u.sellerProfile
        } : null
      };
    });

    return NextResponse.json({ success: true, data: enrichedRequests });
  } catch (error) {
    console.error('Error fetching upgrade requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upgrade requests' },
      { status: 500 }
    );
  }
}
