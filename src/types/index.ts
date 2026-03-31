// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'admin' | 'store_manager' | 'seller' | 'supplier' | 'logistics' | 'buyer';
export type Locale = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  nameEn?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  locale: Locale;
  accountStatus?: AccountStatus;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================
// DASHBOARD & NAVIGATION TYPES
// ============================================

export type PageType =
  | 'login'
  | 'register'
  | 'admin'
  | 'store'
  | 'seller'
  | 'logistics'
  | 'buyer'
  | 'store-settings'
  | 'store-products'
  | 'store-orders'
  | 'store-staff'
  | 'store-analytics'
  | 'seller-products'
  | 'seller-orders'
  | 'seller-upgrade'
  | 'supplier'
  | 'supplier-products'
  | 'supplier-orders'
  | 'supplier-inventory'
  | 'logistics-active'
  | 'logistics-deliveries'
  | 'logistics-history'
  | 'logistics-earnings'
  | 'buyer-orders'
  | 'buyer-wishlist'
  | 'buyer-addresses'
  | 'buyer-wallet'
  | 'buyer-reviews'
  | 'verification'
  | 'admin-users'
  | 'admin-roles'
  | 'admin-orders'
  | 'admin-products'
  | 'admin-stores'
  | 'admin-sellers'
  | 'admin-shipping'
  | 'admin-analytics'
  | 'admin-settings';

export interface NavItem {
  id: PageType;
  labelAr: string;
  labelEn: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

// ============================================
// PRODUCT TYPES
// ============================================

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  images: string[];
  videoUrl?: string;
  specifications: Record<string, string>;
  status: ProductStatus;
  stock: number;
  lowStock: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  rating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  isFeatured: boolean;
  category: Category;
  store?: Store;
  seller?: SellerProfile;
  brand?: Brand;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  icon?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  nameEn?: string;
  logo?: string;
  isActive: boolean;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'card' | 'wallet' | 'bank_transfer';
export type ShippingMethod = 'standard' | 'express' | 'pickup';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  note?: string;
  buyer: User;
  address: Address;
  shippingMethod: ShippingMethod;
  items: OrderItem[];
  shipments: Shipment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  total: number;
}

// ============================================
// SHIPPING TYPES
// ============================================

export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  pickupAddress?: string;
  deliveryAddress: string;
  notes?: string;
  order: Order;
  logistics: User;
  estimatedDelivery?: string;
  actualDelivery?: string;
  pickedUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STORE & SELLER TYPES
// ============================================

export interface Store {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  isActive: boolean;
  rating: number;
  totalSales: number;
  commission: number;
  productCount?: number;
  staffCount?: number;
  createdAt: string;
}

export interface SellerProfile {
  id: string;
  storeName?: string;
  storeNameEn?: string;
  bio?: string;
  rating: number;
  totalSales: number;
  isVerified: boolean;
  wantsUpgrade: boolean;
  upgradeRequestedAt?: string;
  productCount?: number;
  createdAt: string;
}

// ============================================
// ADDRESS & WALLET TYPES
// ============================================

export interface Address {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

export interface Wallet {
  id: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'refund' | 'withdrawal';
  amount: number;
  balance: number;
  description?: string;
  referenceId?: string;
  createdAt: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'order' | 'shipment' | 'promotion' | 'system';

export interface Notification {
  id: string;
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  usersChange: number;
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { product: Product; soldCount: number; revenue: number }[];
  recentOrders: Order[];
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isApproved: boolean;
  user: User;
  product: Product;
  createdAt: string;
}

// ============================================
// COUPON TYPES
// ============================================

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

// ============================================
// TABLE TYPES
// ============================================

export interface TableColumn<T> {
  key: keyof T | string;
  labelAr: string;
  labelEn: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// ============================================
// ONBOARDING & VERIFICATION TYPES
// ============================================

export type AccountStatus = 'incomplete' | 'pending' | 'active' | 'rejected' | 'suspended';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type OnboardingStep = 'phone' | 'otp' | 'role' | 'basic-info' | 'legal' | 'financial' | 'identity' | 'liveness' | 'review' | 'done';
export type VerificationMethod = 'phone' | 'email';

export interface OnboardingState {
  step: OnboardingStep;
  method: VerificationMethod;
  phone: string;
  email: string;
  otpCode: string;
  otpVerified: boolean;
  otpTimer: number;
  selectedRole: UserRole | null;
  fullName: string;
  storeName: string;
  accountStatus: AccountStatus;

  // Store verification
  storeVerification: StoreVerificationData;

  // Freelancer verification
  freelancerVerification: FreelancerVerificationData;

  // Supplier verification (reuses SellerVerificationData structure)
  supplierVerification: FreelancerVerificationData;

  // Admin review state
  reviewData: AdminReviewData | null;
  rejectionReasons: string[];
  requiredEdits: string[];
}

export interface StoreVerificationData {
  commercialRegisterNumber: string;
  commercialRegisterFile: string | null;
  iban: string;
  beneficiaryName: string;
  bankLetterFile: string | null;
  managerIdFront: string | null;
  managerIdBack: string | null;
}

export interface FreelancerVerificationData {
  freelanceDocFile: string | null;
  nationalIdFront: string | null;
  nationalIdBack: string | null;
  selfieUrls: string[];
  livenessScore: number | null;
  iban: string;
}

export interface SupplierVerificationData {
  commercialLicense: string | null;
  importLicense: string | null;
  iban: string;
  productSamples: string[];
}

export interface AdminReviewData {
  userId: string;
  userName: string;
  role: UserRole;
  submittedAt: string;
  documents: { type: string; name: string; url: string }[];
  verificationStatus: VerificationStatus;
}

export interface VerificationItem {
  key: string;
  labelAr: string;
  labelEn: string;
  status: 'verified' | 'pending' | 'rejected' | 'required';
  rejectionReason?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  adminId?: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}
