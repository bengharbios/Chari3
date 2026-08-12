import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDbConnection();
    const settings = await db.platformSettings.findUnique({
      where: { id: 'global' },
      select: { publicMenuConfig: true }
    });

    let config = { alignment: 'center', fontFamily: 'var(--font-inter)', items: [] };
    if (settings?.publicMenuConfig) {
      try {
        const parsed = JSON.parse(settings.publicMenuConfig);
        if (Array.isArray(parsed)) {
          config.items = parsed; // Fallback for old data
        } else {
          config = { ...config, ...parsed };
        }
      } catch (e) {}
    }

    // Check if any item is a categories-grid
    const hasCategoriesGrid = config.items.some((item: any) => item.type === 'categories-grid');
    let categories: any[] = [];
    if (hasCategoriesGrid) {
      categories = await db.category.findMany({
        where: { parentId: null, isActive: true },
        select: { id: true, name: true, nameEn: true, slug: true, image: true, icon: true },
        orderBy: { sortOrder: 'asc' }
      });
    }

    return NextResponse.json({
      success: true,
      menuConfig: config,
      categories
    });
  } catch (error) {
    console.error('Failed to fetch public menu:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
