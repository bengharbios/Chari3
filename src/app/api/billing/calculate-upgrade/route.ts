import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, packageId, billingCycle, addons } = body as {
      userId: string;
      packageId: string;
      billingCycle: 'MONTHLY' | 'ANNUAL';
      addons: any;
    };

    if (!userId || !packageId || !billingCycle) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const pkg = await db.sellerPackage.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });

    const currentSub = await db.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'TRIAL'] } },
      orderBy: { createdAt: 'desc' },
      include: { package: true },
    });

    const now = new Date();
    let actionType: 'subscribe' | 'upgrade' = 'subscribe';
    let proRataCredit = 0;
    let daysRemaining = 0;
    let totalDaysInCycle = 30;

    if (currentSub && currentSub.package) {
      const isFreePlan = currentSub.package.price === 0;
      if (!isFreePlan) {
        actionType = 'upgrade';
        if (pkg.price <= currentSub.package.price) {
          return NextResponse.json({ success: true, actionType, invoiceAmount: 0, proRataCredit: 0, daysRemaining: 0, error: 'Cannot downgrade or keep same price' });
        }
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
    }

    const ADDON_PRICES: Record<string, number> = { mobileApp: 500, whatsapp: 300, crm: 400, pos: 600 };
    let addonsTotal = 0;
    if (addons?.mobileApp) addonsTotal += ADDON_PRICES.mobileApp;
    if (addons?.whatsapp) addonsTotal += ADDON_PRICES.whatsapp;
    if (addons?.crm) addonsTotal += ADDON_PRICES.crm;
    if (addons?.pos) addonsTotal += ADDON_PRICES.pos;
    if (addons?.extraPos > 0) addonsTotal += addons.extraPos * 200;

    const newMonthlyPrice = pkg.price + addonsTotal;
    const annualDiscount = billingCycle === 'ANNUAL' ? 0.2 : 0;
    const discountedMonthly = newMonthlyPrice * (1 - annualDiscount);

    let invoiceAmount: number;
    if (actionType === 'upgrade') {
      const newDailyRate = discountedMonthly / 30;
      const upgradeChargeForRemaining = Math.round(newDailyRate * daysRemaining * 100) / 100;
      invoiceAmount = Math.max(0, upgradeChargeForRemaining - proRataCredit);
    } else {
      invoiceAmount = billingCycle === 'ANNUAL' ? discountedMonthly * 12 : discountedMonthly;
    }

    return NextResponse.json({
      success: true,
      actionType,
      invoiceAmount,
      proRataCredit,
      daysRemaining,
      totalMonthly: discountedMonthly,
      totalBilled: billingCycle === 'ANNUAL' ? discountedMonthly * 12 : discountedMonthly
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
