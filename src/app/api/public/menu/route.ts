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
      // Fetch ALL active categories to support infinite nesting
      const allCategories = await db.category.findMany({
        where: { isActive: true },
        select: { id: true, parentId: true, name: true, nameEn: true, slug: true, image: true, icon: true, translations: true },
        orderBy: { sortOrder: 'asc' }
      });

      // Populate top-level categories needed by `categories-grid` or references
      categories = allCategories.filter(c => c.parentId === null || categoryIds.has(c.id));

      // Recursive function to build category tree
      const buildCategoryTree = (parentId: string): any[] => {
        const subs = allCategories.filter(s => s.parentId === parentId);
        if (subs.length > 0) {
           console.log(`Found ${subs.length} subs for parentId ${parentId}`);
        }
        return subs.map(sub => {
          const labels: any = { ar: sub.name, en: sub.nameEn || sub.name };
          if (sub.translations && typeof sub.translations === 'object') {
            Object.assign(labels, sub.translations);
          }
          return {
            id: sub.id,
            type: 'standard',
            url: `/search?category=${sub.id}`,
            icon: sub.icon,
            labels,
            children: buildCategoryTree(sub.id) // Infinite nesting!
          };
        });
      };

      // Auto-populate children for direct-category items
      if (categoryIds.size > 0) {
        const populateChildren = (items: any[]) => {
          for (const item of items) {
            if (item.type === 'direct-category' && item.categoryId) {
              item.children = buildCategoryTree(item.categoryId);
            } else if (item.children && Array.isArray(item.children)) {
              populateChildren(item.children);
            }
          }
        };
        populateChildren(config.items);
      }
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
