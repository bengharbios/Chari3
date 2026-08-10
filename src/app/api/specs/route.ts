import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where: any = { isActive: true };
    
    // Fetch global specs AND category-specific specs if categoryId is provided
    if (categoryId) {
      where.OR = [
        { categoryId: null },
        { categoryId: categoryId }
      ];
    } else {
      where.categoryId = null;
    }

    const specs = await db.productSpecDefinition.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ success: true, specs });
  } catch (error) {
    console.error('Failed to fetch specs:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
