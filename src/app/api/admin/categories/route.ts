import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') || 'product';
    const categories = await db.category.findMany({
      where: { type },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true, stores: true, sellerProfiles: true } }
      }
    });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, nameEn, slug, icon, image, parentId, sortOrder, type } = data;
    
    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'name and slug are required' }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        name,
        nameEn,
        slug,
        icon,
        image,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        type: type || 'product',
        isActive: true,
      }
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updates } = data;
    
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const category = await db.category.update({
      where: { id },
      data: updates
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
