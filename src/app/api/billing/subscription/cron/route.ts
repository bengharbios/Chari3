import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAndEnforceDebtLimit } from '@/lib/billing';

export const dynamic = 'force-dynamic';

// GET /api/billing/subscription/cron (simulates monthly subscription billing run)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    // Simple protection or allow testing
    
    // Fetch all users with store or sellerProfile
    const users = await db.user.findMany({
      where: {
        role: { in: ['seller', 'store_manager'] },
      },
      include: {
        store: { include: { package: true } },
        sellerProfile: { include: { package: true } },
        wallet: true,
      },
    });

    const results: any[] = [];

    for (const user of users) {
      let packagePrice = 0;
      let addonMobileApp = false;
      let addonWhatsAppSupport = false;
      let addonAdvancedCRM = false;
      let addonEchangoPOS = false;
      let addonExtraPOSDevices = 0;
      let packageName = 'Free';

      if (user.role === 'store_manager' && user.store) {
        packagePrice = user.store.package?.price ?? 0;
        packageName = user.store.package?.name ?? 'Free';
        addonMobileApp = user.store.addonMobileApp;
        addonWhatsAppSupport = user.store.addonWhatsAppSupport;
        addonAdvancedCRM = user.store.addonAdvancedCRM;
        addonEchangoPOS = user.store.addonEchangoPOS;
        addonExtraPOSDevices = user.store.addonExtraPOSDevices;
      } else if (user.role === 'seller' && user.sellerProfile) {
        packagePrice = user.sellerProfile.package?.price ?? 0;
        packageName = user.sellerProfile.package?.name ?? 'Free';
        addonMobileApp = user.sellerProfile.addonMobileApp;
        addonWhatsAppSupport = user.sellerProfile.addonWhatsAppSupport;
        addonAdvancedCRM = user.sellerProfile.addonAdvancedCRM;
        addonEchangoPOS = user.sellerProfile.addonEchangoPOS;
        addonExtraPOSDevices = user.sellerProfile.addonExtraPOSDevices;
      } else {
        continue; // Skip if they don't have matching profile
      }

      // Calculate Add-on totals
      let addonsTotal = 0;
      const activeAddons: string[] = [];

      if (addonMobileApp) {
        addonsTotal += 2000;
        activeAddons.push('App Mobile (2000 DZD)');
      }
      if (addonWhatsAppSupport) {
        addonsTotal += 2500;
        activeAddons.push('WhatsApp Support (2500 DZD)');
      }
      if (addonAdvancedCRM) {
        addonsTotal += 1500;
        activeAddons.push('CRM (1500 DZD)');
      }
      if (addonEchangoPOS) {
        addonsTotal += 1500;
        activeAddons.push('Echango POS (1500 DZD)');
      }
      if (addonExtraPOSDevices > 0) {
        addonsTotal += addonExtraPOSDevices * 500;
        activeAddons.push(`Extra POS Devices x${addonExtraPOSDevices} (${addonExtraPOSDevices * 500} DZD)`);
      }

      const totalFee = packagePrice + addonsTotal;

      if (totalFee === 0) continue;

      // Charge to wallet
      let wallet = user.wallet;
      if (!wallet) {
        wallet = await db.wallet.create({
          data: { userId: user.id, balance: 0 },
        });
      }

      const newBalance = wallet.balance - totalFee;

      // Create transaction
      const description = `رسوم الاشتراك الشهري: باقة (${packageName}: ${packagePrice} دج) + خيارات إضافية (${activeAddons.join(', ') || 'لا يوجد'})`;
      
      const transaction = await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'SUBSCRIPTION_FEE',
          amount: -totalFee,
          balance: newBalance,
          description,
        },
      });

      // Update wallet
      await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          totalSpent: wallet.totalSpent + totalFee,
        },
      });

      // Check debt limits and enforce suspensions
      await checkAndEnforceDebtLimit(user.id, newBalance);

      results.push({
        userId: user.id,
        name: user.name,
        package: packageName,
        totalCharged: totalFee,
        newBalance,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Subscription cron executed successfully. Billed ${results.length} merchants.`,
      results,
    });
  } catch (error) {
    console.error('[Subscription Billing Cron] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
