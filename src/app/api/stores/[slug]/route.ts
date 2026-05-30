import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/stores/[slug]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await context.params;
    const { slug } = resolvedParams;

    // 1. Try Store model first by slug, id, or managerId
    let store = await db.store.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug },
          { managerId: slug }
        ]
      },
      include: {
        manager: { select: { name: true, nameEn: true } },
      },
    });

    // 2. Try SellerProfile by id or userId
    let sellerProfile = await db.sellerProfile.findFirst({
      where: {
        OR: [
          { id: slug },
          { userId: slug }
        ]
      },
      include: {
        user: { select: { name: true, nameEn: true } },
      },
    });

    // 3. Sync and resolve underlying userId
    let userId = '';
    if (store) {
      userId = store.managerId;
    } else if (sellerProfile) {
      userId = sellerProfile.userId;
    }

    if (userId) {
      if (!store) {
        store = await db.store.findUnique({
          where: { managerId: userId },
          include: { manager: { select: { name: true, nameEn: true } } },
        });
      }
      if (!sellerProfile) {
        sellerProfile = await db.sellerProfile.findUnique({
          where: { userId },
          include: { user: { select: { name: true, nameEn: true } } },
        });
      }
    }

    if (!store && !sellerProfile) {
      return NextResponse.json({ success: false, error: 'المتجر غير موجود' }, { status: 404 });
    }

    // 4. Query products associated with EITHER Store OR SellerProfile
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
        include: {
          category: { select: { id: true, name: true, nameEn: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    let themeSettingsParsed = null;
    try {
      if (sellerProfile?.themeSettings) {
        themeSettingsParsed = JSON.parse(sellerProfile.themeSettings);
      } else if (store?.themeSettings) {
        themeSettingsParsed = JSON.parse(store.themeSettings);
      }
    } catch (e) {
      console.error('Failed to parse themeSettings:', e);
    }

    return NextResponse.json({
      success: true,
      store: {
        id: sellerProfile?.id || store?.id || userId,
        name: sellerProfile?.storeName || store?.name || store?.manager?.name || '',
        nameEn: sellerProfile?.storeNameEn || store?.nameEn || store?.manager?.nameEn || '',
        slug: store?.slug || slug,
        description: sellerProfile?.bio || store?.description || '',
        logo: sellerProfile?.logo || store?.logo || '',
        coverImage: sellerProfile?.coverImage || store?.coverImage || '',
        rating: sellerProfile?.rating ?? store?.rating ?? 0,
        totalSales: sellerProfile?.totalSales ?? store?.totalSales ?? 0,
        themeColor: themeSettingsParsed?.primaryColor || '#fbbf24',
        isActive: sellerProfile?.isActive ?? store?.isActive ?? true,
        ownerName: store?.manager?.name || sellerProfile?.user?.name || '',
      },
      products,
      totalProducts: products.length,
    });

  } catch (error) {
    console.error('[stores/slug]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
