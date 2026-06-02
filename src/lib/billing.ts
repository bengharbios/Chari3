import { db } from './db';

/**
 * Checks the merchant's current wallet balance against the global debt limit.
 * Suspends the store/user and hides products if debt limit is exceeded.
 * Restores them if the debt is cleared.
 */
export async function checkAndEnforceDebtLimit(userId: string, currentBalance: number) {
  try {
    // Retrieve global debt limit setting (default to -5000 DZD)
    const limitSetting = await db.systemSetting.findUnique({
      where: { key: 'global_debt_limit' },
    });
    const debtLimit = limitSetting ? parseFloat(String(limitSetting.value)) : -5000;

    const isSuspended = currentBalance < debtLimit;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { store: true, sellerProfile: true },
    });

    if (!user) return;

    if (user.role === 'store_manager' && user.store) {
      // Toggle store status
      await db.store.update({
        where: { id: user.store.id },
        data: { isActive: !isSuspended },
      });

      // Update product statuses: hide them if suspended, activate if not
      await db.product.updateMany({
        where: { storeId: user.store.id, status: isSuspended ? 'active' : 'draft' },
        data: { status: isSuspended ? 'draft' : 'active' },
      });
    } else if (user.role === 'seller' && user.sellerProfile) {
      // Toggle user account status
      await db.user.update({
        where: { id: userId },
        data: {
          isActive: !isSuspended,
          accountStatus: isSuspended ? 'suspended' : 'active',
        },
      });

      // Hide or show products
      await db.product.updateMany({
        where: { sellerId: user.sellerProfile.id, status: isSuspended ? 'active' : 'draft' },
        data: { status: isSuspended ? 'draft' : 'active' },
      });
    }
  } catch (err) {
    console.error('[checkAndEnforceDebtLimit] error:', err);
  }
}

/**
 * Charges commission for a delivered order.
 */
export async function chargeOrderCommission(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.status !== 'delivered') return;

    // Check if commission was already charged to avoid duplicate charges
    const existingTx = await db.walletTransaction.findFirst({
      where: { referenceId: order.id, type: 'COMMISSION_DEBT' },
    });
    if (existingTx) return;

    // Find the first product to locate the owner merchant
    const firstItem = order.items[0];
    if (!firstItem) return;

    const product = await db.product.findUnique({
      where: { id: firstItem.productId },
      select: { storeId: true, sellerId: true },
    });

    let ownerUserId: string | null = null;
    let commissionRate = 10; // Default 10%

    if (product?.storeId) {
      const store = await db.store.findUnique({
        where: { id: product.storeId },
        include: { package: true },
      });
      if (store) {
        ownerUserId = store.managerId;
        commissionRate = store.package?.commissionRate ?? store.commission ?? 10;
      }
    } else if (product?.sellerId) {
      const seller = await db.sellerProfile.findUnique({
        where: { id: product.sellerId },
        include: { package: true },
      });
      if (seller) {
        ownerUserId = seller.userId;
        commissionRate = seller.package?.commissionRate ?? 10;
      }
    }

    if (!ownerUserId) return;

    // Calculate commission amount
    const commissionAmount = (order.subtotal * commissionRate) / 100;

    // Retrieve or initialize wallet
    let wallet = await db.wallet.findUnique({
      where: { userId: ownerUserId },
    });
    if (!wallet) {
      wallet = await db.wallet.create({
        data: { userId: ownerUserId, balance: 0 },
      });
    }

    const newBalance = wallet.balance - commissionAmount;

    // Record commission transaction
    await db.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'COMMISSION_DEBT',
        amount: -commissionAmount,
        balance: newBalance,
        description: `عمولة مبيعات الطلب #${order.orderNumber} (${commissionRate}%)`,
        referenceId: order.id,
      },
    });

    // Update wallet balance
    await db.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: newBalance,
        totalSpent: wallet.totalSpent + commissionAmount,
      },
    });

    // Enforce outstanding debt limits
    await checkAndEnforceDebtLimit(ownerUserId, newBalance);
  } catch (err) {
    console.error('[chargeOrderCommission] error:', err);
  }
}

/**
 * Reverses a previously charged commission on order return or cancellation.
 */
export async function reverseOrderCommission(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
    });
    if (!order || (order.status !== 'cancelled' && order.status !== 'returned')) return;

    // Retrieve the matching commission debt transaction
    const commissionTx = await db.walletTransaction.findFirst({
      where: { referenceId: order.id, type: 'COMMISSION_DEBT' },
    });
    if (!commissionTx) return;

    // Verify if it was already reversed
    const existingReversal = await db.walletTransaction.findFirst({
      where: { referenceId: order.id, type: 'COMMISSION_REVERSAL' },
    });
    if (existingReversal) return;

    // Retrieve the wallet
    const wallet = await db.wallet.findUnique({
      where: { id: commissionTx.walletId },
    });
    if (!wallet) return;

    const refundAmount = Math.abs(commissionTx.amount);
    const newBalance = wallet.balance + refundAmount;

    // Record reversal transaction
    await db.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'COMMISSION_REVERSAL',
        amount: refundAmount,
        balance: newBalance,
        description: `إرجاع عمولة الطلب #${order.orderNumber} (إلغاء/إرجاع)`,
        referenceId: order.id,
      },
    });

    // Update wallet balance
    await db.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: newBalance,
        totalSpent: Math.max(0, wallet.totalSpent - refundAmount),
      },
    });

    // Re-verify debt limit enforcement (un-suspend if positive/cleared)
    await checkAndEnforceDebtLimit(wallet.userId, newBalance);
  } catch (err) {
    console.error('[reverseOrderCommission] error:', err);
  }
}
