import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/withdrawals
export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();

    // Support filtering by status
    const status = req.nextUrl.searchParams.get('status');
    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const withdrawals = await db.withdrawalRequest.findMany({
      where: whereClause,
      include: {
        seller: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // For now, limit to 100
    });

    return NextResponse.json({ success: true, withdrawals });
  } catch (error) {
    console.error('[admin/withdrawals GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
