import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/reviews?productId=xxx
export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('productId');
    if (!productId) return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 });

    const reviews = await db.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { name: true, nameEn: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({ success: true, reviews, avgRating, total: reviews.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/reviews — submit a review
export async function POST(req: NextRequest) {
  try {
    const { userId, productId, orderId, rating, comment, title } = await req.json();
    if (!userId || !productId || !rating) {
      return NextResponse.json({ success: false, error: 'userId, productId, and rating required' }, { status: 400 });
    }

    // Verify user bought this product (has a completed order containing it)
    const hasPurchased = await db.orderItem.findFirst({
      where: {
        productId,
        order: { buyerId: userId, status: 'delivered' }
      }
    });

    if (!hasPurchased) {
      return NextResponse.json({ success: false, error: 'يجب أن تكون قد اشتريت المنتج وتم تسليمه لتتمكن من التقييم' }, { status: 403 });
    }

    // Check for existing review
    const existing = await db.review.findFirst({
      where: { userId, productId }
    });

    let review;
    if (existing) {
      review = await db.review.update({
        where: { id: existing.id },
        data: { rating, comment, title }
      });
    } else {
      review = await db.review.create({
        data: { userId, productId, orderId: orderId || null, rating, comment, title, isApproved: true }
      });
    }

    // Update product average rating
    const allReviews = await db.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true }
    });
    const newAvg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await db.product.update({
      where: { id: productId },
      data: { rating: newAvg }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
