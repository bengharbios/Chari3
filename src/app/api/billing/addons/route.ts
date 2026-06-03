import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/billing/addons?userId=xxx
// Returns the active addons for a user (merges subscription JSON and store columns)
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    // Fetch active subscription to see its addons JSON
    const activeSub = await db.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'TRIAL', 'PENDING_PAYMENT', 'SUSPENDED'] } },
      orderBy: { createdAt: 'desc' }
    });

    let addons: Record<string, any> = {};
    if (activeSub?.addons) {
      try {
        addons = JSON.parse(activeSub.addons);
      } catch (e) {
        addons = {};
      }
    }

    // Also fallback to Store/SellerProfile columns for backward compatibility
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
        sellerProfile: true,
      },
    });

    if (user) {
      const profile = user.role === 'store_manager' ? user.store : user.sellerProfile;
      if (profile) {
        // Merge boolean columns if they are not already in addons JSON
        if (addons.mobileApp === undefined) addons.mobileApp = !!(profile as any).addonMobileApp;
        if (addons.whatsapp === undefined) addons.whatsapp = !!(profile as any).addonWhatsAppSupport;
        if (addons.crm === undefined) addons.crm = !!(profile as any).addonAdvancedCRM;
        if (addons.pos === undefined) addons.pos = !!(profile as any).addonEchangoPOS;
        if (addons.extraPos === undefined) addons.extraPos = Number((profile as any).addonExtraPOSDevices || 0);
      }
    }

    return NextResponse.json({ success: true, addons });
  } catch (error) {
    console.error('[addons GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/billing/addons
// Updates the active addons for a user (saves to active subscription and syncs to columns)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, addons } = body; // addons is an object of key-values: { mobileApp: true, extraPos: 3, ... }

    if (!userId || !addons || typeof addons !== 'object') {
      return NextResponse.json({ success: false, error: 'userId and addons object are required' }, { status: 400 });
    }

    // 1. Update active subscription's addons JSON
    const activeSub = await db.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'TRIAL', 'PENDING_PAYMENT', 'SUSPENDED'] } },
      orderBy: { createdAt: 'desc' }
    });

    if (activeSub) {
      await db.subscription.update({
        where: { id: activeSub.id },
        data: { addons: JSON.stringify(addons) }
      });
    }

    // 2. Also sync to Store/SellerProfile columns for backward compatibility if keys match
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
        sellerProfile: true,
      },
    });

    if (user) {
      const updateData: Record<string, any> = {
        addonMobileApp: addons.mobileApp !== undefined ? !!addons.mobileApp : undefined,
        addonWhatsAppSupport: addons.whatsapp !== undefined ? !!addons.whatsapp : undefined,
        addonAdvancedCRM: addons.crm !== undefined ? !!addons.crm : undefined,
        addonEchangoPOS: addons.pos !== undefined ? !!addons.pos : undefined,
        addonExtraPOSDevices: addons.extraPos !== undefined ? parseInt(addons.extraPos) || 0 : undefined,
      };

      // Filter out undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      if (user.role === 'store_manager' && user.store) {
        await db.store.update({
          where: { managerId: userId },
          data: updateData,
        });
      } else if (user.role === 'seller' && user.sellerProfile) {
        await db.sellerProfile.update({
          where: { userId },
          data: updateData,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Only merchants (stores or independent sellers) can configure add-ons',
        }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Add-ons updated successfully' });
  } catch (error) {
    console.error('[addons POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
