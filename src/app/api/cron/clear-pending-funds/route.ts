import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

// This endpoint should be triggered by a Cron Job (e.g. Vercel Cron, GitHub Actions) every night
export async function GET(request: Request) {
  try {
    // 1. Find all pending ledger entries older than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const pendingEntries = await db.ledgerEntry.findMany({
      where: {
        status: 'pending_clearance',
        createdAt: {
          lte: threeDaysAgo,
        },
      },
    });

    if (pendingEntries.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending funds to clear.' });
    }

    let clearedCount = 0;

    // 2. Process each entry individually to maintain row-level locking per wallet
    for (const entry of pendingEntries) {
      await db.$transaction(async (tx) => {
        // Lock wallet
        const wallets = await tx.$queryRaw<any[]>`
          SELECT id, pendingBalance, availableBalance, balance 
          FROM Wallet 
          WHERE id = ${entry.walletId} 
          FOR UPDATE
        `;

        if (wallets.length === 0) return;
        const wallet = wallets[0];

        // Update entry status
        await tx.ledgerEntry.update({
          where: { id: entry.id },
          data: { status: 'cleared', updatedAt: new Date() },
        });

        const entryAmount = new Prisma.Decimal(entry.amount);
        const newPending = new Prisma.Decimal(wallet.pendingBalance).minus(entryAmount);
        const newAvailable = new Prisma.Decimal(wallet.availableBalance).plus(entryAmount);

        // Update wallet balances
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            pendingBalance: newPending,
            availableBalance: newAvailable,
            balance: newAvailable.plus(newPending) // Legacy backward compat
          },
        });
      });

      clearedCount++;
    }

    return NextResponse.json({ success: true, cleared: clearedCount });
  } catch (error) {
    console.error('Error clearing pending funds:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
