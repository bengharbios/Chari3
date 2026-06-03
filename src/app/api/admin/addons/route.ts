import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/addons — list all addons
export async function GET() {
  try {
    const addons = await db.billingAddon.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, addons });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/admin/addons — create a new addon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, nameAr, nameEn, descriptionAr, descriptionEn, price, isCounter, sortOrder } = body;

    if (!key || !nameAr || !nameEn) {
      return NextResponse.json({ success: false, error: 'Key, Name (AR), and Name (EN) are required' }, { status: 400 });
    }

    // Check if key already exists
    const existing = await db.billingAddon.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Addon with this key already exists' }, { status: 400 });
    }

    const addon = await db.billingAddon.create({
      data: {
        key,
        nameAr,
        nameEn,
        descriptionAr: descriptionAr || '',
        descriptionEn: descriptionEn || '',
        price: parseFloat(price) || 0,
        isCounter: !!isCounter,
        sortOrder: parseInt(sortOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, addon });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PATCH /api/admin/addons — update an addon
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, key, nameAr, nameEn, descriptionAr, descriptionEn, price, isCounter, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Addon ID is required' }, { status: 400 });
    }

    const addon = await db.billingAddon.update({
      where: { id },
      data: {
        key: key || undefined,
        nameAr: nameAr || undefined,
        nameEn: nameEn || undefined,
        descriptionAr: descriptionAr !== undefined ? descriptionAr : undefined,
        descriptionEn: descriptionEn !== undefined ? descriptionEn : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        isCounter: isCounter !== undefined ? !!isCounter : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined,
      },
    });

    return NextResponse.json({ success: true, addon });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/admin/addons?id=xxx — delete an addon
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Addon ID is required' }, { status: 400 });
    }

    await db.billingAddon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
