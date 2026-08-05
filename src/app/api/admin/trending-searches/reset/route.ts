import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Reset trendingScore for all categories
    await db.category.updateMany({
      data: { trendingScore: 0 }
    });

    return NextResponse.json({ success: true, message: 'Trending scores reset successfully' });
  } catch (error: any) {
    console.error('[trending-searches-reset] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
