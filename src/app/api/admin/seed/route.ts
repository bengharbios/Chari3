import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TOKEN = 'chari3-seed-2026';

// Unsplash-style real product images
const IMAGES = {
  electronics: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
    'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400',
    'https://images.unsplash.com/photo-1556906781-9a412961a22d?w=400',
  ],
  home: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=400',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',
    'https://images.unsplash.com/photo-1583241475880-083f84372725?w=400',
    'https://images.unsplash.com/photo-1607006483224-a7c3ff38c9a7?w=400',
  ],
  sports: [
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400',
  ],
  food: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
  ],
  sellers: [
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    'https://images.unsplash.com/photo-1549637642-d7d84d131093?w=200',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=200',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200',
  ],
  ads: [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200',
    'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  ],
};

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (token !== TOKEN) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // =====================================================
    // 1. CATEGORIES
    // =====================================================
    const categories = [
      { name: 'إلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱', sortOrder: 1 },
      { name: 'أزياء وملابس', nameEn: 'Fashion', slug: 'fashion', icon: '👗', sortOrder: 2 },
      { name: 'المنزل والمطبخ', nameEn: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠', sortOrder: 3 },
      { name: 'الجمال والعناية', nameEn: 'Beauty & Care', slug: 'beauty-care', icon: '💄', sortOrder: 4 },
      { name: 'رياضة ولياقة', nameEn: 'Sports & Fitness', slug: 'sports-fitness', icon: '🏋️', sortOrder: 5 },
      { name: 'طعام وشراب', nameEn: 'Food & Beverages', slug: 'food-beverages', icon: '🍔', sortOrder: 6 },
      { name: 'كتب وتعليم', nameEn: 'Books & Education', slug: 'books-education', icon: '📚', sortOrder: 7 },
      { name: 'ألعاب وترفيه', nameEn: 'Toys & Entertainment', slug: 'toys-entertainment', icon: '🎮', sortOrder: 8 },
    ];

    const catMap: Record<string, string> = {};
    for (const cat of categories) {
      const existing = await db.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        const created = await db.category.create({ data: { ...cat, isActive: true } });
        catMap[cat.slug] = created.id;
        results.push(`✅ Category: ${cat.name}`);
      } else {
        catMap[cat.slug] = existing.id;
        results.push(`⏭ Category exists: ${cat.name}`);
      }
    }

    // =====================================================
    // 2. SELLER USERS + PROFILES
    // =====================================================
    const sellerData = [
      {
        email: 'tech.store@chariday.dz',
        name: 'متجر التقنية الذهبية',
        nameEn: 'Golden Tech Store',
        storeName: 'التقنية الذهبية',
        storeNameEn: 'Golden Tech',
        bio: 'متخصصون في أحدث الأجهزة الإلكترونية والملحقات التقنية',
        logo: IMAGES.sellers[0],
        coverImage: IMAGES.ads[0],
        rating: 4.8, level: 5, isVerified: true, totalSales: 1250, totalCustomers: 890,
      },
      {
        email: 'fashion.house@chariday.dz',
        name: 'دار الأزياء الراقية',
        nameEn: 'Luxury Fashion House',
        storeName: 'دار الأزياء',
        storeNameEn: 'Fashion House',
        bio: 'أحدث صيحات الموضة العالمية بأسعار منافسة',
        logo: IMAGES.sellers[1],
        coverImage: IMAGES.ads[1],
        rating: 4.6, level: 4, isVerified: true, totalSales: 980, totalCustomers: 650,
      },
      {
        email: 'home.decor@chariday.dz',
        name: 'ديكور المنزل العصري',
        nameEn: 'Modern Home Decor',
        storeName: 'ديكور المنزل',
        storeNameEn: 'Home Decor',
        bio: 'كل ما يحتاجه منزلك من ديكور وأثاث عصري',
        logo: IMAGES.sellers[2],
        coverImage: IMAGES.ads[2],
        rating: 4.7, level: 4, isVerified: true, totalSales: 756, totalCustomers: 512,
      },
      {
        email: 'beauty.world@chariday.dz',
        name: 'عالم الجمال والعناية',
        nameEn: 'Beauty World',
        storeName: 'عالم الجمال',
        storeNameEn: 'Beauty World',
        bio: 'منتجات عناية وجمال أصيلة من أفضل الماركات العالمية',
        logo: IMAGES.sellers[3],
        coverImage: IMAGES.ads[3],
        rating: 4.9, level: 5, isVerified: true, totalSales: 2100, totalCustomers: 1540,
      },
      {
        email: 'sports.zone@chariday.dz',
        name: 'منطقة الرياضة',
        nameEn: 'Sports Zone',
        storeName: 'منطقة الرياضة',
        storeNameEn: 'Sports Zone',
        bio: 'معدات رياضية احترافية لكل الرياضيين',
        logo: IMAGES.sellers[4],
        coverImage: IMAGES.ads[0],
        rating: 4.5, level: 3, isVerified: true, totalSales: 634, totalCustomers: 421,
      },
    ];

    const sellerIds: string[] = [];
    for (const s of sellerData) {
      let user = await db.user.findUnique({ where: { email: s.email } });
      if (!user) {
        user = await db.user.create({
          data: {
            email: s.email,
            name: s.name,
            nameEn: s.nameEn,
            role: 'seller',
            accountStatus: 'active',
            isActive: true,
            isVerified: true,
            password: '$2a$10$dummy.hash.for.demo.purposes.only',
          },
        });
      }

      let profile = await db.sellerProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        profile = await db.sellerProfile.create({
          data: {
            userId: user.id,
            storeName: s.storeName,
            storeNameEn: s.storeNameEn,
            bio: s.bio,
            logo: s.logo,
            coverImage: s.coverImage,
            rating: s.rating,
            level: s.level,
            isVerified: s.isVerified,
            totalSales: s.totalSales,
            totalCustomers: s.totalCustomers,
            completionRate: 95,
            responseRate: 98,
          },
        });
        results.push(`✅ Seller: ${s.storeName}`);
      } else {
        results.push(`⏭ Seller exists: ${s.storeName}`);
      }
      sellerIds.push(profile.id);
    }

    // =====================================================
    // 3. PRODUCTS
    // =====================================================
    const productData = [
      // Electronics
      { name: 'ساعة ذكية Pro Max', nameEn: 'Smart Watch Pro Max', price: 8500, comparePrice: 12000, images: [IMAGES.electronics[0]], category: 'electronics', sellerIdx: 0, rating: 4.8, soldCount: 342, stock: 50 },
      { name: 'سماعات لاسلكية فاخرة', nameEn: 'Premium Wireless Earbuds', price: 3200, comparePrice: 5500, images: [IMAGES.electronics[1]], category: 'electronics', sellerIdx: 0, rating: 4.7, soldCount: 521, stock: 80 },
      { name: 'ساعة كلاسيك ذهبية', nameEn: 'Classic Gold Watch', price: 15000, comparePrice: 20000, images: [IMAGES.electronics[2]], category: 'electronics', sellerIdx: 0, rating: 4.9, soldCount: 128, stock: 20 },
      { name: 'سماعة بلوتوث رياضية', nameEn: 'Sport Bluetooth Headset', price: 1800, comparePrice: 3000, images: [IMAGES.electronics[3]], category: 'electronics', sellerIdx: 0, rating: 4.5, soldCount: 789, stock: 120 },
      // Fashion
      { name: 'حذاء رياضي أصلي', nameEn: 'Original Sports Sneakers', price: 5500, comparePrice: 8000, images: [IMAGES.fashion[1]], category: 'fashion', sellerIdx: 1, rating: 4.6, soldCount: 456, stock: 60 },
      { name: 'حقيبة يد فاخرة', nameEn: 'Luxury Handbag', price: 12000, comparePrice: 18000, images: [IMAGES.fashion[0]], category: 'fashion', sellerIdx: 1, rating: 4.8, soldCount: 234, stock: 30 },
      { name: 'حذاء كاجوال عصري', nameEn: 'Modern Casual Shoes', price: 3800, comparePrice: 5200, images: [IMAGES.fashion[2]], category: 'fashion', sellerIdx: 1, rating: 4.4, soldCount: 612, stock: 90 },
      { name: 'حذاء أديداس أوريجينال', nameEn: 'Adidas Original Shoes', price: 6200, comparePrice: 9000, images: [IMAGES.fashion[3]], category: 'fashion', sellerIdx: 4, rating: 4.7, soldCount: 381, stock: 45 },
      // Home
      { name: 'أريكة فاخرة بيضاء', nameEn: 'Luxury White Sofa', price: 45000, comparePrice: 65000, images: [IMAGES.home[0]], category: 'home-kitchen', sellerIdx: 2, rating: 4.7, soldCount: 89, stock: 15 },
      { name: 'ستائر ديكورية مودرن', nameEn: 'Modern Decorative Curtains', price: 3500, comparePrice: 5000, images: [IMAGES.home[1]], category: 'home-kitchen', sellerIdx: 2, rating: 4.5, soldCount: 267, stock: 70 },
      { name: 'غرفة جلوس كاملة', nameEn: 'Complete Living Room Set', price: 85000, comparePrice: 120000, images: [IMAGES.home[2]], category: 'home-kitchen', sellerIdx: 2, rating: 4.9, soldCount: 42, stock: 8 },
      { name: 'تصميم داخلي مودرن', nameEn: 'Modern Interior Design', price: 25000, comparePrice: 35000, images: [IMAGES.home[3]], category: 'home-kitchen', sellerIdx: 2, rating: 4.6, soldCount: 156, stock: 25 },
      // Beauty
      { name: 'مجموعة عناية بالبشرة', nameEn: 'Skincare Collection', price: 4500, comparePrice: 7000, images: [IMAGES.beauty[0]], category: 'beauty-care', sellerIdx: 3, rating: 4.9, soldCount: 834, stock: 100 },
      { name: 'أحمر شفاه فاخر', nameEn: 'Luxury Lip Color Set', price: 1200, comparePrice: 2000, images: [IMAGES.beauty[1]], category: 'beauty-care', sellerIdx: 3, rating: 4.8, soldCount: 1245, stock: 200 },
      { name: 'كريم ترطيب يومي', nameEn: 'Daily Moisturizing Cream', price: 850, comparePrice: 1500, images: [IMAGES.beauty[2]], category: 'beauty-care', sellerIdx: 3, rating: 4.7, soldCount: 2100, stock: 300 },
      { name: 'عطر رجالي أنيق', nameEn: 'Elegant Men\'s Perfume', price: 3800, comparePrice: 5500, images: [IMAGES.beauty[3]], category: 'beauty-care', sellerIdx: 3, rating: 4.9, soldCount: 567, stock: 80 },
      // Sports
      { name: 'معدات لياقة منزلية', nameEn: 'Home Fitness Equipment', price: 12000, comparePrice: 18000, images: [IMAGES.sports[0]], category: 'sports-fitness', sellerIdx: 4, rating: 4.6, soldCount: 189, stock: 30 },
      { name: 'حذاء جري احترافي', nameEn: 'Professional Running Shoes', price: 7500, comparePrice: 11000, images: [IMAGES.sports[1]], category: 'sports-fitness', sellerIdx: 4, rating: 4.8, soldCount: 423, stock: 55 },
      { name: 'ملابس رياضية متكاملة', nameEn: 'Complete Sports Outfit', price: 4200, comparePrice: 6500, images: [IMAGES.sports[2]], category: 'sports-fitness', sellerIdx: 4, rating: 4.5, soldCount: 312, stock: 65 },
      { name: 'جهاز تمرين متعدد', nameEn: 'Multi-Function Gym Machine', price: 35000, comparePrice: 50000, images: [IMAGES.sports[3]], category: 'sports-fitness', sellerIdx: 4, rating: 4.7, soldCount: 67, stock: 12 },
    ];

    for (const p of productData) {
      const slug = p.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now() + Math.floor(Math.random() * 1000);
      const existing = await db.product.findFirst({ where: { name: p.name } });
      if (!existing) {
        await db.product.create({
          data: {
            name: p.name,
            nameEn: p.nameEn,
            slug,
            price: p.price,
            comparePrice: p.comparePrice,
            images: JSON.stringify(p.images),
            status: 'active',
            isFeatured: true,
            stock: p.stock,
            rating: p.rating,
            soldCount: p.soldCount,
            reviewCount: Math.floor(p.soldCount * 0.3),
            categoryId: catMap[p.category] || Object.values(catMap)[0],
            sellerId: sellerIds[p.sellerIdx] || sellerIds[0],
          },
        });
        results.push(`✅ Product: ${p.name}`);
      } else {
        results.push(`⏭ Product exists: ${p.name}`);
      }
    }

    // =====================================================
    // 4. ADVERTISEMENTS
    // =====================================================
    const ads = [
      { title: 'تخفيضات الصيف الكبرى - خصم حتى 70%', titleEn: 'Summer Mega Sale - Up to 70% Off', imageUrl: IMAGES.ads[0], zone: 'hero', sortOrder: 1 },
      { title: 'مجموعة الأزياء الجديدة وصلت', titleEn: 'New Fashion Collection Arrived', imageUrl: IMAGES.ads[1], zone: 'hero', sortOrder: 2 },
      { title: 'الجمعة البيضاء - عروض لا تُفوَّت', titleEn: 'White Friday - Unmissable Deals', imageUrl: IMAGES.ads[2], zone: 'banner_top', sortOrder: 1 },
      { title: 'أحذية رياضية أصلية بأقل الأسعار', titleEn: 'Authentic Sports Shoes - Lowest Prices', imageUrl: IMAGES.ads[3], zone: 'banner_mid', sortOrder: 1 },
    ];

    for (const ad of ads) {
      const existing = await db.advertisement.findFirst({ where: { title: ad.title } });
      if (!existing) {
        await db.advertisement.create({
          data: { ...ad, isActive: true, targetRole: 'all' },
        });
        results.push(`✅ Ad: ${ad.zone} - ${ad.title.slice(0, 30)}`);
      } else {
        results.push(`⏭ Ad exists: ${ad.zone}`);
      }
    }

    // =====================================================
    // 5. TESTIMONIALS
    // =====================================================
    const testimonials = [
      { name: 'أحمد بن علي', nameEn: 'Ahmed Ben Ali', rating: 5, comment: 'منصة رائعة جداً، تجربة تسوق ممتعة وسريعة. الشحن وصل في نفس اليوم!', avatar: '👨‍💼' },
      { name: 'فاطمة الزهراء', nameEn: 'Fatima Zahra', rating: 5, comment: 'أفضل منصة تسوق في الجزائر، منتجات أصيلة وأسعار منافسة جداً', avatar: '👩‍💄' },
      { name: 'محمد الأمين', nameEn: 'Mohamed Amine', rating: 5, comment: 'خدمة عملاء ممتازة وسرعة في التوصيل. أنصح به بشدة!', avatar: '👨‍💻' },
      { name: 'نور الهدى', nameEn: 'Nour El Hoda', rating: 4, comment: 'تشكيلة واسعة من المنتجات وأسعار مناسبة جداً لميزانيتي', avatar: '👩‍🎓' },
    ];

    const existingTestimonials = await db.setting.findUnique({ where: { key: 'homepage_testimonials' } });
    if (!existingTestimonials) {
      await db.setting.create({
        data: {
          key: 'homepage_testimonials',
          value: JSON.stringify(testimonials),
        },
      });
      results.push(`✅ Testimonials added`);
    } else {
      results.push(`⏭ Testimonials exist`);
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Seed completed! ${results.filter(r => r.startsWith('✅')).length} items created.`,
      details: results,
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[seed] Error:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg, details: results }, { status: 500 });
  }
}
