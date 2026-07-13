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
        next: '?token=' + TOKEN + '&step=6',
        details: results,
      });
    }

    // =====================================================
    // STEP 6: Dev Docs Articles for Business Upgrade System
    // =====================================================
    if (step === '6') {
      const articleSlug = 'developers/business-upgrade-architecture';
      const title = 'نظام ترقية الحسابات وهندسة طبقات التوثيق للأعمال';
      const titleEn = 'Business Account Upgrade & Layered Identity Architecture';

      const content = `
# هندسة طبقات التوثيق للترقية لمتجر أعمال (Business Store Upgrade)

يوثق هذا المقال البنية الهندسية وتدفق الحالات المتبع لترقية الحسابات من تاجر مستقل (Individual Seller) إلى متجر رسمي مسجل للشركات (Business Store).

## 1. مبدأ الهوية الطبقية (Layered Identity)
لا يتم حذف بيانات أو وثائق التاجر المستقل السابقة (مثل بطاقة المقاول الذاتي أو وصل الـ CCP الفردي) عند ترقيته، بل يتم وضع علامة الأرشفة عليها (\`isArchived = true\`) وتخزينها كسجل تاريخي قانوني للرجوع إليه أو التدقيق فيه. ويتم إنشاء كيان توثيقي جديد باسم \`BusinessVerification\` يحتوي على مستندات الشركة القانونية.

## 2. مخطط الحالات لعملية الترقية (Upgrade State Machine)
تتبع عملية الترقية الخطوات التالية:
1. **تقديم طلب الترقية (Guarded Submit):** يقوم البائع برفع مستندات الشركة (السجل التجاري RC، الرقم الضريبي NIS، رقم الحساب التجاري IBAN، وبطاقة هوية المدير المفوض). يُحفظ الطلب بالحالة \`PENDING\`.
2. **الموافقة المبدئية على المستندات (Documents Pre-Approval):** يراجع الإداري المستندات؛ في حال الموافقة، تتحول الحالة إلى \`AWAITING_PAYMENT\` ويقوم النظام تلقائياً بإنشاء فاتورة سداد رسوم الترقية وإرسال تنبيه للبائع.
3. **رفع إثبات الدفع (Payment Submission):** يقوم البائع برفع صورة وصل السداد البنكي أو البريدي. تتحول الحالة إلى \`PAYMENT_SUBMITTED\` ويُبلّغ الإداريون تلقائياً للتحقق من الدفع.
4. **التفعيل النهائي (Final Activation):** بعد مطابقة الوصل، يؤكد الإدمن الدفع وتتحول الحالة إلى \`APPROVED\`. في هذه اللحظة يتم تلقائياً:
   * أرشفة التوثيق الفردي القديم.
   * إنشاء سجل \`BusinessVerification\` المعتمد.
   * ترقية رتبة المستخدم إلى \`store_manager\`.
   * إنشاء المتجر (Store) وربط فريق العمل والمنتجات به دون إحداث أي انكسار أو تغيير في المعرفات.

## 3. سجل المراجعة والتراجع (Audit & Rollback)
* يتم تسجيل معرّف الإدمن المراجع والوقت لكل عملية في حقول \`reviewedBy\` و \`reviewedAt\`.
* في حال رفض مستندات الترقية، يُنبه البائع بسبب الرفض (\`rejectionReason\`) ويُتاح له تقديم طلب جديد.
* في حال رفض وصل السداد، يُعاد الطلب خطوة للخلف إلى \`AWAITING_PAYMENT\` مع توضيح السبب (\`paymentRejectionReason\`) لإعادة رفع وصل صحيح دون الحاجة لإعادة رفع وثائق الشركة مرة أخرى.
      `;

      const contentEn = `
# Business Account Upgrade & Layered Identity Architecture

This documentation describes the technical architecture and state machine flow for upgrading individual freelancer merchant accounts to verified corporate business stores.

## 1. Layered Identity Principle
Freelancer documents (such as Individual Activity Card or personal CCP account) are never deleted upon upgrade. Instead, they are archived using the \`isArchived = true\` flag for legal and auditing history. A new active layer, \`BusinessVerification\`, is then created to house corporate papers.

## 2. State Machine Workflow
The upgrade process follows this progression:
1. **Guarded Submission:** Verified sellers upload corporate documents (Commercial Register RC, NIS Tax code, Business IBAN, and manager ID proofs). Status transitions to \`PENDING\`.
2. **Pre-Approval of Documents:** Admin reviews papers. If approved, status transitions to \`AWAITING_PAYMENT\`, generating an automated fee invoice and alerting the merchant.
3. **Payment Receipt Submission:** The merchant uploads the wire receipt. Status transitions to \`PAYMENT_SUBMITTED\`, alerting administrators.
4. **Final Activation:** Upon receipt confirmation, admin approves the transfer. Status transitions to \`APPROVED\`, which triggers:
   * Archiving the old freelancer verification.
   * Instantiating the \`BusinessVerification\` record.
   * Upgrading user role to \`store_manager\`.
   * Generating the Store outlet, staff permissions, and mapping products without breaking existing identifiers.

## 3. Audit & Rollback
* Reviewer tracking is saved via \`reviewedBy\` and \`reviewedAt\` fields.
* If documents are rejected, status is set to \`REJECTED\`, showing the \`rejectionReason\`.
* If a payment receipt is rejected, status rolls back to \`AWAITING_PAYMENT\` with a \`paymentRejectionReason\`, allowing the merchant to re-upload the receipt without resubmitting company records.
      `;

      const translations = {
        fr: {
          title: "Mise à niveau du compte d'entreprise et architecture d'identité",
          content: `
# Architecture de mise à niveau du compte d'entreprise (Business Store Upgrade)

Cette documentation décrit l'architecture technique et le flux de la machine d'état pour la mise à niveau des comptes de vendeurs indépendants vers des boutiques officielles enregistrées pour les entreprises.

## 1. Principe d'identité stratifiée (Layered Identity)
Les documents de pigiste ne sont jamais supprimés lors de la mise à niveau. Au lieu de cela, ils sont archivés avec le drapeau \`isArchived = true\` pour l'audit. Un nouveau document \`BusinessVerification\` est ensuite créé pour stocker les pièces de l'entreprise.

## 2. Flux de la machine d'état
Le processus suit ces étapes:
1. **Soumission sécurisée:** Le vendeur télécharge les documents (Registre du commerce RC, code NIS, IBAN professionnel, et pièce d'identité du gestionnaire). L'état passe à \`PENDING\`.
2. **Pré-approbation des documents:** L'administrateur examine les documents. S'ils sont approuvés, l'état passe à \`AWAITING_PAYMENT\` avec facturation automatique.
3. **Soumission du reçu de paiement:** Le vendeur télécharge le reçu. L'état passe à \`PAYMENT_SUBMITTED\`.
4. **Activation finale:** L'administrateur confirme le paiement. L'état passe à \`APPROVED\`, ce qui archive l'ancien profil, active \`BusinessVerification\`, met à jour le rôle de l'utilisateur à \`store_manager\` et crée la boutique sans rompre les identifiants existants.
          `
        }
      };

      const existing = await db.docArticle.findUnique({
        where: { slug: articleSlug }
      });

      if (!existing) {
        await db.docArticle.create({
          data: {
            title,
            titleEn,
            slug: articleSlug,
            content,
            contentEn,
            translations: translations as any,
            category: 'developers',
            sortOrder: 10,
            isPublished: true
          }
        });
        results.push('✅ Created Developer Doc article: business-upgrade-architecture');
      } else {
        await db.docArticle.update({
          where: { slug: articleSlug },
          data: {
            title,
            titleEn,
            content,
            contentEn,
            translations: translations as any,
            isPublished: true
          }
        });
        results.push('✅ Updated Developer Doc article: business-upgrade-architecture');
      }

      return NextResponse.json({
        success: true,
        step: 6,
        message: '🎉 All seed data completed successfully, including Developer Docs!',
        details: results,
      });
    }

    // =====================================================
    // STEP 7: Branches & Business Management Doc Article
    // =====================================================
    if (step === '7') {
      const articleSlug = 'branches-business-management';
      const title = 'إدارة الفروع وإدارة الأعمال للمتاجر';
      const titleEn = 'Branch Management & Business Operations';

      const content = `
## إدارة الفروع للمتاجر

تتيح لك ميزة **إدارة الفروع** إنشاء وإدارة متعدد من الفروع والمتاجر المرتبطة بحسابك التجاري الواحد، وذلك بكل سهولة من مكان واحد.

---

### 📋 شروط الوصول لإدارة الفروع

- يجب أن يكون حسابك من نوع **متجر أعمال** (أي أن دورك في النظام إما \`store\` أو \`store_manager\`).
- يظهر قسم **إدارة الأعمال** تلقائياً في القائمة الجانبية للمستخدمين المؤهلين.
- يمكن الوصول إلى الفروع والفريق من قسم **إدارة الأعمال** في القائمة الجانبية.

---

### 🏗️ إنشاء فرع جديد

1. اذهب إلى **إدارة الأعمال → إدارة الفروع**.
2. اضغط على زر **فرع جديد**.
3. أدخل اسم الفرع باللغتين العربية والإنجليزية.
4. سيتم إنشاء الفرع وربطك به كمدير فرع تلقائياً.

---

### 📊 حصة الفروع (Branch Quota)

- تظهر في أعلى الصفحة شريط تقدم يوضح عدد الفروع المستخدمة مقابل الحد الأقصى المسموح به في باقتك.
- عند الوصول للحد الأقصى، سيتم تعطيل زر **فرع جديد** تلقائياً.
- لزيادة الحد الأقصى، يمكنك ترقية باقتك من صفحة **اختر باقة**.

---

### 🔄 تبديل الفروع

- يظهر أيقونة **تبديل المتجر/الفرع** في شريط التنقل العلوي لأصحاب المتاجر.
- يمكنك التبديل بين فروعك المختلفة بضغطة واحدة وسيتم تحديث البيانات المعروضة وفق الفرع المختار.

---

### 👥 طاقم العمل والشركاء

- من **إدارة الأعمال → طاقم العمل والشركاء** يمكنك دعوة موظفين وتعيين أدوارهم في كل فرع.
- الأدوار المتاحة: مدير فرع، مشرف، موظف، محرر.
      `;

      const contentEn = `
## Branch Management for Business Stores

The **Branch Management** feature allows you to create and manage multiple branches linked to your single business account from one unified dashboard.

---

### 📋 Access Requirements

- Your account must be a **Business Store** (role must be either \`store\` or \`store_manager\`).
- The **Business Management** section appears automatically in the sidebar for eligible users.
- Access Branches and Team from the **Business Management** group in the sidebar.

---

### 🏗️ Creating a New Branch

1. Go to **Business Management → Branch Management**.
2. Click the **New Branch** button.
3. Enter the branch name in Arabic and English.
4. The branch will be created and you'll be linked as its manager automatically.

---

### 📊 Branch Quota

- A progress bar at the top of the page shows how many branches you've used vs. your plan limit.
- When the limit is reached, the **New Branch** button will be automatically disabled.
- To increase your limit, upgrade your plan from the **Choose Plan** page.

---

### 🔄 Branch Switching

- Store owners see a **Switch Store/Branch** button in the top navigation bar.
- You can switch between your branches with a single click, and the dashboard data updates accordingly.

---

### 👥 Team & Staff

- From **Business Management → Team & Staff** you can invite employees and assign their roles per branch.
- Available roles: Branch Manager, Admin, Staff, Editor.
      `;

      const translations = {
        fr: {
          title: 'Gestion des succursales et opérations commerciales',
          content: `
## Gestion des succursales

La fonctionnalité de **gestion des succursales** vous permet de créer et de gérer plusieurs succursales liées à votre compte professionnel depuis un seul endroit.

### Conditions d'accès
- Votre compte doit être de type **Boutique Professionnelle** (rôle \`store\` ou \`store_manager\`).
- La section **Gestion des affaires** apparaît automatiquement dans la barre latérale.

### Création d'une succursale
1. Allez à **Gestion des affaires → Gestion des succursales**.
2. Cliquez sur **Nouvelle succursale**.
3. Saisissez le nom en arabe et en anglais.

### Quota de succursales
- Une barre de progression affiche les succursales utilisées par rapport à la limite de votre abonnement.
- Mettez à niveau votre abonnement pour augmenter cette limite.
          `
        }
      };

      const existing = await db.docArticle.findUnique({ where: { slug: articleSlug } });
      if (!existing) {
        await db.docArticle.create({
          data: {
            title,
            titleEn,
            slug: articleSlug,
            content,
            contentEn,
            translations: translations as any,
            category: 'sellers',
            sortOrder: 11,
            isPublished: true
          }
        });
        results.push('✅ Created Doc article: branches-business-management');
      } else {
        await db.docArticle.update({
          where: { slug: articleSlug },
          data: { title, titleEn, content, contentEn, translations: translations as any, isPublished: true }
        });
        results.push('✅ Updated Doc article: branches-business-management');
      }

      return NextResponse.json({
        success: true,
        step: 7,
        message: '🎉 Branch Management doc article seeded!',
        details: results,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid step. Use step=1 through step=7' });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, step, error: errorMsg, details: results }, { status: 500 });
  }
}
