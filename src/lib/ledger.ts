import { db } from './db';
import { Prisma } from '@prisma/client';

export type LedgerEntryType = 'credit' | 'debit';
export type LedgerEntryStatus = 'pending_clearance' | 'cleared';

interface CreateLedgerEntryParams {
  userId: string;
  amount: number | Prisma.Decimal;
  type: LedgerEntryType;
  status?: LedgerEntryStatus;
  description?: string;
  referenceNumber?: string;
  orderId?: string;
}

/**
 * Creates a ledger entry using a double-entry accounting approach.
 * Applies row-level locking to prevent race conditions.
 * Enforces idempotency via referenceNumber (e.g. orderId_status).
 */
export async function createLedgerEntry(params: CreateLedgerEntryParams) {
  const { userId, amount, type, status = 'cleared', description, referenceNumber, orderId } = params;

  // Use a transaction to ensure atomicity
  return await db.$transaction(async (tx) => {
    // 1. Fetch wallet with Row-Level Lock (FOR UPDATE)
    // Raw SQL is required in Prisma for actual row-level locking
    const wallets = await tx.$queryRaw<any[]>`
      SELECT id, balance, pendingBalance, availableBalance, debt, totalEarned 
      FROM Wallet 
      WHERE userId = ${userId} 
      FOR UPDATE
    `;

    if (!wallets || wallets.length === 0) {
      throw new Error(`Wallet not found for user ${userId}`);
    }
    const wallet = wallets[0];

    // 2. Idempotency Check
    if (referenceNumber) {
      const existingEntry = await tx.ledgerEntry.findFirst({
        where: { walletId: wallet.id, referenceNumber }
      });
      if (existingEntry) {
        // Already processed, return the existing entry without double-charging
        return existingEntry;
      }
    }

    // 3. Calculate new balances
    const amountDecimal = new Prisma.Decimal(amount);
    let newDebt = new Prisma.Decimal(wallet.debt);
    let newAvailable = new Prisma.Decimal(wallet.availableBalance);
    let newPending = new Prisma.Decimal(wallet.pendingBalance);
    let newTotalEarned = new Prisma.Decimal(wallet.totalEarned);

    // Business Logic for Balances
    // This is highly specific to the marketplace flow.
    // Example: If a driver collects COD, they incur debt.
    // If a seller earns money, it goes to pending.
    if (description?.includes('COD Collection') && type === 'debit') {
        newDebt = newDebt.plus(amountDecimal);
    } else if (description?.includes('Delivery Fee') && type === 'credit') {
        if (status === 'cleared') newAvailable = newAvailable.plus(amountDecimal);
        else newPending = newPending.plus(amountDecimal);
        newTotalEarned = newTotalEarned.plus(amountDecimal);
    } else if (description?.includes('Payout') && type === 'debit') {
        newAvailable = newAvailable.minus(amountDecimal);
    } else if (description?.includes('Debt Settlement') && type === 'credit') {
        newDebt = newDebt.minus(amountDecimal);
    } else if (description?.includes('Order Sale') && type === 'credit') {
        if (status === 'cleared') newAvailable = newAvailable.plus(amountDecimal);
        else newPending = newPending.plus(amountDecimal);
        newTotalEarned = newTotalEarned.plus(amountDecimal);
    }

    // 4. Create the Ledger Entry
    const entry = await tx.ledgerEntry.create({
      data: {
        amount: amountDecimal,
        type,
        status,
        description,
        referenceNumber,
        orderId,
        walletId: wallet.id
      }
    });

    // 5. Update the Wallet
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        debt: newDebt,
        availableBalance: newAvailable,
        pendingBalance: newPending,
        totalEarned: newTotalEarned,
        // Legacy balance updated for backward compatibility
        balance: newAvailable.plus(newPending) 
      }
    });

    return entry;
  });
}

/**
 * Handle reversals (e.g., failed deliveries, returns)
 * Creates a counter-entry on the current date, not backdated.
 */
export async function createReversalEntry(originalReferenceNumber: string, reason: string) {
  return await db.$transaction(async (tx) => {
    const originalEntry = await tx.ledgerEntry.findFirst({
      where: { referenceNumber: originalReferenceNumber }
    });

    if (!originalEntry) {
      throw new Error("Original ledger entry not found for reversal");
    }

    // Idempotency for reversal
    const reversalRef = `REVERSAL_${originalEntry.id}`;
    const existingReversal = await tx.ledgerEntry.findFirst({
      where: { referenceNumber: reversalRef }
    });

    if (existingReversal) return existingReversal;

    const wallets = await tx.$queryRaw<any[]>`
      SELECT id, debt, availableBalance, pendingBalance 
      FROM Wallet 
      WHERE id = ${originalEntry.walletId} 
      FOR UPDATE
    `;
    const wallet = wallets[0];

    const reversalType = originalEntry.type === 'credit' ? 'debit' : 'credit';
    const amountDecimal = new Prisma.Decimal(originalEntry.amount);

    // Reverse balances
    let newDebt = new Prisma.Decimal(wallet.debt);
    let newAvailable = new Prisma.Decimal(wallet.availableBalance);
    let newPending = new Prisma.Decimal(wallet.pendingBalance);

    if (originalEntry.description?.includes('COD Collection')) {
        newDebt = newDebt.minus(amountDecimal); // Remove debt
    } else if (originalEntry.status === 'pending_clearance') {
        newPending = newPending.minus(amountDecimal);
    } else {
        newAvailable = newAvailable.minus(amountDecimal);
    }

    const reversal = await tx.ledgerEntry.create({
      data: {
        amount: amountDecimal,
        type: reversalType,
        status: 'cleared',
        description: `Reversal: ${reason}`,
        referenceNumber: reversalRef,
        orderId: originalEntry.orderId,
        walletId: wallet.id
      }
    });

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        debt: newDebt,
        availableBalance: newAvailable,
        pendingBalance: newPending,
        balance: newAvailable.plus(newPending)
      }
    });

    return reversal;
  });
}
