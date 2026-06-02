import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/billing/addons?userId=xxx
// Returns the active addons for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
        sellerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    let addons = {
      addonMobileApp: false,
      addonWhatsAppSupport: false,
      addonAdvancedCRM: false,
      addonEchangoPOS: false,
      addonExtraPOSDevices: 0,
    };

    if (user.role === 'store_manager' && user.store) {
      addons = {
        addonMobileApp: user.store.addonMobileApp,
        addonWhatsAppSupport: user.store.addonWhatsAppSupport,
        addonAdvancedCRM: user.store.addonAdvancedCRM,
        addonEchangoPOS: user.store.addonEchangoPOS,
        addonExtraPOSDevices: user.store.addonExtraPOSDevices,
      };
    } else if (user.role === 'seller' && user.sellerProfile) {
      addons = {
        addonMobileApp: user.sellerProfile.addonMobileApp,
        addonWhatsAppSupport: user.sellerProfile.addonWhatsAppSupport,
        addonAdvancedCRM: user.sellerProfile.addonAdvancedCRM,
        addonEchangoPOS: user.sellerProfile.addonEchangoPOS,
        addonExtraPOSDevices: user.sellerProfile.addonExtraPOSDevices,
      };
    }

    return NextResponse.json({ success: true, addons });
  } catch (error) {
    console.error('[addons GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/billing/addons
// Updates the active addons for a user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      addonMobileApp,
      addonWhatsAppSupport,
      addonAdvancedCRM,
      addonEchangoPOS,
      addonExtraPOSDevices,
    } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
        sellerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const updateData = {
      addonMobileApp: typeof addonMobileApp === 'boolean' ? addonMobileApp : undefined,
      addonWhatsAppSupport: typeof addonWhatsAppSupport === 'boolean' ? addonWhatsAppSupport : undefined,
      addonAdvancedCRM: typeof addonAdvancedCRM === 'boolean' ? addonAdvancedCRM : undefined,
      addonEchangoPOS: typeof addonEchangoPOS === 'boolean' ? addonEchangoPOS : undefined,
      addonExtraPOSDevices: typeof addonExtraPOSDevices === 'number' ? Math.max(0, addonExtraPOSDevices) : undefined,
    };

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

    return NextResponse.json({ success: true, message: 'Add-ons updated successfully' });
  } catch (error) {
    console.error('[addons POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
