import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET — List all brands (active & inactive) with product counts
export async function GET() {
  try {
    const brands = await db.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } }
      }
    });
    return NextResponse.json({ success: true, brands });
  } catch (error) {
    console.error('Failed to list admin brands:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST — Create a new brand
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, nameEn, logo, isActive } = data;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Brand name is required' }, { status: 400 });
    }

    const brand = await db.brand.create({
      data: {
        name,
        nameEn: nameEn || null,
        logo: logo || null,
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json({ success: true, brand });
  } catch (error) {
    console.error('Failed to create brand:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PATCH — Update an existing brand
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Brand ID is required' }, { status: 400 });
    }

    const brand = await db.brand.update({
      where: { id },
      data: updates
    });

    return NextResponse.json({ success: true, brand });
  } catch (error) {
    console.error('Failed to update brand:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE — Delete an existing brand (only if no products are linked)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Brand ID is required' }, { status: 400 });
    }

    // Check if any products are linked to this brand
    const productCount = await db.product.count({
      where: { brandId: id }
    });

    if (productCount > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `لا يمكن حذف الماركة لوجود ${productCount} منتج مرتبط بها. يرجى إلغاء تفعيلها بدلاً من ذلك.` 
      }, { status: 400 });
    }

    await db.brand.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Failed to delete brand:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
