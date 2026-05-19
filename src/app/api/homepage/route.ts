import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch data for the homepage in parallel
    const [categories, featuredProducts, topSellers, advertisements, testimonials, layoutSetting, heroSlidesSetting, maintenanceSetting] = await Promise.all([
      // Active categories with product counts
      db.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: 'asc' },
        take: 12,
      }),

      // Featured products sorted by level boost (higher seller level = higher rank)
      db.product.findMany({
        where: { status: 'active', isFeatured: true },
        include: {
          category: { select: { name: true, nameEn: true } },
          seller: {
            select: {
              storeName: true,
              storeNameEn: true,
              rating: true,
              level: true,
              logo: true,
            },
          },
          store: {
            select: {
              name: true,
              nameEn: true,
              rating: true,
              level: true,
              logo: true,
            },
          },
        },
        orderBy: [
          { soldCount: 'desc' },
          { rating: 'desc' },
        ],
        take: 20,
      }),

      // Top sellers by rating and level
      db.sellerProfile.findMany({
        where: { isVerified: true },
        include: {
          user: { select: { name: true, nameEn: true, avatar: true } },
          _count: { select: { products: true } },
        },
        orderBy: [
          { level: 'desc' },
          { rating: 'desc' },
          { totalSales: 'desc' },
        ],
        take: 8,
      }),

      // Active advertisements for the homepage
      db.advertisement.findMany({
        where: {
          isActive: true,
          OR: [
            { startsAt: null },
            { startsAt: { lte: new Date() } },
          ],
          AND: [
            {
              OR: [
                { endsAt: null },
                { endsAt: { gte: new Date() } },
              ],
            },
          ],
        },
        orderBy: [{ sortOrder: 'asc' }],
      }),

      // Testimonials from settings (stored as JSON)
      db.setting.findUnique({ where: { key: 'homepage_testimonials' } }),
      
      // Dynamic Homepage Layout
      db.setting.findUnique({ where: { key: 'homepage_layout' } }),

      // Dynamic Hero Slides
      db.setting.findUnique({ where: { key: 'homepage_hero_slides' } }),

      // Maintenance mode flag
      db.setting.findUnique({ where: { key: 'flag_maintenance_mode' } }),
    ]);

    // Track impressions for ads (fire and forget)
    if (advertisements.length > 0) {
      const ids = advertisements.map((a) => a.id);
      db.advertisement
        .updateMany({
          where: { id: { in: ids } },
          data: { impressions: { increment: 1 } },
        })
        .catch(() => {});
    }

    // Group ads by zone
    const adsByZone: Record<string, typeof advertisements> = {};
    for (const ad of advertisements) {
      if (!adsByZone[ad.zone]) adsByZone[ad.zone] = [];
      adsByZone[ad.zone].push(ad);
    }

    // Parse testimonials
    let parsedTestimonials: unknown[] = [];
    try {
      if (testimonials?.value) {
        parsedTestimonials = JSON.parse(testimonials.value);
      }
    } catch {}

    // Parse dynamic layout
    let parsedLayout: string[] = ['hero', 'features', 'categories', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
    try {
      if (layoutSetting?.value) {
        parsedLayout = JSON.parse(layoutSetting.value);
      }
    } catch {}

    // Parse dynamic hero slides
    let parsedHeroSlides: unknown[] = [];
    try {
      if (heroSlidesSetting?.value) {
        parsedHeroSlides = JSON.parse(heroSlidesSetting.value);
      }
    } catch {}

    return NextResponse.json({
      success: true,
      categories,
      featuredProducts,
      topSellers,
      advertisements: adsByZone,
      testimonials: parsedTestimonials,
      layout: parsedLayout,
      heroSlides: parsedHeroSlides,
      isMaintenance: maintenanceSetting?.value === 'true',
    });
  } catch (error) {
    console.error('[homepage] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load homepage data' },
      { status: 500 }
    );
  }
}
