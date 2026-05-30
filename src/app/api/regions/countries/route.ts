import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const countries = await db.country.findMany({
      where: { isActive: true },
      orderBy: { nameAr: 'asc' },
    });

    return NextResponse.json({ success: true, countries });
  } catch (error) {
    console.error('[countries GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
