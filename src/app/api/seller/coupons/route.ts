import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/seller/coupons?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    // 1. Check Store Manager
    const store = await db.store.findFirst({ where: { managerId: userId } });
    if (store) {
      const coupons = await db.coupon.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, coupons });
    }

    // 2. Check Independent Seller Profile
    const seller = await db.sellerProfile.findUnique({ where: { userId } });
    if (seller) {
      const coupons = await db.coupon.findMany({
        where: { sellerId: seller.id },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, coupons });
    }

    return NextResponse.json({ success: false, error: 'Store or Seller profile not found' }, { status: 404 });
  } catch (error) {
    console.error('[seller/coupons GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/seller/coupons
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, code, type, value, minOrder, usageLimit, expiresAt, applicableTo, targetIds } = body;

    if (!userId || !code || !type || value === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if code is already registered globally (Coupon code must be unique in schema)
    const existing = await db.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'كود الكوبون مسجل بالفعل وموجود في المنصة!' }, { status: 400 });
    }

    // 1. Check Store Manager
    const store = await db.store.findFirst({ where: { managerId: userId } });
    const seller = await db.sellerProfile.findUnique({ where: { userId } });

    if (!store && !seller) {
      return NextResponse.json({ success: false, error: 'Store or Seller profile not found' }, { status: 404 });
    }

    const data: any = {
      code: code.toUpperCase().trim(),
      type,
      value: parseFloat(value),
      minOrder: minOrder ? parseFloat(minOrder) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      applicableTo: applicableTo || 'all',
      storeId: store ? store.id : null,
      sellerId: !store && seller ? seller.id : null,
    };

    if (applicableTo === 'categories' && targetIds && Array.isArray(targetIds)) {
      data.categories = { connect: targetIds.map(id => ({ id })) };
    }
    
    if (applicableTo === 'products' && targetIds && Array.isArray(targetIds)) {
      data.products = { connect: targetIds.map(id => ({ id })) };
    }

    const coupon = await db.coupon.create({ data });
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('[seller/coupons POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/seller/coupons?id=xxx&userId=yyy
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const userId = req.nextUrl.searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ success: false, error: 'id and userId required' }, { status: 400 });
    }

    // Authenticate the owner first to prevent deletions by unauthorized stores
    const store = await db.store.findFirst({ where: { managerId: userId } });
    const seller = await db.sellerProfile.findUnique({ where: { userId } });

    const coupon = await db.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    const isOwner = (store && coupon.storeId === store.id) || (seller && coupon.sellerId === seller.id);
    if (!isOwner) {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete this coupon' }, { status: 403 });
    }

    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[seller/coupons DELETE]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
