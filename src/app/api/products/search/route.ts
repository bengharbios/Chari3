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
        status: 'active',
        OR: [
          { name: { contains: q } },
          { nameEn: { contains: q } },
          { description: { contains: q } },
          { descriptionEn: { contains: q } }
        ]
      },
      include: {
        store: { select: { id: true, name: true, nameEn: true, logo: true } },
        seller: { select: { id: true, storeName: true, storeNameEn: true, logo: true } },
      },
      take: 20
    });

    const formattedProducts = products.map((p) => {
      let imagesList: string[] = [];
      try {
        imagesList = JSON.parse(p.images);
      } catch {
        imagesList = typeof p.images === 'string' ? [p.images] : (p.images as any) || [];
      }

      return {
        id: p.id,
        name: p.name,
        nameEn: p.nameEn,
        slug: p.slug,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        images: JSON.stringify(imagesList),
        rating: p.rating || 5.0,
        soldCount: p.soldCount || 0,
        store: p.store,
        seller: p.seller,
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
