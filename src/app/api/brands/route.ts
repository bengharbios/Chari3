import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, brands });
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
