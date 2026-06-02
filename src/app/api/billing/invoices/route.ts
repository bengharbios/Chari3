import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/billing/invoices?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          include: {
            package: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, invoices });
  } catch (err) {
    console.error('[billing/invoices GET]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
