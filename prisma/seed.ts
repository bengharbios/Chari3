import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── PRODUCT CATEGORIES (Full Algerian Market Tree) ─────────────────────────
const PRODUCT_CATEGORIES = [
  // Electronics
  { name: 'إلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱', sortOrder: 1, children: [
    { name: 'هواتف ذكية', nameEn: 'Smartphones', slug: 'smartphones', icon: '📲', sortOrder: 1 },
    { name: 'لابتوبات', nameEn: 'Laptops', slug: 'laptops', icon: '💻', sortOrder: 2 },
    { name: 'تلفزيونات', nameEn: 'TVs', slug: 'tvs', icon: '📺', sortOrder: 3 },
    { name: 'إكسسوارات إلكترونية', nameEn: 'Electronics Accessories', slug: 'electronics-accessories', icon: '🔌', sortOrder: 4 },
    { name: 'كاميرات', nameEn: 'Cameras', slug: 'cameras', icon: '📷', sortOrder: 5 },
  ]},
  // Fashion
  { name: 'ملابس وأزياء', nameEn: 'Fashion & Clothing', slug: 'fashion', icon: '👗', sortOrder: 2, children: [
    { name: 'ملابس رجالية', nameEn: "Men's Clothing", slug: 'mens-clothing', icon: '👔', sortOrder: 1 },
    { name: 'ملابس نسائية', nameEn: "Women's Clothing", slug: 'womens-clothing', icon: '👘', sortOrder: 2 },
    { name: 'ملابس أطفال', nameEn: "Children's Clothing", slug: 'kids-clothing', icon: '👶', sortOrder: 3 },
    { name: 'أحذية', nameEn: 'Shoes', slug: 'shoes', icon: '👟', sortOrder: 4 },
    { name: 'حقائب', nameEn: 'Bags', slug: 'bags', icon: '👜', sortOrder: 5 },
  ]},
  // Home & Kitchen
  { name: 'المنزل والمطبخ', nameEn: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠', sortOrder: 3, children: [
    { name: 'أثاث', nameEn: 'Furniture', slug: 'furniture', icon: '🛋️', sortOrder: 1 },
    { name: 'أدوات مطبخية', nameEn: 'Kitchen Tools', slug: 'kitchen-tools', icon: '🍳', sortOrder: 2 },
    { name: 'ديكور', nameEn: 'Decor', slug: 'decor', icon: '🖼️', sortOrder: 3 },
    { name: 'إضاءة', nameEn: 'Lighting', slug: 'lighting', icon: '💡', sortOrder: 4 },
  ]},
  // Beauty & Health
  { name: 'الجمال والصحة', nameEn: 'Beauty & Health', slug: 'beauty-health', icon: '💄', sortOrder: 4, children: [
    { name: 'مستحضرات تجميل', nameEn: 'Cosmetics', slug: 'cosmetics', icon: '💅', sortOrder: 1 },
    { name: 'العطور', nameEn: 'Perfumes', slug: 'perfumes', icon: '🌸', sortOrder: 2 },
    { name: 'العناية بالبشرة', nameEn: 'Skincare', slug: 'skincare', icon: '🧴', sortOrder: 3 },
    { name: 'الصحة واللياقة', nameEn: 'Health & Fitness', slug: 'health-fitness', icon: '💪', sortOrder: 4 },
  ]},
  // Sports
  { name: 'رياضة ولياقة', nameEn: 'Sports & Fitness', slug: 'sports', icon: '⚽', sortOrder: 5, children: [
    { name: 'معدات رياضية', nameEn: 'Sports Equipment', slug: 'sports-equipment', icon: '🏋️', sortOrder: 1 },
    { name: 'ملابس رياضية', nameEn: 'Sportswear', slug: 'sportswear', icon: '🏃', sortOrder: 2 },
    { name: 'دراجات', nameEn: 'Bicycles', slug: 'bicycles', icon: '🚴', sortOrder: 3 },
  ]},
  // Automotive
  { name: 'السيارات واللوازم', nameEn: 'Automotive', slug: 'automotive', icon: '🚗', sortOrder: 6, children: [
    { name: 'إكسسوارات سيارات', nameEn: 'Car Accessories', slug: 'car-accessories', icon: '🔧', sortOrder: 1 },
    { name: 'قطع غيار', nameEn: 'Spare Parts', slug: 'spare-parts', icon: '⚙️', sortOrder: 2 },
  ]},
  // Books & Stationery
  { name: 'الكتب والقرطاسية', nameEn: 'Books & Stationery', slug: 'books-stationery', icon: '📚', sortOrder: 7, children: [
    { name: 'كتب', nameEn: 'Books', slug: 'books', icon: '📖', sortOrder: 1 },
    { name: 'أدوات مكتبية', nameEn: 'Office Supplies', slug: 'office-supplies', icon: '✏️', sortOrder: 2 },
  ]},
  // Food & Groceries
  { name: 'الغذاء والبقالة', nameEn: 'Food & Groceries', slug: 'food-groceries', icon: '🍕', sortOrder: 8, children: [
    { name: 'مواد غذائية', nameEn: 'Groceries', slug: 'groceries', icon: '🛒', sortOrder: 1 },
    { name: 'حلويات', nameEn: 'Sweets', slug: 'sweets', icon: '🍫', sortOrder: 2 },
    { name: 'المنتجات التقليدية', nameEn: 'Traditional Products', slug: 'traditional-products', icon: '🫙', sortOrder: 3 },
  ]},
  // Toys & Games
  { name: 'الألعاب والترفيه', nameEn: 'Toys & Games', slug: 'toys-games', icon: '🎮', sortOrder: 9, children: [
    { name: 'ألعاب أطفال', nameEn: "Children's Toys", slug: 'childrens-toys', icon: '🧸', sortOrder: 1 },
    { name: 'ألعاب فيديو', nameEn: 'Video Games', slug: 'video-games', icon: '🕹️', sortOrder: 2 },
  ]},
  // Jewelry
  { name: 'المجوهرات والإكسسوارات', nameEn: 'Jewelry & Accessories', slug: 'jewelry', icon: '💍', sortOrder: 10, children: [
    { name: 'ذهب وفضة', nameEn: 'Gold & Silver', slug: 'gold-silver', icon: '🥇', sortOrder: 1 },
    { name: 'إكسسوارات', nameEn: 'Accessories', slug: 'accessories', icon: '💎', sortOrder: 2 },
  ]},
  // Agriculture & Nature
  { name: 'الفلاحة والطبيعة', nameEn: 'Agriculture & Nature', slug: 'agriculture', icon: '🌱', sortOrder: 11, children: [
    { name: 'بذور ونباتات', nameEn: 'Seeds & Plants', slug: 'seeds-plants', icon: '🌿', sortOrder: 1 },
    { name: 'أدوات زراعية', nameEn: 'Agricultural Tools', slug: 'agricultural-tools', icon: '⛏️', sortOrder: 2 },
    { name: 'منتجات عضوية', nameEn: 'Organic Products', slug: 'organic-products', icon: '🥦', sortOrder: 3 },
  ]},
  { name: 'أخرى', nameEn: 'Other', slug: 'other', icon: '📦', sortOrder: 99 },
];

