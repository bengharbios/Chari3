// ============================================
// PERMISSIONS DEFINITION — CharyDay Platform
// ============================================
// Comprehensive RBAC permission keys organized by category.
// Used by the Role & Permissions management system.

export interface Permission {
  key: string;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface PermissionCategory {
  key: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  permissions: Permission[];
}

// ============================================
// PERMISSION CATEGORIES
// ============================================

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    key: 'dashboard',
    labelAr: 'لوحة التحكم',
    labelEn: 'Dashboard',
    icon: 'LayoutDashboard',
    permissions: [
      {
        key: 'dashboard.view',
        labelAr: 'عرض لوحة التحكم',
        labelEn: 'View Dashboard',
        descriptionAr: 'عرض لوحة التحكم الخاصة بالمستخدم',
        descriptionEn: 'View the user\'s own dashboard',
      },
    ],
  },
  {
    key: 'products',
    labelAr: 'المنتجات',
    labelEn: 'Products',
    icon: 'Package',
    permissions: [
      {
        key: 'products.view',
        labelAr: 'عرض المنتجات',
        labelEn: 'View Products',
        descriptionAr: 'عرض قائمة المنتجات وتفاصيلها',
        descriptionEn: 'View product list and details',
      },
      {
        key: 'products.create',
        labelAr: 'إنشاء منتج جديد',
        labelEn: 'Create Products',
        descriptionAr: 'إنشاء وإضافة منتجات جديدة',
        descriptionEn: 'Create and add new products',
      },
      {
        key: 'products.edit',
        labelAr: 'تعديل منتجاتي',
        labelEn: 'Edit Own Products',
        descriptionAr: 'تعديل المنتجات التابعة للمستخدم',
        descriptionEn: 'Edit products belonging to the user',
      },
      {
        key: 'products.edit_any',
        labelAr: 'تعديل أي منتج',
        labelEn: 'Edit Any Product',
        descriptionAr: 'تعديل أي منتج في المنصة (إدارة)',
        descriptionEn: 'Edit any product on the platform (admin)',
      },
      {
        key: 'products.delete',
        labelAr: 'حذف منتجاتي',
        labelEn: 'Delete Own Products',
        descriptionAr: 'حذف المنتجات التابعة للمستخدم',
        descriptionEn: 'Delete products belonging to the user',
      },
      {
        key: 'products.delete_any',
        labelAr: 'حذف أي منتج',
        labelEn: 'Delete Any Product',
        descriptionAr: 'حذف أي منتج في المنصة (إدارة)',
        descriptionEn: 'Delete any product on the platform (admin)',
      },
      {
        key: 'products.publish',
        labelAr: 'نشر/إلغاء نشر المنتجات',
        labelEn: 'Publish/Unpublish Products',
        descriptionAr: 'نشر أو إلغاء نشر المنتجات',
        descriptionEn: 'Publish or unpublish products',
      },
      {
        key: 'products.featured',
        labelAr: 'تحديد المنتجات المميزة',
        labelEn: 'Set Featured Products',
        descriptionAr: 'تعيين المنتجات كمنتجات مميزة',
        descriptionEn: 'Set products as featured',
      },
    ],
  },
  {
    key: 'orders',
    labelAr: 'الطلبات',
    labelEn: 'Orders',
    icon: 'ShoppingCart',
    permissions: [
      {
        key: 'orders.view',
        labelAr: 'عرض طلباتي',
        labelEn: 'View Own Orders',
        descriptionAr: 'عرض الطلبات التابعة للمستخدم',
        descriptionEn: 'View orders belonging to the user',
      },
      {
        key: 'orders.view_all',
        labelAr: 'عرض جميع الطلبات',
        labelEn: 'View All Orders',
        descriptionAr: 'عرض جميع طلبات المنصة (إدارة/مدير متجر)',
        descriptionEn: 'View all platform orders (admin/store_manager)',
      },
      {
        key: 'orders.process',
        labelAr: 'معالجة الطلبات',
        labelEn: 'Process Orders',
        descriptionAr: 'تغيير حالة الطلبات ومعالجتها',
        descriptionEn: 'Change order statuses and process them',
      },
      {
        key: 'orders.refund',
        labelAr: 'إصدار استرداد نقدي',
        labelEn: 'Issue Refunds',
        descriptionAr: 'إصدار استرداد نقدي للطلبات',
        descriptionEn: 'Issue refunds for orders',
      },
      {
        key: 'orders.export',
        labelAr: 'تصدير بيانات الطلبات',
        labelEn: 'Export Orders',
        descriptionAr: 'تصدير بيانات الطلبات إلى ملف',
        descriptionEn: 'Export orders data to file',
      },
    ],
  },
  {
    key: 'users',
    labelAr: 'المستخدمون',
    labelEn: 'Users',
    icon: 'Users',
    permissions: [
      {
        key: 'users.view',
        labelAr: 'عرض قائمة المستخدمين',
        labelEn: 'View Users',
        descriptionAr: 'عرض قائمة المستخدمين وتفاصيلهم',
        descriptionEn: 'View user list and details',
      },
      {
        key: 'users.create',
        labelAr: 'إنشاء مستخدم',
        labelEn: 'Create Users',
        descriptionAr: 'إنشاء حسابات مستخدمين جديدة',
        descriptionEn: 'Create new user accounts',
      },
      {
        key: 'users.edit',
        labelAr: 'تعديل ملفات المستخدمين',
        labelEn: 'Edit User Profiles',
        descriptionAr: 'تعديل ملفات المستخدمين الشخصية',
        descriptionEn: 'Edit user profile information',
      },
      {
        key: 'users.edit_role',
        labelAr: 'تغيير أدوار المستخدمين',
        labelEn: 'Change User Roles',
        descriptionAr: 'تغيير أدوار المستخدمين في المنصة',
        descriptionEn: 'Change user roles on the platform',
      },
      {
        key: 'users.suspend',
        labelAr: 'تعليق المستخدمين',
        labelEn: 'Suspend Users',
        descriptionAr: 'تعليق حسابات المستخدمين',
        descriptionEn: 'Suspend user accounts',
      },
      {
        key: 'users.delete',
        labelAr: 'حذف المستخدمين',
        labelEn: 'Delete Users',
        descriptionAr: 'حذف حسابات المستخدمين من المنصة',
        descriptionEn: 'Delete user accounts from the platform',
      },
    ],
  },
  {
    key: 'roles',
    labelAr: 'الأدوار والصلاحيات',
    labelEn: 'Roles & Permissions',
    icon: 'Shield',
    permissions: [
      {
        key: 'roles.view',
        labelAr: 'عرض الأدوار',
        labelEn: 'View Roles',
        descriptionAr: 'عرض قائمة الأدوار والصلاحيات',
        descriptionEn: 'View roles and permissions list',
      },
      {
        key: 'roles.create',
        labelAr: 'إنشاء دور جديد',
        labelEn: 'Create Roles',
        descriptionAr: 'إنشاء أدوار مخصصة جديدة',
        descriptionEn: 'Create new custom roles',
      },
      {
        key: 'roles.edit',
        labelAr: 'تعديل الأدوار',
        labelEn: 'Edit Roles',
        descriptionAr: 'تعديل بيانات وصلاحيات الأدوار',
        descriptionEn: 'Edit role data and permissions',
      },
      {
        key: 'roles.delete',
        labelAr: 'حذف الأدوار',
        labelEn: 'Delete Roles',
        descriptionAr: 'حذف الأدوار المخصصة',
        descriptionEn: 'Delete custom roles',
      },
      {
        key: 'roles.manage_permissions',
        labelAr: 'تعديل صلاحيات الأدوار',
        labelEn: 'Manage Role Permissions',
        descriptionAr: 'تعديل صلاحيات الأدوار المختلفة',
        descriptionEn: 'Modify permissions of different roles',
      },
    ],
  },
  {
    key: 'stores',
    labelAr: 'المتاجر',
    labelEn: 'Stores',
    icon: 'Store',
    permissions: [
      {
        key: 'stores.view',
        labelAr: 'عرض المتاجر',
        labelEn: 'View Stores',
        descriptionAr: 'عرض قائمة المتاجر وتفاصيلها',
        descriptionEn: 'View store list and details',
      },
      {
        key: 'stores.create',
        labelAr: 'إنشاء متجر جديد',
        labelEn: 'Create Stores',
        descriptionAr: 'إنشاء متجر جديد في المنصة',
        descriptionEn: 'Create a new store on the platform',
      },
      {
        key: 'stores.edit_own',
        labelAr: 'تعديل متجري',
        labelEn: 'Edit Own Store',
        descriptionAr: 'تعديل بيانات المتجر الخاص بالمستخدم',
        descriptionEn: 'Edit user\'s own store data',
      },
      {
        key: 'stores.edit_any',
        labelAr: 'تعديل أي متجر',
        labelEn: 'Edit Any Store',
        descriptionAr: 'تعديل أي متجر في المنصة (إدارة)',
        descriptionEn: 'Edit any store on the platform (admin)',
      },
      {
        key: 'stores.approve',
        labelAr: 'الموافقة/الرفض على المتاجر',
        labelEn: 'Approve/Reject Stores',
        descriptionAr: 'الموافقة أو رفض طلبات المتاجر الجديدة',
        descriptionEn: 'Approve or reject new store applications',
      },
      {
        key: 'stores.deactivate',
        labelAr: 'تعطيل المتاجر',
        labelEn: 'Deactivate Stores',
        descriptionAr: 'تعطيل متاجر في المنصة',
        descriptionEn: 'Deactivate stores on the platform',
      },
    ],
  },
  {
    key: 'sellers',
    labelAr: 'التجار المستقلين',
    labelEn: 'Sellers',
    icon: 'UserCircle',
    permissions: [
      {
        key: 'sellers.view',
        labelAr: 'عرض قائمة التجار',
        labelEn: 'View Sellers',
        descriptionAr: 'عرض قائمة التجار المستقلين',
        descriptionEn: 'View independent seller list',
      },
      {
        key: 'sellers.approve',
        labelAr: 'الموافقة/الرفض على التجار',
        labelEn: 'Approve/Reject Sellers',
        descriptionAr: 'الموافقة أو رفض طلبات التاجر المستقل',
        descriptionEn: 'Approve or reject seller applications',
      },
      {
        key: 'sellers.verify',
        labelAr: 'إدارة توثيق التجار',
        labelEn: 'Manage Seller Verification',
        descriptionAr: 'مراجعة وإدارة عملية توثيق التجار',
        descriptionEn: 'Review and manage seller verification process',
      },
    ],
  },
  {
    key: 'shipping',
    labelAr: 'الشحن',
    labelEn: 'Shipping',
    icon: 'Truck',
    permissions: [
      {
        key: 'shipping.view',
        labelAr: 'عرض الشحنات',
        labelEn: 'View Shipments',
        descriptionAr: 'عرض قائمة الشحنات وتفاصيلها',
        descriptionEn: 'View shipment list and details',
      },
      {
        key: 'shipping.manage',
        labelAr: 'إدارة الشحنات',
        labelEn: 'Manage Shipments',
        descriptionAr: 'إدارة وتحديث حالة الشحنات',
        descriptionEn: 'Manage and update shipment statuses',
      },
      {
        key: 'shipping.assign',
        labelAr: 'تعيين مندوب شحن',
        labelEn: 'Assign Couriers',
        descriptionAr: 'تعيين مندوبين لتسليم الشحنات',
        descriptionEn: 'Assign couriers for shipment delivery',
      },
      {
        key: 'shipping.track',
        labelAr: 'تتبع الشحنات',
        labelEn: 'Track Shipments',
        descriptionAr: 'تتبع حالة الشحنات في الوقت الحقيقي',
        descriptionEn: 'Track shipment status in real-time',
      },
    ],
  },
  {
    key: 'finance',
    labelAr: 'المالية',
    labelEn: 'Finance',
    icon: 'Wallet',
    permissions: [
      {
        key: 'finance.wallet',
        labelAr: 'عرض المحفظة',
        labelEn: 'View Wallet',
        descriptionAr: 'عرض رصيد وحركة المحفظة',
        descriptionEn: 'View wallet balance and transactions',
      },
      {
        key: 'finance.withdraw',
        labelAr: 'طلب سحب',
        labelEn: 'Request Withdrawal',
        descriptionAr: 'تقديم طلب سحب من المحفظة',
        descriptionEn: 'Submit wallet withdrawal request',
      },
      {
        key: 'finance.payouts',
        labelAr: 'إدارة المدفوعات',
        labelEn: 'Manage Payouts',
        descriptionAr: 'إدارة المدفوعات والتحويلات (إدارة)',
        descriptionEn: 'Manage payouts and transfers (admin)',
      },
      {
        key: 'finance.transactions',
        labelAr: 'عرض جميع المعاملات',
        labelEn: 'View All Transactions',
        descriptionAr: 'عرض جميع المعاملات المالية في المنصة',
        descriptionEn: 'View all financial transactions on the platform',
      },
      {
        key: 'finance.coupons',
        labelAr: 'إدارة كوبونات الخصم',
        labelEn: 'Manage Coupons',
        descriptionAr: 'إنشاء وتعديل وحذف كوبونات الخصم',
        descriptionEn: 'Create, edit, and delete discount coupons',
      },
    ],
  },
  {
    key: 'verification',
    labelAr: 'التوثيق',
    labelEn: 'Verification',
    icon: 'BadgeCheck',
    permissions: [
      {
        key: 'verification.view',
        labelAr: 'عرض طلبات التوثيق',
        labelEn: 'View Verification Requests',
        descriptionAr: 'عرض طلبات التوثيق المقدمة',
        descriptionEn: 'View submitted verification requests',
      },
      {
        key: 'verification.review',
        labelAr: 'مراجعة طلبات التوثيق',
        labelEn: 'Review Verifications',
        descriptionAr: 'مراجعة والموافقة أو رفض طلبات التوثيق',
        descriptionEn: 'Review, approve, or reject verification requests',
      },
      {
        key: 'verification.request_edit',
        labelAr: 'طلب تعديل على التوثيق',
        labelEn: 'Request Verification Edits',
        descriptionAr: 'طلب تعديلات على طلبات التوثيق',
        descriptionEn: 'Request edits on verification submissions',
      },
    ],
  },
  {
    key: 'analytics',
    labelAr: 'التحليلات',
    labelEn: 'Analytics',
    icon: 'BarChart3',
    permissions: [
      {
        key: 'analytics.view',
        labelAr: 'عرض التحليلات',
        labelEn: 'View Analytics',
        descriptionAr: 'عرض الإحصائيات والتحليلات',
        descriptionEn: 'View statistics and analytics',
      },
      {
        key: 'analytics.export',
        labelAr: 'تصدير بيانات التحليلات',
        labelEn: 'Export Analytics',
        descriptionAr: 'تصدير بيانات التحليلات إلى ملف',
        descriptionEn: 'Export analytics data to file',
      },
    ],
  },
  {
    key: 'settings',
    labelAr: 'الإعدادات',
    labelEn: 'Settings',
    icon: 'Settings',
    permissions: [
      {
        key: 'settings.view',
        labelAr: 'عرض الإعدادات',
        labelEn: 'View Settings',
        descriptionAr: 'عرض إعدادات المنصة',
        descriptionEn: 'View platform settings',
      },
      {
        key: 'settings.edit',
        labelAr: 'تعديل الإعدادات',
        labelEn: 'Edit Settings',
        descriptionAr: 'تعديل إعدادات المنصة',
        descriptionEn: 'Edit platform settings',
      },
      {
        key: 'settings.platform',
        labelAr: 'إعدادات النظام',
        labelEn: 'Platform Settings',
        descriptionAr: 'إعدادات النظام الأساسية (إدارة)',
        descriptionEn: 'Core system-level settings (admin)',
      },
    ],
  },
  {
    key: 'reviews',
    labelAr: 'التقييمات',
    labelEn: 'Reviews',
    icon: 'Star',
    permissions: [
      {
        key: 'reviews.view',
        labelAr: 'عرض التقييمات',
        labelEn: 'View Reviews',
        descriptionAr: 'عرض التقييمات والمراجعات',
        descriptionEn: 'View ratings and reviews',
      },
      {
        key: 'reviews.moderate',
        labelAr: 'إدارة التقييمات',
        labelEn: 'Moderate Reviews',
        descriptionAr: 'الموافقة أو إخفاء التقييمات',
        descriptionEn: 'Approve or hide reviews',
      },
      {
        key: 'reviews.respond',
        labelAr: 'الرد على التقييمات',
        labelEn: 'Respond to Reviews',
        descriptionAr: 'الرد على تقييمات المستخدمين',
        descriptionEn: 'Reply to user reviews',
      },
    ],
  },
  {
    key: 'categories_brands',
    labelAr: 'التصنيفات والعلامات التجارية',
    labelEn: 'Categories & Brands',
    icon: 'Tags',
    permissions: [
      {
        key: 'categories.manage',
        labelAr: 'إدارة التصنيفات',
        labelEn: 'Manage Categories',
        descriptionAr: 'إنشاء وتعديل وحذف التصنيفات',
        descriptionEn: 'Create, edit, and delete categories',
      },
      {
        key: 'brands.manage',
        labelAr: 'إدارة العلامات التجارية',
        labelEn: 'Manage Brands',
        descriptionAr: 'إنشاء وتعديل وحذف العلامات التجارية',
        descriptionEn: 'Create, edit, and delete brands',
      },
    ],
  },
  {
    key: 'notifications',
    labelAr: 'الإشعارات',
    labelEn: 'Notifications',
    icon: 'Bell',
    permissions: [
      {
        key: 'notifications.view',
        labelAr: 'عرض الإشعارات',
        labelEn: 'View Notifications',
        descriptionAr: 'عرض الإشعارات الواردة',
        descriptionEn: 'View incoming notifications',
      },
      {
        key: 'notifications.send',
        labelAr: 'إرسال إشعارات',
        labelEn: 'Send Notifications',
        descriptionAr: 'إرسال إشعارات إلى المستخدمين',
        descriptionEn: 'Send notifications to users',
      },
    ],
  },
];

