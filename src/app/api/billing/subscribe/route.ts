import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/billing/subscribe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, packageId, billingCycle, addons, paymentMethod } = body as {
      userId: string;
      packageId: string;
      billingCycle: 'MONTHLY' | 'ANNUAL';
      paymentMethod?: 'receipt' | 'wallet' | 'free';
      addons: {
        mobileApp?: boolean;
        whatsapp?: boolean;
        crm?: boolean;
        pos?: boolean;
        extraPos?: number;
      };
    };

    if (!userId || !packageId || !billingCycle) {
      return NextResponse.json(
        { success: false, error: 'userId, packageId, and billingCycle are required' },
        { status: 400 }
      );
    }

    // ─── 1. Check for existing pending request ────────────────────────────
    const pendingRequest = await db.subscription.findFirst({
      where: {
        userId,
        status: { in: ['PENDING_APPROVAL', 'PENDING_PAYMENT'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (pendingRequest) {
      return NextResponse.json({
        success: false,
        error: 'لديك طلب اشتراك سابق قيد المراجعة. يرجى انتظار موافقة الإدارة أو إلغاء الطلب السابق.',
        errorEn: 'You have a pending subscription request. Please wait for admin approval or cancel the previous request.',
        pendingSubscriptionId: pendingRequest.id,
      }, { status: 409 });
    }

    // ─── 2. Fetch the target package ──────────────────────────────────────
    const pkg = await db.sellerPackage.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    // ─── 3. Check billing settings ────────────────────────────────────────
    const settingKeys = [
      'billing_enable_subscriptions',
      'billing_enable_trial',
      'billing_trial_days',
      'billing_default_package_id',
    ];
    const settingsRows = await db.systemSetting.findMany({
      where: { key: { in: settingKeys } },
    });
    const settingsMap: Record<string, any> = {};
    for (const row of settingsRows) {
      settingsMap[row.key] = row.value;
    }

    const subscriptionsEnabled = settingsMap['billing_enable_subscriptions'] === 'true' || settingsMap['billing_enable_subscriptions'] === true;
    if (!subscriptionsEnabled) {
      return NextResponse.json(
        { success: false, error: 'Subscription billing is disabled globally' },
        { status: 400 }
      );
    }

    const defaultPackageId = settingsMap['billing_default_package_id'] || null;

    // ─── 4. Check current active subscription ─────────────────────────────
    const currentSub = await db.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { package: true },
    });

    const now = new Date();
    let actionType: 'subscribe' | 'upgrade' = 'subscribe';
    let proRataCredit = 0;
    let daysRemaining = 0;
    let totalDaysInCycle = 30;

    // ─── 5. Determine Subscribe vs Upgrade ────────────────────────────────
    if (currentSub && currentSub.package) {
      const isFreePlan = currentSub.package.price === 0 || currentSub.packageId === defaultPackageId;

      if (!isFreePlan) {
        // User has a paid plan → this is an UPGRADE
        actionType = 'upgrade';

        // Check if target package is higher priced
        if (pkg.price <= currentSub.package.price) {
          return NextResponse.json({
            success: false,
            error: 'لا يمكنك الترقية إلى باقة بنفس السعر أو أقل. يرجى اختيار باقة أعلى.',
            errorEn: 'Cannot upgrade to a plan with the same or lower price. Please choose a higher plan.',
          }, { status: 400 });
        }

        // Calculate pro-rata credit for remaining days
        if (currentSub.endDate) {
          const endTime = new Date(currentSub.endDate).getTime();
          const startTime = new Date(currentSub.startDate).getTime();
          const nowTime = now.getTime();

          totalDaysInCycle = Math.max(1, Math.ceil((endTime - startTime) / 86400000));
          daysRemaining = Math.max(0, Math.ceil((endTime - nowTime) / 86400000));

          const oldMonthlyPrice = currentSub.totalMonthly || currentSub.package.price;
          const dailyRate = oldMonthlyPrice / totalDaysInCycle;
          proRataCredit = Math.round(dailyRate * daysRemaining * 100) / 100;
        }
      }
      // If free plan → treat as new subscription (actionType stays 'subscribe')
    }

    // ─── 6. Compute pricing ───────────────────────────────────────────────
    const ADDON_PRICES: Record<string, number> = {
      mobileApp: 500,
      whatsapp: 300,
      crm: 400,
      pos: 600,
    };
    const POS_EXTRA_PRICE = 200;

    let addonsTotal = 0;
    const addonsObj = addons || {};
    if (addonsObj.mobileApp) addonsTotal += ADDON_PRICES.mobileApp;
    if (addonsObj.whatsapp) addonsTotal += ADDON_PRICES.whatsapp;
    if (addonsObj.crm) addonsTotal += ADDON_PRICES.crm;
    if (addonsObj.pos) addonsTotal += ADDON_PRICES.pos;
    if (addonsObj.extraPos && addonsObj.extraPos > 0) addonsTotal += addonsObj.extraPos * POS_EXTRA_PRICE;

    const newMonthlyPrice = pkg.price + addonsTotal;

    // Apply annual discount (20%)
    const annualDiscount = billingCycle === 'ANNUAL' ? 0.2 : 0;
    const discountedMonthly = newMonthlyPrice * (1 - annualDiscount);

    // Compute endDate
    const endDate = new Date(now);
    if (billingCycle === 'ANNUAL') {
      endDate.setDate(endDate.getDate() + 365);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    // Compute invoice amount
    let invoiceAmount: number;
    if (actionType === 'upgrade') {
      // Upgrade: charge proportional amount for remaining days minus credit
      const newDailyRate = discountedMonthly / 30;
      const upgradeChargeForRemaining = Math.round(newDailyRate * daysRemaining * 100) / 100;
      invoiceAmount = Math.max(0, upgradeChargeForRemaining - proRataCredit);
    } else {
      invoiceAmount = billingCycle === 'ANNUAL' ? discountedMonthly * 12 : discountedMonthly;
    }

    const isFree = invoiceAmount === 0 && pkg.price === 0;

    // ─── 7. Expire current subscription if upgrading ──────────────────────
    if (actionType === 'upgrade' && currentSub) {
      await db.subscription.update({
        where: { id: currentSub.id },
        data: { status: 'EXPIRED', cancelReason: `ترقية إلى ${pkg.name}` },
      });
    }

    // ─── 8. Create new subscription ───────────────────────────────────────
    const subscription = await db.subscription.create({
      data: {
        userId,
        packageId,
        billingCycle,
        status: 'PENDING_APPROVAL',
        startDate: now,
        endDate: actionType === 'upgrade' ? (currentSub?.endDate || endDate) : endDate,
        trialEndsAt: null,
        addons: JSON.stringify(addonsObj),
        addonsTotal,
        totalMonthly: discountedMonthly,
      },
    });

    // ─── 9. Create invoice ────────────────────────────────────────────────
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7);

    const invoiceItems: { label: string; amount: number }[] = [];
    if (actionType === 'upgrade') {
      invoiceItems.push({
        label: `ترقية من ${currentSub?.package?.name || 'الباقة السابقة'} إلى ${pkg.name} (${daysRemaining} يوم متبقٍ)`,
        amount: invoiceAmount,
      });
      if (proRataCredit > 0) {
        invoiceItems.push({
          label: `رصيد متبقي من الباقة السابقة (خصم)`,
          amount: -proRataCredit,
        });
      }
    } else {
      invoiceItems.push({
        label: `اشتراك ${pkg.name} (${billingCycle === 'ANNUAL' ? 'سنوي' : 'شهري'})`,
        amount: billingCycle === 'ANNUAL' ? pkg.price * 12 * (1 - annualDiscount) : pkg.price,
      });
      if (addonsTotal > 0) {
        invoiceItems.push({
          label: 'إضافات',
          amount: billingCycle === 'ANNUAL' ? addonsTotal * 12 * (1 - annualDiscount) : addonsTotal,
        });
      }
    }

    // Fetch wallet currency
    const wallet = await db.wallet.findUnique({ where: { userId } });
    const currency = wallet?.currency || 'DZD';

    const invoice = await db.invoice.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        type: actionType === 'upgrade' ? 'UPGRADE' : 'SUBSCRIPTION',
        status: isFree ? 'PAID' : 'PENDING',
        amount: Math.max(0, invoiceAmount),
        amountPaid: isFree ? invoiceAmount : 0,
        currency,
        periodStart: now,
        periodEnd: actionType === 'upgrade' ? (currentSub?.endDate || endDate) : endDate,
        dueDate,
        paidAt: isFree ? now : null,
        items: JSON.stringify(invoiceItems),
      },
    });

    // ─── 10. Handle wallet payment if requested ───────────────────────────
    if (paymentMethod === 'wallet' && !isFree && wallet) {
      if (wallet.balance >= invoiceAmount) {
        const newBalance = wallet.balance - invoiceAmount;
        await db.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance, totalSpent: wallet.totalSpent + invoiceAmount },
        });
        await db.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'SUBSCRIPTION_PAYMENT',
            amount: -invoiceAmount,
            balance: newBalance,
            description: actionType === 'upgrade'
              ? `دفع ترقية إلى ${pkg.name}`
              : `دفع اشتراك ${pkg.name} (${billingCycle === 'ANNUAL' ? 'سنوي' : 'شهري'})`,
            referenceId: invoice.id,
          },
        });
        await db.invoice.update({
          where: { id: invoice.id },
          data: { status: 'PAID', amountPaid: invoiceAmount, paidAt: now },
        });
      }
    }

    // ─── 11. Send notification to admins ───────────────────────────────────
    try {
      const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
      const adminUsers = await db.user.findMany({
        where: { role: 'admin' },
        select: { id: true },
        take: 5,
      });
      for (const admin of adminUsers) {
        await db.notification.create({
          data: {
            title: actionType === 'upgrade' ? 'طلب ترقية باقة جديد 📦' : 'طلب اشتراك جديد 📦',
            titleEn: actionType === 'upgrade' ? 'New Upgrade Request 📦' : 'New Subscription Request 📦',
            body: `${user?.name || 'تاجر'} يطلب ${actionType === 'upgrade' ? 'ترقية إلى' : 'الاشتراك في'} ${pkg.name} — ${currency} ${invoiceAmount.toLocaleString()}`,
            bodyEn: `${user?.name || 'Merchant'} requests ${actionType === 'upgrade' ? 'upgrade to' : 'subscription to'} ${pkg.nameEn || pkg.name} — ${currency} ${invoiceAmount.toLocaleString()}`,
            type: 'billing_request',
            data: JSON.stringify({ subscriptionId: subscription.id, invoiceId: invoice.id, actionType }),
            userId: admin.id,
          },
        });
      }
    } catch (notifErr) {
      console.error('[billing/subscribe] notification error:', notifErr);
    }

    return NextResponse.json({
      success: true,
      actionType,
      subscription,
      invoice,
      proRataCredit,
      daysRemaining,
      invoiceAmount: Math.max(0, invoiceAmount),
    });
  } catch (err) {
    console.error('[billing/subscribe POST]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
