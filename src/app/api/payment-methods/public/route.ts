import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const methods = await db.globalPaymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, methods });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}
