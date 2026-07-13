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
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return;

    const UPLOAD_DIR = getUploadDir();
    const filePath = path.join(UPLOAD_DIR, filename);
    await unlink(filePath);
    console.log(`[settings] Deleted old upload file: ${filePath}`);
  } catch (err) {
    console.warn(`[settings] Failed to delete old upload: ${oldUrl}`, err);
  }
}

const RESERVED_SLUGS = [
  'admin', 'api', 'login', 'register', 'checkout', 'settings', 'store',
  'seller', 'dashboard', 'support', 'help', 'search', 'terms', 'privacy',
  'blog', 'news', 'auth', 'signup', 'signin', 'verification', 'onboarding',
  'suppliers', 'freelancers', 'logistics', 'buyer', 'orders', 'products'
];

// GET /api/seller/settings?userId=xxx&storeId=yyy&sellerId=zzz
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const storeId = req.nextUrl.searchParams.get('storeId');
    const sellerId = req.nextUrl.searchParams.get('sellerId');

    let store: any = null;

    // Shared OR condition: direct manager OR active staff member
    const staffAccessCondition = (id: string) => ({
      OR: [
        { managerId: id },
        { staff: { some: { userId: id, status: 'active' } } }
      ]
    });

    if (storeId) {
      store = await db.store.findFirst({
        where: userId
          ? { id: storeId, ...staffAccessCondition(userId) }
          : { id: storeId }
      });
    } else if (userId) {
      store = await db.store.findFirst({
        where: staffAccessCondition(userId)
      });
    } else if (sellerId) {
      const sellerProfile = await db.sellerProfile.findUnique({
        where: { id: sellerId }
      });
      if (sellerProfile) {
        store = await db.store.findFirst({
          where: staffAccessCondition(sellerProfile.userId)
        });
      }
    } else {
      return NextResponse.json({ success: false, error: 'userId, storeId, or sellerId required' }, { status: 400 });
    }

    if (!store) {
      return NextResponse.json({ success: true, store: null, settings: null });
    }

    // Fetch the requesting user's role for ownership determination
    const resolvedUserIdForRole = userId || null;
    let user: { role: string } | null = null;
    if (resolvedUserIdForRole) {
      user = await db.user.findUnique({
        where: { id: resolvedUserIdForRole },
        select: { role: true }
      });
    }

    let currency = 'DZD';
    const wallet = await db.wallet.findUnique({ where: { userId: store.managerId } });
    if (wallet?.currency) currency = wallet.currency;

    // Fetch active package defaults
    let pkg: any = null;
    if (store.packageId) {
      pkg = await db.sellerPackage.findUnique({ where: { id: store.packageId } });
    }

    const checkAllowed = (pkgField: string, overrideField: string, defaultValue: boolean) => {
      if (store[overrideField] !== null && store[overrideField] !== undefined) {
        return store[overrideField];
      }
      if (pkg && pkg[pkgField] !== undefined && pkg[pkgField] !== null) {
        return pkg[pkgField];
      }
      return defaultValue;
    };

    const permissions = {
      allowIdentity: checkAllowed('allowIdentity', 'overrideIdentity', true),
      allowShipping: checkAllowed('allowShipping', 'overrideShipping', true),
      allowPayment: checkAllowed('allowPayment', 'overridePayment', true),
      allowVisuals: checkAllowed('allowVisuals', 'overrideVisuals', true),
      allowInventory: checkAllowed('allowInventory', 'overrideInventory', true),
      allowPolicies: checkAllowed('allowPolicies', 'overridePolicies', true),
      allowSocials: checkAllowed('allowSocials', 'overrideSocials', true),
      allowSecurity: checkAllowed('allowSecurity', 'overrideSecurity', true),
      allowSEO: checkAllowed('allowSEO', 'overrideSEO', false),
      allowDomain: checkAllowed('allowDomain', 'overrideDomain', false),
      allowNotifications: checkAllowed('allowNotifications', 'overrideNotifications', true),
    };

    // Fetch merchantType and paymentModel from the logged-in user's SellerProfile
    let merchantType = 'individual';
    let paymentModel = 'default';
    const resolvedUserId = userId || (sellerId ? store.managerId : null);
    if (resolvedUserId) {
      const sellerProf = await db.sellerProfile.findUnique({
        where: { userId: resolvedUserId },
        select: { merchantType: true, paymentModel: true }
      });
      if (sellerProf) {
        merchantType = sellerProf.merchantType ?? 'individual';
        paymentModel = sellerProf.paymentModel ?? 'default';
      }
    }

    // Determine if this user is the true owner of the store.
    // Signal 1: Direct managerId match (traditional freelancer stores)
    // Signal 2: Has an APPROVED upgrade request (business upgrade owner - dummy user is set as managerId)
    // Signal 3: Has a BusinessVerification record (confirmed business entity)
    let isOwner = resolvedUserId ? store.managerId === resolvedUserId : false;

    if (!isOwner && resolvedUserId && ['store_manager', 'store'].includes(user?.role || '')) {
      // Check if user has an approved upgrade request → they ARE the business owner
      const approvedUpgrade = await db.upgradeRequest.findFirst({
        where: { userId: resolvedUserId, status: 'APPROVED' }
      });
      if (approvedUpgrade) {
        isOwner = true;
      } else {
        // Check BusinessVerification as fallback
        const bizVerif = await db.businessVerification.findFirst({
          where: { userId: resolvedUserId }
        });
        if (bizVerif) isOwner = true;
      }
    }

    const themeParsed = store.themeSettings ? JSON.parse(store.themeSettings) : null;
    return NextResponse.json({
      success: true,
      type: 'store',
      permissions,
      isOwner,
      settings: {
        id: store.id,
        name: store.name,
        nameEn: store.nameEn,
        slug: store.slug,
        slugUpdatedAt: store.slugUpdatedAt,
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
        merchantType,
        paymentModel,
      }
    });
  } catch (error) {
    console.error('[seller/settings GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/seller/settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, storeId, settings } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }
    if (!settings) {
      return NextResponse.json({ success: false, error: 'settings data required' }, { status: 400 });
    }

    // Allow access if user is direct manager OR active staff with manager/admin role
    const staffWriteCondition = {
      OR: [
        { managerId: userId },
        { staff: { some: { userId, status: 'active', role: { in: ['store_manager', 'admin'] } } } }
      ]
    };
    const store = storeId
      ? await db.store.findFirst({
          where: { id: storeId, ...staffWriteCondition }
        })
      : await db.store.findFirst({
          where: staffWriteCondition
        });

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // --- Slug update logic ---
    let newSlug = store.slug;
    if (settings.slug && settings.slug.toLowerCase().trim() !== store.slug) {
      const slugToCheck = settings.slug.toLowerCase().trim();
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slugToCheck) || slugToCheck.length < 3 || slugToCheck.length > 30 || RESERVED_SLUGS.includes(slugToCheck)) {
        return NextResponse.json({ success: false, error: 'invalid_slug_format' }, { status: 400 });
      }

      // Check uniqueness
      const conflictingStore = await db.store.findFirst({
        where: {
          slug: slugToCheck,
          managerId: { not: userId }
        }
      });
      if (conflictingStore) {
        return NextResponse.json({ success: false, error: 'slug_already_taken' }, { status: 400 });
      }

      // Check 60-day limit
      if (store.slugUpdatedAt) {
        const diffMs = Date.now() - new Date(store.slugUpdatedAt).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 60) {
          return NextResponse.json({
            success: false,
            error: 'slug_cooldown_active',
            daysRemaining: 60 - diffDays
          }, { status: 400 });
        }
      }

      newSlug = slugToCheck;
    }

    const shippingRatesStr = settings.shippingRates ? JSON.stringify(settings.shippingRates) : null;
    const shippingIntegrationsStr = settings.shippingIntegrations ? JSON.stringify(settings.shippingIntegrations) : null;

    // Handle Chargily split payments
    if (settings.paymentDetails && settings.paymentDetails.chargilySecretKey && settings.paymentDetails.chargilySecretKey !== '********') {
      try {
        const encryptedKeys = SecurityService.encryptConfig({
          publicKey: settings.paymentDetails.chargilyPublicKey,
          secretKey: settings.paymentDetails.chargilySecretKey
        });

        const sellerProfile = await db.sellerProfile.findUnique({
          where: { userId: store.managerId }
        });
        const sellerIdToUse = sellerProfile ? sellerProfile.id : null;
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
              mode: 'split',
              encryptedKeys,
            }
          });
        }
        settings.paymentDetails.chargilySecretKey = '********';
      } catch (err) {
        console.error('Failed to encrypt payment keys:', err);
      }
    }

    const paymentDetailsStr = settings.paymentDetails ? JSON.stringify(settings.paymentDetails) : null;

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

    // Cleanup old files
    if (settings.logo && settings.logo !== store.logo) {
      await deleteOldFile(store.logo);
    }
    if (settings.coverImage && settings.coverImage !== store.coverImage) {
      await deleteOldFile(store.coverImage);
    }

    // Prepare update payload
    const updatePayload: Record<string, any> = {
      name: settings.name ?? store.name,
      nameEn: settings.nameEn ?? store.nameEn,
      description: settings.description ?? store.description,
      logo: settings.logo ?? store.logo,
      coverImage: settings.coverImage ?? store.coverImage,
      shippingRates: shippingRatesStr,
      shippingIntegrations: shippingIntegrationsStr,
      paymentDetails: paymentDetailsStr,
      themeSettings: themeSettingsStr,
    };

    if (newSlug !== store.slug) {
      updatePayload.slug = newSlug;
      updatePayload.slugUpdatedAt = new Date();
    }

    const updatedStore = await db.store.update({
      where: { id: store.id },
      data: updatePayload
    });

    // Update user's name
    await db.user.update({
      where: { id: userId },
      data: {
        name: settings.name ?? undefined,
        nameEn: settings.nameEn ?? undefined,
      }
    });

    return NextResponse.json({ success: true, settings: updatedStore });
  } catch (error) {
    console.error('[seller/settings POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
