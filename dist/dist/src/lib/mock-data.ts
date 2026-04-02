import type {
  Product, Category, Order, Shipment, User, Store, SellerProfile,
  Notification, Address, Wallet, WalletTransaction, AnalyticsData,
  OrderStatus, ShipmentStatus
} from '@/types';

// ============================================
// CATEGORIES
// ============================================

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'إلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: 'Smartphone', sortOrder: 1, isActive: true, productCount: 156 },
  { id: 'cat-2', name: 'أزياء رجالية', nameEn: 'Men Fashion', slug: 'men-fashion', icon: 'Shirt', sortOrder: 2, isActive: true, productCount: 243 },
  { id: 'cat-3', name: 'أزياء نسائية', nameEn: 'Women Fashion', slug: 'women-fashion', icon: 'ShoppingBag', sortOrder: 3, isActive: true, productCount: 312 },
  { id: 'cat-4', name: 'المنزل والمطبخ', nameEn: 'Home & Kitchen', slug: 'home-kitchen', icon: 'Home', sortOrder: 4, isActive: true, productCount: 187 },
  { id: 'cat-5', name: 'الجمال والعناية', nameEn: 'Beauty', slug: 'beauty', icon: 'Sparkles', sortOrder: 5, isActive: true, productCount: 98 },
  { id: 'cat-6', name: 'الرياضة', nameEn: 'Sports', slug: 'sports', icon: 'Dumbbell', sortOrder: 6, isActive: true, productCount: 76 },
  { id: 'cat-7', name: 'ألعاب أطفال', nameEn: 'Toys', slug: 'toys', icon: 'Gamepad2', sortOrder: 7, isActive: true, productCount: 54 },
  { id: 'cat-8', name: 'كتب', nameEn: 'Books', slug: 'books', icon: 'BookOpen', sortOrder: 8, isActive: true, productCount: 129 },
  { id: 'cat-9', name: 'ساعات ومجوهرات', nameEn: 'Watches', slug: 'watches', icon: 'Watch', sortOrder: 9, isActive: true, productCount: 67 },
  { id: 'cat-10', name: 'سيارات', nameEn: 'Automotive', slug: 'automotive', icon: 'Car', sortOrder: 10, isActive: true, productCount: 45 },
];

// ============================================
// PRODUCTS
// ============================================

