import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    const invoice = await db.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    const updatedInvoice = await db.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        amountPaid: invoice.amount
      }
    });

    // Automatically update related upgrade request
    const upgradeRequest = await db.upgradeRequest.findFirst({
      where: { invoiceId: id, status: 'AWAITING_PAYMENT' }
    });

    if (upgradeRequest) {
      await db.upgradeRequest.update({
        where: { id: upgradeRequest.id },
        data: { status: 'READY_FOR_REVIEW' }
      });
    }

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
