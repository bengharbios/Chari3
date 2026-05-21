import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDbConnection();
    // Fetch data for the homepage in parallel
    const [categories, rawProducts, topSellers, topStores, advertisements, testimonials, layoutSetting, heroSlidesSetting, maintenanceSetting] = await Promise.all([
      // Active categories with product counts
      db.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: 'asc' },
        take: 12,
      }),

      // Featured and recent products (fetching up to 100 for dynamic scoring)
      db.product.findMany({
        where: { status: 'active' },
        include: {
          category: { select: { name: true, nameEn: true } },
          seller: {
            select: {
              storeName: true,
              storeNameEn: true,
              rating: true,
              level: true,
              logo: true,
              package: { select: { price: true } },
            },
          },
          store: {
            select: {
              name: true,
              nameEn: true,
              rating: true,
              level: true,
              logo: true,
              package: { select: { price: true } },
            },
          },
        },
        take: 100,
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

      // Top stores by rating and level
      db.store.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { products: true } },
          manager: { select: { name: true, nameEn: true, avatar: true } },
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

    // Rank products dynamically in memory
    const rankedProducts = rawProducts.map((product: any) => {
      const merchant = product.seller || product.store;
      const isFeaturedBoost = product.isFeatured ? 50 : 0;
      
      // Freshness boost: declines over 30 days
      const ageInDays = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const freshnessBoost = Math.max(0, 30 - ageInDays) * 1.5; // Up to 45 points
      
      // Level boost
      const levelBoost = (merchant?.level || 1) * 3; // Up to 30 points
      
      // Rating boost
      const ratingBoost = (merchant?.rating || 0) * 5; // Up to 25 points
      
      // Organic metrics
      const salesBoost = Math.min(20, (product.soldCount || 0) * 0.5); // Up to 20 points
      const viewsBoost = Math.min(10, (product.viewCount || 0) * 0.05); // Up to 10 points
      const productRatingBoost = (product.rating || 0) * 2; // Up to 10 points
      
      // Package price boost
      const packagePrice = merchant?.package?.price || 0;
      const packageBoost = Math.min(30, packagePrice * 0.02); // Up to 30 points
      
      const score = 
        isFeaturedBoost + 
        freshnessBoost + 
        levelBoost + 
        ratingBoost + 
        salesBoost + 
        viewsBoost + 
        productRatingBoost + 
        packageBoost;
        
      return { ...product, score };
    });
    
    // Sort in-memory
    rankedProducts.sort((a, b) => b.score - a.score);
    const featuredProducts = rankedProducts.slice(0, 20);

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
    const defaultLayout = ['hero', 'features', 'categories', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
    let parsedLayout: string[] = defaultLayout;
    try {
      if (layoutSetting?.value) {
        const val = JSON.parse(layoutSetting.value);
        if (Array.isArray(val) && val.length > 0) {
          parsedLayout = val;
        }
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
      topStores,
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
