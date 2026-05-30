import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/stores/[slug]
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Try Store model first
    const store = await db.store.findFirst({
      where: { slug },
      include: {
        manager: { select: { name: true, nameEn: true } },
      },
    });

    if (store) {
      const products = await db.product.findMany({
        where: { storeId: store.id, status: 'active' },
        include: {
          category: { select: { id: true, name: true, nameEn: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        store: {
          id: store.id,
          name: store.name,
          nameEn: store.nameEn,
          slug: store.slug,
          description: store.description,
          logo: store.logo,
          coverImage: store.coverImage,
          rating: store.rating,
          totalSales: store.totalSales,
          themeColor: store.themeColor,
          isActive: store.isActive,
          ownerName: store.manager?.name,
        },
        products,
        totalProducts: products.length,
      });
    }

    // Try SellerProfile by slug (independent sellers)
    const sellerProfile = await db.sellerProfile.findFirst({
      where: { storeSlug: slug },
      include: {
        user: { select: { name: true, nameEn: true } },
      },
    });

    if (sellerProfile) {
      const products = await db.product.findMany({
        where: { sellerId: sellerProfile.id, status: 'active' },
        include: {
          category: { select: { id: true, name: true, nameEn: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        store: {
          id: sellerProfile.id,
          name: sellerProfile.storeName,
          nameEn: sellerProfile.storeNameEn,
          slug,
          description: sellerProfile.bio,
          logo: sellerProfile.logo,
          coverImage: sellerProfile.coverImage,
          rating: sellerProfile.rating,
          totalSales: sellerProfile.totalSales,
          themeColor: sellerProfile.themeColor,
          isActive: sellerProfile.isActive,
          ownerName: sellerProfile.user?.name,
        },
        products,
        totalProducts: products.length,
      });
    }

    return NextResponse.json({ success: false, error: 'المتجر غير موجود' }, { status: 404 });
  } catch (error) {
    console.error('[stores/slug]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
