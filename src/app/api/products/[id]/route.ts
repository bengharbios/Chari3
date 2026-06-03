import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams.id;

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, nameEn: true, slug: true } },
        brand: { select: { id: true, name: true, nameEn: true, logo: true } },
        variants: { orderBy: { sortOrder: 'asc' } },
        seller: {
          select: {
            id: true,
            storeName: true,
            storeNameEn: true,
            bio: true,
            logo: true,
            coverImage: true,
            rating: true,
            level: true,
            totalSales: true,
            totalCustomers: true,
            isVerified: true,
            user: { select: { isActive: true } },
            _count: { select: { products: true } },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            logo: true,
            coverImage: true,
            rating: true,
            level: true,
            totalSales: true,
            totalCustomers: true,
            isActive: true,
            description: true,
            _count: { select: { products: true } },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Check if store or seller is suspended/inactive
    const isStoreInactive = product.store && !product.store.isActive;
    const isSellerInactive = product.seller && product.seller.user && !product.seller.user.isActive;
    if (isStoreInactive || isSellerInactive) {
      return NextResponse.json({ success: false, error: 'Product is currently unavailable' }, { status: 403 });
    }

    // Fetch related products from same category
    const related = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        status: 'active',
        id: { not: id },
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        price: true,
        comparePrice: true,
        images: true,
        rating: true,
        soldCount: true,
      },
      orderBy: { soldCount: 'desc' },
      take: 10,
    });

    return NextResponse.json({ success: true, product, related });

  } catch (error: any) {
    console.error('[product-detail] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load product', details: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams.id;

  try {
    const body = await req.json();
    const slug = body.name?.toLowerCase().replace(/\s+/g, '-') || `product-${Date.now()}`;

    const product = await db.product.update({
      where: { id },
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
        images: JSON.stringify(body.images || []),
        specifications: JSON.stringify(body.specifications || {}),
        volumeDiscounts: body.volumeDiscounts ? (typeof body.volumeDiscounts === 'string' ? body.volumeDiscounts : JSON.stringify(body.volumeDiscounts)) : null,
        urgencySettings: body.urgencySettings ? (typeof body.urgencySettings === 'string' ? body.urgencySettings : JSON.stringify(body.urgencySettings)) : null,
      },
    });

    // Delete existing variants
    await db.productVariant.deleteMany({
      where: { productId: id },
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
          swatchType: v.swatchType || null,
          swatchValue: v.swatchValue || null,
          sortOrder: v.sortOrder !== undefined && v.sortOrder !== null ? parseInt(v.sortOrder, 10) : idx,
          isActive: v.isActive !== undefined ? !!v.isActive : true,
        })),
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to update product', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams.id;

  try {
    await db.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete product', details: error.message }, { status: 500 });
  }
}