// ── STORE CATEGORIES ──────────────────────────────────────────────────────
const STORE_CATEGORIES = [
  { name: 'متجر إلكترونيات', nameEn: 'Electronics Store', slug: 'store-electronics', icon: '📱', sortOrder: 1 },
  { name: 'متجر ملابس', nameEn: 'Fashion Store', slug: 'store-fashion', icon: '👗', sortOrder: 2 },
  { name: 'متجر المنزل', nameEn: 'Home Store', slug: 'store-home', icon: '🏠', sortOrder: 3 },
  { name: 'متجر تجميل', nameEn: 'Beauty Store', slug: 'store-beauty', icon: '💄', sortOrder: 4 },
  { name: 'متجر رياضة', nameEn: 'Sports Store', slug: 'store-sports', icon: '⚽', sortOrder: 5 },
  { name: 'متجر غذاء', nameEn: 'Food Store', slug: 'store-food', icon: '🍕', sortOrder: 6 },
  { name: 'متجر مجوهرات', nameEn: 'Jewelry Store', slug: 'store-jewelry', icon: '💍', sortOrder: 7 },
  { name: 'متجر متنوع', nameEn: 'General Store', slug: 'store-general', icon: '🏪', sortOrder: 8 },
];

// ── SUPPLIER CATEGORIES ───────────────────────────────────────────────────
const SUPPLIER_CATEGORIES = [
  { name: 'مورد إلكترونيات', nameEn: 'Electronics Supplier', slug: 'supplier-electronics', icon: '📦', sortOrder: 1 },
  { name: 'مورد ملابس', nameEn: 'Clothing Supplier', slug: 'supplier-clothing', icon: '🧵', sortOrder: 2 },
  { name: 'مورد مواد غذائية', nameEn: 'Food Supplier', slug: 'supplier-food', icon: '🌾', sortOrder: 3 },
  { name: 'مورد بناء ومواد', nameEn: 'Construction Supplier', slug: 'supplier-construction', icon: '🏗️', sortOrder: 4 },
  { name: 'مورد متنوع', nameEn: 'General Supplier', slug: 'supplier-general', icon: '🏭', sortOrder: 5 },
];

