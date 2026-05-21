import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams.id;

  try {
    // 1. Resolve SellerProfile and Store by their IDs or by userId / managerId
    let sellerProfile = await db.sellerProfile.findFirst({
      where: {
        OR: [
          { id: id },
          { userId: id }
        ]
      }
    });

    let store = await db.store.findFirst({
      where: {
        OR: [
          { id: id },
          { managerId: id }
        ]
      }
    });

    // 2. Resolve the underlying User ID
    let userId = '';
    if (sellerProfile) {
      userId = sellerProfile.userId;
    } else if (store) {
      userId = store.managerId;
    } else {
      // Fallback: check if the id itself is a User ID
      const userObj = await db.user.findUnique({ where: { id } });
      if (userObj) {
        userId = userObj.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Seller or Store not found' }, { status: 404 });
    }

    // 3. Fully load both SellerProfile and Store for this User to ensure complete data sync
    if (userId) {
      if (!sellerProfile) {
        sellerProfile = await db.sellerProfile.findUnique({ where: { userId } });
      }
      if (!store) {
        store = await db.store.findUnique({ where: { managerId: userId } });
      }
    }

    // 4. Fetch the User profile details
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, nameEn: true, avatar: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }

    // 5. Query ALL active products associated with EITHER the SellerProfile OR the Store
    const conditions: Record<string, string>[] = [];
    if (sellerProfile) {
      conditions.push({ sellerId: sellerProfile.id });
      conditions.push({ sellerId: sellerProfile.userId });
    }
    if (store) {
      conditions.push({ storeId: store.id });
      conditions.push({ storeId: store.managerId });
    }
    if (userId) {
      conditions.push({ sellerId: userId });
      conditions.push({ storeId: userId });
    }

    let products: any[] = [];
    if (conditions.length > 0) {
      products = await db.product.findMany({
        where: {
          status: 'active',
          OR: conditions,
        },
        orderBy: { soldCount: 'desc' },
        take: 20,
        select: {
          id: true,
          name: true,
          nameEn: true,
          price: true,
          comparePrice: true,
          images: true,
          rating: true,
          soldCount: true,
          reviewCount: true,
          isFeatured: true,
          category: { select: { name: true } },
        },
      });
    }

    // 6. Map to the unified schema that satisfies both SellerProfilePage.tsx and other details views
    const mappedSeller = {
      id: sellerProfile?.id || store?.id || userId,
      storeName: sellerProfile?.storeName || store?.name || user.name || '',
      storeNameEn: sellerProfile?.storeNameEn || store?.nameEn || user.nameEn || '',
      bio: sellerProfile?.bio || store?.description || '',
      logo: sellerProfile?.logo || store?.logo || user.avatar || '',
      coverImage: sellerProfile?.coverImage || store?.coverImage || '',
      rating: sellerProfile?.rating ?? store?.rating ?? 0,
      level: sellerProfile?.level ?? store?.level ?? 1,
      totalSales: sellerProfile?.totalSales ?? store?.totalSales ?? 0,
      totalCustomers: sellerProfile?.totalCustomers ?? store?.totalCustomers ?? 0,
      isVerified: sellerProfile?.isVerified ?? store?.isActive ?? false,
      completionRate: sellerProfile?.completionRate ?? store?.completionRate ?? 100,
      responseRate: sellerProfile?.responseRate ?? 100,
      user: {
        name: user.name,
        nameEn: user.nameEn,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      _count: {
        products: products.length,
      },
      products: products,
    };

    return NextResponse.json({ success: true, seller: mappedSeller });

  } catch (error: any) {
    console.error('[seller-profile] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load seller', details: error.message }, { status: 500 });
  }
}
