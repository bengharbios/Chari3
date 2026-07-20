import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const category = searchParams.get('category') || searchParams.get('categoryId');
  const status = searchParams.get('status');
  const search = searchParams.get('search') || searchParams.get('q');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'newest'; // newest | price_asc | price_desc | rating
  const storeId = searchParams.get('storeId');
  const sellerId = searchParams.get('sellerId');
  const minRating = searchParams.get('minRating');

  const where: Record<string, any> = {};
  if (category) where.categoryId = category;
  if (status) where.status = status;

  // Resolve store and seller IDs to support polymorphic querying
  if (storeId) {
    const storeResolvedIds: string[] = [storeId];
    try {
      const store = await db.store.findUnique({
        where: { id: storeId },
        include: {
          manager: {
            include: {
              sellerProfile: { select: { id: true } }
            }
          }
        }
      });
      if (store) {
        if (store.managerId) storeResolvedIds.push(store.managerId);
        if (store.manager?.sellerProfile?.id) storeResolvedIds.push(store.manager.sellerProfile.id);
      }
    } catch (e) {
      console.error('Failed to resolve store IDs:', e);
    }
    where.OR = [
      { storeId: { in: storeResolvedIds } },
      { sellerId: { in: storeResolvedIds } }
    ];
  } else if (sellerId) {
    const sellerResolvedIds: string[] = [sellerId];
    try {
      const seller = await db.sellerProfile.findUnique({
        where: { id: sellerId },
        include: {
          user: {
            include: {
              store: { select: { id: true } }
            }
          }
        }
      });
      if (seller) {
        if (seller.userId) sellerResolvedIds.push(seller.userId);
        if (seller.user?.store?.id) sellerResolvedIds.push(seller.user.store.id);
      }
    } catch (e) {
      console.error('Failed to resolve seller IDs:', e);
    }
    where.OR = [
      { storeId: { in: sellerResolvedIds } },
      { sellerId: { in: sellerResolvedIds } }
    ];
  }

  // Ensure products are only listed for active stores/sellers in the storefront
  if (status === 'active') {
    const activeConditions = {
      OR: [
        { store: { isActive: true } },
        { seller: { user: { isActive: true } } },
        { storeId: null, sellerId: null }
      ]
    };
    if (where.AND) {
      where.AND.push(activeConditions);
    } else {
      where.AND = [activeConditions];
    }
  }

  // Search across name and nameEn
  if (search) {
    where.OR = [
      ...(where.OR || []),
      { name: { contains: search } },
      { nameEn: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // Price range
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
  }

  // Rating filter
  if (minRating) {
    where.rating = { gte: parseFloat(minRating) };
  }

  // Sort order
  const orderByMap: Record<string, object> = {
    newest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    rating: { rating: 'desc' },
    popular: { soldCount: 'desc' },
  };
  const orderBy = orderByMap[sort] || orderByMap.newest;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        category: { select: { id: true, name: true, nameEn: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, limit, pages: Math.ceil(total / limit) });
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body.name?.toLowerCase().replace(/\s+/g, '-') || `product-${Date.now()}`;

    let storeId = body.storeId || null;
    let sellerId = body.sellerId || null;

    const lookupId = body.storeId || body.sellerId;
    if (lookupId) {
      const store = await db.store.findFirst({
        where: {
          OR: [
            { id: lookupId },
            { managerId: lookupId }
          ]
        }
      });
      const seller = await db.sellerProfile.findFirst({
        where: {
          OR: [
            { id: lookupId },
            { userId: lookupId }
          ]
        }
      });

      if (store) {
        storeId = store.id;
      }
      if (seller) {
        sellerId = seller.id;
      }

      if (store && !seller) {
        const crossSeller = await db.sellerProfile.findUnique({
          where: { userId: store.managerId }
        });
        if (crossSeller) sellerId = crossSeller.id;
      }
      if (seller && !store) {
        const crossStore = await db.store.findUnique({
          where: { managerId: seller.userId }
        });
        if (crossStore) storeId = crossStore.id;
      }
    }

    // Check if system requires admin approval for products before making active
    let initialStatus = body.status || 'draft';
    const approvalSetting = await db.systemSetting.findUnique({
      where: { key: 'require_admin_approval_for_products' },
    });

    if (approvalSetting?.value === 'true' && initialStatus === 'active') {
      initialStatus = 'pending_approval';
    }

    const product = await db.product.create({
      data: {
        name: body.name,
        nameEn: body.nameEn,
        slug,
        description: body.description,
        descriptionEn: body.descriptionEn || null,
        price: body.price,
        comparePrice: body.comparePrice,
        costPrice: body.costPrice,
        sku: body.sku,
        stock: body.stock || 0,
        status: initialStatus,
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        storeId,
        sellerId,
        images: JSON.stringify(body.images || []),
        specifications: JSON.stringify(body.specifications || {}),
        volumeDiscounts: body.volumeDiscounts ? (typeof body.volumeDiscounts === 'string' ? body.volumeDiscounts : JSON.stringify(body.volumeDiscounts)) : null,
        urgencySettings: body.urgencySettings ? (typeof body.urgencySettings === 'string' ? body.urgencySettings : JSON.stringify(body.urgencySettings)) : null,
      },
    });

    // Create Notification for Super Admins if pending approval
    if (initialStatus === 'pending_approval') {
      const adminUsers = await db.user.findMany({
        where: { role: 'admin' },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        await db.notification.create({
          data: {
            userId: admin.id,
            title: `⏳ منتج جديد بانتظار المراجعة والموافقة (${product.name})`,
            titleEn: `⏳ New product pending approval (${product.nameEn || product.name})`,
            body: `قام التاجر بإضافة منتج جديد وهو بانتظار مراجعك وموافقتك في لوحة التحكم.`,
            bodyEn: `A merchant added a new product that is waiting for your review and approval.`,
            type: 'alert',
            data: JSON.stringify({ productId: product.id, action: 'pending_approval' }),
          },
        });
      }
    }

    // Create associated variants if present
    if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
      await db.productVariant.createMany({
        data: body.variants.map((v: any, idx: number) => ({
          productId: product.id,
          name: v.name,
          value: v.value,
          sku: v.sku || null,
          price: v.price !== undefined && v.price !== null ? parseFloat(v.price) : null,
          comparePrice: v.comparePrice !== undefined && v.comparePrice !== null ? parseFloat(v.comparePrice) : null,
          stock: parseInt(v.stock || '0', 10),
          image: v.image || null,
          swatchType: v.swatchType || null,
          swatchValue: v.swatchValue || null,
          sortOrder: v.sortOrder !== undefined && v.sortOrder !== null ? parseInt(v.sortOrder, 10) : idx,
          isActive: v.isActive !== undefined ? !!v.isActive : true,
        })),
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('[products-create] Error:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