const productImages = [
  'https://placehold.co/400x400/1B1464/FFFFFF?text=Product+1',
  'https://placehold.co/400x400/FEEE00/1B1464?text=Product+2',
  'https://placehold.co/400x400/F68B1E/FFFFFF?text=Product+3',
  'https://placehold.co/400x400/22C55E/FFFFFF?text=Product+4',
  'https://placehold.co/400x400/3B82F6/FFFFFF?text=Product+5',
  'https://placehold.co/400x400/8B5CF6/FFFFFF?text=Product+6',
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p-1', name: 'آيفون 15 برو ماكس', nameEn: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', description: 'هاتف آبل الرائد بكاميرا متطورة ومعالج A17 Pro', price: 5499, comparePrice: 5999, costPrice: 4800, sku: 'APL-IP15PM-256', images: [productImages[0]], specifications: { 'الشاشة': '6.7 بوصة', 'المعالج': 'A17 Pro', 'الذاكرة': '256GB', 'الكاميرا': '48MP' }, status: 'active', stock: 45, lowStock: 5, rating: 4.8, reviewCount: 234, soldCount: 1567, viewCount: 23400, isFeatured: true, category: MOCK_CATEGORIES[0], createdAt: '2024-01-15T10:00:00Z' },
  { id: 'p-2', name: 'سامسونج جالكسي S24 ألترا', nameEn: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', description: 'هاتف سامسونج المتطور مع قلم S Pen وكاميرا 200 ميجابكسل', price: 4999, comparePrice: 5499, images: [productImages[1]], specifications: { 'الشاشة': '6.8 بوصة', 'المعالج': 'Snapdragon 8 Gen 3', 'الذاكرة': '256GB', 'الكاميرا': '200MP' }, status: 'active', stock: 32, lowStock: 5, rating: 4.7, reviewCount: 189, soldCount: 1234, viewCount: 19800, isFeatured: true, category: MOCK_CATEGORIES[0], createdAt: '2024-02-10T10:00:00Z' },
  { id: 'p-3', name: 'سماعات AirPods Pro 2', nameEn: 'AirPods Pro 2', slug: 'airpods-pro-2', description: 'سماعات لاسلكية مع عزل نشط للضوضاء', price: 899, comparePrice: 999, images: [productImages[2]], specifications: { 'النوع': 'True Wireless', 'عزل الضوضاء': 'نعم', 'مقاومة الماء': 'IPX4' }, status: 'active', stock: 120, lowStock: 10, rating: 4.6, reviewCount: 456, soldCount: 3456, viewCount: 45000, isFeatured: true, category: MOCK_CATEGORIES[0], createdAt: '2024-01-20T10:00:00Z' },
  { id: 'p-4', name: 'لابتوب ماك بوك برو M3', nameEn: 'MacBook Pro M3', slug: 'macbook-pro-m3', description: 'لابتوب احترافي بشريحة M3 Pro وشاشة Liquid Retina XDR', price: 8999, comparePrice: 9999, images: [productImages[3]], specifications: { 'الشاشة': '14 بوصة', 'المعالج': 'M3 Pro', 'الذاكرة': '18GB', 'التخزين': '512GB SSD' }, status: 'active', stock: 15, lowStock: 3, rating: 4.9, reviewCount: 78, soldCount: 456, viewCount: 12300, isFeatured: true, category: MOCK_CATEGORIES[0], createdAt: '2024-03-01T10:00:00Z' },
  { id: 'p-5', name: 'ساعة Apple Watch Ultra 2', nameEn: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2', description: 'ساعة ذكية للمغامرات مع GPS مزدوج وبطارية تدوم 36 ساعة', price: 3299, comparePrice: 3599, images: [productImages[4]], specifications: { 'الشاشة': '49mm', 'البطارية': '36 ساعة', 'مقاومة الماء': '100m' }, status: 'active', stock: 28, lowStock: 5, rating: 4.7, reviewCount: 98, soldCount: 678, viewCount: 8900, isFeatured: false, category: MOCK_CATEGORIES[8], createdAt: '2024-02-15T10:00:00Z' },
  { id: 'p-6', name: 'تي شيرت رجالي قطني', nameEn: 'Men Cotton T-Shirt', slug: 'men-cotton-tshirt', description: 'تي شيرت قطني مريح بألوان متعددة', price: 89, comparePrice: 120, images: [productImages[5]], specifications: { 'المادة': '100% قطن', 'المقاسات': 'S-XXL', 'الألوان': '5 ألوان' }, status: 'active', stock: 500, lowStock: 50, rating: 4.3, reviewCount: 567, soldCount: 8900, viewCount: 67000, isFeatured: false, category: MOCK_CATEGORIES[1], createdAt: '2024-01-05T10:00:00Z' },
  { id: 'p-7', name: 'حقيبة يد نسائية جلدية', nameEn: 'Women Leather Handbag', slug: 'women-leather-handbag', description: 'حقيبة يد أنيقة من الجلد الطبيعي', price: 459, comparePrice: 599, images: [productImages[0]], specifications: { 'المادة': 'جلد طبيعي', 'الحجم': 'كبير', 'الألوان': 'أسود، بني' }, status: 'active', stock: 75, lowStock: 10, rating: 4.5, reviewCount: 234, soldCount: 2345, viewCount: 34500, isFeatured: false, category: MOCK_CATEGORIES[2], createdAt: '2024-02-20T10:00:00Z' },
  { id: 'p-8', name: 'خلاط كهربائي متعدد السرعات', nameEn: 'Multi-Speed Blender', slug: 'multi-speed-blender', description: 'خلاط قوي 1000 واط مع 5 سرعات', price: 299, comparePrice: 399, images: [productImages[1]], specifications: { 'القوة': '1000 واط', 'السعة': '1.5 لتر', 'السرعات': '5' }, status: 'active', stock: 60, lowStock: 10, rating: 4.4, reviewCount: 145, soldCount: 1890, viewCount: 21000, isFeatured: false, category: MOCK_CATEGORIES[3], createdAt: '2024-03-05T10:00:00Z' },
  { id: 'p-9', name: 'مجموعة العناية بالبشرة', nameEn: 'Skincare Set', slug: 'skincare-set', description: 'مجموعة كاملة للعناية بالبشرة الدهنية', price: 199, comparePrice: 280, images: [productImages[2]], specifications: { 'عدد القطع': '5', 'نوع البشرة': 'دهنية', 'العلامة': 'La Roche-Posay' }, status: 'active', stock: 200, lowStock: 20, rating: 4.6, reviewCount: 345, soldCount: 4567, viewCount: 56000, isFeatured: false, category: MOCK_CATEGORIES[4], createdAt: '2024-01-25T10:00:00Z' },
  { id: 'p-10', name: 'حذاء رياضي للجري', nameEn: 'Running Shoes', slug: 'running-shoes', description: 'حذاء رياضي خفيف الوزن لنعل مريح', price: 349, comparePrice: 449, images: [productImages[3]], specifications: { 'النوع': 'جري', 'المادة': 'مشبك + شبكي', 'الأوزان': '280 جرام' }, status: 'active', stock: 85, lowStock: 15, rating: 4.4, reviewCount: 267, soldCount: 3456, viewCount: 43000, isFeatured: false, category: MOCK_CATEGORIES[5], createdAt: '2024-02-28T10:00:00Z' },
];

// ============================================
// MOCK USERS
// ============================================

export const MOCK_USERS: User[] = [
  { id: 'admin-001', email: 'admin@charyday.com', name: 'أحمد المدير', nameEn: 'Ahmed Admin', role: 'admin', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-01-01T10:00:00Z' },
  { id: 'store-001', email: 'store@charyday.com', name: 'محمد المتجر', nameEn: 'Mohammed Store', role: 'store_manager', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'store-002', email: 'store2@charyday.com', name: 'نورة المتجر', nameEn: 'Noura Store', role: 'store_manager', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-02-01T10:00:00Z' },
  { id: 'seller-001', email: 'seller@charyday.com', name: 'خالد التاجر', nameEn: 'Khaled Seller', role: 'seller', isActive: true, isVerified: false, locale: 'ar', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'seller-002', email: 'seller2@charyday.com', name: 'سارة التاجرة', nameEn: 'Sara Seller', role: 'seller', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-02-10T10:00:00Z' },
  { id: 'logistics-001', email: 'delivery@charyday.com', name: 'سعد المندوب', nameEn: 'Saad Courier', role: 'logistics', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'logistics-002', email: 'delivery2@charyday.com', name: 'عبدالله المندوب', nameEn: 'Abdullah Courier', role: 'logistics', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-01-25T10:00:00Z' },
  { id: 'buyer-001', email: 'buyer@charyday.com', name: 'فاطمة المشترية', nameEn: 'Fatima Buyer', role: 'buyer', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-01-05T10:00:00Z' },
  { id: 'buyer-002', email: 'buyer2@charyday.com', name: 'عمر المشتري', nameEn: 'Omar Buyer', role: 'buyer', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-02-05T10:00:00Z' },
  { id: 'buyer-003', email: 'buyer3@charyday.com', name: 'ليلى المشترية', nameEn: 'Layla Buyer', role: 'buyer', isActive: false, isVerified: false, locale: 'ar', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'buyer-004', email: 'rabiaa@charyday.com', name: 'ربيعة المشترية', nameEn: 'Rabiaa Buyer', role: 'buyer', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-03-10T10:00:00Z' },
  { id: 'buyer-005', email: 'sayf@charyday.com', name: 'سيف المشتري', nameEn: 'Sayf Buyer', role: 'buyer', isActive: true, isVerified: true, locale: 'ar', createdAt: '2024-03-15T10:00:00Z' },
];

// ============================================
// MOCK STORES
// ============================================

export const MOCK_STORES: Store[] = [
  { id: 'str-1', name: 'متجر التقنية', nameEn: 'Tech Store', slug: 'tech-store', description: 'أحدث الأجهزة الإلكترونية', logo: productImages[0], isActive: true, rating: 4.8, totalSales: 4567, commission: 10, productCount: 156, staffCount: 5, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'str-2', name: 'عالم الأزياء', nameEn: 'Fashion World', slug: 'fashion-world', description: 'أحدث صيحات الموضة', logo: productImages[1], isActive: true, rating: 4.6, totalSales: 8934, commission: 12, productCount: 243, staffCount: 8, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'str-3', name: 'المنزل الذكي', nameEn: 'Smart Home', slug: 'smart-home', description: 'كل ما يحتاجه منزلك', logo: productImages[2], isActive: true, rating: 4.7, totalSales: 6721, commission: 8, productCount: 187, staffCount: 4, createdAt: '2024-02-01T10:00:00Z' },
];

// ============================================
// MOCK SELLERS
// ============================================

export const MOCK_SELLERS: SellerProfile[] = [
  { id: 'sp-1', storeName: 'بضاعة خالد', storeNameEn: 'Khaled Goods', bio: 'بضائع عالية الجودة بأفضل الأسعار', rating: 4.5, totalSales: 234, isVerified: true, wantsUpgrade: false, productCount: 45, createdAt: '2024-01-20T10:00:00Z' },
  { id: 'sp-2', storeName: 'مستودع سارة', storeNameEn: 'Sara Warehouse', bio: 'ملابس وإكسسوارات نسائية', rating: 4.3, totalSales: 567, isVerified: true, wantsUpgrade: true, upgradeRequestedAt: '2024-03-01T10:00:00Z', productCount: 78, createdAt: '2024-02-10T10:00:00Z' },
  { id: 'sp-3', storeName: 'تقنية ماجد', storeNameEn: 'Majed Tech', bio: 'إلكترونيات وأجهزة ذكية', rating: 4.6, totalSales: 123, isVerified: false, wantsUpgrade: false, productCount: 23, createdAt: '2024-03-01T10:00:00Z' },
];

// ============================================
// MOCK ORDERS
// ============================================

export const MOCK_ADDRESSES: Address[] = [
  { id: 'addr-1', label: 'المنزل', fullName: 'فاطمة المشترية', phone: '+966501234567', street: 'شارع العليا، حي الروضة', city: 'الرياض', state: 'الرياض', zipCode: '12345', country: 'SA', isDefault: true },
  { id: 'addr-2', label: 'العمل', fullName: 'فاطمة المشترية', phone: '+966501234567', street: 'شارع الأمير محمد بن عبدالعزيز', city: 'جدة', state: 'جدة', zipCode: '23456', country: 'SA', isDefault: false },
];

const createOrder = (id: string, orderNum: string, status: OrderStatus, total: number, buyer: User, date: string): Order => ({
  id,
  orderNumber: orderNum,
  status,
  paymentStatus: ['delivered', 'shipped'].includes(status) ? 'paid' : status === 'cancelled' ? 'refunded' : 'pending',
  paymentMethod: 'card',
  subtotal: total - 25,
  shippingCost: 25,
  tax: total * 0.15,
  discount: 0,
  total: total + total * 0.15,
  currency: 'SAR',
  buyer,
  address: MOCK_ADDRESSES[0],
  shippingMethod: 'standard',
  items: [
    { id: `${id}-1`, productId: 'p-1', productName: 'آيفون 15 برو ماكس', productImage: productImages[0], price: 5499, quantity: 1, total: 5499 },
  ],
  shipments: [],
  createdAt: date,
  updatedAt: date,
});

export const MOCK_ORDERS: Order[] = [
  createOrder('ord-1', 'NOON-2024-001', 'delivered', 5499, MOCK_USERS[7], '2024-03-01T10:00:00Z'),
  createOrder('ord-2', 'NOON-2024-002', 'shipped', 299, MOCK_USERS[8], '2024-03-05T10:00:00Z'),
  createOrder('ord-3', 'NOON-2024-003', 'processing', 899, MOCK_USERS[7], '2024-03-08T10:00:00Z'),
  createOrder('ord-4', 'NOON-2024-004', 'pending', 459, MOCK_USERS[8], '2024-03-10T10:00:00Z'),
  createOrder('ord-5', 'NOON-2024-005', 'confirmed', 8999, MOCK_USERS[7], '2024-03-12T10:00:00Z'),
  createOrder('ord-6', 'NOON-2024-006', 'delivered', 199, MOCK_USERS[8], '2024-02-15T10:00:00Z'),
  createOrder('ord-7', 'NOON-2024-007', 'cancelled', 349, MOCK_USERS[7], '2024-02-20T10:00:00Z'),
  createOrder('ord-8', 'NOON-2024-008', 'delivered', 4999, MOCK_USERS[9], '2024-01-25T10:00:00Z'),
  createOrder('ord-9', 'NOON-2024-009', 'shipped', 3299, MOCK_USERS[7], '2024-03-15T10:00:00Z'),
  createOrder('ord-10', 'NOON-2024-010', 'processing', 89, MOCK_USERS[8], '2024-03-16T10:00:00Z'),
];

// ============================================
// MOCK SHIPMENTS
// ============================================

const createShipment = (id: string, tracking: string, status: ShipmentStatus, order: Order, courier: User): Shipment => ({
  id,
  trackingNumber: tracking,
  status,
  deliveryAddress: 'شارع العليا، حي الروضة، الرياض',
  order,
  logistics: courier,
  estimatedDelivery: '2024-03-20T10:00:00Z',
  createdAt: order.createdAt,
  updatedAt: order.createdAt,
});

export const MOCK_SHIPMENTS: Shipment[] = [
  createShipment('ship-1', 'TN-100001', 'delivered', MOCK_ORDERS[0], MOCK_USERS[5]),
  createShipment('ship-2', 'TN-100002', 'in_transit', MOCK_ORDERS[1], MOCK_USERS[5]),
  createShipment('ship-3', 'TN-100003', 'out_for_delivery', MOCK_ORDERS[8], MOCK_USERS[6]),
  createShipment('ship-4', 'TN-100004', 'picked_up', MOCK_ORDERS[4], MOCK_USERS[6]),
  createShipment('ship-5', 'TN-100005', 'pending', MOCK_ORDERS[3], MOCK_USERS[5]),
];

// ============================================
// MOCK NOTIFICATIONS
// ============================================

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', title: 'طلب جديد', titleEn: 'New Order', body: 'لقد تلقيت طلباً جديداً #NOON-2024-010', bodyEn: 'You received a new order #NOON-2024-010', type: 'order', isRead: false, createdAt: '2024-03-16T10:00:00Z' },
  { id: 'n-2', title: 'تم شحن الطلب', titleEn: 'Order Shipped', body: 'تم شحن طلبك #NOON-2024-002', bodyEn: 'Your order #NOON-2024-002 has been shipped', type: 'shipment', isRead: false, createdAt: '2024-03-15T10:00:00Z' },
  { id: 'n-3', title: 'عرض خاص', titleEn: 'Special Offer', body: 'خصم 30% على جميع الإلكترونيات', bodyEn: '30% off on all electronics', type: 'promotion', isRead: true, createdAt: '2024-03-14T10:00:00Z' },
  { id: 'n-4', title: 'تم تسليم الطلب', titleEn: 'Order Delivered', body: 'تم تسليم طلبك بنجاح #NOON-2024-001', bodyEn: 'Your order was delivered successfully #NOON-2024-001', type: 'shipment', isRead: true, createdAt: '2024-03-13T10:00:00Z' },
  { id: 'n-5', title: 'تحديث النظام', titleEn: 'System Update', body: 'تم تحديث المنصة بنجاح', bodyEn: 'Platform updated successfully', type: 'system', isRead: true, createdAt: '2024-03-12T10:00:00Z' },
];

// ============================================
// MOCK WALLET
// ============================================

export const MOCK_WALLET: Wallet = {
  id: 'w-1',
  balance: 2450.75,
  totalEarned: 5800,
  totalSpent: 3349.25,
  currency: 'SAR',
  transactions: [
    { id: 'wt-1', type: 'credit', amount: 500, balance: 2450.75, description: 'إضافة رصيد', createdAt: '2024-03-15T10:00:00Z' },
    { id: 'wt-2', type: 'debit', amount: 89, balance: 1950.75, description: 'شراء تي شيرت', createdAt: '2024-03-14T10:00:00Z' },
    { id: 'wt-3', type: 'refund', amount: 299, balance: 2039.75, description: 'استرداد خلاط', createdAt: '2024-03-12T10:00:00Z' },
    { id: 'wt-4', type: 'credit', amount: 1000, balance: 1740.75, description: 'إضافة رصيد', createdAt: '2024-03-10T10:00:00Z' },
    { id: 'wt-5', type: 'debit', amount: 459, balance: 740.75, description: 'شراء حقيبة يد', createdAt: '2024-03-08T10:00:00Z' },
  ],
};

// ============================================
// MOCK ANALYTICS
// ============================================

export const MOCK_ANALYTICS: AnalyticsData = {
  totalRevenue: 284750,
  totalOrders: 1234,
  totalProducts: 567,
  totalUsers: 8901,
  revenueChange: 12.5,
  ordersChange: 8.3,
  productsChange: -2.1,
  usersChange: 15.7,
  revenueByMonth: [
    { month: 'يناير', revenue: 18500 },
    { month: 'فبراير', revenue: 22300 },
    { month: 'مارس', revenue: 28400 },
    { month: 'أبريل', revenue: 25600 },
    { month: 'مايو', revenue: 31200 },
    { month: 'يونيو', revenue: 29800 },
    { month: 'يوليو', revenue: 34500 },
    { month: 'أغسطس', revenue: 32100 },
    { month: 'سبتمبر', revenue: 27800 },
    { month: 'أكتوبر', revenue: 35200 },
    { month: 'نوفمبر', revenue: 38900 },
    { month: 'ديسمبر', revenue: 42500 },
  ],
  ordersByStatus: [
    { status: 'pending', count: 45 },
    { status: 'confirmed', count: 32 },
    { status: 'processing', count: 78 },
    { status: 'shipped', count: 156 },
    { status: 'delivered', count: 890 },
    { status: 'cancelled', count: 23 },
    { status: 'returned', count: 10 },
  ],
  topProducts: MOCK_PRODUCTS.slice(0, 5).map((p) => ({ product: p, soldCount: p.soldCount, revenue: p.price * p.soldCount })),
  recentOrders: MOCK_ORDERS.slice(0, 5),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return colors[status];
};

export const getShipmentStatusColor = (status: ShipmentStatus): string => {
  const colors: Record<ShipmentStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    picked_up: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    out_for_delivery: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return colors[status];
};

export const getOrderStatusText = (status: OrderStatus): string => {
  const texts: Record<OrderStatus, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    processing: 'قيد التنفيذ',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    returned: 'مرتجع',
  };
  return texts[status];
};

export const getShipmentStatusText = (status: ShipmentStatus): string => {
  const texts: Record<ShipmentStatus, string> = {
    pending: 'قيد الانتظار',
    picked_up: 'تم الاستلام',
    in_transit: 'في الطريق',
    out_for_delivery: 'خارج للتسليم',
    delivered: 'تم التسليم',
    failed: 'فشل التسليم',
    returned: 'مرتجع',
  };
  return texts[status];
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ar-SA')} ر.س`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
  return num.toString();
};

export const getStatusColor = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes('deliver') || s.includes('success') || s.includes('active') || s.includes('paid') || s.includes('online') || s.includes('approved')) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
  if (s.includes('cancel') || s.includes('fail') || s.includes('error') || s.includes('offline') || s.includes('rejected') || s.includes('suspended')) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  if (s.includes('pending') || s.includes('wait') || s.includes('incomplete') || s.includes('review')) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
  if (s.includes('ship') || s.includes('transit') || s.includes('process')) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
  return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
};

// ============================================
// PENDING MERCHANTS (Admin Review Queue)
// ============================================

export type PendingMerchantRole = 'store' | 'freelancer' | 'supplier' | 'logistics';

export interface PendingMerchant {
  id: string;
  name: string;
  nameEn: string;
  email: string;
  phone: string;
  role: PendingMerchantRole;
  storeName?: string;
  storeNameEn?: string;
  registeredAt: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  documents: PendingDocument[];
  verificationItems: VerificationItem[];
  priority: 'urgent' | 'standard';
  rejectionReason?: string;
}

export interface PendingDocument {
  id: string;
  name: string;
  nameEn: string;
  type: 'commercial_register' | 'national_id' | 'selfie' | 'bank_statement' | 'manager_id' | 'vehicle_registration' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  url?: string;
  rejectionReason?: string;
}

export interface VerificationItem {
  id: string;
  labelAr: string;
  labelEn: string;
  status: 'verified' | 'pending' | 'rejected' | 'required';
  rejectionReason?: string;
}

export const MOCK_PENDING_MERCHANTS: PendingMerchant[] = [
  {
    id: 'pm-001',
    name: 'عبدالرحمن التقنية',
    nameEn: 'Abdulrahman Tech',
    email: 'abdulrahman@tech.sa',
    phone: '+966551234567',
    role: 'store',
    storeName: 'متجر الإلكترونيات الحديثة',
    storeNameEn: 'Modern Electronics Store',
    registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    phoneVerified: true,
    emailVerified: false,
    priority: 'urgent',
    documents: [
      { id: 'doc-001', name: 'السجل التجاري', nameEn: 'Commercial Register', type: 'commercial_register', status: 'pending' },
      { id: 'doc-002', name: 'الهوية الوطنية', nameEn: 'National ID', type: 'manager_id', status: 'pending' },
      { id: 'doc-003', name: 'كشف حساب بنكي', nameEn: 'Bank Statement', type: 'bank_statement', status: 'pending' },
    ],
    verificationItems: [
      { id: 'vi-001', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
      { id: 'vi-002', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', status: 'required' },
      { id: 'vi-003', labelAr: 'السجل التجاري', labelEn: 'Commercial Register', status: 'pending' },
      { id: 'vi-004', labelAr: 'الحساب البنكي', labelEn: 'Bank Account', status: 'pending' },
      { id: 'vi-005', labelAr: 'هوية المدير', labelEn: 'Manager ID', status: 'pending' },
    ],
  },
  {
    id: 'pm-002',
    name: 'سارة التصميم',
    nameEn: 'Sara Design',
    email: 'sara@design.sa',
    phone: '+966559876543',
    role: 'freelancer',
    registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    phoneVerified: true,
    emailVerified: true,
    priority: 'standard',
    documents: [
      { id: 'doc-004', name: 'الهوية الوطنية', nameEn: 'National ID', type: 'national_id', status: 'pending' },
      { id: 'doc-005', name: 'صورة شخصية', nameEn: 'Selfie', type: 'selfie', status: 'pending' },
      { id: 'doc-006', name: 'كشف حساب بنكي', nameEn: 'Bank Statement', type: 'bank_statement', status: 'pending' },
    ],
    verificationItems: [
      { id: 'vi-006', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
      { id: 'vi-007', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', status: 'verified' },
      { id: 'vi-008', labelAr: 'الهوية الوطنية', labelEn: 'National ID', status: 'pending' },
      { id: 'vi-009', labelAr: 'صورة شخصية', labelEn: 'Selfie', status: 'pending' },
      { id: 'vi-010', labelAr: 'الحساب البنكي', labelEn: 'Bank Account', status: 'pending' },
    ],
  },
  {
    id: 'pm-003',
    name: 'فهد الموردين',
    nameEn: 'Fahad Suppliers',
    email: 'fahad@supply.sa',
    phone: '+966553456789',
    role: 'supplier',
    storeName: 'شركة فهد للتجارة',
    storeNameEn: 'Fahad Trading Co.',
    registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    phoneVerified: true,
    emailVerified: false,
    priority: 'urgent',
    documents: [
      { id: 'doc-007', name: 'السجل التجاري', nameEn: 'Commercial Register', type: 'commercial_register', status: 'pending' },
      { id: 'doc-008', name: 'كشف حساب بنكي', nameEn: 'Bank Statement', type: 'bank_statement', status: 'pending' },
    ],
    verificationItems: [
      { id: 'vi-011', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
      { id: 'vi-012', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', status: 'required' },
      { id: 'vi-013', labelAr: 'السجل التجاري', labelEn: 'Commercial Register', status: 'pending' },
      { id: 'vi-014', labelAr: 'الحساب البنكي', labelEn: 'Bank Account', status: 'pending' },
    ],
  },
  {
    id: 'pm-004',
    name: 'سلطان التوصيل',
    nameEn: 'Sultan Delivery',
    email: 'sultan@delivery.sa',
    phone: '+966557891234',
    role: 'logistics',
    registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    phoneVerified: true,
    emailVerified: true,
    priority: 'standard',
    documents: [
      { id: 'doc-009', name: 'الهوية الوطنية', nameEn: 'National ID', type: 'national_id', status: 'pending' },
      { id: 'doc-010', name: 'صورة شخصية', nameEn: 'Selfie', type: 'selfie', status: 'pending' },
      { id: 'doc-011', name: 'رخصة السيارة', nameEn: 'Vehicle Registration', type: 'vehicle_registration', status: 'pending' },
    ],
    verificationItems: [
      { id: 'vi-015', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
      { id: 'vi-016', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', status: 'verified' },
      { id: 'vi-017', labelAr: 'الهوية الوطنية', labelEn: 'National ID', status: 'pending' },
      { id: 'vi-018', labelAr: 'صورة شخصية', labelEn: 'Selfie', status: 'pending' },
      { id: 'vi-019', labelAr: 'رخصة السيارة', labelEn: 'Vehicle Registration', status: 'pending' },
    ],
  },
];

// ============================================
// AUDIT LOGS
// ============================================

export type AuditAction = 'approve' | 'reject' | 'request_edit' | 'note' | 'auto_assign';

export interface AuditLog {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantNameEn: string;
  adminName: string;
  action: AuditAction;
  details: string;
  detailsEn: string;
  timestamp: string;
}

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'al-001',
    merchantId: 'pm-old-001',
    merchantName: 'متجر الأناقة',
    merchantNameEn: 'Elegance Store',
    adminName: 'أحمد المدير',
    action: 'approve',
    details: 'تم تفعيل الحساب بنجاح - جميع المستندات صالحة',
    detailsEn: 'Account approved - all documents valid',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'al-002',
    merchantId: 'pm-old-002',
    merchantName: 'نورة البقالة',
    merchantNameEn: 'Noura Grocery',
    adminName: 'أحمد المدير',
    action: 'reject',
    details: 'رفض: السجل التجاري غير واضح - يرجى إعادة الرفع',
    detailsEn: 'Rejected: Commercial register unclear - please re-upload',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'al-003',
    merchantId: 'pm-old-003',
    merchantName: 'تقنية عمر',
    merchantNameEn: 'Omar Tech',
    adminName: 'أحمد المدير',
    action: 'request_edit',
    details: 'طلب تعديل: بيانات الحساب البنكي غير مطابقة',
    detailsEn: 'Edit requested: Bank account info mismatch',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'al-004',
    merchantId: 'pm-old-004',
    merchantName: 'ريم الموضة',
    merchantNameEn: 'Reem Fashion',
    adminName: 'أحمد المدير',
    action: 'note',
    details: 'ملاحظة: بحاجة لمراجعة خاصة من الإدارة العليا',
    detailsEn: 'Note: Requires special review from upper management',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'al-005',
    merchantId: 'pm-old-005',
    merchantName: 'سلطان اللوجستيات',
    merchantNameEn: 'Sultan Logistics',
    adminName: 'النظام',
    action: 'auto_assign',
    details: 'توزيع تلقائي: تم تعيين الطلب للمشرف المتاح',
    detailsEn: 'Auto-assigned: Request assigned to available supervisor',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'al-006',
    merchantId: 'pm-old-006',
    merchantName: 'خالد المستودعات',
    merchantNameEn: 'Khaled Warehouse',
    adminName: 'أحمد المدير',
    action: 'approve',
    details: 'تم تفعيل الحساب بعد تعديل المستندات',
    detailsEn: 'Account approved after document correction',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// ONBOARDING VERIFICATION DATA
// ============================================

export const ONBOARDING_PENDING_MERCHANTS = [
  {
    id: 'pm-1',
    userName: 'متجر الأناقة الرقمية',
    role: 'store' as const,
    submittedAt: '2024-03-15T10:00:00Z',
    documents: [
      { type: 'commercial_register', name: 'سجل_تجاري.pdf', url: '#' },
      { type: 'bank_letter', name: 'شهادة_بنكية.pdf', url: '#' },
      { type: 'manager_id', name: 'هوية_المدير.jpg', url: '#' },
    ],
    verificationStatus: 'pending' as const,
    phone: '+966501234567',
    email: 'digital@elegance.com',
    storeName: 'متجر الأناقة الرقمية',
  },
  {
    id: 'pm-2',
    userName: 'خالد التاجر المستقل',
    role: 'freelancer' as const,
    submittedAt: '2024-03-16T14:00:00Z',
    documents: [
      { type: 'national_id', name: 'بطاقة_الهوية.jpg', url: '#' },
      { type: 'selfie', name: 'سيلفي_حي.jpg', url: '#' },
    ],
    verificationStatus: 'pending' as const,
    phone: '+966509876543',
    email: 'khaled@freelancer.com',
    storeName: 'بضاعة خالد',
  },
  {
    id: 'pm-3',
    userName: 'شركة النقل السريع',
    role: 'logistics' as const,
    submittedAt: '2024-03-14T09:00:00Z',
    documents: [
      { type: 'transport_license', name: 'رخصة_النقل.pdf', url: '#' },
      { type: 'insurance', name: 'شهادة_التأمين.pdf', url: '#' },
    ],
    verificationStatus: 'pending' as const,
    phone: '+966505551234',
    email: 'info@express.com',
    storeName: 'شركة النقل السريع',
  },
];

export const ONBOARDING_AUDIT_LOGS = [
  { id: 'al-1', userId: 'pm-1', adminId: 'admin-001', action: 'submitted', createdAt: '2024-03-15T10:00:00Z', details: { method: 'phone' } },
  { id: 'al-2', userId: 'pm-1', adminId: 'admin-001', action: 'reviewed', createdAt: '2024-03-15T14:30:00Z', details: { note: 'قيد المراجعة' } },
];
