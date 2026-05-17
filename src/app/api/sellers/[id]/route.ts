import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const seller = await db.sellerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, nameEn: true, avatar: true, createdAt: true } },
        _count: { select: { products: true } },
        products: {
          where: { status: 'active' },
          orderBy: { soldCount: 'desc' },
          take: 20,
          select: {
            id: true, name: true, nameEn: true, price: true, comparePrice: true,
            images: true, rating: true, soldCount: true, reviewCount: true, isFeatured: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, seller });

  } catch (error) {
    console.error('[seller-profile] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load seller' }, { status: 500 });
  }
}
