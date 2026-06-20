import { db } from '@/lib/db';

export class SettlementEngine {
  /**
   * Processes a successful payment.
   * Splits the payment between the platform (commission) and the seller (pending balance).
   */
  static async processSplitPayment(
    orderId: string,
    sellerId: string,
    totalAmount: number,
    commissionAmount: number
  ) {
    const sellerAmount = totalAmount - commissionAmount;

    return db.$transaction(async (tx) => {
      // 1. Get or create seller wallet
      let wallet = await tx.wallet.findUnique({ where: { userId: sellerId } });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: sellerId }
        });
      }

      // 2. Add to Pending Balance for the Seller
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingBalance: { increment: sellerAmount },
          totalEarned: { increment: sellerAmount }
        }
      });

      // 3. Record Wallet Transaction for Seller
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PAYMENT_PENDING',
          amount: sellerAmount,
          balance: wallet.pendingBalance + sellerAmount,
          description: `Payment received for order ${orderId} (Pending)`,
          referenceId: orderId
        }
      });

      // 4. (Optional) Record Commission for Platform Wallet
      // Assuming platform has a master wallet or we just track it via commissionPaid on Order
    });
  }

  /**
   * Moves funds from Pending to Available (e.g. after delivery or dispute period)
   */
  static async clearPendingFunds(sellerId: string, amount: number, referenceId: string) {
    return db.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: sellerId } });
      if (!wallet || wallet.pendingBalance < amount) {
        throw new Error('Insufficient pending balance');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingBalance: { decrement: amount },
          availableBalance: { increment: amount },
          balance: { increment: amount } // update legacy balance
        }
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'FUNDS_CLEARED',
          amount: amount,
          balance: updatedWallet.availableBalance,
          description: `Funds cleared to available balance`,
          referenceId
        }
      });
      
      return updatedWallet;
    });
  }

  /**
   * Processes a payout (withdrawal)
   */
  static async processPayout(sellerId: string, amount: number, referenceId: string) {
    return db.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: sellerId } });
      if (!wallet || wallet.availableBalance < amount) {
        throw new Error('Insufficient available balance for payout');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { decrement: amount },
          balance: { decrement: amount }, // update legacy balance
          paidBalance: { increment: amount }
        }
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PAYOUT',
          amount: -amount,
          balance: updatedWallet.availableBalance,
          description: `Payout processed`,
          referenceId
        }
      });

      return updatedWallet;
    });
  }
}
