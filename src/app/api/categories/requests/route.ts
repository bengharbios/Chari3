import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { nameAr, nameEn, description, type, userId } = data;

    if (!nameAr || !userId) {
      return NextResponse.json({ success: false, error: 'nameAr and userId are required' }, { status: 400 });
    }

    const request = await db.categoryRequest.create({
      data: {
        nameAr,
        nameEn,
        description,
        type: type || 'product',
        userId,
        status: 'pending'
      }
    });

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error('Failed to submit category request', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
