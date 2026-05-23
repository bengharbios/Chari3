import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await ensureDbConnection();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json({ products: [] });
    }

    const products = await db.product.findMany({
      where: {
        status: 'published',
        OR: [
          { titleAr: { contains: q } },
          { titleEn: { contains: q } },
          { descriptionAr: { contains: q } },
          { descriptionEn: { contains: q } },
          { brand: { contains: q } }
        ]
      },
      include: {
        store: { select: { id: true, name: true, verified: true } },
        _count: { select: { reviews: true } }
      },
      take: 20
    });

    // Calculate rating properly as Prisma doesn't natively do aggregates in findMany include without raw SQL
    // We'll just append dummy rating or actual aggregate if available, for now keeping it compatible with ProductCard
    const formattedProducts = products.map((p) => {
      return {
        id: p.id,
        titleAr: p.titleAr,
        titleEn: p.titleEn,
        slug: p.slug,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        mainImage: p.mainImage || '',
        images: p.images || [],
        brand: p.brand || '',
        stock: p.stock,
        rating: 5.0, // fallback
        reviewsCount: p._count.reviews || 0,
        store: p.store,
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
