import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ products: [] });
    }

    const searchQuery = q.trim();

    // Fetch only the top 5 most relevant products very quickly
    // We only select the minimal required fields to keep payload small
    const products = await db.product.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: searchQuery } },
          { nameEn: { contains: searchQuery } },
        ],
        AND: [
          {
            OR: [
              { store: { isActive: true } },
              { seller: { user: { isActive: true } } },
              { storeId: null, sellerId: null }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        price: true,
        comparePrice: true,
        images: true,
        slug: true
      },
      take: 5,
      orderBy: [
        { soldCount: 'desc' },
        { viewCount: 'desc' },
      ],
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('[search-live] Error fetching live search suggestions:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
