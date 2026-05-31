import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const typeParam = searchParams.get('type'); // null if not provided

    // Build base where clause — type filter only applied if explicitly requested
    const where: Record<string, unknown> = { isActive: true };

    if (parentId && parentId !== 'null') {
      where.parentId = parentId;
    } else {
      where.parentId = null;
    }

    // Try with type filter first (works after db push)
    // Fallback to all categories if type column doesn't exist yet
    let categories: any[] = [];

    if (typeParam) {
      // Explicit type requested — try with type filter, fallback to no filter
      try {
        categories = await db.category.findMany({
          where: { ...where, type: typeParam },
          orderBy: { sortOrder: 'asc' },
        });
      } catch {
        // type column might not exist yet — return all
        categories = await db.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        });
      }
    } else {
      // No type requested (e.g. seller product form) — return all active categories
      // This is the backward-compatible default so dropdowns are never empty
      categories = await db.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    }

    return NextResponse.json(
      categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        nameEn: cat.nameEn ?? null,
        slug: cat.slug,
        type: (cat as any).type ?? 'product',
        icon: cat.icon ?? null,
        image: cat.image ?? null,
        sortOrder: cat.sortOrder,
        parentId: cat.parentId ?? null,
      }))
    );
  } catch (error) {
    console.error('[categories GET]', error);
    return NextResponse.json([], { status: 200 }); // Always return array, never crash
  }
}
