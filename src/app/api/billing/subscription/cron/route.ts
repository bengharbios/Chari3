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

    // Fetch system settings for addon prices
    const settings = await db.systemSetting.findMany();
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    const enableSubscriptions = settingsObject.billing_enable_subscriptions === 'true' || settingsObject.billing_enable_subscriptions === true;
    if (!enableSubscriptions) {
      return NextResponse.json({
        success: true,
        message: 'Subscription system is disabled globally. No fees charged.'
      });
    }

    const priceMobileApp = parseFloat(settingsObject.price_addon_mobile_app || '2000');
    const priceWhatsApp = parseFloat(settingsObject.price_addon_whatsapp || '2500');
    const priceCRM = parseFloat(settingsObject.price_addon_crm || '1500');
    const pricePOS = parseFloat(settingsObject.price_addon_pos || '1500');
    const priceExtraPOS = parseFloat(settingsObject.price_addon_extra_pos || '500');

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

      const currencySymbol = user.wallet?.currency || 'DZD';

      if (addonMobileApp) {
        addonsTotal += priceMobileApp;
        activeAddons.push(`App Mobile (${priceMobileApp} ${currencySymbol})`);
      }
      if (addonWhatsAppSupport) {
        addonsTotal += priceWhatsApp;
        activeAddons.push(`WhatsApp Support (${priceWhatsApp} ${currencySymbol})`);
      }
      if (addonAdvancedCRM) {
        addonsTotal += priceCRM;
        activeAddons.push(`CRM (${priceCRM} ${currencySymbol})`);
      }
      if (addonEchangoPOS) {
        addonsTotal += pricePOS;
        activeAddons.push(`Chari POS (${pricePOS} ${currencySymbol})`);
      }
      if (addonExtraPOSDevices > 0) {
        addonsTotal += addonExtraPOSDevices * priceExtraPOS;
        activeAddons.push(`Extra POS Devices x${addonExtraPOSDevices} (${addonExtraPOSDevices * priceExtraPOS} ${currencySymbol})`);
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
