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
    } else if (user.role === 'seller' && user.sellerProfile) {
      // Toggle user account status
      await db.user.update({
        where: { id: userId },
        data: {
          isActive: !isSuspended,
          accountStatus: isSuspended ? 'suspended' : 'active',
        },
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
    // Check if commission system is enabled in SystemSetting
    const enableCommissionsSetting = await db.systemSetting.findUnique({
      where: { key: 'billing_enable_commissions' }
    });
    const enableCommissions = enableCommissionsSetting ? (enableCommissionsSetting.value === 'true' || enableCommissionsSetting.value === true) : true;
    if (!enableCommissions) return;

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

    if (product?.storeId) {
      const store = await db.store.findUnique({
        where: { id: product.storeId },
      });
      if (store) ownerUserId = store.managerId;
    } else if (product?.sellerId) {
      const seller = await db.sellerProfile.findUnique({
        where: { id: product.sellerId },
      });
      if (seller) ownerUserId = seller.userId;
    }

    if (!ownerUserId) return;

    // Fetch the active/trial subscription to check freeCommission and package details
    const activeSub = await db.subscription.findFirst({
      where: { userId: ownerUserId, status: { in: ['ACTIVE', 'TRIAL'] } },
      include: { package: true }
    });

    // If merchant is exempted from commissions, charge nothing
    if (activeSub?.freeCommission) return;

    // Load dynamic platform default settings
    const defaultCommTypeSetting = await db.systemSetting.findUnique({ where: { key: 'billing_default_commission_type' } });
    const defaultCommValueSetting = await db.systemSetting.findUnique({ where: { key: 'billing_default_commission_value' } });
    
    const defaultCommType = defaultCommTypeSetting ? String(defaultCommTypeSetting.value) : 'percentage';
    const defaultCommValue = defaultCommValueSetting ? parseFloat(String(defaultCommValueSetting.value)) : 10;

    let commissionAmount = 0;

    if (activeSub?.package) {
      // Package commission is always a percentage of order subtotal
      commissionAmount = (order.subtotal * activeSub.package.commissionRate) / 100;
    } else {
      // Use platform default setting
      if (defaultCommType === 'fixed') {
        commissionAmount = defaultCommValue;
      } else {
        commissionAmount = (order.subtotal * defaultCommValue) / 100;
      }
    }

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

    const commPercentage = activeSub?.package 
      ? activeSub.package.commissionRate 
      : (defaultCommType === 'percentage' ? defaultCommValue : null);
    
    const rateDesc = commPercentage !== null ? `${commPercentage}%` : `${defaultCommValue} د.ج`;

    // Record commission transaction
    await db.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'COMMISSION_DEBT',
        amount: -commissionAmount,
        balance: newBalance,
        description: `عمولة مبيعات الطلب #${order.orderNumber} (${rateDesc})`,
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
    // Check if commission system is enabled in SystemSetting
    const enableCommissionsSetting = await db.systemSetting.findUnique({
      where: { key: 'billing_enable_commissions' }
    });
    const enableCommissions = enableCommissionsSetting ? (enableCommissionsSetting.value === 'true' || enableCommissionsSetting.value === true) : true;
    if (!enableCommissions) return;

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

/**
 * Synchronizes store and product activation states based on subscription status.
 * TRIAL, ACTIVE -> Store is active, products are active (restored from draft)
 * PENDING_PAYMENT, EXPIRED, SUSPENDED, CANCELLED -> Store is inactive, products are draft (hidden)
 */
export async function syncStoreStatusWithSubscription(userId: string, subscriptionStatus: string) {
  try {
    const isActive = ['ACTIVE', 'TRIAL'].includes(subscriptionStatus);

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { store: true, sellerProfile: true },
    });

    if (!user) return;

    if (user.role === 'store_manager' && user.store) {
      // Toggle store status
      await db.store.update({
        where: { id: user.store.id },
        data: { isActive },
      });
    } else if (user.role === 'seller' && user.sellerProfile) {
      // Toggle user account status
      await db.user.update({
        where: { id: userId },
        data: {
          isActive,
          accountStatus: isActive ? 'active' : 'suspended',
        },
      });
    }
  } catch (err) {
    console.error('[syncStoreStatusWithSubscription] error:', err);
  }
}
