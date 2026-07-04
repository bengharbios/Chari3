import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/seller/appeal?userId=xxx  — get user's latest appeal
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });

    const appeal = await db.suspensionAppeal.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, appeal });
  } catch (err) {
    console.error('[GET /api/seller/appeal]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// POST /api/seller/appeal  — submit a new appeal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, reason, documentUrl } = body;

    if (!userId || !reason) {
      return NextResponse.json({ success: false, error: 'userId and reason are required' }, { status: 400 });
    }

    // Check user exists and is suspended
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // Check for already-pending appeal
    const existing = await db.suspensionAppeal.findFirst({
      where: { userId, status: 'pending' },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'لديك طلب استئناف قيد المراجعة بالفعل. يرجى الانتظار.',
        errorEn: 'You already have a pending appeal. Please wait for our team to review it.',
      }, { status: 400 });
    }

    const appeal = await db.suspensionAppeal.create({
      data: { userId, reason, documentUrl: documentUrl || null, status: 'pending' },
    });

    return NextResponse.json({ success: true, appeal });
  } catch (err) {
    console.error('[POST /api/seller/appeal]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
