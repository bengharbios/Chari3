import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const store = await db.store.findFirst({ where: { managerId: userId } });
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Check if an existing pending or awaiting payment request exists
    const existingRequest = await db.upgradeRequest.findFirst({
      where: {
        storeId: store.id,
        status: { in: ['PENDING', 'AWAITING_PAYMENT', 'READY_FOR_REVIEW'] }
      }
    });

    if (existingRequest) {
      return NextResponse.json({ success: false, error: 'Request already exists' }, { status: 400 });
    }

    const addon = await db.billingAddon.findUnique({ where: { key: 'business_upgrade' } });
    const settings = await db.platformSettings.findUnique({ where: { id: 'global' } });

    const feeSnapshot = addon?.price ?? 0;
    const isFreeSnapshot = settings?.isUpgradeFreePromo ?? true;

    // Actual fee considering promo
    const actualFee = isFreeSnapshot ? 0 : feeSnapshot;

    let invoiceId = null;
    let initialStatus = actualFee > 0 ? 'AWAITING_PAYMENT' : 'READY_FOR_REVIEW';

    // Transaction for atomic creation
    const result = await db.$transaction(async (tx) => {
      let createdInvoiceId = null;

      if (actualFee > 0) {
        const invoice = await tx.invoice.create({
          data: {
            userId,
            type: 'ADDON',
            status: 'PENDING',
            amount: actualFee,
            items: JSON.stringify([{ label: 'ترقية الأعمال - Business Upgrade', amount: actualFee }])
          }
        });
        createdInvoiceId = invoice.id;
      }

      const request = await tx.upgradeRequest.create({
        data: {
          storeId: store.id,
          userId,
          feeSnapshot: actualFee,
          isFreeSnapshot,
          status: initialStatus,
          invoiceId: createdInvoiceId
        }
      });

      return request;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating upgrade request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create upgrade request' },
      { status: 500 }
    );
  }
}
