import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/billing/subscribe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, packageId, billingCycle, addons } = body as {
      userId: string;
      packageId: string;
      billingCycle: 'MONTHLY' | 'ANNUAL';
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

    // Fetch the package
    const pkg = await db.sellerPackage.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    // Fetch platform billing settings from SystemSetting
    const settingKeys = [
      'billing_enable_subscriptions',
      'billing_enable_trial',
      'billing_trial_days',
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

    const trialEnabled = settingsMap['billing_enable_trial'] === 'true' || settingsMap['billing_enable_trial'] === '1';
    const trialDays = parseInt(settingsMap['billing_trial_days'] || '14', 10);

    const now = new Date();

    // Compute endDate based on billing cycle
    const endDate = new Date(now);
    if (billingCycle === 'ANNUAL') {
      endDate.setDate(endDate.getDate() + 365);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    // Compute trial end date
    // Compute addons total (hardcoded pricing; adjust as needed)
    const ADDON_PRICES: Record<string, number> = {
      mobileApp: 500,
      whatsapp: 300,
      crm: 400,
      pos: 600,
    };
    const POS_EXTRA_PRICE = 200; // per extra device

    let addonsTotal = 0;
    const addonsObj = addons || {};
    if (addonsObj.mobileApp) addonsTotal += ADDON_PRICES.mobileApp;
    if (addonsObj.whatsapp) addonsTotal += ADDON_PRICES.whatsapp;
    if (addonsObj.crm) addonsTotal += ADDON_PRICES.crm;
    if (addonsObj.pos) addonsTotal += ADDON_PRICES.pos;
    if (addonsObj.extraPos && addonsObj.extraPos > 0) addonsTotal += addonsObj.extraPos * POS_EXTRA_PRICE;

    const totalMonthly = pkg.price + addonsTotal;

    // Compute trial end date
    let trialEndsAt: Date | undefined;
    let status: string;
    status = 'PENDING_APPROVAL';

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        userId,
        packageId,
        billingCycle,
        status,
        startDate: now,
        endDate,
        trialEndsAt: trialEndsAt ?? null,
        addons: JSON.stringify(addonsObj),
        addonsTotal,
        totalMonthly,
      },
    });

    // Create corresponding invoice
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7);

    const invoiceAmount = billingCycle === 'ANNUAL' ? totalMonthly * 12 : totalMonthly;

    const invoice = await db.invoice.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        type: 'SUBSCRIPTION',
        status: 'PENDING',
        amount: invoiceAmount,
        amountPaid: 0,
        currency: 'DZD',
        periodStart: now,
        periodEnd: endDate,
        dueDate,
        items: JSON.stringify([
          { label: `اشتراك ${pkg.name} (${billingCycle === 'ANNUAL' ? 'سنوي' : 'شهري'})`, amount: billingCycle === 'ANNUAL' ? pkg.price * 12 : pkg.price },
          ...(addonsTotal > 0 ? [{ label: 'إضافات', amount: billingCycle === 'ANNUAL' ? addonsTotal * 12 : addonsTotal }] : []),
        ]),
      },
    });

    return NextResponse.json({ success: true, subscription, invoice });
  } catch (err) {
    console.error('[billing/subscribe POST]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
