import { db } from './db';

/**
 * Checks the merchant's current wallet balance against the global debt limit.
 * Suspends the store/user and hides products if debt limit is exceeded.
 * Restores them if the debt is cleared.
 */
export async function checkAndEnforceDebtLimit(userId: string, currentBalance: number, currentDebt: number = 0) {
  try {
    // Retrieve global debt limit setting (default to 5000 DZD max debt)
    const limitSetting = await db.systemSetting.findUnique({
      where: { key: 'global_debt_limit' },
    });
    // the setting might be stored as negative (e.g. -5000) or positive
    let debtLimit = limitSetting ? Math.abs(parseFloat(String(limitSetting.value))) : 5000;

    const isSuspended = currentDebt > debtLimit;

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
        data: { userId: ownerUserId, balance: 0, debt: 0 },
      });
    }

    let newBalance = wallet.balance;
    let newDebt = wallet.debt;

    // Deduct commission from balance first, put rest in debt
    if (newBalance >= commissionAmount) {
      newBalance -= commissionAmount;
    } else {
      newDebt += (commissionAmount - newBalance);
      newBalance = 0;
    }

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
        balance: newBalance, // we can just store the remaining balance here
        description: `عمولة مبيعات الطلب #${order.orderNumber} (${rateDesc})`,
        referenceId: order.id,
      },
    });

    // Update wallet balance and debt
    await db.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: newBalance,
        debt: newDebt,
        totalSpent: wallet.totalSpent + commissionAmount,
      },
    });

    // Re-evaluate debt limits
    await checkAndEnforceDebtLimit(ownerUserId, newBalance, newDebt);
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

/**
 * Automatically checks and expires the subscription if the endDate or trialEndsAt has passed.
 * Syncs the store status accordingly (either suspends or downgrades to default plan).
 */
export async function checkAndUpdateExpiredSubscriptions(userId: string) {
  try {
    const activeSub = await db.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeSub) return;

    const now = new Date();
    let isExpired = false;

    if (activeSub.status === 'TRIAL' && activeSub.trialEndsAt && now > activeSub.trialEndsAt) {
      isExpired = true;
    } else if (activeSub.status === 'ACTIVE' && activeSub.endDate && now > activeSub.endDate) {
      isExpired = true;
    }

    if (isExpired) {
      // Load platform default settings
      const expiryActionSetting = await db.systemSetting.findUnique({
        where: { key: 'billing_expiry_action' },
      });
      const defaultPackageSetting = await db.systemSetting.findUnique({
        where: { key: 'billing_default_package_id' },
      });
      const currencySetting = await db.systemSetting.findUnique({
        where: { key: 'currency' },
      });

      const expiryAction = expiryActionSetting ? String(expiryActionSetting.value) : 'suspend';
      const defaultPackageId = defaultPackageSetting ? String(defaultPackageSetting.value) : 'none';
      const currency = currencySetting ? String(currencySetting.value) : 'DZD';

      if (expiryAction === 'downgrade' && defaultPackageId !== 'none') {
        const defaultPackage = await db.sellerPackage.findUnique({
          where: { id: defaultPackageId },
        });

        if (defaultPackage) {
          // 1. Expire the current subscription
          await db.subscription.update({
            where: { id: activeSub.id },
            data: { status: 'EXPIRED' },
          });

          // 2. Create new default package subscription (lifetime subscription)
          const newSub = await db.subscription.create({
            data: {
              userId,
              packageId: defaultPackageId,
              status: 'ACTIVE',
              billingCycle: 'MONTHLY',
              startDate: now,
              endDate: null,
              totalMonthly: defaultPackage.price,
            },
          });

          // 3. Create a paid 0 DZD invoice for it
          const invoiceItems = [{
            label: `اشتراك الباقة الافتراضية (${defaultPackage.name})`,
            amount: defaultPackage.price,
          }];
          await db.invoice.create({
            data: {
              userId,
              subscriptionId: newSub.id,
              type: 'SUBSCRIPTION',
              status: 'PAID',
              amount: defaultPackage.price,
              amountPaid: defaultPackage.price,
              currency,
              periodStart: now,
              periodEnd: null,
              dueDate: now,
              items: JSON.stringify(invoiceItems),
            },
          });

          // 4. Ensure store remains active
          await syncStoreStatusWithSubscription(userId, 'ACTIVE');

          // 5. Send notification to the merchant
          await db.notification.create({
            data: {
              title: 'تنزيل الاشتراك للباقة الافتراضية ⚠️',
              titleEn: 'Subscription Downgraded Automatically ⚠️',
              body: `انتهت صلاحية باقتك السابقة. تم نقل حسابك تلقائياً إلى الباقة الافتراضية (${defaultPackage.name}) للاستمرار في العمل دون توقف.`,
              bodyEn: `Your previous subscription has expired. Your account has been automatically downgraded to the default plan (${defaultPackage.nameEn || defaultPackage.name}) to continue selling without interruption.`,
              type: 'billing_downgrade',
              data: JSON.stringify({ oldPackageId: activeSub.packageId, newPackageId: defaultPackage.id }),
              userId,
            },
          });

          console.log(`[checkAndUpdateExpiredSubscriptions] Subscription ${activeSub.id} for user ${userId} expired. Downgraded to default package ${defaultPackage.id}.`);
          return;
        }
      }

      // Default behavior: Suspend the store
      await db.subscription.update({
        where: { id: activeSub.id },
        data: { status: 'EXPIRED' },
      });
      await syncStoreStatusWithSubscription(userId, 'EXPIRED');

      // Send deactivation notification
      await db.notification.create({
        data: {
          title: 'انتهى اشتراكك وتم تعليق حسابك ⚠️',
          titleEn: 'Subscription Expired & Account Suspended ⚠️',
          body: 'انتهت صلاحية باقتك الحالية وتم تعليق حسابك مؤقتاً. يرجى تجديد الاشتراك لاستئناف البيع.',
          bodyEn: 'Your plan has expired and your account has been temporarily suspended. Please renew your subscription to resume selling.',
          type: 'billing_expiry',
          data: JSON.stringify({ packageId: activeSub.packageId }),
          userId,
        },
      });

      console.log(`[checkAndUpdateExpiredSubscriptions] Subscription ${activeSub.id} for user ${userId} expired and store synced to inactive.`);
    }
  } catch (err) {
    console.error('[checkAndUpdateExpiredSubscriptions] error:', err);
  }
}

