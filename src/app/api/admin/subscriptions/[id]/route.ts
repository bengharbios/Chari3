import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncStoreStatusWithSubscription } from '@/lib/billing';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/subscriptions/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Subscription ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const {
      status,
      packageId,
      startDate,
      endDate,
      freeCommission,
      overrideNote,
      addDays,
      overriddenBy,
      paymentModel,
    } = body as {
      status?: string;
      packageId?: string;
      addDays?: number;
      startDate?: string;
      endDate?: string;
      freeCommission?: boolean;
      overrideNote?: string;
      overriddenBy?: string;
      paymentModel?: string;
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

    if (startDate !== undefined && startDate !== '') {
      updateData.startDate = new Date(startDate);
    }

    if (endDate !== undefined && endDate !== '') {
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

    if (paymentModel !== undefined) {
      await prisma.sellerProfile.updateMany({
        where: { userId: existing.userId },
        data: { paymentModel }
      });
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

    if (status === 'ACTIVE') {
      // Approve associated invoice and receipt
      const invoices = await prisma.invoice.findMany({ where: { subscriptionId: subscription.id } });
      for (const inv of invoices) {
        await prisma.invoice.update({ 
          where: { id: inv.id }, 
          data: { 
            status: 'PAID',
            ...(updateData.startDate && { periodStart: updateData.startDate as Date }),
            ...(updateData.endDate && { periodEnd: updateData.endDate as Date, dueDate: updateData.endDate as Date })
          } 
        });
        await prisma.debtPaymentReceipt.updateMany({ where: { invoiceId: inv.id }, data: { status: 'approved' } });
      }
      // Expire other active subscriptions for this user
      await prisma.subscription.updateMany({
        where: {
          userId: subscription.userId,
          id: { not: subscription.id },
          status: { in: ['ACTIVE', 'TRIAL'] }
        },
        data: { status: 'EXPIRED', cancelReason: 'ترقية/تفعيل باقة جديدة' }
      });
    } else if (updateData.startDate || updateData.endDate) {
      // Even if not changing status to ACTIVE, sync invoice dates if they were changed
      const invoices = await prisma.invoice.findMany({ where: { subscriptionId: subscription.id } });
      for (const inv of invoices) {
        await prisma.invoice.update({ 
          where: { id: inv.id }, 
          data: { 
            ...(updateData.startDate && { periodStart: updateData.startDate as Date }),
            ...(updateData.endDate && { periodEnd: updateData.endDate as Date, dueDate: updateData.endDate as Date })
          } 
        });
      }
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

// DELETE /api/admin/subscriptions/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Subscription ID is required' }, { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    await prisma.subscription.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/subscriptions/[id] DELETE]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

