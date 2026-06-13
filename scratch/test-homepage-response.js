const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// Helper function to apply specific filters to a copied list
const applyFilter = (filter, list) => {
  const copy = [...list];
  if (filter === 'most_sold') copy.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  else if (filter === 'most_viewed') copy.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  else if (filter === 'highest_rated') copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (filter === 'newest') copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else if (filter === 'lowest_price') copy.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (filter === 'has_coupons') {
    copy.sort((a, b) => {
      const aHasDiscount = (a.comparePrice && a.comparePrice > a.price) ? 1 : 0;
      const bHasDiscount = (b.comparePrice && b.comparePrice > b.price) ? 1 : 0;
      return bHasDiscount - aHasDiscount || b.score - a.score;
    });
  }
  else copy.sort((a, b) => b.score - a.score);
  return copy;
};

async function test() {
  try {
    const [pinnedItemsSetting, countdownSetting] = await Promise.all([
      db.setting.findUnique({ where: { key: 'homepage_pinned_items' } }),
      db.setting.findUnique({ where: { key: 'homepage_countdown' } }),
    ]);

    let pinnedProductIds = [];
    let pinnedData = null;
    if (pinnedItemsSetting?.value) {
      pinnedData = JSON.parse(pinnedItemsSetting.value);
      pinnedProductIds = pinnedData?.products?.map((p) => p.id) || [];
    }

    const [rawProducts, layoutSetting] = await Promise.all([
      db.product.findMany({
        where: { 
          status: 'active',
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
      }),
      db.setting.findUnique({ where: { key: 'homepage_layout' } }),
    ]);

    const rankedProducts = rawProducts.map((product) => {
      const merchant = product.seller || product.store;
      const isFeaturedBoost = product.isFeatured ? 50 : 0;
      const ageInDays = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const freshnessBoost = Math.max(0, 30 - ageInDays) * 1.5;
      const levelBoost = (merchant?.level || 1) * 3;
      const ratingBoost = (merchant?.rating || 0) * 5;
      const salesBoost = Math.min(20, (product.soldCount || 0) * 0.5);
      const viewsBoost = Math.min(10, (product.viewCount || 0) * 0.05);
      const productRatingBoost = (product.rating || 0) * 2;
      const score = isFeaturedBoost + freshnessBoost + levelBoost + ratingBoost + salesBoost + viewsBoost + productRatingBoost;
      return { ...product, score };
    });

    const parsedLayout = JSON.parse(layoutSetting.value);
    const bentoSection = parsedLayout.find((s) => s.type === 'bento_offers');
    
    console.log('Bento Section config:', bentoSection);

    const pinnedProductMap = new Map(pinnedProductIds.map((id, index) => [id, index]));
    const pinnedList = rankedProducts.filter(p => pinnedProductMap.has(p.id))
      .sort((a, b) => pinnedProductMap.get(a.id) - pinnedProductMap.get(b.id));

    let bentoRightProducts = [];
    let bentoLeftProducts = [];

    if (bentoSection) {
      const subFilter1 = bentoSection.metadata?.subFilter1 || 'smart';
      const subFilter2 = bentoSection.metadata?.subFilter2 || 'smart';
      
      console.log('subFilter1:', subFilter1, 'subFilter2:', subFilter2);
      
      bentoRightProducts = [...pinnedList, ...applyFilter(subFilter1, rankedProducts.filter(p => !pinnedProductMap.has(p.id)))].slice(0, 10);
      bentoLeftProducts = [...pinnedList, ...applyFilter(subFilter2, rankedProducts.filter(p => !pinnedProductMap.has(p.id)))].slice(0, 10);
    }

    console.log('bentoRightProducts count:', bentoRightProducts.length);
    console.log('bentoLeftProducts count:', bentoLeftProducts.length);
    if (bentoRightProducts.length > 0) {
      console.log('First right card product:', bentoRightProducts[0].name);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await db.$disconnect();
  }
}

test();
