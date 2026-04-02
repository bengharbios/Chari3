import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

const SETUP_TOKEN = 'chari3-setup-2026';

const DEFAULT_ROLES = [
  {
    key: 'admin', nameAr: 'مدير النظام', nameEn: 'System Admin',
    descriptionAr: 'صلاحيات كاملة على النظام', descriptionEn: 'Full system access',
    color: '#7C3AED', icon: 'Shield', isSystem: true, sortOrder: 1,
    permissions: JSON.stringify([
      'admin_view_dashboard', 'admin_manage_users', 'admin_manage_roles',
      'admin_manage_orders', 'admin_manage_products', 'admin_manage_stores',
      'admin_manage_shipping', 'admin_view_analytics', 'admin_manage_settings',
      'admin_view_logs', 'admin_manage_categories', 'admin_manage_coupons',
      'admin_manage_reviews', 'admin_manage_freelancers', 'admin_manage_suppliers',
    ]),
  },
  {
    key: 'buyer', nameAr: 'مشتري', nameEn: 'Buyer',
    descriptionAr: 'مستخدم عادي', descriptionEn: 'Regular customer',
    color: '#2563EB', icon: 'ShoppingCart', isSystem: true, sortOrder: 2,
    permissions: JSON.stringify([]),
  },
  {
    key: 'seller', nameAr: 'بائع مستقل', nameEn: 'Freelance Seller',
    descriptionAr: 'بائع مستقل بدون متجر', descriptionEn: 'Independent seller without store',
    color: '#D97706', icon: 'ShoppingBag', isSystem: true, sortOrder: 3,
    permissions: JSON.stringify([
      'products_create', 'products_edit_own', 'products_delete_own',
      'orders_view_own', 'wallet_view_own',
    ]),
  },
  {
    key: 'store_manager', nameAr: 'مدير متجر', nameEn: 'Store Manager',
    descriptionAr: 'مدير متجر معتمد', descriptionEn: 'Verified store manager',
    color: '#0D9488', icon: 'Building2', isSystem: true, sortOrder: 4,
    permissions: JSON.stringify([
      'products_create', 'products_edit_own', 'products_delete_own',
      'orders_view_own', 'orders_manage_own', 'store_settings',
      'store_staff_manage', 'wallet_view_own', 'wallet_withdraw',
    ]),
  },
  {
    key: 'supplier', nameAr: 'مورّد', nameEn: 'Supplier',
    descriptionAr: 'مورّد منتجات بالجملة', descriptionEn: 'Wholesale supplier',
    color: '#0891B2', icon: 'Package', isSystem: true, sortOrder: 5,
    permissions: JSON.stringify([
      'products_create', 'products_edit_own', 'products_delete_own',
      'orders_view_own', 'wallet_view_own',
    ]),
  },
  {
    key: 'delivery', nameAr: 'شركة توصيل', nameEn: 'Delivery Company',
    descriptionAr: 'شركة أو فرد توصيل', descriptionEn: 'Delivery service provider',
    color: '#16A34A', icon: 'Rocket', isSystem: true, sortOrder: 6,
    permissions: JSON.stringify([
      'orders_view_assigned', 'orders_update_delivery',
      'shipments_manage_own', 'wallet_view_own', 'wallet_withdraw',
    ]),
  },
];

const TEST_USERS = [
  {
    email: 'admin@chari3.com', phone: '0500000001', password: 'Admin@123',
    name: 'مدير النظام', nameEn: 'System Admin', role: 'admin',
    accountStatus: 'active', isActive: true, isVerified: true, phoneVerified: true, emailVerified: true,
  },
  {
    email: 'ahmed@chari3.com', phone: '0500000002', password: 'User@123',
    name: 'أحمد بن محمد', nameEn: 'Ahmed Ben Mohamed', role: 'buyer',
    accountStatus: 'active', isActive: true, isVerified: true, phoneVerified: true,
  },
  {
    email: 'fatima@chari3.com', phone: '0500000003', password: 'User@123',
    name: 'فاطمة الزهراء', nameEn: 'Fatima Zahra', role: 'buyer',
    accountStatus: 'active', isActive: true, isVerified: true,
  },
  {
    email: 'seller1@chari3.com', phone: '0500000004', password: 'User@123',
    name: 'يوسف بائع', nameEn: 'Youssef Seller', role: 'seller',
    accountStatus: 'active', isActive: true, isVerified: true, phoneVerified: true,
  },
  {
    email: 'store@chari3.com', phone: '0500000005', password: 'User@123',
    name: 'متجر الإلكترونيات', nameEn: 'Electronics Store', role: 'store_manager',
    accountStatus: 'active', isActive: true, isVerified: true, phoneVerified: true, emailVerified: true,
  },
  {
    email: 'supply@chari3.com', phone: '0500000006', password: 'User@123',
    name: 'شركة التوريد', nameEn: 'Supply Company', role: 'supplier',
    accountStatus: 'active', isActive: true, isVerified: true, phoneVerified: true,
  },
  {
    email: 'delivery@chari3.com', phone: '0500000007', password: 'User@123',
    name: 'خدمة التوصيل السريع', nameEn: 'Express Delivery', role: 'delivery',
    accountStatus: 'active', isActive: true, isVerified: true, phoneVerified: true,
  },
  {
    email: 'pending@chari3.com', phone: '0500000008', password: 'User@123',
    name: 'مستخدم جديد', nameEn: 'New User', role: 'buyer',
    accountStatus: 'pending', isActive: true, isVerified: false,
  },
  {
    email: 'suspended@chari3.com', phone: '0500000009', password: 'User@123',
    name: 'حساب معلّق', nameEn: 'Suspended Account', role: 'buyer',
    accountStatus: 'suspended', isActive: false, isVerified: true,
  },
];

