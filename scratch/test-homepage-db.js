// Removed unused import
// Let's write a simple script that mimics what GET does by importing Prisma client and querying exactly as route.ts does, to see if it throws any error.

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function test() {
  try {
    const [pinnedItemsSetting, countdownSetting] = await Promise.all([
      db.setting.findUnique({ where: { key: 'homepage_pinned_items' } }),
      db.setting.findUnique({ where: { key: 'homepage_countdown' } }),
    ]);

    let pinnedProductIds = [];
    if (pinnedItemsSetting?.value) {
      const pinnedData = JSON.parse(pinnedItemsSetting.value);
      pinnedProductIds = pinnedData?.products?.map((p) => p.id) || [];
    }

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
      db.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: 'asc' },
        take: 12,
      }),
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
        take: 100,
      }),
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
      db.advertisement.findMany({
        where: {
          isActive: true,
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
        },
        include: {
          optInStores: { select: { id: true } },
          optInSellers: { select: { id: true } },
        }
      })
    ]);

    console.log('Categories count:', categories.length);
    console.log('Raw products count:', rawProducts.length);
    console.log('Top sellers count:', topSellers.length);
    console.log('Top stores count:', topStores.length);
    console.log('Layout setting value length:', layoutSetting?.value?.length);

    // Let's parse layout
    const val = JSON.parse(layoutSetting.value);
    const bento = val.find(s => s.type === 'bento_offers');
    console.log('Bento layout item:', bento);

  } catch (err) {
    console.error('DATABASE ERROR:', err);
  } finally {
    await db.$disconnect();
  }
}

test();
