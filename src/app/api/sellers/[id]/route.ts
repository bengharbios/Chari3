import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams.id;

  try {
    let seller: any = await db.sellerProfile.findUnique({
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
      // Try to find a Store instead
      const store = await db.store.findUnique({
        where: { id },
        include: {
          manager: { select: { name: true, nameEn: true, avatar: true, createdAt: true } },
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

      if (store) {
        // Map Store to a Seller-like structure so the frontend continues to work seamlessly!
        seller = {
          id: store.id,
          storeName: store.name,
          storeNameEn: store.nameEn,
          bio: store.description,
          logo: store.logo,
          coverImage: store.coverImage,
          rating: store.rating,
          level: store.level,
          totalSales: store.totalSales,
          totalCustomers: store.totalCustomers,
          isVerified: store.isActive, // Stores are verified if active
          completionRate: store.completionRate || 100,
          responseRate: 100, // Default for stores
          user: {
            name: store.manager.name,
            nameEn: store.manager.nameEn,
            avatar: store.manager.avatar,
            createdAt: store.createdAt,
          },
          _count: store._count,
          products: store.products,
        };
      }
    }

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller or Store not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, seller });

  } catch (error: any) {
    console.error('[seller-profile] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load seller', details: error.message }, { status: 500 });
  }
}
