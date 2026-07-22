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

    let storeId = body.storeId || undefined;
    let sellerId = body.sellerId || undefined;

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
    let updatedStatus = body.status || 'draft';
    const approvalSetting = await db.systemSetting.findUnique({
      where: { key: 'require_admin_approval_for_products' },
    });

    if (approvalSetting?.value === 'true' && updatedStatus === 'active') {
      updatedStatus = 'pending_approval';
    }

    const product = await db.product.update({
      where: { id },
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
        status: updatedStatus,
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

    // Notify Super Admin if pending approval
    if (updatedStatus === 'pending_approval') {
      const adminUsers = await db.user.findMany({
        where: { role: 'admin' },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        await db.notification.create({
          data: {
            userId: admin.id,
            title: `⏳ تعديل منتج بانتظار المراجعة والموافقة (${product.name})`,
            titleEn: `⏳ Updated product pending approval (${product.nameEn || product.name})`,
            body: `قام التاجر بتحديث منتج وهو بانتظار مراجعك وموافقتك في لوحة التحكم.`,
            bodyEn: `A merchant updated a product that is waiting for your review and approval.`,
            type: 'alert',
            link: '/admin-secure-internal/products/approvals',
            data: JSON.stringify({ productId: product.id, action: 'pending_approval', actionUrl: '/admin-secure-internal/products/approvals', actionLabelAr: 'مراجعة وقبول المنتجات' }),
          },
        });
      }
    }

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
