import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/billing/subscription?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    // Fetch the most recent active/trial subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIAL', 'PENDING_PAYMENT', 'SUSPENDED'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Compute days remaining
    let daysRemaining: number | null = null;
    const now = new Date();

    if (subscription.status === 'TRIAL' && subscription.trialEndsAt) {
      const diff = subscription.trialEndsAt.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } else if (subscription.endDate) {
      const diff = subscription.endDate.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Parse addons from JSON string
    let addons: Record<string, unknown> = {};
    try {
      addons = JSON.parse(subscription.addons || '{}');
    } catch {
      addons = {};
    }

    // Fetch the last 3 invoices
    const invoices = await prisma.invoice.findMany({
      where: { userId, subscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    return NextResponse.json({
      subscription: {
        ...subscription,
        addons,
      },
      package: subscription.package,
      daysRemaining,
      invoices,
    });
  } catch (err) {
    console.error('[billing/subscription GET]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
