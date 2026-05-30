import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/coupons/validate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal, storeId, sellerId } = body;

    if (!code) {
      return NextResponse.json({ success: false, errorAr: 'الرجاء إدخال رمز الكوبون', errorEn: 'Please enter a coupon code' }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (!coupon) {
      return NextResponse.json({ success: false, errorAr: 'كوبون الخصم غير موجود أو منتهي الصلاحية', errorEn: 'Invalid coupon code or expired' }, { status: 404 });
    }

    // 1. Check if active
    if (!coupon.isActive) {
      return NextResponse.json({ success: false, errorAr: 'هذا الكوبون غير نشط حالياً', errorEn: 'This coupon is currently inactive' }, { status: 400 });
    }

    // 2. Check Expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, errorAr: 'عذراً، هذا الكوبون منتهي الصلاحية', errorEn: 'Sorry, this coupon has expired' }, { status: 400 });
    }

    // 3. Check Usage Limits
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, errorAr: 'عذراً، تم استهلاك هذا الكوبون بالكامل', errorEn: 'Sorry, this coupon has reached its usage limit' }, { status: 400 });
    }

    // 4. Check Store Scope
    // To ensure store-specific coupon control:
    const couponStoreId = coupon.storeId;
    const couponSellerId = coupon.sellerId;

    if (couponStoreId && storeId !== couponStoreId) {
      return NextResponse.json({ success: false, errorAr: 'هذا الكوبون غير مخصص لمنتجات هذا المتجر', errorEn: 'This coupon is not valid for this store\'s products' }, { status: 400 });
    }

    if (couponSellerId && sellerId !== couponSellerId) {
      return NextResponse.json({ success: false, errorAr: 'هذا الكوبون غير مخصص لمنتجات هذا البائع', errorEn: 'This coupon is not valid for this seller\'s products' }, { status: 400 });
    }

    // 5. Check Minimum Order purchase threshold
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json({
        success: false,
        errorAr: `الحد الأدنى لتفعيل الكوبون هو شراء بقيمة ${coupon.minOrder.toLocaleString()} د.ج / ريال`,
        errorEn: `Minimum order value to activate this coupon is ${coupon.minOrder.toLocaleString()} DZD`
      }, { status: 400 });
    }

    // Coupon is valid!
    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value
      }
    });

  } catch (error) {
    console.error('[coupons/validate POST]', error);
    return NextResponse.json({ success: false, errorAr: 'حدث خطأ غير متوقع في الخادم', errorEn: 'Server error' }, { status: 500 });
  }
}
