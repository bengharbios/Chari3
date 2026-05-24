import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 25;

const TOKEN = 'chari3-seed-2026';

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

  const step = req.nextUrl.searchParams.get('step') || '1';
  const results: string[] = [];

  try {

    // =====================================================
    // STEP 1: Categories
    // =====================================================
    if (step === '1') {
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

      // Create Admin User
      const adminEmail = 'bengharbios@gmail.com';
      const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
      if (!existingAdmin) {
        await db.user.create({
          data: {
            email: adminEmail,
            name: 'عبدالقادر',
            nameEn: 'Abd El-Kader',
            role: 'admin',
            isActive: true,
            isVerified: true,
            accountStatus: 'active',
            password: '$2a$10$T1lA5.h9e6Q9Yt4O8Y7WXuQW.t3O6b.o7Yh9f1U6v0g3Q.X.y/Fv6' // This is 'admin1234' hashed with bcrypt (salt rounds: 10)
          }
        });
        results.push(`✅ Admin User: ${adminEmail} (password: admin1234)`);
      } else {
        // Ensure the password is set to admin1234 just in case
        await db.user.update({
          where: { email: adminEmail },
          data: {
            role: 'admin',
            password: '$2a$10$T1lA5.h9e6Q9Yt4O8Y7WXuQW.t3O6b.o7Yh9f1U6v0g3Q.X.y/Fv6'
          }
        });
        results.push(`⏭ Exists: ${adminEmail} (password reset to admin1234)`);
      }

      for (const cat of categories) {
        const existing = await db.category.findUnique({ where: { slug: cat.slug } });
        if (!existing) {
          await db.category.create({ data: { ...cat, isActive: true } });
          results.push(`✅ Category: ${cat.name}`);
        } else {
          results.push(`⏭ Exists: ${cat.name}`);
        }
      }
      return NextResponse.json({ success: true, step: 1, next: '?token=' + TOKEN + '&step=2', details: results });
    }

    // =====================================================
    // STEP 2: Sellers (first 3)
    // =====================================================
    if (step === '2') {
      const sellers = [
        { email: 'tech.store@chariday.dz', name: 'متجر التقنية الذهبية', nameEn: 'Golden Tech Store', storeName: 'التقنية الذهبية', storeNameEn: 'Golden Tech', bio: 'أحدث الأجهزة الإلكترونية', logo: IMAGES.sellers[0], coverImage: IMAGES.ads[0], rating: 4.8, level: 5, totalSales: 1250, totalCustomers: 890 },
        { email: 'fashion.house@chariday.dz', name: 'دار الأزياء الراقية', nameEn: 'Luxury Fashion House', storeName: 'دار الأزياء', storeNameEn: 'Fashion House', bio: 'أحدث صيحات الموضة', logo: IMAGES.sellers[1], coverImage: IMAGES.ads[1], rating: 4.6, level: 4, totalSales: 980, totalCustomers: 650 },
        { email: 'home.decor@chariday.dz', name: 'ديكور المنزل العصري', nameEn: 'Modern Home Decor', storeName: 'ديكور المنزل', storeNameEn: 'Home Decor', bio: 'ديكور وأثاث عصري', logo: IMAGES.sellers[2], coverImage: IMAGES.ads[2], rating: 4.7, level: 4, totalSales: 756, totalCustomers: 512 },
      ];
      for (const s of sellers) {
        let user = await db.user.findUnique({ where: { email: s.email } });
        if (!user) {
          user = await db.user.create({ data: { email: s.email, name: s.name, nameEn: s.nameEn, role: 'seller', accountStatus: 'active', isActive: true, isVerified: true, password: '$2a$10$dummyhashfordemopurposesonly1234' } });
        }
        const existing = await db.sellerProfile.findUnique({ where: { userId: user.id } });
        if (!existing) {
          await db.sellerProfile.create({ data: { userId: user.id, storeName: s.storeName, storeNameEn: s.storeNameEn, bio: s.bio, logo: s.logo, coverImage: s.coverImage, rating: s.rating, level: s.level, isVerified: true, totalSales: s.totalSales, totalCustomers: s.totalCustomers, completionRate: 95, responseRate: 98 } });
          results.push(`✅ Seller: ${s.storeName}`);
        } else {
          results.push(`⏭ Exists: ${s.storeName}`);
        }
      }
      return NextResponse.json({ success: true, step: 2, next: '?token=' + TOKEN + '&step=3', details: results });
    }

    // =====================================================
    // STEP 3: Sellers (last 2) 
    // =====================================================
    if (step === '3') {
      const sellers = [
        { email: 'beauty.world@chariday.dz', name: 'عالم الجمال والعناية', nameEn: 'Beauty World', storeName: 'عالم الجمال', storeNameEn: 'Beauty World', bio: 'منتجات جمال أصيلة', logo: IMAGES.sellers[3], coverImage: IMAGES.ads[3], rating: 4.9, level: 5, totalSales: 2100, totalCustomers: 1540 },
        { email: 'sports.zone@chariday.dz', name: 'منطقة الرياضة', nameEn: 'Sports Zone', storeName: 'منطقة الرياضة', storeNameEn: 'Sports Zone', bio: 'معدات رياضية احترافية', logo: IMAGES.sellers[4], coverImage: IMAGES.ads[0], rating: 4.5, level: 3, totalSales: 634, totalCustomers: 421 },
      ];
      for (const s of sellers) {
        let user = await db.user.findUnique({ where: { email: s.email } });
        if (!user) {
          user = await db.user.create({ data: { email: s.email, name: s.name, nameEn: s.nameEn, role: 'seller', accountStatus: 'active', isActive: true, isVerified: true, password: '$2a$10$dummyhashfordemopurposesonly1234' } });
        }
        const existing = await db.sellerProfile.findUnique({ where: { userId: user.id } });
        if (!existing) {
          await db.sellerProfile.create({ data: { userId: user.id, storeName: s.storeName, storeNameEn: s.storeNameEn, bio: s.bio, logo: s.logo, coverImage: s.coverImage, rating: s.rating, level: s.level, isVerified: true, totalSales: s.totalSales, totalCustomers: s.totalCustomers, completionRate: 95, responseRate: 98 } });
          results.push(`✅ Seller: ${s.storeName}`);
        } else {
          results.push(`⏭ Exists: ${s.storeName}`);
        }
      }
      return NextResponse.json({ success: true, step: 3, next: '?token=' + TOKEN + '&step=4', details: results });
    }

    // =====================================================
    // STEP 4: Products (10 products)
    // =====================================================
    if (step === '4') {
      // Get category and seller IDs
      const catMap: Record<string, string> = {};
      const cats = await db.category.findMany({ select: { id: true, slug: true } });
      for (const c of cats) catMap[c.slug] = c.id;

      const sellerMap: Record<string, string> = {};
      const sellerEmails = ['tech.store@chariday.dz', 'fashion.house@chariday.dz', 'home.decor@chariday.dz', 'beauty.world@chariday.dz', 'sports.zone@chariday.dz'];
      for (const email of sellerEmails) {
        const u = await db.user.findUnique({ where: { email }, include: { sellerProfile: true } });
        if (u?.sellerProfile) sellerMap[email] = u.sellerProfile.id;
      }

      const products = [
        { name: 'ساعة ذكية Pro Max', nameEn: 'Smart Watch Pro Max', price: 8500, comparePrice: 12000, img: IMAGES.electronics[0], cat: 'electronics', seller: 'tech.store@chariday.dz', rating: 4.8, sold: 342, stock: 50 },
        { name: 'سماعات لاسلكية فاخرة', nameEn: 'Premium Wireless Earbuds', price: 3200, comparePrice: 5500, img: IMAGES.electronics[1], cat: 'electronics', seller: 'tech.store@chariday.dz', rating: 4.7, sold: 521, stock: 80 },
        { name: 'ساعة كلاسيك ذهبية', nameEn: 'Classic Gold Watch', price: 15000, comparePrice: 20000, img: IMAGES.electronics[2], cat: 'electronics', seller: 'tech.store@chariday.dz', rating: 4.9, sold: 128, stock: 20 },
        { name: 'حذاء رياضي أصلي', nameEn: 'Original Sports Sneakers', price: 5500, comparePrice: 8000, img: IMAGES.fashion[1], cat: 'fashion', seller: 'fashion.house@chariday.dz', rating: 4.6, sold: 456, stock: 60 },
        { name: 'حقيبة يد فاخرة', nameEn: 'Luxury Handbag', price: 12000, comparePrice: 18000, img: IMAGES.fashion[0], cat: 'fashion', seller: 'fashion.house@chariday.dz', rating: 4.8, sold: 234, stock: 30 },
        { name: 'أريكة فاخرة بيضاء', nameEn: 'Luxury White Sofa', price: 45000, comparePrice: 65000, img: IMAGES.home[0], cat: 'home-kitchen', seller: 'home.decor@chariday.dz', rating: 4.7, sold: 89, stock: 15 },
        { name: 'ستائر ديكورية مودرن', nameEn: 'Modern Decorative Curtains', price: 3500, comparePrice: 5000, img: IMAGES.home[1], cat: 'home-kitchen', seller: 'home.decor@chariday.dz', rating: 4.5, sold: 267, stock: 70 },
        { name: 'مجموعة عناية بالبشرة', nameEn: 'Skincare Collection', price: 4500, comparePrice: 7000, img: IMAGES.beauty[0], cat: 'beauty-care', seller: 'beauty.world@chariday.dz', rating: 4.9, sold: 834, stock: 100 },
        { name: 'أحمر شفاه فاخر', nameEn: 'Luxury Lip Color Set', price: 1200, comparePrice: 2000, img: IMAGES.beauty[1], cat: 'beauty-care', seller: 'beauty.world@chariday.dz', rating: 4.8, sold: 1245, stock: 200 },
        { name: 'معدات لياقة منزلية', nameEn: 'Home Fitness Equipment', price: 12000, comparePrice: 18000, img: IMAGES.sports[0], cat: 'sports-fitness', seller: 'sports.zone@chariday.dz', rating: 4.6, sold: 189, stock: 30 },
      ];

      for (const p of products) {
        const existing = await db.product.findFirst({ where: { name: p.name } });
        if (!existing) {
          const slug = p.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 99999);
          await db.product.create({
            data: {
              name: p.name, nameEn: p.nameEn, slug,
              price: p.price, comparePrice: p.comparePrice,
              images: JSON.stringify([p.img]),
              status: 'active', isFeatured: true,
              stock: p.stock, rating: p.rating, soldCount: p.sold,
              reviewCount: Math.floor(p.sold * 0.3),
              categoryId: catMap[p.cat] || cats[0].id,
              sellerId: sellerMap[p.seller],
            },
          });
          results.push(`✅ Product: ${p.name}`);
        } else {
          results.push(`⏭ Exists: ${p.name}`);
        }
      }
      return NextResponse.json({ success: true, step: 4, next: '?token=' + TOKEN + '&step=5', details: results });
    }

    // =====================================================
    // STEP 5: More Products + Ads + Testimonials
    // =====================================================
    if (step === '5') {
      const catMap: Record<string, string> = {};
      const cats = await db.category.findMany({ select: { id: true, slug: true } });
      for (const c of cats) catMap[c.slug] = c.id;

      const sellerMap: Record<string, string> = {};
      const sellerEmails = ['tech.store@chariday.dz', 'fashion.house@chariday.dz', 'beauty.world@chariday.dz', 'sports.zone@chariday.dz'];
      for (const email of sellerEmails) {
        const u = await db.user.findUnique({ where: { email }, include: { sellerProfile: true } });
        if (u?.sellerProfile) sellerMap[email] = u.sellerProfile.id;
      }

      const products = [
        { name: 'كريم ترطيب يومي', nameEn: 'Daily Moisturizing Cream', price: 850, comparePrice: 1500, img: IMAGES.beauty[2], cat: 'beauty-care', seller: 'beauty.world@chariday.dz', rating: 4.7, sold: 2100, stock: 300 },
        { name: 'عطر رجالي أنيق', nameEn: 'Elegant Mens Perfume', price: 3800, comparePrice: 5500, img: IMAGES.beauty[3], cat: 'beauty-care', seller: 'beauty.world@chariday.dz', rating: 4.9, sold: 567, stock: 80 },
        { name: 'حذاء جري احترافي', nameEn: 'Professional Running Shoes', price: 7500, comparePrice: 11000, img: IMAGES.sports[1], cat: 'sports-fitness', seller: 'sports.zone@chariday.dz', rating: 4.8, sold: 423, stock: 55 },
        { name: 'سماعة بلوتوث رياضية', nameEn: 'Sport Bluetooth Headset', price: 1800, comparePrice: 3000, img: IMAGES.electronics[3], cat: 'electronics', seller: 'tech.store@chariday.dz', rating: 4.5, sold: 789, stock: 120 },
        { name: 'حذاء كاجوال عصري', nameEn: 'Modern Casual Shoes', price: 3800, comparePrice: 5200, img: IMAGES.fashion[2], cat: 'fashion', seller: 'fashion.house@chariday.dz', rating: 4.4, sold: 612, stock: 90 },
      ];

      for (const p of products) {
        const existing = await db.product.findFirst({ where: { name: p.name } });
        if (!existing) {
          const slug = p.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 99999);
          await db.product.create({
            data: {
              name: p.name, nameEn: p.nameEn, slug,
              price: p.price, comparePrice: p.comparePrice,
              images: JSON.stringify([p.img]),
              status: 'active', isFeatured: true,
              stock: p.stock, rating: p.rating, soldCount: p.sold,
              reviewCount: Math.floor(p.sold * 0.3),
              categoryId: catMap[p.cat] || cats[0].id,
              sellerId: sellerMap[p.seller],
            },
          });
          results.push(`✅ Product: ${p.name}`);
        } else {
          results.push(`⏭ Exists: ${p.name}`);
        }
      }

      // Ads
      const ads = [
        { title: 'تخفيضات الصيف الكبرى - خصم حتى 70%', imageUrl: IMAGES.ads[0], zone: 'hero', sortOrder: 1 },
        { title: 'مجموعة الأزياء الجديدة وصلت', imageUrl: IMAGES.ads[1], zone: 'hero', sortOrder: 2 },
        { title: 'الجمعة البيضاء - عروض لا تُفوَّت', imageUrl: IMAGES.ads[2], zone: 'banner_top', sortOrder: 1 },
        { title: 'أحذية رياضية أصلية بأقل الأسعار', imageUrl: IMAGES.ads[3], zone: 'banner_mid', sortOrder: 1 },
      ];
      for (const ad of ads) {
        const existing = await db.advertisement.findFirst({ where: { title: ad.title } });
        if (!existing) {
          await db.advertisement.create({ data: { ...ad, isActive: true, targetRole: 'all' } });
          results.push(`✅ Ad: ${ad.zone}`);
        }
      }

      // Testimonials
      const existingT = await db.setting.findUnique({ where: { key: 'homepage_testimonials' } });
      if (!existingT) {
        await db.setting.create({
          data: {
            key: 'homepage_testimonials',
            value: JSON.stringify([
              { name: 'أحمد بن علي', rating: 5, comment: 'منصة رائعة جداً، تجربة تسوق ممتعة وسريعة!', avatar: '👨‍💼' },
              { name: 'فاطمة الزهراء', rating: 5, comment: 'أفضل منصة تسوق، منتجات أصيلة وأسعار منافسة', avatar: '👩‍💄' },
              { name: 'محمد الأمين', rating: 5, comment: 'خدمة عملاء ممتازة وسرعة في التوصيل!', avatar: '👨‍💻' },
              { name: 'نور الهدى', rating: 4, comment: 'تشكيلة واسعة وأسعار مناسبة جداً', avatar: '👩‍🎓' },
            ]),
          },
        });
        results.push('✅ Testimonials added');
      }

      return NextResponse.json({
        success: true,
        step: 5,
        message: '🎉 All seed data completed successfully!',
        details: results,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid step. Use step=1 through step=5' });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, step, error: errorMsg, details: results }, { status: 500 });
  }
}
