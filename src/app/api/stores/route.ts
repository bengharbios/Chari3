import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || searchParams.get('search') || '';

    const where: Record<string, any> = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const stores = await db.store.findMany({
      where,
      take: 100,
      orderBy: [
        { level: 'desc' },
        { rating: 'desc' },
      ],
      include: {
        manager: {
          select: {
            name: true,
            nameEn: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, stores });
  } catch (error: any) {
    console.error('[stores-api] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stores', details: error.message }, { status: 500 });
  }
}
