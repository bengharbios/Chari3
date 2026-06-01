import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, couponId, action } = body; // action is 'opt-in' or 'opt-out'

    if (!userId || !couponId || !action) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const store = await db.store.findFirst({ where: { managerId: userId } });
    const seller = await db.sellerProfile.findUnique({ where: { userId } });

    if (!store && !seller) {
      return NextResponse.json({ success: false, error: 'Store or Seller profile not found' }, { status: 404 });
    }

    const coupon = await db.coupon.findUnique({ 
      where: { id: couponId },
      include: {
        _count: {
          select: { optInStores: true, optInSellers: true }
        }
      }
    });

    if (!coupon || !coupon.isGlobal) {
      return NextResponse.json({ success: false, error: 'Global coupon not found' }, { status: 404 });
    }

    if (action === 'opt-in') {
      // Check limits
      if (coupon.maxStoresLimit) {
        const currentCount = coupon._count.optInStores + coupon._count.optInSellers;
        if (currentCount >= coupon.maxStoresLimit) {
          return NextResponse.json({ success: false, error: 'تم الوصول للحد الأقصى للمتاجر المشاركة في هذا العرض' }, { status: 400 });
        }
      }

      await db.coupon.update({
        where: { id: couponId },
        data: {
          ...(store ? { optInStores: { connect: { id: store.id } } } : {}),
          ...(!store && seller ? { optInSellers: { connect: { id: seller.id } } } : {})
        }
      });
    } else {
      await db.coupon.update({
        where: { id: couponId },
        data: {
          ...(store ? { optInStores: { disconnect: { id: store.id } } } : {}),
          ...(!store && seller ? { optInSellers: { disconnect: { id: seller.id } } } : {})
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[seller/coupons/opt-in POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
