import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET — Fetch products pending approval or all products for moderation
export async function GET(req: Request) {
  try {
    await ensureDbConnection();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status') || 'pending_approval';

    const products = await db.product.findMany({
      where: statusFilter === 'all' ? {} : { status: statusFilter },
      include: {
        category: { select: { id: true, name: true, nameEn: true } },
        brand: { select: { id: true, name: true, nameEn: true } },
        store: { select: { id: true, name: true, logo: true } },
        seller: {
          select: {
            id: true,
            storeName: true,
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST — Process product approval or rejection
export async function POST(req: Request) {
  try {
    await ensureDbConnection();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, action, notes } = await req.json();

    if (!productId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        seller: { select: { userId: true } },
        store: { select: { id: true, name: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'active' : 'draft';

    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        status: newStatus,
        specifications: JSON.stringify({
          ...(product.specifications ? JSON.parse(product.specifications) : {}),
          adminRejectionReason: action === 'reject' ? (notes || 'يتطلب تعديلات ليتوافق مع معايير المنصة') : null,
          reviewedAt: new Date().toISOString(),
        }),
      },
    });

    // Determine target seller userId to send notification
    let sellerUserId = product.sellerId ? product.seller?.userId : null;

    if (!sellerUserId && product.storeId) {
      const storeOwner = await db.store.findUnique({
        where: { id: product.storeId },
        select: { userId: true },
      });
      sellerUserId = storeOwner?.userId || null;
    }

    // Create In-App Notification for Merchant
    if (sellerUserId) {
      if (action === 'approve') {
        await db.notification.create({
          data: {
            userId: sellerUserId,
            title: `🎉 تمت الموافقة على نشر منتجك (${product.name})`,
            titleEn: `🎉 Product Approved & Published (${product.nameEn || product.name})`,
            body: `تمت موافقة الأدمن على نشر المنتج (${product.name}) وهو الآن معروض حياً للمشترين في المتجر.`,
            bodyEn: `Your product (${product.nameEn || product.name}) was approved and is now live in the store.`,
            type: 'system',
            data: JSON.stringify({ productId: product.id, action: 'approved' }),
          },
        });
      } else {
        await db.notification.create({
          data: {
            userId: sellerUserId,
            title: `⚠️ مطلوب تعديل على منتجك (${product.name})`,
            titleEn: `⚠️ Action Required on Product (${product.nameEn || product.name})`,
            body: `سبب الرفض/طلب التعديل: ${notes || 'يرجى مراجعة تفاصيل المنتج وتعديله'}. يمكنك تعديل المنتج وإعادة إرساله للمراجعة.`,
            bodyEn: `Rejection reason: ${notes || 'Please update product details'}. You can edit and resubmit for approval.`,
            type: 'alert',
            data: JSON.stringify({ productId: product.id, action: 'rejected', notes }),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: action === 'approve' ? 'Product approved successfully' : 'Product rejected with feedback',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