// ── LOGISTICS CATEGORIES ──────────────────────────────────────────────────
const LOGISTICS_CATEGORIES = [
  { name: 'توصيل محلي', nameEn: 'Local Delivery', slug: 'logistics-local', icon: '🛵', sortOrder: 1 },
  { name: 'شحن ولائي', nameEn: 'Wilaya Shipping', slug: 'logistics-wilaya', icon: '🚐', sortOrder: 2 },
  { name: 'شحن وطني', nameEn: 'National Shipping', slug: 'logistics-national', icon: '🚚', sortOrder: 3 },
  { name: 'نقل البضائع الثقيلة', nameEn: 'Heavy Freight', slug: 'logistics-heavy', icon: '🏗️', sortOrder: 4 },
];

async function seedCategories(
  items: any[],
  type: string,
  parentId?: string
): Promise<void> {
  for (const item of items) {
    const { children, ...data } = item;
    const cat = await prisma.category.upsert({
      where: { slug: data.slug },
      update: { name: data.name, nameEn: data.nameEn, icon: data.icon, type, sortOrder: data.sortOrder, parentId: parentId || null, isActive: true },
      create: { ...data, type, parentId: parentId || null, isActive: true },
    });
    if (children && children.length > 0) {
      await seedCategories(children, type, cat.id);
    }
  }
}

async function main() {
  console.log('🌱 Starting ChariDay seed...');

  // 1. Admin User
  const hashedPassword = await bcrypt.hash('admin1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'bengharbios@gmail.com' },
    update: { password: hashedPassword, role: 'admin', isActive: true, isVerified: true, accountStatus: 'active' },
    create: {
      email: 'bengharbios@gmail.com',
      password: hashedPassword,
      name: 'عبدالقادر بن غربي',
      nameEn: 'Abd El-Kader Bengharbi',
      role: 'admin',
      isActive: true,
      isVerified: true,
      accountStatus: 'active',
      locale: 'ar',
    },
  });
  console.log('✅ Admin user seeded:', admin.email);

  // 2. Product Categories (with subcategories)
  console.log('📦 Seeding product categories...');
  await seedCategories(PRODUCT_CATEGORIES, 'product');
  console.log('✅ Product categories seeded');

  // 3. Store Categories
  console.log('🏪 Seeding store categories...');
  await seedCategories(STORE_CATEGORIES, 'store');
  console.log('✅ Store categories seeded');

  // 4. Supplier Categories
  console.log('🏭 Seeding supplier categories...');
  await seedCategories(SUPPLIER_CATEGORIES, 'supplier');
  console.log('✅ Supplier categories seeded');

  // 5. Logistics Categories
  console.log('🚚 Seeding logistics categories...');
  await seedCategories(LOGISTICS_CATEGORIES, 'logistics');
  console.log('✅ Logistics categories seeded');

  const totalCats = await prisma.category.count();
  console.log(`\n🎉 Seed complete! Total categories: ${totalCats}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
