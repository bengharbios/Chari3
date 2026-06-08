import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || searchParams.get('search') || '';

    const where: Record<string, any> = {
      isVerified: true,
    };

    if (search) {
      where.OR = [
        { storeName: { contains: search, mode: 'insensitive' } },
        { storeNameEn: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { nameEn: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const sellers = await db.sellerProfile.findMany({
      where,
      take: 100,
      orderBy: [
        { level: 'desc' },
        { rating: 'desc' },
      ],
      include: {
        user: {
          select: {
            name: true,
            nameEn: true,
            avatar: true,
          },
        },
      },
    });

    // Map properties so it aligns nicely with front-end selectors
    const mappedSellers = sellers.map(seller => ({
      id: seller.id,
      storeName: seller.storeName || seller.user?.name || '',
      storeNameEn: seller.storeNameEn || seller.user?.nameEn || seller.storeName || '',
      logo: seller.logo || '',
      user: {
        name: seller.user?.name || '',
        nameEn: seller.user?.nameEn || '',
        avatar: seller.user?.avatar || '',
      },
      level: seller.level,
      rating: seller.rating,
    }));

    return NextResponse.json({ success: true, sellers: mappedSellers });
  } catch (error: any) {
    console.error('[sellers-api] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sellers', details: error.message }, { status: 500 });
  }
}
