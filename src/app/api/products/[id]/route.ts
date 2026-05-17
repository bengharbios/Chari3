import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams.id;

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, nameEn: true, slug: true } },
        seller: {
          select: {
            id: true,
            storeName: true,
            storeNameEn: true,
            bio: true,
            logo: true,
            coverImage: true,
            rating: true,
            level: true,
            totalSales: true,
            totalCustomers: true,
            isVerified: true,
            _count: { select: { products: true } },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            logo: true,
            rating: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Fetch related products from same category
    const related = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        status: 'active',
        id: { not: id },
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        price: true,
        comparePrice: true,
        images: true,
        rating: true,
        soldCount: true,
      },
      orderBy: { soldCount: 'desc' },
      take: 10,
    });

    return NextResponse.json({ success: true, product, related });

  } catch (error: any) {
    console.error('[product-detail] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load product', details: error.message }, { status: 500 });
  }
}
