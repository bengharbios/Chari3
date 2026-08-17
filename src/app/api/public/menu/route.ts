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

    // Recursively find all required category IDs
    const categoryIds = new Set<string>();
    let hasCategoriesGrid = false;
    
    function extractIds(items: any[]) {
      for (const item of items) {
        if (item.type === 'categories-grid') hasCategoriesGrid = true;
        if (item.type === 'direct-category' && item.categoryId) categoryIds.add(item.categoryId);
        if (item.children) extractIds(item.children);
      }
    }
    extractIds(config.items);

    let categories: any[] = [];
    if (hasCategoriesGrid || categoryIds.size > 0) {
      categories = await db.category.findMany({
        where: { 
          OR: [
            hasCategoriesGrid ? { parentId: null } : {},
            { id: { in: Array.from(categoryIds) } }
          ],
          isActive: true
        },
        select: { id: true, name: true, nameEn: true, slug: true, image: true, icon: true, translations: true },
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
