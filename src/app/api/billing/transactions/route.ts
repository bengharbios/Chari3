import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/billing/transactions?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const wallet = await db.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) {
      return NextResponse.json({ success: true, transactions: [] });
    }

    return NextResponse.json({ success: true, transactions: wallet.transactions });
  } catch (error) {
    console.error('[transactions GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