// ============================================
// FLAT PERMISSIONS LIST + VALID KEYS SET
// ============================================

export const ALL_PERMISSIONS: Permission[] = PERMISSION_CATEGORIES.flatMap(
  (category) => category.permissions
);

/** Set of all valid permission keys for fast lookup */
export const VALID_PERMISSION_KEYS: Set<string> = new Set(
  ALL_PERMISSIONS.map((p) => p.key)
);

/** Total number of permissions */
export const TOTAL_PERMISSIONS = ALL_PERMISSIONS.length;

// ============================================
// DEFAULT ROLE PERMISSIONS
// ============================================

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ALL_PERMISSIONS.map((p) => p.key),

  store_manager: [
    // Dashboard
    'dashboard.view',
    // Products
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'products.publish',
    // Orders (store scope)
    'orders.view',
    'orders.view_all',
    'orders.process',
    'orders.export',
    // Stores (own)
    'stores.view',
    'stores.edit_own',
    // Staff
    'users.view',
    'users.edit',
    // Analytics
    'analytics.view',
    'analytics.export',
    // Reviews
    'reviews.view',
    'reviews.respond',
    // Notifications
    'notifications.view',
    // Wallet
    'finance.wallet',
    'finance.withdraw',
  ],

  seller: [
    // Dashboard
    'dashboard.view',
    // Products (own)
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    // Orders (own)
    'orders.view',
    // Wallet
    'finance.wallet',
    'finance.withdraw',
    // Reviews
    'reviews.view',
    'reviews.respond',
    // Notifications
    'notifications.view',
  ],

  supplier: [
    // Dashboard
    'dashboard.view',
    // Products (own)
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    // Orders (own)
    'orders.view',
    // Wallet
    'finance.wallet',
    'finance.withdraw',
    // Notifications
    'notifications.view',
  ],

  logistics: [
    // Dashboard
    'dashboard.view',
    // Shipping
    'shipping.view',
    'shipping.manage',
    'shipping.track',
    // Wallet
    'finance.wallet',
    'finance.withdraw',
    // Notifications
    'notifications.view',
  ],

  buyer: [
    // Dashboard
    'dashboard.view',
    // Orders (own)
    'orders.view',
    // Wallet
    'finance.wallet',
    'finance.withdraw',
    // Reviews
    'reviews.view',
    // Notifications
    'notifications.view',
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the display label for a permission key in the specified locale.
 * Falls back to the key itself if not found.
 */
export function getPermissionLabel(key: string, locale: 'ar' | 'en'): string {
  const permission = ALL_PERMISSIONS.find((p) => p.key === key);
  if (permission) {
    return locale === 'ar' ? permission.labelAr : permission.labelEn;
  }
  return key;
}

/**
 * Get the full Permission object for a key, or null if not found.
 */
export function getPermission(key: string): Permission | null {
  return ALL_PERMISSIONS.find((p) => p.key === key) ?? null;
}

/**
 * Get all permissions grouped by category as a flat map (key → Permission).
 */
export function getPermissionsMap(): Map<string, Permission> {
  const map = new Map<string, Permission>();
  for (const p of ALL_PERMISSIONS) {
    map.set(p.key, p);
  }
  return map;
}

/**
 * Check if a given permission key is valid.
 */
export function isValidPermission(key: string): boolean {
  return VALID_PERMISSION_KEYS.has(key);
}

/**
 * Validate an array of permission keys, returning valid ones only.
 */
export function filterValidPermissions(keys: string[]): string[] {
  return keys.filter(isValidPermission);
}
