import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') || 'pending';
    const requests = await db.categoryRequest.findMany({
      where: status === 'all' ? {} : { status },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: true } }
      }
    });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status, adminNote } = data; // status: 'approved' | 'rejected'
    
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status required' }, { status: 400 });
    }

    const request = await db.categoryRequest.update({
      where: { id },
      data: { status, adminNote }
    });

    return NextResponse.json({ success: true, request });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
