import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/products/qa?productId=xxx&includePending=true
export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('productId');
    const includePending = req.nextUrl.searchParams.get('includePending') === 'true';

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId is required' }, { status: 400 });
    }

    const qas = await db.productQA.findMany({
      where: {
        productId,
        ...(includePending ? {} : { status: 'approved' })
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, qas });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/products/qa (Submit a question)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { productId, question, userId } = data;

    if (!productId || !question) {
      return NextResponse.json({ success: false, error: 'productId and question are required' }, { status: 400 });
    }

    const qa = await db.productQA.create({
      data: {
        productId,
        question: question.trim(),
        userId: userId || null,
        status: 'pending' // Default needs admin or merchant approval
      }
    });

    // Send in-app notification to the seller or store manager
    try {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: {
          name: true,
          sellerId: true,
          storeId: true,
        }
      });

      if (product) {
        let notifyUserId: string | null = null;
        if (product.storeId) {
          const store = await db.store.findUnique({
            where: { id: product.storeId },
            select: { managerId: true }
          });
          notifyUserId = store?.managerId || null;
        } else if (product.sellerId) {
          const sellerProfile = await db.sellerProfile.findUnique({
            where: { id: product.sellerId },
            select: { userId: true }
          });
          notifyUserId = sellerProfile?.userId || null;
        }

        if (notifyUserId) {
          await db.notification.create({
            data: {
              title: 'سؤال جديد معلق! ❓',
              titleEn: 'New Pending Question! ❓',
              body: `لديك سؤال جديد معلق على منتجك "${product.name}" بانتظار إجابتك.`,
              bodyEn: `You have a new pending question on your product "${product.name}" waiting for your answer.`,
              type: 'new_qa',
              data: JSON.stringify({ productId, qaId: qa.id }),
              userId: notifyUserId,
            }
          });
        }
      }
    } catch (notifErr) {
      console.error('[qa-notification-error]', notifErr);
    }

    return NextResponse.json({ success: true, qa });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PATCH /api/products/qa (Merchant answers or approves a QA)
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, answer, status } = data; // status: 'approved' | 'rejected'

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    if (answer !== undefined) {
      updateData.answer = answer.trim() === '' ? null : answer.trim();
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const qa = await db.productQA.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, qa });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
