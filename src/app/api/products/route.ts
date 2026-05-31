import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category') || searchParams.get('categoryId');
  const status = searchParams.get('status');
  const search = searchParams.get('search') || searchParams.get('q');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'newest'; // newest | price_asc | price_desc | rating
  const storeId = searchParams.get('storeId');
  const sellerId = searchParams.get('sellerId');
  const minRating = searchParams.get('minRating');

  const where: Record<string, unknown> = {};
  if (category) where.categoryId = category;
  if (status) where.status = status;
  if (storeId) where.storeId = storeId;
  if (sellerId) where.sellerId = sellerId;

  // Search across name and nameEn
  if (search) {
    where.OR = [
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

    const product = await db.product.create({
      data: {
        name: body.name,
        nameEn: body.nameEn,
        slug,
        description: body.description,
        price: body.price,
        comparePrice: body.comparePrice,
        costPrice: body.costPrice,
        sku: body.sku,
        stock: body.stock || 0,
        status: body.status || 'draft',
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        storeId: body.storeId,
        sellerId: body.sellerId,
        images: JSON.stringify(body.images || []),
        specifications: JSON.stringify(body.specifications || {}),
      },
    });

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
