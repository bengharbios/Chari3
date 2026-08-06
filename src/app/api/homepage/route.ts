import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDbConnection();

    // 1. Fetch pinned settings first to modify downstream queries
    const [pinnedItemsSetting, countdownSetting, activeTemplateSetting] = await Promise.all([
      db.setting.findUnique({ where: { key: 'homepage_pinned_items' } }),
      db.setting.findUnique({ where: { key: 'homepage_countdown' } }),
      db.setting.findUnique({ where: { key: 'active_homepage_template' } }),
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
      featuresSetting,
      trendingSearchesSetting,
      ctaSetting,
      globalCoupons,
      saadaLayoutSetting,
      trendingCategories
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
      db.setting.findUnique({ where: { key: 'homepage_features' } }),
      db.setting.findUnique({ where: { key: 'homepage_trending_searches' } }),
      db.setting.findUnique({ where: { key: 'homepage_cta' } }),

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
      }),
      
      // Fetch SAADA layout directly if it's the active template
      (activeTemplateSetting?.value && activeTemplateSetting.value !== 'homepage_layout') 
        ? db.setting.findUnique({ where: { key: activeTemplateSetting.value } })
        : Promise.resolve(null),
        
      // Fetch automated trending categories
      db.category.findMany({
        where: { isActive: true, trendingScore: { gt: 0 } },
        orderBy: { trendingScore: 'desc' },
        take: 10,
        select: { id: true, name: true, nameEn: true, trendingScore: true }
      })
    ]);

    // Parse dynamic layout - always ensure core sections exist
    const coreDefaultOrder = ['hero', 'features', 'categories', 'bento_offers', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
    const coreSectionTypes = new Set(coreDefaultOrder);
    let parsedLayout: any = coreDefaultOrder;
    try {
      if (saadaLayoutSetting?.value) {
        const val = JSON.parse(saadaLayoutSetting.value);
        if (val && typeof val === 'object' && val.content) {
          // This is a Puck JSON layout!
          parsedLayout = val;
        }
      } else if (layoutSetting?.value) {
        const val = JSON.parse(layoutSetting.value);
        if (Array.isArray(val) && val.length > 0) {
          const savedCoreTypes = new Set<string>();
          for (const item of val) {
            const itemType = typeof item === 'string' ? item : item?.type;
            if (itemType && coreSectionTypes.has(itemType)) {
              savedCoreTypes.add(itemType);
            }
          }
          const missingCore = coreDefaultOrder
            .filter(ct => !savedCoreTypes.has(ct))
            .map(ct => ({ id: ct, type: ct, visible: true }));
          parsedLayout = [...val, ...missingCore];
        }
      }
    } catch {}

    let featuredProductsFilter = 'smart';
    let topSellersFilter = 'smart';
    if (Array.isArray(parsedLayout)) {
      for (const item of parsedLayout) {
        if (item.type === 'featured_products' && item.filterType) featuredProductsFilter = item.filterType;
        if (item.type === 'top_sellers' && item.filterType) topSellersFilter = item.filterType;
      }
    }

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
    
    // Sort regular ranked list based on filterType
    if (featuredProductsFilter === 'most_sold') {
      rankedProducts.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    } else if (featuredProductsFilter === 'most_viewed') {
      rankedProducts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (featuredProductsFilter === 'highest_rated') {
      rankedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (featuredProductsFilter === 'newest') {
      rankedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      rankedProducts.sort((a, b) => b.score - a.score);
    }

    // Sort by pinned configurations (pinned items are forced to the top)
    const pinnedProductMap = new Map(pinnedProductIds.map((id, index) => [id, index]));
    
    // Helper function to apply specific filters to a copied list
    const applyFilter = (filter: string, list: any[]) => {
      const copy = [...list];
      if (filter === 'most_sold') copy.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      else if (filter === 'most_viewed') copy.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      else if (filter === 'highest_rated') copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (filter === 'newest') copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      else if (filter === 'lowest_price') copy.sort((a, b) => (a.price || 0) - (b.price || 0));
      else if (filter === 'has_coupons') {
        // Simple mock for has_coupons: items with comparePrice > price 
        copy.sort((a, b) => {
          const aHasDiscount = (a.comparePrice && a.comparePrice > a.price) ? 1 : 0;
          const bHasDiscount = (b.comparePrice && b.comparePrice > b.price) ? 1 : 0;
          return bHasDiscount - aHasDiscount || b.score - a.score;
        });
      }
      else copy.sort((a, b) => b.score - a.score);
      return copy;
    };

    const regularList = applyFilter(featuredProductsFilter, rankedProducts.filter(p => !pinnedProductMap.has(p.id)));
    const pinnedList = rankedProducts.filter(p => pinnedProductMap.has(p.id))
      .sort((a, b) => pinnedProductMap.get(a.id)! - pinnedProductMap.get(b.id)!);
    
    const featuredProducts = [...pinnedList, ...regularList].slice(0, 50);

    // Helper: filter products by category/store/seller entity IDs
    const applyEntityFilter = (products: any[], categoryId?: string, storeId?: string, sellerId?: string) => {
      let filtered = [...products];
      if (categoryId) filtered = filtered.filter(p => p.categoryId === categoryId);
      if (storeId) filtered = filtered.filter(p => p.storeId === storeId);
      if (sellerId) filtered = filtered.filter(p => p.sellerId === sellerId);
      return filtered;
    };

    // Generate Bento specific lists if Bento is active
    let bentoRightProducts: any[] = [];
    let bentoCenterProducts: any[] = [];
    let bentoLeftProducts: any[] = [];
    if (Array.isArray(parsedLayout)) {
      const bentoSection = parsedLayout.find((s: any) => s.type === 'bento_offers');
      if (bentoSection) {
      const subFilter1 = bentoSection.metadata?.subFilter1 || 'smart';
      const subFilter2 = bentoSection.metadata?.subFilter2 || 'smart';

      // Right card: apply entity filters then sort
      const rightCategory = bentoSection.metadata?.rightCategory;
      const rightStore = bentoSection.metadata?.rightStore;
      const rightSeller = bentoSection.metadata?.rightSeller;
      const rightBaseProducts = applyEntityFilter(rankedProducts, rightCategory, rightStore, rightSeller);
      bentoRightProducts = [...pinnedList.filter(p => rightBaseProducts.some(rp => rp.id === p.id) || (!rightCategory && !rightStore && !rightSeller)), ...applyFilter(subFilter1, rightBaseProducts.filter(p => !pinnedProductMap.has(p.id)))].slice(0, 10);

      // Center card: apply entity filters and sort
      const centerCategory = bentoSection.metadata?.centerCategory;
      const centerStore = bentoSection.metadata?.centerStore;
      const centerSeller = bentoSection.metadata?.centerSeller;
      const subFilterCenter = bentoSection.metadata?.subFilterCenter || 'smart';
      const centerBaseProducts = applyEntityFilter(rankedProducts, centerCategory, centerStore, centerSeller);
      bentoCenterProducts = [...pinnedList.filter(p => centerBaseProducts.some(cp => cp.id === p.id) || (!centerCategory && !centerStore && !centerSeller)), ...applyFilter(subFilterCenter, centerBaseProducts.filter(p => !pinnedProductMap.has(p.id)))].slice(0, 10);

      // Left card: apply entity filters then sort
      const leftCategory = bentoSection.metadata?.leftCategory;
      const leftStore = bentoSection.metadata?.leftStore;
      const leftSeller = bentoSection.metadata?.leftSeller;
      const leftBaseProducts = applyEntityFilter(rankedProducts, leftCategory, leftStore, leftSeller);
      bentoLeftProducts = [...pinnedList.filter(p => leftBaseProducts.some(lp => lp.id === p.id) || (!leftCategory && !leftStore && !leftSeller)), ...applyFilter(subFilter2, leftBaseProducts.filter(p => !pinnedProductMap.has(p.id)))].slice(0, 10);
      }
    }

    // Apply section-level entity filtering for featured_products
    if (Array.isArray(parsedLayout)) {
      const featuredSection = parsedLayout.find((s: any) => s.type === 'featured_products');
      if (featuredSection?.categoryId || featuredSection?.storeId || featuredSection?.sellerId) {
        const filtered = applyEntityFilter(featuredProducts, featuredSection.categoryId, featuredSection.storeId, featuredSection.sellerId);
        featuredProducts.length = 0;
        featuredProducts.push(...filtered);
      }
    }

    // Apply pinning for stores
    const pinnedStoreMap = new Map(pinnedStoreIds.map((id, index) => [id, index]));
    const storePinned = topStores.filter(s => pinnedStoreMap.has(s.id))
      .sort((a, b) => pinnedStoreMap.get(a.id)! - pinnedStoreMap.get(b.id)!);
    const storeRegular = topStores.filter(s => !pinnedStoreMap.has(s.id));
    if (topSellersFilter === 'most_sales') {
      storeRegular.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
    } else if (topSellersFilter === 'highest_rated') {
      storeRegular.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (topSellersFilter === 'most_products') {
      storeRegular.sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0));
    }
    const finalStores = [...storePinned, ...storeRegular].slice(0, 8);

    // Apply pinning for sellers
    const pinnedSellerMap = new Map(pinnedSellerIds.map((id, index) => [id, index]));
    const sellerPinned = topSellers.filter(s => pinnedSellerMap.has(s.id))
      .sort((a, b) => pinnedSellerMap.get(a.id)! - pinnedSellerMap.get(b.id)!);
    const sellerRegular = topSellers.filter(s => !pinnedSellerMap.has(s.id));
    if (topSellersFilter === 'most_sales') {
      sellerRegular.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
    } else if (topSellersFilter === 'highest_rated') {
      sellerRegular.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (topSellersFilter === 'most_products') {
      sellerRegular.sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0));
    }
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

    // Parse testimonials

    // Parse dynamic hero slides
    let parsedHeroSlides: unknown[] = [];
    try {
      if (heroSlidesSetting?.value) {
        parsedHeroSlides = JSON.parse(heroSlidesSetting.value);
      }
    } catch {}

    // Parse features strip
    let parsedFeatures: unknown[] | null = null;
    try {
      if (featuresSetting?.value) {
        parsedFeatures = JSON.parse(featuresSetting.value);
      }
    } catch {}

    // Parse trending searches
    let parsedTrendingSearches: any = null;
    try {
      if (trendingSearchesSetting?.value) {
        parsedTrendingSearches = JSON.parse(trendingSearchesSetting.value);
      }
    } catch {}

    // Parse CTA settings
    let parsedCta: any = null;
    try {
      if (ctaSetting?.value) {
        parsedCta = JSON.parse(ctaSetting.value);
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
      bentoRightProducts,
      bentoCenterProducts,
      bentoLeftProducts,
      topSellers: finalSellers,
      topStores: finalStores,
      advertisements: adsByZone,
      testimonials: parsedTestimonials,
      layout: parsedLayout,
      heroSlides: parsedHeroSlides,
      countdownConfig: parsedCountdown,
      globalCouponCampaigns,
      features: parsedFeatures,
      trendingSearches: parsedTrendingSearches,
      trendingCategories,
      cta: parsedCta,
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
      bentoRightProducts: [],
      bentoCenterProducts: [],
      bentoLeftProducts: [],
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
