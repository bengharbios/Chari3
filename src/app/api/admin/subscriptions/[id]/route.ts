import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncStoreStatusWithSubscription } from '@/lib/billing';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/subscriptions/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Subscription ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const {
      status,
      packageId,
      endDate,
      freeCommission,
      overrideNote,
      addDays,
      overriddenBy,
    } = body as {
      status?: string;
      packageId?: string;
      endDate?: string;
      freeCommission?: boolean;
      overrideNote?: string;
      addDays?: number;
      overriddenBy?: string;
    };

    // Fetch current subscription
    const existing = await prisma.subscription.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    // Build update payload
    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (packageId !== undefined) {
      updateData.packageId = packageId;
    }

    if (endDate !== undefined) {
      updateData.endDate = new Date(endDate);
    }

    if (freeCommission !== undefined) {
      updateData.freeCommission = freeCommission;
    }

    if (overrideNote !== undefined) {
      updateData.overrideNote = overrideNote;
    }

    if (overriddenBy !== undefined) {
      updateData.overriddenBy = overriddenBy;
    }

    // Extend end date by N days
    if (addDays && addDays > 0) {
      const baseDate = existing.endDate ? new Date(existing.endDate) : new Date();
      baseDate.setDate(baseDate.getDate() + addDays);
      updateData.endDate = baseDate;
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            wallet: {
              select: {
                balance: true
              }
            }
          },
        },
        package: true,
      },
    });

    if (status !== undefined) {
      await syncStoreStatusWithSubscription(subscription.userId, subscription.status);
    }

    return NextResponse.json({ success: true, subscription });
  } catch (err) {
    console.error('[admin/subscriptions/[id] PATCH]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// GET /api/admin/subscriptions/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Subscription ID is required' }, { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            accountStatus: true,
            wallet: {
              select: {
                balance: true
              }
            }
          },
        },
        package: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscription });
  } catch (err) {
    console.error('[admin/subscriptions/[id] GET]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
