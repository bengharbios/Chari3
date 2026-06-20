import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { SecurityService } from '@/lib/payment-engine/services/SecurityService';

export const dynamic = 'force-dynamic';

function getUploadDir(): string {
  const envDir = process.env.UPLOAD_DIR;
  if (envDir && !envDir.includes('/USER/')) return envDir;
  return path.join(process.cwd(), '..', 'ChariDay_uploads');
}

async function deleteOldFile(oldUrl: string | null | undefined) {
  if (!oldUrl || !oldUrl.startsWith('/api/files/')) return;
  try {
    const filename = oldUrl.replace('/api/files/', '');
    // Ensure filename is safe (alphanumeric and dots only)
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return;

    const UPLOAD_DIR = getUploadDir();
    const filePath = path.join(UPLOAD_DIR, filename);
    await unlink(filePath);
    console.log(`[settings] Deleted old upload file: ${filePath}`);
  } catch (err) {
    console.warn(`[settings] Failed to delete old upload: ${oldUrl}`, err);
  }
}


// GET /api/seller/settings?userId=xxx&storeId=yyy&sellerId=zzz
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const storeId = req.nextUrl.searchParams.get('storeId');
    const sellerId = req.nextUrl.searchParams.get('sellerId');

    let store: any = null;
    let seller: any = null;

    if (userId) {
      // 1. Try to find Store as StoreManager
      store = await db.store.findFirst({
        where: { managerId: userId }
      });

      if (!store) {
        // 2. Try to find SellerProfile
        seller = await db.sellerProfile.findUnique({
          where: { userId }
        });
      }
    } else if (storeId) {
      store = await db.store.findUnique({
        where: { id: storeId }
      });
    } else if (sellerId) {
      seller = await db.sellerProfile.findUnique({
        where: { id: sellerId }
      });
    } else {
      return NextResponse.json({ success: false, error: 'userId, storeId, or sellerId required' }, { status: 400 });
    }

    let currency = 'DZD';
    if (userId) {
      const wallet = await db.wallet.findUnique({ where: { userId } });
      if (wallet?.currency) currency = wallet.currency;
    }

    if (store) {
      const themeParsed = store.themeSettings ? JSON.parse(store.themeSettings) : null;
      return NextResponse.json({
        success: true,
        type: 'store',
        settings: {
          id: store.id,
          name: store.name,
          nameEn: store.nameEn,
          description: store.description,
          logo: store.logo,
          coverImage: store.coverImage,
          isActive: store.isActive,
          shippingRates: store.shippingRates ? JSON.parse(store.shippingRates) : null,
          shippingIntegrations: store.shippingIntegrations ? JSON.parse(store.shippingIntegrations) : null,
          paymentDetails: store.paymentDetails ? JSON.parse(store.paymentDetails) : null,
          themeSettings: themeParsed,
          storeConfig: themeParsed?.storeConfig || null,
          currency,
        }
      });
    }

    if (seller) {
      const themeParsed = seller.themeSettings ? JSON.parse(seller.themeSettings) : null;
      return NextResponse.json({
        success: true,
        type: 'seller',
        settings: {
          id: seller.id,
          name: seller.storeName,
          nameEn: seller.storeNameEn,
          description: seller.bio,
          logo: seller.logo,
          coverImage: seller.coverImage,
          isActive: seller.isVerified,
          shippingRates: seller.shippingRates ? JSON.parse(seller.shippingRates) : null,
          shippingIntegrations: seller.shippingIntegrations ? JSON.parse(seller.shippingIntegrations) : null,
          paymentDetails: seller.paymentDetails ? JSON.parse(seller.paymentDetails) : null,
          themeSettings: themeParsed,
          storeConfig: themeParsed?.storeConfig || null,
          currency,
          paymentModel: seller.paymentModel,
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Store or Seller profile not found' }, { status: 404 });
  } catch (error) {
    console.error('[seller/settings GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/seller/settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, settings } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }
    if (!settings) {
      return NextResponse.json({ success: false, error: 'settings data required' }, { status: 400 });
    }

    const shippingRatesStr = settings.shippingRates ? JSON.stringify(settings.shippingRates) : null;
    const shippingIntegrationsStr = settings.shippingIntegrations ? JSON.stringify(settings.shippingIntegrations) : null;
    
    // Handle SellerPaymentConfig for Chargily
    if (settings.paymentDetails && settings.paymentDetails.chargilySecretKey && settings.paymentDetails.chargilySecretKey !== '********') {
      try {
        const encryptedKeys = SecurityService.encryptConfig({
          publicKey: settings.paymentDetails.chargilyPublicKey,
          secretKey: settings.paymentDetails.chargilySecretKey
        });
        
        // Find sellerId based on type
        let sellerIdToUse: string | null = null;
        if (type === 'store') {
          const st = await db.store.findFirst({ where: { managerId: userId } });
          sellerIdToUse = st?.sellerId || null;
        } else {
          const sp = await db.sellerProfile.findUnique({ where: { userId } });
          sellerIdToUse = sp?.id || null;
        }

        if (sellerIdToUse) {
          await db.sellerPaymentConfig.upsert({
            where: { sellerId: sellerIdToUse },
            update: {
              gatewayId: 'chargily',
              encryptedKeys,
            },
            create: {
              sellerId: sellerIdToUse,
              gatewayId: 'chargily',
              mode: 'split', // default
              encryptedKeys,
            }
          });
        }
        
        // Hide secret key before saving in plain JSON
        settings.paymentDetails.chargilySecretKey = '********';
      } catch (err) {
        console.error('Failed to encrypt payment keys:', err);
      }
    }

    const paymentDetailsStr = settings.paymentDetails ? JSON.stringify(settings.paymentDetails) : null;
    
    // Merge storeConfig into themeSettings since storeConfig doesn't have its own column
    let finalThemeSettings = settings.themeSettings || {};
    if (settings.storeConfig) {
      finalThemeSettings.storeConfig = settings.storeConfig;
    }
    const themeSettingsStr = Object.keys(finalThemeSettings).length > 0 ? JSON.stringify(finalThemeSettings) : null;

    const currencyToSave = settings.storeConfig?.currency || settings.currency;
    if (currencyToSave) {
      await db.wallet.upsert({
        where: { userId },
        update: { currency: currencyToSave },
        create: { userId, currency: currencyToSave },
      });
    }

    if (type === 'store') {
      const store = await db.store.findFirst({
        where: { managerId: userId }
      });

      if (!store) {
        return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
      }

      // Cleanup old files if new ones are uploaded
      if (settings.logo && settings.logo !== store.logo) {
        await deleteOldFile(store.logo);
      }
      if (settings.coverImage && settings.coverImage !== store.coverImage) {
        await deleteOldFile(store.coverImage);
      }

      const updatedStore = await db.store.update({
        where: { id: store.id },
        data: {
          name: settings.name ?? store.name,
          nameEn: settings.nameEn ?? store.nameEn,
          description: settings.description ?? store.description,
          logo: settings.logo ?? store.logo,
          coverImage: settings.coverImage ?? store.coverImage,
          shippingRates: shippingRatesStr,
          shippingIntegrations: shippingIntegrationsStr,
          paymentDetails: paymentDetailsStr,
          themeSettings: themeSettingsStr,
        }
      });

      // Update the user's name as well
      await db.user.update({
        where: { id: userId },
        data: {
          name: settings.name ?? undefined,
          nameEn: settings.nameEn ?? undefined,
        }
      });

      return NextResponse.json({ success: true, settings: updatedStore });
    } else {
      // Independent Seller Profile
      const seller = await db.sellerProfile.findUnique({
        where: { userId }
      });

      if (!seller) {
        return NextResponse.json({ success: false, error: 'Seller profile not found' }, { status: 404 });
      }

      // Cleanup old files if new ones are uploaded
      if (settings.logo && settings.logo !== seller.logo) {
        await deleteOldFile(seller.logo);
      }
      if (settings.coverImage && settings.coverImage !== seller.coverImage) {
        await deleteOldFile(seller.coverImage);
      }

      const updatedSeller = await db.sellerProfile.update({
        where: { id: seller.id },
        data: {
          storeName: settings.name ?? seller.storeName,
          storeNameEn: settings.nameEn ?? seller.storeNameEn,
          bio: settings.description ?? seller.bio,
          logo: settings.logo ?? seller.logo,
          coverImage: settings.coverImage ?? seller.coverImage,
          shippingRates: shippingRatesStr,
          shippingIntegrations: shippingIntegrationsStr,
          paymentDetails: paymentDetailsStr,
          themeSettings: themeSettingsStr,
        }
      });

      // Update the user's name as well
      await db.user.update({
        where: { id: userId },
        data: {
          name: settings.name ?? undefined,
          nameEn: settings.nameEn ?? undefined,
        }
      });

      return NextResponse.json({ success: true, settings: updatedSeller });
    }
  } catch (error) {
    console.error('[seller/settings POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
