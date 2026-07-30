import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLedgerEntry } from '@/lib/ledger';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const walletId = params.id;
    const body = await req.json();
    const { referenceNumber } = body;

    if (!referenceNumber) {
      return NextResponse.json({ success: false, error: 'Reference Number is required to clear debt' }, { status: 400 });
    }

    const wallet = await db.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    if (Number(wallet.debt) <= 0) {
      return NextResponse.json({ success: false, error: 'Wallet has no debt to clear' }, { status: 400 });
    }

    // Use the Ledger Logic to clear the debt
    await createLedgerEntry({
      userId: wallet.userId,
      amount: wallet.debt,
      type: 'credit', // Credit reduces debt in our business logic
      status: 'cleared',
      description: 'Debt Settlement via Admin',
      referenceNumber: `SETTLEMENT_${referenceNumber}_${Date.now()}`
    });

    return NextResponse.json({ success: true, message: 'Debt cleared successfully' });

  } catch (error: any) {
    console.error('Error clearing debt:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
