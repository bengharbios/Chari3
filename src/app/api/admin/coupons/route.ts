import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const coupons = await db.coupon.findMany({
      where: { isGlobal: true },
      include: {
        _count: {
          select: { optInStores: true, optInSellers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error('[admin/coupons GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type, value, minOrder, usageLimit, expiresAt, applicableTo, maxStoresLimit, targetIds } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await db.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'كود الكوبون مسجل بالفعل وموجود في المنصة!' }, { status: 400 });
    }

    const data: any = {
      code: code.toUpperCase().trim(),
      type,
      value: parseFloat(value),
      minOrder: minOrder ? parseFloat(minOrder) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isGlobal: true,
      applicableTo: applicableTo || 'all',
      maxStoresLimit: maxStoresLimit ? parseInt(maxStoresLimit) : null
    };

    if (applicableTo === 'categories' && targetIds && Array.isArray(targetIds)) {
      data.categories = { connect: targetIds.map(id => ({ id })) };
    }
    
    // Admins usually don't target specific products unless needed, but it's supported
    if (applicableTo === 'products' && targetIds && Array.isArray(targetIds)) {
      data.products = { connect: targetIds.map(id => ({ id })) };
    }

    const coupon = await db.coupon.create({ data });
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('[admin/coupons POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/coupons DELETE]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
