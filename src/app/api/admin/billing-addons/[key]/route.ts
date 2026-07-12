import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function PUT(req: Request, props: { params: Promise<{ key: string }> }) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { key } = await props.params;
    const body = await req.json();
    const { price, isActive } = body;

    let oldAddon = await db.billingAddon.findUnique({
      where: { key }
    });

    if (!oldAddon && key === 'business_upgrade') {
      oldAddon = await db.billingAddon.create({
        data: {
          key: 'business_upgrade',
          nameAr: 'ترقية الأعمال',
          nameEn: 'Business Upgrade',
          descriptionAr: 'ترقية الحساب من تاجر فردي إلى متجر أعمال متكامل',
          descriptionEn: 'Upgrade account from individual seller to business store',
          price: 0,
          isActive: true
        }
      });
    }

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
