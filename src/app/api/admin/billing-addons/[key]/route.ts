import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { key: string } }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { key } = params;
    const body = await req.json();
    const { price, isActive } = body;

    const oldAddon = await db.billingAddon.findUnique({
      where: { key }
    });

    if (!oldAddon) {
      return NextResponse.json({ success: false, error: 'Addon not found' }, { status: 404 });
    }

    const addon = await db.billingAddon.update({
      where: { key },
      data: {
        price,
        isActive
      }
    });

    // Audit log
    await db.settingsAuditLog.create({
      data: {
        entity: 'BillingAddon',
        field: 'price / isActive',
        oldValue: JSON.stringify({ price: oldAddon.price, isActive: oldAddon.isActive }),
        newValue: JSON.stringify({ price: addon.price, isActive: addon.isActive }),
        changedBy: session.user.id
      }
    });

    return NextResponse.json({ success: true, data: addon });
  } catch (error) {
    console.error('Error updating addon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update addon' },
      { status: 500 }
    );
  }
}
