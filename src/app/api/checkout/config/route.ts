import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get('storeId');
    const sellerId = req.nextUrl.searchParams.get('sellerId');

    let paymentDetails: any = null;
    let storeName = 'ChariDay Store';

    if (storeId) {
      const store = await db.store.findUnique({
        where: { id: storeId },
        select: { paymentDetails: true, name: true }
      });
      if (store) {
        storeName = store.name;
        if (store.paymentDetails) {
          try {
            paymentDetails = JSON.parse(store.paymentDetails);
          } catch (e) {
            console.error('Error parsing store payment details', e);
          }
        }
      }
    } else if (sellerId) {
      const seller = await db.sellerProfile.findUnique({
        where: { id: sellerId },
        select: { paymentDetails: true, storeName: true }
      });
      if (seller) {
        storeName = seller.storeName || storeName;
        if (seller.paymentDetails) {
          try {
            paymentDetails = JSON.parse(seller.paymentDetails);
          } catch (e) {
            console.error('Error parsing seller payment details', e);
          }
        }
      }
    }

    // Default payment details fallback if empty or not configured
    const fallbackDetails = {
      codEnabled: true,
      bankEnabled: false,
      ccpAccount: '',
      ccpName: '',
      baridiMobRip: '',
      satimEnabled: false
    };

    return NextResponse.json({
      success: true,
      storeName,
      paymentConfig: paymentDetails || fallbackDetails
    });
  } catch (error) {
    console.error('[checkout-config GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