const DEFAULT_CATEGORIES = [
  { name: 'إلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: 'smartphone' },
  { name: 'ملابس رجالية', nameEn: "Men's Clothing", slug: 'mens-clothing', icon: 'shirt' },
  { name: 'ملابس نسائية', nameEn: "Women's Clothing", slug: 'womens-clothing', icon: 'shirt' },
  { name: 'أجهزة منزلية', nameEn: 'Home Appliances', slug: 'home-appliances', icon: 'home' },
  { name: 'جمال وعناية', nameEn: 'Beauty & Care', slug: 'beauty-care', icon: 'sparkles' },
  { name: 'رياضة', nameEn: 'Sports', slug: 'sports', icon: 'trophy' },
  { name: 'كتب', nameEn: 'Books', slug: 'books', icon: 'book' },
  { name: 'ألعاب أطفال', nameEn: 'Toys', slug: 'toys', icon: 'gamepad-2' },
  { name: 'سوبرماركت', nameEn: 'Supermarket', slug: 'supermarket', icon: 'shopping-cart' },
  { name: 'مستلزمات حيوانات', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: 'paw-print' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== SETUP_TOKEN) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 });
  }

  const results: { step: string; status: string; count?: number; details?: string }[] = [];

  try {
    // Step 1: Seed Roles
    for (const role of DEFAULT_ROLES) {
      try {
        await db.role.upsert({
          where: { key: role.key },
          update: {},
          create: role,
        });
      } catch { /* role may already exist via table creation */ }
    }
    const roleCount = await db.role.count();
    results.push({ step: 'Roles', status: 'ok', count: roleCount });

    // Step 2: Seed Categories
    for (const cat of DEFAULT_CATEGORIES) {
      try {
        await db.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: { ...cat, sortOrder: DEFAULT_CATEGORIES.indexOf(cat), isActive: true },
        });
      } catch { /* ignore duplicates */ }
    }
    const catCount = await db.category.count();
    results.push({ step: 'Categories', status: 'ok', count: catCount });

    // Step 3: Seed Users
    for (const user of TEST_USERS) {
      const hashedPassword = await hash(user.password, 12);
      try {
        await db.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            phone: user.phone,
            password: hashedPassword,
            name: user.name,
            nameEn: user.nameEn,
            role: user.role,
            accountStatus: user.accountStatus,
            isActive: user.isActive,
            isVerified: user.isVerified,
            phoneVerified: user.phoneVerified,
            emailVerified: user.emailVerified,
            locale: 'ar',
          },
        });

        // Create profiles based on role
        const existingUser = await db.user.findUnique({ where: { email: user.email } });
        if (!existingUser) continue;

        if (user.role === 'buyer') {
          try {
            await db.buyerProfile.upsert({
              where: { userId: existingUser.id },
              update: {},
              create: { userId: existingUser.id },
            });
          } catch { /* already exists */ }
        }
        if (user.role === 'seller') {
          try {
            await db.sellerProfile.upsert({
              where: { userId: existingUser.id },
              update: {},
              create: { userId: existingUser.id, storeName: user.name, storeNameEn: user.nameEn },
            });
          } catch { /* already exists */ }
        }
        if (user.role === 'delivery') {
          try {
            await db.logisticsProfile.upsert({
              where: { userId: existingUser.id },
              update: {},
              create: { userId: existingUser.id },
            });
          } catch { /* already exists */ }
        }

        // Create wallet for all users
        try {
          await db.wallet.upsert({
            where: { userId: existingUser.id },
            update: {},
            create: { userId: existingUser.id },
          });
        } catch { /* already exists */ }
      } catch {
        // User may already exist
      }
    }
    const userCount = await db.user.count();
    results.push({ step: 'Users', status: 'ok', count: userCount });

    // Step 4: Summary
    const totalTables = await db.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()`;

    return NextResponse.json({
      success: true,
      message: `Seed complete! ${roleCount} roles, ${catCount} categories, ${userCount} users`,
      results,
      login: {
        admin: { email: 'admin@chari3.com', password: 'Admin@123' },
        buyer: { email: 'ahmed@chari3.com', password: 'User@123' },
        seller: { email: 'seller1@chari3.com', password: 'User@123' },
        store: { email: 'store@chari3.com', password: 'User@123' },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message, results },
      { status: 500 }
    );
  }
}
