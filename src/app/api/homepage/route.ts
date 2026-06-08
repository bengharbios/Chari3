import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDbConnection();

    // 1. Fetch pinned settings first to modify downstream queries
    const [pinnedItemsSetting, countdownSetting] = await Promise.all([
      db.setting.findUnique({ where: { key: 'homepage_pinned_items' } }),
      db.setting.findUnique({ where: { key: 'homepage_countdown' } }),
    ]);

    let pinnedProductIds: string[] = [];
    let pinnedStoreIds: string[] = [];
    let pinnedSellerIds: string[] = [];
    let pinnedData: any = null;

    try {
      if (pinnedItemsSetting?.value) {
        pinnedData = JSON.parse(pinnedItemsSetting.value);
        pinnedProductIds = pinnedData?.products?.map((p: any) => p.id) || [];
        pinnedStoreIds = pinnedData?.stores?.map((s: any) => s.id) || [];
        pinnedSellerIds = pinnedData?.sellers?.map((s: any) => s.id) || [];
      }
    } catch {}

    // 2. Fetch all other storefront data in parallel
    const [
      categories,
      rawProducts,
      topSellers,
      topStores,
      advertisements,
      testimonials,
      layoutSetting,
      heroSlidesSetting,
      maintenanceSetting,
      allowGuestCheckoutSetting,
      globalCoupons
    ] = await Promise.all([
      // Active categories with product counts
      db.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: 'asc' },
        take: 12,
      }),

      // Featured, recent, or pinned products
      db.product.findMany({
        where: { 
          status: 'active',
          OR: [
            { id: { in: pinnedProductIds } },
            {
              AND: [
                {
                  OR: [
                    { store: { isActive: true } },
                    { seller: { user: { isActive: true } } },
                    { storeId: null, sellerId: null }
                  ]
                }
              ]
            }
          ]
        },
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
        take: 100, // Fetch more to accommodate pinned items & score regular ones
      }),

      // Top sellers
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
        take: 20,
      }),

      // Top stores
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
        take: 20,
      }),

      // Active advertisements
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

      db.setting.findUnique({ where: { key: 'homepage_testimonials' } }),
      db.setting.findUnique({ where: { key: 'homepage_layout' } }),
      db.setting.findUnique({ where: { key: 'homepage_hero_slides' } }),
      db.setting.findUnique({ where: { key: 'flag_maintenance_mode' } }),
      db.setting.findUnique({ where: { key: 'allow_guest_checkout' } }),

      db.coupon.findMany({
        where: { 
          isGlobal: true, 
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ]
        },
        include: {
          optInStores: { select: { id: true } },
          optInSellers: { select: { id: true } },
        }
      })
    ]);

    // 3. Rank products dynamically in memory
    const rankedProducts = rawProducts.map((product: any) => {
      const merchant = product.seller || product.store;
      const isFeaturedBoost = product.isFeatured ? 50 : 0;
      
      const ageInDays = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const freshnessBoost = Math.max(0, 30 - ageInDays) * 1.5;
      
      const levelBoost = (merchant?.level || 1) * 3;
      const ratingBoost = (merchant?.rating || 0) * 5;
      const salesBoost = Math.min(20, (product.soldCount || 0) * 0.5);
      const viewsBoost = Math.min(10, (product.viewCount || 0) * 0.05);
      const productRatingBoost = (product.rating || 0) * 2;
      
      const packagePrice = merchant?.package?.price || 0;
      const packageBoost = Math.min(30, packagePrice * 0.02);
      
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
    
    // Sort regular ranked list
    rankedProducts.sort((a, b) => b.score - a.score);

    // Sort by pinned configurations (pinned items are forced to the top)
    const pinnedProductMap = new Map(pinnedProductIds.map((id, index) => [id, index]));
    const pinnedList = rankedProducts.filter(p => pinnedProductMap.has(p.id))
      .sort((a, b) => pinnedProductMap.get(a.id)! - pinnedProductMap.get(b.id)!);
    const regularList = rankedProducts.filter(p => !pinnedProductMap.has(p.id));
    const featuredProducts = [...pinnedList, ...regularList].slice(0, 50);

    // Apply pinning for stores
    const pinnedStoreMap = new Map(pinnedStoreIds.map((id, index) => [id, index]));
    const storePinned = topStores.filter(s => pinnedStoreMap.has(s.id))
      .sort((a, b) => pinnedStoreMap.get(a.id)! - pinnedStoreMap.get(b.id)!);
    const storeRegular = topStores.filter(s => !pinnedStoreMap.has(s.id));
    const finalStores = [...storePinned, ...storeRegular].slice(0, 8);

    // Apply pinning for sellers
    const pinnedSellerMap = new Map(pinnedSellerIds.map((id, index) => [id, index]));
    const sellerPinned = topSellers.filter(s => pinnedSellerMap.has(s.id))
      .sort((a, b) => pinnedSellerMap.get(a.id)! - pinnedSellerMap.get(b.id)!);
    const sellerRegular = topSellers.filter(s => !pinnedSellerMap.has(s.id));
    const finalSellers = [...sellerPinned, ...sellerRegular].slice(0, 8);

    // Track impressions for ads
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

    // Parse countdown configuration
    let parsedCountdown: any = { enabled: false };
    try {
      if (countdownSetting?.value) {
        parsedCountdown = JSON.parse(countdownSetting.value);
      }
    } catch {}

    // Process Global Coupons to extract participating products
    let globalCouponCampaigns: any[] = [];
    if (globalCoupons && globalCoupons.length > 0) {
      for (const coupon of globalCoupons) {
        const optedInStoreIds = coupon.optInStores.map((s: any) => s.id);
        const optedInSellerIds = coupon.optInSellers.map((s: any) => s.id);
        const participatingProducts = featuredProducts.filter((p: any) => 
          (p.storeId && optedInStoreIds.includes(p.storeId)) ||
          (p.sellerId && optedInSellerIds.includes(p.sellerId))
        );
        if (participatingProducts.length > 0) {
          globalCouponCampaigns.push({
            coupon,
            products: participatingProducts
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      categories,
      featuredProducts,
      topSellers: finalSellers,
      topStores: finalStores,
      advertisements: adsByZone,
      testimonials: parsedTestimonials,
      layout: parsedLayout,
      heroSlides: parsedHeroSlides,
      countdownConfig: parsedCountdown,
      globalCouponCampaigns,
      isMaintenance: maintenanceSetting?.value === 'true',
      allowGuestCheckout: allowGuestCheckoutSetting?.value === 'true',
    });
  } catch (error) {
    console.error('[homepage] Error: Database connection failed. Returning graceful fallback mock data.', error);
    
    // Graceful fallback mock data for seamless demo/offline experience
    const fallbackCategories = [
      { id: "mock-cat-1", name: "نظارات", nameEn: "Glasses", icon: "🕶️" },
      { id: "mock-cat-2", name: "أجهزة إلكترونية", nameEn: "Electronics", icon: "📱" },
      { id: "mock-cat-3", name: "أزياء وملابس", nameEn: "Fashion", icon: "👕" },
      { id: "mock-cat-4", name: "عطور ومستحضرات", nameEn: "Perfumes & Cosmetics", icon: "✨" }
    ];

    const fallbackProducts = [
      {
        id: "mock-prod-1",
        name: "نظارات شمسية ريبان كلاسيكية",
        nameEn: "Ray-Ban Classic Sunglasses",
        price: 14500,
        comparePrice: 18000,
        images: "[\"https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600\"]",
        rating: 4.9,
        soldCount: 42,
        seller: {
          storeName: "أمين للنظارات الجزائر",
          rating: 4.8,
          level: 3,
          logo: ""
        },
        category: { name: "نظارات" }
      },
      {
        id: "mock-prod-2",
        name: "ساعة ذكية رياضية Pro",
        nameEn: "Smart Watch Pro",
        price: 8900,
        comparePrice: 12000,
        images: "[\"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600\"]",
        rating: 4.7,
        soldCount: 115,
        store: {
          name: "الجزائر تك للالكترونيات",
          rating: 4.9,
          level: 5,
          logo: ""
        },
        category: { name: "أجهزة إلكترونية" }
      },
      {
        id: "mock-prod-3",
        name: "قميص صيفي كلاسيكي قطن",
        nameEn: "Classic Cotton Summer Shirt",
        price: 3400,
        comparePrice: 4500,
        images: "[\"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600\"]",
        rating: 4.5,
        soldCount: 84,
        store: {
          name: "دار الأناقة والملابس",
          rating: 4.8,
          level: 4,
          logo: ""
        },
        category: { name: "أزياء وملابس" }
      }
    ];

    const fallbackSellers = [
      {
        id: "mock-seller-1",
        storeName: "أمين للنظارات الجزائر",
        rating: 4.8,
        level: 3,
        totalSales: 140,
        user: { name: "أمين بن علي", avatar: "" },
        _count: { products: 12 }
      },
      {
        id: "mock-seller-2",
        storeName: "سامية كوزميتيكس",
        rating: 4.7,
        level: 2,
        totalSales: 98,
        user: { name: "سامية بلحاج", avatar: "" },
        _count: { products: 8 }
      }
    ];

    const fallbackStores = [
      {
        id: "mock-store-1",
        name: "سوبر ماركت العائلة بومرداس",
        nameEn: "Family Supermarket Boumerdes",
        rating: 4.9,
        level: 5,
        totalSales: 520,
        manager: { name: "ياسين حداد", avatar: "" },
        _count: { products: 150 }
      },
      {
        id: "mock-store-2",
        name: "دار الأناقة والملابس",
        nameEn: "Elegance Fashion House",
        rating: 4.8,
        level: 4,
        totalSales: 340,
        manager: { name: "منال عثماني", avatar: "" },
        _count: { products: 84 }
      }
    ];

    return NextResponse.json({
      success: true,
      categories: fallbackCategories,
      featuredProducts: fallbackProducts,
      topSellers: fallbackSellers,
      topStores: fallbackStores,
      advertisements: {},
      testimonials: [],
      layout: ['hero', 'features', 'categories', 'featured_products', 'top_sellers', 'testimonials', 'cta'],
      heroSlides: [],
      isMaintenance: false,
      isFallback: true,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
  }
}
