import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/billing/renew
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subscriptionId, billingCycle } = body as {
      userId: string;
      subscriptionId: string;
      billingCycle?: 'MONTHLY' | 'ANNUAL';
    };

    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'userId and subscriptionId are required' },
        { status: 400 }
      );
    }

    // Fetch the existing subscription
    const existing = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: { package: true },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    const cycle = billingCycle || existing.billingCycle as 'MONTHLY' | 'ANNUAL';
    const now = new Date();

    // Compute new end date from now (or from current endDate if in the future)
    const baseDate = existing.endDate && existing.endDate > now ? existing.endDate : now;
    const newEndDate = new Date(baseDate);
    if (cycle === 'ANNUAL') {
      newEndDate.setDate(newEndDate.getDate() + 365);
    } else {
      newEndDate.setDate(newEndDate.getDate() + 30);
    }

    // Create a renewal invoice
    const pkg = existing.package;
    const totalMonthly = existing.totalMonthly;
    const invoiceAmount = cycle === 'ANNUAL' ? totalMonthly * 12 : totalMonthly;

    // Update subscription: mark ACTIVE if free, else PENDING_PAYMENT
    const updated = await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'PENDING_APPROVAL',
        billingCycle: cycle,
        endDate: newEndDate,
        renewedAt: now,
      },
    });

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7);

    const invoice = await db.invoice.create({
      data: {
        userId,
        subscriptionId,
        type: 'SUBSCRIPTION',
        status: 'PENDING',
        amount: invoiceAmount,
        amountPaid: 0,
        currency: 'DZD',
        periodStart: baseDate,
        periodEnd: newEndDate,
        dueDate,
        items: JSON.stringify([
          {
            label: `تجديد اشتراك ${pkg?.name ?? ''} (${cycle === 'ANNUAL' ? 'سنوي' : 'شهري'})`,
            amount: invoiceAmount,
          },
        ]),
      },
    });

    return NextResponse.json({ success: true, invoice, subscription: updated });
  } catch (err) {
    console.error('[billing/renew POST]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
