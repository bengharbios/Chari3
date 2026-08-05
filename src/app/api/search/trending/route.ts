import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const trendingCategories = await db.category.findMany({
      where: { isActive: true, trendingScore: { gt: 0 } },
      orderBy: { trendingScore: 'desc' },
      take: 10,
      select: { id: true, name: true, nameEn: true, trendingScore: true }
    });

    return NextResponse.json({ trendingCategories });
  } catch (error) {
    console.error('[search-trending] Error:', error);
    return NextResponse.json({ trendingCategories: [] }, { status: 500 });
  }
}
