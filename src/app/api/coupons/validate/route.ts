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
      where: { code: code.toUpperCase().trim() },
      include: {
        categories: { select: { id: true } },
        products: { select: { id: true } },
        optInStores: { select: { id: true } },
        optInSellers: { select: { id: true } },
      }
    });

    if (!coupon) {
      return NextResponse.json({ success: false, errorAr: 'كوبون الخصم غير موجود أو منتهي الصلاحية', errorEn: 'Invalid coupon code or expired' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ success: false, errorAr: 'هذا الكوبون غير نشط حالياً', errorEn: 'This coupon is currently inactive' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, errorAr: 'عذراً، هذا الكوبون منتهي الصلاحية', errorEn: 'Sorry, this coupon has expired' }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, errorAr: 'عذراً، تم استهلاك هذا الكوبون بالكامل', errorEn: 'Sorry, this coupon has reached its usage limit' }, { status: 400 });
    }

    let productIds: string[] = [];
    if (body.items && Array.isArray(body.items)) {
      productIds = body.items.map((i: any) => i.productId);
    } else if (body.productId) {
      productIds = [body.productId];
    }

    let cartProducts: any[] = [];
    if (productIds.length > 0) {
      cartProducts = await db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, storeId: true, sellerId: true, categoryId: true, price: true }
      });
    }

    let applicableProductIds: string[] = [];

    if (coupon.isGlobal) {
      const optedInStoreIds = coupon.optInStores.map(s => s.id);
      const optedInSellerIds = coupon.optInSellers.map(s => s.id);
      
      const allowedProducts = cartProducts.filter(p => 
        (p.storeId && optedInStoreIds.includes(p.storeId)) || 
        (p.sellerId && optedInSellerIds.includes(p.sellerId))
      );

      if (allowedProducts.length === 0) {
        return NextResponse.json({ 
          success: false, 
          errorAr: 'هذا الكوبون غير متاح للمتاجر التي تتسوق منها حالياً', 
          errorEn: 'This coupon is not available for the stores you are shopping from' 
        }, { status: 400 });
      }

      applicableProductIds = allowedProducts.map(p => p.id);
    } else {
      const couponStoreId = coupon.storeId;
      const couponSellerId = coupon.sellerId;

      if (couponStoreId || couponSellerId) {
        // Fetch store/seller to check managerId/userId in case products were created with user.id instead of store.id
        const store = couponStoreId ? await db.store.findUnique({ where: { id: couponStoreId } }) : null;
        const seller = couponSellerId ? await db.sellerProfile.findUnique({ where: { id: couponSellerId } }) : null;

        const allowedProducts = cartProducts.filter(p => {
          const matchesStore = couponStoreId && (p.storeId === couponStoreId || (store && p.storeId === store.managerId));
          const matchesSeller = couponSellerId && (p.sellerId === couponSellerId || (seller && p.sellerId === seller.userId));
          return matchesStore || matchesSeller;
        });

        if (allowedProducts.length === 0) {
          return NextResponse.json({ 
            success: false, 
            errorAr: couponStoreId ? 'هذا الكوبون غير مخصص لمنتجات هذا المتجر' : 'هذا الكوبون غير مخصص لمنتجات هذا البائع', 
            errorEn: 'This coupon is not valid for these products' 
          }, { status: 400 });
        }
        applicableProductIds = allowedProducts.map(p => p.id);
      } else {
        applicableProductIds = cartProducts.map(p => p.id);
      }
    }

    if (coupon.applicableTo === 'categories' && coupon.categories.length > 0) {
      const categoryIds = coupon.categories.map(c => c.id);
      applicableProductIds = applicableProductIds.filter(id => {
        const p = cartProducts.find(cp => cp.id === id);
        return p && categoryIds.includes(p.categoryId);
      });
      if (applicableProductIds.length === 0) {
         return NextResponse.json({ success: false, errorAr: 'هذا الكوبون لا يشمل هذه الأقسام', errorEn: 'Coupon does not apply to these categories' }, { status: 400 });
      }
    }

    if (coupon.applicableTo === 'products' && coupon.products.length > 0) {
      const specificProductIds = coupon.products.map(p => p.id);
      applicableProductIds = applicableProductIds.filter(id => specificProductIds.includes(id));
      if (applicableProductIds.length === 0) {
         return NextResponse.json({ success: false, errorAr: 'هذا الكوبون لا يشمل هذه المنتجات', errorEn: 'Coupon does not apply to these products' }, { status: 400 });
      }
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json({
        success: false,
        errorAr: `الحد الأدنى لتفعيل الكوبون هو شراء بقيمة ${coupon.minOrder.toLocaleString()} د.ج`,
        errorEn: `Minimum order value to activate this coupon is ${coupon.minOrder.toLocaleString()} DZD`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        applicableProductIds
      }
    });

  } catch (error) {
    console.error('[coupons/validate POST]', error);
    return NextResponse.json({ success: false, errorAr: 'حدث خطأ غير متوقع في الخادم', errorEn: 'Server error' }, { status: 500 });
  }
}
