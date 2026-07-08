import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const stores = await db.store.findMany({
      where: {
        OR: [
          { managerId: userId },
          { staff: { some: { userId, status: 'active' } } }
        ]
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        logo: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, stores });
  } catch (error) {
    console.error('[seller/stores GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
